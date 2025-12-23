'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  Lock,
  Code,
  Layers,
  Tag,
  Hash,
  Box,
  ExternalLink,
  Maximize2,
  ImageIcon,
  X,
  Monitor,
  Globe,
  ChevronDown,
  ChevronUp,
  Image as LucideImage,
  Loader2,
  Eye,
} from 'lucide-react';
import { UnifiedContent } from '@/types/assets';
import { incrementAssetStats } from '@/server-action/incrementAssetStats';
import { UseCopyToClipboard } from '@/hooks/use-clipboard';
import { useFingerprint } from '@/hooks/use-fingerprint';
import { checkDownloadLimit } from '@/server-action/limit';
import { toast } from 'react-toastify';

// Import komponen CodeGroup (Tabs) yang sudah dibuat
import { CodeGroup, type CodeFile } from '../ui/shadcn-io/tabs';

// --- HELPER: SAFE URL PARSER ---
const getSafeImageUrl = (
  src: string | { url: string } | null | undefined,
): string | null => {
  if (!src) return null;
  const urlString = typeof src === 'object' && 'url' in src ? src.url : src;
  if (typeof urlString !== 'string' || urlString.trim() === '') return null;
  if (urlString.startsWith('http') || urlString.startsWith('/')) {
    return urlString;
  }
  return null;
};

// --- HELPER: ASSET LINK GENERATOR ---
const getAssetPath = (type: string | undefined, id: string) => {
  if (!type) return '#';
  const typeMap: Record<string, string> = {
    component: 'components',
    template: 'templates',
    design: 'designs',
    gradient: 'gradients',
  };
  const path = typeMap[type] || `${type}s`;
  return `/assets/${path}/${id}`;
};

// --- HELPER: DYNAMIC DURATION ---
const calculateDuration = (code: string) => {
  const length = code.length;
  return Math.min(Math.max(length / 100, 2), 5);
};

