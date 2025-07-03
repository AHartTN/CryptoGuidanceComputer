// Props for individual keypad button components
export interface KeypadButtonProps {
  label: string;
  className: string;
  onClick: () => void;
  disabled?: boolean;
}
