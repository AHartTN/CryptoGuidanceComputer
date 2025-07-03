// Apollo DSKY - Performance Dashboard Component
// Advanced performance monitoring and system diagnostics interface

import React, { useState, useEffect, useCallback } from 'react';
import { useDSKYPerformance, useComponentPerformance } from '../hooks/usePerformance';
import { MetricType, ISystemResourceInfo } from '../services/monitoring/PerformanceMonitoringService';
import { ProductionConfig } from '../services/config/ProductionConfigurationService';
import type { IPerformanceDashboardProps } from '../interfaces/IPerformanceDashboardProps';
import type { IChartConfig } from '../interfaces/IChartConfig';

/** Performance Dashboard Component */
export const PerformanceDashboard: React.FC<IPerformanceDashboardProps> = ({
  onClose,
  compactMode = false,
  refreshInterval = 5000
}) => {  const performance = useDSKYPerformance();
  const _componentPerf = useComponentPerformance('PerformanceDashboard');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'system'>('overview');
  const [_chartConfig, _setChartConfig] = useState<IChartConfig>({
    showGrid: true,
    showLegend: true,
    timeRange: 300000, // 5 minutes
    maxDataPoints: 50
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Configuration
  const config = ProductionConfig.getConfig();
  const perfConfig = ProductionConfig.getPerformanceConfig();

  /** Handle export metrics */
  const handleExportMetrics = useCallback(() => {
    try {
      const metrics = performance.exportMetrics();
      const blob = new Blob([metrics], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsky-performance-metrics-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export metrics:', error);
    }
  }, [performance]);

  /** Format bytes */
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /** Format duration */
  const formatDuration = useCallback((ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }, []);

  /** Get status color */
  const getStatusColor = useCallback((value: number, thresholds: { warn: number; error: number }): string => {
    if (value >= thresholds.error) return '#FF0080'; // Apollo pink (error)
    if (value >= thresholds.warn) return '#FF8000';  // Apollo orange (warning)
    return '#00FF41'; // Apollo green (good)
  }, []);

  /** Overview Tab */
  const OverviewTab: React.FC = () => (
    <div className="performance-overview">
      <div className="performance-cards">
        <div className="performance-card">
          <div className="card-header">
            <h4>Response Time</h4>
            <span className="card-value" style={{ 
              color: getStatusColor(performance.responseTime, { warn: 3000, error: 5000 }) 
            }}>
              {formatDuration(performance.responseTime)}
            </span>
          </div>
          <div className="card-details">
            <div className="detail-item">
              <span>Average:</span>
              <span>{formatDuration(performance.stats[MetricType.RESPONSE_TIME]?.average || 0)}</span>
            </div>
            <div className="detail-item">
              <span>95th Percentile:</span>
              <span>{formatDuration(performance.stats[MetricType.RESPONSE_TIME]?.percentile95 || 0)}</span>
            </div>
          </div>
        </div>

        <div className="performance-card">
          <div className="card-header">
            <h4>Memory Usage</h4>
            <span className="card-value" style={{ 
              color: getStatusColor(performance.memoryUsage, { warn: 70, error: 85 }) 
            }}>
              {performance.memoryUsage.toFixed(1)}%
            </span>
          </div>
          <div className="card-details">            <div className="detail-item">
              <span>Used:</span>
              <span>{formatBytes((performance.systemResources as ISystemResourceInfo)?.memoryUsage?.used || 0)}</span>
            </div>
            <div className="detail-item">
              <span>Total:</span>
              <span>{formatBytes((performance.systemResources as ISystemResourceInfo)?.memoryUsage?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="performance-card">
          <div className="card-header">
            <h4>Error Rate</h4>
            <span className="card-value" style={{ 
              color: getStatusColor(performance.errorRate, { warn: 3, error: 5 }) 
            }}>
              {performance.errorRate.toFixed(2)}%
            </span>
          </div>
          <div className="card-details">
            <div className="detail-item">
              <span>Total Errors:</span>
              <span>{performance.stats[MetricType.ERROR_RATE]?.count || 0}</span>
            </div>
          </div>
        </div>

        <div className="performance-card">
          <div className="card-header">
            <h4>System Status</h4>
            <span className="card-value" style={{ 
              color: performance.isMonitoring ? '#00FF41' : '#FF0080' 
            }}>
              {performance.isMonitoring ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="card-details">
            <div className="detail-item">
              <span>Environment:</span>
              <span>{config.environment.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span>Version:</span>
              <span>{config.version}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="performance-chart">
        <h4>Performance Trends</h4>
        <div className="chart-placeholder">
          <div className="ascii-chart">
            {/* ASCII chart would be generated here */}
            <pre style={{ color: '#00FF41', fontFamily: 'monospace', fontSize: '10px' }}>
{`
Response Time (ms)     Memory Usage (%)      Error Rate (%)
     5000|                    100|                    10|
         |   ●                   |                       |
     4000|     ●                80|     ●                 8|
         |       ●               |       ●               |
     3000|         ●            60|         ●            6|
         |           ●           |           ●           |
     2000|             ●        40|             ●        4|
         |               ●       |               ●       |
     1000|                 ●    20|                 ●    2|
         |                   ●   |                   ●   |
        0|___________________|_0|___________________|_0|___
          0   1   2   3   4   5     0   1   2   3   4   5     0   1   2   3   4   5
                 Time (min)                 Time (min)                 Time (min)
`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  /** Metrics Tab */
  const MetricsTab: React.FC = () => (
    <div className="performance-metrics">
      <div className="metrics-grid">
        {Object.entries(performance.stats).map(([metricType, stats]) => (
          <div key={metricType} className="metric-item">
            <div className="metric-header">
              <h5>{metricType.replace(/_/g, ' ')}</h5>
              <span className="metric-trend">
                {stats.trend === 'IMPROVING' ? '↗' : stats.trend === 'DEGRADING' ? '↘' : '→'}
              </span>
            </div>
            <div className="metric-stats">
              <div className="stat-row">
                <span>Average:</span>
                <span>{stats.average?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="stat-row">
                <span>Min:</span>
                <span>{stats.min?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="stat-row">
                <span>Max:</span>
                <span>{stats.max?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="stat-row">
                <span>95th %:</span>
                <span>{stats.percentile95?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="stat-row">
                <span>Count:</span>
                <span>{stats.count || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /** Alerts Tab */
  const AlertsTab: React.FC = () => (
    <div className="performance-alerts">
      <div className="alerts-header">
        <h4>Active Alerts</h4>
        <button 
          className="clear-alerts-btn"
          onClick={performance.clearAlerts}
          disabled={performance.alerts.length === 0}
        >
          Clear All
        </button>
      </div>

      <div className="alerts-list">
        {performance.alerts.length === 0 ? (
          <div className="no-alerts">No active alerts</div>
        ) : (
          performance.alerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <div className="alert-header">
                <span className="alert-metric">{alert.metric}</span>
                <span className={`alert-status ${alert.enabled ? 'enabled' : 'disabled'}`}>
                  {alert.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="alert-details">
                <span>Threshold: {alert.threshold}</span>
                <span>Condition: {alert.condition.toUpperCase()}</span>
              </div>
              <button 
                className="remove-alert-btn"
                onClick={() => performance.removeAlert(alert.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="recent-alerts">
        <h5>Recent Triggered Alerts</h5>
        <div className="recent-alerts-list">
          {performance.recentAlerts.slice(-5).reverse().map((alert, index) => (
            <div key={`${alert.id}-${index}`} className="recent-alert-item">
              <span className="alert-time">
                {new Date().toLocaleTimeString()}
              </span>
              <span className="alert-message">
                {alert.metric} {alert.condition} {alert.threshold}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /** System Tab */
  const SystemTab: React.FC = () => (
    <div className="performance-system">
      <div className="system-info">
        <h4>System Information</h4>
        <div className="info-grid">
          <div className="info-item">
            <span>Environment:</span>
            <span>{config.environment.toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span>Version:</span>
            <span>{config.version}</span>
          </div>
          <div className="info-item">
            <span>Build Date:</span>
            <span>{new Date(config.buildTimestamp).toLocaleDateString()}</span>
          </div>
          <div className="info-item">
            <span>Monitoring:</span>
            <span style={{ color: perfConfig.enableMonitoring ? '#00FF41' : '#FF0080' }}>
              {perfConfig.enableMonitoring ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <div className="info-item">
            <span>Sample Rate:</span>
            <span>{(perfConfig.sampleRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="system-resources">
        <h4>Resource Utilization</h4>        {performance.systemResources && (
          <div className="resources-grid">
            <div className="resource-item">
              <h5>Memory</h5>
              <div className="resource-bar">
                <div 
                  className="resource-fill"
                  style={{ 
                    width: `${(performance.systemResources as ISystemResourceInfo).memoryUsage.percentage}%`,
                    backgroundColor: getStatusColor((performance.systemResources as ISystemResourceInfo).memoryUsage.percentage, { warn: 70, error: 85 })
                  }}
                />
              </div>
              <div className="resource-details">
                <span>{formatBytes((performance.systemResources as ISystemResourceInfo).memoryUsage.used)}</span>
                <span>/</span>
                <span>{formatBytes((performance.systemResources as ISystemResourceInfo).memoryUsage.total)}</span>
              </div>
            </div>            <div className="resource-item">
              <h5>CPU</h5>
              <div className="resource-bar">
                <div 
                  className="resource-fill"
                  style={{ 
                    width: `${(performance.systemResources as ISystemResourceInfo).cpuUsage}%`,
                    backgroundColor: getStatusColor((performance.systemResources as ISystemResourceInfo).cpuUsage, { warn: 70, error: 85 })
                  }}
                />
              </div>
              <div className="resource-details">
                <span>{(performance.systemResources as ISystemResourceInfo).cpuUsage.toFixed(1)}%</span>
              </div>
            </div>

            <div className="resource-item">
              <h5>Network Latency</h5>
              <div className="resource-details">
                <span>{formatDuration((performance.systemResources as ISystemResourceInfo).networkLatency)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="configuration-info">
        <h4>Configuration</h4>
        <div className="config-grid">
          <div className="config-item">
            <span>Performance Monitoring:</span>
            <span>{perfConfig.enableMonitoring ? 'ON' : 'OFF'}</span>
          </div>
          <div className="config-item">
            <span>Resource Monitoring:</span>
            <span>{perfConfig.enableResourceMonitoring ? 'ON' : 'OFF'}</span>
          </div>
          <div className="config-item">
            <span>Response Time Threshold:</span>
            <span>{formatDuration(perfConfig.alertThresholds.responseTime)}</span>
          </div>
          <div className="config-item">
            <span>Memory Threshold:</span>
            <span>{perfConfig.alertThresholds.memoryUsage}%</span>
          </div>
          <div className="config-item">
            <span>Error Rate Threshold:</span>
            <span>{perfConfig.alertThresholds.errorRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Metrics are automatically updated by the performance hook
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className={`performance-dashboard ${compactMode ? 'compact' : ''}`}>
      <div className="dashboard-header">
        <h2>Apollo DSKY Performance Dashboard</h2>
        <div className="dashboard-controls">
          <label className="toggle-control">
            <input 
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh
          </label>
          <button 
            className="export-btn"
            onClick={handleExportMetrics}
            title="Export Performance Metrics"
          >
            Export
          </button>
          {onClose && (
            <button 
              className="close-btn"
              onClick={onClose}
              title="Close Dashboard"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts ({performance.alerts.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'metrics' && <MetricsTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'system' && <SystemTab />}
      </div>

      <div className="dashboard-footer">
        <div className="footer-info">
          <span>Last Update: {new Date(performance.lastUpdate).toLocaleTimeString()}</span>
          <span>•</span>
          <span>Status: {performance.isMonitoring ? 'MONITORING' : 'INACTIVE'}</span>
          <span>•</span>
          <span>Environment: {config.environment.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
