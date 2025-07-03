import type { IDSKYStateUpdate } from './IDSKYStateUpdate';
import type { IWeb3StateUpdate } from './IWeb3StateUpdate';

export interface ICommandResult {
  success: boolean;
  statusMessage: string;
  dskyUpdates?: IDSKYStateUpdate;
  web3Updates?: IWeb3StateUpdate;
}
