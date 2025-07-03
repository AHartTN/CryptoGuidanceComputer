export interface ICryptoPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  lastUpdated: Date;
}

export interface ICryptoPriceResponse {
  data: ICryptoPrice[];
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
