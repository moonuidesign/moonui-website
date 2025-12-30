'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@/libs/auth';
import { s3Client } from '@/libs/getR2 copy';

// Define allowed types if restricted, or allow generic types for templates
// For templates, we might allow zip, fig, etc.
// Extended Allowed Types for Design Tools
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
  'application/pdf',
  'application/figma',
  'application/octet-stream',
  'application/postscript',
  'application/vnd.adobe.illustrator',
  'image/vnd.adobe.photoshop',
  'application/x-photoshop',
  'application/photoshop',
  'application/x-cdr',
  'application/cdr',
  'application/vnd.corel-draw',
  'application/x-indesign',
  'application/x-adobe-indesign',
  'application/vnd.adobe.xd',
  'application/sketch',
  'application/x-sketch',
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

    // 1. File Size Check (150MB)
    if (fileSize > 150 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 150MB limit' };
    }

    // 2. Validate MIME Type & Extension
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = cleanFileName.split('.').pop()?.toLowerCase() || '';

    // Comprehensive whitelist of Allowed Extensions
    const ALLOWED_EXTS = [
      // Images
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'svg',
      'tiff',
      'bmp',
      'ico',
      // Archives
      'zip',
      'rar',
      '7z',
      'tar',
      'gz',
      // Documents
      'pdf',
      // Design Softwares
      'fig', // Figma
      'ai',
      'eps', // Illustrator
      'psd',
      'psb', // Photoshop
      'cdr', // CorelDRAW
      'indd',
      'idml', // InDesign
      'xd', // Adobe XD
      'sketch', // Sketch
      'studio', // Silhouette Studio
      'studio3',
    ];

    if (!ALLOWED_EXTS.includes(ext)) {
      console.error(`Blocked extension: .${ext}`);
      return {
        success: false,
        error: `File extension .${ext} is not yet supported. Please contact support.`,
      };
    }

    // Relaxed MIME check: If it's a known safe extension, we trust it more than the mime type
    // because browsers are bad at guessing proprietary formats (often sending 'application/octet-stream')
    const isKnownExtension = ALLOWED_EXTS.includes(ext);

    if (!ALLOWED_MIME_TYPES.includes(fileType) && !isKnownExtension) {
      console.error('Blocked forbidden file type:', fileType, fileName);
      return { success: false, error: `File type ${fileType} is not allowed` };
    }

    // Generate unique key
    const uniqueId = crypto.randomUUID();
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
