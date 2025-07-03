/**
 * @file CryptoModels.ts
 * @description Model for cryptocurrency price and metadata, with formatting utilities.
 */

import type { ICryptoPriceData } from "../interfaces/ICryptoPriceData";

export class CryptoPrice implements ICryptoPriceData {
  /** Unique coin ID */
  id?: string;
  /** Coin name */
  name?: string;
  /** Ticker symbol */
  symbol: string;
  /** Current price */
  price: number;
  /** 24-hour price change */
  change24h?: number;
  /** Last updated timestamp */
  lastUpdated: Date | string | number;

  /**
   * Construct a CryptoPrice from partial data.
   */
  constructor(data: Partial<ICryptoPriceData>) {
    this.id = data.id;
    this.name = data.name;
    this.symbol = data.symbol || "";
    this.price = data.price || 0;
    this.change24h = data.change24h;
    this.lastUpdated = data.lastUpdated || new Date();
  }
  /**
   * Create a CryptoPrice from a response interface.
   */
  static createFromResponse(responseData: ICryptoPriceData): CryptoPrice {
    return new CryptoPrice({
      id: responseData.id,
      name: responseData.name,
      symbol: responseData.symbol?.toUpperCase(),
      price: responseData.price,
      change24h: responseData.change24h,
      lastUpdated: new Date(),
    });
  }

  /**
   * Create a CryptoPrice from an ICryptoPriceData interface.
   */
  static fromInterface(crypto: ICryptoPriceData): CryptoPrice {
    return new CryptoPrice(crypto);
  }

  /**
   * Get fallback data for offline or error scenarios.
   */
  static getFallbackData(): CryptoPrice[] {
    return FALLBACK_CRYPTO_PRICES;
  }

  /**
   * Get formatted price for DSKY display.
   */
  getFormattedPrice(): string {
    return Math.floor(this.price).toString().padStart(5, "0");
  }

  /**
   * Get formatted 24h change for DSKY display.
   */
  getFormattedChange(): string {
    return Math.abs((this.change24h || 0) * 100)
      .toFixed(0)
      .padStart(5, "0");
  }

  /**
   * Get symbol code for DSKY display.
   */
  getSymbolCode(): string {
    return this.symbol.charCodeAt(0).toString().padStart(5, "0");
  }
}

export const FALLBACK_CRYPTO_PRICES: CryptoPrice[] = [
  new CryptoPrice({
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    price: 45000,
    change24h: 2.5,
  }),
  new CryptoPrice({
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    price: 3200,
    change24h: -1.2,
  }),
  new CryptoPrice({
    id: "link",
    name: "Chainlink",
    symbol: "LINK",
    price: 25,
    change24h: 5.8,
  }),
  new CryptoPrice({
    id: "matic",
    name: "Polygon",
    symbol: "MATIC",
    price: 0.85,
    change24h: -3.1,
  }),
  new CryptoPrice({
    id: "uni",
    name: "Uniswap",
    symbol: "UNI",
    price: 12,
    change24h: 1.9,
  }),
];
