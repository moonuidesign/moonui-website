'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import { contentComponents } from '@/db/migration';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { ContentComponentFormValues, ContentComponentSchema } from './component-validator';

// ============================================================================
// 1. CONFIG & TYPES
// ============================================================================

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
  process.env.OPENROUTER_API_KEY,
].filter((key): key is string => typeof key === 'string' && key.trim().length > 0);

const AI_MODEL = 'google/gemini-2.0-flash-exp:free';
const AI_BASE_URL = '[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)';

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
    throw new Error('AI Output Invalid JSON');
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
        `[AI Warning] Key ...${apiKey.slice(-4)} failed (${
          isRateLimit ? '429' : 'Err'
        }). Switching...`,
      );

      if (isRateLimit) await delay(1000 * (i + 1));
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
    console.log('[AI Start] Requesting 4 frameworks (Single Shot)...');
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

    // Return status failed
    return {
      isAiSuccess: false,
      errorMsg: msg,
      data: { react: '', vue: '', angular: '', html: '' },
    };
  }
}

// ============================================================================
// 3. MAIN ACTION (UPDATE COMPONENT)
// ============================================================================

export async function updateContentComponent(
  id: string,
  values: ContentComponentFormValues,
  imageFile?: File | null,
): Promise<ActionResponse> {
  console.log('[UpdateComponent] Started for ID:', id);

  // 1. Auth Check
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized: Harap login terlebih dahulu.',
    };
  }

  // 2. Validation
  const valuesToValidate = { ...values };
  if (imageFile) {
    // @ts-ignore
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

  // 3. Logic Kategori
  const finalCategoryId =
    subCategoryComponentsId && subCategoryComponentsId.trim() !== ''
      ? subCategoryComponentsId
      : categoryComponentsId;

  // 4. AI Code Generation Logic (STRICT MODE)
  let newCodeSnippets: CodeSnippets | undefined = undefined;

  // Hanya jalankan AI jika ada input HTML baru
  if (rawHtmlInput && rawHtmlInput.trim().length >= 10) {
    console.log('[UpdateComponent] Generating AI Code...');

    const aiResult = await generateCodeSafely(rawHtmlInput);

    // CRITICAL CHANGE: Jika AI Gagal, jangan abort. Lanjut update data lain.
    if (!aiResult.isAiSuccess) {
      console.warn('[UpdateComponent] AI Generation Failed. Using fallback.');
      newCodeSnippets = {
        html: rawHtmlInput,
        react: `/* AI Generation Failed: ${aiResult.errorMsg} */\n/* Please edit and regenerate code manually. */\n`,
        vue: `/* AI Generation Failed */`,
        angular: `/* AI Generation Failed */`,
      };
    } else {
      newCodeSnippets = aiResult.data;
    }
  } else {
    console.log('[UpdateComponent] No new HTML provided, skipping AI.');
  }

  // 5. HANDLE IMAGE UPDATE
  const newImageUrl = typeof values.previewImage === 'string' ? values.previewImage : undefined;

  // Metadata (if updated)
  const newSize = values.size;
  const newFormat = values.format;

  // 6. Database Update
  try {
    const updateData = {
      title,
      slug,
      typeContent: type,
      categoryComponentsId: finalCategoryId,
      tier,
      description,
      statusContent,
      urlBuyOneTime,
      updatedAt: new Date(),
      copyComponentTextHTML: { content: copyComponentTextHTML },
      // Update Image jika ada
      ...(newImageUrl ? { imageUrl: newImageUrl } : {}),
      // Update Code jika AI dipanggil & Sukses
      ...(newCodeSnippets
        ? {
            codeSnippets: newCodeSnippets,
            copyComponentTextPlain: {
              content:
                newCodeSnippets.react.length > 50 ? newCodeSnippets.react : copyComponentTextPlain,
            },
          }
        : {
            copyComponentTextPlain: { content: copyComponentTextPlain },
          }),
    };

    await db.update(contentComponents).set(updateData).where(eq(contentComponents.id, id));

    revalidatePath('/dashboard/components');

    return {
      success: true,
      message: newCodeSnippets
        ? newCodeSnippets.react.includes('AI Generation Failed')
          ? 'Data diupdate (AI Gagal - Code tidak digenerate).'
          : 'Data & Code berhasil diperbarui!'
        : 'Data komponen berhasil diperbarui.',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[UpdateComponent] DB Update Error:', errorMsg);
    return { success: false, error: 'Gagal mengupdate database.' };
  }
}
