// Only class definitions should remain in this file. All interfaces are in ../interfaces/ICryptoData.ts
import type { ICryptoPrice } from '../interfaces/ICryptoData';

export class CryptoPrice implements ICryptoPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: Date;

  constructor(data: Partial<ICryptoPrice>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.symbol = data.symbol || '';
    this.price = data.price || 0;
    this.change24h = data.change24h || 0;
    this.lastUpdated = data.lastUpdated || new Date();
  }
  static createFromResponse(responseData: ICryptoPrice): CryptoPrice {
    return new CryptoPrice({
      id: responseData.id,
      name: responseData.name,
      symbol: responseData.symbol?.toUpperCase(),
      price: responseData.price,
      change24h: responseData.change24h,
      lastUpdated: new Date()
    });
  }

  static fromInterface(crypto: ICryptoPrice): CryptoPrice {
    return new CryptoPrice(crypto);
  }

  static getFallbackData(): CryptoPrice[] {
    return FALLBACK_CRYPTO_PRICES;
  }

  getFormattedPrice(): string {
    return Math.floor(this.price).toString().padStart(5, '0');
  }

  getFormattedChange(): string {
    return Math.abs(this.change24h * 100).toFixed(0).padStart(5, '0');
  }

  getSymbolCode(): string {
    return this.symbol.charCodeAt(0).toString().padStart(5, '0');
  }
}

export const FALLBACK_CRYPTO_PRICES: CryptoPrice[] = [
  new CryptoPrice({ id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 45000, change24h: 2.5 }),
  new CryptoPrice({ id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3200, change24h: -1.2 }),
  new CryptoPrice({ id: 'link', name: 'Chainlink', symbol: 'LINK', price: 25, change24h: 5.8 }),
  new CryptoPrice({ id: 'matic', name: 'Polygon', symbol: 'MATIC', price: 0.85, change24h: -3.1 }),
  new CryptoPrice({ id: 'uni', name: 'Uniswap', symbol: 'UNI', price: 12, change24h: 1.9 })
];
