// Apollo DSKY - Real-time Data Hook
// Enterprise-grade React hook for real-time data management

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealTimeIntegrationService, IRealTimeEvent, IDSKYUpdate } from '../services/realtime/RealTimeIntegrationService';
import type { IPriceData } from '../services/realtime/RealTimePriceFeedService';
import type { IPriceAlert } from '../interfaces/IPriceAlert';
import { IBlockEvent, ITransactionEvent, IGasPriceEvent, INetworkStatsEvent } from '../services/realtime/RealTimeBlockchainService';

/** Real-time Data State */
export interface IRealTimeDataState {
  // Connection status
  isConnected: boolean;
  connectionStatus: {
    priceFeeds: boolean;
    blockchain: boolean;
    overall: boolean;
  };
  
  // Price data
  prices: Map<string, IPriceData>;
  priceAlerts: IPriceAlert[];
  
  // Blockchain data
  latestBlock: IBlockEvent | null;
  latestGasPrices: IGasPriceEvent | null;
  latestNetworkStats: INetworkStatsEvent | null;
  recentTransactions: ITransactionEvent[];
  
  // Events
  recentEvents: IRealTimeEvent[];
  
  // DSKY integration
  dskyUpdates: IDSKYUpdate[];
  
  // Statistics
  stats: Record<string, unknown> | null;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

/** Real-time Data Hook Configuration */
export interface IUseRealTimeDataConfig {
  enablePriceFeeds: boolean;
  enableBlockchainEvents: boolean;
  watchedAddresses: string[];
  priceSymbols: string[];
  autoConnect: boolean;
  maxEventHistory: number;
  maxDSKYUpdates: number;
}

/** Real-time Data Hook */
export function useRealTimeData(config: IUseRealTimeDataConfig = {
  enablePriceFeeds: true,
  enableBlockchainEvents: true,
  watchedAddresses: [],
  priceSymbols: ['BTC', 'ETH', 'ADA', 'DOT', 'MATIC'],
  autoConnect: true,
  maxEventHistory: 100,
  maxDSKYUpdates: 50
}) {
  const [state, setState] = useState<IRealTimeDataState>({
    isConnected: false,
    connectionStatus: {
      priceFeeds: false,
      blockchain: false,
      overall: false
    },
    prices: new Map(),
    priceAlerts: [],
    latestBlock: null,
    latestGasPrices: null,
    latestNetworkStats: null,
    recentTransactions: [],
    recentEvents: [],
    dskyUpdates: [],
    stats: null,
    isLoading: false,
    error: null
  });

  const serviceRef = useRef<RealTimeIntegrationService | null>(null);
  const mountedRef = useRef(true);

  /** Initialize real-time service */
  const initialize = useCallback(async () => {
    if (serviceRef.current) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Create integration service
      serviceRef.current = RealTimeIntegrationService.createForDSKY(config.watchedAddresses);

      // Set up event callbacks
      serviceRef.current.setEventCallbacks({
        onDataUpdate: (event) => {
          if (!mountedRef.current) return;
          
          setState(prev => ({
            ...prev,
            recentEvents: [...prev.recentEvents.slice(-(config.maxEventHistory - 1)), event]
          }));
        },
        
        onDSKYUpdate: (updates) => {
          if (!mountedRef.current) return;
          
          setState(prev => ({
            ...prev,
            dskyUpdates: [...prev.dskyUpdates.slice(-(config.maxDSKYUpdates - updates.length)), ...updates]
          }));
        },
        
        onAlert: (alert, data) => {
          if (!mountedRef.current) return;
          
          console.log('[RealTimeData] Price alert triggered:', alert.symbol, data.price);
        },
        
        onConnectionChange: (service, connected) => {
          if (!mountedRef.current) return;
          
          setState(prev => {
            const newConnectionStatus = { ...prev.connectionStatus };
            if (service === 'PRICE_FEED') {
              newConnectionStatus.priceFeeds = connected;
            } else if (service === 'BLOCKCHAIN') {
              newConnectionStatus.blockchain = connected;
            }
            newConnectionStatus.overall = newConnectionStatus.priceFeeds && newConnectionStatus.blockchain;
            
            return {
              ...prev,
              connectionStatus: newConnectionStatus,
              isConnected: newConnectionStatus.overall
            };
          });
        }
      });

      // Initialize the service
      await serviceRef.current.initialize();

      // Subscribe to price feeds
      if (config.enablePriceFeeds && config.priceSymbols.length > 0) {
        await serviceRef.current.subscribeToPrices(config.priceSymbols);
      }

      // Watch addresses
      if (config.enableBlockchainEvents && config.watchedAddresses.length > 0) {
        await serviceRef.current.watchAddresses(config.watchedAddresses);
      }

      setState(prev => ({ ...prev, isLoading: false }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize real-time data';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      console.error('[RealTimeData] Initialization failed:', error);
    }
  }, [config]);

  /** Connect to real-time services */
  const connect = useCallback(async () => {
    await initialize();
  }, [initialize]);

  /** Disconnect from real-time services */
  const disconnect = useCallback(async () => {
    if (serviceRef.current) {
      await serviceRef.current.dispose();
      serviceRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: {
        priceFeeds: false,
        blockchain: false,
        overall: false
      }
    }));
  }, []);

  /** Add price alert */
  const addPriceAlert = useCallback((alert: IPriceAlert) => {
    if (!serviceRef.current) return;
    
    serviceRef.current.addPriceAlert(alert);
    setState(prev => ({
      ...prev,
      priceAlerts: [...prev.priceAlerts, alert]
    }));
  }, []);

