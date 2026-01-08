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
import { useFingerprint } from '@/hooks/use-fingerprint';
import { checkDownloadLimit } from '@/server-action/limit';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

// Import komponen CodeGroup (Tabs) yang sudah dibuat

// --- HELPER: SAFE URL PARSER ---
const getSafeImageUrl = (src: string | { url: string } | null | undefined): string | null => {
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
    <div className="mx-auto min-h-screen w-full max-w-[1280px] p-4 md:p-8">
      {/* Top Navigation Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="h-10 w-32 animate-pulse rounded-full bg-neutral-200" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Left Column - Image */}
        <div className="flex w-full flex-col gap-6 lg:w-[65%]">
          <div className="aspect-[4/3] w-full animate-pulse rounded-3xl bg-neutral-200" />
          {/* Gallery Thumbnails */}
          <div className="hidden grid-cols-3 gap-4 lg:grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-video animate-pulse rounded-xl bg-neutral-200" />
            ))}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="w-full space-y-6 lg:w-[35%]">
          {/* Stats & Number */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-12 animate-pulse rounded bg-neutral-200" />
            <div className="h-5 w-20 animate-pulse rounded bg-neutral-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-neutral-200" />
            <div className="h-12 flex-1 animate-pulse rounded-xl bg-neutral-200" />
            <div className="h-12 w-12 animate-pulse rounded-xl bg-neutral-200" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200" />
          </div>

          {/* Pricing Section */}
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
                <div className="h-8 w-20 animate-pulse rounded bg-neutral-200" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" />
            </div>
          </div>

          {/* Specifications Table */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
            </div>
            <div className="space-y-4 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
                </div>
              ))}
            </div>
            {/* Tags Skeleton */}
            <div className="px-5 pb-5">
              <div className="mb-2 h-3 w-12 animate-pulse rounded bg-neutral-200" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-neutral-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Content Skeleton */}
      <div className="mt-16 space-y-8">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-neutral-200" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
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

  // --- REFS ---

  // --- HOOKS ---
  const { visitorId, isLoading: isFpLoading } = useFingerprint();

  // --- LOGIC ---
  // Lock: content tier is 'pro' and user is 'free'
  const isLocked = content.tier === 'pro' && userTier === 'free';
  const canDownload = !isLocked;
  const router = useRouter();
  // // Cek apakah ada snippets. Type 'component' wajib punya snippets.
  // const showCodeSnippet = content.type === 'component' && content.codeSnippets;

  // // Can view code: user is 'pro' OR content is 'free'
  // const canViewCode = userTier === 'pro' || content.tier === 'free';

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
  // const codeFiles: CodeFile[] = useMemo(() => {
  //   if (!content.codeSnippets) return [];

  //   // Prioritas urutan tab
  //   const priorityOrder = ['react', 'vue', 'angular', 'html', 'css', 'js', 'ts'];

  //   // Ambil keys yang ada di snippet
  //   const keys = Object.keys(content.codeSnippets);

  //   // Sort keys berdasarkan prioritas
  //   keys.sort((a, b) => {
  //     const idxA = priorityOrder.indexOf(a);
  //     const idxB = priorityOrder.indexOf(b);
  //     // Jika key tidak ada di priorityOrder, taruh di belakang
  //     return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  //   });

  //   return keys.map((key) => {
  //     const code = content.codeSnippets![key];
  //     let fileName = '';
  //     let lang = '';

  //     // Mapping cerdas berdasarkan Key JSON
  //     switch (key.toLowerCase()) {
  //       case 'react':
  //         fileName = 'Component.tsx';
  //         lang = 'tsx';
  //         break;
  //       case 'vue':
  //         fileName = 'App.vue';
  //         lang = 'vue';
  //         break;
  //       case 'angular':
  //         fileName = 'app.component.ts';
  //         lang = 'typescript'; // Shiki biasanya pakai 'ts' atau 'typescript'
  //         break;
  //       case 'html':
  //         fileName = 'index.html';
  //         lang = 'html';
  //         break;
  //       case 'css':
  //         fileName = 'styles.css';
  //         lang = 'css';
  //         break;
  //       case 'js':
  //       case 'javascript':
  //         fileName = 'script.js';
  //         lang = 'javascript';
  //         break;
  //       case 'ts':
  //       case 'typescript':
  //         fileName = 'utils.ts';
  //         lang = 'typescript';
  //         break;
  //       default:
  //         fileName = `${key}.txt`;
  //         lang = 'text';
  //     }

  //     return {
  //       fileName,
  //       code,
  //       lang,
  //     };
  //   });
  // }, [content.codeSnippets]);

  // --- HANDLERS ---
  // --- HANDLERS ---
  // const handleCopyCode = async () => {
  //   if (isFpLoading) {
  //     toast.info('Initializing security check...');
  //     return;
  //   }
  //   setIsProcessing(true);
  //   try {
  //     const limitCheck = await checkDownloadLimit('copy', assetId, type, visitorId);
  //     if (!limitCheck.success) {
  //       toast.error(limitCheck.message);
  //       return;
  //     }

  //     // Copy code dari tab pertama (biasanya React)
  //     const codeToCopy = codeFiles[0]?.code;

  //     if (!codeToCopy) {
  //       toast.error('No code available to copy');
  //       return;
  //     }
  //     await incrementAssetStats(content.id, content.type, 'copy');
  //     copy(codeToCopy, 'Code copied to clipboard!');
  //     if (limitCheck.remaining !== undefined) {
  //       toast.success(`Remaining free copies: ${limitCheck.remaining}`);
  //     }
  //   } catch (error) {
  //     toast.error('Something went wrong.');
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const handleDownloadFile = async () => {
    if (isFpLoading) {
      toast.info('Initializing security check...');
      return;
    }
    setIsProcessing(true);
    try {
      const limitCheck = await checkDownloadLimit('download', assetId, type, visitorId);
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

  const handleCopy = async () => {
    if (isFpLoading) {
      toast.info('Initializing security check...');
      return;
    }

    const htmlContent = content.copyDataHtml;
    const plainContent = content.copyDataPlain;

    if (!htmlContent && !plainContent) {
      toast.error('No content to copy');
      return;
    }

    setIsProcessing(true);
    try {
      const limitCheck = await checkDownloadLimit('copy', assetId, type, visitorId);
      if (!limitCheck.success) {
        if (limitCheck.requiresLogin) router.push('/signin');
        else if (limitCheck.requiresUpgrade) router.push('/pricing');
        else toast.error(limitCheck.message);
        return;
      }

      // Use Clipboard API to write both HTML and plain text
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const clipboardItems: Record<string, Blob> = {};

        if (htmlContent) {
          clipboardItems['text/html'] = new Blob([htmlContent], { type: 'text/html' });
        }
        if (plainContent) {
          clipboardItems['text/plain'] = new Blob([plainContent], { type: 'text/plain' });
        }

        await navigator.clipboard.write([new ClipboardItem(clipboardItems)]);
      } else {
        // Fallback for browsers that don't support ClipboardItem
        await navigator.clipboard.writeText(plainContent || htmlContent || '');
      }

      await incrementAssetStats(content.id, content.type, 'copy');
      toast.success('Component copied to clipboard!');

      if (limitCheck.remaining !== undefined) {
        toast.info(`Remaining free copies: ${limitCheck.remaining}`);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  // const slugString =
  //   typeof content.slug === 'string' ? content.slug : content.slug?.current || 'N/A';

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[1280px] p-4 font-sans md:p-8">
      {/* --- TOP NAVIGATION --- */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/assets"
          className="flex items-center gap-2 rounded-full border border-[#D3D3D3] bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-100"
        >
          <ArrowLeft size={16} /> Back to Browse
        </Link>
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row">
        {/* --- LEFT COLUMN: MEDIA & CODE --- */}
        <div className="relative w-full lg:w-[65%]">
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
                transition={{ duration: 0.3 }}
                className="group relative w-full overflow-hidden rounded-3xl border border-[#D3D3D3] bg-white shadow-xl shadow-neutral-100"
              >
                <div
                  className={`relative w-full ${
                    content.type === 'template' ? 'aspect-2/3' : 'aspect-4/3'
                  }`}
                >
                  <Image
                    src={mainImage}
                    alt={`${content.title} - Main Preview`}
                    fill
                    className="object-cover transition-transform duration-700"
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 65vw, 832px"
                  />
                </div>
                <AssetTypeBadge type={content.type} />
                <div className="absolute right-4 bottom-4 z-20">
                  <button
                    onClick={() => handleOpenPreview(mainImage)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/90 px-4 py-2.5 text-white shadow-lg backdrop-blur-md transition-transform hover:bg-black"
                  >
                    <Maximize2 size={16} />
                    <span className="hidden text-xs font-bold sm:inline">Zoom</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div
                className={`relative w-full ${
                  content.type === 'template' ? 'aspect-2/4' : 'aspect-3-4'
                } flex items-center justify-center gap-2 overflow-hidden rounded-3xl border border-[#D3D3D3] bg-white text-neutral-400 shadow-xl`}
              >
                <ImageIcon size={32} className="opacity-50" />
                <span className="text-xs font-medium">No Preview Available</span>
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
                    className="group relative w-full overflow-hidden rounded-3xl border border-[#D3D3D3] bg-white shadow-xl shadow-neutral-100 lg:!mt-0 lg:block lg:!h-auto lg:!opacity-100"
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      className={`relative w-full ${
                        content.type === 'template' ? 'aspect-2/3' : 'aspect-4/3'
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${content.title} - Preview ${index + 2}`}
                        fill
                        className="object-cover transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute right-4 bottom-4 z-20">
                      <button
                        onClick={() => handleOpenPreview(src)}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/90 px-4 py-2.5 text-white shadow-lg backdrop-blur-md transition-transform hover:bg-black"
                      >
                        <Maximize2 size={16} />
                        <span className="hidden text-xs font-bold sm:inline">Zoom</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* 3. MOBILE TOGGLE */}
            {hasMultipleImages && (
              <motion.div layout className="mt-2 flex items-center justify-between lg:hidden">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mr-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D3D3D3] bg-white px-6 py-3 text-sm font-bold text-neutral-800 shadow-sm transition-all hover:bg-neutral-50"
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
                <div className="flex items-center gap-2 rounded-xl border border-[#D3D3D3] bg-neutral-100 px-4 py-3 text-sm font-bold whitespace-nowrap text-neutral-600">
                  <LucideImage size={16} className="text-neutral-400" />
                  <span>+{galleryImages.length} Photos</span>
                </div>
              </motion.div>
            )}

            {/* --- CODE SNIPPET SECTION (TABS) --- */}
            {/* {showCodeSnippet && (
              <div className="mt-6 w-full lg:mt-0">
                {canViewCode ? (
                  <CodeGroup
                    files={codeFiles}
                    editorProps={{
                      // Kalkulasi durasi animasi typing berdasarkan panjang kode file pertama
                      duration: codeFiles[0] ? calculateDuration(codeFiles[0].code) : 3,
                    }}
                    className="min-h-[400px] w-full border-[#D3D3D3] shadow-sm"
                  />
                ) : (
                  // LOCKED STATE UI
                  <div className="relative w-full overflow-hidden rounded-2xl border border-[#D3D3D3] bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#D3D3D3] bg-neutral-50/50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Code size={16} className="text-blue-600" />
                        <span className="text-sm font-semibold text-neutral-800">Source Code</span>
                      </div>
                      <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        LOCKED
                      </span>
                    </div>
                    <div className="relative min-h-[200px] overflow-hidden bg-[#0d1117] p-4 font-mono text-xs text-neutral-300 select-none">
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d1117]/80 p-6 text-center backdrop-blur-[4px]">
                        <div className="mb-4 rounded-full border border-white/10 bg-white/5 p-3">
                          <Lock size={24} className="text-neutral-400" />
                        </div>
                        <h4 className="mb-2 text-lg font-bold text-white">Pro Access Required</h4>
                        <p className="mb-6 max-w-xs text-sm font-medium text-neutral-400">
                          Unlock the full source code (React, Vue, Angular, HTML) and speed up your
                          workflow.
                        </p>
                        <Link
                          href="/pricing"
                          className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-black shadow-lg shadow-white/10 transition hover:bg-neutral-200"
                        >
                          Upgrade to Pro
                        </Link>
                      </div>
                      <div className="opacity-30 blur-[2px]">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="mb-2 h-4 w-full rounded bg-neutral-700/50"
                            style={{ width: `${Math.random() * 60 + 30}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>

        {/* --- RIGHT COLUMN: INFO --- */}
        <div className="relative w-full lg:w-[35%]">
          <div
            className={`sticky top-24 flex w-full flex-col gap-8 self-start lg:max-h-[calc(100vh-120px)] lg:w-[calc(1280px*0.35-3rem)] lg:overflow-y-auto`}
          >
            <div className="space-y-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center rounded bg-neutral-200 px-2 py-0.5 text-center text-[14px] font-bold tracking-wider text-neutral-600 uppercase">
                  #{content.number}
                </span>
                <div className="flex flex-wrap gap-6">
                  <StatItem icon={<Eye size={14} />} value={content.viewCount} label="views" />
                  {content.type !== 'component' && (
                    <StatItem
                      icon={<Download size={14} />}
                      value={content.downloadCount}
                      label="downloads"
                    />
                  )}
                  {content.type === 'component' && (
                    <StatItem icon={<Copy size={14} />} value={content.copyCount} label="copies" />
                  )}
                </div>
              </div>

              <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-neutral-900 lg:text-2xl">
                {content.title}
              </h1>

              {/* BUTTONS ACTION */}
              {canDownload ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={prevItem ? getAssetPath(prevItem.type, prevItem.id) : '#'}
                    className={`flex w-[12%] items-center justify-center rounded-xl border border-[#D3D3D3] bg-white py-3.5 transition ${
                      prevItem
                        ? 'text-neutral-700 shadow-sm hover:bg-neutral-100'
                        : 'pointer-events-none cursor-not-allowed text-neutral-300 opacity-50'
                    }`}
                    aria-disabled={!prevItem}
                    aria-label="Previous asset"
                  >
                    <ChevronLeft size={18} />
                  </Link>

                  <button
                    onClick={content.type === 'component' ? handleCopy : handleDownloadFile}
                    disabled={isProcessing || isFpLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 font-bold text-white shadow-lg shadow-neutral-400/20 transition hover:bg-black disabled:bg-neutral-500"
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
                    href={nextItem ? getAssetPath(nextItem.type, nextItem.id) : '#'}
                    className={`flex w-[12%] items-center justify-center rounded-xl border border-[#D3D3D3] bg-white py-3.5 transition ${
                      nextItem
                        ? 'text-neutral-700 shadow-sm hover:bg-neutral-100'
                        : 'pointer-events-none cursor-not-allowed text-neutral-300 opacity-50'
                    }`}
                    aria-disabled={!nextItem}
                    aria-label="Next asset"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="flex h-fit items-center justify-between gap-2">
                  <Link
                    href={prevItem ? getAssetPath(prevItem.type, prevItem.id) : '#'}
                    className={`flex w-[12%] items-center justify-center rounded-xl border border-[#D3D3D3] bg-white py-3.5 transition ${
                      prevItem
                        ? 'text-neutral-700 shadow-sm hover:bg-neutral-100'
                        : 'pointer-events-none cursor-not-allowed text-neutral-300 opacity-50'
                    }`}
                    aria-disabled={!prevItem}
                    aria-label="Previous asset"
                  >
                    <ChevronLeft size={18} />
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:opacity-90"
                  >
                    <Lock size={16} /> Unlock Access
                  </Link>
                  <Link
                    href={nextItem ? getAssetPath(nextItem.type, nextItem.id) : '#'}
                    className={`flex w-[12%] items-center justify-center rounded-xl border border-[#D3D3D3] bg-white py-3.5 transition ${
                      nextItem
                        ? 'text-neutral-700 shadow-sm hover:bg-neutral-100'
                        : 'pointer-events-none cursor-not-allowed text-neutral-300 opacity-50'
                    }`}
                    aria-disabled={!nextItem}
                    aria-label="Next asset"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              )}

              <div className="relative">
                {content.description ? (
                  <div
                    className="prose prose-neutral prose-sm max-w-none overflow-hidden break-words text-neutral-500"
                    dangerouslySetInnerHTML={{ __html: content.description }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-neutral-500">
                    Elevate your project with this premium asset. Fully responsive, accessible, and
                    easy to integrate.
                  </p>
                )}
              </div>
            </div>

            {/* ACTION BOX & SPECS */}
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    Pricing
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold text-neutral-900 md:text-[30px]">
                      {content.tier === 'free' ? 'Free' : '$69'}
                    </span>
                    {content.tier !== 'free' && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3.5 font-bold text-white shadow-lg shadow-neutral-200 transition hover:bg-neutral-800"
                  >
                    Buy License <ExternalLink size={16} className="opacity-50" />
                  </a>
                )}
                {content.urlPreview && (
                  <a
                    href={content.urlPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D3D3D3] bg-white py-3.5 font-bold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
                  >
                    <Globe size={18} className="text-blue-600" /> Live Preview
                  </a>
                )}
              </div>
              <p className="pt-2 text-center text-[10px] text-neutral-400">
                Secure payment processed by LemonSqueezy. 30-day refund policy.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#D3D3D3] bg-white">
              <div className="border-b border-[#D3D3D3] bg-neutral-50/50 px-5 py-3">
                <p className="text-sm font-bold text-neutral-800">Specifications</p>
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
                <div className="border-t border-neutral-100 px-5 py-4">
                  <p className="mb-3 text-xs font-medium tracking-wider text-neutral-400 uppercase">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(content.slug as string[]).map((tag, i) => (
                      <span
                        key={i}
                        className="cursor-default rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200"
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
          <div className="my-16 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />

          <div className="flex flex-col gap-16 pb-16">
            {/* More Like This - Only show if has data */}
            {relevantContent.length > 0 && (
              <div>
                <h2 className="mb-6 px-2 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
                  More like this
                </h2>
                {/* Mobile: Horizontal Scroll Carousel */}
                <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:hidden">
                  {relevantContent.map((item) => (
                    <div key={item.id} className="w-[280px] flex-shrink-0 snap-start">
                      <CardItem item={item} />
                    </div>
                  ))}
                </div>
                {/* Desktop: Grid */}
                <div className="hidden gap-8 sm:grid sm:grid-cols-2 md:grid-cols-3">
                  {relevantContent.map((item) => (
                    <CardItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Most Popular - Only show if has data */}
            {popularContent.length > 0 && (
              <div className={relevantContent.length > 0 ? 'border-t border-[#D3D3D3] pt-12' : ''}>
                <h2 className="mb-6 px-2 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
                  Most Popular
                </h2>
                {/* Mobile: Horizontal Scroll Carousel */}
                <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:hidden">
                  {popularContent.map((item) => (
                    <div key={item.id} className="s<nap-start w-[280px] flex-shrink-0">
                      <CardItem type="" item={item} isPopular />
                    </div>
                  ))}
                </div>
                {/* Desktop: Grid */}
                <div className="hidden gap-8 sm:grid sm:grid-cols-2 md:grid-cols-3">
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
            className="fixed inset-0 z-[100] flex touch-none items-center justify-center overscroll-none bg-black/95 p-4 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
          >
            {/* Close Button - More prominent on mobile */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-[101] rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/30 sm:top-6 sm:right-6 sm:p-2"
              aria-label="Close preview"
            >
              <X size={28} className="sm:h-6 sm:w-6" />
            </button>

            {/* Tap anywhere hint - Mobile only */}
            <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-white/60 sm:text-sm">
              Tap anywhere to close
            </p>

            {/* Image Container */}
            <div
              className="relative h-full max-h-[85vh] w-full max-w-6xl sm:max-h-[90vh]"
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
    </div>
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
  const { icon: Icon, color } = config[type as keyof typeof config] || config.default;
  return (
    <div className="absolute top-5 left-5 z-10 flex items-center gap-2 rounded-full border border-[#D3D3D3] bg-white/90 px-4 py-1.5 text-xs font-bold tracking-wider text-neutral-900 uppercase shadow-sm backdrop-blur-md">
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
    <div className="flex items-center gap-2 font-medium text-neutral-600">
      <div className="rounded-md border border-[#D3D3D3] bg-white p-1.5 text-neutral-400 shadow-sm">
        {icon}
      </div>
      <span className="text-sm">
        {value?.toLocaleString() || 0}{' '}
        <span className="text-xs font-normal text-neutral-400">{label}</span>
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
      <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-neutral-400 uppercase">
        {icon} {label}
      </div>
      <p
        className={`text-sm ${
          monospace
            ? 'truncate font-mono text-neutral-600'
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
    <div className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-neutral-50/50">
      <span className="text-xs font-medium tracking-wider text-neutral-400 uppercase">{label}</span>
      <span className="text-right text-sm font-semibold text-neutral-800 capitalize">
        {value || 'N/A'}
      </span>
    </div>
  );
}

function TierBadge({ tier }: { tier?: string | null }) {
  if (tier === 'pro') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-md shadow-indigo-200">
        <Check size={12} strokeWidth={3} /> Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
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
    <Link href={getAssetPath(item.type, item.id)} className="group flex flex-col gap-4">
      <div
        className={`relative w-full overflow-hidden rounded-2xl border bg-white ${
          type === 'templates' ? 'aspect-2/3' : 'aspect-4/3'
        } border-[#D3D3D3] shadow-sm transition duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-xl`}
      >
        {safeImg ? (
          <Image
            src={safeImg}
            alt={item.title}
            fill
            className="object-cover transition duration-700"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center gap-2 bg-neutral-50 text-sm text-neutral-400">
            <ImageIcon size={20} /> Preview
          </div>
        )}
        {isPopular && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-md bg-amber-400 px-2 py-1 text-[10px] font-bold text-black shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black"></span> HOT
          </div>
        )}
      </div>
      <div className="flex items-start justify-between px-1">
        <div className="space-y-1 overflow-hidden">
          <p className="truncate text-sm leading-tight font-bold text-neutral-900 transition group-hover:text-blue-600">
            {item.title}
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
              #{item.number}
            </span>
            <p className="truncate text-[10px] text-neutral-400">
              {item.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
        <TierBadge tier={item.tier} />
      </div>
    </Link>
  );
}
