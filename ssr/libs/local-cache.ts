import redis from './redislocal';

// =========================================================================
// 1. Tipe Data (Types) & Konstanta
// Lebih baik didefinisikan di satu tempat yang jelas.
// =========================================================================

/**
 * Data untuk subdomain default platform (e.g., my-form.nunggu.info)
 */
export type RootSubdomainData = {
  formId: string;
  subdomain: string; // Ini adalah handle/slug, bukan FQDN
};

/**
 * Data untuk domain kustom (e.g., app.customer.com atau *.customer.com)
 */
export type CustomHostnameData = {
  formId: string;
  hostname: string; // FQDN lengkap, e.g., app.customer.com
  isWildcard: boolean;
};

// Menggunakan konstanta untuk key prefix agar mudah diubah dan tidak ada typo.
const ROOT_SUBDOMAIN_PREFIX = 'subdomain_root:';
const CUSTOM_DOMAIN_PREFIX = 'domain_custom:';

// =========================================================================
// 2. Type Guards (Untuk Keamanan Tipe Data dari Redis)
// Fungsi ini memvalidasi bahwa objek dari Redis memiliki struktur yang kita harapkan.
// =========================================================================

/**
 * Memvalidasi dengan aman apakah sebuah objek memiliki struktur RootPlatformSubdomainData.
 * @param obj Objek dengan tipe tidak diketahui yang akan divalidasi.
 */
function isRootPlatformSubdomainData(obj: unknown): obj is RootSubdomainData {
  // 1. Pastikan input adalah objek yang valid dan bukan null.
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  // 2. Perlakukan sebagai Record untuk akses properti yang aman.
  const record = obj as Record<string, unknown>;

  // 3. Periksa keberadaan dan tipe dari setiap properti yang dibutuhkan.
  return (
    typeof record.workspaceId === 'string' &&
    typeof record.subDomain === 'string'
  );
}

function isCustomDomainData(
  obj: unknown, // PERBAIKAN: Menggunakan `unknown` alih-alih `any`
): obj is CustomHostnameData {
  // 1. Pastikan input adalah objek yang valid dan bukan null.
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  // 2. Perlakukan sebagai Record untuk akses properti yang aman.
  const record = obj as Record<string, unknown>;

  // 3. Periksa keberadaan dan tipe dari setiap properti yang dibutuhkan.
  return (
    typeof record.workspaceId === 'string' &&
    typeof record.customDomain === 'string'
  );
}

// =========================================================================
// 3. Generic Cache Handler Factory (Inti Perbaikan)
// Fungsi ini menciptakan satu set operasi cache (get, set, remove)
// untuk tipe data dan prefix tertentu.
// =========================================================================

function createCacheHandler<T>({
  keyPrefix,
  entityName,
  validator,
}: {
  keyPrefix: string;
  entityName: string; // Untuk logging error yang lebih deskriptif
  validator: (obj: unknown) => obj is T;
}) {
  /**
   * Mengambil data dari cache berdasarkan identifier.
   */
  async function get(identifier: string): Promise<T | null> {
    const sanitizedId = identifier.trim().toLowerCase();
    const key = `${keyPrefix}${sanitizedId}`;

    try {
      const dataString = await redis.get(key);
      if (!dataString) {
        return null;
      }

      const parsedData = JSON.parse(dataString);

      // Validasi struktur data sebelum mengembalikannya
      if (validator(parsedData)) {
        return parsedData;
      }

      // Jika data di cache korup/tidak valid, hapus dan anggap tidak ada.
      console.warn(
        `Data cache tidak valid untuk ${entityName} "${identifier}". Cache akan dihapus.`,
      );
      await redis.del(key);
      return null;
    } catch (error) {
      console.error(
        `Gagal mengambil data cache untuk ${entityName} "${identifier}":`,
        error,
      );
      return null;
    }
  }

  /**
   * Menyimpan data ke cache.
   */
  async function set(
    identifier: string,
    data: T,
    expiresInSeconds?: number,
  ): Promise<boolean> {
    const sanitizedId = identifier.trim().toLowerCase();
    const key = `${keyPrefix}${sanitizedId}`;

    try {
      const dataString = JSON.stringify(data);
      if (expiresInSeconds && expiresInSeconds > 0) {
        await redis.set(key, dataString, 'EX', expiresInSeconds);
      } else {
        await redis.set(key, dataString);
      }
      return true;
    } catch (error) {
      console.error(
        `Gagal mengatur data cache untuk ${entityName} "${identifier}":`,
        error,
      );
      return false;
    }
  }

  /**
   * Menghapus data dari cache.
   */
  async function remove(identifier: string): Promise<boolean> {
    const sanitizedId = identifier.trim().toLowerCase();
    const key = `${keyPrefix}${sanitizedId}`;

    try {
      const result = await redis.del(key);
      console.log(`Cache untuk ${entityName} "${identifier}" telah dihapus.`);
      return result > 0;
    } catch (error) {
      console.error(
        `Gagal menghapus data cache untuk ${entityName} "${identifier}":`,
        error,
      );
      return false;
    }
  }

  return { get, set, remove };
}

// =========================================================================
// 4. Inisialisasi dan Ekspor Handler Spesifik
// Kita menggunakan factory di atas untuk membuat handler yang kita butuhkan.
// Inilah yang akan digunakan di seluruh aplikasi Anda.
// =========================================================================

export const rootSubdomainCache = createCacheHandler<RootSubdomainData>({
  keyPrefix: ROOT_SUBDOMAIN_PREFIX,
  entityName: 'Root Subdomain',
  validator: isRootPlatformSubdomainData,
});

export const customDomainCache = createCacheHandler<CustomHostnameData>({
  keyPrefix: CUSTOM_DOMAIN_PREFIX,
  entityName: 'Custom Domain',
  validator: isCustomDomainData,
});
