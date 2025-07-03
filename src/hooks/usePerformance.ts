// Apollo DSKY - Advanced Performance Hook
// React hook for performance monitoring and optimization

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  PerformanceMonitoringService,
  MetricType,
  IPerformanceAlert,
  IPerformanceStats,
  ISystemResourceInfo,
} from "../services/monitoring/PerformanceMonitoringService";
import {
  ApplicationLoggingService,
  LogCategory,
} from "../services/logging/ApplicationLoggingService";

/** Performance Hook Configuration */
export interface IUsePerformanceConfig {
  enableMonitoring: boolean;
  enableComponentTracking: boolean;
  enableApiTracking: boolean;
  enableErrorTracking: boolean;
  componentName?: string;
  sampleRate?: number;
  alertThresholds?: { [key in MetricType]?: number };
}

/** Performance Hook State */
export interface IUsePerformanceState {
  // Current metrics
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
  // Statistics
  stats: { [key in MetricType]?: IPerformanceStats };

  // Alerts
  alerts: IPerformanceAlert[];
  recentAlerts: IPerformanceAlert[];

  // Status
  isMonitoring: boolean;
  lastUpdate: number;
  // System resources
  systemResources: ISystemResourceInfo | null;
}

/** Performance Hook Actions */
export interface IUsePerformanceActions {
  // Monitoring controls
  startMonitoring: () => void;
  stopMonitoring: () => void;

  // Metrics
  recordMetric: (type: MetricType, value: number, name?: string) => void;
  startTimer: (operation: string) => () => void;
  measureAsync: <T>(operation: string, fn: () => Promise<T>) => Promise<T>;

  // Alerts
  addAlert: (alert: IPerformanceAlert) => void;
  removeAlert: (alertId: string) => void;
  clearAlerts: () => void;
  // Utilities
  getReport: () => Record<string, unknown>;
  exportMetrics: () => string;
  clearMetrics: () => void;
}

/** Performance Hook Return Type */
export interface IUsePerformanceReturn
  extends IUsePerformanceState,
    IUsePerformanceActions {}

