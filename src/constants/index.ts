/**
 * @fileoverview Application constants and configuration values
 * @description Centralized constants following DRY principles
 */

// ================================================================================================
// DSKY DISPLAY CONSTANTS
// ================================================================================================

/** DSKY display field labels */
export const DISPLAY_LABELS = {
  PROG: 'PROG',
  VERB: 'VERB', 
  NOUN: 'NOUN',
  R1: 'R1',
  R2: 'R2',
  R3: 'R3'
} as const;

/** DSKY button labels */
export const BUTTON_LABELS = {
  VERB: 'VERB',
  NOUN: 'NOUN',
  PROC: 'PROC',
  RSET: 'RSET',
  KEY_REL: 'KEY REL',
  ENTR: 'ENTR',
  CLR: 'CLR',
  PLUS: '+',
  MINUS: '−'
} as const;

/** Input validation constraints */
export const INPUT_CONSTRAINTS = {
  MAX_INPUT_LENGTH: 2,
  DEFAULT_PADDING: '0',
  REGISTER_LENGTH: 5,
  REGISTER_PADDING: '0'
} as const;

// ================================================================================================
// STATUS INDICATORS CONFIGURATION
// ================================================================================================

/** Status indicator definitions */
export const STATUS_INDICATORS = [
  { key: 'uplinkActy', label: 'UPLINK ACTY' },
  { key: 'noAtt', label: 'NO ATT' },
  { key: 'stby', label: 'STBY' },
  { key: 'keyRel', label: 'KEY REL' },
  { key: 'oprErr', label: 'OPR ERR' },
  { key: 'temp', label: 'TEMP' },
  { key: 'gimbalLock', label: 'GIMBAL LOCK' },
  { key: 'restart', label: 'RESTART' },
  { key: 'tracker', label: 'TRACKER' },
  { key: 'alt', label: 'ALT' },
  { key: 'vel', label: 'VEL' },
  { key: 'progStatus', label: 'PROG' },
  { key: 'prio', label: 'PRIO' }
] as const;

// ================================================================================================
// INITIAL STATE VALUES
// ================================================================================================

/** Default DSKY state */
export const INITIAL_DSKY_STATE = {
  verb: '00',
  noun: '00',
  prog: '00',
  reg1: '00000',
  reg2: '00000', 
  reg3: '00000',
  compActy: false,
  uplinkActy: false,
  noAtt: false,
  stby: false,
  keyRel: false,
  oprErr: false,
  temp: false,
  gimbalLock: false,
  restart: false,
  tracker: false,
  alt: false,
  vel: false,
  progStatus: false,
  prio: false
} as const;

/** Default Web3 state */
export const INITIAL_WEB3_STATE = {
  isConnected: false,
  account: null,
  network: null,
  balance: null
} as const;

// ================================================================================================
// COMMAND MAPPINGS
// ================================================================================================

/** Verb definitions */
export const VERBS = {
  CONNECT: '01',
  HEALTH_CHECK: '02', 
  WALLET_INFO: '11',
  WALLET_BALANCE: '12',
  DISPLAY_BLOCK: '22',
  GAS_PRICE: '24',
  NETWORK_INFO: '25',
  CRYPTO_PRICES: '31',
  DISCONNECT: '99'
} as const;

/** Noun definitions */
export const NOUNS = {
  SYSTEM: '01',
  WALLET: '11',
  BALANCE: '12',
  BLOCK: '21',
  GAS: '23',
  NETWORK: '25',
  BITCOIN: '31',
  ETHEREUM: '32',
  POLYGON: '34', 
  CARDANO: '36'
} as const;

/** Cryptocurrency symbol mappings */
export const CRYPTO_SYMBOLS = {
  [NOUNS.BITCOIN]: 'bitcoin',
  [NOUNS.ETHEREUM]: 'ethereum',
  [NOUNS.POLYGON]: 'matic-network',
  [NOUNS.CARDANO]: 'cardano'
} as const;

// ================================================================================================
// NETWORK CONFIGURATIONS
// ================================================================================================

/** Hardhat local network configuration */
export const HARDHAT_NETWORK = {
  chainId: 31337,
  name: 'Hardhat Local',
  rpcUrls: ['http://192.168.1.2:8545'],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
} as const;

/** Mainnet configuration */
export const ETHEREUM_MAINNET = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  rpcUrls: ['https://mainnet.infura.io/v3/', 'https://eth-mainnet.g.alchemy.com/v2/'],
  blockExplorerUrls: ['https://etherscan.io'],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH', 
    decimals: 18
  }
} as const;

// ================================================================================================
// API CONFIGURATION
// ================================================================================================

/** CoinGecko API configuration */
export const COINGECKO_CONFIG = {
  BASE_URL: 'https://api.coingecko.com/api/v3',
  TIMEOUT: 10000,
  CACHE_DURATION: 30000,
  RATE_LIMIT_DELAY: 1000
} as const;

