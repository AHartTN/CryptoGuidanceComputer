// Props for the DSKY Display Area component
import type { IDSKYState } from './IDSKYState';
import { InputMode } from './InputMode';

export interface DSKYDisplayAreaProps {
  dskyState: IDSKYState;
  inputMode: InputMode;
  currentInput: string;
}
