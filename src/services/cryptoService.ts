import { Alchemy, Network } from "alchemy-sdk";
import {
  ICryptoPriceResponse,
  ICryptoServiceConfig,
} from "../interfaces/ICryptoData";
import { FALLBACK_CRYPTO_PRICES } from "../models/CryptoModels";

export class CryptoService {
  private alchemy: Alchemy | null = null;
  private config: ICryptoServiceConfig;

  constructor(config: ICryptoServiceConfig) {
    this.config = {
      retryAttempts: 3,
      timeoutMs: 10000,
      ...config,
    };

    if (config.apiKey) {
      this.alchemy = new Alchemy({
        apiKey: config.apiKey,
        network: Network.ETH_MAINNET,
      });
    }
  }
  async fetchCryptoPrices(): Promise<ICryptoPriceResponse> {
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        switch (!!this.alchemy) {
          case true: {
            return await this.fetchFromAlchemy();
          }
          default: {
            return this.getFallbackPrices();
          }
        }
      } catch (error) {
        console.warn(`Crypto fetch attempt ${attempt + 1} failed:`, error);

        switch (attempt < this.config.retryAttempts - 1) {
          case true: {
            await this.delay(1000 * (attempt + 1));
            break;
          }
        }
      }
    }

    console.error("All crypto fetch attempts failed, using fallback data");
    return this.getFallbackPrices();
  }

  private async fetchFromAlchemy(): Promise<ICryptoPriceResponse> {
    return this.getFallbackPrices();
  }

  private getFallbackPrices(): ICryptoPriceResponse {
    return {
      data: FALLBACK_CRYPTO_PRICES,
      success: true,
      timestamp: new Date(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  static create(): CryptoService {
    const config: ICryptoServiceConfig = {
      apiKey:
        typeof import.meta.env !== "undefined" &&
        import.meta.env.VITE_ALCHEMY_API_KEY
          ? import.meta.env.VITE_ALCHEMY_API_KEY
          : undefined,
      retryAttempts: 3,
      timeoutMs: 10000,
    };

    return new CryptoService(config);
  }
}
