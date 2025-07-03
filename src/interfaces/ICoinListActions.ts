import type { ICoinInfo } from './ICoinInfo';
import type { ICoinInfoUpdate } from './ICoinInfoUpdate';

export interface ICoinListActions {
  loadCoinList: () => Promise<void>;
  toggleCoinFlag: (coinId: string) => void;
  clearAllFlags: () => void;
  getCoinByNoun: (nounNumber: number) => ICoinInfo | undefined;
  getCoinById: (coinId: string) => ICoinInfo | undefined;
  getFlaggedCoins: () => ICoinInfo[];
  updateCoinPrice: (coinId: string, priceData: ICoinInfoUpdate) => void;
}
