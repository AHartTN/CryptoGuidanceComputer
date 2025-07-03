/**
 * @file IStateValue.ts
 * @description Type for application state values (used in state management and persistence).
 */

// State value type for ApplicationStateService
export type IStateValue =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | unknown;
