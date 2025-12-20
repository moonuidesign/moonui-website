import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
        <Skeleton className="h-10 w-24" /> {/* Action button */}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter/Search Bar */}
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Table Header */}
          <div className="flex gap-4 p-4 border-b">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b last:border-0">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-end gap-2 mt-4">
             <Skeleton className="h-8 w-8" />
             <Skeleton className="h-8 w-8" />
             <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
