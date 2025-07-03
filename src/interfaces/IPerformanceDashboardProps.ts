/**
 * @file IPerformanceDashboardProps.ts
 * @description Interface for props for the PerformanceDashboard React component.
 */

// Interface for PerformanceDashboard component props
export interface IPerformanceDashboardProps {
  /** Callback for closing the dashboard */
  onClose?: () => void;
  /** Whether to use compact mode */
  compactMode?: boolean;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
}
