'use client';
import React from 'react';
import Image from 'next/image';
import { cn } from '@/libs/utils';
// Pastikan path ini benar sesuai struktur projectmu
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFilter } from '@/contexts';

export * from './card-component';
export * from './card-element';
export * from './gradient-card';
export * from './tier-icons';
interface ResourceCardProps {
  id: string;
  title: string;
  imageUrl: string | null;
  tier: 'free' | 'pro' | 'pro_plus' | string;
  createdAt?: Date | null;
  author?: string;
  onCopy?: (id: string) => void;
  onDownload?: (id: string) => void;
  className?: string;
  type?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  title,
  imageUrl,
  tier,
  createdAt,
  author,
  onCopy,
  onDownload,
  className,
  type,
}) => {
  const { contentType } = useFilter();
  const router = useRouter();

  // Use passed type or fallback to contentType context
  const assetType = type || contentType;

  const isNew = createdAt
    ? (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 3600 * 24) < 30
    : false;

  const tierLabel = tier === 'pro_plus' ? 'Pro Plus' : tier === 'pro' ? 'Pro' : 'Free';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => router.push(`/assets/${assetType}/${id}`)}
      className={cn(
        'group inline-flex w-full cursor-pointer flex-col items-start justify-start gap-3',
        className,
      )}
    >
      {/* Image Container */}
      <div
        className={`shadow-card-sm group relative self-stretch overflow-hidden rounded-2xl border border-white bg-white transition-all duration-300 ${
          contentType === 'templates' ? 'h-[420px]' : 'aspect-[360/260]' // Gunakan aspect ratio hanya jika bukan templates
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            // Penting: object-top biasanya lebih baik untuk template panjang agar header terlihat
            className={`rounded-lg object-cover ${
              contentType === 'templates' ? 'object-top' : 'object-center'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={contentType === 'templates'} // Berikan prioritas jika ini konten utama (opsional)
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            No Preview
          </div>
        )}

        {/* Overlay Hover */}
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-zinc-300/80 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          {onCopy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(id);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-1 shadow-sm transition-all hover:scale-105"
            >
              <div className="flex h-3 w-3 items-center justify-center">
                <div className="h-3 w-2.5 rounded-[2px] bg-zinc-800" />
              </div>
              <span className="font-['Inter'] text-xs leading-6 font-semibold text-[#3D3D3D]">
                Copy
              </span>
            </button>
          )}

          {onDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(id);
              }}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-1 shadow-sm transition-all hover:scale-105"
            >
              <span className="font-['Inter'] text-xs leading-6 font-semibold text-[#3D3D3D]">
                Download
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div className="inline-flex items-center justify-between self-stretch px-2">
        <div className="flex flex-col items-start justify-start gap-0.5">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[100px] truncate text-center font-['Inter'] text-sm leading-6 font-medium text-[#3D3D3D]">
                  {title}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
            {isNew && (
              <div className="flex flex-col items-start justify-start rounded-md bg-orange-600 px-1.5 py-1 shadow-sm">
                <div className="font-['Inter'] text-[10px] leading-[10px] font-semibold text-white">
                  New
                </div>
              </div>
            )}
          </div>
          {author && (
            <div className="font-['Inter'] text-xs font-normal text-zinc-500">by {author}</div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1">
          {tier !== 'free' && (
            <Image
              alt="Logo Figma"
              width={100}
              height={100}
              src="/ic-diamond-small.svg"
              className="h-[14px] w-[14px]"
            />
          )}
          <div
            className={cn(
              "justify-center text-right font-['Inter'] text-sm leading-6 font-semibold",
              tier === 'free' ? 'text-[#3D3D3D]' : 'text-[#3D3D3D]',
            )}
          >
            {tierLabel}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
