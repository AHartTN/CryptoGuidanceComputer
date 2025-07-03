/**
 * @file IMetaMaskEthereumProvider.ts
 * @description Interface for MetaMask Ethereum provider injected into the browser window.
 */

export interface IMetaMaskEthereumProvider {
  /** True if provider is MetaMask */
  isMetaMask?: boolean;
  /** Selected wallet address */
  selectedAddress?: string;
  /** Current chain ID (hex string) */
  chainId?: string;
  /** Network version (string) */
  networkVersion?: string;
  /** Request method for JSON-RPC calls */
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  /** Subscribe to provider events */
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  /** Remove a specific event listener */
  removeListener: (
    event: string,
    callback: (...args: unknown[]) => void,
  ) => void;
  /** Remove all listeners for an event */
  removeAllListeners: (event?: string) => void;
}
