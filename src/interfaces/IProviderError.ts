/**
 * @file IProviderError.ts
 * @description Interface for provider error details (code, message, data).
 */

export interface IProviderError {
  /** Numeric error code */
  code: number;
  /** Human-readable error message */
  message: string;
  /** Optional additional error data */
  data?: unknown;
}
