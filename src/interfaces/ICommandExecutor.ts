import type { IWeb3State } from './IWeb3State';
import type { ICommandResult } from './ICommandResult';

export interface ICommandExecutor {
  execute(verb: string, noun: string, currentState: IWeb3State): Promise<ICommandResult>;
}
