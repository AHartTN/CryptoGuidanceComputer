/**
 * @fileoverview Base Blockchain Provider Abstract Class
 * @description Enterprise-grade base implementation following DRY principles
 */

import type { IBlockchainProvider } from '../interfaces/IBlockchainProvider';
import type { IBlockchainProviderConfig } from '../interfaces/IBlockchainProviderConfig';
import type { IBlockchainNetworkConfig } from '../interfaces/IBlockchainProvider';
import type { IProviderConfig } from '../interfaces/IProviderConfig';
import type { IBlockInfo } from '../interfaces/IBlockInfo';
import type { IGasPrice } from '../interfaces/IGasPrice';
import type { IBlockchainError } from '../interfaces/IBlockchainError';
import type { IBlockchainData } from '../interfaces/IBlockchainData';
import type { ITransactionRequest } from '../interfaces/ITransactionRequest';
import type { ITokenBalance } from '../interfaces/ITokenBalance';
import type { IWalletConnection } from '../interfaces/IWeb3Operations';
import { BlockchainErrorType } from '../enums/BlockchainErrorType';

export abstract class BaseBlockchainProvider implements IBlockchainProvider {
  protected _isConnected: boolean = false;
  protected _lastHealthCheck: number = 0;
  protected readonly _healthCheckInterval: number = 30000; // 30 seconds

  constructor(public readonly config: IBlockchainProviderConfig) {}

  // Implementation of required initialize method
  async initialize(_config: IProviderConfig): Promise<void> {
    // Base implementation - can be overridden by concrete providers
    await this.connect();
  }

  // Abstract methods that must be implemented by concrete providers
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract getAccounts(): Promise<string[]>;
  abstract getBalance(address: string): Promise<string>;
  abstract sendTransaction(request: ITransactionRequest): Promise<string>;
  abstract getTransaction(hash: string): Promise<Record<string, unknown>>;
  abstract estimateGas(request: ITransactionRequest): Promise<string>;

  // Concrete implementations with common logic
  get isConnected(): boolean {
    return this._isConnected;
  }

  get networkName(): string {
    return this.config.network.name;
  }

  async switchNetwork(networkConfig: IBlockchainNetworkConfig): Promise<void> {
    this.validateNetworkConfig(networkConfig);
    // Implementation depends on provider type
    throw this.createError(BlockchainErrorType.ProviderNotAvailable, 'Network switching not implemented');
  }

  async getTokenBalance(address: string, tokenContract: string): Promise<ITokenBalance> {
    this.validateAddress(address);
    this.validateAddress(tokenContract);
    
    // Default implementation - to be overridden by specific providers
    throw this.createError(BlockchainErrorType.ProviderNotAvailable, 'Token balance not implemented');
  }
  async getTokenBalances(address: string, tokenContracts: string[]): Promise<ITokenBalance[]> {
    const balances: ITokenBalance[] = [];
    
    for (const contract of tokenContracts) {
      try {
        const balance = await this.getTokenBalance(address, contract);
        balances.push(balance);
      } catch (_error) {
        console.warn(`Failed to get balance for token ${contract}:`, _error);
      }
    }
    
    return balances;
  }

  async getNetworkInfo(): Promise<IBlockchainData> {
    const currentBlock = await this.getCurrentBlock();
    const gasPrice = await this.getGasPrice();
    
    return {
      blockNumber: currentBlock.number,
      gasPrice: gasPrice.standard,
      networkName: this.networkName,
      timestamp: new Date()
    };
  }

  async getCurrentBlock(): Promise<IBlockInfo> {
    // Default implementation - to be overridden
    throw this.createError(BlockchainErrorType.ProviderNotAvailable, 'getCurrentBlock not implemented');
  }

  async getBlock(blockNumber: number): Promise<IBlockInfo> {
    this.validateBlockNumber(blockNumber);
    // Default implementation - to be overridden
    throw this.createError(BlockchainErrorType.ProviderNotAvailable, 'getBlock not implemented');
  }

  async getGasPrice(): Promise<IGasPrice> {
    // Default implementation - to be overridden
    throw this.createError(BlockchainErrorType.ProviderNotAvailable, 'getGasPrice not implemented');
  }
  async waitForTransaction(hash: string): Promise<Record<string, unknown>> {
    this.validateTransactionHash(hash);
    const maxRetries = 60; // 1 minute with 1-second intervals
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const transaction = await this.getTransaction(hash);
        if (transaction && typeof transaction === 'object' && transaction !== null && 'status' in transaction) {
          return transaction as Record<string, unknown>;
        }
      } catch (_error) {
        // Continue polling
      }
      await this.delay(1000);
      retries++;
    }
    throw this.createError(BlockchainErrorType.TransactionFailed, 'Transaction not confirmed in time');
  }

  async healthCheck(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this._lastHealthCheck < this._healthCheckInterval) {
      return this._isConnected;
    }
    
    try {
      const status = await this.getProviderStatus();
      this._isConnected = status.connected;
      this._lastHealthCheck = now;
      return this._isConnected;    } catch (_error) {
      this._isConnected = false;
      this._lastHealthCheck = now;
      return false;
    }
  }
  async getProviderStatus(): Promise<{
    connected: boolean;
    chainId: number;
    blockNumber: number;
    latency: number;
  }> {
    const startTime = performance.now();
    
    try {
      const currentBlock = await this.getCurrentBlock();
      const latency = performance.now() - startTime;
      
      return {
        connected: true,
        chainId: this.config.network.chainId,
        blockNumber: currentBlock.number,
        latency
      };
    } catch (_error) {
      return {
        connected: false,
        chainId: 0,
        blockNumber: 0,
        latency: performance.now() - startTime
      };
    }
  }
  // Event handling - default implementations (no-op)
  onAccountsChanged(_callback: (accounts: string[]) => void): void {
    // To be implemented by specific providers
  }

  onChainChanged(_callback: (chainId: string) => void): void {
    // To be implemented by specific providers
  }

  onConnect(_callback: (connectInfo: IWalletConnection) => void): void {
    // To be implemented by specific providers
  }
  onDisconnect(_callback: (error: IBlockchainError | null) => void): void {
    // To be implemented by specific providers
  }
  // Protected utility methods
  protected createError(type: BlockchainErrorType, message: string, code?: number, data?: unknown): IBlockchainError {
    return {
      type,
      message,
      code,
      data,
      timestamp: new Date()
    };
  }

  protected validateAddress(address: string): void {
    if (!address || typeof address !== 'string') {
      throw this.createError(BlockchainErrorType.InvalidAddress, 'Invalid address format');
    }
    
    // Basic hex validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw this.createError(BlockchainErrorType.InvalidAddress, `Invalid Ethereum address: ${address}`);
    }
  }

  protected validateTransactionHash(hash: string): void {
    if (!hash || typeof hash !== 'string') {
      throw this.createError(BlockchainErrorType.TransactionFailed, 'Invalid transaction hash');
    }
    
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      throw this.createError(BlockchainErrorType.TransactionFailed, `Invalid transaction hash format: ${hash}`);
    }
  }

  protected validateBlockNumber(blockNumber: number): void {
    if (!Number.isInteger(blockNumber) || blockNumber < 0) {
      throw this.createError(BlockchainErrorType.NetworkError, 'Invalid block number');
    }
  }

  protected validateNetworkConfig(config: IBlockchainNetworkConfig): void {
    if (!config || !config.chainId || !config.name || !config.rpcUrls?.length) {
      throw this.createError(BlockchainErrorType.NetworkError, 'Invalid network configuration');
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }
}