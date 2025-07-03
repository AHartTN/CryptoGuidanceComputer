/**
 * @file IPriceAlert.ts
 * @description Interface for price alert configuration and callback logic.
 */

import type { ICryptoPriceData } from "./ICryptoPriceData";

export interface IPriceAlert {
  /** Unique alert ID */
  id: string;
  /** Cryptocurrency symbol (e.g., BTC, ETH) */
  symbol: string;
  /** Alert condition type */
  condition: "above" | "below" | "change_percent";
  /** Numeric threshold for triggering the alert */
  threshold: number;
  /** Whether the alert is enabled */
  enabled: boolean;
  /** Callback function to execute when alert triggers */
  callback: (data: ICryptoPriceData) => void;
  /** Optional alert message */
  message?: string;
  /** Optional alert type */
  type?: string;
  /** Optional timestamp for alert creation */
  timestamp?: number;
}
