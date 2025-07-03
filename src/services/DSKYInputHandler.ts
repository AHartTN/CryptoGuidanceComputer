/**
 * DSKYInputHandler
 *
 * Handles Apollo DSKY keypad input logic, state transitions, and command preparation for the crypto guidance computer.
 * Provides a single entry point for all key events and encapsulates all input state management for the DSKY UI.
 *
 * @module DSKYInputHandler
 * @file DSKYInputHandler.ts
 */

import {
  STATUS_MESSAGES,
  INPUT_CONFIG,
  BUTTON_LABELS,
} from "../constants/DSKYConstants";
import type { IDSKYState } from "../interfaces/IDSKYState";
import { InputMode } from "../interfaces/InputMode";
import type { IInputState } from "../interfaces/IInputState";
import type { IInputResult } from "../interfaces/IInputResult";

export class DSKYInputHandler {
  /**
   * Main entry point for all DSKY key events. Dispatches to the appropriate handler based on the key pressed.
   * @param key - The key pressed (e.g., 'VERB', 'NOUN', 'CLR', numeric, etc.).
   * @param currentInputState - The current input state (mode and buffer).
   * @param currentDSKYState - The current DSKY state (for context-sensitive actions).
   * @returns {IInputResult} The result of the key press, including new input state, status message, and DSKY updates.
   */
  handleKeyPress(
    key: string,
    currentInputState: IInputState,
    currentDSKYState: IDSKYState,
  ): IInputResult {
    switch (key) {
      case BUTTON_LABELS.VERB:
        return this.handleModeKey(InputMode.Verb);

      case BUTTON_LABELS.NOUN:
        return this.handleModeKey(InputMode.Noun);

      case BUTTON_LABELS.PROC:
        return this.handleModeKey(InputMode.Prog);

      case BUTTON_LABELS.CLR:
        return this.handleClear();

      case BUTTON_LABELS.ENTR:
        return this.handleEnter(currentInputState, currentDSKYState);

      case BUTTON_LABELS.KEY_REL:
        return this.handleKeyRelease();

      case BUTTON_LABELS.RSET:
        return this.handleReset();

      case BUTTON_LABELS.PLUS:
      case BUTTON_LABELS.MINUS:
        return this.handleSignInput(key, currentInputState);

      default:
        return this.handleNumericInput(key, currentInputState);
    }
  }

  /**
   * Handles mode key presses (VERB, NOUN, PROC) and transitions the input mode.
   * @param newMode - The new input mode to activate.
   * @returns {IInputResult} The result of the mode key press.
   * @private
   */
  private handleModeKey(newMode: InputMode): IInputResult {
    const statusMessages = {
      verb: STATUS_MESSAGES.VERB_MODE_ACTIVATED,
      noun: STATUS_MESSAGES.NOUN_MODE_ACTIVATED,
      prog: STATUS_MESSAGES.PROC_MODE_ACTIVATED,
    };

    return {
      newInputState: { mode: newMode, currentInput: "" },
      statusMessage: statusMessages[newMode as keyof typeof statusMessages],
      dskyUpdates: { keyRel: true },
    };
  }

  /**
   * Handles the CLR (clear) key press, resetting the input buffer.
   * @returns {IInputResult} The result of the clear action.
   * @private
   */
  private handleClear(): IInputResult {
    return {
      newInputState: { mode: InputMode.None, currentInput: "" },
      statusMessage: STATUS_MESSAGES.INPUT_CLEARED,
      dskyUpdates: { keyRel: false, oprErr: false },
    };
  }

  /**
   * Handles the ENTR (enter) key press, finalizing input and preparing for command execution if appropriate.
   * @param currentInputState - The current input state.
   * @param currentDSKYState - The current DSKY state.
   * @returns {IInputResult} The result of the enter action, possibly including a command to execute.
   * @private
   */
  private handleEnter(
    currentInputState: IInputState,
    currentDSKYState: IDSKYState,
  ): IInputResult {
    const { mode, currentInput } = currentInputState;

    if (!mode || !currentInput) {
      return { newInputState: { mode: InputMode.None, currentInput: "" } };
    }

    const paddedInput = currentInput.padStart(
      INPUT_CONFIG.MAX_INPUT_LENGTH,
      INPUT_CONFIG.DEFAULT_PADDING,
    );
    const dskyUpdates: Partial<IDSKYState> = {
      [mode]: paddedInput,
      keyRel: false,
    };

    const result: IInputResult = {
      newInputState: { mode: InputMode.None, currentInput: "" },
      statusMessage: STATUS_MESSAGES.FIELD_UPDATED(mode, paddedInput),
      dskyUpdates,
    };

    if (mode === "noun" && currentDSKYState.verb !== "00") {
      result.shouldExecuteCommand = {
        verb: currentDSKYState.verb,
        noun: paddedInput,
      };
    } else if (mode === "verb" && currentDSKYState.noun !== "00") {
      result.shouldExecuteCommand = {
        verb: paddedInput,
        noun: currentDSKYState.noun,
      };
    }

    return result;
  }

  /**
   * Handles the KEY REL (key release) key press, clearing the input mode.
   * @returns {IInputResult} The result of the key release action.
   * @private
   */
  private handleKeyRelease(): IInputResult {
    return {
      newInputState: { mode: InputMode.None, currentInput: "" },
      dskyUpdates: { keyRel: false },
    };
  }

  /**
   * Handles the RSET (reset) key press, resetting the DSKY state and registers.
   * @returns {IInputResult} The result of the reset action.
   * @private
   */
  private handleReset(): IInputResult {
    return {
      newInputState: { mode: InputMode.None, currentInput: "" },
      statusMessage: STATUS_MESSAGES.SYSTEM_RESET,
      dskyUpdates: {
        verb: "00",
        noun: "00",
        prog: "00",
        reg1: "00000",
        reg2: "00000",
        reg3: "00000",
        keyRel: false,
        oprErr: false,
      },
    };
  }

  /**
   * Handles sign input (+ or -) key presses, appending to the input buffer if allowed.
   * @param key - The sign key pressed ('+' or '-').
   * @param currentInputState - The current input state.
   * @returns {IInputResult} The result of the sign input action.
   * @private
   */
  private handleSignInput(
    key: string,
    currentInputState: IInputState,
  ): IInputResult {
    const { mode, currentInput } = currentInputState;

    if (mode && currentInput.length < INPUT_CONFIG.MAX_INPUT_LENGTH) {
      return {
        newInputState: { mode, currentInput: currentInput + key },
      };
    }

    return { newInputState: currentInputState };
  }

  /**
   * Handles numeric key presses, appending to the input buffer if allowed.
   * @param key - The numeric key pressed ('0'-'9').
   * @param currentInputState - The current input state.
   * @returns {IInputResult} The result of the numeric input action.
   * @private
   */
  private handleNumericInput(
    key: string,
    currentInputState: IInputState,
  ): IInputResult {
    const { mode, currentInput } = currentInputState;

    if (
      /\d/.test(key) &&
      mode &&
      currentInput.length < INPUT_CONFIG.MAX_INPUT_LENGTH
    ) {
      return {
        newInputState: { mode, currentInput: currentInput + key },
      };
    }

    return { newInputState: currentInputState };
  }
}
