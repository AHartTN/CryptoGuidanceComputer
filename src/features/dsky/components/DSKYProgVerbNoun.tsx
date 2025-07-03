import React from 'react';
import { IDSKYDisplay } from '../../../interfaces/IDSKYCore';
import { InputMode } from '../../../interfaces/InputMode';

interface DSKYProgVerbNounProps {
  display: IDSKYDisplay;
  inputMode: InputMode;
  currentInput: string;
}

const DSKYProgVerbNoun: React.FC<DSKYProgVerbNounProps> = ({ 
  display, 
  inputMode, 
  currentInput 
}) => {
  const displayUnits = [
    { 
      label: 'PROG', 
      value: display.prog, 
      isInputMode: inputMode === InputMode.Prog,
      displayValue: inputMode === InputMode.Prog ? currentInput : display.prog 
    },
    { 
      label: 'VERB', 
      value: display.verb, 
      isInputMode: inputMode === InputMode.Verb,
      displayValue: inputMode === InputMode.Verb ? currentInput : display.verb 
    },
    { 
      label: 'NOUN', 
      value: display.noun, 
      isInputMode: inputMode === InputMode.Noun,
      displayValue: inputMode === InputMode.Noun ? currentInput : display.noun 
    }
  ];

  return (
    <div className="dsky-prog-verb-noun">
      {displayUnits.map((unit) => (
        <div key={unit.label} className="dsky-display-unit">
          <div className="dsky-display-label">{unit.label}</div>
          <div 
            className={`dsky-display-value ${unit.isInputMode ? 'input-mode' : ''} ${unit.isInputMode ? 'flashing' : ''}`}
            aria-label={`${unit.label}: ${unit.displayValue}`}
            aria-live={unit.isInputMode ? 'polite' : 'off'}
          >
            <span>{unit.displayValue}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DSKYProgVerbNoun;
