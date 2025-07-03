/**
 * @file ILogMetadata.ts
 * @description Interface for log metadata used in DSKY logging and analytics.
 */

// Log metadata interface for DSKY logging
export interface ILogMetadata {
  /** Arbitrary metadata key-value pairs */
  [key: string]: unknown;
}
