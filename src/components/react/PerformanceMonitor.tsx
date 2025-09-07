import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
}

export default function PerformanceMonitor({ 
  enabled = false,
  showInDevelopment = true 
}: { 
  enabled?: boolean;
  showInDevelopment?: boolean;
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development unless explicitly enabled
    const isDevelopment = import.meta.env.DEV;
    if (!enabled && (!showInDevelopment || !isDevelopment)) {
      return;
    }

    const calculateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
      const renderTime = navigation ? navigation.domContentLoadedEventEnd - navigation.responseStart : 0;

      // Estimate memory usage (if available)
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;

      // Estimate bundle size from resource entries
      const resourceEntries = performance.getEntriesByType('resource');
      const jsResources = resourceEntries.filter((entry: any) => 
        entry.name.endsWith('.js') && entry.name.includes('_astro')
      );
      const bundleSize = jsResources.reduce((total: number, entry: any) => 
        total + (entry.transferSize || 0), 0) / 1024;

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        bundleSize: Math.round(bundleSize * 10) / 10,
        memoryUsage: Math.round(memoryUsage * 10) / 10
      });
    };

    // Calculate metrics after page load
    if (document.readyState === 'complete') {
      calculateMetrics();
    } else {
      window.addEventListener('load', calculateMetrics);
      return () => window.removeEventListener('load', calculateMetrics);
    }
  }, [enabled, showInDevelopment]);

  useEffect(() => {
    // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!metrics || !isVisible) {
    return null;
  }

  const getPerformanceColor = (metric: string, value: number) => {
    switch (metric) {
      case 'loadTime':
        if (value < 1000) return 'text-green-600';
        if (value < 2000) return 'text-yellow-600';
        return 'text-red-600';
      case 'renderTime':
        if (value < 500) return 'text-green-600';
        if (value < 1000) return 'text-yellow-600';
        return 'text-red-600';
      case 'bundleSize':
        if (value < 500) return 'text-green-600';
        if (value < 1000) return 'text-yellow-600';
        return 'text-red-600';
      case 'memoryUsage':
        if (value < 50) return 'text-green-600';
        if (value < 100) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50 min-w-[200px]">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Performance</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white ml-2"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Load Time:</span>
          <span className={getPerformanceColor('loadTime', metrics.loadTime)}>
            {metrics.loadTime}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Render Time:</span>
          <span className={getPerformanceColor('renderTime', metrics.renderTime)}>
            {metrics.renderTime}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Bundle Size:</span>
          <span className={getPerformanceColor('bundleSize', metrics.bundleSize)}>
            {metrics.bundleSize}KB
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Memory:</span>
          <span className={getPerformanceColor('memoryUsage', metrics.memoryUsage)}>
            {metrics.memoryUsage}MB
          </span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}
