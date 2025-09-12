import { lazy, Suspense } from 'react';

// Lazy load heavy components
export const DashboardAnalyticsLazy = lazy(() => 
  import('./dashboard/DashboardAnalytics').then(module => ({ default: module.default }))
);

export const SearchAndFilterLazy = lazy(() => 
  import('./SearchAndFilter').then(module => ({ default: module.default }))
);

export const ChartsLazy = lazy(() => 
  import('./Charts').then(module => ({ default: module.default }))
);

// Performance-optimized loading fallback
function LoadingFallback({ 
  height = 'h-64', 
  message = 'Loading...' 
}: { 
  height?: string; 
  message?: string; 
}) {
  return (
    <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg animate-pulse`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

// Chart-specific loading fallback
function ChartLoadingFallback() {
  return (
    <div className="h-48 sm:h-56 lg:h-64 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto"></div>
      </div>
    </div>
  );
}

// Wrapper components with optimized suspense
export function DashboardAnalytics(props: any) {
  return (
    <Suspense fallback={<LoadingFallback height="h-96" message="Loading analytics..." />}>
      <DashboardAnalyticsLazy {...props} />
    </Suspense>
  );
}

export function SearchAndFilter(props: any) {
  return (
    <Suspense fallback={<LoadingFallback height="h-32" message="Loading search filters..." />}>
      <SearchAndFilterLazy {...props} />
    </Suspense>
  );
}

export function Charts(props: any) {
  return (
    <Suspense fallback={<ChartLoadingFallback />}>
      <ChartsLazy {...props} />
    </Suspense>
  );
}

// Preload utility for critical components
export function preloadDashboardAnalytics() {
  return import('./DashboardAnalytics');
}

export function preloadSearchAndFilter() {
  return import('./SearchAndFilter');
}

export function preloadCharts() {
  return import('./Charts');
}
