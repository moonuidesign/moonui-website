'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface ContentToolbarProps {
  categories?: { label: string; value: string }[];
  tiers?: { label: string; value: string }[];
  statuses?: { label: string; value: string }[];
  sortOptions?: { label: string; value: string }[];
  view: 'table' | 'card';
  setView: (view: 'table' | 'card') => void;
  defaultSort?: string;
}

export function ContentToolbar({
  categories = [],
  tiers = [],
  statuses = [],
  sortOptions = [
    { label: 'Newest', value: 'createdAt.desc' },
    { label: 'Oldest', value: 'createdAt.asc' },
    { label: 'A-Z', value: 'title.asc' },
    { label: 'Z-A', value: 'title.desc' },
  ],
  view,
  setView,
  defaultSort = 'createdAt.desc',
}: ContentToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize search from URL
  const [searchValue, setSearchValue] = React.useState(
    searchParams.get('search') || '',
  );
  const debouncedSearch = useDebounce(searchValue, 300);

  // Update URL helper
  const updateUrl = React.useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === 'all') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });

      router.push(`${pathname}?${newSearchParams.toString()}`);
    },
    [pathname, router, searchParams],
  );

  // Effect for search
  React.useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch !== currentSearch) {
      updateUrl({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, searchParams, updateUrl]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-1 bg-background rounded-lg">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter */}
        {categories.length > 0 && (
          <Select
            value={searchParams.get('categoryId') || 'all'}
            onValueChange={(val) => updateUrl({ categoryId: val })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Tier Filter */}
        {tiers.length > 0 && (
          <Select
            value={searchParams.get('tier') || 'all'}
            onValueChange={(val) => updateUrl({ tier: val })}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {tiers.map((tier) => (
                <SelectItem key={tier.value} value={tier.value}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status Filter */}
        {statuses.length > 0 && (
          <Select
            value={searchParams.get('status') || 'all'}
            onValueChange={(val) => updateUrl({ status: val })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <Select
          value={searchParams.get('sort') || defaultSort}
          onValueChange={(val) => updateUrl({ sort: val })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex items-center border rounded-md p-1 bg-muted/20">
          <Button
            variant={view === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'card' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView('card')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
