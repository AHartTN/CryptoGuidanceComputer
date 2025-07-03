import type { ICoinInfo } from './ICoinInfo';

export interface ICoinListState {
  coinsByNoun: Map<number, ICoinInfo>;
  coinsById: Map<string, ICoinInfo>;
  flaggedCoins: Set<string>;
  nextNounNumber: number;
  isLoaded: boolean;
  lastUpdated?: Date;
}
