// Apollo DSKY - Performance Monitoring Service
// Advanced application performance monitoring and metrics collection

import React from "react";
import { CacheService, CacheStrategy } from "../cache/CacheService";

/** Performance Metric Types */
export enum MetricType {
  RESPONSE_TIME = "RESPONSE_TIME",
  MEMORY_USAGE = "MEMORY_USAGE",
  CPU_USAGE = "CPU_USAGE",
  NETWORK_LATENCY = "NETWORK_LATENCY",
  ERROR_RATE = "ERROR_RATE",
  TRANSACTION_THROUGHPUT = "TRANSACTION_THROUGHPUT",
  COMPONENT_RENDER_TIME = "COMPONENT_RENDER_TIME",
  API_CALL_DURATION = "API_CALL_DURATION",
  CACHE_HIT_RATE = "CACHE_HIT_RATE",
  BLOCKCHAIN_SYNC_TIME = "BLOCKCHAIN_SYNC_TIME",
}

/** Performance Metric */
export interface IPerformanceMetric {
  id: string;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  component?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

/** Performance Alert */
export interface IPerformanceAlert {
  id: string;
  metric: MetricType;
  threshold: number;
  condition: "above" | "below";
  enabled: boolean;
  callback: (metric: IPerformanceMetric) => void;
}

/** Performance Statistics */
export interface IPerformanceStats {
  average: number;
  min: number;
  max: number;
  median: number;
  percentile95: number;
  standardDeviation: number;
  count: number;
  trend: "IMPROVING" | "DEGRADING" | "STABLE";
}

/** System Resource Info */
export interface ISystemResourceInfo {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  networkLatency: number;
  diskUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  timestamp: number;
}

/** Performance Monitoring Configuration */
export interface IPerformanceConfig {
  enabledMetrics: MetricType[];
  sampleRate: number;
  batchSize: number;
  flushInterval: number;
  retentionPeriod: number;
  alertThresholds: { [key in MetricType]?: number };
  enableResourceMonitoring: boolean;
  enableErrorTracking: boolean;
  enableNetworkMonitoring: boolean;
  enableDebugMode?: boolean;
}

/** Performance Monitoring Service */
export class PerformanceMonitoringService {
  private cache: CacheService;
  private metrics: Map<string, IPerformanceMetric[]> = new Map();
  private alerts: Map<string, IPerformanceAlert> = new Map();
  private resourceMonitor?: NodeJS.Timeout;
  private flushTimer?: NodeJS.Timeout;
  private startTime: number;
  private config: IPerformanceConfig;

  // Event callbacks
  private onMetricRecorded?: (metric: IPerformanceMetric) => void;
  private onAlertTriggered?: (
    alert: IPerformanceAlert,
    metric: IPerformanceMetric,
  ) => void;
  private onPerformanceIssue?: (issue: unknown) => void;

  constructor(config?: Partial<IPerformanceConfig>) {
    this.cache = new CacheService({
      defaultTTL: 3600000, // 1 hour
      maxSize: 10000,
      strategy: CacheStrategy.LRU,
      enableMetrics: true,
    });

    this.config = {
      enabledMetrics: Object.values(MetricType),
      sampleRate: 1.0,
      batchSize: 100,
      flushInterval: 60000, // 1 minute
      retentionPeriod: 86400000, // 24 hours
      alertThresholds: {
        [MetricType.RESPONSE_TIME]: 5000, // 5 seconds
        [MetricType.MEMORY_USAGE]: 80, // 80%
        [MetricType.CPU_USAGE]: 85, // 85%
        [MetricType.ERROR_RATE]: 5, // 5%
      },
      enableResourceMonitoring: true,
      enableErrorTracking: true,
      enableNetworkMonitoring: true,
      ...config,
    };

    this.startTime = Date.now();
    this.initialize();
  }

  /** Initialize monitoring service */
  private initialize(): void {
    console.log("[PerformanceMonitoring] Initializing service...");

    if (this.config.enableResourceMonitoring) {
      this.startResourceMonitoring();
    }

    this.startFlushTimer();
    this.setupPerformanceObserver();
  }

