import type { IDSKYState, InputMode } from './IDSKYState';

// Props for OptimizedDisplayArea component
export interface OptimizedDisplayAreaProps {
  dskyState: IDSKYState;
  inputMode: InputMode;
  currentInput: string;
}
