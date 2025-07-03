/**
 * @file IBlockchainProviderConfig.ts
 * @description Interface for blockchain provider configuration (network, API key, retries, timeouts, rate limits).
 */

import type { IBlockchainNetworkConfig } from "./IBlockchainNetworkConfig";

export interface IBlockchainProviderConfig {
  /** Blockchain network configuration */
  network: IBlockchainNetworkConfig;
  /** API key for provider (if required) */
  apiKey: string;
  /** Number of retry attempts for failed requests */
  retryAttempts: number;
  /** Timeout in milliseconds for requests */
  timeoutMs: number;
  /** Minimum delay between requests (rate limiting) in ms */
  rateLimitMs: number;
}
