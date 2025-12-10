'use client';

import React, { useMemo } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useFilter } from '@/contexts';
import { ResourceCard } from '@/components/card';

interface ContentProps {
  items: any[];
}

export const Content: React.FC<ContentProps> = ({ items }) => {
  const {
    tool,
    platform,
    contentType,
    categorySlugs,
    selectedTiers,
    gradientTypes,
    selectedColors,
    searchQuery,
  } = useFilter();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Content Type Check
      if (item.type !== contentType) return false;

      // 2. Tool Check (Not applicable for gradients)
      if (contentType !== 'gradients') {
        if (item.tool && item.tool !== tool) return false;
      }

      // 3. Platform Check (Not applicable for gradients or designs usually)
      if (contentType !== 'gradients' && contentType !== 'designs') {
        // If "All" is selected, show everything (don't filter)
        if (platform !== 'all') {
          if (item.platform) {
            const p = item.platform;
            // Show item if it's universal ('all'), 'cross_platform', or matches specific selection
            if (p !== 'all' && p !== 'cross_platform' && p !== platform) {
              return false;
            }
          }
        }
      }

      // 4. Category Check
      if (
        categorySlugs.length > 0 &&
        !categorySlugs.includes(item.categorySlug)
      ) {
        return false;
      }

      // 4. Tier Check
      if (selectedTiers.length > 0 && !selectedTiers.includes(item.tier)) {
        return false;
      }

      // 5. Gradient Type Check
      if (contentType === 'gradients' && gradientTypes.length > 0) {
        if (!item.gradientType || !gradientTypes.includes(item.gradientType)) {
          return false;
        }
      }

      // 6. Color Check
      if (contentType === 'gradients' && selectedColors.length > 0) {
        if (
          !item.colors ||
          !item.colors.some((c: string) => selectedColors.includes(c))
        ) {
          return false;
        }
      }

      // 7. Search
      if (searchQuery) {
        if (!item.title.toLowerCase().includes(searchQuery.toLowerCase()))
          return false;
      }

      return true;
    });
  }, [
    items,
    tool,
    contentType,
    categorySlugs,
    selectedTiers,
    gradientTypes,
    selectedColors,
    searchQuery,
  ]);

  const shouldGroup =
    categorySlugs.length === 0 && !searchQuery && gradientTypes.length === 0;

  // Render No Results
  if (filteredItems.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-zinc-400">
        <p>No results found.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-orange-600 hover:underline mt-2"
        >
          Reset
        </button>
      </div>
    );
  }

  // --- RENDER GROUPED ---
  if (shouldGroup) {
    const uniqueCats = Array.from(
      new Set(filteredItems.map((i) => i.categorySlug)),
    );

    return (
      <div className="flex flex-col gap-12 w-full">
        {uniqueCats.map((catSlug) => {
          const catItems = filteredItems.filter(
            (i) => i.categorySlug === catSlug,
          );
          if (catItems.length === 0) return null;

          return (
            <section key={catSlug as string} className="flex flex-col gap-4">
              <motion.div
                layout // Penting untuk animasi layout reordering
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {catItems.map((item) => (
                    <ResourceCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      imageUrl={item.imageUrl}
                      tier={item.tier}
                      createdAt={item.createdAt}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </section>
          );
        })}
      </div>
    );
  }

  // --- RENDER FLAT (Filtered View) ---
  let title = `All ${contentType}`;
  if (categorySlugs.length > 0) title = categorySlugs.join(' & ');
  if (gradientTypes.length > 0) title += ` (${gradientTypes.join(', ')})`;

  return (
    <div className="flex flex-col gap-8 w-full">
      <section className="flex flex-col gap-4">
        <SectionHeader title={title} className="capitalize truncate" />
        <motion.div
          layout // Penting untuk animasi layout reordering
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <ResourceCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                tier={item.tier}
                createdAt={item.createdAt}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
};
