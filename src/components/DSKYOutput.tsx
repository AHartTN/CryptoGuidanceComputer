// DSKY Output Component following SOLID principles

import React from 'react';
import { IWeb3State } from '../hooks/useWeb3State';

interface DSKYOutputProps {
  web3State: IWeb3State;
  statusMessages: string[];
}

export const DSKYOutput: React.FC<DSKYOutputProps> = ({ web3State, statusMessages }) => {
  const formatAccount = (account: string | null): string => {
    if (!account) return 'NONE';
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };

  const formatBalance = (balance: string | null): string => {
    if (!balance) return 'N/A';
    return `${parseFloat(balance).toFixed(4)} ETH`;
  };

  return (
    <div className="dsky-output">
      <div className="dsky-output-title">System Output</div>
      <div className="dsky-output-content">
        <div>Wallet: {web3State.isConnected ? 'CONNECTED' : 'DISCONNECTED'}</div>
        <div>Network: {web3State.network || 'UNKNOWN'}</div>
        <div>Account: {formatAccount(web3State.account)}</div>
        <div>Balance: {formatBalance(web3State.balance)}</div>
        <div className="output-separator">───────────</div>
        {statusMessages.slice(-6).map((msg, index) => (
          <div key={index} className="output-message">{msg}</div>
        ))}
      </div>
    </div>
  );
};
