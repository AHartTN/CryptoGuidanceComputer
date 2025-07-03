/**
 * @file IChartConfig.ts
 * @description Interface for chart configuration options in the PerformanceDashboard and analytics modules.
 */

// Interface for chart configuration in PerformanceDashboard
export interface IChartConfig {
  /** Whether to show grid lines on the chart */
  showGrid: boolean;
  /** Whether to show the chart legend */
  showLegend: boolean;
  /** Time range for the chart (in milliseconds) */
  timeRange: number;
  /** Maximum number of data points to display */
  maxDataPoints: number;
}
