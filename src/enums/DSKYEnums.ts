// DSKY Enums and related utility functions extracted from features/dsky/types/DSKYEnums.ts
// This file is part of the solution-wide refactor for SOLID/DRY and separation of concerns.

export const DSKYVerb = {
  VERB_NONE: 0,
  VERB_CONNECT_WALLET: 1,
  VERB_HEALTH_CHECK: 2,
  VERB_RESET_SYSTEM: 3,
  VERB_TEST_SYSTEM: 4,
  VERB_WALLET_INFO: 11,
  VERB_WALLET_BALANCE: 12,
  VERB_WALLET_TOKENS: 13,
  VERB_WALLET_NFTS: 14,
  VERB_SWITCH_NETWORK: 15,
  VERB_BLOCK_INFO: 21,
  VERB_BLOCK_CURRENT: 22,
  VERB_BLOCK_SPECIFIC: 23,
  VERB_GAS_PRICES: 24,
  VERB_NETWORK_STATUS: 25,
  VERB_CRYPTO_PRICES: 31,
  VERB_CRYPTO_DETAIL: 32,
  VERB_CRYPTO_HISTORY: 33,
  VERB_CRYPTO_COMPARE: 34,
  VERB_GET_COIN_LIST: 35,
  VERB_GET_COIN_PRICE: 36,
  VERB_FLAG_COIN: 37,
  VERB_BATCH_PRICES: 38,
  VERB_CLEAR_FLAGS: 39,
  VERB_SEND_ETH: 41,
  VERB_SEND_TOKEN: 42,
  VERB_TRANSACTION_INFO: 43,
  VERB_TRANSACTION_HISTORY: 44,
  VERB_SMART_CONTRACT: 51,
  VERB_DEFI_OPERATIONS: 52,
  VERB_STAKING_INFO: 53,
  VERB_DISPLAY_CRYPTO: 54,
  VERB_CONFIG_DISPLAY: 91,
  VERB_LOG_DISPLAY: 92,
  VERB_ERROR_DISPLAY: 93,
  VERB_STATUS_DISPLAY: 94,
  VERB_SYSTEM_CMD: 95,
  VERB_SYSTEM_SHUTDOWN: 99
} as const;

export const DSKYNoun = {
  NOUN_NONE: 0,
  NOUN_SYSTEM_STATUS: 1,
  NOUN_WALLET_STATUS: 2,
  NOUN_NETWORK_STATUS: 3,
  NOUN_ERROR_STATUS: 4,
  NOUN_HEALTH_STATUS: 5,
  NOUN_WALLET_ADDRESS: 11,
  NOUN_WALLET_BALANCE: 12,
  NOUN_WALLET_TOKENS: 13,
  NOUN_WALLET_NFTS: 14,
  NOUN_CURRENT_BLOCK: 21,
  NOUN_BLOCK_TIME: 22,
  NOUN_GAS_PRICE: 23,
  NOUN_CHAIN_ID: 24,
  NOUN_NETWORK_NAME: 25,
  NOUN_CRYPTO_BITCOIN: 31,
  NOUN_CRYPTO_ETHEREUM: 32,
  NOUN_CRYPTO_CHAINLINK: 33,
  NOUN_CRYPTO_POLYGON: 34,
  NOUN_CRYPTO_UNISWAP: 35,
  NOUN_CRYPTO_CARDANO: 36,
  NOUN_CRYPTO_SOLANA: 37,
  NOUN_CRYPTO_DOGECOIN: 38,
  NOUN_CRYPTO_LITECOIN: 39,
  NOUN_CRYPTO_TOP10: 40,
  NOUN_COIN_LIST: 41,
  NOUN_FLAGGED_COINS: 42,
  NOUN_BATCH_RESULTS: 43,
  NOUN_COIN_FLAGS: 44,
  NOUN_DYNAMIC_COIN_START: 200,
  NOUN_DYNAMIC_COIN_END: 999,
  NOUN_TX_PENDING: 51,
  NOUN_TX_RECENT: 52,
  NOUN_TX_HASH: 53,
  NOUN_TX_FEES: 54,
  NOUN_DEFI_POOLS: 61,
  NOUN_DEFI_YIELDS: 62,
  NOUN_DEFI_STAKES: 63,
  NOUN_CONFIG_NETWORK: 91,
  NOUN_CONFIG_WALLET: 92,
  NOUN_CONFIG_API: 93,
  NOUN_CONFIG_ALL: 94,
  NOUN_OPERATION_CONNECT: 101,
  NOUN_OPERATION_DISCONNECT: 102,
  NOUN_OPERATION_RESET: 103,
  NOUN_OPERATION_TEST: 104,
  NOUN_OPERATION_BACKUP: 105,
  NOUN_OPERATION_RESTORE: 106,
  NOUN_SYSTEM_RESET: 199
} as const;

export const DSKYProgram = {
  PROG_NONE: 0,
  PROG_STARTUP: 1,
  PROG_CONNECT_ALL: 2,
  PROG_HEALTH_CHECK: 3,
  PROG_RESET_ALL: 4,
  PROG_WALLET_SETUP: 11,
  PROG_WALLET_BACKUP: 12,
  PROG_MULTI_WALLET: 13,
  PROG_PORTFOLIO_VIEW: 21,
  PROG_PRICE_MONITOR: 22,
  PROG_TRADING_ANALYSIS: 23,
  PROG_RISK_ASSESSMENT: 24,
  PROG_DEFI_DASHBOARD: 31,
  PROG_YIELD_FARMING: 32,
  PROG_LIQUIDITY_MINING: 33,
  PROG_STAKING_REWARDS: 34,
  PROG_BULK_TRANSFER: 41,
  PROG_BATCH_APPROVE: 42,
  PROG_MULTI_SEND: 43,
  PROG_FULL_ANALYTICS: 51,
  PROG_PERFORMANCE_TRACKING: 52,
  PROG_TAX_REPORTING: 53,
  PROG_SECURITY_AUDIT: 61,
  PROG_KEY_MANAGEMENT: 62,
  PROG_RECOVERY_MODE: 63,
  PROG_SYSTEM_MAINTENANCE: 91,
  PROG_DATA_CLEANUP: 92,
  PROG_LOG_ROTATION: 93,
  PROG_BACKUP_ALL: 94,
  PROG_EMERGENCY_STOP: 99
} as const;

