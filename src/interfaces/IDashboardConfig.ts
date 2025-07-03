// Interface for dashboard configuration in RealTimeDashboard
export interface IDashboardConfig {
  showPrices: boolean;
  showBlockchain: boolean;
  showAlerts: boolean;
  showAnalytics: boolean;
  updateInterval: number;
  compactMode: boolean;
}
