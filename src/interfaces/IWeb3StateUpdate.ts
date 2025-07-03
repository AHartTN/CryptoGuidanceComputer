/**
 * @file IWeb3StateUpdate.ts
 * @description DTO type for updating IWeb3State (all fields optional).
 */

// DTO for updating IWeb3State, all fields optional but explicit
export type IWeb3StateUpdate = {
  /** Optional connection status */
  isConnected?: boolean;
  /** Optional wallet address */
  account?: string | null;
  /** Optional network name */
  network?: string | null;
  /** Optional account balance */
  balance?: string | null;
};
