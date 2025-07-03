// Apollo DSKY - Data Visualization Service
// Enterprise-grade data visualization and analytics for crypto and blockchain data

import { CacheService, CacheStrategy } from '../cache/CacheService';

/** Chart Types */
export enum ChartType {
  LINE = 'LINE',
  CANDLESTICK = 'CANDLESTICK',
  BAR = 'BAR',
  AREA = 'AREA',
  SCATTER = 'SCATTER',
  HEATMAP = 'HEATMAP',
  GAUGE = 'GAUGE',
  RADAR = 'RADAR'
}

/** Time Range Options */
export enum TimeRange {
  MINUTE_1 = '1m',
  MINUTE_5 = '5m',
  MINUTE_15 = '15m',
  HOUR_1 = '1h',
  HOUR_4 = '4h',
  DAY_1 = '1d',
  WEEK_1 = '1w',
  MONTH_1 = '1M',
  YEAR_1 = '1y'
}

/** Data Point Interface */
export interface IDataPoint {
  timestamp: number;
  value: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  metadata?: Record<string, unknown>;
}

/** Chart Configuration */
export interface IChartConfig {
  type: ChartType;
  title: string;
  width: number;
  height: number;
  timeRange: TimeRange;
  dataSource: string;
  refreshInterval: number;
  theme: 'APOLLO' | 'DARK' | 'LIGHT';
  animations: boolean;
  showGrid: boolean;
  showLegend: boolean;
  colors: string[];
}

/** Visualization Data */
export interface IVisualizationData {
  id: string;
  title: string;
  type: ChartType;
  data: IDataPoint[];
  config: IChartConfig;
  lastUpdate: number;
  isLoading: boolean;
  error?: string;
}

/** Analytics Metrics */
export interface IAnalyticsMetrics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  percentile25: number;
  percentile75: number;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  volatility: number;
  correlation?: number;
}

/** Technical Indicators */
export interface ITechnicalIndicators {
  sma: { period: number; values: number[] }[];
  ema: { period: number; values: number[] }[];
  rsi: { period: number; values: number[] };
  macd: { 
    signal: number[];
    histogram: number[];
    macd: number[];
  };
  bollinger: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  stochastic: {
    k: number[];
    d: number[];
  };
}

/** Data Visualization Service */
export class DataVisualizationService {
  private cache: CacheService;
  private visualizations: Map<string, IVisualizationData> = new Map();
  private updateTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Event callbacks
  private onVisualizationUpdate?: (id: string, data: IVisualizationData) => void;
  private onAnalyticsUpdate?: (id: string, metrics: IAnalyticsMetrics) => void;
  constructor() {
    this.cache = new CacheService({
      strategy: CacheStrategy.LRU,
      maxSize: 10000,
      defaultTTL: 600000, // 10 minutes TTL
      enableMetrics: true
    });
  }

  /** Create a new visualization */
  createVisualization(id: string, config: IChartConfig): IVisualizationData {
    const visualization: IVisualizationData = {
      id,
      title: config.title,
      type: config.type,
      data: [],
      config,
      lastUpdate: 0,
      isLoading: false
    };

    this.visualizations.set(id, visualization);
    this.startAutoUpdate(id);
    
    console.log('[DataVisualization] Created visualization:', id);
    return visualization;
  }

  /** Update visualization data */
  updateVisualization(id: string, data: IDataPoint[]): void {
    const visualization = this.visualizations.get(id);
    if (!visualization) {
      console.warn('[DataVisualization] Visualization not found:', id);
      return;
    }

    visualization.data = data;
    visualization.lastUpdate = Date.now();
    visualization.isLoading = false;
    visualization.error = undefined;

    // Cache the data
    this.cache.set(`viz:${id}`, visualization);

    // Calculate analytics
    const metrics = this.calculateAnalytics(data);
    this.cache.set(`analytics:${id}`, metrics);

    // Calculate technical indicators for price data
    if (this.isPriceData(data)) {
      const indicators = this.calculateTechnicalIndicators(data);
      this.cache.set(`indicators:${id}`, indicators);
    }

    // Notify listeners
    if (this.onVisualizationUpdate) {
      this.onVisualizationUpdate(id, visualization);
    }

    if (this.onAnalyticsUpdate) {
      this.onAnalyticsUpdate(id, metrics);
    }
  }

