export interface ICoinInfo {
  id: string;
  symbol: string;
  name: string;
  currentPrice?: number;
  marketCapRank?: number;
  priceChange24h?: number;
  isFlagged: boolean;
  nounNumber: number;
  lastUpdated?: Date;
}
