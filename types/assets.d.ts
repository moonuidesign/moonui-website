// types/content.ts

export type ContentType = 'template' | 'component' | 'gradient' | 'design';

export interface UnifiedContent {
  id: string;
  title: string;
  description: string | null;
  slug: any;
  imageUrl: string | null;
  copyDataHtml?: string;
  copyDataPlain?: string;
  downloadUrl?: string;
  images?: { url: string }[];
  // ------------------------

  tier: 'free' | 'pro' | 'pro_plus';
  number: number;
  type: ContentType;
  platform?: string;
  format: string;
  size: string;
  // Stats
  viewCount: number;
  downloadCount?: number;
  copyCount?: number;

  codeSnippets?: {
    react: string;
    vue: string;
    angular: string;
    html: string;
  };

  // External Links
  urlPreview?: string | null;
  linkDownload?: string;
  linkTemplate?: string;

  // Relations
  category: {
    id: string;
    name: string;
    parentId?: string | null;
  } | null;
}
