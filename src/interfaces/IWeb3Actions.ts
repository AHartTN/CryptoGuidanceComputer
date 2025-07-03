/**
 * @file IWeb3Actions.ts
 * @description Interface for Web3 state management actions (connection, balance, network, disconnect, reset).
 */

export interface IWeb3Actions {
  /** Update connection state with account and optional network */
  updateConnection: (account: string, network?: string) => void;
  /** Update the account balance */
  updateBalance: (balance: string) => void;
  /** Update the network name */
  updateNetwork: (network: string) => void;
  /** Disconnect the wallet */
  disconnect: () => void;
  /** Reset the Web3 state */
  reset: () => void;
}
