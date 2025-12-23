'use server';

import { headers } from 'next/headers';
import redis from '@/libs/redis-local';
import { auth } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import { eq } from 'drizzle-orm';
import {
  contentComponents,
  contentTemplates,
  contentDesigns,
  contentGradients,
} from '@/db/migration';

// --- Tipe Data ---
export type LimitCheckResult = {
  success: boolean;
  message?: string;
  remaining?: number;
  requiresLogin?: boolean;
  requiresUpgrade?: boolean;
};

// --- Konstanta ---
const FREE_TIER_LIMIT = 5;
const LIMIT_DURATION = 60 * 60 * 24 * 30; // 30 Hari

// --- Helper: Get IP ---
async function getIpAddress(): Promise<string> {
  const headerList = await headers();
  // Cek x-forwarded-for (standar proxy/Vercel) atau x-real-ip
  const forwardedFor = headerList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}

// --- Helper: Cek Tier Aset ---
async function getAssetTier(id: string, type: string) {
  // ... (Kode ini sama seperti sebelumnya, tidak perlu diubah) ...
  try {
    let table: any;
    switch (type) {
      case 'components': table = contentComponents; break;
      case 'templates': table = contentTemplates; break;
      case 'designs': table = contentDesigns; break;
      case 'gradients': table = contentGradients; break;
      default: return null;
    }
    const result = await db
      .select({ tier: table.tier })
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    return result.length > 0 ? result[0].tier : null;
  } catch (e) {
    console.error(`[GetAssetTier] Error:`, e);
    return null;
  }
}

// ============================================================================
// MAIN SERVER ACTION
// ============================================================================
export async function checkDownloadLimit(
  action: 'copy' | 'download',
  assetId: string,
  assetType: string,
  fingerprintId?: string | null, // ID dari ThumbmarkJS
): Promise<LimitCheckResult> {
  try {
    // 1. Auth & User Info
    const session = await auth();
    console.log(session);
    const user = session?.user as any;
    const isLoggedIn = !!user;
    const userTier = user?.tier || 'free';

    // 2. Validasi Input
    if (!assetId || !assetType) return { success: false, message: 'Invalid data' };

    // 3. Cek Status Aset
    const assetTier = await getAssetTier(assetId, assetType);
    if (!assetTier) return { success: false, message: 'Asset not found' };

    // --- LOGIKA PRO & LOGIN ---
    if (assetTier !== 'free') {
      if (!isLoggedIn) return { success: false, message: 'Login required', requiresLogin: true };
      if (userTier === 'free') return { success: false, message: 'Upgrade required', requiresUpgrade: true };
      return { success: true }; // Unlimited untuk User Pro di Aset Pro
    }

    // User Pro di Aset Free -> Unlimited
    if (userTier === 'pro' || userTier === 'pro_plus') {
      return { success: true };
    }

    // ============================================================
    // LOGIKA RATE LIMITING (GUEST & FREE USER)
    // ============================================================

    // A. Jika Login (Free User) -> Gunakan User ID saja (Paling Aman)
    if (isLoggedIn) {
      const userKey = `limit:user:${user.id}:${action}`; // Key bulanan bisa ditambah format tanggal
      const count = await checkAndIncrement(userKey);

      if (count > FREE_TIER_LIMIT) {
        return createLimitReachedResponse();
      }
      return { success: true, remaining: FREE_TIER_LIMIT - count };
    }

    // B. Jika GUEST -> Gunakan Strategi "Double Lock" (IP + Fingerprint)
    // Kita akan cek limit IP DAN limit Fingerprint. Jika salah satu habis, tolak.

    const ip = await getIpAddress();

    // Buat daftar Key yang akan dicek
    const keysToCheck: string[] = [];

    // 1. Key IP (Selalu dicek)
    const ipKey = `limit:ip:${ip}:${action}`;
    keysToCheck.push(ipKey);

    // 2. Key Fingerprint (Dicek jika dikirim client dan valid)
    // Validasi sederhana agar tidak di-inject string aneh
    let validFingerprint = false;
    if (fingerprintId && fingerprintId.length > 5 && fingerprintId.length < 100) {
      const fpKey = `limit:fp:${fingerprintId}:${action}`;
      keysToCheck.push(fpKey);
      validFingerprint = true;
    }

    // --- Langkah B1: CEK Kuota Dulu (Tanpa Increment) ---
    // Kita ambil nilai saat ini dari semua key (IP dan FP) secara paralel
    const currentValues = await redis.mget(...keysToCheck);

    // Analisis hasil
    for (const val of currentValues) {
      const count = parseInt(val || '0', 10);
      if (count >= FREE_TIER_LIMIT) {
        // Jika SALAH SATU limit (IP atau Fingerprint) sudah habis -> BLOKIR
        return createLimitReachedResponse();
      }
    }

    // --- Langkah B2: Increment Keduanya ---
    // Jika lolos pengecekan, baru kita naikkan hitungannya
    const pipeline = redis.multi();

    keysToCheck.forEach((key) => {
      pipeline.incr(key);
      pipeline.expire(key, LIMIT_DURATION); // Refresh durasi setiap kali aktif
    });

    const results = await pipeline.exec();

    // Ambil nilai tertinggi dari hasil increment untuk sisa kuota
    // results format: [[null, 1], [null, 1]] (karena ioredis return tuple [err, res])
    let maxUsage = 0;
    if (results) {
      results.forEach(([err, res]) => {
        if (typeof res === 'number' && res > maxUsage) maxUsage = res;
      });
    }

    console.log(`[Limit Guest] IP: ${ip} | FP: ${validFingerprint ? fingerprintId : 'None'} | Usage: ${maxUsage}`);

    return {
      success: true,
      remaining: Math.max(0, FREE_TIER_LIMIT - maxUsage),
    };

  } catch (error) {
    console.error('[CheckLimit] Error:', error);
    return { success: false, message: 'System error' };
  }
}

// --- Helper Functions untuk Kebersihan Kode ---

// Fungsi increment tunggal (untuk User Login)
async function checkAndIncrement(key: string): Promise<number> {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, LIMIT_DURATION);
  }
  return current;
}

function createLimitReachedResponse(): LimitCheckResult {
  return {
    success: false,
    message: `Daily limit reached (${FREE_TIER_LIMIT}x). Login or Upgrade for unlimited access.`,
    remaining: 0,
    requiresUpgrade: true,
  };
}