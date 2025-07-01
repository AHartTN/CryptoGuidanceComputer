// Apollo DSKY - Unified Web3 Service
// Enterprise-grade service that unifies wallet and blockchain providers following SOLID/DRY principles

import { IBlockchainProvider, IBlockchainProviderConfig } from '../interfaces/IBlockchainProvider';
import { IWalletProvider, IWalletProviderConfig, WalletProviderType } from '../interfaces/IWalletProvider';
import { IWalletConnection, IBlockchainData, ITransactionRequest, ITokenBalance } from '../interfaces/IWeb3Operations';
import { AlchemyBlockchainProvider } from '../providers/AlchemyBlockchainProvider';
import { MetaMaskWalletProvider } from '../providers/MetaMaskWalletProvider';

/** Service Configuration */
export interface IUnifiedWeb3Config {
  blockchain: IBlockchainProviderConfig;
  wallet: IWalletProviderConfig;
  enableAutoReconnect: boolean;
  healthCheckInterval: number;
}

/** Service Status */
export enum Web3ServiceStatus {
  Disconnected = 'DISCONNECTED',
  Connecting = 'CONNECTING',
  Connected = 'CONNECTED',
  Error = 'ERROR'
}

/** Connection State */
export interface IWeb3ConnectionState {
  status: Web3ServiceStatus;
  wallet: IWalletConnection | null;
  blockchain: IBlockchainData | null;
  lastError: string | null;
  isHealthy: boolean;
}

/** Event Callbacks */
export interface IWeb3EventCallbacks {
  onStatusChange?: (status: Web3ServiceStatus) => void;
  onWalletConnect?: (connection: IWalletConnection) => void;
  onWalletDisconnect?: () => void;
  onNetworkChange?: (chainId: number) => void;
  onAccountChange?: (address: string) => void;
  onError?: (error: string) => void;
}

export class UnifiedWeb3Service {
  private blockchainProvider: IBlockchainProvider;
  private walletProvider: IWalletProvider;
  private connectionState: IWeb3ConnectionState;
  private callbacks: IWeb3EventCallbacks = {};
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(private config: IUnifiedWeb3Config) {
    // Initialize providers based on configuration
    this.blockchainProvider = this.createBlockchainProvider();
    this.walletProvider = this.createWalletProvider();
    
    // Initialize connection state
    this.connectionState = {
      status: Web3ServiceStatus.Disconnected,
      wallet: null,
      blockchain: null,
      lastError: null,
      isHealthy: false
    };

    this.setupEventListeners();
    
    if (config.enableAutoReconnect) {
      this.startHealthChecking();
    }
  }

  // === Public API ===

  /** Get current connection state */
  getConnectionState(): IWeb3ConnectionState {
    return { ...this.connectionState };
  }

