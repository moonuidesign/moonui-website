const apiKeys = process.env.GEMINI_API_KEYS?.split(',') || [];
if (apiKeys.length === 0) {
  console.warn(
    'Peringatan: Tidak ada GEMINI_API_KEYS yang ditemukan di environment variables.',
  );
}

export const geminiApiKeys = apiKeys;
