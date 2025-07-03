import type { IBlockchainNetworkConfig } from './IBlockchainNetworkConfig';

export interface IBlockchainProviderConfig {
  network: IBlockchainNetworkConfig;
  apiKey: string;
  retryAttempts: number;
  timeoutMs: number;
  rateLimitMs: number;
}
