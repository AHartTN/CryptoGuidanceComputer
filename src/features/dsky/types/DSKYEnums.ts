/**
 * DSKY Enumerations for Switch Statement Refactoring
 * Bit-flaggable enumerations following Apollo DSKY specifications
 * ORGANIZED BY EXECUTION ORDER: Lower numbers = earlier operations, Higher numbers = later operations
 */

/** DSKY Verb Commands - Organized by execution priority */
export const DSKYVerb = {
  // === BASIC SYSTEM OPERATIONS (01-09) ===
  VERB_NONE: 0,           // 00 - No verb
  VERB_CONNECT_WALLET: 1, // 01 - Connect wallet (FIRST action user should take)
  VERB_HEALTH_CHECK: 2,   // 02 - System health check  
  VERB_RESET_SYSTEM: 3,   // 03 - Reset/initialize system
  VERB_TEST_SYSTEM: 4,    // 04 - Run system diagnostics
  
  // === WALLET OPERATIONS (11-19) ===
  VERB_WALLET_INFO: 11,   // 11 - Display wallet information
  VERB_WALLET_BALANCE: 12, // 12 - Display wallet balance
  VERB_WALLET_TOKENS: 13, // 13 - Display token balances
  VERB_WALLET_NFTS: 14,   // 14 - Display NFT holdings
  VERB_SWITCH_NETWORK: 15, // 15 - Switch blockchain network
  
  // === BLOCKCHAIN DATA (21-29) ===
  VERB_BLOCK_INFO: 21,    // 21 - Display blockchain information
  VERB_BLOCK_CURRENT: 22, // 22 - Display current block info
  VERB_BLOCK_SPECIFIC: 23, // 23 - Display specific block info
  VERB_GAS_PRICES: 24,    // 24 - Display gas prices
  VERB_NETWORK_STATUS: 25, // 25 - Display network status
    // === CRYPTO PRICES (31-39) ===
  VERB_CRYPTO_PRICES: 31, // 31 - Display cryptocurrency prices (deprecated - use dynamic system)
  VERB_CRYPTO_DETAIL: 32, // 32 - Display detailed crypto info (deprecated - use dynamic system)
  VERB_CRYPTO_HISTORY: 33, // 33 - Display price history
  VERB_CRYPTO_COMPARE: 34, // 34 - Compare cryptocurrencies
  VERB_GET_COIN_LIST: 35,  // 35 - Retrieve available coins list
  VERB_GET_COIN_PRICE: 36, // 36 - Get price for specific coin (use with dynamic noun)
  VERB_FLAG_COIN: 37,      // 37 - Flag/unflag coin for batch operations
  VERB_BATCH_PRICES: 38,   // 38 - Retrieve prices for all flagged coins
  VERB_CLEAR_FLAGS: 39,    // 39 - Clear all coin flags
  
  // === TRANSACTIONS (41-49) ===
  VERB_SEND_ETH: 41,      // 41 - Send ETH transaction
  VERB_SEND_TOKEN: 42,    // 42 - Send token transaction
  VERB_TRANSACTION_INFO: 43, // 43 - Display transaction info
  VERB_TRANSACTION_HISTORY: 44, // 44 - Display transaction history
    // === ADVANCED OPERATIONS (51-59) ===
  VERB_SMART_CONTRACT: 51, // 51 - Interact with smart contracts
  VERB_DEFI_OPERATIONS: 52, // 52 - DeFi operations
  VERB_STAKING_INFO: 53,   // 53 - Staking information
  VERB_DISPLAY_CRYPTO: 54, // 54 - Display crypto information
  
  // === SYSTEM MANAGEMENT (91-99) ===
  VERB_CONFIG_DISPLAY: 91, // 91 - Display configuration
  VERB_LOG_DISPLAY: 92,    // 92 - Display system logs
  VERB_ERROR_DISPLAY: 93,  // 93 - Display error information
  VERB_STATUS_DISPLAY: 94, // 94 - Display comprehensive status
  VERB_SYSTEM_CMD: 95,     // 95 - System command execution
  VERB_SYSTEM_SHUTDOWN: 99 // 99 - System shutdown/disconnect all
} as const;

