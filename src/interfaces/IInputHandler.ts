import type { IInputState } from './IInputState';
import type { IDSKYState } from './IDSKYState';
import type { IInputResult } from './IInputResult';

export interface IInputHandler {
  handleKeyPress(key: string, inputState: IInputState, dskyState: IDSKYState): IInputResult;
}
