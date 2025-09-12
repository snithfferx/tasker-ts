import React from 'react';

// Simple loading placeholder
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`} />
);

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  loading = false,
  className = '',
  action,
}) => {
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {action && <div>{action}</div>}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};
