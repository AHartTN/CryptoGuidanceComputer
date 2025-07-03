import { useEffect } from 'react';
import type { MetricType } from '../../../services/monitoring/PerformanceMonitoringService';

export function useDSKYDebug(recordMetric: (type: string | MetricType, value: number, name?: string) => void) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (recordMetric) {
        recordMetric('ERROR_RATE', 1, event.error?.name || 'UnknownError');
      }
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [recordMetric]);
}