/** DSKY Noun Commands - Organized by data type and complexity */
export const DSKYNoun = {
  // === BASIC SYSTEM NOUNS (00-09) ===
  NOUN_NONE: 0,           // 00 - No noun
  NOUN_SYSTEM_STATUS: 1,  // 01 - Overall system status
  NOUN_WALLET_STATUS: 2,  // 02 - Wallet connection status
  NOUN_NETWORK_STATUS: 3, // 03 - Network connection status
  NOUN_ERROR_STATUS: 4,   // 04 - Error status
  NOUN_HEALTH_STATUS: 5,  // 05 - Health check status
  
  // === WALLET DATA (11-19) ===
  NOUN_WALLET_ADDRESS: 11, // 11 - Wallet address
  NOUN_WALLET_BALANCE: 12, // 12 - ETH balance
  NOUN_WALLET_TOKENS: 13,  // 13 - Token balances
  NOUN_WALLET_NFTS: 14,    // 14 - NFT holdings
  
  // === BLOCKCHAIN DATA (21-29) ===
  NOUN_CURRENT_BLOCK: 21,  // 21 - Current block number
  NOUN_BLOCK_TIME: 22,     // 22 - Block timestamp
  NOUN_GAS_PRICE: 23,      // 23 - Current gas price
  NOUN_CHAIN_ID: 24,       // 24 - Chain ID
  NOUN_NETWORK_NAME: 25,   // 25 - Network name
  // === CRYPTOCURRENCY DATA (31-49) - Static/Legacy ===
  NOUN_CRYPTO_BITCOIN: 31, // 31 - Bitcoin (BTC) - Legacy
  NOUN_CRYPTO_ETHEREUM: 32, // 32 - Ethereum (ETH) - Legacy
  NOUN_CRYPTO_CHAINLINK: 33, // 33 - Chainlink (LINK) - Legacy
  NOUN_CRYPTO_POLYGON: 34,  // 34 - Polygon (MATIC) - Legacy
  NOUN_CRYPTO_UNISWAP: 35,  // 35 - Uniswap (UNI) - Legacy
  NOUN_CRYPTO_CARDANO: 36,  // 36 - Cardano (ADA) - Legacy
  NOUN_CRYPTO_SOLANA: 37,   // 37 - Solana (SOL) - Legacy
  NOUN_CRYPTO_DOGECOIN: 38, // 38 - Dogecoin (DOGE) - Legacy
  NOUN_CRYPTO_LITECOIN: 39, // 39 - Litecoin (LTC) - Legacy
  NOUN_CRYPTO_TOP10: 40,    // 40 - Top 10 cryptocurrencies - Legacy
  
  // === CRYPTO OPERATIONS (41-49) ===
  NOUN_COIN_LIST: 41,       // 41 - Available coins list
  NOUN_FLAGGED_COINS: 42,   // 42 - Flagged coins for batch operations
  NOUN_BATCH_RESULTS: 43,   // 43 - Batch price retrieval results
  NOUN_COIN_FLAGS: 44,      // 44 - Coin flag status
  
  // === DYNAMIC CRYPTO NOUNS (200-999) ===
  // Range 200-999 reserved for dynamically mapped coin nouns
  // These will be populated at runtime based on available coins
  NOUN_DYNAMIC_COIN_START: 200, // 200 - Start of dynamic coin range
  NOUN_DYNAMIC_COIN_END: 999,   // 999 - End of dynamic coin range
  
  // === TRANSACTION DATA (51-59) ===
  NOUN_TX_PENDING: 51,     // 51 - Pending transactions
  NOUN_TX_RECENT: 52,      // 52 - Recent transactions
  NOUN_TX_HASH: 53,        // 53 - Specific transaction hash
  NOUN_TX_FEES: 54,        // 54 - Transaction fees
  
  // === DEFI DATA (61-69) ===
  NOUN_DEFI_POOLS: 61,     // 61 - DeFi liquidity pools
  NOUN_DEFI_YIELDS: 62,    // 62 - DeFi yield rates
  NOUN_DEFI_STAKES: 63,    // 63 - Staking positions
  
  // === CONFIGURATION DATA (91-99) ===
  NOUN_CONFIG_NETWORK: 91, // 91 - Network configuration
  NOUN_CONFIG_WALLET: 92,  // 92 - Wallet configuration
  NOUN_CONFIG_API: 93,     // 93 - API configuration
  NOUN_CONFIG_ALL: 94,     // 94 - All configuration
    // === SPECIAL OPERATIONS (101-199) ===
  NOUN_OPERATION_CONNECT: 101,  // 101 - Connect operation
  NOUN_OPERATION_DISCONNECT: 102, // 102 - Disconnect operation
  NOUN_OPERATION_RESET: 103,    // 103 - Reset operation
  NOUN_OPERATION_TEST: 104,     // 104 - Test operation
  NOUN_OPERATION_BACKUP: 105,   // 105 - Backup operation
  NOUN_OPERATION_RESTORE: 106,  // 106 - Restore operation
  NOUN_SYSTEM_RESET: 199        // 199 - System reset operation
} as const;

