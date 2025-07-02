/**
 * @fileoverview Consolidated type definitions for the Apollo DSKY Cryptocurrency Computer
 * @description Enterprise-grade TypeScript interfaces following SOLID principles
 * @author Apollo DSKY Team
 * @version 1.0.0
 */

// ================================================================================================
// CORE DOMAIN TYPES
// ================================================================================================

/** Input modes for the DSKY interface */
export type InputMode = 'verb' | 'noun' | 'prog' | 'data' | null;

/** Status light identifiers */
export type StatusLightKey = 
  | 'compActy' | 'uplinkActy' | 'noAtt' | 'stby' | 'keyRel' | 'oprErr' 
  | 'temp' | 'gimbalLock' | 'restart' | 'tracker' | 'alt' | 'vel' 
  | 'progStatus' | 'prio';

// ================================================================================================
// DSKY STATE INTERFACES
// ================================================================================================

/**
 * Complete DSKY display state interface
 * Represents all visual elements of the Apollo DSKY display
 */
export interface IDSKYState {
  /** Program register */
  prog: string;
  /** Verb register */
  verb: string;
  /** Noun register */
  noun: string;
  /** Data register 1 */
  reg1: string;
  /** Data register 2 */
  reg2: string;
  /** Data register 3 */
  reg3: string;
  /** Computer activity indicator */
  compActy: boolean;
  /** Uplink activity indicator */
  uplinkActy: boolean;
  /** No attitude indicator */
  noAtt: boolean;
  /** Standby indicator */
  stby: boolean;
  /** Key release indicator */
  keyRel: boolean;
  /** Operator error indicator */
  oprErr: boolean;
  /** Temperature warning indicator */
  temp: boolean;
  /** Gimbal lock indicator */
  gimbalLock: boolean;
  /** Restart indicator */
  restart: boolean;
  /** Tracker indicator */
  tracker: boolean;
  /** Altitude indicator */
  alt: boolean;
  /** Velocity indicator */
  vel: boolean;
  /** Program status indicator */
  progStatus: boolean;
  /** Priority indicator */
  prio: boolean;
}

/**
 * DSKY actions interface for state management
 */
export interface IDSKYActions {
  updateField: (field: keyof IDSKYState, value: string | boolean) => void;
  updateMultipleFields: (updates: Partial<IDSKYState>) => void;
  resetState: () => void;
  setStatusLight: (light: StatusLightKey, active: boolean) => void;
  setRegister: (register: 'reg1' | 'reg2' | 'reg3', value: string) => void;
}

/**
 * Combined DSKY state and actions
 */
export interface IDSKYStateManager {
  state: IDSKYState;
  actions: IDSKYActions;
}

// ================================================================================================
// PROVIDER ENUMS AND CONFIGURATION TYPES
// ================================================================================================

/**
 * Supported wallet provider types
 */
export enum WalletProviderType {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  Phantom = 'Phantom'
}

/**
 * Blockchain error types
 */
export enum BlockchainErrorType {
  NetworkError = 'NETWORK_ERROR',
  InvalidAddress = 'INVALID_ADDRESS',
  TransactionFailed = 'TRANSACTION_FAILED',
  ProviderNotAvailable = 'PROVIDER_NOT_AVAILABLE',
  InsufficientFunds = 'INSUFFICIENT_FUNDS',
  UserRejected = 'USER_REJECTED'
}

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
 * Gas price information
 */
