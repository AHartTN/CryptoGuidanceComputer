/**
 * @fileoverview Dynamic Coin List Management Hook
 * @description Hook for managing dynamic coin list, flagging, and noun assignment
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type { ICoinListState, ICoinListActions, ICoinListManager, ICoinInfo } from '../types';
import { DSKYNoun } from '../enums/DSKYEnums';

/**
 * Initial coin list state
 */
const initialCoinListState: ICoinListState = {
  coinsByNoun: new Map(),
  coinsById: new Map(),
  flaggedCoins: new Set(),
  nextNounNumber: DSKYNoun.NOUN_DYNAMIC_COIN_START,
  isLoaded: false,
  lastUpdated: undefined
};

/**
 * Popular coins to load initially with their CoinGecko IDs
 */
const INITIAL_COIN_LIST = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'tron', symbol: 'TRX', name: 'TRON' }
];

/**
 * Hook for managing dynamic coin lists
 */
export function useCoinList(): ICoinListManager {
  const [state, setState] = useState<ICoinListState>(initialCoinListState);
  const stateRef = useRef(state);
  stateRef.current = state;

  /**
   * Load coin list from API or use initial list
   */
  const loadCoinList = useCallback(async (): Promise<void> => {
    try {
      // Initialize with popular coins
      const coinsByNoun = new Map<number, ICoinInfo>();
      const coinsById = new Map<string, ICoinInfo>();
      let currentNounNumber = DSKYNoun.NOUN_DYNAMIC_COIN_START;

      // Add initial coins
      for (const coinData of INITIAL_COIN_LIST) {
        const coin: ICoinInfo = {
          id: coinData.id,
          symbol: coinData.symbol,
          name: coinData.name,
          isFlagged: false,
          nounNumber: currentNounNumber,
          lastUpdated: new Date()
        };

        coinsByNoun.set(currentNounNumber, coin);
        coinsById.set(coinData.id, coin);
        currentNounNumber++;
      }

      setState(prev => ({
        ...prev,
        coinsByNoun,
        coinsById,
        nextNounNumber: currentNounNumber,
        isLoaded: true,
        lastUpdated: new Date()
      }));

    } catch (error) {
      console.error('Failed to load coin list:', error);
      // Keep the current state but mark as loaded to prevent infinite retries
      setState(prev => ({
        ...prev,
        isLoaded: true,
        lastUpdated: new Date()
      }));
    }
  }, []);

  /**
   * Toggle coin flag for batch operations
   */
  const toggleCoinFlag = useCallback((coinId: string): void => {
    setState(prev => {
      const coin = prev.coinsById.get(coinId);
      if (!coin) return prev;

      const newFlaggedCoins = new Set(prev.flaggedCoins);
      const newCoinsById = new Map(prev.coinsById);
      const newCoinsByNoun = new Map(prev.coinsByNoun);

      if (coin.isFlagged) {
        // Unflag the coin
        newFlaggedCoins.delete(coinId);
        coin.isFlagged = false;
      } else {
        // Flag the coin
        newFlaggedCoins.add(coinId);
        coin.isFlagged = true;
      }

      // Update both maps
      newCoinsById.set(coinId, coin);
      newCoinsByNoun.set(coin.nounNumber, coin);

      return {
        ...prev,
        coinsByNoun: newCoinsByNoun,
        coinsById: newCoinsById,
        flaggedCoins: newFlaggedCoins
      };
    });
  }, []);

  /**
   * Clear all coin flags
   */
  const clearAllFlags = useCallback((): void => {
    setState(prev => {
      const newCoinsById = new Map<string, ICoinInfo>();
      const newCoinsByNoun = new Map<number, ICoinInfo>();

      // Update all coins to remove flags
      prev.coinsById.forEach((coin, id) => {
        const updatedCoin = { ...coin, isFlagged: false };
        newCoinsById.set(id, updatedCoin);
        newCoinsByNoun.set(coin.nounNumber, updatedCoin);
      });

      return {
        ...prev,
        coinsByNoun: newCoinsByNoun,
        coinsById: newCoinsById,
        flaggedCoins: new Set()
      };
    });
  }, []);

  /**
   * Get coin by noun number
   */
  const getCoinByNoun = useCallback((nounNumber: number): ICoinInfo | undefined => {
    return stateRef.current.coinsByNoun.get(nounNumber);
  }, []);

  /**
   * Get coin by ID
   */
  const getCoinById = useCallback((coinId: string): ICoinInfo | undefined => {
    return stateRef.current.coinsById.get(coinId);
  }, []);

  /**
   * Get all flagged coins
   */
  const getFlaggedCoins = useCallback((): ICoinInfo[] => {
    const flaggedCoins: ICoinInfo[] = [];
    stateRef.current.flaggedCoins.forEach(coinId => {
      const coin = stateRef.current.coinsById.get(coinId);
      if (coin) {
        flaggedCoins.push(coin);
      }
    });
    return flaggedCoins;
  }, []);

  /**
   * Update coin price data
   */
  const updateCoinPrice = useCallback((coinId: string, priceData: Partial<ICoinInfo>): void => {
    setState(prev => {
      const coin = prev.coinsById.get(coinId);
      if (!coin) return prev;

      const updatedCoin = { ...coin, ...priceData, lastUpdated: new Date() };
      const newCoinsById = new Map(prev.coinsById);
      const newCoinsByNoun = new Map(prev.coinsByNoun);

      newCoinsById.set(coinId, updatedCoin);
      newCoinsByNoun.set(coin.nounNumber, updatedCoin);

      return {
        ...prev,
        coinsByNoun: newCoinsByNoun,
        coinsById: newCoinsById
      };
    });
  }, []);
  const actions: ICoinListActions = useMemo(() => ({
    loadCoinList,
    toggleCoinFlag,
    clearAllFlags,
    getCoinByNoun,
    getCoinById,
    getFlaggedCoins,
    updateCoinPrice
  }), [loadCoinList, toggleCoinFlag, clearAllFlags, getCoinByNoun, getCoinById, getFlaggedCoins, updateCoinPrice]);

  return useMemo(() => ({ state, actions }), [state, actions]);
}
