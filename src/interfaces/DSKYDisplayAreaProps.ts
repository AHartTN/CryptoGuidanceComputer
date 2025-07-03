// Props for the DSKY Display Area component
import type { IDSKYState, InputMode } from './IDSKYState';
export interface DSKYDisplayAreaProps {
  dskyState: IDSKYState;
  inputMode: InputMode;
  currentInput: string;
}
