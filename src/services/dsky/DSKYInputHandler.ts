import {
  STATUS_MESSAGES,
  INPUT_CONFIG,
  BUTTON_LABELS,
} from "../../constants/DSKYConstants";
import type { IDSKYState } from "../../interfaces/IDSKYState";
import { InputMode } from "../../interfaces/InputMode";
import type { IInputState } from "../../interfaces/IInputState";
import type { IInputResult } from "../../interfaces/IInputResult";

export class DSKYInputHandler {
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

  private handleModeKey(newMode: InputMode): IInputResult {
    const statusMessages: Record<InputMode, string> = {
      [InputMode.Verb]: STATUS_MESSAGES.VERB_MODE_ACTIVATED,
      [InputMode.Noun]: STATUS_MESSAGES.NOUN_MODE_ACTIVATED,
      [InputMode.Prog]: STATUS_MESSAGES.PROC_MODE_ACTIVATED,
      [InputMode.Data]: "",
      [InputMode.None]: "",
    };

    return {
      newInputState: { mode: newMode, currentInput: "" },
      statusMessage: statusMessages[newMode],
      dskyUpdates: { keyRel: true },
    };
  }

  private handleClear(): IInputResult {
    return {
      newInputState: { mode: InputMode.None, currentInput: "" },
      statusMessage: STATUS_MESSAGES.INPUT_CLEARED,
      dskyUpdates: { keyRel: false, oprErr: false },
    };
  }

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

    if (mode === InputMode.Noun && currentDSKYState.verb !== "00") {
      result.shouldExecuteCommand = {
        verb: currentDSKYState.verb,
        noun: paddedInput,
      };
    } else if (mode === InputMode.Verb && currentDSKYState.noun !== "00") {
      result.shouldExecuteCommand = {
        verb: paddedInput,
        noun: currentDSKYState.noun,
      };
    }

    return result;
  }

  private handleKeyRelease(): IInputResult {
    return {
      newInputState: { mode: InputMode.None, currentInput: "" },
      dskyUpdates: { keyRel: false },
    };
  }

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
