/**
 * @file ITransactionDetails.ts
 * @description Interface for blockchain transaction details (hash, from, to, value, gas, block, status).
 */

export interface ITransactionDetails {
  /** Transaction hash */
  hash: string;
  /** Sender address */
  from: string;
  /** Recipient address */
  to: string;
  /** Value transferred (as string) */
  value: string;
  /** Gas used for the transaction */
  gasUsed: string;
  /** Block number containing the transaction */
  blockNumber: number;
  /** Timestamp of the transaction */
  timestamp: number;
  /** Status string (e.g., 'success', 'failed') */
  status: string;
}
