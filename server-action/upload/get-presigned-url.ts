'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';

// Define allowed types if restricted, or allow generic types for templates
// For templates, we might allow zip, fig, etc.
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
  'application/pdf',
  'application/figma',
  'application/octet-stream',
];

type GetPresignedUrlParams = {
  fileName: string;
  fileType: string;
  fileSize: number;
  prefix?: string; // e.g. "templates", "images"
};

type GetPresignedUrlResponse =
  | { success: true; uploadUrl: string; fileUrl: string; key: string }
  | { success: false; error: string };

export async function getPresignedUrl({
  fileName,
  fileType,
  fileSize,
  prefix = 'uploads',
}: GetPresignedUrlParams): Promise<GetPresignedUrlResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Basic validation
    // Not strictly checking mime types here to allow flexibility unless critical
    if (fileSize > 150 * 1024 * 1024) {
      // 150MB limit
      return { success: false, error: 'File size exceeds 150MB limit' };
    }

    // Generate unique key
    const uniqueId = crypto.randomUUID();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = cleanFileName.split('.').pop() || '';
    const key = `${prefix}/${Date.now()}-${uniqueId}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // ACL: 'public-read', // R2 usually doesn't use ACLs the same way, public access is via bucket policy or custom domain
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    // Construct public URL
    // Try to find the public domain env var or fallback
    // Assuming 'libs/getR2 copy' client uses the same bucket
    // If process.env.R2_PUBLIC_DOMAIN is set, use it.
    let fileUrl = key;
    // Note: The original generic code just returned the key or a constructed URL.
    // Let's return the key mostly, but if we have a public domain:
    // Some logs showed: `https://e030a9ca75da2d22f1cdc516446cca19.r2.dev`
    // We will return the Key basically, and the client or next step can format it.
    // BUT the createTemplate action used `linkDownloadUrl = ${fileName}` (which is the key)
    // So consistent with that.

    return {
      success: true,
      uploadUrl,
      fileUrl: key, // Return the Key as the URL for the DB (as per previous pattern)
      key,
    };
  } catch (error) {
    console.error('Presigned URL Error:', error);
    return { success: false, error: 'Failed to generate upload URL' };
  }
}