  /** Record a performance metric */
  recordMetric(
    type: MetricType,
    value: number,
    name?: string,
    component?: string,
    operation?: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.config.enabledMetrics.includes(type)) return;
    if (Math.random() > this.config.sampleRate) return;

    const metric: IPerformanceMetric = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      name: name || type,
      value,
      unit: this.getMetricUnit(type),
      timestamp: Date.now(),
      component,
      operation,
      metadata,
    };

    // Store metric
    const typeKey = type.toString();
    if (!this.metrics.has(typeKey)) {
      this.metrics.set(typeKey, []);
    }
    this.metrics.get(typeKey)!.push(metric);

    // Cache metric
    this.cache.set(`metric:${metric.id}`, metric);

    // Check alerts
    this.checkAlerts(metric);

    // Notify listeners
    if (this.onMetricRecorded) {
      this.onMetricRecorded(metric);
    }
    console.log(
      `[PerformanceMonitoring] Recorded ${type}: ${value}${metric.unit}`,
    );
  }

  /** Start timing operation */
  startTimer(operation: string, component?: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(
        MetricType.RESPONSE_TIME,
        duration,
        operation,
        component,
        operation,
      );
    };
  }

  /** Measure component render time */
  measureComponentRender<
    T extends React.ComponentType<Record<string, unknown>>,
  >(Component: T, name: string): T {
    const WrappedComponent = (props: Record<string, unknown>) => {
      const timer = this.startTimer(`render_${name}`, name);

      React.useEffect(() => {
        timer();
      });

      return React.createElement(Component, props);
    };

    return WrappedComponent as T;
  }

  /** Measure API call */
  async measureApiCall<T>(
    operation: string,
    apiCall: () => Promise<T>,
  ): Promise<T> {
    const timer = this.startTimer(operation, "API");
    const startTime = Date.now();

    try {
      const result = await apiCall();
      timer();

      this.recordMetric(
        MetricType.API_CALL_DURATION,
        Date.now() - startTime,
        operation,
        "API",
        operation,
        { success: true },
      );

      return result;
    } catch (_error) {
      timer();

      this.recordMetric(
        MetricType.API_CALL_DURATION,
        Date.now() - startTime,
        operation,
        "API",
        operation,
        {
          success: false,
          error: _error instanceof Error ? _error.message : String(_error),
        },
      );

      throw _error;
    }
  }

  /** Record error */
  recordError(error: Error, component?: string, operation?: string): void {
    if (!this.config.enableErrorTracking) return;

    this.recordMetric(
      MetricType.ERROR_RATE,
      1,
      error.name,
      component,
      operation,
      {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      },
    );
  }

  /** Add performance alert */
  addAlert(alert: IPerformanceAlert): void {
    this.alerts.set(alert.id, alert);
    console.log(`[PerformanceMonitoring] Added alert for ${alert.metric}`);
  }

  /** Remove performance alert */
  removeAlert(alertId: string): void {
    if (this.alerts.delete(alertId)) {
      console.log(`[PerformanceMonitoring] Removed alert: ${alertId}`);
    }
  }

  /** Get performance statistics for metric type */
  getStats(type: MetricType, timeRange?: number): IPerformanceStats | null {
    const metrics = this.getMetrics(type, timeRange);
    if (metrics.length === 0) return null;

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / count;

    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / count;
    const standardDeviation = Math.sqrt(variance);

    const median =
      count % 2 === 0
        ? (values[count / 2 - 1] + values[count / 2]) / 2
        : values[Math.floor(count / 2)];

    const percentile95Index = Math.floor(count * 0.95);
    const percentile95 = values[percentile95Index] || values[count - 1];

    // Calculate trend
    const trend = this.calculateTrend(metrics);

    return {
      average,
      min: values[0],
      max: values[count - 1],
      median,
      percentile95,
      standardDeviation,
      count,
      trend,
    };
  }

  /** Get metrics by type */
  getMetrics(type: MetricType, timeRange?: number): IPerformanceMetric[] {
    const metrics = this.metrics.get(type.toString()) || [];

    if (!timeRange) return metrics;

    const cutoff = Date.now() - timeRange;
    return metrics.filter((m) => m.timestamp >= cutoff);
  }

  /** Get all metrics */
  getAllStats(): { [key in MetricType]?: IPerformanceStats } {
    const stats: { [key in MetricType]?: IPerformanceStats } = {};

    for (const type of Object.values(MetricType)) {
      const typeStats = this.getStats(type);
      if (typeStats) {
        stats[type] = typeStats;
      }
    }

    return stats;
  }

  /** Get system resource information */
  getSystemResources(): ISystemResourceInfo {
    const memory = this.getMemoryUsage();
    const cpu = this.getCPUUsage();
    const network = this.getNetworkLatency();

    return {
      memoryUsage: memory,
      cpuUsage: cpu,
      networkLatency: network,
      timestamp: Date.now(),
    };
  }

  /** Get performance report */
  getPerformanceReport(): {
    uptime: number;
    stats: { [key in MetricType]?: IPerformanceStats };
    resources: ISystemResourceInfo;
    alerts: IPerformanceAlert[];
    recentMetrics: IPerformanceMetric[];
    recommendations: string[];
  } {
    const uptime = Date.now() - this.startTime;
    const stats = this.getAllStats();
    const resources = this.getSystemResources();
    const alerts = Array.from(this.alerts.values());
    const recentMetrics = this.getRecentMetrics(50);
    const recommendations = this.generateRecommendations(stats, resources);

    return {
      uptime,
      stats,
      resources,
      alerts,
      recentMetrics,
      recommendations,
    };
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onMetricRecorded?: (metric: IPerformanceMetric) => void;
    onAlertTriggered?: (
      alert: IPerformanceAlert,
      metric: IPerformanceMetric,
    ) => void;
    onPerformanceIssue?: (issue: unknown) => void;
  }): void {
    this.onMetricRecorded = callbacks.onMetricRecorded;
    this.onAlertTriggered = callbacks.onAlertTriggered;
    this.onPerformanceIssue = callbacks.onPerformanceIssue;
  }

  /** Clear old metrics */
  cleanup(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;

    for (const [type, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter((m) => m.timestamp >= cutoff);
      this.metrics.set(type, filtered);
    }

    console.log("[PerformanceMonitoring] Cleaned up old metrics");
  }

  /** Dispose of the service */
  dispose(): void {
    if (this.resourceMonitor) {
      clearInterval(this.resourceMonitor);
    }

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.metrics.clear();
    this.alerts.clear();
    this.cache.clear();

    console.log("[PerformanceMonitoring] Disposed successfully");
  }

  /** Get metric unit */
  private getMetricUnit(type: MetricType): string {
    switch (type) {
      case MetricType.RESPONSE_TIME:
      case MetricType.COMPONENT_RENDER_TIME:
      case MetricType.API_CALL_DURATION:
      case MetricType.BLOCKCHAIN_SYNC_TIME:
        return "ms";
      case MetricType.MEMORY_USAGE:
      case MetricType.CPU_USAGE:
      case MetricType.CACHE_HIT_RATE:
      case MetricType.ERROR_RATE:
        return "%";
      case MetricType.NETWORK_LATENCY:
        return "ms";
      case MetricType.TRANSACTION_THROUGHPUT:
        return "tx/s";
      default:
        return "";
    }
  }

  /** Check alerts for metric */
  private checkAlerts(metric: IPerformanceMetric): void {
    for (const alert of this.alerts.values()) {
      if (alert.metric !== metric.type || !alert.enabled) continue;

      const shouldAlert =
        alert.condition === "above"
          ? metric.value > alert.threshold
          : metric.value < alert.threshold;

      if (shouldAlert) {
        console.warn(`[PerformanceMonitoring] Alert triggered: ${alert.id}`);

        if (this.onAlertTriggered) {
          this.onAlertTriggered(alert, metric);
        }

        alert.callback(metric);
      }
    }
  }

  /** Start resource monitoring */
  private startResourceMonitoring(): void {
    this.resourceMonitor = setInterval(() => {
      const resources = this.getSystemResources();

      this.recordMetric(
        MetricType.MEMORY_USAGE,
        resources.memoryUsage.percentage,
      );
      this.recordMetric(MetricType.CPU_USAGE, resources.cpuUsage);
      this.recordMetric(MetricType.NETWORK_LATENCY, resources.networkLatency);
    }, 5000); // Every 5 seconds
  }

  /** Start flush timer */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.cleanup();
    }, this.config.flushInterval);
  }

  /** Setup performance observer */
  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver === "undefined") return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            this.recordMetric(
              MetricType.RESPONSE_TIME,
              entry.duration,
              "page_load",
              "Navigation",
            );
          } else if (entry.entryType === "resource") {
            this.recordMetric(
              MetricType.NETWORK_LATENCY,
              entry.duration,
              entry.name,
              "Resource",
            );
          }
        }
      });

      observer.observe({ entryTypes: ["navigation", "resource"] });
    } catch (_error) {
      console.warn("[PerformanceMonitoring] PerformanceObserver not supported");
    }
  }

  /** Get memory usage */
  private getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = (
        performance as Performance & {
          memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
        }
      ).memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        };
      }
    }
    return { used: 0, total: 0, percentage: 0 };
  }

  /** Get CPU usage estimate */
  private getCPUUsage(): number {
    // Browser doesn't provide direct CPU usage
    // We'll estimate based on frame timing
    const now = performance.now();
    const elapsed = now - (this.lastCPUCheck || now);
    this.lastCPUCheck = now;

    // Rough estimation based on timing consistency
    return Math.min(elapsed > 16.67 ? (elapsed - 16.67) * 2 : 0, 100);
  }
  private lastCPUCheck?: number;

  /** Get network latency estimate */
  private getNetworkLatency(): number {
    // Return cached latency or estimate
    return (this.cache.get("network:latency") as number) || 0;
  }

  /** Calculate trend */
  private calculateTrend(
    metrics: IPerformanceMetric[],
  ): "IMPROVING" | "DEGRADING" | "STABLE" {
    if (metrics.length < 10) return "STABLE";

    const recent = metrics.slice(-10).map((m) => m.value);
    const older = metrics.slice(-20, -10).map((m) => m.value);

    if (older.length === 0) return "STABLE";

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return "DEGRADING";
    if (change < -0.1) return "IMPROVING";
    return "STABLE";
  }

  /** Get recent metrics */
  private getRecentMetrics(limit: number): IPerformanceMetric[] {
    const allMetrics: IPerformanceMetric[] = [];

    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    return allMetrics.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /** Generate performance recommendations */
  private generateRecommendations(
    stats: { [key in MetricType]?: IPerformanceStats },
    resources: ISystemResourceInfo,
  ): string[] {
    const recommendations: string[] = [];

    // Memory recommendations
    if (resources.memoryUsage.percentage > 80) {
      recommendations.push(
        "High memory usage detected. Consider implementing memory optimization strategies.",
      );
    }

    // Response time recommendations
    const responseTimeStats = stats[MetricType.RESPONSE_TIME];
    if (responseTimeStats && responseTimeStats.average > 3000) {
      recommendations.push(
        "Average response time is high. Consider implementing caching or optimizing API calls.",
      );
    }

    // Error rate recommendations
    const errorRateStats = stats[MetricType.ERROR_RATE];
    if (errorRateStats && errorRateStats.average > 5) {
      recommendations.push(
        "Error rate is elevated. Review error logs and implement better error handling.",
      );
    }

    // CPU recommendations
    if (resources.cpuUsage > 85) {
      recommendations.push(
        "High CPU usage detected. Consider optimizing computational intensive operations.",
      );
    }

    return recommendations;
  }

  /** Create service instance for DSKY */
  static createForDSKY(): PerformanceMonitoringService {
    return new PerformanceMonitoringService({
      enabledMetrics: [
        MetricType.RESPONSE_TIME,
        MetricType.COMPONENT_RENDER_TIME,
        MetricType.API_CALL_DURATION,
        MetricType.MEMORY_USAGE,
        MetricType.ERROR_RATE,
        MetricType.CACHE_HIT_RATE,
        MetricType.BLOCKCHAIN_SYNC_TIME,
      ],
      sampleRate: 0.1, // 10% sampling for production
      alertThresholds: {
        [MetricType.RESPONSE_TIME]: 3000, // 3 seconds
        [MetricType.MEMORY_USAGE]: 75, // 75%
        [MetricType.ERROR_RATE]: 3, // 3%
      },
    });
  }
}
