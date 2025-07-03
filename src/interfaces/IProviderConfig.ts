/**
 * @file IProviderConfig.ts
 * @description Interface for generic provider configuration (network, API key, timeout).
 */

export interface IProviderConfig {
  /** Network name (e.g., 'mainnet', 'polygon') */
  network: string;
  /** Optional API key for provider */
  apiKey?: string;
  /** Optional timeout in milliseconds */
  timeout?: number;
}
