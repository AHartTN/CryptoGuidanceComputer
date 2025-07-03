import React, { memo } from 'react';

// Performance monitoring component
export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const [_performanceMetrics, setPerformanceMetrics] = React.useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setPerformanceMetrics(prev => ({
            ...prev,
            renderTime: entry.duration
          }));
        }
      });
    });
    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
});

// No code changes needed, just ensure this file is named OptimizedUtils.tsx for JSX support.