/** DSKY Program Commands - Complex multi-step operations */
export const DSKYProgram = {
  // === BASIC PROGRAMS (00-09) ===
  PROG_NONE: 0,           // 00 - No program
  PROG_STARTUP: 1,        // 01 - System startup sequence
  PROG_CONNECT_ALL: 2,    // 02 - Connect wallet + blockchain
  PROG_HEALTH_CHECK: 3,   // 03 - Complete system health check
  PROG_RESET_ALL: 4,      // 04 - Complete system reset
  
  // === WALLET PROGRAMS (11-19) ===
  PROG_WALLET_SETUP: 11,  // 11 - Complete wallet setup
  PROG_WALLET_BACKUP: 12, // 12 - Wallet backup procedure
  PROG_MULTI_WALLET: 13,  // 13 - Multi-wallet management
  
  // === TRADING PROGRAMS (21-29) ===
  PROG_PORTFOLIO_VIEW: 21, // 21 - Complete portfolio view
  PROG_PRICE_MONITOR: 22,  // 22 - Real-time price monitoring
  PROG_TRADING_ANALYSIS: 23, // 23 - Trading analysis
  PROG_RISK_ASSESSMENT: 24, // 24 - Risk assessment
  
  // === DEFI PROGRAMS (31-39) ===
  PROG_DEFI_DASHBOARD: 31, // 31 - Complete DeFi dashboard
  PROG_YIELD_FARMING: 32,  // 32 - Yield farming operations
  PROG_LIQUIDITY_MINING: 33, // 33 - Liquidity mining
  PROG_STAKING_REWARDS: 34, // 34 - Staking rewards program
  
  // === TRANSACTION PROGRAMS (41-49) ===
  PROG_BULK_TRANSFER: 41,  // 41 - Bulk token transfers
  PROG_BATCH_APPROVE: 42,  // 42 - Batch approve operations
  PROG_MULTI_SEND: 43,     // 43 - Multi-recipient sends
  
  // === ANALYTICS PROGRAMS (51-59) ===
  PROG_FULL_ANALYTICS: 51, // 51 - Complete analytics suite
  PROG_PERFORMANCE_TRACKING: 52, // 52 - Performance tracking
  PROG_TAX_REPORTING: 53,  // 53 - Tax reporting
  
  // === SECURITY PROGRAMS (61-69) ===
  PROG_SECURITY_AUDIT: 61, // 61 - Security audit
  PROG_KEY_MANAGEMENT: 62, // 62 - Key management
  PROG_RECOVERY_MODE: 63,  // 63 - Recovery procedures
  
  // === MAINTENANCE PROGRAMS (91-99) ===
  PROG_SYSTEM_MAINTENANCE: 91, // 91 - System maintenance
  PROG_DATA_CLEANUP: 92,   // 92 - Data cleanup
  PROG_LOG_ROTATION: 93,   // 93 - Log rotation
  PROG_BACKUP_ALL: 94,     // 94 - Complete system backup
  PROG_EMERGENCY_STOP: 99  // 99 - Emergency stop all operations
} as const;

/** Key Types - Bit flaggable for input validation */
export const DSKYKeyType = {
  KEY_NONE: 0,
  KEY_VERB: 1 << 0,      // 1
  KEY_NOUN: 1 << 1,      // 2
  KEY_ENTER: 1 << 2,     // 4
  KEY_CLEAR: 1 << 3,     // 8
  KEY_RESET: 1 << 4,     // 16
  KEY_NUMERIC: 1 << 5    // 32
} as const;

/** Input Modes for DSKY */
export const DSKYInputMode = {
  MODE_NONE: 0,
  MODE_VERB: 1,
  MODE_NOUN: 2,
  MODE_DATA: 3
} as const;

