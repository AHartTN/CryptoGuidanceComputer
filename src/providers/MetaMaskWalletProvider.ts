// Apollo DSKY - MetaMask Wallet Provider Implementation
// Enterprise-grade MetaMask integration following SOLID principles

import { BaseWalletProvider } from '../abstracts/BaseWalletProvider';
import {
  IWalletProviderConfig,
  IWalletCapabilities,
  INetworkSwitchRequest,
  WalletProviderType,
  WalletConnectionStatus,
  WalletErrorType
} from '../interfaces/IWalletProvider';
import { IWalletConnection, ITransactionRequest } from '../interfaces/IWeb3Operations';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      selectedAddress?: string;
      chainId?: string;
      networkVersion?: string;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: (event?: string) => void;
    };
  }
}

export class MetaMaskWalletProvider extends BaseWalletProvider {
  private ethereum: any;

  constructor(config?: Partial<IWalletProviderConfig>) {
    const defaultConfig: IWalletProviderConfig = {
      type: WalletProviderType.MetaMask,
      autoConnect: false,
      retryAttempts: 3,
      timeoutMs: 10000,
      ...config
    };

    const capabilities: IWalletCapabilities = {
      canSignMessages: true,
      canSignTransactions: true,
      canSwitchChains: true,
      canAddChains: true,
      supportsPersonalSign: true,
      supportsTypedData: true
    };

    super(defaultConfig, WalletProviderType.MetaMask, capabilities);
    this.ethereum = window.ethereum;
    this.setupEventListeners();
  }

