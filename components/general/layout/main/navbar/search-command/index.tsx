'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Monitor,
  LayoutTemplate,
  Palette,
  Loader2,
  Folder,
  File,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  getGlobalSearchData,
  type SearchResultItem,
  type GlobalSearchResponse,
} from '@/server-action/Search';
import { useDebounce } from '@/hooks/use-debounce';
import { useFilterStore } from '@/contexts';

interface SearchCommandProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const STATIC_PAGES = [
  { title: 'Home', url: '/', keywords: ['home', 'landing', 'main'] },
  {
    title: 'Assets',
    url: '/assets',
    keywords: ['assets', 'resources', 'library', 'components', 'templates'],
  },
  { title: 'About', url: '/about', keywords: ['about', 'team', 'company'] },
  {
    title: 'Contact',
    url: '/contact',
    keywords: ['contact', 'support', 'help'],
  },
  {
    title: 'Verify License',
    url: '/verify-license',
    keywords: ['license', 'verify', 'check'],
  },
];

export function SearchCommand({ open, setOpen }: SearchCommandProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<GlobalSearchResponse>({
    templates: [],
    templateCategories: [],
    templateSubCategories: [],
    components: [],
    componentCategories: [],
    componentSubCategories: [],
    designs: [],
    designCategories: [],
    designSubCategories: [],
    gradients: [],
    gradientCategories: [],
    gradientSubCategories: [],
  });

  const [staticData, setStaticData] = useState<typeof STATIC_PAGES>([]);

  const globalSearchQuery = useFilterStore((state) => state.searchQuery);
  const initialSearch = searchParams.get('q') || globalSearchQuery || '';
  const [search, setSearch] = useState(initialSearch);

  const debouncedSearch = useDebounce(search, 300);
  const applySearchFilter = useFilterStore((state) => state.applySearchFilter);

  // Sync local search with URL query when on /assets to ensure persistence on refresh
  useEffect(() => {
    if (pathname === '/assets') {
      const q = searchParams.get('q') || '';
      // Only update if different to avoid infinite loops or typing interference
      if (search !== q) {
        setSearch(q);
      }
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  // Removed auto-clear useEffect to prevent input stuttering/resetting issues
  // useEffect(() => {
  //   if (open) {
  //      // Optional: Auto-focus or other logic when opened
  //   } else {
  //      // Delay clearing to avoid UI flicker during close animation
  //      const t = setTimeout(() => setSearch(''), 300);
  //      return () => clearTimeout(t);
  //   }
  // }, [open]);

  useEffect(() => {
    if (!open) return;

    // Static pages filtering - show all when empty, filter when searching
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      setStaticData(
        STATIC_PAGES.filter(
          (p) => p.title.toLowerCase().includes(lower) || p.keywords.some((k) => k.includes(lower)),
        ),
      );
    } else {
      // Show all static pages when no search query
      setStaticData(STATIC_PAGES);
    }

    // Always fetch API data (search or default)
    setLoading(true);
    getGlobalSearchData(debouncedSearch || '')
      .then((res) => setData(res))
      .catch((err) => console.error('Global Search Error:', err))
      .finally(() => setLoading(false));
  }, [debouncedSearch, open]);

  const handleNavigate = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const handleSelectAsset = (item: SearchResultItem) => {
    setOpen(false);
    if (item.url) router.push(item.url);
  };

  // --- Filter Navigation Logic ---

  const handleSelectCategory = (item: SearchResultItem) => {
    setOpen(false);
    applySearchFilter({
      searchQuery: search,
      contentType: item.contentType as any,
      categorySlug: item.slug,
      clearOthers: true,
    });
    router.push('/assets');
  };

  const handleSelectSubCategory = (item: SearchResultItem) => {
    setOpen(false);
    // Logic: Save parent category (if known) and sub-category.
    // Since we might not have parent slug directly if it's not passed,
    // we assume we just set sub-category filter or if the system supports it.
    // For now, setting subCategorySlug.
    applySearchFilter({
      searchQuery: search,
      contentType: item.contentType as any,
      subCategorySlug: item.slug,
      // If we knew parent, we'd set it too.
      clearOthers: true,
    });
    router.push('/assets');
  };

  const handleViewAll = (type: string, isCategory = false, isSubCategory = false) => {
    setOpen(false);

    if (isSubCategory) {
      applySearchFilter({
        searchQuery: search,
        contentType: type as any,
        clearOthers: true,
      });
    } else if (isCategory) {
      applySearchFilter({
        searchQuery: search,
        contentType: type as any,
        categorySlug: null, // Clear specific category
        clearOthers: true,
      });
    } else {
      // General view all (items)
      applySearchFilter({
        searchQuery: search,
        contentType: type as any,
        clearOthers: true,
      });
    }

    const params = new URLSearchParams();
    if (search) params.set('q', search);
    router.push(`/assets?${params.toString()}`);
  };

  const handleGlobalSearchEnter = () => {
    setOpen(false);
    applySearchFilter({
      searchQuery: search,
      clearOthers: true,
    });

    // Always navigate to assets with the query param
    const params = new URLSearchParams();
    if (search) {
      params.set('q', search);
    }
    router.push(`/assets?${params.toString()}`);
  };

  // Check if any results exist
  const hasResults = Object.values(data).some((arr) => arr.length > 0) || staticData.length > 0;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      shouldFilter={false}
      label="Global Search"
      className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm transition-all"
    >
      <div className="animate-in fade-in zoom-in-95 mx-4 w-full max-w-[700px] overflow-hidden rounded-xl border border-gray-200 bg-white font-['Inter'] shadow-2xl">
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <Search className="h-5 w-5 text-gray-400" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            className="flex-1 border-none bg-transparent text-lg outline-none placeholder:text-gray-400"
            placeholder="Search resources, components, templates..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGlobalSearchEnter();
            }}
          />
          <button
            onClick={() => setOpen(false)}
            className="rounded bg-gray-100 px-2 py-1 font-mono text-[10px] text-gray-500 hover:bg-gray-200"
          >
            ESC
          </button>
        </div>

        <Command.List className="scrollbar-thin scrollbar-thumb-gray-200 max-h-[65vh] overflow-y-auto p-2">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-center text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          )}

          {!loading && !hasResults && (
            <Command.Empty className="py-12 text-center text-sm text-gray-500">
              No results found for "{debouncedSearch}".
            </Command.Empty>
          )}

          {!loading && (
            <>
              {/* --- STATIC PAGES --- */}
              {staticData.length > 0 && (
                <Command.Group heading="Pages">
                  {staticData.map((page) => (
                    <Command.Item
                      key={page.url}
                      onSelect={() => handleNavigate(page.url)}
                      className="group flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all hover:bg-gray-100 aria-selected:bg-gray-100"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50">
                        <File className="h-5 w-5 text-gray-500" />
                      </div>
                      <span className="font-semibold text-gray-900">{page.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* --- TEMPLATES SECTION --- */}
              <SectionGroup
                title="Templates"
                items={data.templates}
                categories={data.templateCategories}
                subCategories={data.templateSubCategories}
                type="templates"
                onSelectAsset={handleSelectAsset}
                onSelectCategory={handleSelectCategory}
                onSelectSubCategory={handleSelectSubCategory}
                onViewAll={handleViewAll}
              />

              {/* --- COMPONENTS SECTION --- */}
              <SectionGroup
                title="Components"
                items={data.components}
                categories={data.componentCategories}
                subCategories={data.componentSubCategories}
                type="components"
                onSelectAsset={handleSelectAsset}
                onSelectCategory={handleSelectCategory}
                onSelectSubCategory={handleSelectSubCategory}
                onViewAll={handleViewAll}
              />

              {/* --- DESIGNS SECTION --- */}
              <SectionGroup
                title="Designs"
                items={data.designs}
                categories={data.designCategories}
                subCategories={data.designSubCategories}
                type="designs"
                onSelectAsset={handleSelectAsset}
                onSelectCategory={handleSelectCategory}
                onSelectSubCategory={handleSelectSubCategory}
                onViewAll={handleViewAll}
              />

              {/* --- GRADIENTS SECTION --- */}
              <SectionGroup
                title="Gradients"
                items={data.gradients}
                categories={data.gradientCategories}
                subCategories={data.gradientSubCategories}
                type="gradients"
                onSelectAsset={handleSelectAsset}
                onSelectCategory={handleSelectCategory}
                onSelectSubCategory={handleSelectSubCategory}
                onViewAll={handleViewAll}
              />

              {/* Global Search Fallback */}
              {search.length > 0 && (
                <Command.Group heading="Search">
                  <Command.Item
                    onSelect={handleGlobalSearchEnter}
                    className="group flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all hover:bg-gray-100 aria-selected:bg-gray-100"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50">
                      <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">Search for "{search}"</span>
                      <span className="text-xs text-gray-500">View all results in Assets</span>
                    </div>
                  </Command.Item>
                </Command.Group>
              )}
            </>
          )}
        </Command.List>

        <div className="flex justify-between border-t bg-gray-50 px-4 py-2 text-xs text-gray-400">
          <span>Navigate with arrows</span>
          <span>↵ to select</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

// --- SUB-COMPONENTS ---

interface SectionGroupProps {
  title: string;
  items: SearchResultItem[];
  categories: SearchResultItem[];
  subCategories: SearchResultItem[];
  type: string;
  onSelectAsset: (item: SearchResultItem) => void;
  onSelectCategory: (item: SearchResultItem) => void;
  onSelectSubCategory: (item: SearchResultItem) => void;
  onViewAll: (type: string, isCat?: boolean, isSub?: boolean) => void;
}

function SectionGroup({
  title,
  items,
  categories,
  subCategories,
  type,
  onSelectAsset,
  onSelectCategory,
  onSelectSubCategory,
  onViewAll,
}: SectionGroupProps) {
  if (items.length === 0 && categories.length === 0 && subCategories.length === 0) return null;

  const limit = 5;
  const limitedItems = items.slice(0, limit);
  const limitedCategories = categories.slice(0, limit);
  const limitedSubCategories = subCategories.slice(0, limit);

  return (
    <>
      {items.length > 0 && (
        <Command.Group>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-gray-500">{title}</span>
            <button
              onClick={() => onViewAll(type)}
              className="flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-600"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {limitedItems.map((item) => (
            <ItemRow key={item.id} item={item} onSelect={() => onSelectAsset(item)} />
          ))}
        </Command.Group>
      )}

      {categories.length > 0 && (
        <Command.Group>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-gray-500">{title} Categories</span>
            <button
              onClick={() => onViewAll(type, true)}
              className="flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-600"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 px-2 pb-2">
            {limitedCategories.map((item) => (
              <CategoryTag key={item.id} item={item} onSelect={() => onSelectCategory(item)} />
            ))}
          </div>
        </Command.Group>
      )}

      {/* Sub-Categories (Flex Wrap) */}
      {subCategories.length > 0 && (
        <Command.Group>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-gray-500">{title} Sub-Categories</span>
            <button
              onClick={() => onViewAll(type, false, true)}
              className="flex items-center gap-1 text-xs text-blue-500 transition-colors hover:text-blue-600"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 px-2 pb-2">
            {limitedSubCategories.map((item) => (
              <CategoryTag
                key={item.id}
                item={item}
                onSelect={() => onSelectSubCategory(item)}
                isSub
              />
            ))}
          </div>
        </Command.Group>
      )}
    </>
  );
}

function ItemRow({ item, onSelect }: { item: SearchResultItem; onSelect: () => void }) {
  let Icon = Monitor;
  if (item.type === 'Template') Icon = LayoutTemplate;
  if (item.type === 'Design' || item.type === 'Gradient') Icon = Palette;
  if (item.type === 'Category' || item.type === 'SubCategory') Icon = Folder;

  let badgeColor = 'bg-gray-100 text-gray-600';
  let badgeText = 'Free';
  if (item.tier === 'pro') {
    badgeColor = 'bg-blue-100 text-blue-700';
    badgeText = 'Pro';
  } else if (item.tier === 'pro_plus') {
    badgeColor = 'bg-orange-100 text-orange-700';
    badgeText = 'Pro+';
  }

  return (
    <Command.Item
      value={`${item.title} ${item.id}`} // Unique value for filtering
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all hover:bg-gray-100 aria-selected:bg-gray-100"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50">
        <Icon className="h-5 w-5 text-gray-500" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-gray-900">{item.title}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs text-gray-500 capitalize">{item.type}</span>
          {item.category && <span className="text-xs text-gray-300">•</span>}
          <span className="text-xs text-gray-500">{item.category}</span>
        </div>
      </div>
    </Command.Item>
  );
}

function CategoryTag({
  item,
  onSelect,
  isSub,
}: {
  item: SearchResultItem;
  onSelect: () => void;
  isSub?: boolean;
}) {
  return (
    <Command.Item
      value={`${item.title} ${item.id}`}
      onSelect={onSelect}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 aria-selected:border-gray-300 aria-selected:bg-gray-100"
    >
      {isSub ? (
        <Layers className="h-3 w-3 text-gray-400" />
      ) : (
        <Folder className="h-3 w-3 text-gray-400" />
      )}
      {item.title}
    </Command.Item>
  );
}
