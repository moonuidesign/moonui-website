import { Skeleton } from "@/components/ui/skeleton";

export function NavbarSkeleton() {
  return (
    <div className="absolute md:top-20 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl lg:w-full bg-[#F7F7F7] rounded-2xl md:rounded-3xl border border-transparent h-16">
         <div className="flex justify-between items-center h-full px-4 gap-4">
            {/* Logo & Links Skeleton */}
            <div className="flex items-center gap-8">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <div className="hidden lg:flex items-center gap-6">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Search & Actions Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="w-64 h-9 rounded-lg hidden lg:block" />
              <Skeleton className="w-8 h-8 rounded-lg lg:hidden" />
              <Skeleton className="h-9 w-24 rounded-lg hidden lg:block" />
              <Skeleton className="h-9 w-32 rounded-lg hidden lg:block" />
              <Skeleton className="w-8 h-8 rounded-lg lg:hidden" />
            </div>
         </div>
      </div>
    </div>
  );
}
