/**
 * @file IBlockInfo.ts
 * @description Interface for blockchain block information (number, hashes, gas, miner, transactions).
 */

export interface IBlockInfo {
  /** Block number */
  number: number;
  /** Block hash */
  hash: string;
  /** Parent block hash */
  parentHash: string;
  /** Block timestamp (unix epoch) */
  timestamp: number;
  /** Gas limit for the block */
  gasLimit: string;
  /** Gas used in the block */
  gasUsed: string;
  /** Miner address */
  miner: string;
  /** Block difficulty */
  difficulty: string;
  /** List of transaction hashes in the block */
  transactions: string[];
}