/** Command Execution Status */
export const DSKYCommandStatus = {
  STATUS_NONE: 0,
  STATUS_EXECUTING: 1,
  STATUS_SUCCESS: 2,
  STATUS_ERROR: 3,
  STATUS_INVALID_VERB: 4,
  STATUS_INVALID_NOUN: 5,
  STATUS_WALLET_NOT_CONNECTED: 6
} as const;

/** Enhanced Crypto Data Index Mapping */
export const CryptoIndex = {
  BITCOIN: 0,
  ETHEREUM: 1,
  CHAINLINK: 2,
  POLYGON: 3,
  UNISWAP: 4,
  CARDANO: 5,
  SOLANA: 6,
  DOGECOIN: 7,
  LITECOIN: 8,
  TOP_10: 9
} as const;

/** Command Execution Priority Levels */
export const CommandPriority = {
  IMMEDIATE: 0,    // System critical (connect, health)
  HIGH: 1,         // Wallet operations
  NORMAL: 2,       // Data display
  LOW: 3,          // Analytics, monitoring
  BACKGROUND: 4    // Maintenance, cleanup
} as const;

/** Command Categories for validation */
export const CommandCategory = {
  SYSTEM: 1 << 0,      // 1 - System operations
  WALLET: 1 << 1,      // 2 - Wallet operations  
  BLOCKCHAIN: 1 << 2,  // 4 - Blockchain data
  CRYPTO: 1 << 3,      // 8 - Cryptocurrency data
  TRANSACTION: 1 << 4, // 16 - Transaction operations
  DEFI: 1 << 5,        // 32 - DeFi operations
  ANALYTICS: 1 << 6,   // 64 - Analytics operations
  MAINTENANCE: 1 << 7  // 128 - Maintenance operations
} as const;

/** Warning Light States - Bit flaggable for status tracking */
export const DSKYWarningFlag = {
  WARNING_NONE: 0,
  COMP_ACTY: 1 << 0,     // 1
  UPLINK_ACTY: 1 << 1,   // 2
  NO_ATT: 1 << 2,        // 4
  STBY: 1 << 3,          // 8
  KEY_REL: 1 << 4,       // 16
  OPR_ERR: 1 << 5,       // 32
  TEMP: 1 << 6,          // 64
  GIMBAL_LOCK: 1 << 7,   // 128
  RESTART: 1 << 8        // 256
} as const;

/** Utility function to check if a key type flag is set */
export function hasKeyFlag(keyFlags: number, flag: number): boolean {
  return (keyFlags & flag) === flag;
}

/** Utility function to set warning flag */
export function setWarningFlag(currentFlags: number, flag: number): number {
  return currentFlags | flag;
}

/** Utility function to clear warning flag */
export function clearWarningFlag(currentFlags: number, flag: number): number {
  return currentFlags & ~flag;
}

/** Get key type enum from string */
export function getKeyType(key: string): number {
  switch (key) {
    case 'VERB':
      return DSKYKeyType.KEY_VERB;
    case 'NOUN':
      return DSKYKeyType.KEY_NOUN;
    case 'ENTR':
      return DSKYKeyType.KEY_ENTER;
    case 'CLR':
      return DSKYKeyType.KEY_CLEAR;
    case 'RSET':
      return DSKYKeyType.KEY_RESET;
    default:
      return /^\d$/.test(key) ? DSKYKeyType.KEY_NUMERIC : DSKYKeyType.KEY_NONE;
  }
}

