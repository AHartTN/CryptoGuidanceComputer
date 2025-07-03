/**
 * @file OptimizedKeypadProps.ts
 * @description Props interface for OptimizedKeypad component.
 */

// Props for OptimizedKeypad component
export interface OptimizedKeypadProps {
  /** Handler for key press events */
  onKeyPress: (key: string) => void;
}
