/**
 * @fileoverview DSKY Keypad Component
 * @description Apollo DSKY-style input keypad with numeric and control buttons
 */

import React, { useCallback } from 'react';
import { BUTTON_LABELS } from '../constants';

/**
 * Props for the DSKY Keypad component
 */
interface DSKYKeypadProps {
  /** Handler for key press events */
  onKeyPress: (key: string) => void;
}

/**
 * Props for individual keypad button components
 */
interface KeypadButtonProps {
  /** Button label text */
  label: string;
  /** CSS class name for styling */
  className: string;
  /** Click handler function */
  onClick: () => void;
}

/**
 * Individual keypad button component with memoization
 */
const KeypadButton = React.memo<KeypadButtonProps>(({ label, className, onClick }) => (
  <button className={`dsky-button ${className}`} onClick={onClick}>
    {label}
  </button>
));

KeypadButton.displayName = 'KeypadButton';

/**
 * Main DSKY Keypad component with optimization
 */
export const DSKYKeypad = React.memo<DSKYKeypadProps>(({ onKeyPress }) => {
  // Memoized handlers for better performance
  const handleVerbPress = useCallback(() => onKeyPress('VERB'), [onKeyPress]);
  const handleNounPress = useCallback(() => onKeyPress('NOUN'), [onKeyPress]);
  const handleProcPress = useCallback(() => onKeyPress('PROC'), [onKeyPress]);
  const handleRsetPress = useCallback(() => onKeyPress('RSET'), [onKeyPress]);
  const handlePlusPress = useCallback(() => onKeyPress('+'), [onKeyPress]);
  const handleMinusPress = useCallback(() => onKeyPress('−'), [onKeyPress]);
  const handleKeyRelPress = useCallback(() => onKeyPress('KEY REL'), [onKeyPress]);
  const handleEntrPress = useCallback(() => onKeyPress('ENTR'), [onKeyPress]);
  const handleClrPress = useCallback(() => onKeyPress('CLR'), [onKeyPress]);
  
  // Numeric key handlers
  const handleNumericPress = useCallback((num: string) => () => onKeyPress(num), [onKeyPress]);

  return (
    <div className="dsky-keypad">
      <KeypadButton label={BUTTON_LABELS.VERB} className="btn-verb" onClick={handleVerbPress} />
      <KeypadButton label={BUTTON_LABELS.NOUN} className="btn-noun" onClick={handleNounPress} />
      <KeypadButton label={BUTTON_LABELS.PROC} className="btn-proc" onClick={handleProcPress} />
      <KeypadButton label={BUTTON_LABELS.RSET} className="btn-rset" onClick={handleRsetPress} />
      
      <KeypadButton label={BUTTON_LABELS.PLUS} className="btn-plus" onClick={handlePlusPress} />
      <KeypadButton label="7" className="btn-7" onClick={handleNumericPress('7')} />
      <KeypadButton label="8" className="btn-8" onClick={handleNumericPress('8')} />
      <KeypadButton label="9" className="btn-9" onClick={handleNumericPress('9')} />
      
      <KeypadButton label={BUTTON_LABELS.MINUS} className="btn-minus" onClick={handleMinusPress} />
      <KeypadButton label="4" className="btn-4" onClick={handleNumericPress('4')} />
      <KeypadButton label="5" className="btn-5" onClick={handleNumericPress('5')} />
      <KeypadButton label="6" className="btn-6" onClick={handleNumericPress('6')} />
      
      <KeypadButton label="0" className="btn-0" onClick={handleNumericPress('0')} />
      <KeypadButton label="1" className="btn-1" onClick={handleNumericPress('1')} />
      <KeypadButton label="2" className="btn-2" onClick={handleNumericPress('2')} />
      <KeypadButton label="3" className="btn-3" onClick={handleNumericPress('3')} />
      
      <div></div> {/* Spacer */}
      <KeypadButton label={BUTTON_LABELS.KEY_REL} className="btn-key-rel" onClick={handleKeyRelPress} />
      <KeypadButton label={BUTTON_LABELS.ENTR} className="btn-entr" onClick={handleEntrPress} />
      <KeypadButton label={BUTTON_LABELS.CLR} className="btn-clr" onClick={handleClrPress} />
    </div>
  );
});

DSKYKeypad.displayName = 'DSKYKeypad';
