import { Skeleton } from '@/components/ui/skeleton';
import { CardGridSkeleton } from './card-skeleton';

export function AssetsPageSkeleton() {
  return (
    <div className="min-h-screen font-['Inter']">
      <div className="max-w-3xl pt-20 md:pt-0 z-[800] md:z-0 bg-[#E7E7E7] md:bg-none md:rounded-none rounded-t-[39px] -mt-[69px] md:mt-[30px] md:max-w-5xl lg:max-w-7xl md:w-full lg:w-7xl mx-auto px-4 md:px-4 lg:px-6 py-6 flex gap-4 lg:gap-8 relative">
        {/* Sidebar Skeleton */}
        <div className="hidden md:block md:w-52 lg:w-64 flex-shrink-0">
          <div className="sticky top-6 flex flex-col gap-4 lg:gap-6">
            {/* Title */}
            <div className="pl-1 mb-2 lg:mb-4">
              <Skeleton className="h-6 lg:h-8 w-28 lg:w-32" />
            </div>

            {/* Platform Switcher Skeleton */}
            <div className="w-full bg-white rounded-xl border border-gray-100 p-1 flex gap-1">
              <Skeleton className="h-8 w-1/2 rounded-lg" />
              <Skeleton className="h-8 w-1/2 rounded-lg" />
            </div>

            {/* Applied Filters Skeleton */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Tier Filter Skeleton */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Skeleton className="h-4 w-16" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>

            {/* Color Filter Skeleton */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-6 rounded-full" />
                ))}
              </div>
            </div>

            {/* Categories Skeleton */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="w-full">
            {/* Navbar Filter Skeleton */}
            <div className="w-full py-3 flex flex-col gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-10 w-32 rounded-[50px]" />
                <Skeleton className="h-10 w-32 rounded-[50px]" />
                <Skeleton className="h-10 w-32 rounded-[50px]" />
                <Skeleton className="h-10 w-32 rounded-[50px]" />
              </div>
            </div>

            {/* Showing Results & Sort/Filter Trigger Skeleton */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            {/* Content Grid */}
            <div className="pb-20">
              <CardGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
