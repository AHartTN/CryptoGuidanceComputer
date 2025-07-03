/**
 * @file IInputHandler.ts
 * @description Interface for DSKY input handler (key press logic for DSKY UI).
 */

import type { IInputState } from "./IInputState";
import type { IDSKYState } from "./IDSKYState";
import type { IInputResult } from "./IInputResult";

export interface IInputHandler {
  /**
   * Handles a DSKY key press event and returns the result.
   * @param key - The key pressed
   * @param inputState - The current input state
   * @param dskyState - The current DSKY state
   * @returns The result of the key press
   */
  handleKeyPress(
    key: string,
    inputState: IInputState,
    dskyState: IDSKYState,
  ): IInputResult;
}
