import type { IInputState } from './IInputState';
import type { IDSKYStateUpdate } from './IDSKYStateUpdate';

export interface IInputResult {
  newInputState: IInputState;
  statusMessage?: string;
  dskyUpdates?: IDSKYStateUpdate;
  shouldExecuteCommand?: {
    verb: string;
    noun: string;
  };
}