/** Get verb enum from string - Updated for new structure */
export function getVerbEnum(verb: string): number {
  const verbNum = parseInt(verb);
  
  // Direct mapping of common verb numbers
  switch (verbNum) {
    // Basic system operations
    case 1: return DSKYVerb.VERB_CONNECT_WALLET;
    case 2: return DSKYVerb.VERB_HEALTH_CHECK;
    case 3: return DSKYVerb.VERB_RESET_SYSTEM;
    case 4: return DSKYVerb.VERB_TEST_SYSTEM;
    
    // Wallet operations
    case 11: return DSKYVerb.VERB_WALLET_INFO;
    case 12: return DSKYVerb.VERB_WALLET_BALANCE;
    case 13: return DSKYVerb.VERB_WALLET_TOKENS;
    case 14: return DSKYVerb.VERB_WALLET_NFTS;
    case 15: return DSKYVerb.VERB_SWITCH_NETWORK;
    
    // Blockchain data
    case 21: return DSKYVerb.VERB_BLOCK_INFO;
    case 22: return DSKYVerb.VERB_BLOCK_CURRENT;
    case 23: return DSKYVerb.VERB_BLOCK_SPECIFIC;
    case 24: return DSKYVerb.VERB_GAS_PRICES;
    case 25: return DSKYVerb.VERB_NETWORK_STATUS;
    
    // Crypto prices
    case 31: return DSKYVerb.VERB_CRYPTO_PRICES;
    case 32: return DSKYVerb.VERB_CRYPTO_DETAIL;
    case 33: return DSKYVerb.VERB_CRYPTO_HISTORY;
    case 34: return DSKYVerb.VERB_CRYPTO_COMPARE;
    
    // Transactions
    case 41: return DSKYVerb.VERB_SEND_ETH;
    case 42: return DSKYVerb.VERB_SEND_TOKEN;
    case 43: return DSKYVerb.VERB_TRANSACTION_INFO;
    case 44: return DSKYVerb.VERB_TRANSACTION_HISTORY;
    
    // System management
    case 91: return DSKYVerb.VERB_CONFIG_DISPLAY;
    case 92: return DSKYVerb.VERB_LOG_DISPLAY;
    case 93: return DSKYVerb.VERB_ERROR_DISPLAY;
    case 94: return DSKYVerb.VERB_STATUS_DISPLAY;
    case 99: return DSKYVerb.VERB_SYSTEM_SHUTDOWN;
    
    default: return DSKYVerb.VERB_NONE;
  }
}

/** Get noun enum from string for specific verb context - Updated for new structure */
export function getNounEnum(noun: string, verb: number): number {
  const nounNum = parseInt(noun);
  
  switch (verb) {
    // Connect wallet operations
    case DSKYVerb.VERB_CONNECT_WALLET:
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_SYSTEM_STATUS;
        case 101: return DSKYNoun.NOUN_OPERATION_CONNECT;
        default: return DSKYNoun.NOUN_SYSTEM_STATUS; // Default to status
      }
    
    // Wallet info operations
    case DSKYVerb.VERB_WALLET_INFO:
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_WALLET_ADDRESS;
        case 2: return DSKYNoun.NOUN_WALLET_BALANCE;
        case 3: return DSKYNoun.NOUN_WALLET_TOKENS;
        case 11: return DSKYNoun.NOUN_WALLET_ADDRESS;
        case 12: return DSKYNoun.NOUN_WALLET_BALANCE;
        case 13: return DSKYNoun.NOUN_WALLET_TOKENS;
        case 14: return DSKYNoun.NOUN_WALLET_NFTS;
        default: return DSKYNoun.NOUN_WALLET_STATUS;
      }
    
    // Blockchain info operations  
    case DSKYVerb.VERB_BLOCK_CURRENT:
    case DSKYVerb.VERB_BLOCK_INFO:
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_CURRENT_BLOCK;
        case 2: return DSKYNoun.NOUN_BLOCK_TIME;
        case 3: return DSKYNoun.NOUN_GAS_PRICE;
        case 21: return DSKYNoun.NOUN_CURRENT_BLOCK;
        case 22: return DSKYNoun.NOUN_BLOCK_TIME;
        case 23: return DSKYNoun.NOUN_GAS_PRICE;
        case 24: return DSKYNoun.NOUN_CHAIN_ID;
        case 25: return DSKYNoun.NOUN_NETWORK_NAME;
        default: return DSKYNoun.NOUN_CURRENT_BLOCK;
      }
    
    // Crypto price operations
    case DSKYVerb.VERB_CRYPTO_PRICES:
    case DSKYVerb.VERB_CRYPTO_DETAIL:
      switch (nounNum) {
        case 1: 
        case 31: return DSKYNoun.NOUN_CRYPTO_BITCOIN;
        case 2:
        case 32: return DSKYNoun.NOUN_CRYPTO_ETHEREUM;
        case 3:
        case 33: return DSKYNoun.NOUN_CRYPTO_CHAINLINK;
        case 4:
        case 34: return DSKYNoun.NOUN_CRYPTO_POLYGON;
        case 5:
        case 35: return DSKYNoun.NOUN_CRYPTO_UNISWAP;
        case 6:
        case 36: return DSKYNoun.NOUN_CRYPTO_CARDANO;
        case 7:
        case 37: return DSKYNoun.NOUN_CRYPTO_SOLANA;
        case 8:
        case 38: return DSKYNoun.NOUN_CRYPTO_DOGECOIN;
        case 9:
        case 39: return DSKYNoun.NOUN_CRYPTO_LITECOIN;
        case 10:
        case 40: return DSKYNoun.NOUN_CRYPTO_TOP10;
        default: return DSKYNoun.NOUN_CRYPTO_BITCOIN;
      }
    
    // System operations
    case DSKYVerb.VERB_RESET_SYSTEM:
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_SYSTEM_STATUS;
        case 102: return DSKYNoun.NOUN_OPERATION_RESET;
        case 103: return DSKYNoun.NOUN_OPERATION_RESET;
        default: return DSKYNoun.NOUN_OPERATION_RESET;
      }
    
    // Status display operations
    case DSKYVerb.VERB_STATUS_DISPLAY:
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_SYSTEM_STATUS;
        case 2: return DSKYNoun.NOUN_WALLET_STATUS;
        case 3: return DSKYNoun.NOUN_NETWORK_STATUS;
        case 4: return DSKYNoun.NOUN_ERROR_STATUS;
        case 5: return DSKYNoun.NOUN_HEALTH_STATUS;
        default: return DSKYNoun.NOUN_SYSTEM_STATUS;
      }
    
    default:
      // Default noun mapping for any verb
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_SYSTEM_STATUS;
        case 2: return DSKYNoun.NOUN_WALLET_STATUS;
        case 3: return DSKYNoun.NOUN_NETWORK_STATUS;
        default: return DSKYNoun.NOUN_NONE;
      }
  }
}

