/**
 * @fileoverview DSKY Keypad Component
 * @description Apollo DSKY-style input keypad with numeric and control buttons
 */

import React, { useCallback } from 'react';
import { BUTTON_LABELS } from '../../../constants/DSKYConstants';
import type { DSKYKeypadProps } from '../../../interfaces/DSKYKeypadProps';
import type { KeypadButtonProps } from '../../../interfaces/KeypadButtonProps';

/**
 * Individual keypad button component with memoization
 */
const KeypadButton = React.memo<KeypadButtonProps>(({ label, className, onClick, disabled = false }) => (
  <button className={`dsky-button ${className}`} onClick={onClick} disabled={disabled}>
    {label}
  </button>
));

KeypadButton.displayName = 'KeypadButton';

/**
 * Main DSKY Keypad component with optimization
 */
export const DSKYKeypad = React.memo<DSKYKeypadProps>(({ onKeyPress, disabled = false }) => {
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
    <div className={`dsky-keypad ${disabled ? 'disabled' : ''}`}>
      <KeypadButton label={BUTTON_LABELS.VERB} className="btn-verb" onClick={handleVerbPress} disabled={disabled} />
      <KeypadButton label={BUTTON_LABELS.NOUN} className="btn-noun" onClick={handleNounPress} disabled={disabled} />
      <KeypadButton label={BUTTON_LABELS.PROC} className="btn-proc" onClick={handleProcPress} disabled={disabled} />
      <KeypadButton label={BUTTON_LABELS.RSET} className="btn-rset" onClick={handleRsetPress} disabled={disabled} />
      
      <KeypadButton label={BUTTON_LABELS.PLUS} className="btn-plus" onClick={handlePlusPress} disabled={disabled} />
      <KeypadButton label="7" className="btn-7" onClick={handleNumericPress('7')} disabled={disabled} />
      <KeypadButton label="8" className="btn-8" onClick={handleNumericPress('8')} disabled={disabled} />
      <KeypadButton label="9" className="btn-9" onClick={handleNumericPress('9')} disabled={disabled} />
      
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

export default DSKYKeypad;
