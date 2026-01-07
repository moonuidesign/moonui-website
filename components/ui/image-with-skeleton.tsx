'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/libs/utils';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  skeletonClassName?: string;
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  wrapperClassName,
  skeletonClassName,
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  // Don't render if src is empty/undefined
  if (!src) {
    return (
      <div className={cn('relative h-full w-full overflow-hidden', wrapperClassName)}>
        <Skeleton className={cn('absolute inset-0 h-full w-full', skeletonClassName)} />
      </div>
    );
  }

  return (
    <div className={cn('relative h-full w-full overflow-hidden', wrapperClassName)}>
      {!loaded && <Skeleton className={cn('absolute inset-0 h-full w-full', skeletonClassName)} />}
      <Image
        src={src}
        alt={alt || ''}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={cn(
          'object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        onLoad={() => setLoaded(true)}
        unoptimized
      />
    </div>
  );
}
