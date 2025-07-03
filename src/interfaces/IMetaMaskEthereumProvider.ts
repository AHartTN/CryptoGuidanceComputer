export interface IMetaMaskEthereumProvider {
  isMetaMask?: boolean;
  selectedAddress?: string;
  chainId?: string;
  networkVersion?: string;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  removeAllListeners: (event?: string) => void;
}