export interface IGasPrice {
  standard: string;
  fast: string;
  fastest: string;
  timestamp: number;
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
  chainName?: string;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// ================================================================================================
// WEB3 INTERFACES
// ================================================================================================

/**
 * Web3 connection state
 */
export interface IWeb3State {
  /** Connection status */
  isConnected: boolean;
  /** Connected wallet address */
  account: string | null;
  /** Current network name */
  network: string | null;
  /** Account balance in ETH */
  balance: string | null;
}

/**
 * Web3 actions interface
 */
export interface IWeb3Actions {
  updateConnection: (account: string, network?: string) => void;
  updateBalance: (balance: string) => void;
  updateNetwork: (network: string) => void;
  disconnect: () => void;
  reset: () => void;
}

/**
 * Combined Web3 state and actions
 */
export interface IWeb3StateManager {
  state: IWeb3State;
  actions: IWeb3Actions;
}

/**
 * Wallet connection details
 */
export interface IWalletConnection {
  address: string;
  balance: string;
  chainId: number;
  isConnected: boolean;
  provider?: unknown;
}

/**
 * Blockchain data snapshot
 */
export interface IBlockchainData {
  blockNumber: number;
  gasPrice: string;
  networkName: string;
  timestamp: Date;
}

/**
 * Transaction request parameters
 */
export interface ITransactionRequest {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
}

/**
 * Token balance information
 */
export interface ITokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
}

// ================================================================================================
// INPUT HANDLING INTERFACES
// ================================================================================================

/**
 * Current input state for DSKY
 */
export interface IInputState {
  mode: InputMode;
  currentInput: string;
}

/**
 * Result of input processing
 */
export interface IInputResult {
  newInputState: IInputState;
  statusMessage?: string;
  dskyUpdates?: Partial<IDSKYState>;
  shouldExecuteCommand?: {
    verb: string;
    noun: string;
  };
}

// ================================================================================================
// COMMAND EXECUTION INTERFACES
// ================================================================================================

/**
 * Command execution result
 */
export interface ICommandResult {
  success: boolean;
  statusMessage: string;
  dskyUpdates?: Partial<IDSKYState>;
  web3Updates?: Partial<IWeb3State>;
}

// ================================================================================================
// CRYPTOCURRENCY INTERFACES
// ================================================================================================

/**
 * Cryptocurrency price data
 */
export interface ICryptoPriceData {
  symbol: string;
  price: number;
  priceChange24h: number;
  lastUpdated: Date;
}

/**
 * Cryptocurrency price service configuration
 */
export interface ICryptoPriceConfig {
  apiUrl: string;
  timeout: number;
  cacheTimeout: number;
}

// ================================================================================================
// COMPONENT PROPS INTERFACES
// ================================================================================================

/**
 * Base props for DSKY components
 */
export interface IDSKYBaseProps {
  className?: string;
  testId?: string;
}

/**
 * Props for display components
 */
export interface IDSKYDisplayProps extends IDSKYBaseProps {
  dskyState: IDSKYState;
  inputMode: InputMode;
  currentInput: string;
}

/**
 * Props for input components
 */
export interface IDSKYInputProps extends IDSKYBaseProps {
  onKeyPress: (key: string) => void;
}

/**
 * Props for status components
 */
export interface IDSKYStatusProps extends IDSKYBaseProps {
  dskyState: IDSKYState;
}

/**
 * Props for output components
 */
export interface IDSKYOutputProps extends IDSKYBaseProps {
  web3State: IWeb3State;
  statusMessages: string[];
}

// ================================================================================================
// PROVIDER INTERFACES
// ================================================================================================

/**
 * Base wallet provider interface
 */
export interface IWalletProvider {
  connect(): Promise<IWalletConnection>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  getBalance(address: string): Promise<string>;
  signTransaction(transaction: ITransactionRequest): Promise<string>;
}

/**
 * Base blockchain provider interface
 */
export interface IBlockchainProvider {
  initialize(config: IProviderConfig): Promise<void>;
  getCurrentBlock(): Promise<number>;
  getGasPrice(): Promise<string>;
  getNetworkInfo(): Promise<IBlockchainData>;
  getTokenBalance(address: string, tokenAddress: string): Promise<ITokenBalance>;
}

// ================================================================================================
// SERVICE INTERFACES
// ================================================================================================

/**
 * Command executor service interface
 */
