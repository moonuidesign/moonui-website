import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="group w-full flex flex-col justify-start items-start gap-3">
      {/* Container Gambar - Matches ComponentCard styles */}
      <div className="self-stretch h-64 relative bg-white rounded-2xl shadow-[0px_0px_0px_1px_rgba(51,51,51,0.10)] border-t-[5px] border-white overflow-hidden">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>

      {/* Footer Info Skeleton */}
      <div className="self-stretch px-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Skeleton className="h-4 w-32 rounded" /> 
           {/* Optional New Badge Skeleton */}
           <Skeleton className="h-4 w-8 rounded-full" />
        </div>
        {/* Tier Indicator Skeleton */}
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
