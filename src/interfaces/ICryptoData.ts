import type { ICryptoPriceData } from "./ICryptoPriceData";

export interface ICryptoPriceResponse {
  data: ICryptoPriceData[];
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface ICryptoServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  retryAttempts: number;
  timeoutMs: number;
}

export interface ICryptoService {
  fetchCryptoPrices(): Promise<ICryptoPriceResponse>;
}
