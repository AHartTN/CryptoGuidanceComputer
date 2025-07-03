/**
 * @fileoverview Cryptocurrency and Price Interface Definitions
 * @description Crypto price, token, and market data interfaces
 */

/**
 * Cryptocurrency data interface
 */
export interface ICryptocurrencyData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

/**
 * Simplified cryptocurrency price data
 */
export interface ICryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
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
