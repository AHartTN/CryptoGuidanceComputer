// Interface for chart configuration in PerformanceDashboard
export interface IChartConfig {
  showGrid: boolean;
  showLegend: boolean;
  timeRange: number; // in milliseconds
  maxDataPoints: number;
}