/** Advanced Performance Monitoring Hook */
export const usePerformance = (
  config: Partial<IUsePerformanceConfig> = {},
): IUsePerformanceReturn => {
  // Configuration with defaults
  const finalConfig = useMemo(
    () => ({
      enableMonitoring: true,
      enableComponentTracking: true,
      enableApiTracking: true,
      enableErrorTracking: true,
      sampleRate: 0.1, // 10% sampling by default
      ...config,
    }),
    [config],
  );

  // Services
  const [performanceService] = useState(
    () =>
      new PerformanceMonitoringService({
        sampleRate: finalConfig.sampleRate,
        alertThresholds: finalConfig.alertThresholds,
        enableResourceMonitoring: true,
        enableErrorTracking: finalConfig.enableErrorTracking,
        enableNetworkMonitoring: finalConfig.enableApiTracking,
      }),
  );

  const [loggingService] = useState(() =>
    ApplicationLoggingService.createForDSKY(),
  );

  // State
  const [state, setState] = useState<IUsePerformanceState>({
    responseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    errorRate: 0,
    stats: {},
    alerts: [],
    recentAlerts: [],
    isMonitoring: false,
    lastUpdate: 0,
    systemResources: null,
  });
  // Refs
  const isInitialized = useRef(false);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);
  const componentMountTime = useRef(Date.now());

  // Update metrics
  const updateMetrics = useCallback(() => {
    try {
      const stats = performanceService.getAllStats();
      const systemResources = performanceService.getSystemResources();
      const alerts = Array.from(performanceService["alerts"].values());

      setState((prev) => ({
        ...prev,
        responseTime: stats[MetricType.RESPONSE_TIME]?.average || 0,
        memoryUsage: systemResources.memoryUsage.percentage,
        cpuUsage: systemResources.cpuUsage,
        errorRate: stats[MetricType.ERROR_RATE]?.average || 0,
        stats,
        alerts,
        systemResources,
        lastUpdate: Date.now(),
      }));
    } catch (error) {
      loggingService.error(
        "Failed to update performance metrics",
        LogCategory.PERFORMANCE,
        error instanceof Error ? error : new Error(String(error)),
        { component: finalConfig.componentName },
      );
    }
  }, [performanceService, loggingService, finalConfig]);

  /** Start monitoring */
  const startMonitoring = useCallback(() => {
    if (!finalConfig.enableMonitoring) return;

    setState((prev) => ({ ...prev, isMonitoring: true }));

    // Start update timer
    updateTimer.current = setInterval(() => {
      updateMetrics();
    }, 5000); // Update every 5 seconds

    // Record component mount time if applicable
    if (finalConfig.enableComponentTracking && finalConfig.componentName) {
      const mountDuration = Date.now() - componentMountTime.current;
      performanceService.recordMetric(
        MetricType.COMPONENT_RENDER_TIME,
        mountDuration,
        `mount_${finalConfig.componentName}`,
        finalConfig.componentName,
      );
    }
    loggingService.info(
      "Performance monitoring started",
      LogCategory.PERFORMANCE,
      { component: finalConfig.componentName },
    );
  }, [finalConfig, performanceService, loggingService, updateMetrics]);

  /** Initialize performance monitoring */
  const initialize = useCallback(() => {
    if (isInitialized.current) return;

    console.log("[usePerformance] Initializing performance monitoring...");

    // Setup event callbacks
    performanceService.setEventCallbacks({
      onMetricRecorded: (metric) => {
        loggingService.logPerformance(
          metric.name,
          metric.value,
          finalConfig.componentName || metric.component,
          { type: metric.type, unit: metric.unit },
        );
      },
      onAlertTriggered: (alert, metric) => {
        setState((prev) => ({
          ...prev,
          recentAlerts: [...prev.recentAlerts.slice(-9), alert],
        }));

        loggingService.warn(
          `Performance alert triggered: ${alert.metric} ${alert.condition} ${alert.threshold}`,
          LogCategory.PERFORMANCE,
          { alert, metric, component: finalConfig.componentName },
        );
      },
      onPerformanceIssue: (issue) => {
        loggingService.error(
          `Performance issue detected: ${
            typeof issue === "object" && issue && "message" in issue
              ? (issue as { message: string }).message
              : String(issue)
          }`,
          LogCategory.PERFORMANCE,
          issue instanceof Error ? issue : undefined,
          { issue, component: finalConfig.componentName },
        );
      },
    });

    // Initialize monitoring metrics
    setState((prev) => ({
      ...prev,
      isInitialized: true,
    }));

    if (finalConfig.enableMonitoring) {
      startMonitoring();
    }
    isInitialized.current = true;
  }, [performanceService, loggingService, finalConfig, startMonitoring]); // Removed startMonitoring from deps

  /** Stop monitoring */
  const stopMonitoring = useCallback(() => {
    setState((prev) => ({ ...prev, isMonitoring: false }));
    if (updateTimer.current) {
      clearInterval(updateTimer.current);
      updateTimer.current = null;
    }

    loggingService.info(
      "Performance monitoring stopped",
      LogCategory.PERFORMANCE,
      { component: finalConfig.componentName },
    );
  }, [loggingService, finalConfig]);

  /** Record metric */
  const recordMetric = useCallback(
    (type: MetricType, value: number, name?: string) => {
      performanceService.recordMetric(
        type,
        value,
        name,
        finalConfig.componentName,
        undefined,
        { timestamp: Date.now() },
      );
    },
    [performanceService, finalConfig],
  );

  /** Start timer */
  const startTimer = useCallback(
    (operation: string) => {
      return performanceService.startTimer(
        operation,
        finalConfig.componentName,
      );
    },
    [performanceService, finalConfig],
  );

  /** Measure async operation */
  const measureAsync = useCallback(
    async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
      return performanceService.measureApiCall(operation, fn);
    },
    [performanceService],
  );

  /** Add alert */
  const addAlert = useCallback(
    (alert: IPerformanceAlert) => {
      performanceService.addAlert(alert);
      setState((prev) => ({
        ...prev,
        alerts: [...prev.alerts, alert],
      }));
    },
    [performanceService],
  );

  /** Remove alert */
  const removeAlert = useCallback(
    (alertId: string) => {
      performanceService.removeAlert(alertId);
      setState((prev) => ({
        ...prev,
        alerts: prev.alerts.filter((a) => a.id !== alertId),
      }));
    },
    [performanceService],
  );

  /** Clear alerts */
  const clearAlerts = useCallback(() => {
    state.alerts.forEach((alert) => performanceService.removeAlert(alert.id));
    setState((prev) => ({
      ...prev,
      alerts: [],
      recentAlerts: [],
    }));
  }, [performanceService, state.alerts]);

  /** Get performance report */
  const getReport = useCallback(() => {
    return performanceService.getPerformanceReport();
  }, [performanceService]);

  /** Export metrics */
  const exportMetrics = useCallback(() => {
    const report = performanceService.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }, [performanceService]);

  /** Clear metrics */
  const clearMetrics = useCallback(() => {
    performanceService.cleanup();
    setState((prev) => ({
      ...prev,
      stats: {},
      lastUpdate: Date.now(),
    }));
  }, [performanceService]);

  // Initialize on mount
  useEffect(() => {
    initialize();
    return () => {
      stopMonitoring();
      performanceService.dispose();
    };
  }, [initialize, stopMonitoring, performanceService]);

  // Measure component render time
  useEffect(() => {
    if (!finalConfig.enableComponentTracking || !finalConfig.componentName)
      return;

    const renderStart = performance.now();

    return () => {
      const renderDuration = performance.now() - renderStart;
      performanceService.recordMetric(
        MetricType.COMPONENT_RENDER_TIME,
        renderDuration,
        `render_${finalConfig.componentName}`,
        finalConfig.componentName,
      );
    };
  });

  return {
    // State
    ...state,

    // Actions
    startMonitoring,
    stopMonitoring,
    recordMetric,
    startTimer,
    measureAsync,
    addAlert,
    removeAlert,
    clearAlerts,
    getReport,
    exportMetrics,
    clearMetrics,
  };
};

