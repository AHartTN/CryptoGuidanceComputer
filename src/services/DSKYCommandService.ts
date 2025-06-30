import { IDSKYCommand } from '../interfaces/IDSKYCore';
import { DSKYState } from '../models/DSKYModels';
import { CryptoPrice } from '../models/CryptoModels';

export abstract class BaseDSKYCommand implements IDSKYCommand {
  constructor(
    public verb: string,
    public noun: string,
    protected dskyState: DSKYState,
    protected updateState: (updater: (prev: DSKYState) => DSKYState) => void
  ) {}

  abstract execute(): Promise<void>;

  protected setCompActy(active: boolean): void {
    this.updateState(prev => ({ ...prev, compActy: active }));
  }

  protected setError(hasError: boolean): void {
    this.updateState(prev => ({ ...prev, oprErr: hasError }));
    if (hasError) {
      setTimeout(() => this.updateState(prev => ({ ...prev, oprErr: false })), 2000);
    }
  }

  protected updateRegisters(reg1: string, reg2: string, reg3: string): void {
    this.updateState(prev => ({
      ...prev,
      reg1: reg1.padStart(5, '0'),
      reg2: reg2.padStart(5, '0'),
      reg3: reg3.padStart(5, '0'),
      compActy: false
    }));
  }
}

export class V12CryptoPriceCommand extends BaseDSKYCommand {
  constructor(
    verb: string,
    noun: string,
    dskyState: DSKYState,
    updateState: (updater: (prev: DSKYState) => DSKYState) => void,
    private cryptoPrices: CryptoPrice[],
    private fetchPrices: () => Promise<void>
  ) {
    super(verb, noun, dskyState, updateState);
  }

  async execute(): Promise<void> {
    this.setCompActy(true);
    
    try {
      await this.fetchPrices();
      const nounNum = parseInt(this.noun);
      
      if (nounNum >= 1 && nounNum <= 5 && this.cryptoPrices.length > 0) {
        const crypto = this.cryptoPrices[nounNum - 1];
        if (crypto) {
          this.updateRegisters(
            crypto.getFormattedPrice(),
            crypto.getFormattedChange(),
            crypto.getSymbolCode()
          );
        }
      } else {
        this.setError(true);
      }
    } catch (error) {
      console.error('V12 Command failed:', error);
      this.setError(true);
    }
  }
}

export class V21WalletCommand extends BaseDSKYCommand {
  constructor(
    verb: string,
    noun: string,
    dskyState: DSKYState,
    updateState: (updater: (prev: DSKYState) => DSKYState) => void,
    private connected: boolean,
    private account: string,
    private balance: string,
    private connectWallet: () => Promise<void>
  ) {
    super(verb, noun, dskyState, updateState);
  }

  async execute(): Promise<void> {
    this.setCompActy(true);
    
    try {
      if (this.connected) {
        const shortAddr = this.account.slice(-5).toUpperCase();
        const balanceInt = Math.floor(parseFloat(this.balance) * 10000);
        const balanceStr = balanceInt.toString();
        
        this.updateRegisters(shortAddr, balanceStr, '00001');
      } else {
        await this.connectWallet();
      }
    } catch (error) {
      console.error('V21 Command failed:', error);
      this.setError(true);
    }
  }
}

export class V31SystemCommand extends BaseDSKYCommand {
  constructor(
    verb: string,
    noun: string,
    dskyState: DSKYState,
    updateState: (updater: (prev: DSKYState) => DSKYState) => void,
    private connected: boolean,
    private cryptoCount: number
  ) {
    super(verb, noun, dskyState, updateState);
  }

  async execute(): Promise<void> {
    this.setCompActy(true);
    
    try {
      switch (this.noun) {
        case '01':
          // System status
          this.updateRegisters(
            this.connected ? '00001' : '00000',
            this.cryptoCount.toString(),
            Date.now().toString().slice(-5)
          );
          break;
        case '02':
          // Reset system
          this.dskyState.reset();
          this.updateState(prev => ({ ...this.dskyState }));
          break;
        default:
          this.setError(true);
      }
    } catch (error) {
      console.error('V31 Command failed:', error);
      this.setError(true);
    }
  }
}
