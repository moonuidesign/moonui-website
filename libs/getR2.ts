// Lokasi: src/server-actions/r2/index.ts

'use server';

import { auth } from '@/libs/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// =================================================================
// SECTION 1: KONFIGURASI DAN INISIALISASI
// =================================================================

// Ambil konfigurasi dari environment variables untuk Cloudflare R2
const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
// Opsional: Domain publik kustom yang terhubung ke bucket R2 Anda
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

// Validasi bahwa semua variabel lingkungan telah diatur
if (
  !BUCKET_NAME ||
  !CLOUDFLARE_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY
) {
  throw new Error(
    'Variabel lingkungan Cloudflare R2 tidak dikonfigurasi dengan benar.',
  );
}

// Buat URL endpoint untuk R2
const R2_ENDPOINT = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Inisialisasi S3 Client yang dikonfigurasi untuk R2
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 menggunakan 'auto'
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// =================================================================
// SECTION 2: DEFINISI TIPE DAN KONSTANTA
// =================================================================

// Definisikan tipe file dan ukuran yang diizinkan untuk diunggah (tetap sama)
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxFileSizeInBytes = 1024 * 1024 * 5; // 5MB

// Tipe untuk parameter input fungsi
type GetSignedURLParams = {
  fileType: string;
  fileSize: number;
  // Checksum digunakan untuk verifikasi integritas data, opsional tapi direkomendasikan
  checksum: string;
};

// Tipe untuk respons yang akan dikirim kembali ke klien
type SignedURLResponse = {
  success?: {
    uploadUrl: string; // URL untuk mengunggah (PUT request)
    publicUrl: string; // URL publik file setelah diunggah
  };
  error?: string;
};

// =================================================================
// SECTION 3: SERVER ACTION UTAMA
// =================================================================

/**
 * Membuat pre-signed URL yang aman untuk mengunggah file langsung dari klien ke Cloudflare R2.
 *
 * @param {GetSignedURLParams} params - Parameter file yang akan diunggah.
 * @returns {Promise<SignedURLResponse>} - Objek yang berisi URL atau pesan error.
 */
export async function getSignedURL({
  fileType,
  fileSize,
}: GetSignedURLParams): Promise<SignedURLResponse> {
  try {
    // 1. Validasi Sesi Pengguna
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Akses ditolak. Silakan login terlebih dahulu.' };
    }

    // 2. Validasi Input di Sisi Server
    if (!allowedFileTypes.includes(fileType)) {
      return { error: 'Tipe file tidak diizinkan.' };
    }
    if (fileSize > maxFileSizeInBytes) {
      return { error: 'Ukuran file melebihi batas maksimal 5MB.' };
    }

    // 3. Buat Nama File Unik
    const randomBytes = crypto.randomBytes(16);
    const uniqueFileName = `${randomBytes.toString('hex')}-${Date.now()}`;
    const fileKey = `products/${uniqueFileName}`;

    // 4. Buat Perintah untuk R2 (menggunakan PutObjectCommand yang sama)
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
      // Metadata opsional
      Metadata: {
        userId: session.user.id,
      },
    });

    // 5. Hasilkan Pre-signed URL dari R2
    const uploadUrl = await getSignedUrl(r2Client, putObjectCommand, {
      expiresIn: 60, // URL berlaku selama 60 detik
    });

    // 6. Buat URL Publik
    // Sangat direkomendasikan menggunakan domain kustom untuk akses publik
    // Jika tidak, objek di R2 tidak dapat diakses publik secara default.
    const publicUrl = R2_PUBLIC_DOMAIN
      ? `https://${R2_PUBLIC_DOMAIN}/${fileKey}`
      : `Domain publik tidak dikonfigurasi. Objek tidak akan dapat diakses secara publik.`;

    // 7. Kirimkan Respons Berhasil
    return {
      success: {
        uploadUrl,
        publicUrl,
      },
    };
  } catch (error) {
    console.error('[R2_SIGNED_URL_ERROR]', error);
    return { error: 'Terjadi kesalahan internal saat membuat URL unggahan.' };
  }
}

/**
 * Mengunggah file langsung dari Server Action ke R2
 *
 * @param {File} file - File yang akan diunggah
 * @param {string} userId - ID User untuk metadata
 * @returns {Promise<string>} - URL publik file
 */
export async function uploadFileToR2(file: File, userId: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Validasi tipe dan ukuran
    if (!allowedFileTypes.includes(file.type)) {
      throw new Error('Tipe file tidak diizinkan');
    }
    if (file.size > maxFileSizeInBytes) {
      throw new Error('Ukuran file melebihi batas maksimal 5MB');
    }
  
    const randomBytes = crypto.randomBytes(16);
    const uniqueFileName = `${randomBytes.toString('hex')}-${Date.now()}`;
    // Anda bisa menyesuaikan folder path di sini, misalnya 'categories/'
    const fileKey = `categories/${uniqueFileName}`;
  
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
            userId: userId
        }
      })
    );
  
    return R2_PUBLIC_DOMAIN
      ? `https://${R2_PUBLIC_DOMAIN}/${fileKey}`
      : `File uploaded to ${fileKey} (Public domain not configured)`;
}