/** Component Performance Wrapper Hook */
export const useComponentPerformance = (componentName: string) => {
  return usePerformance({
    enableMonitoring: true,
    enableComponentTracking: true,
    enableApiTracking: false,
    componentName,
    sampleRate: 0.05, // 5% sampling for components
  });
};

/** API Performance Hook */
export const useApiPerformance = () => {
  return usePerformance({
    enableMonitoring: true,
    enableComponentTracking: false,
    enableApiTracking: true,
    sampleRate: 0.2, // 20% sampling for API calls
  });
};

/** DSKY Performance Hook */
export const useDSKYPerformance = () => {
  // Always call usePerformance at the top level
  const performance = usePerformance({
    enableMonitoring: true,
    enableComponentTracking: true,
    enableApiTracking: true,
    enableErrorTracking: true,
    componentName: "DSKY",
    sampleRate: 0.1,
    alertThresholds: {
      [MetricType.RESPONSE_TIME]: 3000, // 3 seconds
      [MetricType.MEMORY_USAGE]: 75, // 75%
      [MetricType.ERROR_RATE]: 5, // 5%
    },
  });

  // Add DSKY-specific alerts only once on mount
  useEffect(() => {
    const dskyAlerts: IPerformanceAlert[] = [
      {
        id: "dsky_response_time",
        metric: MetricType.RESPONSE_TIME,
        threshold: 5000,
        condition: "above",
        enabled: true,
        callback: (metric) => {
          console.warn("[DSKY] Slow response time detected:", metric.value);
        },
      },
      {
        id: "dsky_memory_usage",
        metric: MetricType.MEMORY_USAGE,
        threshold: 80,
        condition: "above",
        enabled: true,
        callback: (metric) => {
          console.warn("[DSKY] High memory usage detected:", metric.value);
        },
      },
      {
        id: "dsky_error_rate",
        metric: MetricType.ERROR_RATE,
        threshold: 3,
        condition: "above",
        enabled: true,
        callback: (metric) => {
          console.error("[DSKY] High error rate detected:", metric.value);
        },
      },
    ];

    dskyAlerts.forEach((alert) => performance.addAlert(alert));
    return () => {
      dskyAlerts.forEach((alert) => performance.removeAlert(alert.id));
    };
  }, [performance]); // Only run when performance instance changes

  return performance;
};
