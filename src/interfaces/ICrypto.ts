/**
 * @fileoverview Cryptocurrency and Price Interface Definitions
 * @description Crypto price, token, and market data interfaces
 */

// import type { ICryptoPriceData } from "./ICryptoPriceData";

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

/**
 * Price history data point
 */
export interface IPriceHistoryPoint {
  timestamp: number;
  price: number;
  volume?: number;
}

/**
 * Crypto service configuration
 */
export interface ICryptoServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  rateLimitMs?: number;
}

/**
 * Coin list item
 */
export interface ICoinListItem {
  id: string;
  symbol: string;
  name: string;
  isFlagged?: boolean;
}

/**
 * Batch price request
 */
export interface IBatchPriceRequest {
  coinIds: string[];
  vsCurrency?: string;
  includeMarketCap?: boolean;
  include24hrChange?: boolean;
}

/**
 * Batch price response
 */
export interface IBatchPriceResponse {
  [coinId: string]: {
    usd?: number;
    usd_market_cap?: number;
    usd_24h_change?: number;
  };
}
