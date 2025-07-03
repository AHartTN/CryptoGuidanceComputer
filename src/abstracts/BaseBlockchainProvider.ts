import type { IBlockchainProvider } from "../interfaces/IBlockchainProvider";
import type { IBlockchainProviderConfig } from "../interfaces/IBlockchainProviderConfig";
import type { IBlockchainNetworkConfig } from "../interfaces/IBlockchainProvider";
import type { IBlockInfo } from "../interfaces/IBlockInfo";
import type { IGasPrice } from "../interfaces/IGasPrice";
import type { IBlockchainError } from "../interfaces/IBlockchainError";
import type { IBlockchainData } from "../interfaces/IBlockchainData";
import type { ITransactionRequest } from "../interfaces/ITransactionRequest";
import type { ITokenBalance } from "../interfaces/ITokenBalance";
import type { IWalletConnection } from "../interfaces/IWeb3Operations";
import { BlockchainErrorType } from "../enums/BlockchainErrorType";

export abstract class BaseBlockchainProvider implements IBlockchainProvider {
  protected _isConnected: boolean = false;
  protected _lastHealthCheck: number = 0;
  protected readonly _healthCheckInterval: number = 30000;

  public readonly config: IBlockchainProviderConfig;

  constructor(config: IBlockchainProviderConfig) {
    this.config = config;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  abstract get networkName(): string;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract switchNetwork(networkConfig: IBlockchainNetworkConfig): Promise<void>;
  abstract getAccounts(): Promise<string[]>;
  abstract getBalance(address: string): Promise<string>;
  abstract getTokenBalance(address: string, tokenContract: string): Promise<ITokenBalance>;
  abstract getTokenBalances(address: string, tokenContracts: string[]): Promise<ITokenBalance[]>;
  abstract getNetworkInfo(): Promise<IBlockchainData>;
  abstract getCurrentBlock(): Promise<IBlockInfo>;
  abstract getBlock(blockNumber: number): Promise<IBlockInfo>;
  abstract getGasPrice(): Promise<IGasPrice>;
  abstract sendTransaction(request: ITransactionRequest): Promise<string>;
  abstract getTransaction(hash: string): Promise<Record<string, unknown>>;
  abstract waitForTransaction(hash: string): Promise<Record<string, unknown>>;
  abstract estimateGas(request: ITransactionRequest): Promise<string>;
  abstract onAccountsChanged(callback: (accounts: string[]) => void): void;
  abstract onChainChanged(callback: (chainId: string) => void): void;
  abstract onConnect(callback: (connectInfo: IWalletConnection) => void): void;
  abstract onDisconnect(callback: (error: IBlockchainError | null) => void): void;
  abstract healthCheck(): Promise<boolean>;
  abstract getProviderStatus(): Promise<{
    connected: boolean;
    chainId: number;
    blockNumber: number;
    latency: number;
  }>;

  protected createError(
    type: BlockchainErrorType,
    message: string,
    code?: number,
    data?: unknown,
  ): IBlockchainError {
    return {
      type,
      message,
      code,
      data,
      timestamp: new Date(),
    };
  }

  protected validateAddress(address: string): void {
    if (!address || typeof address !== "string") {
      throw this.createError(
        BlockchainErrorType.InvalidAddress,
        "Invalid address format",
      );
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw this.createError(
        BlockchainErrorType.InvalidAddress,
        `Invalid Ethereum address: ${address}`,
      );
    }
  }

  protected validateTransactionHash(hash: string): void {
    if (!hash || typeof hash !== "string") {
      throw this.createError(
        BlockchainErrorType.TransactionFailed,
        "Invalid transaction hash",
      );
    }
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      throw this.createError(
        BlockchainErrorType.TransactionFailed,
        `Invalid transaction hash format: ${hash}`,
      );
    }
  }

  protected validateBlockNumber(blockNumber: number): void {
    if (!Number.isInteger(blockNumber) || blockNumber < 0) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        "Invalid block number",
      );
    }
  }

  protected validateNetworkConfig(config: IBlockchainNetworkConfig): void {
    if (!config || !config.chainId || !config.name || !config.rpcUrls?.length) {
      throw this.createError(
        BlockchainErrorType.NetworkError,
        "Invalid network configuration",
      );
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.retryAttempts,
  ): Promise<T> {
    let lastError: Error;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
    throw lastError!;
  }
}
