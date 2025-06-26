import axios from 'axios';
import type { CryptoPriceData } from '../types/crypto';

export class CryptoService {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  
  // Symbol to CoinGecko ID mapping
  private readonly symbolMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'MATIC': 'matic-network'
  };

  async getCryptoPrices(symbols: string[]): Promise<CryptoPriceData[]> {
    try {
      // Convert symbols to CoinGecko IDs
      const ids = symbols.map(symbol => this.symbolMap[symbol]).filter(Boolean);
      
      if (ids.length === 0) {
        throw new Error('No valid symbols provided');
      }

      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: ids.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true
        }
      });

      // Transform the response to our format
      const result: CryptoPriceData[] = [];
      
      for (const symbol of symbols) {
        const coinId = this.symbolMap[symbol];
        if (coinId && response.data[coinId]) {
          const coinData = response.data[coinId];
          result.push({
            symbol,
            price: coinData.usd,
            change24h: coinData.usd_24h_change || 0,
            marketCap: coinData.usd_market_cap || 0,
            lastUpdated: new Date()
          });
        }
      }

      return result;
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      
      // Return mock data if API fails (for demo purposes)
      return this.getMockData(symbols);
    }
  }

  private getMockData(symbols: string[]): CryptoPriceData[] {
    const mockPrices: Record<string, number> = {
      'BTC': 43250.00,
      'ETH': 2650.50,
      'ADA': 0.485,
      'DOT': 7.23,
      'MATIC': 0.875
    };

    return symbols.map(symbol => ({
      symbol,
      price: mockPrices[symbol] || 0,
      change24h: (Math.random() - 0.5) * 10, // Random change between -5% and +5%
      marketCap: mockPrices[symbol] ? mockPrices[symbol] * 1000000000 : 0,
      lastUpdated: new Date()
    }));
  }

  // Get real-time price updates (WebSocket would be ideal, but using polling for simplicity)
  async startPriceUpdates(
    symbols: string[], 
    callback: (data: CryptoPriceData[]) => void,
    intervalMs: number = 30000
  ): Promise<() => void> {
    const updatePrices = async () => {
      try {
        const data = await this.getCryptoPrices(symbols);
        callback(data);
      } catch (error) {
        console.error('Error updating prices:', error);
      }
    };

    // Initial fetch
    await updatePrices();

    // Set up interval
    const intervalId = setInterval(updatePrices, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

export default CryptoService;
