'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import { s3Client } from '@/libs/getR2 copy';
import { contentComponents } from '@/db/migration';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import {
  ContentComponentFormValues,
  ContentComponentSchema,
} from './component-validator';

// ============================================================================
// 1. CONFIG & TYPES
// ============================================================================

const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.OPENROUTER_API_KEY,
].filter(
  (key): key is string => typeof key === 'string' && key.trim().length > 0,
);

const AI_MODEL = 'google/gemini-2.5-flash-preview-09-2025';
const AI_BASE_URL = 'https://openrouter.ai/api/v1';

interface CodeSnippets {
  react: string;
  vue: string;
  angular: string;
  html: string;
}

const SYSTEM_INSTRUCTION_JSON = `
You are a Senior Frontend Architect.
Task: Convert the input HTML into React, Vue, Angular, and clean HTML5.

### OUTPUT FORMAT (STRICT)
Return ONLY a raw JSON object. Do not use Markdown.
{
  "react": "string (React component code)",
  "vue": "string (Vue 3 script setup code)",
  "angular": "string (Angular standalone component code)",
  "html": "string (Semantic HTML5 code)"
}
`;

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function safeParseJSON(text: string, rawInput: string): CodeSnippets {
  try {
    const cleanText = text
      .replace(/^```json\n?/gi, '')
      .replace(/^```\n?/gi, '')
      .replace(/\n?```$/g, '')
      .trim();

    const json = JSON.parse(cleanText);

    return {
      react: json.react || `/* React generation empty */\n${rawInput}`,
      vue: json.vue || `\n${rawInput}`,
      angular: json.angular || `/* Angular generation empty */\n${rawInput}`,
      html: json.html || rawInput,
    };
  } catch (e) {
    console.error('[AI Parse Error] Output bukan JSON valid.');
    throw new Error('AI Output Invalid JSON'); // Throw error agar ditangkap wrapper
  }
}

async function callAIWithRotation(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  if (GEMINI_API_KEYS.length === 0) throw new Error('No API Keys configured.');

  let lastError: Error | null = null;

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];
    try {
      const openai = new OpenAI({ baseURL: AI_BASE_URL, apiKey: apiKey });

      return await openai.chat.completions.create({
        model: AI_MODEL,
        messages: messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isRateLimit = lastError.message.includes('429');

      console.warn(
        `[AI Warning] Key ...${apiKey.slice(-4)} failed (${isRateLimit ? '429' : 'Err'
        }). Switching...`,
      );

      if (isRateLimit) await delay(1000);
    }
  }
  throw new Error(`All keys failed. Last error: ${lastError?.message}`);
}

async function generateCodeSafely(
  rawHtml: string,
): Promise<{ data: CodeSnippets; isAiSuccess: boolean; errorMsg?: string }> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION_JSON },
    { role: 'user', content: `--- INPUT HTML ---\n${rawHtml}` },
  ];

  try {
    console.log('[AI Start] Requesting 4 frameworks...');
    const response = await callAIWithRotation(messages);
    const content = response.choices[0].message?.content || '{}';

    console.log('[AI Success] Parsing result...');
    return {
      data: safeParseJSON(content, rawHtml),
      isAiSuccess: true,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[AI FAIL] ${msg}`);

    // Return status failed agar main function bisa membatalkan proses
    return {
      isAiSuccess: false,
      errorMsg: msg,
      data: { react: '', vue: '', angular: '', html: '' }, // Dummy data
    };
  }
}

// ============================================================================
// 3. MAIN ACTION (CREATE COMPONENT)
// ============================================================================

export async function createContentComponent(
  values: ContentComponentFormValues,
  imageFile?: File | null,
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}> {
  console.log('[CreateComponent] Started');

  // 1. Auth & Validasi
  // 1. Auth & Validasi
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  // Manual inject imageFile to validation object
  const valuesToValidate = { ...values };
  if (imageFile) {
    // @ts-ignore - we know schema accepts File now, allowing loose type for validation step
    valuesToValidate.previewImage = imageFile;
  }

  const validated = ContentComponentSchema.safeParse(valuesToValidate);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join('\n'), // Detailed error
      details: validated.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    type,
    rawHtmlInput,
    categoryComponentsId,
    subCategoryComponentsId,
    tier,
    statusContent,
    urlBuyOneTime,
    description,
    copyComponentTextHTML,
    copyComponentTextPlain,
    slug,
  } = validated.data;

  const finalCategoryId = subCategoryComponentsId?.trim()
    ? subCategoryComponentsId
    : categoryComponentsId;

  // 2. GENERATE CODE (STRICT MODE)
  let codeSnippets: CodeSnippets = {
    react: '',
    vue: '',
    angular: '',
    html: '',
  };

  if (rawHtmlInput && rawHtmlInput.trim().length > 0) {
    const aiResult = await generateCodeSafely(rawHtmlInput);

    // CRITICAL CHANGE: Jika AI Gagal, jangan abort. Lanjut ke save dengan code snippet manual.
    if (!aiResult.isAiSuccess) {
      console.warn('[CreateComponent] AI Generation Failed (Rate Limit). Using fallback data.');
      codeSnippets = {
        html: rawHtmlInput,
        react: `/* AI Generation Failed: ${aiResult.errorMsg} */\n/* Please edit and regenerate code manually. */\n\nexport default function Component() {\n  return (\n    <div dangerouslySetInnerHTML={{ __html: \`${rawHtmlInput.replace(/`/g, '\\`')}\` }} />\n  );\n}`,
        vue: `<!-- AI Generation Failed -->\n<template>\n  <div v-html="htmlContent"></div>\n</template>\n<script setup>\nconst htmlContent = \`${rawHtmlInput.replace(/`/g, '\\`')}\`;\n</script>`,
        angular: `/* AI Generation Failed */\n@Component({\n  selector: 'app-component',\n  template: \`${rawHtmlInput.replace(/`/g, '\\`')}\`\n})\nexport class Component {}`,
      };
      // Mark for warning return later
    } else {
      codeSnippets = aiResult.data;
    }
  }

  // 3. UPLOAD IMAGE (Hanya jalan jika AI sukses)
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `components/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      if (!process.env.BUCKET_NAME) throw new Error('No Bucket Name');

      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: imageFile.type,
        }),
      );
      imageUrl = fileName;
    } catch (e) {
      console.error('[S3 Error]', e);
      return { success: false, error: 'Gagal upload gambar' };
    }
  }

  // 4. DB INSERT (Hanya jalan jika AI & Upload sukses)
  try {
    await db.insert(contentComponents).values({
      userId: session.user.id,
      title,
      typeContent: type,
      slug,
      codeSnippets,
      copyComponentTextHTML: { content: copyComponentTextHTML },
      copyComponentTextPlain: {
        content: copyComponentTextPlain,
      },
      categoryComponentsId: finalCategoryId,
      tier,
      description,
      statusContent,
      urlBuyOneTime,
      imageUrl,
    });

    revalidatePath('/dashboard/components');

    return {
      success: true,
      message: codeSnippets.react.includes('AI Generation Failed')
        ? 'Komponen dibuat (AI Busy/Limit - Code kosong). Silakan edit manual.'
        : 'Komponen berhasil dibuat & Code Generated!',
    };
  } catch (error) {
    console.error('[DB Error]', error);
    return { success: false, error: 'Terjadi kesalahan database.' };
  }
}
