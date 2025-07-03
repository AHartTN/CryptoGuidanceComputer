/**
 * @file KeypadButtonProps.ts
 * @description Props interface for individual keypad button components.
 */

// Props for individual keypad button components
export interface KeypadButtonProps {
  /** Button label */
  label: string;
  /** CSS class name(s) for the button */
  className: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled (optional) */
  disabled?: boolean;
}
