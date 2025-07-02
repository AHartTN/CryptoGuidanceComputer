/**
 * @fileoverview DSKY Output Component
 * @description Displays Web3 connection status and system messages
 */

import React, { useMemo } from 'react';
import type { IWeb3State } from '../types';

/**
 * Props for the DSKY Output component
 */
interface DSKYOutputProps {
  /** Current Web3 connection state */
  web3State: IWeb3State;
  /** Array of status messages to display */
  statusMessages: string[];
}

/**
 * Main DSKY Output component with optimization
 */
export const DSKYOutput = React.memo<DSKYOutputProps>(({ web3State, statusMessages }) => {
  /**
   * Format account address for display
   */
  const formattedAccount = useMemo((): string => {
    if (!web3State.account) return 'NONE';
    return `${web3State.account.slice(0, 6)}...${web3State.account.slice(-4)}`;
  }, [web3State.account]);

  /**
   * Format balance for display
   */
  const formattedBalance = useMemo((): string => {
    if (!web3State.balance) return 'N/A';
    return `${parseFloat(web3State.balance).toFixed(4)} ETH`;
  }, [web3State.balance]);

  /**
   * Get last few status messages for display
   */
  const recentMessages = useMemo(() => {
    return statusMessages.slice(-5); // Show last 5 messages
  }, [statusMessages]);

  return (
    <div className="dsky-output">
      <div className="dsky-output-section">
        <div className="dsky-output-label">STATUS</div>
        <div className="dsky-output-value">
          {web3State.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
      </div>
      
      <div className="dsky-output-section">
        <div className="dsky-output-label">ACCOUNT</div>
        <div className="dsky-output-value">{formattedAccount}</div>
      </div>
      
      <div className="dsky-output-section">
        <div className="dsky-output-label">NETWORK</div>
        <div className="dsky-output-value">{web3State.network || 'NONE'}</div>
      </div>
      
      <div className="dsky-output-section">
        <div className="dsky-output-label">BALANCE</div>
        <div className="dsky-output-value">{formattedBalance}</div>
      </div>
      
      <div className="dsky-output-messages">
        <div className="dsky-output-label">MESSAGES</div>
        <div className="dsky-output-message-list">
          {recentMessages.map((message, index) => (
            <div key={`${index}-${message.slice(0, 10)}`} className="dsky-output-message">
              {message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

DSKYOutput.displayName = 'DSKYOutput';
