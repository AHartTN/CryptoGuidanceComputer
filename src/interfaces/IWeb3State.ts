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
