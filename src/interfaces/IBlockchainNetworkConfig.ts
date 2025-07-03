/**
 * @file IBlockchainNetworkConfig.ts
 * @description Interface for blockchain network configuration (chain, RPC, explorer, currency).
 */

export interface IBlockchainNetworkConfig {
  /** Network name (e.g., 'Ethereum Mainnet') */
  name: string;
  /** Chain ID (numeric) */
  chainId: number;
  /** Array of RPC endpoint URLs */
  rpcUrls: string[];
  /** Optional block explorer URLs */
  blockExplorerUrls?: string[];
  /** Native currency details */
  nativeCurrency: {
    /** Currency name (e.g., 'Ether') */
    name: string;
    /** Currency symbol (e.g., 'ETH') */
    symbol: string;
    /** Number of decimals */
    decimals: number;
  };
}
