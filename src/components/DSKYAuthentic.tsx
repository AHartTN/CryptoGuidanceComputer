// Refactored DSKY Component following SOLID/DRY principles

import React from 'react';
import '../styles/dsky-unified.css';
import { useDSKY } from '../hooks/useDSKY';
import { DSKYStatusIndicators } from './DSKYStatusIndicators';
import { DSKYDisplayArea } from './DSKYDisplayArea';
import { DSKYKeypad } from './DSKYKeypad';
import { DSKYOutput } from './DSKYOutput';

const DSKYAuthentic: React.FC = () => {
  const {
    dskyState,
    web3State,
    inputMode,
    currentInput,
    statusMessages,
    handleKeyPress
  } = useDSKY();

  return (
    <div className="dsky-container">
      <div className="dsky-main">
        {/* Header */}
        <div className="dsky-header">
          <div className="dsky-header-title">CRYPTO GUIDANCE COMPUTER</div>
          <div className="dsky-header-subtitle">DSKY INTERFACE</div>
        </div>

        <div className="dsky-body">
          {/* Main Control Section */}
          <div className="dsky-controls">
            {/* Top Row: Status Indicators and Display Area */}
            <div className="dsky-top-row">
              <DSKYStatusIndicators dskyState={dskyState} />
              <DSKYDisplayArea 
                dskyState={dskyState}
                inputMode={inputMode}
                currentInput={currentInput}
              />
            </div>

            <DSKYKeypad onKeyPress={handleKeyPress} />
            <DSKYOutput web3State={web3State} statusMessages={statusMessages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSKYAuthentic;