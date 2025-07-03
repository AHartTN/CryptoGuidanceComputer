/**
 * @file IBlockchainError.ts
 * @description Interface for representing blockchain-related errors and metadata.
 */

import type { BlockchainErrorType } from "../enums/BlockchainErrorType";

export interface IBlockchainError {
  /** Error type (enum) */
  type: BlockchainErrorType;
  /** Human-readable error message */
  message: string;
  /** Optional error code (numeric) */
  code?: number;
  /** Optional additional error data */
  data?: unknown;
  /** Timestamp of error occurrence */
  timestamp: Date;
}