/** Get program enum from string */
export function getProgramEnum(program: string): number {
  const progNum = parseInt(program);
  
  switch (progNum) {
    // Basic programs
    case 1: return DSKYProgram.PROG_STARTUP;
    case 2: return DSKYProgram.PROG_CONNECT_ALL;
    case 3: return DSKYProgram.PROG_HEALTH_CHECK;
    case 4: return DSKYProgram.PROG_RESET_ALL;
    
    // Wallet programs
    case 11: return DSKYProgram.PROG_WALLET_SETUP;
    case 12: return DSKYProgram.PROG_WALLET_BACKUP;
    case 13: return DSKYProgram.PROG_MULTI_WALLET;
    
    // Trading programs
    case 21: return DSKYProgram.PROG_PORTFOLIO_VIEW;
    case 22: return DSKYProgram.PROG_PRICE_MONITOR;
    case 23: return DSKYProgram.PROG_TRADING_ANALYSIS;
    case 24: return DSKYProgram.PROG_RISK_ASSESSMENT;
    
    // DeFi programs
    case 31: return DSKYProgram.PROG_DEFI_DASHBOARD;
    case 32: return DSKYProgram.PROG_YIELD_FARMING;
    case 33: return DSKYProgram.PROG_LIQUIDITY_MINING;
    case 34: return DSKYProgram.PROG_STAKING_REWARDS;
    
    // Emergency/maintenance
    case 99: return DSKYProgram.PROG_EMERGENCY_STOP;
    
    default: return DSKYProgram.PROG_NONE;
  }
}