export interface ICommandExecutor {
  execute(verb: string, noun: string, currentState: IWeb3State): Promise<ICommandResult>;
}

/**
 * Input handler service interface
 */
export interface IInputHandler {
  handleKeyPress(key: string, inputState: IInputState, dskyState: IDSKYState): IInputResult;
}

/**
 * Cryptocurrency price service interface
 */
export interface ICryptoPriceService {
  getPrice(symbol: string): Promise<ICryptoPriceData>;
  getPrices(symbols: string[]): Promise<ICryptoPriceData[]>;
}

// ================================================================================================
// CONFIGURATION INTERFACES
// ================================================================================================

/**
 * Application configuration
 */
export interface IAppConfig {
  web3: IProviderConfig;
  crypto: ICryptoPriceConfig;
  ui: {
    theme: string;
    animationSpeed: number;
  };
}

// ================================================================================================
// UTILITY TYPES
// ================================================================================================

/** Function type for status message handler */
export type StatusMessageHandler = (message: string) => void;

/** Function type for error handler */
export type ErrorHandler = (error: Error) => void;

/** Function type for async operation */
export type AsyncOperation<T = void> = () => Promise<T>;

/** Deep partial type for configuration updates */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ================================================================================================
// DYNAMIC COIN SYSTEM TYPES
// ================================================================================================

/**
 * Individual coin information
 */
export interface ICoinInfo {
  /** Unique coin identifier (e.g., 'bitcoin', 'ethereum') */
  id: string;
  /** Display symbol (e.g., 'BTC', 'ETH') */
  symbol: string;
  /** Full coin name */
  name: string;
  /** Current price in USD */
  currentPrice?: number;
  /** Market cap rank */
  marketCapRank?: number;
  /** 24h price change percentage */
  priceChange24h?: number;
  /** Whether coin is flagged for batch operations */
  isFlagged: boolean;
  /** Dynamically assigned noun number */
  nounNumber: number;
  /** Last price update timestamp */
  lastUpdated?: Date;
}

/**
 * Coin list management state
 */
export interface ICoinListState {
  /** Available coins mapped by noun number */
  coinsByNoun: Map<number, ICoinInfo>;
  /** Available coins mapped by coin ID */
  coinsById: Map<string, ICoinInfo>;
  /** Flagged coins for batch operations */
  flaggedCoins: Set<string>;
  /** Next available noun number for assignment */
  nextNounNumber: number;
  /** Whether coin list is loaded */
  isLoaded: boolean;
  /** Last update timestamp */
  lastUpdated?: Date;
}

/**
 * Batch price result
 */
export interface IBatchPriceResult {
  /** Coin ID */
  coinId: string;
  /** Coin symbol */
  symbol: string;
  /** Current price */
  price: number;
  /** Price change 24h */
  priceChange24h: number;
  /** Update timestamp */
  timestamp: Date;
  /** Whether fetch was successful */
  success: boolean;
  /** Error message if fetch failed */
  error?: string;
}

/**
 * Coin list actions interface
 */
export interface ICoinListActions {
  /** Load available coins from API */
  loadCoinList: () => Promise<void>;
  /** Flag/unflag a coin for batch operations */
  toggleCoinFlag: (coinId: string) => void;
  /** Clear all coin flags */
  clearAllFlags: () => void;
  /** Get coin by noun number */
  getCoinByNoun: (nounNumber: number) => ICoinInfo | undefined;
  /** Get coin by ID */
  getCoinById: (coinId: string) => ICoinInfo | undefined;
  /** Get all flagged coins */
  getFlaggedCoins: () => ICoinInfo[];
  /** Update coin price */
  updateCoinPrice: (coinId: string, priceData: Partial<ICoinInfo>) => void;
}

/**
 * Combined coin list state and actions
 */
export interface ICoinListManager {
  state: ICoinListState;
  actions: ICoinListActions;
}
