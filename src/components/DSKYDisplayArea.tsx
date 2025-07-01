// DSKY Display Area Component following SOLID principles

import React from 'react';
import { IDSKYState } from '../hooks/useDSKYState';
import { InputMode } from '../services/DSKYInputHandler';
import { DISPLAY_LABELS } from '../constants/DSKYConstants';

interface DSKYDisplayAreaProps {
  dskyState: IDSKYState;
  inputMode: InputMode;
  currentInput: string;
}

interface DisplayFieldProps {
  label: string;
  value: string;
  isInputMode: boolean;
  currentInput: string;
  className: string;
}

const DisplayField: React.FC<DisplayFieldProps> = ({ 
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
);

export const DSKYDisplayArea: React.FC<DSKYDisplayAreaProps> = ({ 
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
      
      <div className="dsky-display-label dsky-r1-label">{DISPLAY_LABELS.R1}</div>
      <div className="dsky-display-value dsky-r1-value">{dskyState.reg1}</div>
      
      <div className="dsky-display-label dsky-r2-label">{DISPLAY_LABELS.R2}</div>
      <div className="dsky-display-value dsky-r2-value">{dskyState.reg2}</div>
      
      <div className="dsky-display-label dsky-r3-label">{DISPLAY_LABELS.R3}</div>
      <div className="dsky-display-value dsky-r3-value">{dskyState.reg3}</div>
    </div>
  );
};
