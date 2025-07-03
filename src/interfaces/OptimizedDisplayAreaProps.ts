import type { IDSKYState } from './IDSKYState';
import { InputMode } from './InputMode';

// Props for OptimizedDisplayArea component
export interface OptimizedDisplayAreaProps {
  dskyState: IDSKYState;
  inputMode: InputMode;
  currentInput: string;
}
