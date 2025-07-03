/**
 * @file IInputState.ts
 * @description Interface for DSKY input state (mode and current input buffer).
 */

import { InputMode } from "./InputMode";

export interface IInputState {
  /** Current input mode (e.g., Verb, Noun, Program) */
  mode: InputMode;
  /** Current input buffer string */
  currentInput: string;
}
