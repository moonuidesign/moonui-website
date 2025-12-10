'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/libs/auth'; // Sesuaikan path
import { db } from '@/libs/drizzle'; // Sesuaikan path
import { s3Client } from '@/libs/getR2 copy'; // Sesuaikan path

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { desc } from 'drizzle-orm';
import OpenAI from 'openai';
import {
  ContentComponentFormValues,
  ContentComponentSchema,
} from './component-validator'; // Sesuaikan path validator
import { contentComponents } from '@/db/migration/schema';

// ============================================================================
// 1. TYPES & INTERFACES (STRICT TYPING)
// ============================================================================

type FrameworkType = 'react' | 'vue' | 'angular' | 'html';

// Tipe standar untuk response server action
type ActionResponse =
  | { success: true; message: string }
  | {
      success: false;
      error: string;
      details?: Record<string, string[] | undefined>;
    };

// Interface untuk JSONB column
interface CodeSnippets {
  react: string;
  vue: string;
  angular: string;
  html: string;
}

// ============================================================================
// 2. CONFIGURATION & CONSTANTS
// ============================================================================

const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((key): key is string => typeof key === 'string' && key.length > 0);

const AI_MODEL = 'google/gemini-2.0-flash-exp';
const AI_BASE_URL = 'https://openrouter.ai/api/v1';

const SYSTEM_INSTRUCTION = `
### ROLE & OBJECTIVE
You are an expert Senior Frontend Architect. Your task is to refactor "Raw/Spaghetti HTML" (often from Figma exports) into clean, production-grade, responsive component code for a specific framework.

### CRITICAL OUTPUT RULES
1. **CODE ONLY**: Return strictly the code. Do NOT write conversational fillers.
2. **NO MARKDOWN**: Do NOT wrap the output in markdown code blocks (\`\`\`). Output raw text only.
3. **NO HALLUCINATION**: Do not invent imports that don't exist.

### CONTINUATION PROTOCOL
If you hit the token limit and stop:
1. Stop exactly where the limit hits.
2. When the user says "CONTINUE", resume generation **EXACTLY** from the character where you stopped.
3. **DO NOT REPEAT** the last segment.
4. **DO NOT RESTART** the code block.

### FRAMEWORK STANDARDS
- **React**: Functional components, Tailwind CSS, 'lucide-react' icons. Remove 'absolute' positioning.
- **Vue**: Vue 3 <script setup>, Tailwind CSS.
- **Angular**: Standalone Components, Tailwind CSS.
- **HTML**: Semantic HTML5 tags, Tailwind CSS.
`;

const CONTINUATION_PROMPT = `
You stopped due to the output token limit. 
Please continue generation **IMMEDIATELY** from the exact character where you stopped. 
Do not repeat the last segment. 
Do not add markdown backticks. 
Just flow the code.
`;

function cleanMarkdown(text: string): string {
  return text
    .replace(
      /^```(tsx|jsx|vue|html|ts|javascript|typescript|css|json)?\n?/gi,
      '',
    )
    .replace(/\n?```$/g, '')
    .trim();
}

async function callAIWithRotation(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  let lastError: Error | null = null;

  for (const apiKey of GEMINI_API_KEYS) {
    try {
      const openai = new OpenAI({
        baseURL: AI_BASE_URL,
        apiKey: apiKey,
      });

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.2,
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(
          `[AI Warning] Key ...${apiKey.slice(-4)} failed. Msg: ${
            error.message
          }. Switching...`,
        );
        lastError = error;
      }
      continue;
    }
  }

  throw new Error(
    `All API Keys failed. Last error: ${lastError?.message || 'Unknown error'}`,
  );
}