/** Alchemy API configuration */
export const ALCHEMY_CONFIG = {
  DEFAULT_API_KEY: 'demo-key',
  TIMEOUT: 15000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 2000
} as const;

// ================================================================================================
// UI CONSTANTS
// ================================================================================================

/** Animation timings */
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  BLINK_INTERVAL: 1000
} as const;

/** CSS class names */
export const CSS_CLASSES = {
  CONTAINER: 'dsky-container',
  MAIN: 'dsky-main',
  HEADER: 'dsky-header',
  BODY: 'dsky-body',
  CONTROLS: 'dsky-controls',
  STATUS: 'dsky-status',
  DISPLAY: 'dsky-display',
  KEYPAD: 'dsky-keypad',
  OUTPUT: 'dsky-output',
  BUTTON: 'dsky-button',
  ACTIVE: 'active',
  INPUT_MODE: 'input-mode',
  ERROR: 'error'
} as const;

// ================================================================================================
// STATUS MESSAGES
// ================================================================================================

/** Status message functions */
export const STATUS_MESSAGES = {
  WEB3_INITIALIZED: 'Web3 service initialized',
  WEB3_INIT_FAILED: (error: string) => `Failed to initialize Web3: ${error}`,
  WEB3_NOT_INITIALIZED: 'Web3 service not initialized',
  VERB_MODE_ACTIVATED: 'VERB mode activated',
  NOUN_MODE_ACTIVATED: 'NOUN mode activated',
  PROC_MODE_ACTIVATED: 'PROC mode activated',
  INPUT_CLEARED: 'Input cleared',
  SYSTEM_RESET: 'System reset',
  WALLET_CONNECTED: (address: string) => `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
  WALLET_DISCONNECTED: 'Wallet disconnected',
  BALANCE_UPDATED: (balance: string) => `Balance: ${parseFloat(balance).toFixed(4)} ETH`,
  CURRENT_BLOCK: (blockNumber: number) => `Current block: ${blockNumber}`,
  NETWORK_INFO: (networkName: string, blockNumber: number) => `Network: ${networkName} Block: ${blockNumber}`,
  GAS_PRICE: (gasInGwei: number) => `Gas price: ${gasInGwei.toFixed(2)} Gwei`,
  WALLET_MONITORING: (address: string) => `Monitoring wallet: ${address}`,
  HEALTH_CHECK: (result: boolean) => `Health check: ${result ? 'PASS' : 'FAIL'}`,
  CRYPTO_PRICE: (symbol: string, price: number) => `${symbol}: $${price.toFixed(2)}`,
  INVALID_COMBINATION: (verb: string, noun: string) => `Invalid V${verb}N${noun} combination`,
  COMMAND_NOT_IMPLEMENTED: (verb: string, noun: string) => `Command V${verb}N${noun} not implemented`,
  COMMAND_ERROR: (verb: string, noun: string, error: string) => `Error executing V${verb}N${noun}: ${error}`,
  FIELD_UPDATED: (field: string, value: string) => `${field.toUpperCase()}: ${value}`
} as const;

/** Input configuration */
export const INPUT_CONFIG = {
  MAX_INPUT_LENGTH: 2,
  REGISTER_LENGTH: 5,
  DEFAULT_PADDING: '0'
} as const;

// ================================================================================================
// ERROR MESSAGES
// ================================================================================================

/** Standard error messages */
export const ERROR_MESSAGES = {
  WEB3_NOT_INITIALIZED: 'Web3 service not initialized',
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  INVALID_COMMAND: 'Invalid verb/noun combination',
  NETWORK_ERROR: 'Network connection failed',
  TIMEOUT_ERROR: 'Operation timed out',
  UNKNOWN_ERROR: 'An unknown error occurred'
} as const;

/** Success messages */
export const SUCCESS_MESSAGES = {
  WEB3_INITIALIZED: 'Web3 service initialized',
  WALLET_CONNECTED: (address: string) => `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
  WALLET_DISCONNECTED: 'Wallet disconnected',
  COMMAND_EXECUTED: 'Command executed successfully',
  SYSTEM_READY: 'System ready'
} as const;

// ================================================================================================
// VALIDATION PATTERNS
// ================================================================================================

/** Input validation regex patterns */
export const VALIDATION_PATTERNS = {
  VERB_NOUN: /^[0-9]{2}$/,
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  DECIMAL_NUMBER: /^\d+\.?\d*$/,
  INTEGER: /^\d+$/
} as const;

// ================================================================================================
// PERFORMANCE OPTIMIZATION
// ================================================================================================

/** Debounce and throttle timings */
export const PERFORMANCE = {
  DEBOUNCE_INPUT: 300,
  THROTTLE_SCROLL: 100,
  THROTTLE_RESIZE: 250,
  ANIMATION_FRAME_TIMEOUT: 16
} as const;

/** Memory management */
export const MEMORY = {
  MAX_STATUS_MESSAGES: 50,
  CACHE_SIZE_LIMIT: 100,
  CLEANUP_INTERVAL: 300000 // 5 minutes
} as const;
