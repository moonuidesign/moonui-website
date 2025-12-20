'use client';
import React from 'react';
import Image from 'next/image';
import { cn } from '@/libs/utils';
// Pastikan path ini benar sesuai struktur projectmu
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    ? (new Date().getTime() - new Date(createdAt).getTime()) /
        (1000 * 3600 * 24) <
      30
    : false;

  const tierLabel =
    tier === 'pro_plus' ? 'Pro Plus' : tier === 'pro' ? 'Pro' : 'Free';

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
        'w-full inline-flex flex-col justify-start items-start gap-3 group cursor-pointer',
        className,
      )}
    >
      {/* Image Container */}
      <div
        className={`self-stretch relative bg-white rounded-2xl shadow-card-sm border border-white overflow-hidden group transition-all duration-300 ${
          contentType === 'templates' ? 'h-[420px]' : 'aspect-[360/260]' // Gunakan aspect ratio hanya jika bukan templates
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            // Penting: object-top biasanya lebih baik untuk template panjang agar header terlihat
            className={`object-cover rounded-lg ${
              contentType === 'templates' ? 'object-top' : 'object-center'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={contentType === 'templates'} // Berikan prioritas jika ini konten utama (opsional)
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            No Preview
          </div>
        )}

        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-zinc-300/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 gap-2">
          {onCopy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(id);
              }}
              className="py-1 px-4 bg-white rounded-full shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-3 h-3 flex items-center justify-center">
                <div className="w-2.5 h-3 bg-zinc-800 rounded-[2px]" />
              </div>
              <span className="text-[#3D3D3D] text-xs font-semibold font-['Inter'] leading-6">
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
              className="py-1 px-4 bg-white rounded-full shadow-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#3D3D3D] text-xs font-semibold font-['Inter'] leading-6">
                Download
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Meta Info */}
      <div className="self-stretch px-2 inline-flex justify-between items-center">
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center text-[#3D3D3D] text-sm font-medium font-['Inter'] leading-6 truncate max-w-[100px]">
                  {title}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
            {isNew && (
              <div className="px-1.5 py-1 bg-orange-600 rounded-md shadow-sm flex flex-col justify-start items-start">
                <div className="text-white text-[10px] font-semibold font-['Inter'] leading-[10px]">
                  New
                </div>
              </div>
            )}
          </div>
          {author && (
            <div className="text-zinc-500 text-xs font-normal font-['Inter']">
              by {author}
            </div>
          )}
        </div>

        <div className="flex justify-center items-center gap-1">
          {tier !== 'free' && (
            <Image
              alt="Logo Figma"
              width={100}
              height={100}
              src="/ic-diamond-small.svg"
              className="w-[14px] h-[14px]"
            />
          )}
          <div
            className={cn(
              "text-right justify-center text-sm font-semibold font-['Inter'] leading-6",
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
