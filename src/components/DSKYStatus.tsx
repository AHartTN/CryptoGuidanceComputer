import React from 'react';

interface DSKYStatusProps {
  connected: boolean;
  account: string;
  balance: string;
  inputMode: 'verb' | 'noun' | 'data' | null;
  verb: string;
  noun: string;
  cryptoCount: number;
}

const DSKYStatus: React.FC<DSKYStatusProps> = ({ 
  connected, 
  account, 
  balance, 
  inputMode, 
  verb, 
  noun, 
  cryptoCount 
}) => {
  const statusData = [
    {
      label: 'CONNECTION',
      value: connected ? 'ONLINE' : 'OFFLINE',
      unit: '',
      state: connected ? 'success' : 'error'
    },
    {
      label: 'WALLET',
      value: connected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'NOT CONNECTED',
      unit: '',
      state: connected ? 'success' : 'warning'
    },
    {
      label: 'BALANCE',
      value: balance,
      unit: 'ETH',
      state: 'success'
    },
    {
      label: 'INPUT MODE',
      value: inputMode ? inputMode.toUpperCase() : 'NONE',
      unit: '',
      state: inputMode ? 'warning' : 'success'
    },
    {
      label: 'COMMAND',
      value: `V${verb}N${noun}`,
      unit: '',
      state: 'success'
    },
    {
      label: 'CRYPTO DATA',
      value: cryptoCount.toString(),
      unit: 'PAIRS',
      state: cryptoCount > 0 ? 'success' : 'warning'
    }
  ];

  return (
    <div className="dsky-status">
      <div className="dsky-status-title">SYSTEM STATUS</div>
      <div className="dsky-status-content">
        {statusData.map((status) => (
          <div 
            key={status.label} 
            className={`dsky-status-row ${status.state}`}
            role="status"
            aria-live="polite"
          >
            <div className="dsky-status-label">{status.label}</div>
            <div className={`dsky-status-value ${status.state}`}>
              <div className="dsky-status-indicator">
                {status.value}
              </div>
            </div>
            {status.unit && (
              <div className="dsky-status-unit">{status.unit}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DSKYStatus;
