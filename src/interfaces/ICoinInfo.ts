/**
 * @file ICoinInfo.ts
 * @description Interface for coin metadata and state (not price data).
 */

// ICoinInfo is for coin metadata/state only. Price data is in ICryptoPriceData.
export interface ICoinInfo {
  /** CoinGecko or other unique coin ID */
  id: string;
  /** Ticker symbol (e.g., BTC, ETH) */
  symbol: string;
  /** Full coin name (e.g., Bitcoin) */
  name: string;
  /** Whether the coin is flagged for special attention */
  isFlagged: boolean;
  /** DSKY noun number assigned to this coin */
  nounNumber: number;
  /** Last updated timestamp (optional) */
  lastUpdated?: Date;
}
