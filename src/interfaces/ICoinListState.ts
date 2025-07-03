/**
 * @file ICoinListState.ts
 * @description Interface for coin list state (maps, flags, and metadata for coin management).
 */

import type { ICoinInfo } from "./ICoinInfo";

export interface ICoinListState {
  /** Map of DSKY noun number to coin info */
  coinsByNoun: Map<number, ICoinInfo>;
  /** Map of coin ID to coin info */
  coinsById: Map<string, ICoinInfo>;
  /** Set of flagged coin IDs */
  flaggedCoins: Set<string>;
  /** Next available noun number for dynamic assignment */
  nextNounNumber: number;
  /** Whether the coin list is loaded */
  isLoaded: boolean;
  /** Last updated timestamp (optional) */
  lastUpdated?: Date;
}