/** Validate verb-noun combination */
export function isValidVerbNounCombination(verb: number, noun: number): boolean {
  // Define valid combinations based on command categories
  switch (verb) {
    case DSKYVerb.VERB_CONNECT_WALLET: {
      return noun === DSKYNoun.NOUN_SYSTEM_STATUS || 
             noun === DSKYNoun.NOUN_OPERATION_CONNECT ||
             noun === DSKYNoun.NOUN_WALLET_ADDRESS ||
             noun === DSKYNoun.NOUN_WALLET_STATUS;
    }
      case DSKYVerb.VERB_WALLET_INFO:
    case DSKYVerb.VERB_WALLET_BALANCE:
    case DSKYVerb.VERB_WALLET_TOKENS:
      return (noun >= DSKYNoun.NOUN_WALLET_ADDRESS && noun <= DSKYNoun.NOUN_WALLET_NFTS) ||
             noun === DSKYNoun.NOUN_WALLET_STATUS;
    
    // Legacy crypto price verbs
    case DSKYVerb.VERB_CRYPTO_PRICES:
    case DSKYVerb.VERB_CRYPTO_DETAIL:
      return (noun >= DSKYNoun.NOUN_CRYPTO_BITCOIN && noun <= DSKYNoun.NOUN_CRYPTO_TOP10);
    
    // New dynamic crypto system verbs
    case DSKYVerb.VERB_GET_COIN_LIST:
      return noun === DSKYNoun.NOUN_COIN_LIST;
    
    case DSKYVerb.VERB_GET_COIN_PRICE:
      return (noun >= DSKYNoun.NOUN_DYNAMIC_COIN_START && noun <= DSKYNoun.NOUN_DYNAMIC_COIN_END) ||
             (noun >= DSKYNoun.NOUN_CRYPTO_BITCOIN && noun <= DSKYNoun.NOUN_CRYPTO_TOP10);
    
    case DSKYVerb.VERB_FLAG_COIN:
      return (noun >= DSKYNoun.NOUN_DYNAMIC_COIN_START && noun <= DSKYNoun.NOUN_DYNAMIC_COIN_END) ||
             (noun >= DSKYNoun.NOUN_CRYPTO_BITCOIN && noun <= DSKYNoun.NOUN_CRYPTO_TOP10);
    
    case DSKYVerb.VERB_BATCH_PRICES:
      return noun === DSKYNoun.NOUN_FLAGGED_COINS || noun === DSKYNoun.NOUN_BATCH_RESULTS;
    
    case DSKYVerb.VERB_CLEAR_FLAGS:
      return noun === DSKYNoun.NOUN_COIN_FLAGS || noun === DSKYNoun.NOUN_FLAGGED_COINS;
    
    case DSKYVerb.VERB_BLOCK_INFO:
    case DSKYVerb.VERB_BLOCK_CURRENT:
      return (noun >= DSKYNoun.NOUN_CURRENT_BLOCK && noun <= DSKYNoun.NOUN_NETWORK_NAME);
    
    default:
      return true; // Allow unknown combinations for extensibility
  }
}

/** Get command priority level */
export function getCommandPriority(verb: number): number {
  switch (verb) {
    case DSKYVerb.VERB_CONNECT_WALLET:
    case DSKYVerb.VERB_HEALTH_CHECK:
    case DSKYVerb.VERB_RESET_SYSTEM:
      return CommandPriority.IMMEDIATE;
    
    case DSKYVerb.VERB_WALLET_INFO:
    case DSKYVerb.VERB_WALLET_BALANCE:
    case DSKYVerb.VERB_SEND_ETH:
    case DSKYVerb.VERB_SEND_TOKEN:
      return CommandPriority.HIGH;
    
    case DSKYVerb.VERB_CRYPTO_PRICES:
    case DSKYVerb.VERB_BLOCK_INFO:
    case DSKYVerb.VERB_TRANSACTION_INFO:
      return CommandPriority.NORMAL;
    
    case DSKYVerb.VERB_CRYPTO_HISTORY:
    case DSKYVerb.VERB_LOG_DISPLAY:
      return CommandPriority.LOW;
    
    default:
      return CommandPriority.NORMAL;
  }
}

/** Get command category flags */
export function getCommandCategory(verb: number): number {
  switch (verb) {
    case DSKYVerb.VERB_CONNECT_WALLET:
    case DSKYVerb.VERB_HEALTH_CHECK:
    case DSKYVerb.VERB_RESET_SYSTEM:
    case DSKYVerb.VERB_TEST_SYSTEM:
      return CommandCategory.SYSTEM;
    
    case DSKYVerb.VERB_WALLET_INFO:
    case DSKYVerb.VERB_WALLET_BALANCE:
    case DSKYVerb.VERB_WALLET_TOKENS:
    case DSKYVerb.VERB_WALLET_NFTS:
      return CommandCategory.WALLET;
    
    case DSKYVerb.VERB_BLOCK_INFO:
    case DSKYVerb.VERB_BLOCK_CURRENT:
    case DSKYVerb.VERB_GAS_PRICES:
    case DSKYVerb.VERB_NETWORK_STATUS:
      return CommandCategory.BLOCKCHAIN;
    
    case DSKYVerb.VERB_CRYPTO_PRICES:
    case DSKYVerb.VERB_CRYPTO_DETAIL:
    case DSKYVerb.VERB_CRYPTO_HISTORY:
      return CommandCategory.CRYPTO;
    
    case DSKYVerb.VERB_SEND_ETH:
    case DSKYVerb.VERB_SEND_TOKEN:
    case DSKYVerb.VERB_TRANSACTION_INFO:
      return CommandCategory.TRANSACTION;
    
    default:
      return CommandCategory.SYSTEM;
  }
}