export function getVerbEnum(verb: string): number {
  const verbNum = parseInt(verb);
  switch (verbNum) {
    case 1: return DSKYVerb.VERB_CONNECT_WALLET;
    case 2: return DSKYVerb.VERB_HEALTH_CHECK;
    case 3: return DSKYVerb.VERB_RESET_SYSTEM;
    case 4: return DSKYVerb.VERB_TEST_SYSTEM;
    case 11: return DSKYVerb.VERB_WALLET_INFO;
    case 12: return DSKYVerb.VERB_WALLET_BALANCE;
    case 13: return DSKYVerb.VERB_WALLET_TOKENS;
    case 14: return DSKYVerb.VERB_WALLET_NFTS;
    case 15: return DSKYVerb.VERB_SWITCH_NETWORK;
    case 21: return DSKYVerb.VERB_BLOCK_INFO;
    case 22: return DSKYVerb.VERB_BLOCK_CURRENT;
    case 23: return DSKYVerb.VERB_BLOCK_SPECIFIC;
    case 24: return DSKYVerb.VERB_GAS_PRICES;
    case 25: return DSKYVerb.VERB_NETWORK_STATUS;
    case 31: return DSKYVerb.VERB_CRYPTO_PRICES;
    case 32: return DSKYVerb.VERB_CRYPTO_DETAIL;
    case 33: return DSKYVerb.VERB_CRYPTO_HISTORY;
    case 34: return DSKYVerb.VERB_CRYPTO_COMPARE;
    case 41: return DSKYVerb.VERB_SEND_ETH;
    case 42: return DSKYVerb.VERB_SEND_TOKEN;
    case 43: return DSKYVerb.VERB_TRANSACTION_INFO;
    case 44: return DSKYVerb.VERB_TRANSACTION_HISTORY;
    case 91: return DSKYVerb.VERB_CONFIG_DISPLAY;
    case 92: return DSKYVerb.VERB_LOG_DISPLAY;
    case 93: return DSKYVerb.VERB_ERROR_DISPLAY;
    case 94: return DSKYVerb.VERB_STATUS_DISPLAY;
    case 99: return DSKYVerb.VERB_SYSTEM_SHUTDOWN;
    default: return DSKYVerb.VERB_NONE;
  }
}

export function getNounEnum(noun: string, verb: number): number {
  const nounNum = parseInt(noun);
  switch (verb) {
    case DSKYVerb.VERB_CONNECT_WALLET:
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_SYSTEM_STATUS;
        case 101: return DSKYNoun.NOUN_OPERATION_CONNECT;
        default: return DSKYNoun.NOUN_SYSTEM_STATUS;
      }
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
    case DSKYVerb.VERB_RESET_SYSTEM:
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_SYSTEM_STATUS;
        case 102: return DSKYNoun.NOUN_OPERATION_RESET;
        case 103: return DSKYNoun.NOUN_OPERATION_RESET;
        default: return DSKYNoun.NOUN_OPERATION_RESET;
      }
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
      switch (nounNum) {
        case 1: return DSKYNoun.NOUN_SYSTEM_STATUS;
        case 2: return DSKYNoun.NOUN_WALLET_STATUS;
        case 3: return DSKYNoun.NOUN_NETWORK_STATUS;
        default: return DSKYNoun.NOUN_NONE;
      }
  }
}

export function getProgramEnum(program: string): number {
  const progNum = parseInt(program);
  switch (progNum) {
    case 1: return DSKYProgram.PROG_STARTUP;
    case 2: return DSKYProgram.PROG_CONNECT_ALL;
    case 3: return DSKYProgram.PROG_HEALTH_CHECK;
    case 4: return DSKYProgram.PROG_RESET_ALL;
    case 11: return DSKYProgram.PROG_WALLET_SETUP;
    case 12: return DSKYProgram.PROG_WALLET_BACKUP;
    case 13: return DSKYProgram.PROG_MULTI_WALLET;
    case 21: return DSKYProgram.PROG_PORTFOLIO_VIEW;
    case 22: return DSKYProgram.PROG_PRICE_MONITOR;
    case 23: return DSKYProgram.PROG_TRADING_ANALYSIS;
    case 24: return DSKYProgram.PROG_RISK_ASSESSMENT;
    case 31: return DSKYProgram.PROG_DEFI_DASHBOARD;
    case 32: return DSKYProgram.PROG_YIELD_FARMING;
    case 33: return DSKYProgram.PROG_LIQUIDITY_MINING;
    case 34: return DSKYProgram.PROG_STAKING_REWARDS;
    case 99: return DSKYProgram.PROG_EMERGENCY_STOP;
    default: return DSKYProgram.PROG_NONE;
  }
}

export function isValidVerbNounCombination(verb: number, noun: number): boolean {
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
    case DSKYVerb.VERB_CRYPTO_PRICES:
    case DSKYVerb.VERB_CRYPTO_DETAIL:
      return (noun >= DSKYNoun.NOUN_CRYPTO_BITCOIN && noun <= DSKYNoun.NOUN_CRYPTO_TOP10);
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
      return true;
  }
}