async function generateCodeWithAI(
  framework: FrameworkType,
  rawHtml: string,
): Promise<string> {
  const prompts: Record<FrameworkType, string> = {
    react: `Convert this HTML to **React** (Tailwind + Lucide). Export default function. Remove absolute positioning.`,
    vue: `Convert this HTML to **Vue 3** (<script setup> + Tailwind). Remove absolute positioning.`,
    angular: `Convert this HTML to **Angular Standalone Component** (Tailwind). Remove absolute positioning.`,
    html: `Refactor to clean Semantic **HTML5** + Tailwind. Remove absolute positioning.`,
  };

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
    {
      role: 'user',
      content: `${prompts[framework]}\n\n--- INPUT HTML ---\n${rawHtml}`,
    },
  ];

  let fullCodeBuffer = '';
  let loopCount = 0;
  const MAX_LOOPS = 5;

  console.log(`[AI Start] Generating ${framework}...`);

  while (loopCount < MAX_LOOPS) {
    try {
      const response = await callAIWithRotation(messages);
      const choice = response.choices[0];
      const contentChunk = choice.message?.content || '';
      const finishReason = choice.finish_reason;

      fullCodeBuffer += contentChunk;

      if (finishReason === 'length') {
        console.log(
          `[AI Info] ${framework} truncated (Loop ${
            loopCount + 1
          }). Continuing...`,
        );
        messages.push({ role: 'assistant', content: contentChunk });
        messages.push({ role: 'user', content: CONTINUATION_PROMPT });
        loopCount++;
      } else {
        console.log(`[AI Done] ${framework} complete.`);
        break;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AI Fatal] ${framework} failed:`, errorMessage);
      return `${cleanMarkdown(
        fullCodeBuffer,
      )}\n\n// Error: Generation failed midway.`;
    }
  }

  return cleanMarkdown(fullCodeBuffer);
}
export async function createContentComponent(
  values: ContentComponentFormValues,
  imageFile?: File | null,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized: Harap login terlebih dahulu.',
    };
  }
  const userId = session.user.id;

  // 1. Validation
  const validated = ContentComponentSchema.safeParse(values);
  if (!validated.success) {
    const errorDetails = validated.error.flatten().fieldErrors;
    console.error('Validation Failed:', errorDetails);
    return {
      success: false,
      error: 'Validasi data gagal.',
      details: errorDetails,
    };
  }

  const {
    title,
    type,
    rawHtmlInput,
    categoryComponentsId,
    subCategoryComponentsId, // Ambil field ini
    tier,
    platform,
    statusContent,
    copyComponentTextHTML,
    copyComponentTextPlain,
  } = validated.data;
  const finalCategoryId =
    subCategoryComponentsId && subCategoryComponentsId.trim() !== ''
      ? subCategoryComponentsId
      : categoryComponentsId;
  let codeSnippets: CodeSnippets = {
    react: '',
    vue: '',
    angular: '',
    html: '',
  };

  if (rawHtmlInput && rawHtmlInput.trim().length > 0) {
    try {
      const [react, vue, angular, html] = await Promise.all([
        generateCodeWithAI('react', rawHtmlInput),
        generateCodeWithAI('vue', rawHtmlInput),
        generateCodeWithAI('angular', rawHtmlInput),
        generateCodeWithAI('html', rawHtmlInput),
      ]);
      codeSnippets = { react, vue, angular, html };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('AI Generation Critical Error:', errorMsg);
    }
  }

  // 3. Generate Number
  const lastComponent = await db
    .select({ number: contentComponents.number })
    .from(contentComponents)
    .orderBy(desc(contentComponents.number))
    .limit(1);

  const nextNumber = (lastComponent[0]?.number ?? 0) + 1;
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `components/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      if (!process.env.BUCKET_NAME) throw new Error('BUCKET_NAME not defined');

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: imageFile.type,
        }),
      );

      imageUrl = `https://${process.env.ACCOUNT_CLOUDFLARE}.r2.dev/${fileName}`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown upload error';
      console.error('Upload Image Failed:', msg);
      return { success: false, error: 'Gagal mengupload gambar.' };
    }
  }
  try {
    await db.insert(contentComponents).values({
      userId,
      title,
      typeContent: type,
      slug: validated.data.slug, // New Field
      codeSnippets: codeSnippets,
      copyComponentTextHTML: { content: copyComponentTextHTML },
      copyComponentTextPlain: {
        content: codeSnippets.react || copyComponentTextPlain,
      },
      categoryComponentsId: finalCategoryId,
      tier,
      platform,
      statusContent,
      number: nextNumber,
      imageUrl,
      viewCount: 0,
      copyCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath('/dashboard/components');

    return {
      success: true,
      message: rawHtmlInput
        ? 'Komponen berhasil dibuat & di-generate AI!'
        : 'Komponen berhasil dibuat (Manual Mode)!',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Database Error:', errorMsg);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menyimpan ke database.',
    };
  }
}
