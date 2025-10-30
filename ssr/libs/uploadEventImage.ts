'use server';

import { auth } from '@/libs/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// =================================================================
// KONFIGURASI R2 UNTUK EVENT IMAGES
// =================================================================

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;

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

const R2_ENDPOINT = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// =================================================================
// TIPE DAN KONSTANTA
// =================================================================

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const maxFileSizeInBytes = 1024 * 1024 * 10; // 10MB untuk flyer/pamflet

type GetEventImageSignedURLParams = {
  fileType: string;
  fileSize: number;
};

type SignedURLResponse = {
  success?: {
    uploadUrl: string;
    publicUrl: string;
    fileKey: string;
  };
  error?: string;
};

// =================================================================
// FUNGSI UNTUK MENDAPATKAN SIGNED URL (EXPIRED 1 HARI)
// =================================================================

/**
 * Membuat pre-signed URL untuk upload gambar event (flyer/pamflet)
 * dengan masa berlaku 1 hari (86400 detik)
 */
export async function getEventImageSignedURL({
  fileType,
  fileSize,
}: GetEventImageSignedURLParams): Promise<SignedURLResponse> {
  try {
    // 1. Validasi Sesi Pengguna
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Akses ditolak. Silakan login terlebih dahulu.' };
    }

    // 2. Validasi Input
    if (!allowedImageTypes.includes(fileType)) {
      return {
        error: 'Tipe file tidak diizinkan. Hanya PNG, JPG, WEBP, dan GIF.',
      };
    }
    if (fileSize > maxFileSizeInBytes) {
      return { error: 'Ukuran file melebihi batas maksimal 10MB.' };
    }

    // 3. Buat Nama File Unik
    const randomBytes = crypto.randomBytes(16);
    const uniqueFileName = `${randomBytes.toString('hex')}-${Date.now()}`;
    const fileKey = `events/flyers/${uniqueFileName}`;

    // 4. Buat Perintah untuk R2
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
      ContentLength: fileSize,
      Metadata: {
        userId: session.user.id,
        uploadType: 'event-flyer',
      },
    });

    // 5. Hasilkan Pre-signed URL dengan expired 1 hari (86400 detik)
    const uploadUrl = await getSignedUrl(r2Client, putObjectCommand, {
      expiresIn: 86400, // 1 hari = 24 * 60 * 60 = 86400 detik
    });

    // 6. Buat URL Publik
    const publicUrl = R2_PUBLIC_DOMAIN
      ? `https://${R2_PUBLIC_DOMAIN}/${fileKey}`
      : `https://${BUCKET_NAME}.${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileKey}`;

    // 7. Kirimkan Respons Berhasil
    return {
      success: {
        uploadUrl,
        publicUrl,
        fileKey,
      },
    };
  } catch (error) {
    console.error('[EVENT_IMAGE_UPLOAD_ERROR]', error);
    return { error: 'Terjadi kesalahan internal saat membuat URL unggahan.' };
  }
}

// =================================================================
// FUNGSI UNTUK UPLOAD LANGSUNG (SERVER-SIDE)
// =================================================================

/**
 * Upload file langsung dari server ke R2
 * Digunakan ketika file sudah ada di server (misal dari FormData)
 */
export async function uploadEventImageDirect(
  file: File,
): Promise<{ success?: { publicUrl: string }; error?: string }> {
  try {
    // 1. Validasi Sesi Pengguna
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Akses ditolak. Silakan login terlebih dahulu.' };
    }

    // 2. Validasi File
    if (!allowedImageTypes.includes(file.type)) {
      return {
        error: 'Tipe file tidak diizinkan. Hanya PNG, JPG, WEBP, dan GIF.',
      };
    }
    if (file.size > maxFileSizeInBytes) {
      return { error: 'Ukuran file melebihi batas maksimal 10MB.' };
    }

    // 3. Buat Nama File Unik
    const randomBytes = crypto.randomBytes(16);
    const uniqueFileName = `${randomBytes.toString('hex')}-${Date.now()}`;
    const fileKey = `events/flyers/${uniqueFileName}`;

    // 4. Convert File ke Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload ke R2
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        userId: session.user.id,
        uploadType: 'event-flyer',
        originalName: file.name,
      },
    });

    await r2Client.send(putObjectCommand);

    // 6. Buat URL Publik
    const publicUrl = R2_PUBLIC_DOMAIN
      ? `https://${R2_PUBLIC_DOMAIN}/${fileKey}`
      : `https://${BUCKET_NAME}.${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileKey}`;

    return {
      success: {
        publicUrl,
      },
    };
  } catch (error) {
    console.error('[EVENT_IMAGE_DIRECT_UPLOAD_ERROR]', error);
    return { error: 'Terjadi kesalahan saat mengupload gambar.' };
  }
}
