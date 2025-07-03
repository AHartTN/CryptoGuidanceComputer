/**
 * @file OptimizedDisplayAreaProps.ts
 * @description Props interface for OptimizedDisplayArea component.
 */

import type { IDSKYState } from "./IDSKYState";
import { InputMode } from "./InputMode";

// Props for OptimizedDisplayArea component
export interface OptimizedDisplayAreaProps {
  /** Current DSKY state */
  dskyState: IDSKYState;
  /** Current input mode */
  inputMode: InputMode;
  /** Current input buffer */
  currentInput: string;
}