  /** Get visualization by ID */
  getVisualization(id: string): IVisualizationData | null {
    return this.visualizations.get(id) || null;
  }

  /** Get all visualizations */
  getAllVisualizations(): IVisualizationData[] {
    return Array.from(this.visualizations.values());
  }

  /** Get analytics metrics for visualization */
  getAnalytics(id: string): IAnalyticsMetrics | null {
    return this.cache.get(`analytics:${id}`) as IAnalyticsMetrics | null;
  }

  /** Get technical indicators for visualization */
  getTechnicalIndicators(id: string): ITechnicalIndicators | null {
    return this.cache.get(`indicators:${id}`) as ITechnicalIndicators | null;
  }

  /** Remove visualization */
  removeVisualization(id: string): void {
    const visualization = this.visualizations.get(id);
    if (!visualization) return;

    // Stop auto update
    this.stopAutoUpdate(id);

    // Remove from maps and cache
    this.visualizations.delete(id);
    this.cache.delete(`viz:${id}`);
    this.cache.delete(`analytics:${id}`);
    this.cache.delete(`indicators:${id}`);

    console.log('[DataVisualization] Removed visualization:', id);
  }

  /** Update visualization configuration */
  updateConfig(id: string, config: Partial<IChartConfig>): void {
    const visualization = this.visualizations.get(id);
    if (!visualization) return;

    visualization.config = { ...visualization.config, ...config };
    
    // Restart auto update if interval changed
    if (config.refreshInterval) {
      this.stopAutoUpdate(id);
      this.startAutoUpdate(id);
    }

    console.log('[DataVisualization] Updated config for:', id);
  }

  /** Generate Apollo DSKY themed chart */
  generateDSKYChart(data: IDataPoint[], type: ChartType = ChartType.LINE): string {
    const apolloColors = {
      primary: '#00FF41',      // Apollo green
      secondary: '#0080FF',    // Apollo blue
      warning: '#FF8000',      // Apollo orange
      error: '#FF0080',        // Apollo pink
      background: '#000000',   // Black
      grid: '#003300'          // Dark green
    };

    // Generate ASCII art representation for DSKY display
    return this.generateASCIIChart(data, type, apolloColors);
  }

  /** Generate real-time dashboard data */
  generateDashboardData(): {
    priceCharts: IVisualizationData[];
    blockchainCharts: IVisualizationData[];
    analyticsCharts: IVisualizationData[];
    summary: Record<string, unknown>;
  } {
    const allViz = this.getAllVisualizations();
    
    return {
      priceCharts: allViz.filter(v => v.config.dataSource.includes('price')),
      blockchainCharts: allViz.filter(v => v.config.dataSource.includes('blockchain')),
      analyticsCharts: allViz.filter(v => v.config.dataSource.includes('analytics')),
      summary: this.generateSummaryStats()
    };
  }

  /** Set event callbacks */
  setEventCallbacks(callbacks: {
    onVisualizationUpdate?: (id: string, data: IVisualizationData) => void;
    onAnalyticsUpdate?: (id: string, metrics: IAnalyticsMetrics) => void;
  }): void {
    this.onVisualizationUpdate = callbacks.onVisualizationUpdate;
    this.onAnalyticsUpdate = callbacks.onAnalyticsUpdate;
  }

  /** Calculate analytics metrics */
  private calculateAnalytics(data: IDataPoint[]): IAnalyticsMetrics {
    if (data.length === 0) {
      return this.getEmptyMetrics();
    }

    const values = data.map(d => d.value).filter(v => !isNaN(v));
    const sorted = [...values].sort((a, b) => a - b);
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    const median = this.calculateMedian(sorted);
    const mode = this.calculateMode(values);
    
    const percentile25 = this.calculatePercentile(sorted, 25);
    const percentile75 = this.calculatePercentile(sorted, 75);
    
    const trend = this.calculateTrend(values);
    const volatility = this.calculateVolatility(values);

    return {
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      min: Math.min(...values),
      max: Math.max(...values),
      range: Math.max(...values) - Math.min(...values),
      percentile25,
      percentile75,
      trend,
      volatility
    };
  }

