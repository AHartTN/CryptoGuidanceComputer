/**
 * @file IBlockchainData.ts
 * @description Interface for blockchain network data (block, gas, network, timestamp).
 */

export interface IBlockchainData {
  /** Latest block number */
  blockNumber: number;
  /** Current gas price (as string for formatting) */
  gasPrice: string;
  /** Network name (e.g., 'Ethereum Mainnet') */
  networkName: string;
  /** Timestamp of the data (Date object) */
  timestamp: Date;
}
