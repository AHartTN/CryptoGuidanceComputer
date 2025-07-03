/**
 * @fileoverview Main Apollo DSKY Component
 * @description Enterprise-grade React component for the Apollo DSKY cryptocurrency interface with real-time data and performance monitoring
 */

import React, { useEffect } from 'react';
import { useDSKY } from '../hooks/useDSKY';
import { useDSKYDebug } from '../hooks/useDSKYDebug';
import { useDSKYControls } from '../hooks/useDSKYControls';
import { DSKYStatusIndicators } from './DSKYStatusIndicators';
import { DSKYDisplayArea } from './DSKYDisplayArea';
import { DSKYKeypad } from './DSKYKeypad';
import { DSKYOutput } from './DSKYOutput';
import { DSKYHelpDialog } from './DSKYHelpDialog';
import '../../../styles/dsky-base.css';
import '../../../styles/dsky-layout.css';
import '../../../styles/dsky-header.css';
import '../../../styles/dsky-keypad.css';
import '../../../styles/dsky-status.css';
import '../../../styles/dsky.css';
// External/shared hooks and services
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { useDSKYPerformance } from '../../../hooks/usePerformance';
import { ProductionConfig } from '../../../services/config/ProductionConfigurationService';
import PerformanceDashboard from '../../../components/PerformanceDashboard';

const DSKY = React.memo(() => {
  // State and business logic hooks
  const {
    dskyState,
    web3State,
    inputMode,
    currentInput,
    statusMessages,
    handleKeyPress
  } = useDSKY();
  const performance = useDSKYPerformance();
  const realTimeData = useRealTimeData({
    enablePriceFeeds: ProductionConfig.getFeatureFlag('enableRealTimeData'),
    enableBlockchainEvents: ProductionConfig.getFeatureFlag('enableRealTimeData'),
    watchedAddresses: web3State.account ? [web3State.account] : [],
    priceSymbols: ['BTC', 'ETH', 'MATIC', 'LINK', 'UNI'],
    autoConnect: ProductionConfig.getFeatureFlag('enableRealTimeData'),
    maxEventHistory: 100,
    maxDSKYUpdates: 50
  });
  const {
    showHelp,
    showPerformanceDashboard,
    setShowPerformanceDashboard,
    realTimeEnabled,
    debugMode,
    handleShowHelp,
    handleCloseHelp,
    toggleRealTime,
    togglePerformanceDashboard,
    toggleDebugMode
  } = useDSKYControls(performance, realTimeData);
  useDSKYDebug((type: string, value: number, name?: string) => {
    performance.recordMetric(type as import('../../../services/monitoring/PerformanceMonitoringService').MetricType, value, name);
  });

  // Watch connected wallet address
  useEffect(() => {
    const timer = performance.startTimer('address_update');
    if (web3State.account && !realTimeData.watchedAddresses.includes(web3State.account)) {
      realTimeData.addWatchedAddress(web3State.account);
    }
    timer();
  }, [web3State.account, realTimeData, performance]);

  // Performance monitoring for component lifecycle
  useEffect(() => {
    const mountTimer = performance.startTimer('component_mount');
    return () => {
      mountTimer();
      performance.startTimer('dsky_component_lifecycle')();
    };
  }, [performance]);

  const buildInfo = ProductionConfig.getBuildInfo();

  return (
    <div className="dsky-main" role="main" aria-label="Apollo DSKY Cryptocurrency Computer">
      {debugMode && (
        <div className="debug-info">
          <div className="debug-badge">
            DEBUG MODE - {buildInfo.environment.toUpperCase()} v{buildInfo.version}
          </div>
          <div className="debug-stats">
            Perf: {performance.responseTime.toFixed(0)}ms | 
            Mem: {performance.memoryUsage.toFixed(1)}% | 
            Err: {performance.errorRate.toFixed(2)}%
          </div>
        </div>
      )}
      <div className="dsky-container">
        <DSKYStatusIndicators dskyState={dskyState} />
        <DSKYDisplayArea 
          dskyState={dskyState}
          inputMode={inputMode}
          currentInput={currentInput}
        />
        <DSKYKeypad 
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="dsky-controls">
        <button 
          className="control-btn help-btn" 
          onClick={handleShowHelp}
          aria-label="Show Help"
        >
          HELP
        </button>
        <button 
          className={`control-btn realtime-btn ${realTimeEnabled ? 'active' : ''}`}
          onClick={toggleRealTime}
          disabled={!ProductionConfig.getFeatureFlag('enableRealTimeData')}
          aria-label="Toggle Real-time Data"
        >
          REAL-TIME
        </button>
        {ProductionConfig.getFeatureFlag('enablePerformanceMonitoring') && (
          <button 
            className="control-btn performance-btn"
            onClick={togglePerformanceDashboard}
            aria-label="Show Performance Dashboard"
          >
            PERF
          </button>
        )}
        {ProductionConfig.isDevelopment() && (
          <button 
            className={`control-btn debug-btn ${debugMode ? 'active' : ''}`}
            onClick={toggleDebugMode}
            aria-label="Toggle Debug Mode"
          >
            DEBUG
          </button>
        )}
      </div>
      <DSKYOutput 
        web3State={web3State}
        statusMessages={statusMessages}
        realTimeData={realTimeData}
      />
      {showHelp && (
        <DSKYHelpDialog 
          isOpen={showHelp}
          onClose={handleCloseHelp} 
        />
      )}
      {showPerformanceDashboard && (
        <PerformanceDashboard 
          onClose={() => setShowPerformanceDashboard(false)}
          compactMode={false}
        />
      )}
      {ProductionConfig.getFeatureFlag('enablePerformanceMonitoring') && (
        <div className="performance-indicators">
          <div className={`perf-indicator ${performance.responseTime > 3000 ? 'warning' : 'good'}`}>
            RT: {performance.responseTime.toFixed(0)}ms
          </div>
          <div className={`perf-indicator ${performance.memoryUsage > 75 ? 'warning' : 'good'}`}>
            MEM: {performance.memoryUsage.toFixed(1)}%
          </div>
          {performance.errorRate > 0 && (
            <div className="perf-indicator error">
              ERR: {performance.errorRate.toFixed(1)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
});

DSKY.displayName = 'DSKY';

export default DSKY;
