// Apollo DSKY - Base Wallet Provider Abstract Class
// Enterprise-grade base implementation following DRY principles

import {
  IWalletProvider,
  IWalletProviderConfig,
  IWalletCapabilities,
  INetworkSwitchRequest,
  WalletProviderType,
  WalletConnectionStatus,
  WalletErrorType,
  IWalletError
} from '../interfaces/IWalletProvider';
import { IWalletConnection, ITransactionRequest } from '../interfaces/IWeb3Operations';

export abstract class BaseWalletProvider implements IWalletProvider {
  protected _status: WalletConnectionStatus = WalletConnectionStatus.Disconnected;
  protected _connection: IWalletConnection | null = null;
  protected _lastHealthCheck: number = 0;
  protected readonly _healthCheckInterval: number = 30000; // 30 seconds

  constructor(
    public readonly config: IWalletProviderConfig,
    public readonly type: WalletProviderType,
    public readonly capabilities: IWalletCapabilities
  ) {}

  // Abstract methods that must be implemented by concrete providers
  abstract isAvailable(): boolean;
  abstract isInstalled(): boolean;
  abstract getVersion(): Promise<string>;
  abstract connect(): Promise<IWalletConnection>;
  abstract requestAccounts(): Promise<string[]>;
  abstract sendTransaction(request: ITransactionRequest): Promise<string>;
  abstract signMessage(message: string): Promise<string>;

  // Concrete implementations with common logic
  get status(): WalletConnectionStatus {
    return this._status;
  }

  async disconnect(): Promise<void> {
    this._status = WalletConnectionStatus.Disconnected;
    this._connection = null;
  }

  async reconnect(): Promise<IWalletConnection> {
    if (this._connection) {
      try {
        // Try to verify existing connection
        const accounts = await this.requestAccounts();
        if (accounts.length > 0) {
          this._status = WalletConnectionStatus.Connected;
          return this._connection;
        }
      } catch (_error) {
        // Connection is stale, need to reconnect
      }
    }
    
    return this.connect();
  }

  async getConnection(): Promise<IWalletConnection | null> {
    if (!this._connection) {
      return null;
    }
    
    try {
      // Verify connection is still valid
      const accounts = await this.requestAccounts();
      if (accounts.length === 0) {
        this._connection = null;
        this._status = WalletConnectionStatus.Disconnected;
        return null;
      }
      
      return this._connection;
    } catch (_error) {
      this._connection = null;
      this._status = WalletConnectionStatus.Error;
      return null;
    }
  }

  async switchAccount(address: string): Promise<void> {
    this.validateAddress(address);
    
    // Default implementation - most wallets don't support programmatic account switching
    throw this.createError(
      WalletErrorType.UnauthorizedMethod, 
      'Account switching not supported by this wallet'
    );
  }

  async switchNetwork(request: INetworkSwitchRequest): Promise<void> {
    if (!this.capabilities.canSwitchChains) {
      throw this.createError(
        WalletErrorType.UnauthorizedMethod,
        'Network switching not supported by this wallet'
      );
    }
    
    this.validateNetworkRequest(request);
    // Implementation depends on wallet type
  }

  async addNetwork(request: INetworkSwitchRequest): Promise<void> {
    if (!this.capabilities.canAddChains) {
      throw this.createError(
        WalletErrorType.UnauthorizedMethod,
        'Adding networks not supported by this wallet'
      );
    }
    
    this.validateNetworkRequest(request);
    // Implementation depends on wallet type
  }

  async getCurrentNetwork(): Promise<{ chainId: string; chainName: string }> {
    // Default implementation - to be overridden
    throw this.createError(
      WalletErrorType.UnauthorizedMethod,
      'Getting current network not implemented'
    );
  }

  async signTypedData(_typedData: Record<string, unknown>): Promise<string> {
    if (!this.capabilities.supportsTypedData) {
      throw this.createError(
        WalletErrorType.UnauthorizedMethod,
        'Typed data signing not supported by this wallet'
      );
    }
    // Implementation depends on wallet type
    throw this.createError(
      WalletErrorType.UnauthorizedMethod,
      'Typed data signing not implemented'
    );
  }

  async healthCheck(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this._lastHealthCheck < this._healthCheckInterval) {
      return this._status === WalletConnectionStatus.Connected;
    }
    
    try {
      const connection = await this.getConnection();
      this._lastHealthCheck = now;
      return connection !== null;
    } catch (_error) {
      this._lastHealthCheck = now;
      return false;
    }
  }

  async getProviderInfo(): Promise<{
    name: string;
    version: string;
    icon?: string;
    rdns?: string;
  }> {
    const version = await this.getVersion();
    
    return {
      name: this.type,
      version,
      icon: undefined,
      rdns: undefined
    };
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

  onDisconnect(_callback: (error: IWalletError | null) => void): void {
    // To be implemented by specific providers
  }

  // Protected utility methods
  protected createError(type: WalletErrorType, message: string, code?: number, data?: unknown): IWalletError {
    return {
      type,
      message,
      code,
      data
    };
  }

  protected validateAddress(address: string): void {
    if (!address || typeof address !== 'string') {
      throw this.createError(WalletErrorType.UnknownError, 'Invalid address format');
    }
    
    // Basic hex validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw this.createError(WalletErrorType.UnknownError, `Invalid Ethereum address: ${address}`);
    }
  }

  protected validateNetworkRequest(request: INetworkSwitchRequest): void {
    if (!request || !request.chainId || !request.chainName || !request.rpcUrls?.length) {
      throw this.createError(WalletErrorType.UnknownError, 'Invalid network configuration');
    }
  }

  protected setStatus(status: WalletConnectionStatus): void {
    this._status = status;
  }

  protected setConnection(connection: IWalletConnection | null): void {
    this._connection = connection;
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
      } catch (_error) {
        lastError = _error as Error;
        
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }
}