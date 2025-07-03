/**
 * @file OptimizedOutputProps.ts
 * @description Props interface for OptimizedOutput component.
 */

import type { IWeb3State } from "./IWeb3State";

// Props for OptimizedOutput component
export interface OptimizedOutputProps {
  /** Current Web3 state */
  web3State: IWeb3State;
  /** Array of status messages to display */
  statusMessages: string[];
}
