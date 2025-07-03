/**
 * @file ICoinListManager.ts
 * @description Interface for coin list manager (state and actions bundle for coin list management).
 */

import type { ICoinListState } from "./ICoinListState";
import type { ICoinListActions } from "./ICoinListActions";

export interface ICoinListManager {
  /** Current coin list state */
  state: ICoinListState;
  /** Actions for managing the coin list */
  actions: ICoinListActions;
}
