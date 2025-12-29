'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useFilter } from '@/contexts';
import { ResourceCard } from '@/components/card';
import { SectionHeader } from './section-header';
import { UseCopyToClipboard } from '@/hooks/use-clipboard';
import { toast } from 'react-toastify';
import { getFingerprint } from '@thumbmarkjs/thumbmarkjs'; // IMPORT THUMBMARK
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { checkDownloadLimit } from '@/server-action/limit'; // Pastikan path import sesuai
import { getAssetsItems } from '@/server-action/getAssetsItems';
import { incrementAssetStats } from '@/server-action/incrementAssetStats';
import { ResourceCard2 } from '@/components/card/index copy';

export * from './section-header';

interface ContentProps {
  initialItems?: any[];
  initialTotalCount?: number;
  items?: any[];
}

export default function Content2({
  initialItems = [],
  initialTotalCount = 0,
  items: legacyItems,
}: ContentProps) {
  const startItems = initialItems.length > 0 ? initialItems : legacyItems || [];

  const {
    tool,
    contentType,
    categorySlugs,
    subCategorySlugs,
    selectedTiers,
    gradientTypes,
    selectedColors,
    searchQuery,
  } = useFilter();

  const router = useRouter();
  const { copy } = UseCopyToClipboard();

  // --- STATE ---
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [fetchedItems, setFetchedItems] = useState<any[]>(startItems);
  const [totalCount, setTotalCount] = useState(
    initialTotalCount || startItems.length,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // State untuk menyimpan Fingerprint ID
  const [fingerprint, setFingerprint] = useState<string>('');

  const debouncedJumpPage = useDebounce(jumpPageInput, 500);

  // Limits
  const baseLimit = itemsPerPage;

  // --- THUMBMARK INIT ---
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        const fp = await getFingerprint();
        setFingerprint(fp);
      } catch (error) {
        console.error('Failed to generate fingerprint:', error);
        // Fingerprint kosong tidak masalah, server akan fallback ke IP Address
      }
    };
    initFingerprint();
  }, []);

  // --- ACTIONS ---

  const handleCopy = async (text: string, id: string, type: string) => {
    if (!text) return toast.error('No content to copy');

    // Kirim fingerprint sebagai parameter ke-4
    const limitCheck = await checkDownloadLimit('copy', id, type, fingerprint);

    if (!limitCheck.success) {
      if (limitCheck.requiresLogin) {
        toast.info(limitCheck.message || 'Please login to continue');
        return router.push('/signin');
      }
      if (limitCheck.requiresUpgrade) {
        toast.warning(limitCheck.message || 'Please upgrade to continue');
        return router.push('/pricing');
      }
      return toast.error(limitCheck.message || 'Limit reached');
    }

    // Increment Stats (Fire and Forget)
    incrementAssetStats(id, type, 'copy');

    copy(text, 'Component copied to clipboard!');
  };

  const handleDownload = async (url: string, id: string, type: string) => {
    if (!url) return toast.error('Download link not available');

    // Kirim fingerprint sebagai parameter ke-4
    const limitCheck = await checkDownloadLimit(
      'download',
      id,
      type,
      fingerprint,
    );

    if (!limitCheck.success) {
      if (limitCheck.requiresLogin) {
        toast.info(limitCheck.message || 'Please login to continue');
        return router.push('/signin');
      }
      if (limitCheck.requiresUpgrade) {
        toast.warning(limitCheck.message || 'Please upgrade to continue');
        return router.push('/pricing');
      }
      return toast.error(limitCheck.message || 'Limit reached');
    }

    // Increment Stats (Fire and Forget)
    incrementAssetStats(id, type, 'download');

    window.open(url, '_blank');
  };

  const fetchItems = useCallback(
    async (page: number) => {
      try {
        setLoading(true);

        const filters = {
          tool,
          contentType,
          categorySlugs,
          subCategorySlugs,
          selectedTiers,
          gradientTypes,
          selectedColors,
          searchQuery,
        };

        const limit = baseLimit;
        const offset = (page - 1) * itemsPerPage;

        if (limit <= 0) return;

        const res = await getAssetsItems(filters, { limit, offset });

        setFetchedItems(res.items);
        window.scrollTo({ top: 0, behavior: 'instant' });

        setTotalCount(res.totalCount);
      } catch (error) {
        console.error('Error fetching items:', error);
        toast.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    },
    [
      tool,
      contentType,
      categorySlugs,
      subCategorySlugs,
      selectedTiers,
      gradientTypes,
      selectedColors,
      searchQuery,
      baseLimit,
      itemsPerPage,
    ],
  );

  // --- EFFECTS ---

  // 1. Filter Change -> Reset & Fetch Page 1
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setCurrentPage(1);
    setJumpPageInput('');
    fetchItems(1);
  }, [
    tool,
    contentType,
    categorySlugs,
    subCategorySlugs,
    selectedTiers,
    gradientTypes,
    selectedColors,
    searchQuery,
    itemsPerPage,
  ]);

  // 2. Jump Page Input
  useEffect(() => {
    const pageNum = parseInt(debouncedJumpPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum !== currentPage) {
      const maxPage = Math.ceil(totalCount / baseLimit);
      const target = Math.min(pageNum, maxPage);
      setCurrentPage(target);
      fetchItems(target);
    }
  }, [debouncedJumpPage, totalCount, baseLimit]);

  // --- RENDER HELPERS ---
  const totalPages = Math.ceil(totalCount / baseLimit);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }
    return pages;
  };

  // Render No Results
  if (!loading && fetchedItems.length === 0) {
    return (
      <>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <SectionHeader
            totalItems={totalCount}
            endIndex={Math.min(fetchedItems.length, totalCount)}
            startIndex={0}
            title={`${totalCount} Results`}
            className="capitalize truncate"
          />
        </div>
        <div className="w-full h-64 flex flex-col items-center justify-center text-zinc-400">
          <p className="text-lg font-medium">
            No {contentType || 'items'} found
          </p>
          <p className="text-sm text-center text-zinc-500 mt-1">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-orange-600 hover:underline mt-4 text-sm"
          >
            Clear all filters
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      id="assets-content-container"
      className="flex flex-col gap-8 w-full min-h-[500px]"
    >
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <SectionHeader
            totalItems={totalCount}
            endIndex={Math.min(fetchedItems.length, totalCount)}
            startIndex={0}
            title={`${totalCount} Results`}
            className="capitalize truncate"
          />
        </div>

        <motion.div
          style={{ overflowAnchor: 'none' }}
          className="grid grid-cols-1 px-8 md:px-0 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {fetchedItems.map((item, index) => {
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
                <ResourceCard2
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
                      ? () =>
                        handleDownload(item.downloadUrl, item.id, item.type)
                      : undefined
                  }
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* --- PAGINATION & CONTROLS --- */}
      {(totalPages > 1 || totalCount > 0) && (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 border-t border-gray-100 pt-8">
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      const p = Math.max(1, currentPage - 1);
                      setCurrentPage(p);
                      fetchItems(p);
                    }}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, idx) => (
                  <PaginationItem key={idx}>
                    {page === '...' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => {
                          setCurrentPage(Number(page));
                          fetchItems(Number(page));
                        }}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      const p = Math.min(totalPages, currentPage + 1);
                      setCurrentPage(p);
                      fetchItems(p);
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Controls Group */}
          <div className="flex items-center gap-4">
            {/* Rows Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 whitespace-nowrap">
                Show
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                }}
              >
                <SelectTrigger className="w-[65px] h-8 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                  <SelectItem value="96">96</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {totalPages > 1 && (
              <>
                <div className="h-4 w-px bg-gray-200"></div>

                {/* Jump To Page */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 whitespace-nowrap">
                    Go to
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    className="w-[50px] h-8 text-xs text-center p-1 bg-white"
                  />
                  <span className="text-xs text-zinc-400">/ {totalPages}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
