import type { WalletProviderType } from '../enums/WalletProviderType';
import type { BlockchainErrorType } from '../enums/BlockchainErrorType';
import type { IMetaMaskEthereumProvider } from './IMetaMaskEthereumProvider';

/**
 * @fileoverview Web3 and Blockchain Interface Definitions
 * @description Web3 provider, wallet, and blockchain-related interfaces
 */

/**
 * Generic provider configuration base interface
 */
export interface IProviderConfig {
  network: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Blockchain provider configuration
 */
export interface IBlockchainProviderConfig {
  network: IBlockchainNetworkConfig;
  apiKey: string;
  retryAttempts: number;
  timeoutMs: number;
  rateLimitMs: number;
}

/**
 * Blockchain network configuration
 */
export interface IBlockchainNetworkConfig {
  name: string;
  chainId: number;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/**
 * Wallet provider configuration
 */
export interface IWalletProviderConfig {
  type: WalletProviderType;
  autoConnect?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * Block information interface
 */
export interface IBlockInfo {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  gasLimit: string;
  gasUsed: string;
  miner: string;
  difficulty: string;
  transactions: string[];
}

/**
 * Blockchain error interface
 */
export interface IBlockchainError {
  type: BlockchainErrorType;
  message: string;
  code?: number;
  data?: unknown;
  timestamp: Date;
}

/**
 * Network switch request
 */
export interface INetworkSwitchRequest {
  chainId: number;
  networkName?: string;
}

/**
 * Wallet connection state
 */
export interface IWalletConnectionState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  provider: IMetaMaskEthereumProvider | undefined;
}

/**
 * Transaction data interface
 */
export interface ITransactionData {
  to: string;
  value?: string;
  gasLimit?: string;
  gasPrice?: string;
  data?: string;
  nonce?: number;
}

/**
 * Transaction result interface
 */
export interface ITransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp?: number;
}
