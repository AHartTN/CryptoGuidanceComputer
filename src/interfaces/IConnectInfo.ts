/**
 * @file IConnectInfo.ts
 * @description Interface for connection information (chain, network, provider).
 */

export interface IConnectInfo {
  /** Blockchain chain ID */
  chainId: number;
  /** Network name (e.g., 'Ethereum Mainnet') */
  network: string;
  /** Provider name (e.g., 'MetaMask', 'Alchemy') */
  provider: string;
}
