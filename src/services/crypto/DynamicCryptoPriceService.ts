/**
 * @fileoverview Dynamic Crypto Price Service
 * @description Service for fetching cryptocurrency prices using CoinGecko API
 */

import type { ICryptoPriceData } from "../../interfaces/ICryptoPriceData";

/**
 * CoinGecko API response interfaces
 */
interface ICoinGeckoCoinData {
  id: string;
  symbol: string;
  name: string;
}

/**
 * CoinGecko API configuration
 */
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const REQUEST_TIMEOUT = 10000;
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

/**
 * Dynamic crypto price service for CoinGecko API
 */
export class DynamicCryptoPriceService {
  private lastRequestTime = 0;

  /**
   * Ensure rate limiting compliance
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch price for a single coin
   */
  async getCoinPrice(coinId: string): Promise<ICryptoPriceData | null> {
    try {
      await this.enforceRateLimit();
      const url = `${COINGECKO_API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_market_cap_rank=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(
          `CoinGecko API error: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      const coinData = data[coinId];
      if (!coinData) {
        throw new Error(`No data found for coin: ${coinId}`);
      }
      const coinInfo = await this.getCoinInfo(coinId);
      return {
        id: coinId,
        symbol: coinInfo?.symbol || coinId.toUpperCase(),
        name: coinInfo?.name || coinId,
        price: coinData.usd,
        marketCapRank: coinData.usd_market_cap_rank,
        priceChange24h: coinData.usd_24h_change,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Failed to fetch price for ${coinId}:`, error);
      return null;
    }
  }

  /**
   * Fetch prices for multiple coins in batch
   */
  async getBatchPrices(coinIds: string[]): Promise<ICryptoPriceData[]> {
    const results: ICryptoPriceData[] = [];

    try {
      await this.enforceRateLimit();

      // CoinGecko allows up to 250 coin IDs in a single request
      const batchSize = 250;
      const batches: string[][] = [];

      for (let i = 0; i < coinIds.length; i += batchSize) {
        batches.push(coinIds.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        try {
          const url = `${COINGECKO_API_BASE}/simple/price?ids=${batch.join(",")}&vs_currencies=usd&include_24hr_change=true`;

          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            REQUEST_TIMEOUT,
          );

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(
              `CoinGecko API error: ${response.status} ${response.statusText}`,
            );
          }

          const data = await response.json();

          // Process each coin in the batch
          for (const coinId of batch) {
            const coinData = data[coinId];

            if (coinData) {
              const coinInfo = await this.getCoinInfo(coinId);

              results.push({
                id: coinId,
                symbol: coinInfo?.symbol || coinId.toUpperCase(),
                price: coinData.usd,
                priceChange24h: coinData.usd_24h_change || 0,
                timestamp: new Date(),
                lastUpdated: new Date(),
                success: true,
              });
            } else {
              results.push({
                id: coinId,
                symbol: coinId.toUpperCase(),
                price: 0,
                priceChange24h: 0,
                timestamp: new Date(),
                lastUpdated: new Date(),
                success: false,
                error: `No data available for ${coinId}`,
              });
            }
          }

          // Rate limiting between batches
          if (batches.length > 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, RATE_LIMIT_DELAY),
            );
          }
        } catch (error) {
          // Handle batch failure - add error results for all coins in this batch
          for (const coinId of batch) {
            results.push({
              id: coinId,
              symbol: coinId.toUpperCase(),
              price: 0,
              priceChange24h: 0,
              timestamp: new Date(),
              lastUpdated: new Date(),
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }
    } catch (error) {
      console.error("Batch price fetch failed:", error);

      // Return error results for all requested coins
      for (const coinId of coinIds) {
        results.push({
          id: coinId,
          symbol: coinId.toUpperCase(),
          price: 0,
          priceChange24h: 0,
          timestamp: new Date(),
          lastUpdated: new Date(),
          success: false,
          error: error instanceof Error ? error.message : "Batch fetch failed",
        });
      }
    }

    return results;
  }

  /**
   * Get coin information from supported coins list
   */
  private async getCoinInfo(
    coinId: string,
  ): Promise<{ symbol: string; name: string } | null> {
    try {
      await this.enforceRateLimit();

      const url = `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        symbol: data.symbol?.toUpperCase() || coinId.toUpperCase(),
        name: data.name || coinId,
      };
    } catch (error) {
      console.error(`Failed to get coin info for ${coinId}:`, error);
      return null;
    }
  }

  /**
   * Search for coins by name or symbol
   */
  async searchCoins(
    query: string,
    limit = 10,
  ): Promise<{ id: string; symbol: string; name: string }[]> {
    try {
      await this.enforceRateLimit();

      const url = `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `CoinGecko search API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const coins = data.coins || [];
      return coins.slice(0, limit).map((coin: ICoinGeckoCoinData) => ({
        id: coin.id,
        symbol: coin.symbol?.toUpperCase() || "",
        name: coin.name || "",
      }));
    } catch (error) {
      console.error("Coin search failed:", error);
      return [];
    }
  }
}
