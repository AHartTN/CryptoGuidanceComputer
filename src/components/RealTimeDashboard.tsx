/**
 * @file RealTimeDashboard.tsx
 * @description Real-time dashboard for Apollo DSKY Crypto Guidance Computer.
 * Displays live price feeds, blockchain status, alerts, and DSKY updates.
 *
 * @module RealTimeDashboard
 */

import React, { useState, useEffect, useCallback } from "react";
import { useDSKYRealTime } from "../hooks/useRealTimeData";
import { SecurityService } from "../services/security/SecurityService";
import { IDashboardConfig } from "../interfaces/IDashboardConfig";
import { IAlertFormData } from "../interfaces/IAlertFormData";
import type { IPriceAlert } from "../interfaces/IPriceAlert";
import "../styles/realtime-dashboard.css";

/**
 * RealTimeDashboard component.
 * Renders the real-time dashboard with price feeds, blockchain status, alerts, and DSKY updates.
 *
 * @param {Object} props - Component props.
 * @param {string[]} [props.watchedAddresses] - Addresses to watch for blockchain events.
 * @param {(field: string, value: string) => void} [props.onDSKYUpdate] - Callback for DSKY field updates.
 * @returns {JSX.Element} The rendered real-time dashboard.
 */
export const RealTimeDashboard: React.FC<{
  watchedAddresses?: string[];
  onDSKYUpdate?: (field: string, value: string) => void;
}> = ({ watchedAddresses = [], onDSKYUpdate }) => {
  const [config, setConfig] = useState<IDashboardConfig>({
    showPrices: true,
    showBlockchain: true,
    showAlerts: true,
    showAnalytics: false,
    updateInterval: 1000,
    compactMode: false,
  });

  const [alertForm, setAlertForm] = useState<IAlertFormData>({
    symbol: "BTC",
    condition: "above",
    threshold: 0,
  });

  const [showAddAlert, setShowAddAlert] = useState(false);
  const [securityService] = useState(() => SecurityService.createForDSKY());

  const realTimeData = useDSKYRealTime(watchedAddresses);

  useEffect(() => {
    if (!onDSKYUpdate || realTimeData.dskyUpdates.length === 0) return;

    const latestUpdate =
      realTimeData.dskyUpdates[realTimeData.dskyUpdates.length - 1];
    onDSKYUpdate(latestUpdate.field, latestUpdate.value);
  }, [realTimeData.dskyUpdates, onDSKYUpdate]);

  const handleAddAlert = useCallback(() => {
    const validation = securityService.validateInput(alertForm, [
      {
        field: "symbol",
        type: "string",
        required: true,
        pattern: /^[A-Z]{2,10}$/,
      },
      { field: "threshold", type: "number", required: true, min: 0 },
    ]);

    if (!validation.isValid) {
      console.error("Invalid alert form:", validation.errors);
      return;
    }

    const alert: IPriceAlert = {
      id: `${alertForm.symbol}_${alertForm.condition}_${alertForm.threshold}_${Date.now()}`,
      symbol: alertForm.symbol,
      condition: alertForm.condition,
      threshold: alertForm.threshold,
      enabled: true,
      callback: (data) => {
        console.log(
          `[Alert] ${alertForm.symbol} ${alertForm.condition} ${alertForm.threshold}: ${data.price}`,
        );
      },
    };

    realTimeData.addPriceAlert(alert);
    setShowAddAlert(false);
    setAlertForm({ symbol: "BTC", condition: "above", threshold: 0 });
  }, [alertForm, realTimeData, securityService]);

  const handleRemoveAlert = useCallback(
    (alertId: string) => {
      realTimeData.removePriceAlert(alertId);
    },
    [realTimeData],
  );

  const toggleConfig = useCallback((key: keyof IDashboardConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const formatPrice = useCallback((price: number): string => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  }, []);

  const formatChange = useCallback((change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  }, []);

  const getStatusColor = useCallback((connected: boolean): string => {
    return connected ? "#00FF41" : "#FF0080";
  }, []);

  const ConnectionStatus: React.FC = () => (
    <div className="connection-status">
      <div className="status-item">
        <span className="status-label">Price Feeds:</span>
        <span
          className="status-indicator"
          style={{
            color: getStatusColor(realTimeData.connectionStatus.priceFeeds),
          }}
        >
          {realTimeData.connectionStatus.priceFeeds ? "●" : "○"}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Blockchain:</span>
        <span
          className="status-indicator"
          style={{
            color: getStatusColor(realTimeData.connectionStatus.blockchain),
          }}
        >
          {realTimeData.connectionStatus.blockchain ? "●" : "○"}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Overall:</span>
        <span
          className="status-indicator"
          style={{
            color: getStatusColor(realTimeData.connectionStatus.overall),
          }}
        >
          {realTimeData.getConnectionIndicator()}
        </span>
      </div>
    </div>
  );

  const PriceGrid: React.FC = () => (
    <div className="price-grid">
      <h3>Cryptocurrency Prices</h3>
      <div className="price-list">
        {Array.from(realTimeData.prices.entries()).map(([symbol, data]) => (
          <div key={symbol} className="price-item">
            <div className="price-header">
              <span className="price-symbol">{symbol}</span>
              <span className="price-value">{formatPrice(data.price)}</span>
            </div>
            <div className="price-details">
              <span
                className={`price-change ${(data.changePercent24h ?? 0) >= 0 ? "positive" : "negative"}`}
              >
                {formatChange(data.changePercent24h ?? 0)}
              </span>
              <span className="price-volume">
                Vol: {data.volume24h ? formatPrice(data.volume24h) : "N/A"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BlockchainInfo: React.FC = () => (
    <div className="blockchain-info">
      <h3>Blockchain Status</h3>

      {realTimeData.latestBlock && (
        <div className="info-section">
          <h4>Latest Block</h4>
          <div className="info-item">
            <span>Number:</span>
            <span>{realTimeData.latestBlock.number.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span>Hash:</span>
            <span className="hash">
              {realTimeData.latestBlock.hash.slice(0, 10)}...
            </span>
          </div>
          <div className="info-item">
            <span>Transactions:</span>
            <span>{realTimeData.latestBlock.transactionCount}</span>
          </div>
          <div className="info-item">
            <span>Gas Used:</span>
            <span>
              {(parseInt(realTimeData.latestBlock.gasUsed) / 1000000).toFixed(
                1,
              )}
              M
            </span>
          </div>
        </div>
      )}

      {realTimeData.latestGasPrices && (
        <div className="info-section">
          <h4>Gas Prices (Gwei)</h4>
          <div className="gas-prices">
            <div className="gas-item">
              <span>Slow:</span>
              <span>
                {parseFloat(realTimeData.latestGasPrices.slow).toFixed(1)}
              </span>
            </div>
            <div className="gas-item">
              <span>Standard:</span>
              <span>
                {parseFloat(realTimeData.latestGasPrices.standard).toFixed(1)}
              </span>
            </div>
            <div className="gas-item">
              <span>Fast:</span>
              <span>
                {parseFloat(realTimeData.latestGasPrices.fast).toFixed(1)}
              </span>
            </div>
            <div className="gas-item">
              <span>Instant:</span>
              <span>
                {parseFloat(realTimeData.latestGasPrices.instant).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const AlertsPanel: React.FC = () => (
    <div className="alerts-panel">
      <div className="alerts-header">
        <h3>Price Alerts</h3>
        <button className="add-alert-btn" onClick={() => setShowAddAlert(true)}>
          + Add Alert
        </button>
      </div>

      <div className="alerts-list">
        {realTimeData.priceAlerts.map((alert) => (
          <div key={alert.id} className="alert-item">
            <div className="alert-info">
              <span className="alert-symbol">{alert.symbol}</span>
              <span className="alert-condition">
                {alert.condition} {alert.threshold}
              </span>
              <span
                className={`alert-status ${alert.enabled ? "enabled" : "disabled"}`}
              >
                {alert.enabled ? "ON" : "OFF"}
              </span>
            </div>
            <button
              className="remove-alert-btn"
              onClick={() => handleRemoveAlert(alert.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {showAddAlert && (
        <div className="add-alert-form">
          <h4>Add Price Alert</h4>
          <div className="form-row">
            <select
              value={alertForm.symbol}
              onChange={(e) =>
                setAlertForm((prev) => ({ ...prev, symbol: e.target.value }))
              }
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="ADA">Cardano (ADA)</option>
              <option value="DOT">Polkadot (DOT)</option>
              <option value="MATIC">Polygon (MATIC)</option>
            </select>
            <select
              value={alertForm.condition}
              onChange={(e) =>
                setAlertForm((prev) => ({
                  ...prev,
                  condition: e.target.value as IAlertFormData["condition"],
                }))
              }
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
              <option value="change_percent">Change %</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="number"
              placeholder="Threshold"
              value={alertForm.threshold}
              onChange={(e) =>
                setAlertForm((prev) => ({
                  ...prev,
                  threshold: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="form-actions">
            <button onClick={handleAddAlert}>Add Alert</button>
            <button onClick={() => setShowAddAlert(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  const EventsTimeline: React.FC = () => (
    <div className="events-timeline">
      <h3>Recent Events</h3>
      <div className="events-list">
        {realTimeData.recentEvents
          .slice(-10)
          .reverse()
          .map((event, index) => (
            <div key={`${event.timestamp}-${index}`} className="event-item">
              <div className="event-time">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
              <div className="event-type">{event.type}</div>
              <div className="event-source">{event.source}</div>
            </div>
          ))}
      </div>
    </div>
  );

  const DSKYUpdatesPanel: React.FC = () => (
    <div className="dsky-updates">
      <h3>DSKY Updates</h3>
      <div className="updates-list">
        {realTimeData.dskyUpdates
          .slice(-5)
          .reverse()
          .map((update, index) => (
            <div key={`${update.field}-${index}`} className="update-item">
              <span className="update-field">
                {update.field.toUpperCase()}:
              </span>
              <span className="update-value">{update.value}</span>
              <span
                className={`update-priority ${update.priority?.toLowerCase()}`}
              >
                {update.priority}
              </span>
            </div>
          ))}
      </div>
    </div>
  );

  const ConfigPanel: React.FC = () => (
    <div className="config-panel">
      <h3>Dashboard Configuration</h3>
      <div className="config-options">
        <label>
          <input
            type="checkbox"
            checked={config.showPrices}
            onChange={() => toggleConfig("showPrices")}
          />
          Show Prices
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.showBlockchain}
            onChange={() => toggleConfig("showBlockchain")}
          />
          Show Blockchain
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.showAlerts}
            onChange={() => toggleConfig("showAlerts")}
          />
          Show Alerts
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.showAnalytics}
            onChange={() => toggleConfig("showAnalytics")}
          />
          Show Analytics
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.compactMode}
            onChange={() => toggleConfig("compactMode")}
          />
          Compact Mode
        </label>
      </div>
    </div>
  );

  if (realTimeData.isLoading) {
    return (
      <div className="app-content">
        <div className="real-time-dashboard loading">
          <div className="loading-message">
            Initializing real-time data services...
          </div>
        </div>
      </div>
    );
  }

  if (realTimeData.error) {
    return (
      <div className="app-content">
        <div className="real-time-dashboard error">
          <div className="error-message">Error: {realTimeData.error}</div>
          <button onClick={realTimeData.connect}>Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div
        className={`real-time-dashboard ${config.compactMode ? "compact" : ""}`}
      >
        <div className="dashboard-header">
          <h2>Apollo DSKY Real-Time Dashboard</h2>
          <ConnectionStatus />
        </div>

        <div className="dashboard-content">
          {config.showPrices && (
            <div className="dashboard-section">
              <PriceGrid />
            </div>
          )}

          {config.showBlockchain && (
            <div className="dashboard-section">
              <BlockchainInfo />
            </div>
          )}

          {config.showAlerts && (
            <div className="dashboard-section">
              <AlertsPanel />
            </div>
          )}

          <div className="dashboard-section">
            <EventsTimeline />
          </div>

          <div className="dashboard-section">
            <DSKYUpdatesPanel />
          </div>

          <div className="dashboard-section">
            <ConfigPanel />
          </div>
        </div>

        <div className="dashboard-footer">
          <div className="stats">
            Connected: {realTimeData.isConnected ? "YES" : "NO"} | Events:{" "}
            {realTimeData.recentEvents.length} | Alerts:{" "}
            {realTimeData.priceAlerts.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
