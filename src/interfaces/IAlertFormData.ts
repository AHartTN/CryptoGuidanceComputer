/**
 * @file IAlertFormData.ts
 * @description Interface for alert form data used in the RealTimeDashboard and related alerting features.
 */

// Interface for alert form data in RealTimeDashboard
export interface IAlertFormData {
  /** Cryptocurrency symbol (e.g., BTC, ETH) */
  symbol: string;
  /** Alert condition type: 'above', 'below', or 'change_percent' */
  condition: "above" | "below" | "change_percent";
  /** Numeric threshold for triggering the alert */
  threshold: number;
}
