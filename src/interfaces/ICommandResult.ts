/**
 * @file ICommandResult.ts
 * @description Interface for the result of a DSKY command execution (status, updates, and success flag).
 */

import type { IDSKYStateUpdate } from "./IDSKYStateUpdate";
import type { IWeb3StateUpdate } from "./IWeb3StateUpdate";

export interface ICommandResult {
  /** Whether the command was successful */
  success: boolean;
  /** Status or error message for the command */
  statusMessage: string;
  /** Optional DSKY state updates */
  dskyUpdates?: IDSKYStateUpdate;
  /** Optional Web3 state updates */
  web3Updates?: IWeb3StateUpdate;
}
