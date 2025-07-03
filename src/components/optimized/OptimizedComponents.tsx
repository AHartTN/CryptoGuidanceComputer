/**
 * @fileoverview React Performance Optimization Components
 * @description Memoized components and performance optimizations
 */

import React, { memo, useMemo, useCallback } from 'react';
import type { OptimizedStatusIndicatorsProps } from '../../interfaces/OptimizedStatusIndicatorsProps';
import type { OptimizedDisplayAreaProps } from '../../interfaces/OptimizedDisplayAreaProps';
import type { OptimizedKeypadProps } from '../../interfaces/OptimizedKeypadProps';
import type { OptimizedOutputProps } from '../../interfaces/OptimizedOutputProps';
import { InputMode } from '../../interfaces/InputMode';

// Status Indicators Performance Optimized
export const OptimizedStatusIndicators = memo<OptimizedStatusIndicatorsProps>(({ dskyState }) => {
  const statusLights = useMemo(() => {
    return [
      { key: 'compActy', label: 'COMP ACTY', active: dskyState.compActy },
      { key: 'uplinkActy', label: 'UPLINK ACTY', active: dskyState.uplinkActy },
      { key: 'noAtt', label: 'NO ATT', active: dskyState.noAtt },
      { key: 'stby', label: 'STBY', active: dskyState.stby },
      { key: 'keyRel', label: 'KEY REL', active: dskyState.keyRel },
      { key: 'oprErr', label: 'OPR ERR', active: dskyState.oprErr },
      { key: 'temp', label: 'TEMP', active: dskyState.temp },
      { key: 'gimbalLock', label: 'GIMBAL LOCK', active: dskyState.gimbalLock },
      { key: 'restart', label: 'RESTART', active: dskyState.restart },
      { key: 'tracker', label: 'TRACKER', active: dskyState.tracker },
      { key: 'alt', label: 'ALT', active: dskyState.alt },
      { key: 'vel', label: 'VEL', active: dskyState.vel },
      { key: 'progStatus', label: 'PROG', active: dskyState.progStatus },
      { key: 'prio', label: 'PRIO DISP', active: dskyState.prio }
    ];
  }, [
    dskyState.compActy,
    dskyState.uplinkActy,
    dskyState.noAtt,
    dskyState.stby,
    dskyState.keyRel,
    dskyState.oprErr,
    dskyState.temp,
    dskyState.gimbalLock,
    dskyState.restart,
    dskyState.tracker,
    dskyState.alt,
    dskyState.vel,
    dskyState.progStatus,
    dskyState.prio
  ]);

  return (
    <div className="dsky-status-indicators">
      <div className="dsky-status-grid">
        {statusLights.map(light => (
          <div
            key={light.key}
            className={`dsky-status-light status-${light.key.toLowerCase().replace(/([A-Z])/g, '-$1')} ${
              light.active ? 'active' : ''
            }`}
          >
            {light.label}
          </div>
        ))}
      </div>
    </div>
  );
});

OptimizedStatusIndicators.displayName = 'OptimizedStatusIndicators';

// Display Area Performance Optimized
const DisplayField = memo<{
  label: string;
  value: string;
  isInputMode: boolean;
  currentInput: string;
  className: string;
}>(({ label, value, isInputMode, currentInput, className }) => (
  <>
    <div className={`dsky-display-label ${className}-label`}>{label}</div>
    <div className={`dsky-display-value ${className}-value ${isInputMode ? 'input-mode' : ''}`}>
      {isInputMode ? currentInput.padEnd(2, '_') : value}
    </div>
  </>
));

DisplayField.displayName = 'DisplayField';

export const OptimizedDisplayArea = memo<OptimizedDisplayAreaProps>(({ 
  dskyState, 
  inputMode, 
  currentInput 
}) => {
  const displayFields = useMemo(() => ({
    prog: {
      label: 'PROG',
      value: dskyState.prog,
      isInputMode: inputMode === InputMode.Prog,
      className: 'dsky-prog'
    },
    verb: {
      label: 'VERB',
      value: dskyState.verb,
      isInputMode: inputMode === InputMode.Verb,
      className: 'dsky-verb'
    },
    noun: {
      label: 'NOUN',
      value: dskyState.noun,
      isInputMode: inputMode === InputMode.Noun,
      className: 'dsky-noun'
    }
  }), [dskyState.prog, dskyState.verb, dskyState.noun, inputMode]);

  const registers = useMemo(() => ({
    reg1: dskyState.reg1,
    reg2: dskyState.reg2,
    reg3: dskyState.reg3
  }), [dskyState.reg1, dskyState.reg2, dskyState.reg3]);

  return (
    <div className="dsky-display-area">
      {Object.entries(displayFields).map(([key, field]) => (
        <DisplayField
          key={key}
          label={field.label}
          value={field.value}
          isInputMode={field.isInputMode}
          currentInput={currentInput}
          className={field.className}
        />
      ))}
      
      <div className="dsky-display-label dsky-r1-label">R1</div>
      <div className="dsky-display-value dsky-r1-value">{registers.reg1}</div>
      
      <div className="dsky-display-label dsky-r2-label">R2</div>
      <div className="dsky-display-value dsky-r2-value">{registers.reg2}</div>
      
      <div className="dsky-display-label dsky-r3-label">R3</div>
      <div className="dsky-display-value dsky-r3-value">{registers.reg3}</div>
    </div>
  );
});

