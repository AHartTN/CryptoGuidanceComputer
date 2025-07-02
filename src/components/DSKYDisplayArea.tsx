/**
 * @fileoverview DSKY Display Area Component
 * @description Renders the main display fields for the Apollo DSKY interface
 */

import React from 'react';
import type { IDSKYState, InputMode } from '../types';
import { DISPLAY_LABELS } from '../constants';

/**
 * Props for the DSKY Display Area component
 */
interface DSKYDisplayAreaProps {
  /** Current DSKY state containing all display values */
  dskyState: IDSKYState;
  /** Current input mode (verb, noun, prog, etc.) */
  inputMode: InputMode;
  /** Current user input being typed */
  currentInput: string;
}

/**
 * Props for individual display field components
 */
interface DisplayFieldProps {
  /** Field label to display */
  label: string;
  /** Current field value */
  value: string;
  /** Whether this field is in input mode */
  isInputMode: boolean;
  /** Current input text to show */
  currentInput: string;
  /** CSS class name for styling */
  className: string;
}

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
        isInputMode={inputMode === 'prog'}
        currentInput={currentInput}
        className="dsky-prog"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.VERB}
        value={dskyState.verb}
        isInputMode={inputMode === 'verb'}
        currentInput={currentInput}
        className="dsky-verb"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.NOUN}
        value={dskyState.noun}
        isInputMode={inputMode === 'noun'}
        currentInput={currentInput}
        className="dsky-noun"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.R1}
        value={dskyState.reg1}
        isInputMode={inputMode === 'data'}
        currentInput={currentInput}
        className="dsky-reg1"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.R2}
        value={dskyState.reg2}
        isInputMode={false}
        currentInput=""
        className="dsky-reg2"
      />
      
      <DisplayField
        label={DISPLAY_LABELS.R3}
        value={dskyState.reg3}
        isInputMode={false}
        currentInput=""
        className="dsky-reg3"
      />
    </div>
  );
});

DSKYDisplayArea.displayName = 'DSKYDisplayArea';
