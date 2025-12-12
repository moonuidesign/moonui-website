'use client';
import React from 'react';
import Image from 'next/image';
import { cn } from '@/libs/utils';
import { ProIcon } from './tier-icons'; // Pastikan path ini benar sesuai struktur projectmu
import { motion } from 'framer-motion';
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
}) => {
  const isNew = createdAt
    ? (new Date().getTime() - new Date(createdAt).getTime()) /
        (1000 * 3600 * 24) <
      7
    : false;

  const tierLabel =
    tier === 'pro_plus' ? 'Pro Plus' : tier === 'pro' ? 'Pro' : 'Free';

  return (
    <motion.div
      layout
      // ANIMASI DIUBAH DI SINI:
      // Initial y: 50 (Mulai dari bawah)
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      // Animate y: 0 (Naik ke posisi asli)
      animate={{ opacity: 1, scale: 1, y: 0 }}
      // Exit y: 50 (Turun ke bawah lagi saat hilang)
      exit={{ opacity: 0, scale: 0.95, y: 50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'w-full inline-flex flex-col justify-start items-start gap-3 group',
        className,
      )}
    >
      {/* Image Container */}
      <div className="self-stretch aspect-[360/260] relative bg-white rounded-2xl shadow-card-sm border border-white overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            No Preview
          </div>
        )}

        <div className="absolute inset-0 bg-zinc-300/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 gap-2">
          {onCopy && (
            <button
              onClick={() => onCopy(id)}
              className="py-1 px-3 bg-white rounded-2xl shadow-sm flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="w-3 h-3 relative">
                <div className="w-2 h-3 bg-zinc-800 rounded-sm" />
              </div>
              <span className="text-zinc-800 text-xs font-medium font-['Inter'] leading-6">
                Copy
              </span>
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(id)}
              className="py-1 px-3 bg-white rounded-2xl shadow-sm flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-zinc-800 text-xs font-medium font-['Inter'] leading-6">
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
            <div className="text-center text-zinc-800 text-sm font-medium font-['Inter'] leading-6 truncate max-w-[200px]">
              {title}
            </div>
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
          {tier !== 'free' && <ProIcon />}
          <div
            className={cn(
              "text-right justify-center text-sm font-semibold font-['Inter'] leading-6",
              tier === 'free' ? 'text-zinc-800' : 'text-zinc-800',
            )}
          >
            {tierLabel}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
