/**
 * @fileoverview Main Apollo DSKY Authentic Component
 * @description Enterprise-grade React component for the Apollo DSKY cryptocurrency interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/dsky-unified.css';
import { useDSKY } from '../hooks/useDSKY';
import { DSKYStatusIndicators } from './DSKYStatusIndicators';
import { DSKYDisplayArea } from './DSKYDisplayArea';
import { DSKYKeypad } from './DSKYKeypad';
import { DSKYOutput } from './DSKYOutput';
import { DSKYHelpDialog } from './DSKYHelpDialog';

/**
 * Main Apollo DSKY interface component with optimization
 */
const DSKYAuthentic = React.memo(() => {
  const {
    dskyState,
    web3State,
    inputMode,
    currentInput,
    statusMessages,
    handleKeyPress
  } = useDSKY();

  const [showHelp, setShowHelp] = useState(false);

  // Memoized handlers for better performance
  const handleShowHelp = useCallback(() => setShowHelp(true), []);
  const handleCloseHelp = useCallback(() => setShowHelp(false), []);

  // Handle ESC key to close help dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showHelp) {
        handleCloseHelp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHelp, handleCloseHelp]);

  return (
    <div className="dsky-container">
      <div className="dsky-main">
        {/* Header Section */}
        <div className="dsky-header">
          <div className="dsky-header-content">
            <div className="dsky-header-title">CRYPTO GUIDANCE COMPUTER</div>
            <div className="dsky-header-subtitle">DSKY INTERFACE</div>
          </div>
          <button 
            className="dsky-help-button" 
            onClick={handleShowHelp}
            title="Show Help"
            aria-label="Show Help Dialog"
          >
            ?
          </button>
        </div>

        {/* Main Body */}
        <div className="dsky-body">
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

            {/* Keypad */}
            <DSKYKeypad onKeyPress={handleKeyPress} />
            
            {/* Output Section */}
            <DSKYOutput web3State={web3State} statusMessages={statusMessages} />
          </div>
        </div>
      </div>
      
      {/* Help Dialog */}
      <DSKYHelpDialog 
        isOpen={showHelp} 
        onClose={handleCloseHelp} 
      />
    </div>
  );
});

DSKYAuthentic.displayName = 'DSKYAuthentic';

export default DSKYAuthentic;