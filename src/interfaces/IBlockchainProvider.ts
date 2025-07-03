// Apollo DSKY - Blockchain Provider Interface
// Enterprise-grade interface following SOLID principles

import { IWalletConnection, IBlockchainData, ITransactionRequest, ITokenBalance } from './IWeb3Operations';
import type { IGasPrice } from './IGasPrice';
import type { IBlockchainError } from './IBlockchainError';

/** Blockchain Network Configuration */
export interface IBlockchainNetworkConfig {
  chainId: number;
  name: string;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/** Blockchain Provider Configuration */
export interface IBlockchainProviderConfig {
  apiKey?: string;
  network: IBlockchainNetworkConfig;
  retryAttempts: number;
  timeoutMs: number;
  rateLimitMs: number;
}

/** Blockchain Data Types */
export interface IBlockInfo {
  number: number;
  hash: string;
  timestamp: number;
  gasLimit: string;
  gasUsed: string;
  transactions: string[];
}

/** Main Blockchain Provider Interface */
export interface IBlockchainProvider {
  // Configuration
  readonly config: IBlockchainProviderConfig;
  readonly isConnected: boolean;
  readonly networkName: string;

  // Connection Management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  switchNetwork(networkConfig: IBlockchainNetworkConfig): Promise<void>;

  // Account Operations
  getAccounts(): Promise<string[]>;
  getBalance(address: string): Promise<string>;
  getTokenBalance(address: string, tokenContract: string): Promise<ITokenBalance>;
  getTokenBalances(address: string, tokenContracts: string[]): Promise<ITokenBalance[]>;

  // Network Information
  getNetworkInfo(): Promise<IBlockchainData>;
  getCurrentBlock(): Promise<IBlockInfo>;
  getBlock(blockNumber: number): Promise<IBlockInfo>;
  getGasPrice(): Promise<IGasPrice>;

  // Transaction Operations
  sendTransaction(request: ITransactionRequest): Promise<string>;
  getTransaction(hash: string): Promise<Record<string, unknown>>;
  waitForTransaction(hash: string): Promise<Record<string, unknown>>;
  estimateGas(request: ITransactionRequest): Promise<string>;

  // Event Handling
  onAccountsChanged(callback: (accounts: string[]) => void): void;
  onChainChanged(callback: (chainId: string) => void): void;
  onConnect(callback: (connectInfo: IWalletConnection) => void): void;
  onDisconnect(callback: (error: IBlockchainError | null) => void): void;

  // Health & Monitoring
  healthCheck(): Promise<boolean>;
  getProviderStatus(): Promise<{
    connected: boolean;
    chainId: number;
    blockNumber: number;
    latency: number;
  }>;
}