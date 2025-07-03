import type { WalletProviderType } from '../enums/WalletProviderType';

export interface IWalletProviderConfig {
  type: WalletProviderType;
  autoConnect?: boolean;
  timeout?: number;
  retryAttempts?: number;
}
