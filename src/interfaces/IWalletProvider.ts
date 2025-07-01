// Apollo DSKY - Wallet Provider Interface
// Enterprise-grade wallet abstraction following SOLID principles

import { IWalletConnection, ITransactionRequest } from './IWeb3Operations';

/** Wallet Provider Types */
export enum WalletProviderType {
  MetaMask = 'METAMASK',
  WalletConnect = 'WALLET_CONNECT',
  Phantom = 'PHANTOM',
  Coinbase = 'COINBASE',
  Browser = 'BROWSER'
}

/** Wallet Connection Status */
export enum WalletConnectionStatus {
  Disconnected = 'DISCONNECTED',
  Connecting = 'CONNECTING',
  Connected = 'CONNECTED',
  Error = 'ERROR'
}

/** Wallet Error Types */
export enum WalletErrorType {
  NotInstalled = 'NOT_INSTALLED',
  UserRejected = 'USER_REJECTED',
  UnauthorizedMethod = 'UNAUTHORIZED_METHOD',
  DisconnectedFromChain = 'DISCONNECTED_FROM_CHAIN',
  ChainNotAdded = 'CHAIN_NOT_ADDED',
  NetworkError = 'NETWORK_ERROR',
  UnknownError = 'UNKNOWN_ERROR'
}

export interface IWalletError {
  type: WalletErrorType;
  message: string;
  code?: number;
  data?: any;
}

/** Wallet Provider Configuration */
export interface IWalletProviderConfig {
  type: WalletProviderType;
  autoConnect: boolean;
  retryAttempts: number;
  timeoutMs: number;
}

/** Wallet Capabilities */
export interface IWalletCapabilities {
  canSignMessages: boolean;
  canSignTransactions: boolean;
  canSwitchChains: boolean;
  canAddChains: boolean;
  supportsPersonalSign: boolean;
  supportsTypedData: boolean;
}

/** Network Switch Request */
export interface INetworkSwitchRequest {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

/** Main Wallet Provider Interface */
export interface IWalletProvider {
  // Configuration
  readonly config: IWalletProviderConfig;
  readonly type: WalletProviderType;
  readonly status: WalletConnectionStatus;
  readonly capabilities: IWalletCapabilities;

  // Detection & Availability
  isAvailable(): boolean;
  isInstalled(): boolean;
  getVersion(): Promise<string>;

  // Connection Management
  connect(): Promise<IWalletConnection>;
  disconnect(): Promise<void>;
  reconnect(): Promise<IWalletConnection>;
  getConnection(): Promise<IWalletConnection | null>;

  // Account Operations
  requestAccounts(): Promise<string[]>;
  switchAccount(address: string): Promise<void>;

  // Network Operations
  switchNetwork(request: INetworkSwitchRequest): Promise<void>;
  addNetwork(request: INetworkSwitchRequest): Promise<void>;
  getCurrentNetwork(): Promise<{
    chainId: string;
    chainName: string;
  }>;

  // Transaction & Signing
  signMessage(message: string): Promise<string>;
  signTypedData(typedData: any): Promise<string>;
  sendTransaction(request: ITransactionRequest): Promise<string>;

  // Event Handling
  onAccountsChanged(callback: (accounts: string[]) => void): void;
  onChainChanged(callback: (chainId: string) => void): void;
  onConnect(callback: (connectInfo: IWalletConnection) => void): void;
  onDisconnect(callback: (error: IWalletError | null) => void): void;

  // Health & Status
  healthCheck(): Promise<boolean>;
  getProviderInfo(): Promise<{
    name: string;
    version: string;
    icon?: string;
    rdns?: string;
  }>;
}