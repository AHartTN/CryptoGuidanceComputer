/**
 * @file IWalletProviderConfig.ts
 * @description Interface for wallet provider configuration (type, auto-connect, timeout, retries).
 */

import type { WalletProviderType } from "../enums/WalletProviderType";

export interface IWalletProviderConfig {
  /** Wallet provider type (enum) */
  type: WalletProviderType;
  /** Whether to auto-connect on load (optional) */
  autoConnect?: boolean;
  /** Optional timeout in milliseconds */
  timeout?: number;
  /** Optional number of retry attempts */
  retryAttempts?: number;
}
