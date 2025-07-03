import type { ICryptoPriceData } from './ICryptoPriceData';

export interface ICryptoPriceService {
  getPrice(symbol: string): Promise<ICryptoPriceData>;
  getPrices(symbols: string[]): Promise<ICryptoPriceData[]>;
}
