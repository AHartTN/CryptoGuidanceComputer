/**
 * @fileoverview Simplified Web3 Service for DSKY
 * @description Lightweight Web3 service for Apollo DSKY cryptocurrency operations
 */

// DEPRECATED: This file is a duplicate/simplified version. Use UnifiedWeb3Service.ts instead. Marked for deletion.

import type { IWalletConnection } from '../interfaces/IWalletConnection';
import type { IBlockchainData } from '../interfaces/IBlockchainData';
import type { ITransactionRequest } from '../interfaces/ITransactionRequest';

/** Service Status */
export enum Web3ServiceStatus {
  Disconnected = 'DISCONNECTED',
  Connecting = 'CONNECTING',
  Connected = 'CONNECTED',
  Error = 'ERROR'
}

/** Simplified Connection State */
export interface IWeb3ConnectionState {
  status: Web3ServiceStatus;
  wallet: IWalletConnection | null;
  blockchain: IBlockchainData | null;
  lastError: string | null;
  isHealthy: boolean;
}

/**
 * Simplified Web3 Service implementation
 */
export class UnifiedWeb3Service {
  private connectionState: IWeb3ConnectionState;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.connectionState = {
      status: Web3ServiceStatus.Disconnected,
      wallet: null,
      blockchain: null,
      lastError: null,
      isHealthy: false
    };
  }

  /** Get current connection state */
  getConnectionState(): IWeb3ConnectionState {
    return { ...this.connectionState };
  }

  /** Connect to MetaMask wallet */
  async connect(): Promise<IWalletConnection> {
    try {
      this.updateStatus(Web3ServiceStatus.Connecting);

      // Check if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not available');
      }

      const ethereum = window.ethereum;

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get chain ID
      const chainId = await ethereum.request({
        method: 'eth_chainId'
      }) as string;

      // Get balance
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });

      // Convert hex balance to ETH
      const balanceInWei = parseInt(balance as string, 16);
      const balanceInEth = balanceInWei / Math.pow(10, 18);

      const walletConnection: IWalletConnection = {
        address: accounts[0],
        balance: balanceInEth.toString(),
        chainId: parseInt(chainId as string, 16),
        isConnected: true,
        provider: ethereum
      };

      // Get blockchain data
      const blockNumber = await ethereum.request({
        method: 'eth_blockNumber'
      });

      const blockchainData: IBlockchainData = {
        blockNumber: parseInt(blockNumber as string, 16),
        gasPrice: '0',
        networkName: this.getNetworkName(parseInt(chainId as string, 16)),
        timestamp: new Date()
      };

      this.connectionState.wallet = walletConnection;
      this.connectionState.blockchain = blockchainData;
      this.connectionState.lastError = null;
      this.connectionState.isHealthy = true;

      this.updateStatus(Web3ServiceStatus.Connected);

      return walletConnection;
    } catch (_error) {
      const errorMessage = (_error as Error).message;
      this.connectionState.lastError = errorMessage;
      this.updateStatus(Web3ServiceStatus.Error);
      throw _error;
    }
  }

  /** Disconnect from wallet */
  async disconnect(): Promise<void> {
    this.connectionState.wallet = null;
    this.connectionState.blockchain = null;
    this.connectionState.lastError = null;
    this.connectionState.isHealthy = false;
    this.updateStatus(Web3ServiceStatus.Disconnected);
  }

  /** Get account balance */
  async getBalance(address: string): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const ethereum = window.ethereum;
    const balance = await ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });

    const balanceInWei = parseInt(balance as string, 16);
    const balanceInEth = balanceInWei / Math.pow(10, 18);
    return balanceInEth.toString();
  }

  /** Get current block number */
  async getCurrentBlock(): Promise<number> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const ethereum = window.ethereum;
    const blockNumber = await ethereum.request({
      method: 'eth_blockNumber'
    });

    return parseInt(blockNumber as string, 16);
  }

  /** Get gas price */
  async getGasPrice(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const ethereum = window.ethereum;
    const gasPrice = await ethereum.request({
      method: 'eth_gasPrice'
    });

    // Convert from wei to gwei
    const gasPriceInWei = parseInt(gasPrice as string, 16);
    const gasPriceInGwei = gasPriceInWei / Math.pow(10, 9);
    return gasPriceInGwei.toString();
  }

  /** Get network information */
  async getNetworkInfo(): Promise<IBlockchainData> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }

    const ethereum = window.ethereum;

    const [blockNumber, chainId, gasPrice] = await Promise.all([
      ethereum.request({ method: 'eth_blockNumber' }),
      ethereum.request({ method: 'eth_chainId' }),
      ethereum.request({ method: 'eth_gasPrice' })
    ]);

    const gasPriceInWei = parseInt(gasPrice as string, 16);
    const gasPriceInGwei = gasPriceInWei / Math.pow(10, 9);

    return {
      blockNumber: parseInt(blockNumber as string, 16),
      gasPrice: gasPriceInGwei.toString(),
      networkName: this.getNetworkName(parseInt(chainId as string, 16)),
      timestamp: new Date()
    };
  }

  /** Perform health check */
  async healthCheck(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return false;
      }

      const ethereum = window.ethereum;
      await ethereum.request({ method: 'eth_blockNumber' });

      this.connectionState.isHealthy = true;
      return true;
    } catch (_error) {
      this.connectionState.isHealthy = false;
      return false;
    }
  }

  /** Check if wallet is available */
  isWalletAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  }

  /** Check if wallet is connected */
  isConnected(): boolean {
    return this.connectionState.status === Web3ServiceStatus.Connected;
  }

  /** Send transaction */
  async sendTransaction(request: ITransactionRequest): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }
    const ethereum = window.ethereum;
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [request]
    });
    if (typeof txHash !== 'string') {
      throw new Error('Invalid transaction hash');
    }
    return txHash;
  }

  /** Sign message */
  async signMessage(message: string): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not available');
    }
    const ethereum = window.ethereum;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (!Array.isArray(accounts) || !accounts.every(a => typeof a === 'string') || accounts.length === 0) {
      throw new Error('No accounts available');
    }
    const sig = await ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    });
    if (typeof sig !== 'string') {
      throw new Error('Invalid signature');
    }
    return sig;
  }

  // === Private Methods ===

  private updateStatus(status: Web3ServiceStatus): void {
    this.connectionState.status = status;
  }

  private getNetworkName(chainId: number): string {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      case 137: return 'Polygon Mainnet';
      case 80001: return 'Polygon Mumbai';
      case 31337: return 'Hardhat Local';
      default: return `Unknown Network (${chainId})`;
    }
  }

  // === Static Factory Methods ===

  /** Create service for Hardhat local development */
  static createForHardhat(apiKey: string): UnifiedWeb3Service {
    return new UnifiedWeb3Service(apiKey);
  }

  /** Create service for mainnet */
  static createForMainnet(apiKey: string): UnifiedWeb3Service {
    return new UnifiedWeb3Service(apiKey);
  }
}
