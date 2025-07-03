/**
 * @fileoverview DSKY Output Component
 * @description Displays Web3 connection status, real-time data, and system messages
 */

import React, { useMemo } from 'react';
import type { IPriceAlert } from '../../../interfaces/IPriceAlert';
import type { DSKYOutputProps } from '../../../interfaces/DSKYOutputProps';

/**
 * Main DSKY Output component with optimization
 */
export const DSKYOutput = React.memo<DSKYOutputProps>(({ 
  web3State, 
  statusMessages, 
  realTimeData
}) => {
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

  /**
   * Format real-time block data
   */
  const blockDisplay = useMemo(() => {
    if (!realTimeData.latestBlock) return 'NO DATA';
    return `#${realTimeData.latestBlock.number} (${new Date(realTimeData.latestBlock.timestamp).toLocaleTimeString()})`;
  }, [realTimeData.latestBlock]);

  /**
   * Format gas prices for display
   */
  const gasDisplay = useMemo(() => {
    if (!realTimeData.latestGasPrices) return 'NO DATA';
    return `${realTimeData.latestGasPrices.standard} GWEI`;
  }, [realTimeData.latestGasPrices]);

  /**
   * Get recent price updates
   */
  const priceUpdates = useMemo(() => {
    const prices = Array.from(realTimeData.prices.entries()).slice(0, 3);
    return prices.map(([symbol, data]) => ({
      symbol,
      price: data.price,
      change: data.changePercent24h
    }));
  }, [realTimeData.prices]);

  // Alerts
  const alerts = realTimeData.priceAlerts || [];

  const showRealTimeData = realTimeData.isConnected;

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

      {/* Real-time data section */}
      {showRealTimeData && (
        <>
          <div className="dsky-output-section">
            <div className="dsky-output-label">BLOCK</div>
            <div className="dsky-output-value">{blockDisplay}</div>
          </div>
          
          <div className="dsky-output-section">
            <div className="dsky-output-label">GAS</div>
            <div className="dsky-output-value">{gasDisplay}</div>
          </div>
          
          <div className="dsky-output-section">
            <div className="dsky-output-label">PRICES</div>
            <div className="dsky-output-price-list">
              {priceUpdates.map(({ symbol, price, change }) => (
                <div key={symbol} className="dsky-price-item">
                  <span className="price-symbol">{symbol}</span>
                  <span className="price-value">${price?.toFixed(2) || 'N/A'}</span>
                  <span className={`price-change ${(change || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {change ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="dsky-output-section">
              <div className="dsky-output-label">ALERTS</div>
              <div className="dsky-output-alert-list">
                {alerts.slice(-2).map((alert: IPriceAlert, index: number) => (
                  <div key={`alert-${index}`} className="dsky-alert-item">
                    {alert.symbol}: {alert.condition} ${alert.threshold}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
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
