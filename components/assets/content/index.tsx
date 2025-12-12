'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFilter } from '@/contexts';
import { ResourceCard } from '@/components/card';
import { SectionHeader } from './section-header';
import { UseCopyToClipboard } from '@/hooks/use-clipboard';
import { toast } from 'react-toastify';
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
import { useDebounce } from '@/hooks/use-debounce'; // Import useDebounce
import { checkDownloadLimit } from '@/server-action/limit';

export * from './section-header';

interface ContentProps {
  items: any[];
}

export default function Content({ items }: ContentProps) {
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

  const { copy } = UseCopyToClipboard();

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [jumpPageInput, setJumpPageInput] = useState(''); // Raw input value
  const debouncedJumpPage = useDebounce(jumpPageInput, 500); // Debounce for 500ms

  const handleCopy = async (text: string) => {
    if (!text) return toast.error('No content to copy');

    // Check Limit
    const limitCheck = await checkDownloadLimit();
    if (!limitCheck.success) {
      return toast.error(limitCheck.message || 'Daily limit reached');
    }

    copy(text, 'Component copied to clipboard!');
  };

  const handleDownload = async (url: string) => {
    if (!url) return toast.error('Download link not available');

    // Check Limit
    const limitCheck = await checkDownloadLimit();
    if (!limitCheck.success) {
      return toast.error(limitCheck.message || 'Daily limit reached');
    }

    window.open(url, '_blank');
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Content Type Check
      if (item.type !== contentType) return false;

      // 2. Tool Check
      if (item.typeContent && item.typeContent !== tool) {
        return false;
      }

      // 4. Main Category Check
      if (
        categorySlugs.length > 0 &&
        !categorySlugs.includes(item.categorySlug)
      ) {
        return false;
      }

      // 4b. Sub-Category Check
      if (
        subCategorySlugs &&
        subCategorySlugs.length > 0 &&
        !subCategorySlugs.includes(item.categorySlug)
      ) {
        return false;
      }

      // 5. Tier Check
      if (selectedTiers.length > 0 && !selectedTiers.includes(item.tier)) {
        return false;
      }

      // 6. Gradient Type Check
      if (contentType === 'gradients' && gradientTypes.length > 0) {
        if (!item.gradientType || !gradientTypes.includes(item.gradientType)) {
          return false;
        }
      }

      // 7. Color Check
      if (contentType === 'gradients' && selectedColors.length > 0) {
        if (!item.colors) return false;

        let hasColor = false;
        if (Array.isArray(item.colors)) {
          hasColor = item.colors.some((c: string) =>
            selectedColors.includes(c),
          );
        } else if (typeof item.colors === 'object') {
          // Handle { from: '...', to: '...' } style objects
          hasColor = Object.values(item.colors).some(
            (c: any) => typeof c === 'string' && selectedColors.includes(c),
          );
        }

        if (!hasColor) return false;
      }

      // 8. Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSlug = item.slug
          ? item.slug.toLowerCase().includes(query)
          : false;
        const matchAuthor = item.author
          ? item.author.toLowerCase().includes(query)
          : false;

        if (!matchTitle && !matchSlug && !matchAuthor) return false;
      }

      return true;
    });
  }, [
    items,
    tool,
    contentType,
    categorySlugs,
    subCategorySlugs,
    selectedTiers,
    gradientTypes,
    selectedColors,
    searchQuery,
  ]);

  // --- SCROLL & PAGINATION RESET LOGIC ---

  // Reset Page, Jump input and Scroll when FILTERS change
  useEffect(() => {
    setCurrentPage(1);
    setJumpPageInput(''); // Clear jump input on filter change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [
    tool,
    contentType,
    categorySlugs,
    subCategorySlugs,
    selectedTiers,
    gradientTypes,
    selectedColors,
    searchQuery,
  ]);

  // Scroll to top when PAGE changes (except when triggered by debouncedJumpPage)
  useEffect(() => {
    if (parseInt(jumpPageInput) !== currentPage) {
      // Prevent re-setting input if user is actively typing a valid page
      setJumpPageInput(currentPage.toString());
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  // --- PAGINATION CALC ---
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Effect to handle debounced jump page input
  useEffect(() => {
    const pageNum = parseInt(debouncedJumpPage);
    if (
      !isNaN(pageNum) &&
      pageNum >= 1 &&
      pageNum <= totalPages &&
      pageNum !== currentPage
    ) {
      setCurrentPage(pageNum);
    } else if (debouncedJumpPage === '' && currentPage !== 1) {
      // If input is cleared, go to page 1, but only if not already on page 1
      // Optionally, if input is cleared, do nothing or reset to current page.
      // For now, if user clears input, it will just show currentPage.
    }
  }, [debouncedJumpPage, totalPages, currentPage]);

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
  if (filteredItems.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-zinc-400">
        <p>No results found.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-orange-600 hover:underline mt-2"
        >
          Reset Filters
        </button>
      </div>
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
            totalItems={totalItems}
            endIndex={endIndex}
            startIndex={startIndex}
            title={`${totalItems} Results`}
            className="capitalize truncate"
          />
        </div>

        <motion.div
          layout
          style={{ overflowAnchor: 'none' }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="wait">
            {currentItems.map((item) => (
              <ResourceCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                tier={item.tier}
                createdAt={item.createdAt}
                author={item.author}
                onCopy={
                  item.type === 'components'
                    ? () => handleCopy(item.copyData)
                    : undefined
                }
                onDownload={
                  item.type !== 'components'
                    ? () => handleDownload(item.downloadUrl)
                    : undefined
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* --- PAGINATION & CONTROLS --- */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 border-t border-gray-100 pt-8">
          {/* 1. Pagination Numbers */}
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage(Number(page))}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* 2. Controls Group (Rows & Jump) */}
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
                  setCurrentPage(1);
                  window.scrollTo({ top: 0, behavior: 'instant' });
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

            {/* Separator */}
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
          </div>
        </div>
      )}
    </div>
  );
}
