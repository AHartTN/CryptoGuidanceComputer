/**
 * @file ITransactionRequest.ts
 * @description Interface for blockchain transaction request parameters.
 */

export interface ITransactionRequest {
  /** Recipient address */
  to: string;
  /** Value to send (optional) */
  value?: string;
  /** Data payload (optional) */
  data?: string;
  /** Gas limit (optional) */
  gasLimit?: string;
  /** Gas price (optional) */
  gasPrice?: string;
}
