import type { IWeb3State } from './IWeb3State';
import type { IWeb3Actions } from './IWeb3Actions';

export interface IWeb3StateManager {
  state: IWeb3State;
  actions: IWeb3Actions;
}
