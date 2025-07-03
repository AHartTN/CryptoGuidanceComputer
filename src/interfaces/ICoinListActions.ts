/**
 * @file ICoinListActions.ts
 * @description Interface for coin list management actions (loading, flagging, lookup, price update).
 */

import type { ICoinInfo } from "./ICoinInfo";
import type { ICoinInfoUpdate } from "./ICoinInfoUpdate";

export interface ICoinListActions {
  /** Loads the coin list asynchronously */
  loadCoinList: () => Promise<void>;
  /** Toggles the flagged status for a coin by ID */
  toggleCoinFlag: (coinId: string) => void;
  /** Clears all flagged coins */
  clearAllFlags: () => void;
  /** Gets a coin by its DSKY noun number */
  getCoinByNoun: (nounNumber: number) => ICoinInfo | undefined;
  /** Gets a coin by its unique ID */
  getCoinById: (coinId: string) => ICoinInfo | undefined;
  /** Returns all flagged coins */
  getFlaggedCoins: () => ICoinInfo[];
  /** Updates the price or metadata for a coin by ID */
  updateCoinPrice: (coinId: string, priceData: ICoinInfoUpdate) => void;
}