  // Implementation of abstract methods
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  }

  isInstalled(): boolean {
    return this.isAvailable() && !!window.ethereum?.isMetaMask;
  }

  async getVersion(): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    try {
      // MetaMask doesn't have a direct version method, so we'll use a fallback
      return 'Unknown';
    } catch (error) {
      return 'Unknown';
    }
  }

  async connect(): Promise<IWalletConnection> {
    if (!this.isInstalled()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not installed');
    }

    try {
      this.setStatus(WalletConnectionStatus.Connecting);

      const accounts = await this.requestAccounts();
      
      if (accounts.length === 0) {
        throw this.createError(WalletErrorType.UserRejected, 'No accounts available');
      }

      const chainId = await this.ethereum.request({ method: 'eth_chainId' });
      const balance = await this.getBalance(accounts[0]);

      const connection: IWalletConnection = {
        address: accounts[0],
        balance,
        chainId: parseInt(chainId, 16),
        isConnected: true,
        provider: this.ethereum
      };

      this.setConnection(connection);
      this.setStatus(WalletConnectionStatus.Connected);

      return connection;
    } catch (error: any) {
      this.setStatus(WalletConnectionStatus.Error);
      
      if (error.code === 4001) {
        throw this.createError(WalletErrorType.UserRejected, 'User rejected the request');
      }
      
      throw this.createError(WalletErrorType.UnknownError, `Connection failed: ${error.message}`);
    }
  }

  async requestAccounts(): Promise<string[]> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    try {
      return await this.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error: any) {
      if (error.code === 4001) {
        throw this.createError(WalletErrorType.UserRejected, 'User rejected account access');
      }
      
      throw this.createError(WalletErrorType.UnknownError, `Failed to request accounts: ${error.message}`);
    }
  }

  async sendTransaction(request: ITransactionRequest): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    try {
      return await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [request]
      });
    } catch (error: any) {
      if (error.code === 4001) {
        throw this.createError(WalletErrorType.UserRejected, 'User rejected the transaction');
      }
      
      throw this.createError(WalletErrorType.UnknownError, `Transaction failed: ${error.message}`);
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    const connection = await this.getConnection();
    if (!connection) {
      throw this.createError(WalletErrorType.DisconnectedFromChain, 'Wallet not connected');
    }

    try {
      return await this.ethereum.request({
        method: 'personal_sign',
        params: [message, connection.address]
      });
    } catch (error: any) {
      if (error.code === 4001) {
        throw this.createError(WalletErrorType.UserRejected, 'User rejected message signing');
      }
      
      throw this.createError(WalletErrorType.UnknownError, `Message signing failed: ${error.message}`);
    }
  }

  async signTypedData(typedData: any): Promise<string> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    const connection = await this.getConnection();
    if (!connection) {
      throw this.createError(WalletErrorType.DisconnectedFromChain, 'Wallet not connected');
    }

    try {
      return await this.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [connection.address, JSON.stringify(typedData)]
      });
    } catch (error: any) {
      if (error.code === 4001) {
        throw this.createError(WalletErrorType.UserRejected, 'User rejected typed data signing');
      }
      
      throw this.createError(WalletErrorType.UnknownError, `Typed data signing failed: ${error.message}`);
    }
  }

  async switchNetwork(request: INetworkSwitchRequest): Promise<void> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: request.chainId }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask, try to add it
        await this.addNetwork(request);
      } else if (error.code === 4001) {
        throw this.createError(WalletErrorType.UserRejected, 'User rejected network switch');
      } else {
        throw this.createError(WalletErrorType.NetworkError, `Network switch failed: ${error.message}`);
      }
    }
  }

  async addNetwork(request: INetworkSwitchRequest): Promise<void> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    try {
      await this.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [request]
      });
    } catch (error: any) {
      if (error.code === 4001) {
        throw this.createError(WalletErrorType.UserRejected, 'User rejected adding network');
      }
      
      throw this.createError(WalletErrorType.NetworkError, `Adding network failed: ${error.message}`);
    }
  }

  async getCurrentNetwork(): Promise<{ chainId: string; chainName: string }> {
    if (!this.isAvailable()) {
      throw this.createError(WalletErrorType.NotInstalled, 'MetaMask not available');
    }

    try {
      const chainId = await this.ethereum.request({ method: 'eth_chainId' });
      return {
        chainId,
        chainName: this.getChainName(chainId)
      };
    } catch (error: any) {
      throw this.createError(WalletErrorType.NetworkError, `Failed to get current network: ${error.message}`);
    }
  }

  // Event handling implementations
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.isAvailable()) {
      this.ethereum.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (this.isAvailable()) {
      this.ethereum.on('chainChanged', callback);
    }
  }

  onConnect(callback: (connectInfo: IWalletConnection) => void): void {
    if (this.isAvailable()) {
      this.ethereum.on('connect', callback);
    }
  }

  onDisconnect(callback: (error: any) => void): void {
    if (this.isAvailable()) {
      this.ethereum.on('disconnect', callback);
    }
  }

  // Private helper methods
  private async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert from wei to ether
      return (parseInt(balance, 16) / Math.pow(10, 18)).toString();
    } catch (error) {
      return '0';
    }
  }

  private getChainName(chainId: string): string {
    const chainMap: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x2a': 'Kovan Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
      '0x7a69': 'Hardhat Local',
      '0xa86a': 'Avalanche Mainnet',
      '0xa869': 'Avalanche Fuji'
    };

    return chainMap[chainId] || `Unknown Chain (${chainId})`;
  }

  private setupEventListeners(): void {
    if (!this.isAvailable()) return;

    // Listen for account changes
    this.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.setStatus(WalletConnectionStatus.Disconnected);
        this.setConnection(null);
      } else if (this._connection) {
        // Update connection with new account
        this.setConnection({
          ...this._connection,
          address: accounts[0]
        });
      }
    });

    // Listen for chain changes
    this.ethereum.on('chainChanged', (chainId: string) => {
      if (this._connection) {
        this.setConnection({
          ...this._connection,
          chainId: parseInt(chainId, 16)
        });
      }
    });

    // Listen for disconnect
    this.ethereum.on('disconnect', () => {
      this.setStatus(WalletConnectionStatus.Disconnected);
      this.setConnection(null);
    });
  }

  // Static factory method
  static create(config?: Partial<IWalletProviderConfig>): MetaMaskWalletProvider {
    return new MetaMaskWalletProvider(config);
  }
}