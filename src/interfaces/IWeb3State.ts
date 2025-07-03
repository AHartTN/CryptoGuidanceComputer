/**
 * @file IWeb3State.ts
 * @description Interface for Web3 state (connection, account, network, balance).
 */

export interface IWeb3State {
  /** Connection status */
  isConnected: boolean;
  /** Connected wallet address */
  account: string | null;
  /** Current network name */
  network: string | null;
  /** Account balance in ETH */
  balance: string | null;
}