  /** Remove price alert */
  const removePriceAlert = useCallback((alertId: string) => {
    if (!serviceRef.current) return;
    
    serviceRef.current.removePriceAlert(alertId);
    setState(prev => ({
      ...prev,
      priceAlerts: prev.priceAlerts.filter(alert => alert.id !== alertId)
    }));
  }, []);

  /** Get current price for symbol */
  const getCurrentPrice = useCallback((symbol: string): IPriceData | null => {
    if (!serviceRef.current) return null;
    return serviceRef.current.getCurrentPrice(symbol);
  }, []);

  /** Get latest block data */
  const getLatestBlock = useCallback((): IBlockEvent | null => {
    if (!serviceRef.current) return null;
    return serviceRef.current.getLatestBlock();
  }, []);

  /** Get latest gas prices */
  const getLatestGasPrices = useCallback((): IGasPriceEvent | null => {
    if (!serviceRef.current) return null;
    return serviceRef.current.getLatestGasPrices();
  }, []);

  /** Get service statistics */
  const getStats = useCallback(() => {
    if (!serviceRef.current) return null;
    return serviceRef.current.getStats();
  }, []);

  /** Update data periodically */
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (!serviceRef.current || !mountedRef.current) return;

      // Update prices
      const newPrices = new Map<string, IPriceData>();
      config.priceSymbols.forEach(symbol => {
        const price = serviceRef.current!.getCurrentPrice(symbol);
        if (price) {
          newPrices.set(symbol, price);
        }
      });

      // Update blockchain data
      const latestBlock = serviceRef.current.getLatestBlock();
      const latestGasPrices = serviceRef.current.getLatestGasPrices();
      const stats = serviceRef.current.getStats();
      const connectionStatus = serviceRef.current.getConnectionStatus();

      setState(prev => ({
        ...prev,
        prices: newPrices,
        latestBlock,
        latestGasPrices,
        stats,
        connectionStatus,
        isConnected: connectionStatus.overall
      }));
    }, 1000); // Update every second

    return () => clearInterval(updateInterval);
  }, [config.priceSymbols]);

  /** Auto-connect on mount */
  useEffect(() => {
    if (config.autoConnect) {
      initialize();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [config.autoConnect, initialize]);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.dispose();
      }
    };
  }, []);
  return {
    // State
    ...state,
    
    // Additional properties for compatibility
    data: {
      latestBlock: state.latestBlock,
      gasPrices: state.latestGasPrices,
      prices: state.prices,
      alerts: state.priceAlerts
    },
    watchedAddresses: config.watchedAddresses,
    
    // Actions
    connect,
    disconnect,
    addPriceAlert,
    removePriceAlert,
    addWatchedAddress: (address: string) => {
      config.watchedAddresses = [...config.watchedAddresses, address];
    },
    
    // Getters
    getCurrentPrice,
    getLatestBlock,
    getLatestGasPrices,
    getStats,
    
    // Service reference (for advanced usage)
    service: serviceRef.current
  };
}

/** Hook for price data only */
export function usePriceData(symbols: string[] = ['BTC', 'ETH']) {
  return useRealTimeData({
    enablePriceFeeds: true,
    enableBlockchainEvents: false,
    watchedAddresses: [],
    priceSymbols: symbols,
    autoConnect: true,
    maxEventHistory: 50,
    maxDSKYUpdates: 25
  });
}

/** Hook for blockchain data only */
export function useBlockchainData(watchedAddresses: string[] = []) {
  return useRealTimeData({
    enablePriceFeeds: false,
    enableBlockchainEvents: true,
    watchedAddresses,
    priceSymbols: [],
    autoConnect: true,
    maxEventHistory: 50,
    maxDSKYUpdates: 25
  });
}

/** Hook for DSKY real-time integration */
export function useDSKYRealTime(watchedAddresses: string[] = []) {
  const realTimeData = useRealTimeData({
    enablePriceFeeds: true,
    enableBlockchainEvents: true,
    watchedAddresses,
    priceSymbols: ['BTC', 'ETH', 'ADA', 'DOT', 'MATIC', 'LINK', 'UNI', 'AAVE'],
    autoConnect: true,
    maxEventHistory: 100,
    maxDSKYUpdates: 50
  });

  /** Get formatted price for DSKY display */
  const getFormattedPrice = useCallback((symbol: string): string => {
    const price = realTimeData.getCurrentPrice(symbol);
    if (!price) return 'N/A';
    
    // Format price for DSKY 7-segment display
    if (price.price >= 1000) {
      return price.price.toFixed(0);
    } else if (price.price >= 1) {
      return price.price.toFixed(2);
    } else {
      return price.price.toFixed(4);
    }
  }, [realTimeData]);

  /** Get formatted block number for DSKY display */
  const getFormattedBlockNumber = useCallback((): string => {
    const block = realTimeData.getLatestBlock();
    return block ? block.number.toString() : '0';
  }, [realTimeData]);

  /** Get formatted gas price for DSKY display */
  const getFormattedGasPrice = useCallback((): string => {
    const gas = realTimeData.getLatestGasPrices();
    return gas ? parseFloat(gas.standard).toFixed(1) : '0';
  }, [realTimeData]);

  /** Get connection indicator for DSKY */
  const getConnectionIndicator = useCallback((): string => {
    const status = realTimeData.connectionStatus;
    if (status.overall) return 'CONN';
    if (status.priceFeeds || status.blockchain) return 'PART';
    return 'DISC';
  }, [realTimeData.connectionStatus]);

  return {
    ...realTimeData,
    
    // DSKY-specific formatters
    getFormattedPrice,
    getFormattedBlockNumber,
    getFormattedGasPrice,
    getConnectionIndicator
  };
}