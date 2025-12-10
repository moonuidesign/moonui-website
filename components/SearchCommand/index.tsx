'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Monitor,
  LayoutTemplate,
  Palette,
  Loader2,
} from 'lucide-react';
import {
  getGlobalSearchData,
  type SearchResultItem,
} from '@/server-action/Search';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchCommandProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function SearchCommand({ open, setOpen }: SearchCommandProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResultItem[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

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

  useEffect(() => {
    if (!open) {
      setSearch(''); // Reset search on close
      return;
    }

    setLoading(true);
    getGlobalSearchData(debouncedSearch)
      .then((res) => setData(res))
      .catch((err) => console.error('Global Search Error:', err))
      .finally(() => setLoading(false));
  }, [open, debouncedSearch]);

  const handleSelect = (item: SearchResultItem) => {
    setOpen(false);
    if (item.id) {
      router.push(`/assets/${item.id}`);
    }
  };

  const handleSearchEnter = (searchValue: string) => {
    setOpen(false);
    const isAssetsPage = pathname.includes('/assets');
    const filterPayload = { searchQuery: searchValue };

    if (isAssetsPage) {
      window.dispatchEvent(
        new CustomEvent('TRIGGER_FILTER_UPDATE', { detail: filterPayload }),
      );
    } else {
      localStorage.setItem('ASSET_FILTERS', JSON.stringify(filterPayload));
      router.push('/assets');
    }
  };

  const components = data.filter((i) => i.type === 'Component');
  const templates = data.filter((i) => i.type === 'Template');
  const designs = data.filter(
    (i) => i.type === 'Design' || i.type === 'Gradient',
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      shouldFilter={false}
      label="Global Search"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm transition-all"
    >
      <div className="w-full max-w-[650px] overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 border border-gray-200 mx-4 font-['Inter']">
        <div className="flex items-center border-b px-4 py-4 gap-3">
          <Search className="h-5 w-5 text-gray-400" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            className="flex-1 border-none bg-transparent text-lg outline-none placeholder:text-gray-400"
            placeholder="Search assets..."
          />
          <button
            onClick={() => setOpen(false)}
            className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono hover:bg-gray-200"
          >
            ESC
          </button>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <div className="py-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" /> Loading...
            </div>
          )}

          {!loading && data.length === 0 && (
            <Command.Empty className="py-12 text-center text-sm text-gray-500">
              No results found for "{debouncedSearch}".
            </Command.Empty>
          )}

          {!loading && (
            <>
              {templates.length > 0 && (
                <Command.Group heading="Templates">
                  {templates.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onSelect={() => handleSelect(item)}
                    />
                  ))}
                </Command.Group>
              )}
              {components.length > 0 && (
                <Command.Group heading="Components">
                  {components.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onSelect={() => handleSelect(item)}
                    />
                  ))}
                </Command.Group>
              )}
              {designs.length > 0 && (
                <Command.Group heading="Designs & Colors">
                  {designs.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onSelect={() => handleSelect(item)}
                    />
                  ))}
                </Command.Group>
              )}
              {search.length > 0 && (
                <Command.Group heading="Global Search">
                  <Command.Item
                    value={`search-global-${search}`}
                    onSelect={() => handleSearchEnter(search)}
                    className="group flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all hover:bg-gray-100 aria-selected:bg-gray-100"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50">
                      <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">
                        Search for "{search}"
                      </span>
                      <span className="text-xs text-gray-500">
                        View all matching results in Assets
                      </span>
                    </div>
                  </Command.Item>
                </Command.Group>
              )}
            </>
          )}
        </Command.List>

        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 border-t flex justify-between">
          <span>Navigate with arrows</span>
          <span>↵ to select</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

function ItemRow({
  item,
  onSelect,
}: {
  item: SearchResultItem;
  onSelect: () => void;
}) {
  let Icon = Monitor;
  if (item.type === 'Template') Icon = LayoutTemplate;
  if (item.type === 'Design' || item.type === 'Gradient') Icon = Palette;

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
      value={`${item.title} ${item.category} ${item.subcategory || ''}`}
      onSelect={onSelect}
      className="group flex cursor-pointer items-center gap-4 rounded-lg px-4 py-3 text-sm transition-all hover:bg-gray-100 aria-selected:bg-gray-100"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-gray-50">
        <Icon className="h-5 w-5 text-gray-500" />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 truncate">
            {item.title}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeColor}`}
          >
            {badgeText}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500 capitalize">{item.type}</span>
          {item.category && <span className="text-xs text-gray-300">•</span>}
          <span className="text-xs text-gray-500">{item.category}</span>
          {item.subcategory && (
            <>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">{item.subcategory}</span>
            </>
          )}
        </div>
      </div>
    </Command.Item>
  );
}
