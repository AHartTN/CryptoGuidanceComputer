import { STATUS_MESSAGES, INPUT_CONFIG, BUTTON_LABELS } from '../../constants/DSKYConstants';
import type { IDSKYState } from '../../interfaces/IDSKYState';
import type { InputMode } from '../../interfaces/IDSKYState';
import type { IInputState } from '../../interfaces/IInputState';
import type { IInputResult } from '../../interfaces/IInputResult';

export class DSKYInputHandler {handleKeyPress(
    key: string, 
    currentInputState: IInputState, 
    currentDSKYState: IDSKYState
  ): IInputResult {
    switch (key) {
      case BUTTON_LABELS.VERB:
        return this.handleModeKey('verb');

      case BUTTON_LABELS.NOUN:
        return this.handleModeKey('noun');

      case BUTTON_LABELS.PROC:
        return this.handleModeKey('prog');

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
    const statusMessages = {
      'verb': STATUS_MESSAGES.VERB_MODE_ACTIVATED,
      'noun': STATUS_MESSAGES.NOUN_MODE_ACTIVATED,
      'prog': STATUS_MESSAGES.PROC_MODE_ACTIVATED
    };

    return {
      newInputState: { mode: newMode, currentInput: '' },
      statusMessage: statusMessages[newMode as keyof typeof statusMessages],
      dskyUpdates: { keyRel: true }
    };
  }

  private handleClear(): IInputResult {
    return {
      newInputState: { mode: null, currentInput: '' },
      statusMessage: STATUS_MESSAGES.INPUT_CLEARED,
      dskyUpdates: { keyRel: false, oprErr: false }
    };
  }

  private handleEnter(
    currentInputState: IInputState, 
    currentDSKYState: IDSKYState
  ): IInputResult {
    const { mode, currentInput } = currentInputState;

    if (!mode || !currentInput) {
      return { newInputState: { mode: null, currentInput: '' } };
    }

    const paddedInput = currentInput.padStart(INPUT_CONFIG.MAX_INPUT_LENGTH, INPUT_CONFIG.DEFAULT_PADDING);
    const dskyUpdates: Partial<IDSKYState> = {
      [mode]: paddedInput,
      keyRel: false
    };

    const result: IInputResult = {
      newInputState: { mode: null, currentInput: '' },
      statusMessage: STATUS_MESSAGES.FIELD_UPDATED(mode, paddedInput),
      dskyUpdates
    };

    
    if (mode === 'noun' && currentDSKYState.verb !== '00') {
      result.shouldExecuteCommand = { verb: currentDSKYState.verb, noun: paddedInput };
    } else if (mode === 'verb' && currentDSKYState.noun !== '00') {
      result.shouldExecuteCommand = { verb: paddedInput, noun: currentDSKYState.noun };
    }

    return result;
  }

  private handleKeyRelease(): IInputResult {
    return {
      newInputState: { mode: null, currentInput: '' },
      dskyUpdates: { keyRel: false }
    };
  }

  private handleReset(): IInputResult {
    return {
      newInputState: { mode: null, currentInput: '' },
      statusMessage: STATUS_MESSAGES.SYSTEM_RESET,
      dskyUpdates: {
        verb: '00',
        noun: '00',
        prog: '00',
        reg1: '00000',
        reg2: '00000',
        reg3: '00000',
        keyRel: false,
        oprErr: false
      }
    };
  }

  private handleSignInput(key: string, currentInputState: IInputState): IInputResult {
    const { mode, currentInput } = currentInputState;

    if (mode && currentInput.length < INPUT_CONFIG.MAX_INPUT_LENGTH) {
      return {
        newInputState: { mode, currentInput: currentInput + key }
      };
    }

    return { newInputState: currentInputState };
  }

  private handleNumericInput(key: string, currentInputState: IInputState): IInputResult {
    const { mode, currentInput } = currentInputState;

    if (/\d/.test(key) && mode && currentInput.length < INPUT_CONFIG.MAX_INPUT_LENGTH) {
      return {
        newInputState: { mode, currentInput: currentInput + key }
      };
    }

    return { newInputState: currentInputState };
  }
}