'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/libs/auth'; // Sesuaikan path
import { db } from '@/libs/drizzle'; // Sesuaikan path
import { s3Client } from '@/libs/getR2 copy'; // Sesuaikan path
import { contentComponents } from '@/db/migration/schema'; // Import schema
import { eq } from 'drizzle-orm';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import {
  ContentComponentFormValues,
  ContentComponentSchema,
} from './component-validator'; // Sesuaikan path

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

type FrameworkType = 'react' | 'vue' | 'angular' | 'html';

type ActionResponse =
  | { success: true; message: string }
  | {
      success: false;
      error: string;
      details?: Record<string, string[] | undefined>;
    };

interface CodeSnippets {
  react: string;
  vue: string;
  angular: string;
  html: string;
}

const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter((key): key is string => typeof key === 'string' && key.length > 0);

const AI_MODEL = 'google/gemini-2.0-flash-exp';
const AI_BASE_URL = 'https://openrouter.ai/api/v1';

const SYSTEM_INSTRUCTION = `
### ROLE & OBJECTIVE
You are an expert Senior Frontend Architect. Your task is to refactor "Raw/Spaghetti HTML" into clean, production-grade, responsive component code.

### CRITICAL OUTPUT RULES
1. **CODE ONLY**: Return strictly the code. No conversation.
2. **NO MARKDOWN**: Output raw text only.
3. **NO HALLUCINATION**: Do not invent imports.

### CONTINUATION PROTOCOL
If you hit the token limit:
1. Stop exactly where the limit hits.
2. When the user says "CONTINUE", resume generation **EXACTLY** from there.
3. **DO NOT REPEAT** the last segment.

### FRAMEWORK STANDARDS
- **React**: Functional components, Tailwind CSS, 'lucide-react'. Remove absolute positioning.
- **Vue**: Vue 3 <script setup>, Tailwind CSS.
- **Angular**: Standalone Components, Tailwind CSS.
- **HTML**: Semantic HTML5, Tailwind CSS.
`;

const CONTINUATION_PROMPT = `
You stopped due to the output token limit. 
Please continue generation **IMMEDIATELY** from the exact character where you stopped. 
Do not repeat the last segment. 
Do not add markdown backticks. 
Just flow the code.
`;

// ============================================================================
// 3. AI HELPER FUNCTIONS
// ============================================================================

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
          `[AI Warning] Key ...${apiKey.slice(-4)} failed. Switching...`,
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

  console.log(`[AI Update] Generating ${framework}...`);

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

export async function updateContentComponent(
  id: string,
  values: ContentComponentFormValues,
  imageFile?: File | null,
): Promise<ActionResponse> {
  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized: Harap login terlebih dahulu.',
    };
  }

  // 2. Validation
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
    subCategoryComponentsId, // Ambil field Sub Category
    tier,
    platform,
    statusContent,
    copyComponentTextHTML,
    copyComponentTextPlain,
  } = validated.data;

  // 3. Logic Penentuan Kategori (Parent vs Sub)
  // Jika subCategory dipilih, gunakan itu sebagai ID yang disimpan
  const finalCategoryId =
    subCategoryComponentsId && subCategoryComponentsId.trim() !== ''
      ? subCategoryComponentsId
      : categoryComponentsId;

  // 4. AI Code Generation Logic
  let newCodeSnippets: CodeSnippets | undefined = undefined;

  if (rawHtmlInput && rawHtmlInput.trim().length >= 10) {
    try {
      // Jalankan AI secara parallel
      const [react, vue, angular, html] = await Promise.all([
        generateCodeWithAI('react', rawHtmlInput),
        generateCodeWithAI('vue', rawHtmlInput),
        generateCodeWithAI('angular', rawHtmlInput),
        generateCodeWithAI('html', rawHtmlInput),
      ]);

      newCodeSnippets = { react, vue, angular, html };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('AI Update Generation Error:', errorMsg);
    }
  } else {
    console.log('Skipping AI Update: No new/valid Raw HTML provided.');
  }

  // 5. Image Upload Logic
  let newImageUrl: string | undefined = undefined;
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

      newImageUrl = `https://${process.env.ACCOUNT_CLOUDFLARE}.r2.dev/${fileName}`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown upload error';
      console.error('Upload Failed:', msg);
      return { success: false, error: 'Gagal mengupload gambar baru.' };
    }
  }

  // 6. Database Update
  try {
    await db
      .update(contentComponents)
      .set({
        title,
        slug: validated.data.slug, // New Field
        typeContent: type,
        categoryComponentsId: finalCategoryId, // Gunakan ID hasil logika di atas
        tier,
        platform,
        statusContent,
        updatedAt: new Date(),
        copyComponentTextHTML: { content: copyComponentTextHTML },
        ...(newImageUrl ? { imageUrl: newImageUrl } : {}),
        ...(newCodeSnippets
          ? {
              codeSnippets: newCodeSnippets,
              copyComponentTextPlain: { content: newCodeSnippets.react },
            }
          : {
              copyComponentTextPlain: { content: copyComponentTextPlain },
            }),
      })
      .where(eq(contentComponents.id, id));

    revalidatePath('/dashboard/components');
    const msg = newCodeSnippets
      ? 'Komponen berhasil diperbarui & Code AI digenerate ulang!'
      : 'Data komponen berhasil diperbarui.';

    return { success: true, message: msg };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('DB Update Error:', errorMsg);
    return { success: false, error: 'Gagal mengupdate database.' };
  }
}
