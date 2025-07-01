// DSKY Keypad Component following SOLID principles

import React from 'react';
import { BUTTON_LABELS } from '../constants/DSKYConstants';

interface DSKYKeypadProps {
  onKeyPress: (key: string) => void;
}

interface KeypadButtonProps {
  label: string;
  className: string;
  onClick: () => void;
}

const KeypadButton: React.FC<KeypadButtonProps> = ({ label, className, onClick }) => (
  <button className={`dsky-button ${className}`} onClick={onClick}>
    {label}
  </button>
);

export const DSKYKeypad: React.FC<DSKYKeypadProps> = ({ onKeyPress }) => {
  return (
    <div className="dsky-keypad">
      <KeypadButton label={BUTTON_LABELS.VERB} className="btn-verb" onClick={() => onKeyPress('VERB')} />
      <KeypadButton label={BUTTON_LABELS.NOUN} className="btn-noun" onClick={() => onKeyPress('NOUN')} />
      <KeypadButton label={BUTTON_LABELS.PROC} className="btn-proc" onClick={() => onKeyPress('PROC')} />
      <KeypadButton label={BUTTON_LABELS.RSET} className="btn-rset" onClick={() => onKeyPress('RSET')} />
      
      <KeypadButton label={BUTTON_LABELS.PLUS} className="btn-plus" onClick={() => onKeyPress('+')} />
      <KeypadButton label="7" className="btn-7" onClick={() => onKeyPress('7')} />
      <KeypadButton label="8" className="btn-8" onClick={() => onKeyPress('8')} />
      <KeypadButton label="9" className="btn-9" onClick={() => onKeyPress('9')} />
      
      <KeypadButton label={BUTTON_LABELS.MINUS} className="btn-minus" onClick={() => onKeyPress('−')} />
      <KeypadButton label="4" className="btn-4" onClick={() => onKeyPress('4')} />
      <KeypadButton label="5" className="btn-5" onClick={() => onKeyPress('5')} />
      <KeypadButton label="6" className="btn-6" onClick={() => onKeyPress('6')} />
      
      <KeypadButton label="0" className="btn-0" onClick={() => onKeyPress('0')} />
      <KeypadButton label="1" className="btn-1" onClick={() => onKeyPress('1')} />
      <KeypadButton label="2" className="btn-2" onClick={() => onKeyPress('2')} />
      <KeypadButton label="3" className="btn-3" onClick={() => onKeyPress('3')} />
      
      <div></div> {/* Blank space */}
      <KeypadButton label={BUTTON_LABELS.KEY_REL} className="btn-key-rel" onClick={() => onKeyPress('KEY REL')} />
      <KeypadButton label={BUTTON_LABELS.ENTR} className="btn-entr" onClick={() => onKeyPress('ENTR')} />
      <KeypadButton label={BUTTON_LABELS.CLR} className="btn-clr" onClick={() => onKeyPress('CLR')} />
    </div>
  );
};
