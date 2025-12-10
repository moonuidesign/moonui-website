// types/content.ts
export type ContentType = 'template' | 'component' | 'gradient' | 'design';

export interface UnifiedContent {
  id: string;
  title: string; // atau name
  description: string | null;
  slug: any; // jsonb
  imageUrl: string | null; // atau assetUrl/image
  tier: 'free' | 'pro' | 'pro_plus';
  number: number;
  type: ContentType;
  platform?: string; // Khusus template/component

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
  linkTemplate?: string; // LemonSqueezy Link for Templates

  // Relations
  category: {
    id: string;
    name: string;
    parentId?: string | null;
  } | null;
}