OptimizedDisplayArea.displayName = 'OptimizedDisplayArea';

// Keypad Performance Optimized
export const OptimizedKeypad = memo<OptimizedKeypadProps>(({ onKeyPress }) => {
  const handleKeyPress = useCallback((key: string) => {
    onKeyPress(key);
  }, [onKeyPress]);

  const keypadButtons = useMemo(() => [
    // Mode buttons
    { key: 'VERB', className: 'btn-mode btn-verb', label: 'VERB' },
    { key: 'NOUN', className: 'btn-mode btn-noun', label: 'NOUN' },
    { key: 'PROG', className: 'btn-mode btn-prog', label: 'PROG' },
    
    // Numeric buttons - Row 1
    { key: '1', className: 'btn-1', label: '1' },
    { key: '2', className: 'btn-2', label: '2' },
    { key: '3', className: 'btn-3', label: '3' },
    
    // Numeric buttons - Row 2
    { key: '4', className: 'btn-4', label: '4' },
    { key: '5', className: 'btn-5', label: '5' },
    { key: '6', className: 'btn-6', label: '6' },
    
    // Numeric buttons - Row 3
    { key: '7', className: 'btn-7', label: '7' },
    { key: '8', className: 'btn-8', label: '8' },
    { key: '9', className: 'btn-9', label: '9' },
    
    // Bottom row
    { key: 'CLR', className: 'btn-clr', label: 'CLR' },
    { key: '0', className: 'btn-0', label: '0' },
    { key: 'ENTR', className: 'btn-entr', label: 'ENTR' },
    
    // Sign buttons
    { key: '+', className: 'btn-plus', label: '+' },
    { key: '-', className: 'btn-minus', label: '-' },
    
    // Control buttons
    { key: 'KEY REL', className: 'btn-key-rel', label: 'KEY REL' },
    { key: 'RSET', className: 'btn-rset', label: 'RSET' }
  ], []);

  return (
    <div className="dsky-keypad">
      {keypadButtons.map(button => (
        <button
          key={button.key}
          className={`dsky-btn ${button.className}`}
          onClick={() => handleKeyPress(button.key)}
          type="button"
        >
          {button.label}
        </button>
      ))}
    </div>
  );
});

OptimizedKeypad.displayName = 'OptimizedKeypad';

// Output Performance Optimized
export const OptimizedOutput = memo<OptimizedOutputProps>(({ web3State, statusMessages }) => {
  const formatAccount = useCallback((account: string | null): string => {
    if (!account) return 'NONE';
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }, []);

  const formatBalance = useCallback((balance: string | null): string => {
    if (!balance) return 'N/A';
    return `${parseFloat(balance).toFixed(4)} ETH`;
  }, []);

  const connectionInfo = useMemo(() => ({
    status: web3State.isConnected ? 'CONNECTED' : 'DISCONNECTED',
    network: web3State.network || 'UNKNOWN',
    account: formatAccount(web3State.account),
    balance: formatBalance(web3State.balance)
  }), [
    web3State.isConnected, 
    web3State.network, 
    web3State.account, 
    web3State.balance,
    formatAccount,
    formatBalance
  ]);

  const recentMessages = useMemo(() => 
    statusMessages.slice(-6)
  , [statusMessages]);

  return (
    <div className="dsky-output">
      <div className="dsky-output-title">System Output</div>
      <div className="dsky-output-content">
        <div>Wallet: {connectionInfo.status}</div>
        <div>Network: {connectionInfo.network}</div>
        <div>Account: {connectionInfo.account}</div>
        <div>Balance: {connectionInfo.balance}</div>
        <div className="output-separator">───────────</div>
        {recentMessages.map((msg: string, index: number) => (
          <div key={`${index}-${msg.slice(0, 10)}`} className="output-message">
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
});

OptimizedOutput.displayName = 'OptimizedOutput';
