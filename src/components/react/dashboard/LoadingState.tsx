import React from 'react';
import { Skeleton } from '@Components/ui/skeleton';

export const LoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
};
