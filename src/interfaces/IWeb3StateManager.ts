/**
 * @file IWeb3StateManager.ts
 * @description Interface for Web3 state manager (state and actions bundle).
 */

import type { IWeb3State } from "./IWeb3State";
import type { IWeb3Actions } from "./IWeb3Actions";

export interface IWeb3StateManager {
  /** Current Web3 state */
  state: IWeb3State;
  /** Actions for managing Web3 state */
  actions: IWeb3Actions;
}
