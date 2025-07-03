import type { ICryptoPriceData } from "../../interfaces/ICryptoPriceData";
import type { ICryptoPriceConfig } from "../../interfaces/ICryptoPriceConfig";

export class CryptoPriceService {
  private cache: Map<string, { data: ICryptoPriceData; timestamp: number }> =
    new Map();
  private readonly apiUrl: string;
  private readonly cacheDuration: number;
  private readonly retryAttempts: number;

  constructor(private config: ICryptoPriceConfig) {
    this.apiUrl = config.apiUrl || "https://api.coingecko.com/api/v3";
    this.cacheDuration = config.cacheTimeout || 30000;
    this.retryAttempts = 3; // fallback if not in config
  }

  async getCryptoPrice(symbol: string): Promise<ICryptoPriceData> {
    const cacheKey = symbol.toLowerCase();
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const data = await this.fetchPriceWithRetry(symbol);

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  async getMultiplePrices(symbols: string[]): Promise<ICryptoPriceData[]> {
    const promises = symbols.map((symbol) => this.getCryptoPrice(symbol));
    return Promise.all(promises);
  }

  private async fetchPriceWithRetry(symbol: string): Promise<ICryptoPriceData> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        return await this.fetchPrice(symbol);
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retryAttempts - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw (
      lastError ||
      new Error(
        `Failed to fetch price for ${symbol} after ${this.retryAttempts} attempts`,
      )
    );
  }

  private async fetchPrice(symbol: string): Promise<ICryptoPriceData> {
    const coinId = this.getCoinGeckoId(symbol);
    const url = `${this.apiUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const coinData = data[coinId];

    if (!coinData) {
      throw new Error(`No data found for ${symbol}`);
    }

    return {
      symbol: symbol.toUpperCase(),
      name: this.getCoinName(symbol),
      price: coinData.usd || 0,
      change24h: coinData.usd_24h_change || 0,
      marketCap: coinData.usd_market_cap || 0,
      lastUpdated: new Date(),
    };
  }

  private getCoinGeckoId(symbol: string): string {
    const mapping: { [key: string]: string } = {
      BTC: "bitcoin",
      ETH: "ethereum",
      ADA: "cardano",
      DOT: "polkadot",
      MATIC: "matic-network",
      LINK: "chainlink",
      UNI: "uniswap",
      SOL: "solana",
      DOGE: "dogecoin",
      LTC: "litecoin",
    };

    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  private getCoinName(symbol: string): string {
    const names: { [key: string]: string } = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      ADA: "Cardano",
      DOT: "Polkadot",
      MATIC: "Polygon",
      LINK: "Chainlink",
      UNI: "Uniswap",
      SOL: "Solana",
      DOGE: "Dogecoin",
      LTC: "Litecoin",
    };

    return names[symbol.toUpperCase()] || symbol.toUpperCase();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  clearCache(): void {
    this.cache.clear();
  }

  static create(config?: Partial<ICryptoPriceConfig>): CryptoPriceService {
    const defaultConfig: ICryptoPriceConfig = {
      apiUrl: "https://api.coingecko.com/api/v3",
      timeout: 30000,
      cacheTimeout: 30000,
    };
    return new CryptoPriceService({ ...defaultConfig, ...config });
  }
}
