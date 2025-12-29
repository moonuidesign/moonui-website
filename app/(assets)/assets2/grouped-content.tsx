'use client';

import React from 'react';
import { NavCategoryItem } from '@/types/category';
import { Assets2Card } from '@/components/assets/assets2-card';
import { ChevronRight } from 'lucide-react';
import { UseCopyToClipboard } from '@/hooks/use-clipboard';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { checkDownloadLimit } from '@/server-action/limit';
import { incrementAssetStats } from '@/server-action/incrementAssetStats';
import { getFingerprint } from '@thumbmarkjs/thumbmarkjs';

interface GroupedContentProps {
  categories?: NavCategoryItem[];
  groupedAssets: Record<string, any[]>;
  onCategorySelect: (slug: string) => void;
}

export default function GroupedContent({ groupedAssets, onCategorySelect }: GroupedContentProps) {
  const router = useRouter();
  const { copy } = UseCopyToClipboard();
  const [fingerprint, setFingerprint] = React.useState<string>('');

  React.useEffect(() => {
    getFingerprint().then(setFingerprint).catch(console.error);
  }, []);

  const handleCopy = async (text: string, id: string, type: string) => {
    if (!text) return toast.error('No content to copy');
    const limitCheck = await checkDownloadLimit('copy', id, type, fingerprint);
    if (!limitCheck.success) {
      if (limitCheck.requiresLogin) router.push('/signin');
      else if (limitCheck.requiresUpgrade) router.push('/pricing');
      else toast.error(limitCheck.message);
      return;
    }
    incrementAssetStats(id, type, 'copy');
    copy(text, 'Component copied to clipboard!');
  };

  const handleDownload = async (url: string, id: string, type: string) => {
    if (!url) return toast.error('Download link not available');
    const limitCheck = await checkDownloadLimit('download', id, type, fingerprint);
    if (!limitCheck.success) {
      if (limitCheck.requiresLogin) router.push('/signin');
      else if (limitCheck.requiresUpgrade) router.push('/pricing');
      else toast.error(limitCheck.message);
      return;
    }
    incrementAssetStats(id, type, 'download');
    window.open(url, '_blank');
  };

  const sections = Object.entries(groupedAssets).filter(([_, items]) => items && items.length > 0);

  return (
    <div className="flex flex-col gap-12 pb-20">
      {sections.map(([catKey, items]) => {
        // catKey is the MAIN CATEGORY name (e.g. "Saas") derived from getOverviewData.
        // We use this as the display name to represent the Section.
        const displayName = catKey;

        // Slug for navigation
        // We assume catKey (Name) equates to the slug or can be used to select category.
        const slug = catKey;

        return (
          <div key={catKey} className="flex flex-col gap-6">
            <div className="relative flex items-center justify-between border-b border-gray-100">
              <span className="absolute top-1/2 right-[115px] h-[1.5px] w-[70%] -translate-y-1/2 transform bg-[#D3D3D3]">
                <div className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]"></div>
                <div className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 transform rounded-full bg-[#D3D3D3]"></div>
              </span>
              <h2 className="text-xl font-bold text-gray-800 capitalize">{displayName}</h2>
              <button
                onClick={() => onCategorySelect(slug)}
                className="group relative flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-medium transition-colors hover:text-orange-600"
              >
                See more
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item, index) => {
                let rawUrl = item.imageUrl || item.url || '';
                if (rawUrl && typeof rawUrl === 'object' && rawUrl.url) {
                  rawUrl = rawUrl.url;
                }
                let finalUrl = '/placeholder-image.png';
                if (typeof rawUrl === 'string' && rawUrl.length > 0) {
                  if (rawUrl.startsWith('http') || rawUrl.startsWith('https')) {
                    finalUrl = rawUrl;
                  } else {
                    const domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
                    finalUrl = `https://${domain}/${rawUrl}`;
                  }
                }

                return (
                  <Assets2Card
                    key={`${item.id}-${index}`}
                    id={item.id}
                    title={item.title}
                    imageUrl={finalUrl}
                    tier={item.tier}
                    createdAt={item.createdAt}
                    author={item.author}
                    type={item.type}
                    onCopy={
                      item.type === 'components'
                        ? () => handleCopy(item.copyData, item.id, item.type)
                        : undefined
                    }
                    onDownload={
                      item.type !== 'components'
                        ? () => handleDownload(item.downloadUrl, item.id, item.type)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
