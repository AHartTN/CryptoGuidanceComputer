/**
 * @file ICoinInfoUpdate.ts
 * @description Type for partial updates to coin metadata/state (used in coin list management).
 */

export type ICoinInfoUpdate = {
  /** CoinGecko or other unique coin ID (optional) */
  id?: string;
  /** Ticker symbol (optional) */
  symbol?: string;
  /** Full coin name (optional) */
  name?: string;
  /** Flagged status (optional) */
  isFlagged?: boolean;
  /** DSKY noun number (optional) */
  nounNumber?: number;
  /** Last updated timestamp (optional) */
  lastUpdated?: Date;
};
