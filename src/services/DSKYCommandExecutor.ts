// DSKY Command Executor Service following SOLID principles

import { DSKYVerb, DSKYNoun, isValidVerbNounCombination } from '../enums/DSKYEnums';
import { UnifiedWeb3Service } from './UnifiedWeb3Service';
import { CryptoPriceService } from './CryptoPriceService';
import type { IWalletConnection, IBlockchainData, IDSKYState, IWeb3State } from '../types';
import { STATUS_MESSAGES } from '../constants';

export interface ICommandExecutionResult {
  success: boolean;
  statusMessage: string;
  dskyUpdates?: Partial<IDSKYState>;
  web3Updates?: Partial<IWeb3State>;
}

export class DSKYCommandExecutor {
  private cryptoService: CryptoPriceService;

  constructor(private web3Service: UnifiedWeb3Service) {
    this.cryptoService = CryptoPriceService.create();
  }  async execute(
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
        return this.handleWalletInfo(nounNum, currentWeb3State);      case DSKYVerb.VERB_HEALTH_CHECK:
        return await this.handleHealthCheck(nounNum);

      case DSKYVerb.VERB_CRYPTO_PRICES:
        return await this.handleCryptoPrice(nounNum);

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
      const gasInGwei = typeof gasData === 'object' && gasData && 'standard' in gasData 
        ? parseFloat(gasData.standard as string) / 1e9
        : 0;
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.GAS_PRICE(gasInGwei),
        dskyUpdates: { reg1: Math.round(gasInGwei).toString().slice(0, 5) }
      };
    }
    return this.invalidNounResult(nounNum);
  }

  private handleWalletInfo(nounNum: number, currentWeb3State: IWeb3State): ICommandExecutionResult {
    if (nounNum === DSKYNoun.NOUN_WALLET_ADDRESS && currentWeb3State.account) {
      return {
        success: true,
        statusMessage: STATUS_MESSAGES.WALLET_MONITORING(currentWeb3State.account),
        dskyUpdates: { 
          reg1: currentWeb3State.account.slice(2, 7),
          reg2: currentWeb3State.account.slice(7, 12),
          reg3: currentWeb3State.account.slice(-5)
        }
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
      
      // Map noun numbers to crypto symbols
      switch (nounNum) {
        case DSKYNoun.NOUN_CRYPTO_BITCOIN:
        case DSKYNoun.NOUN_CRYPTO_01:
          symbol = 'BTC';
          break;
        case DSKYNoun.NOUN_CRYPTO_ETHEREUM:
        case DSKYNoun.NOUN_CRYPTO_02:
          symbol = 'ETH';
          break;
        case DSKYNoun.NOUN_CRYPTO_CARDANO:
        case DSKYNoun.NOUN_CRYPTO_05:
          symbol = 'ADA';
          break;
        case DSKYNoun.NOUN_CRYPTO_POLYGON:
          symbol = 'MATIC';
          break;
        case DSKYNoun.NOUN_CRYPTO_CHAINLINK:
          symbol = 'LINK';
          break;
        default:
          return this.invalidNounResult(nounNum);
      }

      const cryptoData = await this.cryptoService.getCryptoPrice(symbol);
      const priceDisplay = cryptoData.price > 1000 
        ? Math.round(cryptoData.price).toString().slice(0, 5)
        : cryptoData.price.toFixed(2).slice(0, 5);

      return {
        success: true,
        statusMessage: STATUS_MESSAGES.CRYPTO_PRICE(cryptoData.symbol, cryptoData.price),
        dskyUpdates: { 
          reg1: cryptoData.symbol,
          reg2: priceDisplay,
          reg3: cryptoData.change24h.toFixed(1).slice(0, 5)
        }
      };
    } catch (error) {
      return {
        success: false,
        statusMessage: `Failed to fetch crypto price: ${(error as Error).message}`,
        dskyUpdates: { oprErr: true }
      };
    }
  }

  private invalidNounResult(nounNum: number): ICommandExecutionResult {
    return {
      success: false,
      statusMessage: `Invalid noun ${nounNum} for this verb`,
      dskyUpdates: { oprErr: true }
    };
  }
}
