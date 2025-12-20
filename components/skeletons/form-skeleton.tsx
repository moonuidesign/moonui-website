import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FormSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle><Skeleton className="h-8 w-48" /></CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        ))}
        <Skeleton className="h-10 w-32 mt-6" /> {/* Button */}
      </CardContent>
    </Card>
  );
}