  /** Register event callbacks */
  setEventCallbacks(callbacks: IWeb3EventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /** Connect wallet and blockchain */
  async connect(): Promise<IWalletConnection> {
    try {
      this.updateStatus(Web3ServiceStatus.Connecting);

      // Connect blockchain provider first
      await this.blockchainProvider.connect();

      // Connect wallet provider
      const walletConnection = await this.walletProvider.connect();
      
      // Get blockchain data
      const blockchainData = await this.blockchainProvider.getNetworkInfo();

      // Update connection state
      this.connectionState.wallet = walletConnection;
      this.connectionState.blockchain = blockchainData;
      this.connectionState.lastError = null;
      this.connectionState.isHealthy = true;

      this.updateStatus(Web3ServiceStatus.Connected);
      this.callbacks.onWalletConnect?.(walletConnection);

      return walletConnection;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.connectionState.lastError = errorMessage;
      this.updateStatus(Web3ServiceStatus.Error);
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  /** Disconnect from wallet and blockchain */
  async disconnect(): Promise<void> {
    try {
      await this.walletProvider.disconnect();
      await this.blockchainProvider.disconnect();
      
      this.connectionState.wallet = null;
      this.connectionState.blockchain = null;
      this.connectionState.lastError = null;
      this.connectionState.isHealthy = false;

      this.updateStatus(Web3ServiceStatus.Disconnected);
      this.callbacks.onWalletDisconnect?.();
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.connectionState.lastError = errorMessage;
      this.callbacks.onError?.(errorMessage);
    }
  }

  /** Reconnect if previously connected */
  async reconnect(): Promise<IWalletConnection | null> {
    if (!this.walletProvider.isAvailable()) {
      return null;
    }

    try {
      const connection = await this.walletProvider.reconnect();
      if (connection) {
        this.connectionState.wallet = connection;
        this.updateStatus(Web3ServiceStatus.Connected);
        return connection;
      }
    } catch (error) {
      console.warn('Reconnection failed:', error);
    }

    return null;
  }

  // === Wallet Operations ===

  /** Check if wallet is available */
  isWalletAvailable(): boolean {
    return this.walletProvider.isAvailable();
  }

  /** Check if wallet is installed */
  isWalletInstalled(): boolean {
    return this.walletProvider.isInstalled();
  }

  /** Get wallet connection */
  async getWalletConnection(): Promise<IWalletConnection | null> {
    return this.walletProvider.getConnection();
  }

  /** Request accounts from wallet */
  async requestAccounts(): Promise<string[]> {
    return this.walletProvider.requestAccounts();
  }

  /** Send transaction through wallet */
  async sendTransaction(request: ITransactionRequest): Promise<string> {
    return this.walletProvider.sendTransaction(request);
  }

  /** Sign message with wallet */
  async signMessage(message: string): Promise<string> {
    return this.walletProvider.signMessage(message);
  }

  /** Switch network in wallet */
  async switchNetwork(chainId: number, chainName: string, rpcUrls: string[]): Promise<void> {
    const request = {
      chainId: `0x${chainId.toString(16)}`,
      chainName,
      rpcUrls,
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    };

    return this.walletProvider.switchNetwork(request);
  }

  // === Blockchain Operations ===

  /** Get account balance */
  async getBalance(address: string): Promise<string> {
    return this.blockchainProvider.getBalance(address);
  }

  /** Get token balance */
  async getTokenBalance(address: string, tokenContract: string): Promise<ITokenBalance> {
    return this.blockchainProvider.getTokenBalance(address, tokenContract);
  }

  /** Get multiple token balances */
  async getTokenBalances(address: string, tokenContracts: string[]): Promise<ITokenBalance[]> {
    return this.blockchainProvider.getTokenBalances(address, tokenContracts);
  }

  /** Get network information */
  async getNetworkInfo(): Promise<IBlockchainData> {
    return this.blockchainProvider.getNetworkInfo();
  }

  /** Get current block */
  async getCurrentBlock(): Promise<any> {
    return this.blockchainProvider.getCurrentBlock();
  }

  /** Get specific block */
  async getBlock(blockNumber: number): Promise<any> {
    return this.blockchainProvider.getBlock(blockNumber);
  }

  /** Get gas price */
  async getGasPrice(): Promise<any> {
    return this.blockchainProvider.getGasPrice();
  }

  /** Get transaction */
  async getTransaction(hash: string): Promise<any> {
    return this.blockchainProvider.getTransaction(hash);
  }

  /** Estimate gas for transaction */
  async estimateGas(request: ITransactionRequest): Promise<string> {
    return this.blockchainProvider.estimateGas(request);
  }

  // === Health & Monitoring ===

  /** Perform health check */
  async healthCheck(): Promise<boolean> {
    try {
      const walletHealthy = await this.walletProvider.healthCheck();
      const blockchainHealthy = await this.blockchainProvider.healthCheck();
      
      const isHealthy = walletHealthy && blockchainHealthy;
      this.connectionState.isHealthy = isHealthy;
      
      return isHealthy;
    } catch (error) {
      this.connectionState.isHealthy = false;
      return false;
    }
  }

  /** Get detailed status */
  async getDetailedStatus(): Promise<{
    wallet: any;
    blockchain: any;
    overall: boolean;
  }> {
    try {
      const [walletInfo, blockchainStatus] = await Promise.all([
        this.walletProvider.getProviderInfo(),
        this.blockchainProvider.getProviderStatus()
      ]);

      return {
        wallet: walletInfo,
        blockchain: blockchainStatus,
        overall: this.connectionState.isHealthy
      };
    } catch (error) {
      return {
        wallet: null,
        blockchain: null,
        overall: false
      };
    }
  }

  // === Cleanup ===

  /** Dispose of the service */
  dispose(): void {
    this.stopHealthChecking();
    this.disconnect().catch(console.error);
  }

  // === Private Methods ===

  private createBlockchainProvider(): IBlockchainProvider {
    // For now, we'll use Alchemy as the primary provider
    return AlchemyBlockchainProvider.create(this.config.blockchain);
  }

  private createWalletProvider(): IWalletProvider {
    switch (this.config.wallet.type) {
      case WalletProviderType.MetaMask:
        return MetaMaskWalletProvider.create(this.config.wallet);
      default:
        throw new Error(`Unsupported wallet type: ${this.config.wallet.type}`);
    }
  }

  private setupEventListeners(): void {
    // Wallet events
    this.walletProvider.onAccountsChanged((accounts) => {
      if (accounts.length > 0 && this.connectionState.wallet) {
        this.connectionState.wallet.address = accounts[0];
        this.callbacks.onAccountChange?.(accounts[0]);
      }
    });

    this.walletProvider.onChainChanged((chainId) => {
      const numericChainId = parseInt(chainId, 16);
      if (this.connectionState.wallet) {
        this.connectionState.wallet.chainId = numericChainId;
        this.callbacks.onNetworkChange?.(numericChainId);
      }
    });

    this.walletProvider.onDisconnect(() => {
      this.connectionState.wallet = null;
      this.updateStatus(Web3ServiceStatus.Disconnected);
      this.callbacks.onWalletDisconnect?.();
    });
  }

  private updateStatus(status: Web3ServiceStatus): void {
    this.connectionState.status = status;
    this.callbacks.onStatusChange?.(status);
  }

  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.healthCheck();
    }, this.config.healthCheckInterval);
  }

  private stopHealthChecking(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  // === Static Factory Methods ===

  /** Create service with default Hardhat configuration */
  static createForHardhat(apiKey: string): UnifiedWeb3Service {
    const config: IUnifiedWeb3Config = {
      blockchain: AlchemyBlockchainProvider.createHardhatConfig(apiKey),
      wallet: {
        type: WalletProviderType.MetaMask,
        autoConnect: false,
        retryAttempts: 3,
        timeoutMs: 10000
      },
      enableAutoReconnect: true,
      healthCheckInterval: 30000
    };

    return new UnifiedWeb3Service(config);
  }

  /** Create service with default mainnet configuration */
  static createForMainnet(apiKey: string): UnifiedWeb3Service {
    const config: IUnifiedWeb3Config = {
      blockchain: AlchemyBlockchainProvider.createMainnetConfig(apiKey),
      wallet: {
        type: WalletProviderType.MetaMask,
        autoConnect: false,
        retryAttempts: 3,
        timeoutMs: 10000
      },
      enableAutoReconnect: true,
      healthCheckInterval: 30000
    };

    return new UnifiedWeb3Service(config);
  }
}