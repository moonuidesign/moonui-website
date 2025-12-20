'use client';

import React, { useState } from 'react';
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
  ...props
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative w-full h-full overflow-hidden', wrapperClassName)}>
      {!loaded && (
        <Skeleton
          className={cn(
            'absolute inset-0 w-full h-full',
            skeletonClassName
          )}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </div>
  );
}