  /** Calculate technical indicators */
  private calculateTechnicalIndicators(data: IDataPoint[]): ITechnicalIndicators {
    const prices = data.map(d => d.close || d.value);
    const high = data.map(d => d.high || d.value);
    const low = data.map(d => d.low || d.value);

    return {
      sma: [
        { period: 10, values: this.calculateSMA(prices, 10) },
        { period: 20, values: this.calculateSMA(prices, 20) },
        { period: 50, values: this.calculateSMA(prices, 50) }
      ],
      ema: [
        { period: 12, values: this.calculateEMA(prices, 12) },
        { period: 26, values: this.calculateEMA(prices, 26) }
      ],
      rsi: { period: 14, values: this.calculateRSI(prices, 14) },
      macd: this.calculateMACD(prices),
      bollinger: this.calculateBollingerBands(prices, 20, 2),
      stochastic: this.calculateStochastic(high, low, prices, 14)
    };
  }

  /** Calculate Simple Moving Average */
  private calculateSMA(data: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    
    return result;
  }

  /** Calculate Exponential Moving Average */
  private calculateEMA(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    result[0] = data[0];
    
    for (let i = 1; i < data.length; i++) {
      result[i] = (data[i] * multiplier) + (result[i - 1] * (1 - multiplier));
    }
    
    return result;
  }

