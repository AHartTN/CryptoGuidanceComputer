/**
 * @file INFT.ts
 * @description Interface for NFT (Non-Fungible Token) metadata and ownership.
 */

export interface INFT {
  /** NFT contract address */
  contractAddress: string;
  /** Token ID */
  tokenId: string;
  /** Owner address */
  owner: string;
  /** NFT metadata as key-value pairs */
  metadata: Record<string, unknown>;
}