// --- SKELETON COMPONENT ---
export function ContentDetailSkeleton() {
  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 md:p-8 min-h-screen">
      {/* Top Navigation Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-32 bg-neutral-200 rounded-full animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Left Column - Image */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6">
          <div className="w-full aspect-[4/3] bg-neutral-200 rounded-3xl animate-pulse" />
          {/* Gallery Thumbnails */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-video bg-neutral-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="w-full lg:w-[35%] space-y-6">
          {/* Stats & Number */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-12 bg-neutral-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-neutral-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-full bg-neutral-200 rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-neutral-200 rounded animate-pulse" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 bg-neutral-200 rounded-xl animate-pulse" />
            <div className="h-12 flex-1 bg-neutral-200 rounded-xl animate-pulse" />
            <div className="h-12 w-12 bg-neutral-200 rounded-xl animate-pulse" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-neutral-200 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-neutral-200 rounded animate-pulse" />
          </div>

          {/* Pricing Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-neutral-200 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-neutral-200 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Specifications Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200">
              <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="p-5 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            {/* Tags Skeleton */}
            <div className="px-5 pb-5">
              <div className="h-3 w-12 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-neutral-200 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Content Skeleton */}
      <div className="mt-16 space-y-8">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[4/3] bg-neutral-200 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-neutral-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ContentDetailProps {
  content: UnifiedContent & {
    images?: (string | { url: string })[];
    codeSnippets?: Record<string, string>; // Mendukung struktur JSON dinamis
  };
  prevItem?: UnifiedContent | null;
  nextItem?: UnifiedContent | null;
  relevantContent: UnifiedContent[];
  popularContent: UnifiedContent[];
  userTier: string;
  type: string;
  assetId: string;
}

export default function ContentDetailClient({
  content,
  prevItem,
  nextItem,
  relevantContent,
  popularContent,
  userTier,
  type,
  assetId,
}: ContentDetailProps) {
  // --- STATE ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // --- HOOKS ---
  const { visitorId, isLoading: isFpLoading } = useFingerprint();
  const { copy } = UseCopyToClipboard();

  // --- LOGIC ---
  // Lock: content tier is 'pro' and user is 'free'
  const isLocked = content.tier === 'pro' && userTier === 'free';
  const canDownload = !isLocked;

  // Cek apakah ada snippets. Type 'component' wajib punya snippets.
  const showCodeSnippet = content.type === 'component' && content.codeSnippets;

  // Can view code: user is 'pro' OR content is 'free'
  const canViewCode = userTier === 'pro' || content.tier === 'free';

  // --- IMAGE LOGIC ---
  const validImages = useMemo(() => {
    if (content.images && content.images.length > 0) {
      return content.images
        .map((img) => getSafeImageUrl(img))
        .filter((url): url is string => url !== null);
    }
    const single = getSafeImageUrl(content.imageUrl);
    return single ? [single] : [];
  }, [content.images, content.imageUrl]);

  const mainImage = validImages[0];
  const galleryImages = validImages.slice(1);
  const hasMultipleImages = validImages.length > 1;

  // --- CODE FILES LOGIC (PERBAIKAN UTAMA DI SINI) ---
  const codeFiles: CodeFile[] = useMemo(() => {
    if (!content.codeSnippets) return [];

    // Prioritas urutan tab
    const priorityOrder = [
      'react',
      'vue',
      'angular',
      'html',
      'css',
      'js',
      'ts',
    ];

    // Ambil keys yang ada di snippet
    const keys = Object.keys(content.codeSnippets);

    // Sort keys berdasarkan prioritas
    keys.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a);
      const idxB = priorityOrder.indexOf(b);
      // Jika key tidak ada di priorityOrder, taruh di belakang
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return keys.map((key) => {
      const code = content.codeSnippets![key];
      let fileName = '';
      let lang = '';

      // Mapping cerdas berdasarkan Key JSON
      switch (key.toLowerCase()) {
        case 'react':
          fileName = 'Component.tsx';
          lang = 'tsx';
          break;
        case 'vue':
          fileName = 'App.vue';
          lang = 'vue';
          break;
        case 'angular':
          fileName = 'app.component.ts';
          lang = 'typescript'; // Shiki biasanya pakai 'ts' atau 'typescript'
          break;
        case 'html':
          fileName = 'index.html';
          lang = 'html';
          break;
        case 'css':
          fileName = 'styles.css';
          lang = 'css';
          break;
        case 'js':
        case 'javascript':
          fileName = 'script.js';
          lang = 'javascript';
          break;
        case 'ts':
        case 'typescript':
          fileName = 'utils.ts';
          lang = 'typescript';
          break;
        default:
          fileName = `${key}.txt`;
          lang = 'text';
      }

      return {
        fileName,
        code,
        lang,
      };
    });
  }, [content.codeSnippets]);

  // --- HANDLERS ---
  const handleCopyCode = async () => {
    if (isFpLoading) {
      toast.info('Initializing security check...');
      return;
    }
    setIsProcessing(true);
    try {
      const limitCheck = await checkDownloadLimit(
        'copy',
        assetId,
        type,
        visitorId,
      );
      if (!limitCheck.success) {
        toast.error(limitCheck.message);
        return;
      }

      // Copy code dari tab pertama (biasanya React)
      const codeToCopy = codeFiles[0]?.code;

      if (!codeToCopy) {
        toast.error('No code available to copy');
        return;
      }
      await incrementAssetStats(content.id, content.type, 'copy');
      copy(codeToCopy, 'Code copied to clipboard!');
      if (limitCheck.remaining !== undefined) {
        toast.success(`Remaining free copies: ${limitCheck.remaining}`);
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadFile = async () => {
    if (isFpLoading) {
      toast.info('Initializing security check...');
      return;
    }
    setIsProcessing(true);
    try {
      const limitCheck = await checkDownloadLimit(
        'download',
        assetId,
        type,
        visitorId,
      );
      if (!limitCheck.success) {
        toast.error(limitCheck.message);
        return;
      }
      if (content.linkDownload) {
        await incrementAssetStats(content.id, content.type, 'download');
        window.open(content.linkDownload, '_blank');
        if (limitCheck.remaining !== undefined) {
          toast.success(`Download started. Remaining: ${limitCheck.remaining}`);
        }
      } else {
        toast.error('Download link not available');
      }
    } catch (error) {
      toast.error('Failed to process download.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenPreview = (src: string) => {
    setPreviewImageSrc(src);
    setIsImageModalOpen(true);
  };

  const slugString =
    typeof content.slug === 'string'
      ? content.slug
      : content.slug?.current || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-[1280px] mx-auto p-4 md:p-8 relative min-h-screen font-sans"
    >
      {/* --- TOP NAVIGATION --- */}
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/assets"
          className="bg-white px-4 py-2 rounded-full border border-[#D3D3D3] shadow-sm flex items-center gap-2 text-sm font-semibold hover:bg-neutral-100 transition text-neutral-700"
        >
          <ArrowLeft size={16} /> Back to Browse
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative items-start">
        {/* --- LEFT COLUMN: MEDIA & CODE --- */}
        <div className="w-full lg:w-[65%] relative">
          <div
            className={
              ['template', 'design'].includes(content.type)
                ? 'flex flex-col gap-6'
                : 'sticky top-8 flex flex-col gap-6'
            }
          >
            {/* 1. MAIN IMAGE */}
            {mainImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="relative w-full bg-white rounded-3xl overflow-hidden border border-[#D3D3D3] shadow-xl shadow-neutral-100 group"
              >
                <div
                  className={`relative w-full ${content.type === 'template' ? 'aspect-2/3' : 'aspect-4/3'
                    }`}
                >
                  <Image
                    src={mainImage}
                    alt={`${content.title} - Main Preview`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
                <AssetTypeBadge type={content.type} />
                <div className="absolute bottom-4 right-4 z-20">
                  <button
                    onClick={() => handleOpenPreview(mainImage)}
                    className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-lg border border-white/10 active:scale-95 transition-transform hover:bg-black"
                  >
                    <Maximize2 size={16} />
                    <span className="text-xs font-bold hidden sm:inline">
                      Zoom
                    </span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div
                className={`relative w-full ${content.type === 'template' ? 'aspect-2/4' : ' aspect-3-4'
                  } bg-white rounded-3xl overflow-hidden border border-[#D3D3D3] shadow-xl flex items-center justify-center text-neutral-400 gap-2`}
              >
                <ImageIcon size={32} className="opacity-50" />
                <span className="text-xs font-medium">
                  No Preview Available
                </span>
              </div>
            )}

            {/* 2. GALLERY IMAGES */}
            {hasMultipleImages && (
              <div className="flex flex-col gap-0 lg:gap-6">
                {galleryImages.map((src, index) => (
                  <motion.div
                    key={`${index}-${src}`}
                    initial={false}
                    animate={{
                      height: isExpanded ? 'auto' : 0,
                      opacity: isExpanded ? 1 : 0,
                      marginTop: isExpanded ? '1.5rem' : 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.04, 0.62, 0.23, 0.98],
                    }}
                    className="relative w-full bg-white rounded-3xl overflow-hidden border border-[#D3D3D3] shadow-xl shadow-neutral-100 group lg:!h-auto lg:!opacity-100 lg:!mt-0 lg:block"
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      className={`relative w-full ${content.type === 'template'
                        ? 'aspect-2/3'
                        : 'aspect-4/3'
                        }`}
                    >
                      <Image
                        src={src}
                        alt={`${content.title} - Preview ${index + 2}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute bottom-4 right-4 z-20">
                      <button
                        onClick={() => handleOpenPreview(src)}
                        className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-full shadow-lg border border-white/10 active:scale-95 transition-transform hover:bg-black"
                      >
                        <Maximize2 size={16} />
                        <span className="text-xs font-bold hidden sm:inline">
                          Zoom
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 3. MOBILE TOGGLE */}
            {hasMultipleImages && (
              <motion.div
                layout
                className="flex items-center justify-between mt-2 lg:hidden"
              >
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-[#D3D3D3] rounded-xl text-sm font-bold text-neutral-800 shadow-sm hover:bg-neutral-50 active:scale-95 transition-all w-full mr-4 justify-center"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={16} /> Less Preview
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} /> Full Preview
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 bg-neutral-100 border border-[#D3D3D3] px-4 py-3 rounded-xl text-neutral-600 font-bold text-sm whitespace-nowrap">
                  <LucideImage size={16} className="text-neutral-400" />
                  <span>+{galleryImages.length} Photos</span>
                </div>
              </motion.div>
            )}

            {/* --- CODE SNIPPET SECTION (TABS) --- */}
            {showCodeSnippet && (
              <div className="w-full mt-6 lg:mt-0">
                {canViewCode ? (
                  <CodeGroup
                    files={codeFiles}
                    editorProps={{
                      // Kalkulasi durasi animasi typing berdasarkan panjang kode file pertama
                      duration: codeFiles[0]
                        ? calculateDuration(codeFiles[0].code)
                        : 3,
                    }}
                    className="w-full min-h-[400px] border-[#D3D3D3] shadow-sm"
                  />
                ) : (
                  // LOCKED STATE UI
                  <div className="w-full bg-white rounded-2xl border border-[#D3D3D3] overflow-hidden shadow-sm relative">
                    <div className="px-4 py-3 border-b border-[#D3D3D3] flex items-center justify-between bg-neutral-50/50">
                      <div className="flex items-center gap-2">
                        <Code size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-neutral-800">
                          Source Code
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                        LOCKED
                      </span>
                    </div>
                    <div className="relative min-h-[200px] bg-[#0d1117] p-4 font-mono text-xs text-neutral-300 overflow-hidden select-none">
                      <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-6 text-center">
                        <div className="p-3 bg-white/5 rounded-full mb-4 border border-white/10">
                          <Lock size={24} className="text-neutral-400" />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">
                          Pro Access Required
                        </h4>
                        <p className="text-neutral-400 font-medium mb-6 text-sm max-w-xs">
                          Unlock the full source code (React, Vue, Angular,
                          HTML) and speed up your workflow.
                        </p>
                        <Link
                          href="/pricing"
                          className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-neutral-200 transition shadow-lg shadow-white/10 active:scale-95"
                        >
                          Upgrade to Pro
                        </Link>
                      </div>
                      <div className="opacity-30 blur-[2px]">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-4 w-full bg-neutral-700/50 rounded mb-2"
                            style={{ width: `${Math.random() * 60 + 30}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: INFO --- */}
        <div className="w-full lg:w-[35%] pt-2 sticky top-8 h-fit">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 text-center items-center justify-center flex rounded bg-neutral-200 text-neutral-600 text-[14px] font-bold uppercase tracking-wider">
                  #{content.number}
                </span>
                <div className="flex flex-wrap gap-6">
                  <StatItem
                    icon={<Eye size={14} />}
                    value={content.viewCount}
                    label="views"
                  />
                  {content.type !== 'component' && (
                    <StatItem
                      icon={<Download size={14} />}
                      value={content.downloadCount}
                      label="downloads"
                    />
                  )}
                  {content.type === 'component' && (
                    <StatItem
                      icon={<Copy size={14} />}
                      value={content.copyCount}
                      label="copies"
                    />
                  )}
                </div>
              </div>

              <h1 className="text-neutral-900 text-4xl lg:text-2xl font-bold tracking-tight leading-[1.1]">
                {content.title}
              </h1>

              {/* BUTTONS ACTION */}
              {canDownload ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={
                      prevItem ? getAssetPath(prevItem.type, prevItem.id) : '#'
                    }
                    className={`w-[12%] py-3.5 rounded-xl bg-white border border-[#D3D3D3] flex items-center justify-center transition ${prevItem
                      ? 'hover:bg-neutral-100 text-neutral-700 shadow-sm'
                      : 'opacity-50 cursor-not-allowed text-neutral-300 pointer-events-none'
                      }`}
                    aria-disabled={!prevItem}
                  >
                    <ChevronLeft size={18} />
                  </Link>

                  <button
                    onClick={
                      content.type === 'component'
                        ? handleCopyCode
                        : handleDownloadFile
                    }
                    disabled={isProcessing || isFpLoading}
                    className="w-full py-3.5 bg-neutral-900 hover:bg-black disabled:bg-neutral-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-neutral-400/20 active:scale-95"
                  >
                    {isProcessing || isFpLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : content.type === 'component' ? (
                      <Copy size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                    {isProcessing
                      ? 'Processing...'
                      : content.type === 'component'
                        ? 'Copy Code'
                        : 'Download File'}
                  </button>

                  <Link
                    href={
                      nextItem ? getAssetPath(nextItem.type, nextItem.id) : '#'
                    }
                    className={`w-[12%] py-3.5 rounded-xl bg-white border border-[#D3D3D3] flex items-center justify-center transition ${nextItem
                      ? 'hover:bg-neutral-100 text-neutral-700 shadow-sm'
                      : 'opacity-50 cursor-not-allowed text-neutral-300 pointer-events-none'
                      }`}
                    aria-disabled={!nextItem}
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="flex h-fit gap-2 justify-between items-center">
                  <Link
                    href={
                      prevItem ? getAssetPath(prevItem.type, prevItem.id) : '#'
                    }
                    className={`w-[12%] py-3.5 rounded-xl bg-white border border-[#D3D3D3] flex items-center justify-center transition ${prevItem
                      ? 'hover:bg-neutral-100 text-neutral-700 shadow-sm'
                      : 'opacity-50 cursor-not-allowed text-neutral-300 pointer-events-none'
                      }`}
                    aria-disabled={!prevItem}
                  >
                    <ChevronLeft size={18} />
                  </Link>
                  <Link
                    href="/pricing"
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200 active:scale-95"
                  >
                    <Lock size={16} /> Unlock Access
                  </Link>
                  <Link
                    href={
                      nextItem ? getAssetPath(nextItem.type, nextItem.id) : '#'
                    }
                    className={`w-[12%] py-3.5 rounded-xl bg-white border border-[#D3D3D3] flex items-center justify-center transition ${nextItem
                      ? 'hover:bg-neutral-100 text-neutral-700 shadow-sm'
                      : 'opacity-50 cursor-not-allowed text-neutral-300 pointer-events-none'
                      }`}
                    aria-disabled={!nextItem}
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              )}

              <div className="relative">
                {content.description ? (
                  <div
                    className="prose prose-neutral prose-sm text-neutral-500 max-w-none break-words overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: content.description }}
                  />
                ) : (
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    Elevate your project with this premium asset. Fully
                    responsive, accessible, and easy to integrate.
                  </p>
                )}
              </div>
            </div>

            {/* ACTION BOX & SPECS */}
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                    Pricing
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[28px] md:text-[30px] font-bold text-neutral-900">
                      {content.tier === 'free' ? 'Free' : '$69'}
                    </span>
                    {content.tier !== 'free' && (
                      <span className="text-xs text-neutral-500 font-medium bg-neutral-100 px-2 py-0.5 rounded-full">
                        One-time
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <TierBadge tier={content.tier} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {content.linkTemplate && (
                  <a
                    href={content.linkTemplate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-neutral-200"
                  >
                    Buy License{' '}
                    <ExternalLink size={16} className="opacity-50" />
                  </a>
                )}
                {content.urlPreview && (
                  <a
                    href={content.urlPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-white border border-[#D3D3D3] hover:bg-neutral-50 text-neutral-800 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <Globe size={18} className="text-blue-600" /> Live Preview
                  </a>
                )}
              </div>
              <p className="text-center text-[10px] text-neutral-400 pt-2">
                Secure payment processed by LemonSqueezy. 30-day refund policy.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#D3D3D3] overflow-hidden">
              <div className="px-5 py-3 bg-neutral-50/50 border-b border-[#D3D3D3]">
                <h3 className="text-sm font-bold text-neutral-800">
                  Specifications
                </h3>
              </div>
              {/* Responsive Table */}
              <div className="divide-y divide-neutral-100">
                <SpecRow label="Category" value={content.category?.name} />
                <SpecRow label="Author" value="MoonUI Design" />
                <SpecRow label="Size" value={content.size} />
                <SpecRow label="Format" value={content.format} />
              </div>
              {/* Tags Section */}
              {Array.isArray(content.slug) && content.slug.length > 0 && (
                <div className="px-5 py-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {(content.slug as string[]).map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED CONTENT - Only show if has data */}
      {(relevantContent.length > 0 || popularContent.length > 0) && (
        <>
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-16" />

          <div className="flex flex-col gap-16 pb-16">
            {/* More Like This - Only show if has data */}
            {relevantContent.length > 0 && (
              <div>
                <h2 className="text-neutral-900 text-2xl md:text-3xl font-bold tracking-tight mb-6 px-2">
                  More like this
                </h2>
                {/* Mobile: Horizontal Scroll Carousel */}
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide sm:hidden -mx-4 px-4">
                  {relevantContent.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-[280px] snap-start">
                      <CardItem item={item} />
                    </div>
                  ))}
                </div>
                {/* Desktop: Grid */}
                <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {relevantContent.map((item) => (
                    <CardItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Most Popular - Only show if has data */}
            {popularContent.length > 0 && (
              <div className={relevantContent.length > 0 ? 'pt-12 border-t border-[#D3D3D3]' : ''}>
                <h2 className="text-neutral-900 text-2xl md:text-3xl font-bold tracking-tight mb-6 px-2">
                  Most Popular
                </h2>
                {/* Mobile: Horizontal Scroll Carousel */}
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide sm:hidden -mx-4 px-4">
                  {popularContent.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-[280px] snap-start">
                      <CardItem type="" item={item} isPopular />
                    </div>
                  ))}
                </div>
                {/* Desktop: Grid */}
                <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {popularContent.map((item) => (
                    <CardItem type="" key={item.id} item={item} isPopular />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL - Image Preview */}
      {isImageModalOpen && previewImageSrc && (
        <>
          {/* Prevent body scroll when modal is open */}
          <style jsx global>{`
            body {
              overflow: hidden !important;
              touch-action: none !important;
            }
          `}</style>
          <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm overscroll-none touch-none"
            onClick={() => setIsImageModalOpen(false)}
          >
            {/* Close Button - More prominent on mobile */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[101] text-white p-3 sm:p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors active:scale-95"
              aria-label="Close preview"
            >
              <X size={28} className="sm:w-6 sm:h-6" />
            </button>

            {/* Tap anywhere hint - Mobile only */}
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs sm:text-sm font-medium pointer-events-none">
              Tap anywhere to close
            </p>

            {/* Image Container */}
            <div
              className="relative w-full h-full max-w-6xl max-h-[85vh] sm:max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={previewImageSrc}
                alt="Full Preview"
                fill
                className="object-contain"
                quality={100}
                priority
              />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// --- SUB COMPONENTS ---

function AssetTypeBadge({ type }: { type: string }) {
  const config = {
    component: { icon: Code, color: 'text-blue-500' },
    template: { icon: Layers, color: 'text-purple-500' },
    design: { icon: Monitor, color: 'text-orange-500' },
    default: { icon: Box, color: 'text-gray-500' },
  };
  const { icon: Icon, color } =
    config[type as keyof typeof config] || config.default;
  return (
    <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-neutral-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-[#D3D3D3] flex items-center gap-2 uppercase tracking-wider z-10">
      <Icon size={14} className={color} /> {type}
    </div>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-neutral-600 font-medium">
      <div className="p-1.5 bg-white rounded-md border border-[#D3D3D3] shadow-sm text-neutral-400">
        {icon}
      </div>
      <span className="text-sm">
        {value?.toLocaleString() || 0}{' '}
        <span className="text-neutral-400 font-normal text-xs">{label}</span>
      </span>
    </div>
  );
}

function SpecItem({
  icon,
  label,
  value,
  monospace,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  monospace?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium uppercase tracking-wider">
        {icon} {label}
      </div>
      <p
        className={`text-sm ${monospace
          ? 'font-mono text-neutral-600 truncate'
          : 'font-semibold text-neutral-800 capitalize'
          }`}
        title={value || ''}
      >
        {value || 'N/A'}
      </p>
    </div>
  );
}

// --- Responsive Table Row Component ---
function SpecRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50/50 transition-colors">
      <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-neutral-800 capitalize text-right">
        {value || 'N/A'}
      </span>
    </div>
  );
}

function TierBadge({ tier }: { tier?: string | null }) {
  if (tier === 'pro') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md shadow-indigo-200">
        <Check size={12} strokeWidth={3} /> Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
      Free License
    </span>
  );
}

function CardItem({
  item,
  isPopular,
  type,
}: {
  item: UnifiedContent;
  isPopular?: boolean;
  type?: string;
}) {
  const safeImg = getSafeImageUrl(item.imageUrl);
  return (
    <Link
      href={getAssetPath(item.type, item.id)}
      className="flex flex-col gap-4 group"
    >
      <div
        className={`relative w-full bg-white rounded-2xl overflow-hidden border ${type === 'templates' ? ' aspect-2/3' : ' aspect-4/3'
          } border-[#D3D3D3] shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition duration-500 ease-out`}
      >
        {safeImg ? (
          <Image
            src={safeImg}
            alt={item.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm bg-neutral-50 gap-2">
            <ImageIcon size={20} /> Preview
          </div>
        )}
        {isPopular && (
          <div className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>{' '}
            HOT
          </div>
        )}
      </div>
      <div className="flex justify-between items-start px-1">
        <div className="space-y-1 overflow-hidden">
          <h4 className="text-neutral-900 text-sm font-bold group-hover:text-blue-600 transition leading-tight truncate">
            {item.title}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-medium px-1.5 py-0.5 bg-neutral-100 rounded">
              #{item.number}
            </span>
            <p className="text-[10px] text-neutral-400 truncate">
              {item.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
        <TierBadge tier={item.tier} />
      </div>
    </Link>
  );
}
