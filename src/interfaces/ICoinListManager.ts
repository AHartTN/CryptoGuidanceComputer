import type { ICoinListState } from './ICoinListState';
import type { ICoinListActions } from './ICoinListActions';

export interface ICoinListManager {
  state: ICoinListState;
  actions: ICoinListActions;
}
