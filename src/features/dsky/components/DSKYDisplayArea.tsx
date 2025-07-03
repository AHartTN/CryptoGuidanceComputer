/**
 * @fileoverview DSKY Display Area Component
 * @description Renders the main display fields for the Apollo DSKY interface
 */

import React from 'react';
import { DISPLAY_LABELS } from '../../../constants/DSKYConstants';
import type { DSKYDisplayAreaProps } from '../../../interfaces/DSKYDisplayAreaProps';
import type { DisplayFieldProps } from '../../../interfaces/DisplayFieldProps';
import { InputMode } from '../../../interfaces/InputMode';

/**
 * Individual display field component with memoization for performance
 */
const DisplayField = React.memo<DisplayFieldProps>(({ 
  label, 
  value, 
  isInputMode, 
  currentInput, 
  className 
}) => (
  <>
    <div className={`dsky-display-label ${className}-label`}>{label}</div>
    <div className={`dsky-display-value ${className}-value ${isInputMode ? 'input-mode' : ''}`}>
      {isInputMode ? currentInput.padEnd(2, '_') : value}
    </div>
  </>
));

DisplayField.displayName = 'DisplayField';

/**
 * Main DSKY Display Area component with optimization
 */
export const DSKYDisplayArea = React.memo<DSKYDisplayAreaProps>(({ 
  dskyState, 
  inputMode, 
  currentInput 
}) => {
  return (
    <div className="dsky-display-area">
      <DisplayField
        label={DISPLAY_LABELS.PROG}
        value={dskyState.prog}
        isInputMode={inputMode === InputMode.Prog}
        currentInput={currentInput}
        className="dsky-prog"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.VERB}
        value={dskyState.verb}
        isInputMode={inputMode === InputMode.Verb}
        currentInput={currentInput}
        className="dsky-verb"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.NOUN}
        value={dskyState.noun}
        isInputMode={inputMode === InputMode.Noun}
        currentInput={currentInput}
        className="dsky-noun"
      />
        <DisplayField
        label={DISPLAY_LABELS.R1}
        value={dskyState.reg1}
        isInputMode={inputMode === InputMode.Data}
        currentInput={currentInput}
        className="dsky-r1"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.R2}
        value={dskyState.reg2}
        isInputMode={false}
        currentInput=""
        className="dsky-r2"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.R3}
        value={dskyState.reg3}
        isInputMode={false}
        currentInput=""
        className="dsky-r3"
      />
    </div>
  );
});

DSKYDisplayArea.displayName = 'DSKYDisplayArea';

export default DSKYDisplayArea;
