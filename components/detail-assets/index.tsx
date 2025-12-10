'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Download,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  Lock,
  Monitor,
  Globe,
  Code,
  Layers,
  Calendar,
  Tag,
  Hash,
  Box,
  ExternalLink,
} from 'lucide-react';
import { UnifiedContent } from '@/types/assets';

interface ContentDetailProps {
  content: UnifiedContent;
  prevItem?: UnifiedContent | null;
  nextItem?: UnifiedContent | null;
  relevantContent: UnifiedContent[];
  popularContent: UnifiedContent[];
  userTier: string; // 'free' | 'pro' | 'pro_plus'
}

export default function ContentDetailClient({
  content,
  prevItem,
  nextItem,
  relevantContent,
  popularContent,
  userTier,
}: ContentDetailProps) {
  const isLocked = content.tier !== 'free' && userTier === 'free';
  const isProPlusOnly = content.tier === 'pro_plus' && userTier !== 'pro_plus';
  const canDownload = !isLocked && !isProPlusOnly;
  const showCodeSnippet = content.type === 'component' && content.codeSnippets;
  const canViewCode = userTier === 'pro_plus';

  // Helper to safely get slug string
  const slugString =
    typeof content.slug === 'string'
      ? content.slug
      : content.slug?.current || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-[1280px] mx-auto p-4 md:p-8 relative bg-neutral-50 min-h-screen font-sans"
    >
      {/* --- BACK BUTTON & TOP NAVIGATION --- */}
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/assets"
          className="bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-sm flex items-center gap-2 text-sm font-semibold hover:bg-neutral-100 transition text-neutral-700"
        >
          <ArrowLeft size={16} /> Back to Browse
        </Link>

        {/* Top Pagination Controls */}
        <div className="flex items-center gap-2">
          <Link
            href={prevItem ? `/assets/${prevItem.id}` : '#'}
            className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-neutral-200 transition ${
              prevItem
                ? 'hover:bg-neutral-100 text-neutral-700'
                : 'opacity-50 cursor-not-allowed text-neutral-300 pointer-events-none'
            }`}
            aria-disabled={!prevItem}
            title={
              prevItem ? `Previous: ${prevItem.title}` : 'No previous item'
            }
          >
            <ChevronLeft size={18} />
          </Link>
          <span className="text-sm font-medium text-neutral-400 font-mono">
            #{content.number}
          </span>
          <Link
            href={nextItem ? `/assets/${nextItem.id}` : '#'}
            className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-neutral-200 transition ${
              nextItem
                ? 'hover:bg-neutral-100 text-neutral-700'
                : 'opacity-50 cursor-not-allowed text-neutral-300 pointer-events-none'
            }`}
            aria-disabled={!nextItem}
            title={nextItem ? `Next: ${nextItem.title}` : 'No next item'}
          >
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 relative">
        {/* --- LEFT COLUMN: STICKY IMAGES --- */}
        <div className="w-full lg:w-[55%] relative">
          <div className="sticky top-8 flex flex-col gap-6">
            {/* Main Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative w-full aspect-[4/3] bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-xl shadow-neutral-100 group"
            >
              {content.imageUrl ? (
                <Image
                  src={content.imageUrl as string}
                  alt={content.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-100">
                  No Preview Available
                </div>
              )}

              {/* Floating Type Badge */}
              <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-neutral-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-neutral-100 flex items-center gap-2 uppercase tracking-wider">
                {content.type === 'component' && (
                  <Code size={14} className="text-blue-500" />
                )}
                {content.type === 'template' && (
                  <Layers size={14} className="text-purple-500" />
                )}
                {content.type === 'design' && (
                  <Monitor size={14} className="text-orange-500" />
                )}
                {content.type}
              </div>
            </motion.div>

            {/* Code Snippet Section */}
            {showCodeSnippet && (
              <div className="w-full bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-neutral-800">
                      Code Snippet
                    </span>
                  </div>
                  {!canViewCode && (
                    <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full">
                      PRO+ ONLY
                    </span>
                  )}
                </div>

                <div className="relative min-h-[150px] bg-[#0d1117] p-4 font-mono text-xs text-neutral-300 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700">
                  {canViewCode ? (
                    <pre>
                      {content.codeSnippets?.react || '// No code provided'}
                    </pre>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                        <Lock size={24} className="text-neutral-500 mb-3" />
                        <p className="text-neutral-300 font-medium mb-4 text-sm">
                          Unlock source code with Pro Plus
                        </p>
                        <Link
                          href="/pricing"
                          className="px-5 py-2.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition shadow-lg shadow-white/10"
                        >
                          Upgrade Access
                        </Link>
                      </div>
                      <pre className="opacity-20 blur-[1px] select-none">
                        {`import { Button } from '@/components/ui/button';
export default function Component() {
return (
    <div className="p-4">
    <Button>Click Me</Button>
    </div>
)
}`}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: DETAILS & INFO --- */}
        <div className="w-full lg:w-[45%] flex flex-col gap-8 pt-2">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-600 text-[10px] font-bold uppercase tracking-wider">
                #{content.number}
              </span>
              <span className="text-xs font-medium text-neutral-400">
                Updated {new Date().toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-neutral-900 text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              {content.title}
            </h1>

            <p className="text-neutral-500 text-lg leading-relaxed">
              {content.description ||
                'Elevate your project with this premium asset. Fully responsive, accessible, and easy to integrate into your workflow.'}
            </p>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div
                className="flex items-center gap-2 text-neutral-600 font-medium"
                title="All time views"
              >
                <div className="p-1.5 bg-white rounded-md border border-neutral-200 shadow-sm">
                  <Eye size={14} className="text-neutral-400" />
                </div>
                <span className="text-sm">
                  {content.viewCount.toLocaleString()}{' '}
                  <span className="text-neutral-400 font-normal text-xs">
                    views
                  </span>
                </span>
              </div>
              <div
                className="flex items-center gap-2 text-neutral-600 font-medium"
                title="All time downloads"
              >
                <div className="p-1.5 bg-white rounded-md border border-neutral-200 shadow-sm">
                  <Download size={14} className="text-neutral-400" />
                </div>
                <span className="text-sm">
                  {content.downloadCount?.toLocaleString() || 0}{' '}
                  <span className="text-neutral-400 font-normal text-xs">
                    downloads
                  </span>
                </span>
              </div>
              {content.type === 'component' && (
                <div
                  className="flex items-center gap-2 text-neutral-600 font-medium"
                  title="All time copies"
                >
                  <div className="p-1.5 bg-white rounded-md border border-neutral-200 shadow-sm">
                    <Copy size={14} className="text-neutral-400" />
                  </div>
                  <span className="text-sm">
                    {content.copyCount?.toLocaleString() || 0}{' '}
                    <span className="text-neutral-400 font-normal text-xs">
                      copies
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & CTA Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-end justify-between border-b border-neutral-100 pb-4">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">
                  Pricing
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-neutral-900">
                    {content.tier === 'free' ? 'Free' : '$69'}
                  </span>
                  {content.tier !== 'free' && (
                    <span className="text-xs text-neutral-500 font-medium bg-neutral-100 px-2 py-0.5 rounded-full">
                      One-time payment
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {content.tier === 'pro_plus' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-md shadow-indigo-200">
                    <Check size={12} strokeWidth={3} /> Pro Plus
                  </span>
                ) : content.tier === 'pro' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold rounded-full shadow-md">
                    <Check size={12} strokeWidth={3} /> Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    Free License
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* External Buy Link */}
              {content.linkTemplate && (
                <a
                  href={content.linkTemplate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-neutral-200"
                >
                  Buy License <ExternalLink size={16} className="opacity-50" />
                </a>
              )}

              {/* Live Preview Button */}
              {content.urlPreview && (
                <a
                  href={content.urlPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Globe size={18} className="text-blue-600" /> Live Preview
                </a>
              )}

              {/* Download / Copy Action */}
              {canDownload ? (
                <button className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-200">
                  {content.type === 'component' ? (
                    <Copy size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                  {content.type === 'component'
                    ? 'Copy Component Code'
                    : 'Download Source File'}
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200"
                >
                  <Lock size={16} /> Unlock Full Access
                </Link>
              )}
            </div>

            <p className="text-center text-[10px] text-neutral-400">
              Secure payment processed by LemonSqueezy. 30-day refund policy.
            </p>
          </div>

          {/* SPECIFICATIONS GRID */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="px-5 py-3 bg-neutral-50/50 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-800">
                Specifications
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium uppercase tracking-wider">
                  <Tag size={12} /> Category
                </div>
                <p className="text-sm font-semibold text-neutral-800">
                  {content.category?.name || 'Uncategorized'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium uppercase tracking-wider">
                  <Box size={12} /> Platform
                </div>
                <p className="text-sm font-semibold text-neutral-800 capitalize">
                  {content.platform || 'Web'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium uppercase tracking-wider">
                  <Hash size={12} /> Slug
                </div>
                <p
                  className="text-sm font-mono text-neutral-600 truncate"
                  title={slugString}
                >
                  {slugString}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium uppercase tracking-wider">
                  <Calendar size={12} /> Published
                </div>
                <p className="text-sm font-semibold text-neutral-800">
                  Recently
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Pagination */}
          <div className="grid grid-cols-2 gap-4">
            {prevItem ? (
              <Link
                href={`/assets/${prevItem.id}`}
                className="group flex flex-col p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-400 transition text-left shadow-sm hover:shadow-md"
              >
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1 group-hover:text-neutral-600">
                  <ChevronLeft size={10} /> Previous
                </span>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-100">
                    {prevItem.imageUrl && (
                      <Image
                        src={prevItem.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-blue-600 transition">
                      #{prevItem.number} - {prevItem.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                      {prevItem.category?.name}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextItem ? (
              <Link
                href={`/assets/${nextItem.id}`}
                className="group flex flex-col p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-400 transition text-right items-end shadow-sm hover:shadow-md"
              >
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1 group-hover:text-neutral-600">
                  Next <ChevronRight size={10} />
                </span>
                <div className="flex items-center gap-3 flex-row-reverse text-right">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-100">
                    {nextItem.imageUrl && (
                      <Image
                        src={nextItem.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:text-blue-600 transition">
                      #{nextItem.number} - {nextItem.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                      {nextItem.category?.name}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-16"></div>

      {/* --- SECTIONS: RELEVANT & POPULAR --- */}
      <div className="flex flex-col gap-16 pb-16">
        {/* RELEVANT SECTION */}
        <div>
          <div className="mb-8 flex justify-between items-end px-2">
            <div>
              <h2 className="text-neutral-900 text-3xl font-bold tracking-tight">
                More like this
              </h2>
              <p className="text-neutral-500 text-base mt-2">
                Explore top-quality {content.category?.name} related to{' '}
                <span className="font-semibold text-neutral-800">
                  {content.title}
                </span>
                .
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {relevantContent.map((item) => (
              <CardItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* FAVORITE / POPULAR SECTION */}
        <div className="pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-neutral-900 text-3xl font-bold tracking-tight">
                Most Popular
              </h2>
              <p className="text-neutral-500 text-base mt-2">
                Community favorites with high downloads and usage.
              </p>
            </div>
            {/* Filter Tabs */}
            <div className="flex bg-white p-1 rounded-lg border border-neutral-200 shadow-sm">
              <span className="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-md shadow-sm cursor-default">
                All Time
              </span>
              <span className="px-4 py-1.5 text-neutral-500 text-xs font-medium rounded-md hover:bg-neutral-50 cursor-not-allowed opacity-50">
                This Month
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {popularContent.map((item) => (
              <CardItem key={item.id} item={item} isPopular />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- SUB COMPONENT: CARD ITEM ---
function CardItem({
  item,
  isPopular,
}: {
  item: UnifiedContent;
  isPopular?: boolean;
}) {
  return (
    <Link href={`/assets/${item.id}`} className="flex flex-col gap-4 group">
      <div className="relative w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition duration-500 ease-out">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm bg-neutral-50">
            Preview
          </div>
        )}

        {/* Overlay Badge for Popular */}
        {isPopular && (
          <div className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>{' '}
            HOT
          </div>
        )}

        {/* Hover Stats Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="w-full flex justify-between items-center text-white text-xs font-semibold translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span className="flex items-center gap-1.5 backdrop-blur-md bg-black/30 px-2 py-1 rounded-full">
              <Download size={12} /> {item.downloadCount}
            </span>
            <span className="flex items-center gap-1.5 backdrop-blur-md bg-black/30 px-2 py-1 rounded-full">
              <Eye size={12} /> {item.viewCount}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start px-1">
        <div className="space-y-1">
          <h4 className="text-neutral-900 text-sm font-bold group-hover:text-blue-600 transition leading-tight">
            {item.title}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-medium px-1.5 py-0.5 bg-neutral-100 rounded">
              #{item.number}
            </span>
            <p className="text-[10px] text-neutral-400">
              {item.category?.name || 'Uncategorized'}
            </p>
          </div>
        </div>
        <div>
          {/* Tier Indicator */}
          {item.tier === 'pro_plus' ? (
            <span className="px-2 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md text-[10px] font-bold shadow-sm">
              Pro+
            </span>
          ) : item.tier === 'pro' ? (
            <span className="px-2 py-1 bg-black text-white rounded-md text-[10px] font-bold shadow-sm">
              Pro
            </span>
          ) : (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
              Free
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
