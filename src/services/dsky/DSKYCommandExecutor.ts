import { DSKYVerb, DSKYNoun, isValidVerbNounCombination } from '../../enums/DSKYEnums';
import { UnifiedWeb3Service } from '../web3/UnifiedWeb3Service';
import { CryptoPriceService } from '../crypto/CryptoPriceService';
import { DynamicCryptoPriceService } from '../crypto/DynamicCryptoPriceService';
import { 
  formatAddressForRegisters, 
  formatPriceForRegister, 
  formatChangeForRegister,
  formatNumberForRegister,
  formatGasPriceToGwei,
  createErrorMessage
} from '../../utils/dskyUtils';
import type { 
  IWalletConnection 
} from '../../interfaces/IWalletConnection';
import type { 
  IBlockchainData 
} from '../../interfaces/IBlockchainData';
import type { 
  IWeb3State 
} from '../../interfaces/IWeb3State';
import type { 
  ICoinListManager 
} from '../../interfaces/ICoinListManager';
import type { 
  ICoinInfo 
} from '../../interfaces/ICoinInfo';
import type { 
  IBatchPriceResult 
} from '../../interfaces/IBatchPriceResult';
import type { IDSKYState } from '../../interfaces/IDSKYState';
import { STATUS_MESSAGES } from '../../constants/DSKYConstants';

export interface ICommandExecutionResult {
  success: boolean;
  statusMessage: string;
  dskyUpdates?: Partial<IDSKYState>;
  web3Updates?: Partial<IWeb3State>;
}

export class DSKYCommandExecutor {
  private cryptoService: CryptoPriceService;
  private dynamicCryptoService: DynamicCryptoPriceService;

  constructor(
    private web3Service: UnifiedWeb3Service,
    private coinListManager: ICoinListManager
  ) {
    this.cryptoService = CryptoPriceService.create();
    this.dynamicCryptoService = new DynamicCryptoPriceService();
  }

  async execute(
    verb: string,
    noun: string,
    currentWeb3State: IWeb3State
  ): Promise<ICommandExecutionResult> {
    try {
      const verbNum = parseInt(verb, 10);
      const nounNum = parseInt(noun, 10);

      if (!isValidVerbNounCombination(verbNum, nounNum)) {
        return {
          success: false,
          statusMessage: STATUS_MESSAGES.INVALID_COMBINATION(verb, noun),
          dskyUpdates: { oprErr: true }
        };
      }

      return await this.executeCommand(verbNum, nounNum, currentWeb3State);
    } catch (error) {
      return {
        success: false,
        statusMessage: STATUS_MESSAGES.COMMAND_ERROR(verb, noun, String(error)),
        dskyUpdates: { oprErr: true }
      };
    }
  }

  private async executeCommand(
    verbNum: number, 
    nounNum: number, 
    currentWeb3State: IWeb3State
  ): Promise<ICommandExecutionResult> {
    switch (verbNum) {
      case DSKYVerb.VERB_CONNECT_WALLET:
        return await this.handleWalletConnect(nounNum);

      case DSKYVerb.VERB_SYSTEM_SHUTDOWN:
        return await this.handleWalletDisconnect(nounNum);

      case DSKYVerb.VERB_WALLET_BALANCE:
        return await this.handleWalletBalance(nounNum, currentWeb3State);

      case DSKYVerb.VERB_BLOCK_CURRENT:
        return await this.handleCurrentBlock(nounNum);

      case DSKYVerb.VERB_NETWORK_STATUS:
        return await this.handleNetworkStatus(nounNum);

      case DSKYVerb.VERB_GAS_PRICES:
        return await this.handleGasPrice(nounNum);

      case DSKYVerb.VERB_WALLET_INFO:
        return this.handleWalletInfo(nounNum, currentWeb3State);

      case DSKYVerb.VERB_HEALTH_CHECK:
        return await this.handleHealthCheck(nounNum);

      case DSKYVerb.VERB_CRYPTO_PRICES:
        return await this.handleCryptoPrice(nounNum);

      case DSKYVerb.VERB_GET_COIN_LIST:
        return await this.handleGetCoinList(nounNum);

      case DSKYVerb.VERB_GET_COIN_PRICE:
        return await this.handleGetCoinPrice(nounNum);

      case DSKYVerb.VERB_FLAG_COIN:
        return await this.handleFlagCoin(nounNum);

      case DSKYVerb.VERB_BATCH_PRICES:
        return await this.handleBatchPrices(nounNum);

      case DSKYVerb.VERB_CLEAR_FLAGS:
        return await this.handleClearFlags(nounNum);

      default:
        return {
          success: false,
          statusMessage: STATUS_MESSAGES.COMMAND_NOT_IMPLEMENTED(verbNum.toString(), nounNum.toString()),
          dskyUpdates: { oprErr: true }
        };
    }
  }

