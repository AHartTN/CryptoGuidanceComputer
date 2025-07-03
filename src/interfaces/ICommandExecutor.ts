/**
 * @file ICommandExecutor.ts
 * @description Interface for executing DSKY verb/noun commands (command pattern for blockchain/crypto operations).
 */

import type { IWeb3State } from "./IWeb3State";
import type { ICommandResult } from "./ICommandResult";

export interface ICommandExecutor {
  /**
   * Executes a verb/noun command and returns the result asynchronously.
   * @param verb - The verb code as a string
   * @param noun - The noun code as a string
   * @param currentState - The current Web3 state
   * @returns Promise resolving to a command result
   */
  execute(
    verb: string,
    noun: string,
    currentState: IWeb3State,
  ): Promise<ICommandResult>;
}