  /** Calculate RSI */
  private calculateRSI(data: number[], period: number): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push(rsi);
    }
    
    return result;
  }

  /** Calculate MACD */
  private calculateMACD(data: number[]): { signal: number[]; histogram: number[]; macd: number[] } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    const macd: number[] = [];
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macd.push(ema12[i] - ema26[i]);
    }
    
    const signal = this.calculateEMA(macd, 9);
    const histogram: number[] = [];
    
    for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
      histogram.push(macd[i] - signal[i]);
    }
    
    return { signal, histogram, macd };
  }

  /** Calculate Bollinger Bands */
  private calculateBollingerBands(data: number[], period: number, stdDev: number): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const sma = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      const smaIndex = i - period + 1;
      upper.push(sma[smaIndex] + (standardDeviation * stdDev));
      lower.push(sma[smaIndex] - (standardDeviation * stdDev));
    }
    
    return { upper, middle: sma, lower };
  }

  /** Calculate Stochastic */
  private calculateStochastic(high: number[], low: number[], close: number[], period: number): {
    k: number[];
    d: number[];
  } {
    const k: number[] = [];
    
    for (let i = period - 1; i < close.length; i++) {
      const highSlice = high.slice(i - period + 1, i + 1);
      const lowSlice = low.slice(i - period + 1, i + 1);
      
      const highestHigh = Math.max(...highSlice);
      const lowestLow = Math.min(...lowSlice);
      
      const kValue = ((close[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
      k.push(kValue);
    }
    
    const d = this.calculateSMA(k, 3);
    
    return { k, d };
  }

  /** Generate ASCII chart for DSKY display */
  private generateASCIIChart(data: IDataPoint[], _type: ChartType, _colors: Record<string, string>): string {
    if (data.length === 0) return 'NO DATA';
    
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    const height = 8; // DSKY display height
    const width = 20; // DSKY display width
    
    let chart = '';
    
    // Generate line chart representation
    for (let row = height - 1; row >= 0; row--) {
      let line = '';
      const threshold = min + (range * row / (height - 1));
      
      for (let col = 0; col < width; col++) {
        const dataIndex = Math.floor((col / width) * values.length);
        const value = values[dataIndex] || 0;
        
        if (value >= threshold) {
          line += '*';
        } else {
          line += ' ';
        }
      }
      
      chart += line + '\n';
    }
    
    return chart;
  }

  /** Calculate median */
  private calculateMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /** Calculate mode */
  private calculateMode(values: number[]): number {
    const frequency: { [key: number]: number } = {};
    
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    
    let maxCount = 0;
    let mode = values[0];
    
    Object.entries(frequency).forEach(([value, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mode = parseFloat(value);
      }
    });
    
    return mode;
  }

  /** Calculate percentile */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /** Calculate trend */
  private calculateTrend(values: number[]): 'BULLISH' | 'BEARISH' | 'SIDEWAYS' {
    if (values.length < 2) return 'SIDEWAYS';
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.05) return 'BULLISH';
    if (change < -0.05) return 'BEARISH';
    return 'SIDEWAYS';
  }

  /** Calculate volatility */
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < values.length; i++) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }
    
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  /** Check if data contains price information */
  private isPriceData(data: IDataPoint[]): boolean {
    return data.some(d => d.open !== undefined || d.high !== undefined || d.low !== undefined || d.close !== undefined);
  }

  /** Get empty metrics */
  private getEmptyMetrics(): IAnalyticsMetrics {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      percentile25: 0,
      percentile75: 0,
      trend: 'SIDEWAYS',
      volatility: 0
    };
  }

  /** Generate summary statistics */
  private generateSummaryStats(): Record<string, unknown> {
    const visualizations = this.getAllVisualizations();
    
    return {
      totalVisualizations: visualizations.length,
      activeVisualizations: visualizations.filter(v => !v.isLoading && !v.error).length,
      errorVisualizations: visualizations.filter(v => v.error).length,
      loadingVisualizations: visualizations.filter(v => v.isLoading).length,
      cacheSize: this.cache.getStats().size,
      lastUpdate: Date.now()
    };
  }

  /** Start auto update for visualization */
  private startAutoUpdate(id: string): void {
    const visualization = this.visualizations.get(id);
    if (!visualization) return;

    const timer = setInterval(() => {
      // Mark as loading
      visualization.isLoading = true;
      
      // In a real implementation, this would fetch new data
      // For now, we'll just update the timestamp
      console.log(`[DataVisualization] Auto-updating ${id}`);
    }, visualization.config.refreshInterval);

    this.updateTimers.set(id, timer);
  }

  /** Stop auto update for visualization */
  private stopAutoUpdate(id: string): void {
    const timer = this.updateTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.updateTimers.delete(id);
    }
  }

  /** Dispose of the service */
  dispose(): void {
    // Stop all timers
    this.updateTimers.forEach(timer => clearInterval(timer));
    this.updateTimers.clear();
    
    // Clear data
    this.visualizations.clear();
    this.cache.clear();
    
    console.log('[DataVisualization] Disposed successfully');
  }

  /** Static factory method for DSKY configuration */
  static createForDSKY(): DataVisualizationService {
    const service = new DataVisualizationService();
    
    // Create default DSKY visualizations
    service.createVisualization('btc-price', {
      type: ChartType.LINE,
      title: 'Bitcoin Price',
      width: 400,
      height: 200,
      timeRange: TimeRange.HOUR_1,
      dataSource: 'price:BTC',
      refreshInterval: 5000,
      theme: 'APOLLO',
      animations: false,
      showGrid: true,
      showLegend: false,
      colors: ['#00FF41']
    });
    
    service.createVisualization('eth-price', {
      type: ChartType.LINE,
      title: 'Ethereum Price',
      width: 400,
      height: 200,
      timeRange: TimeRange.HOUR_1,
      dataSource: 'price:ETH',
      refreshInterval: 5000,
      theme: 'APOLLO',
      animations: false,
      showGrid: true,
      showLegend: false,
      colors: ['#0080FF']
    });
    
    service.createVisualization('block-stats', {
      type: ChartType.BAR,
      title: 'Block Statistics',
      width: 400,
      height: 200,
      timeRange: TimeRange.MINUTE_15,
      dataSource: 'blockchain:blocks',
      refreshInterval: 15000,
      theme: 'APOLLO',
      animations: false,
      showGrid: true,
      showLegend: false,
      colors: ['#FF8000']
    });
    
    return service;
  }
}
