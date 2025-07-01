import React from 'react';
import { IDSKYDisplay } from '../interfaces/IDSKYCore';
import DSKYProgVerbNoun from './DSKYProgVerbNoun';
import DSKYRegisters from './DSKYRegisters';

interface DSKYDisplayAreaProps {
  display: IDSKYDisplay;
  inputMode: 'verb' | 'noun' | 'data' | null;
  currentInput: string;
}

const DSKYDisplayArea: React.FC<DSKYDisplayAreaProps> = ({ 
  display, 
  inputMode, 
  currentInput 
}) => {
  return (
    <div className="dsky-display-area">
      <DSKYProgVerbNoun 
        display={display}
        inputMode={inputMode}
        currentInput={currentInput}
      />
      <DSKYRegisters 
        reg1={display.reg1}
                reg2={display.reg2}
        reg3={display.reg3}
      />
    </div>
  );
};

export default DSKYDisplayArea;