  private async handleWalletConnect(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_WALLET_ADDRESS) {
      const connection = await this.web3Service.connect() as IWalletConnection;
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.WALLET_CONNECTED(connection.address),
        dskyUpdates: { reg1: connection.address.slice(0, 5) },
        web3Updates: { isConnected: true, account: connection.address }
      };
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleWalletDisconnect(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_WALLET_ADDRESS) {
      await this.web3Service.disconnect();
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.WALLET_DISCONNECTED,
        dskyUpdates: { reg1: '00000' },
        web3Updates: { isConnected: false, account: null, balance: null }
      };
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleWalletBalance(nounNum: number, currentWeb3State: IWeb3State): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_WALLET_BALANCE && currentWeb3State.account) {
      const balance = await this.web3Service.getBalance(currentWeb3State.account) as string;
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.BALANCE_UPDATED(balance),
        dskyUpdates: { reg1: parseFloat(balance).toFixed(2).slice(0, 5) },
        web3Updates: { balance }
      };
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleCurrentBlock(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_CURRENT_BLOCK) {
      const blockInfo = await this.web3Service.getCurrentBlock() as { number: number };
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.CURRENT_BLOCK(blockInfo.number),
        dskyUpdates: { reg1: blockInfo.number.toString().slice(-5) }
      };
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleNetworkStatus(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_NETWORK_NAME) {
      const networkInfo = await this.web3Service.getNetworkInfo() as IBlockchainData;
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.NETWORK_INFO(networkInfo.networkName, networkInfo.blockNumber),
        dskyUpdates: { reg1: networkInfo.blockNumber.toString().slice(-5) },
        web3Updates: { network: networkInfo.networkName }
      };
    }
    return this.invalidNounResult(nounNum);
  }
  private async handleGasPrice(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_GAS_PRICE) {
      const gasData = await this.web3Service.getGasPrice();
      const gasInGwei = formatGasPriceToGwei(gasData);
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.GAS_PRICE(gasInGwei),
        dskyUpdates: { reg1: formatNumberForRegister(Math.round(gasInGwei)) }
      };
    }
    return this.invalidNounResult(nounNum);
  }
  private handleWalletInfo(nounNum: number, currentWeb3State: IWeb3State): ICommandExecutionResult {
    if (nounNum === DSKYNoun.NOUN_WALLET_ADDRESS && currentWeb3State.account) {
      const addressRegisters = formatAddressForRegisters(currentWeb3State.account);
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.WALLET_MONITORING(currentWeb3State.account),
        dskyUpdates: addressRegisters
      };
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleHealthCheck(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_SYSTEM_STATUS) {
      const healthResult = await this.web3Service.healthCheck() as boolean;
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.HEALTH_CHECK(healthResult),
        dskyUpdates: { reg1: healthResult ? '01000' : '00000' }
      };
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleCryptoPrice(nounNum: number): Promise<ICommandExecutionResult> {
    try {
      let symbol: string;
      
      
      switch (nounNum) {
        case DSKYNoun.NOUN_CRYPTO_BITCOIN:
          symbol = 'BTC';
          break;
        case DSKYNoun.NOUN_CRYPTO_ETHEREUM:
          symbol = 'ETH';
          break;
        case DSKYNoun.NOUN_CRYPTO_CARDANO:
          symbol = 'ADA';
          break;
        case DSKYNoun.NOUN_CRYPTO_POLYGON:
          symbol = 'MATIC';
          break;
        case DSKYNoun.NOUN_CRYPTO_CHAINLINK:
          symbol = 'LINK';
          break;
        case DSKYNoun.NOUN_CRYPTO_SOLANA:
          symbol = 'SOL';
          break;
        case DSKYNoun.NOUN_CRYPTO_DOGECOIN:
          symbol = 'DOGE';
          break;
        case DSKYNoun.NOUN_CRYPTO_LITECOIN:
          symbol = 'LTC';
          break;
        case DSKYNoun.NOUN_CRYPTO_UNISWAP:
          symbol = 'UNI';
          break;
        default:
          return this.invalidNounResult(nounNum);
      }      const cryptoData = await this.cryptoService.getCryptoPrice(symbol);
      const priceDisplay = formatPriceForRegister(cryptoData.price);
      const changeDisplay = formatChangeForRegister(cryptoData.change24h);

      return {
        success: true,
        statusMessage: STATUS_MESSAGES.CRYPTO_PRICE(cryptoData.symbol, cryptoData.price),
        dskyUpdates: { 
          reg1: cryptoData.symbol,
          reg2: priceDisplay,
          reg3: changeDisplay
        }
      };
    } catch (error) {
      return {
        success: false,
        statusMessage: createErrorMessage('Crypto price fetch', error),
        dskyUpdates: { oprErr: true }
      };
    }
  }

  private async handleGetCoinList(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_COIN_LIST) {
      try {
        
        if (!this.coinListManager.state.isLoaded) {
          await this.coinListManager.actions.loadCoinList();
        }

        const coinCount = this.coinListManager.state.coinsById.size;
        const flaggedCount = this.coinListManager.state.flaggedCoins.size;

        return {
          success: true,
          statusMessage: `${coinCount} coins loaded. ${flaggedCount} flagged. Coins start at N200.`,
          dskyUpdates: { 
            reg1: coinCount.toString().padStart(5, '0'),
            reg2: flaggedCount.toString().padStart(5, '0'),
            reg3: 'READY'
          }
        };
      } catch (error) {
        return {
          success: false,
          statusMessage: `Failed to load coin list: ${error instanceof Error ? error.message : 'Unknown error'}`,
          dskyUpdates: { oprErr: true }
        };
      }
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleGetCoinPrice(nounNum: number): Promise<ICommandExecutionResult> {
    
    if (nounNum >= DSKYNoun.NOUN_DYNAMIC_COIN_START && nounNum <= DSKYNoun.NOUN_DYNAMIC_COIN_END) {
      try {
        const coin = this.coinListManager.actions.getCoinByNoun(nounNum);
        if (!coin) {
          return {
            success: false,
            statusMessage: `No coin assigned to noun ${nounNum}`,
            dskyUpdates: { oprErr: true }
          };
        }

        
        const priceData = await this.dynamicCryptoService.getCoinPrice(coin.id);
        if (!priceData) {
          return {
            success: false,
            statusMessage: `Failed to fetch price for ${coin.symbol}`,
            dskyUpdates: { oprErr: true }
          };
        }

        
        this.coinListManager.actions.updateCoinPrice(coin.id, priceData);

        const priceStr = priceData.currentPrice?.toFixed(2) || '0.00';
        const changeNum = priceData.priceChange24h || 0;
        const changeStr = changeNum.toFixed(2);

        return {
          success: true,
          statusMessage: `${coin.symbol}: $${priceStr} (${changeNum >= 0 ? '+' : ''}${changeStr}%)`,
          dskyUpdates: { 
            reg1: coin.symbol,
            reg2: priceStr.slice(0, 5),
            reg3: changeStr.slice(0, 5)
          }
        };
      } catch (error) {
        return {
          success: false,
          statusMessage: `Price fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          dskyUpdates: { oprErr: true }
        };
      }
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleFlagCoin(nounNum: number): Promise<ICommandExecutionResult> {
    
    if ((nounNum >= DSKYNoun.NOUN_DYNAMIC_COIN_START && nounNum <= DSKYNoun.NOUN_DYNAMIC_COIN_END) ||
        (nounNum >= DSKYNoun.NOUN_CRYPTO_BITCOIN && nounNum <= DSKYNoun.NOUN_CRYPTO_TOP10)) {
      try {
        const coin = this.coinListManager.actions.getCoinByNoun(nounNum);
        if (!coin) {
          return {
            success: false,
            statusMessage: `No coin assigned to noun ${nounNum}`,
            dskyUpdates: { oprErr: true }
          };
        }

        
        this.coinListManager.actions.toggleCoinFlag(coin.id);
        const updatedCoin = this.coinListManager.actions.getCoinById(coin.id);
        const flagStatus = updatedCoin?.isFlagged ? 'FLAGGED' : 'UNFLAGGED';

        return {
          success: true,
          statusMessage: `${coin.symbol} ${flagStatus} for batch operations`,
          dskyUpdates: { 
            reg1: coin.symbol,
            reg2: flagStatus.slice(0, 5),
            reg3: nounNum.toString().padStart(5, '0')
          }
        };
      } catch (error) {
        return {
          success: false,
          statusMessage: `Flag operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          dskyUpdates: { oprErr: true }
        };
      }
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleBatchPrices(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_FLAGGED_COINS || nounNum === DSKYNoun.NOUN_BATCH_RESULTS) {
      try {
        const flaggedCoins = this.coinListManager.actions.getFlaggedCoins();
        
        if (flaggedCoins.length === 0) {
          return {
            success: false,
            statusMessage: 'No coins flagged for batch operation. Use V37N[coin] to flag coins.',
            dskyUpdates: { oprErr: true }
          };
        }

        
        const coinIds = flaggedCoins.map((coin: ICoinInfo) => coin.id);
        
        
        const batchResults = await this.dynamicCryptoService.getBatchPrices(coinIds);
        
        
        batchResults.forEach((result: IBatchPriceResult) => {
          if (result.success && result.price > 0) {
            this.coinListManager.actions.updateCoinPrice(result.coinId, {
              currentPrice: result.price,
              priceChange24h: result.priceChange24h,
              lastUpdated: result.timestamp
            });
          }
        });

        const successCount = batchResults.filter((r: IBatchPriceResult) => r.success).length;
        const failCount = batchResults.length - successCount;

        return {
          success: true,
          statusMessage: `Batch complete: ${successCount} success, ${failCount} failed`,
          dskyUpdates: { 
            reg1: successCount.toString().padStart(5, '0'),
            reg2: failCount.toString().padStart(5, '0'),
            reg3: 'DONE'
          }
        };
      } catch (error) {
        return {
          success: false,
          statusMessage: `Batch operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          dskyUpdates: { oprErr: true }
        };
      }
    }
    return this.invalidNounResult(nounNum);
  }

  private async handleClearFlags(nounNum: number): Promise<ICommandExecutionResult> {
    if (nounNum === DSKYNoun.NOUN_COIN_FLAGS || nounNum === DSKYNoun.NOUN_FLAGGED_COINS) {
      try {
        const flaggedCount = this.coinListManager.state.flaggedCoins.size;
        
        
        this.coinListManager.actions.clearAllFlags();

        return {
          success: true,
          statusMessage: `${flaggedCount} coin flags cleared successfully`,
          dskyUpdates: { 
            reg1: flaggedCount.toString().padStart(5, '0'),
            reg2: 'CLEAR',
            reg3: 'ED'
          }
        };
      } catch (error) {
        return {
          success: false,
          statusMessage: `Failed to clear flags: ${error instanceof Error ? error.message : 'Unknown error'}`,
          dskyUpdates: { oprErr: true }
        };
      }
    }
    return this.invalidNounResult(nounNum);
  }

  private invalidNounResult(nounNum: number): ICommandExecutionResult {
    return {
      success: false,
      statusMessage: `Invalid noun ${nounNum} for this verb`,
      dskyUpdates: { oprErr: true }
    };
  }
}