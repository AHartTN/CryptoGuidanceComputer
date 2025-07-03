export interface IBatchPriceResult {
  coinId: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}
