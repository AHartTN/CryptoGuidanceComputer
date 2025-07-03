// Unified crypto price data interface for all price-related operations
export interface ICryptoPriceData {
  id?: string; // CoinGecko or internal ID
  symbol: string;
  name?: string;
  price: number;
  change24h?: number;
  priceChange24h?: number;
  changePercent24h?: number;
  marketCap?: number;
  volume24h?: number;
  marketCapRank?: number;
  lastUpdated: Date | string | number;
  nounNumber?: number;
  isFlagged?: boolean;
  success?: boolean; // For batch results
  error?: string; // For batch results
  timestamp?: Date | number; // For batch/legacy compatibility
}
