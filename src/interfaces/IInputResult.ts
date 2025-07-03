/**
 * @file IInputResult.ts
 * @description Interface for the result of a DSKY input handler operation.
 */

import type { IInputState } from "./IInputState";
import type { IDSKYStateUpdate } from "./IDSKYStateUpdate";

export interface IInputResult {
  /** New input state after the key press */
  newInputState: IInputState;
  /** Optional status message for the UI */
  statusMessage?: string;
  /** Optional DSKY state updates */
  dskyUpdates?: IDSKYStateUpdate;
  /** Optional command to execute (verb/noun) */
  shouldExecuteCommand?: {
    verb: string;
    noun: string;
  };
}
