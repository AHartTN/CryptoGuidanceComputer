import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import '../styles/dsky-authentic.css';
import { 
  DSKYVerb, 
  DSKYNoun, 
  DSKYKeyType, 
  getKeyType,
  getVerbEnum,
  getNounEnum
} from '../enums/DSKYEnums';

// Import modular components
import DSKYHeader from './DSKYHeader';
import DSKYWarningLights from './DSKYWarningLights';
import DSKYDisplayArea from './DSKYDisplayArea';
import DSKYKeypad from './DSKYKeypad';
import DSKYStatus from './DSKYStatus';

// Types
interface DSKYState {
  verb: string;
  noun: string;
  prog: string;
  reg1: string;
  reg2: string;
  reg3: string;
  compActy: boolean;
  uplinkActy: boolean;
  noAtt: boolean;
  stby: boolean;
  keyRel: boolean;
  oprErr: boolean;
  temp: boolean;
  gimbalLock: boolean;
  restart: boolean;
}

interface CryptoPrice {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

// Fallback crypto data for demo purposes
const FALLBACK_CRYPTO_PRICES: CryptoPrice[] = [
  { name: 'Bitcoin', symbol: 'BTC', price: 45000, change24h: 2.5 },
  { name: 'Ethereum', symbol: 'ETH', price: 3200, change24h: -1.2 },
  { name: 'Chainlink', symbol: 'LINK', price: 25, change24h: 5.8 },
  { name: 'Polygon', symbol: 'MATIC', price: 0.85, change24h: -3.1 },
  { name: 'Uniswap', symbol: 'UNI', price: 12, change24h: 1.9 }
];

const DSKYModular: React.FC = () => {
  const [state, setState] = useState<DSKYState>({
    verb: '00',
    noun: '00',
    prog: '11',
    reg1: '00000',
    reg2: '00000',
    reg3: '00000',
    compActy: false,
    uplinkActy: false,
    noAtt: false,
    stby: false,
    keyRel: false,
    oprErr: false,
    temp: false,
    gimbalLock: false,
    restart: false
  });

  const [currentInput, setCurrentInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'verb' | 'noun' | 'data' | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);

  // MetaMask connection
  const connectWallet = useCallback(async () => {
    console.log(`🔗 Attempting wallet connection...`);
    
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log(`🦊 MetaMask detected - version: ${window.ethereum.isMetaMask ? 'MetaMask' : 'Unknown'}`);
        setState(prev => ({ ...prev, uplinkActy: true }));
        
        // Add delay to allow MetaMask extension to fully initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`⏱️ MetaMask initialization delay completed`);
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        console.log(`📱 Accounts received:`, accounts.map((acc: string) => `${acc.slice(0, 6)}...${acc.slice(-4)}`));
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          console.log(`✅ Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          
          // Get balance with additional error handling
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(accounts[0]);
            const balanceEth = ethers.formatEther(balance);
            setBalance(balanceEth);
            console.log(`💰 Balance retrieved: ${balanceEth} ETH`);
            
            setState(prev => ({ 
              ...prev, 
              uplinkActy: false,
              compActy: true,
              reg1: accounts[0].slice(-5).toUpperCase(),
              reg2: parseFloat(balanceEth).toFixed(4).replace('.', '').padStart(5, '0'),
              reg3: '00001'
            }));
            console.log(`📋 Wallet info displayed in registers`);
          } catch (balanceError: unknown) {
            console.warn(`⚠️ Balance retrieval failed, using fallback:`, balanceError);
            setBalance('0.0000');
            setState(prev => ({ 
              ...prev, 
              uplinkActy: false,
              compActy: true,
              reg1: accounts[0].slice(-5).toUpperCase(),
              reg2: '00000',
              reg3: '00001'
            }));
          }
        } else {
          console.error(`❌ No accounts returned from MetaMask`);
          setState(prev => ({ ...prev, oprErr: true, uplinkActy: false }));
          setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
        }
      } else {
        console.error(`❌ MetaMask not detected - window.ethereum is undefined`);
        setState(prev => ({ ...prev, oprErr: true, uplinkActy: false }));
        setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
      }
    } catch (error: unknown) {
      console.error('💥 Wallet connection failed:', error);
      
      // Enhanced error logging for MetaMask extension issues
      if (error instanceof Error) {
        console.error(`💥 Error name: ${error.name}`);
        console.error(`💥 Error message: ${error.message}`);
        console.error(`💥 Error stack:`, error.stack);
        
        // Check for specific MetaMask errors
        if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
          console.log(`👤 User rejected the connection request`);
        } else if (error.message?.includes('Already processing')) {
          console.log(`🔄 MetaMask is already processing a request - retrying in 2 seconds`);
          setTimeout(() => connectWallet(), 2000);
          return;
        } else {
          console.log(`🔧 Unknown MetaMask error - this may be an extension issue`);
        }
      } else {
        console.error(`💥 Non-Error object thrown:`, error);
      }
      
      setState(prev => ({ ...prev, oprErr: true, uplinkActy: false }));
      setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
    }
  }, []);

  // Fetch crypto prices
  const fetchCryptoPrices = useCallback(async () => {
    console.log(`💰 Fetching crypto prices...`);
    try {
      setState(prev => ({ ...prev, compActy: true }));
      
      // For demo purposes, we'll use fallback data
      console.log(`📊 Using fallback crypto data: ${FALLBACK_CRYPTO_PRICES.length} items`);
      setCryptoPrices(FALLBACK_CRYPTO_PRICES);
      
      setState(prev => ({ 
        ...prev, 
        compActy: false,
        temp: false
      }));
      console.log(`✅ Crypto prices loaded successfully`);
    } catch (error: unknown) {
      console.error('💥 Failed to fetch crypto prices:', error);
      setCryptoPrices(FALLBACK_CRYPTO_PRICES);
      setState(prev => ({ 
        ...prev, 
        compActy: false,
        temp: true
      }));
      setTimeout(() => setState(prev => ({ ...prev, temp: false })), 3000);
    }
  }, []);

  // Handle V12 crypto display commands
  const handleCryptoDisplayCommand = useCallback(async (noun: string, nounEnum: number) => {
    console.log(`💰 V12 Crypto Price Command - Noun: ${noun}`);
    await fetchCryptoPrices();
    
    switch (nounEnum) {
      case DSKYNoun.NOUN_CRYPTO_01:
      case DSKYNoun.NOUN_CRYPTO_02:
      case DSKYNoun.NOUN_CRYPTO_03:
      case DSKYNoun.NOUN_CRYPTO_04:
      case DSKYNoun.NOUN_CRYPTO_05: {
        const cryptoIndex = nounEnum - 1; // Convert to 0-based index
        const crypto = cryptoPrices[cryptoIndex] || FALLBACK_CRYPTO_PRICES[cryptoIndex];
        
        switch (true) {
          case crypto !== undefined: {
            const priceStr = Math.floor(crypto.price).toString().padStart(5, '0');
            const changeStr = Math.abs(crypto.change24h * 100).toFixed(0).padStart(5, '0');
            const symbolCode = crypto.symbol.charCodeAt(0).toString().padStart(5, '0');
            
            console.log(`📋 Display values: Price=${priceStr}, Change=${changeStr}, Symbol=${symbolCode}`);
            
            setState(prev => ({
              ...prev,
              reg1: priceStr,
              reg2: changeStr,
              reg3: symbolCode,
              compActy: false
            }));
            console.log(`✅ V12 Command completed successfully`);
            break;
          }
            
          default: {
            console.error(`❌ V12 Command failed: No crypto data found for noun ${noun}`);
            setState(prev => ({ ...prev, oprErr: true, compActy: false }));
            setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
            break;
          }
        }
        break;
      }
        
      default: {
        console.error(`❌ V12 Command failed: Invalid noun ${noun} (valid: 01-05)`);
        setState(prev => ({ ...prev, oprErr: true, compActy: false }));
        setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
        break;
      }
    }
  }, [cryptoPrices, fetchCryptoPrices]);

  // Handle V21 wallet info commands
  const handleWalletInfoCommand = useCallback(async (noun: string) => {
    console.log(`🔐 V21 Wallet Command - Noun: ${noun}, Connected: ${connected}`);
    
    switch (connected) {
      case true: {
        switch (!!account) {
          case true: {
            console.log(`📱 Wallet connected, displaying account info`);
            const shortAddr = account.slice(-5).toUpperCase();
            const balanceInt = Math.floor(parseFloat(balance) * 10000);
            const balanceStr = balanceInt.toString().padStart(5, '0');
            
            console.log(`📋 Wallet display values: Address=${shortAddr}, Balance=${balanceStr}, Status=00001`);
            
            setState(prev => ({
              ...prev,
              reg1: shortAddr,
              reg2: balanceStr,
              reg3: '00001',
              compActy: false
            }));
            console.log(`✅ V21 Command completed successfully`);
            break;
          }
            
          default: {
            console.log(`🔗 Account not available, attempting to connect...`);
            await connectWallet();
            break;
          }
        }
        break;
      }
        
      default: {
        console.log(`🔗 Wallet not connected, attempting to connect...`);
        await connectWallet();
        console.log(`✅ V21 Command completed - wallet connection attempted`);
        break;
      }
    }
  }, [connected, account, balance, connectWallet]);

  // Handle V31 system commands
  const handleSystemCommand = useCallback(async (noun: string, nounEnum: number) => {
    console.log(`⚙️ V31 System Command - Noun: ${noun}`);
    
    switch (nounEnum) {
      case DSKYNoun.NOUN_SYSTEM_STATUS: {
        console.log(`📊 System status requested`);
        const statusConnected = connected ? '00001' : '00000';
        const cryptoCountStr = cryptoPrices.length.toString().padStart(5, '0');
        const timestampStr = Date.now().toString().slice(-5);
        
        console.log(`📋 System status values: Connected=${statusConnected}, CryptoCount=${cryptoCountStr}, Timestamp=${timestampStr}`);
        
        setState(prev => ({
          ...prev,
          reg1: statusConnected,
          reg2: cryptoCountStr,
          reg3: timestampStr,
          compActy: false
        }));
        console.log(`✅ V31N01 System status completed successfully`);
        break;
      }
        
      case DSKYNoun.NOUN_SYSTEM_RESET: {
        console.log(`🔄 System reset requested`);
        setState(prev => ({
          ...prev,
          verb: '00',
          noun: '00',
          reg1: '00000',
          reg2: '00000',
          reg3: '00000',
          compActy: false,
          uplinkActy: false,
          noAtt: false,
          stby: false,
          keyRel: false,
          oprErr: false,
          temp: false,
          gimbalLock: false,
          restart: false
        }));
        console.log(`✅ V31N02 System reset completed successfully`);
        break;
      }
        
      default: {
        console.error(`❌ V31 Command failed: Invalid noun ${noun} (valid: 01, 02)`);
        setState(prev => ({ ...prev, oprErr: true, compActy: false }));
        setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
        break;
      }
    }
  }, [connected, cryptoPrices.length]);

  // Execute DSKY commands with switch statements
  const executeCommand = useCallback(async (verb: string, noun: string) => {
    console.log(`🚀 DSKY COMMAND EXECUTED: V${verb}N${noun}`);
    console.log(`📊 Current State:`, {
      connected,
      account: account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'None',
      balance,
      cryptoCount: cryptoPrices.length,
      currentTime: new Date().toISOString()
    });
    
    setState(prev => ({ ...prev, compActy: true }));
    
    try {
      const verbEnum = getVerbEnum(verb);
      const nounEnum = getNounEnum(noun, verbEnum);
      
      switch (verbEnum) {
        case DSKYVerb.VERB_DISPLAY_CRYPTO: {
          await handleCryptoDisplayCommand(noun, nounEnum);
          break;
        }
          
        case DSKYVerb.VERB_WALLET_INFO: {
          await handleWalletInfoCommand(noun);
          break;
        }
          
        case DSKYVerb.VERB_SYSTEM_CMD: {
          await handleSystemCommand(noun, nounEnum);
          break;
        }
          
        default: {
          console.error(`❌ Command failed: Unknown verb ${verb} (valid: 12, 21, 31)`);
          setState(prev => ({ ...prev, oprErr: true, compActy: false }));
          setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
          break;
        }
      }    } catch (error: unknown) {
      console.error(`💥 Command execution failed for V${verb}N${noun}:`, error);
      setState(prev => ({ ...prev, oprErr: true, compActy: false }));
      setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
    }
  }, [handleCryptoDisplayCommand, handleWalletInfoCommand, handleSystemCommand, connected, account, balance, cryptoPrices.length]);

  // Handle key press with shift register functionality using switch statements
  const handleKeyPress = useCallback((key: string) => {
    console.log(`⌨️ Key pressed: ${key}, Input mode: ${inputMode}, Current input: "${currentInput}"`);
    
    const keyType = getKeyType(key);
    
    switch (keyType) {
      case DSKYKeyType.KEY_VERB: {
        console.log(`🔤 VERB mode activated`);
        setInputMode('verb');
        setCurrentInput(state.verb); // Use current stored verb value
        setState(prev => ({ ...prev, keyRel: true }));
        break;
      }
        
      case DSKYKeyType.KEY_NOUN: {
        console.log(`🔢 NOUN mode activated`);
        setInputMode('noun');
        setCurrentInput(state.noun); // Use current stored noun value
        setState(prev => ({ ...prev, keyRel: true }));
        break;
      }
        
      case DSKYKeyType.KEY_ENTER: {
        console.log(`✅ ENTER pressed`);
        switch (inputMode) {
          case 'verb': {
            console.log(`📝 Setting VERB to: ${currentInput}`);
            setState(prev => ({ ...prev, verb: currentInput, keyRel: false }));
            setInputMode(null);
            setCurrentInput('');
            break;
          }
            
          case 'noun': {
            console.log(`📝 Setting NOUN to: ${currentInput}, executing V${state.verb}N${currentInput}`);
            setState(prev => ({ ...prev, noun: currentInput, keyRel: false }));
            executeCommand(state.verb, currentInput);
            setInputMode(null);
            setCurrentInput('');
            break;
          }
            
          default: {
            console.warn(`⚠️ ENTER pressed but no input mode active`);
            break;
          }
        }
        break;
      }
        
      case DSKYKeyType.KEY_CLEAR: {
        console.log(`🧹 CLEAR pressed - resetting current input to 00`);
        setCurrentInput('00');
        setState(prev => ({ ...prev, keyRel: false }));
        break;
      }
        
      case DSKYKeyType.KEY_RESET: {
        console.log(`🔄 RESET pressed - executing V31N02`);
        executeCommand('31', '02');
        break;
      }
        
      case DSKYKeyType.KEY_NUMERIC: {
        switch (inputMode) {
          case 'verb':
          case 'noun': {
            // Shift register functionality: shift left and add new digit
            const newInput = (currentInput.slice(1) + key).padStart(2, '0');
            console.log(`🔢 Shift register: ${currentInput} + ${key} = ${newInput}`);
            setCurrentInput(newInput);
            break;
          }
            
          default: {
            console.warn(`⚠️ Numeric input ${key} ignored - no input mode active`);
            break;
          }
        }
        break;
      }
        
      default: {
        console.warn(`⚠️ Invalid key: ${key}`);
        break;
      }
    }
  }, [inputMode, currentInput, state.verb, state.noun, executeCommand]);

  // Initialize crypto prices on mount
  useEffect(() => {
    console.log(`🚀 DSKY Component mounted - initializing crypto prices`);
    
    // Initialize crypto prices directly
    const initializeCrypto = async () => {
      console.log(`💰 Fetching crypto prices...`);
      try {
        setState(prev => ({ ...prev, compActy: true }));
        
        // For demo purposes, we'll use fallback data
        console.log(`📊 Using fallback crypto data: ${FALLBACK_CRYPTO_PRICES.length} items`);
        setCryptoPrices(FALLBACK_CRYPTO_PRICES);
        
        setState(prev => ({ 
          ...prev, 
          compActy: false,
          temp: false
        }));
        console.log(`✅ Crypto prices loaded successfully`);
      } catch (error: unknown) {
        console.error('💥 Failed to fetch crypto prices:', error);
        setCryptoPrices(FALLBACK_CRYPTO_PRICES);
        setState(prev => ({ 
          ...prev, 
          compActy: false,
          temp: true
        }));
        setTimeout(() => setState(prev => ({ ...prev, temp: false })), 3000);
      }
    };
    
    initializeCrypto();  }, []); // Empty dependency array to run only once
    return (
    <div className="dsky-container">
      <div className="dsky-main">
        <DSKYHeader />
        <DSKYWarningLights lights={{
          compActy: state.compActy,
          uplinkActy: state.uplinkActy,
          noAtt: state.noAtt,
          stby: state.stby,
          keyRel: state.keyRel,
          oprErr: state.oprErr,
          temp: state.temp,
          gimbalLock: state.gimbalLock,
          restart: state.restart
        }} />
        <DSKYDisplayArea 
          display={{
            prog: state.prog,
            verb: state.verb,
            noun: state.noun,
            reg1: state.reg1,
            reg2: state.reg2,
            reg3: state.reg3
          }}
          inputMode={inputMode}
          currentInput={currentInput}
        />
        <DSKYKeypad onKeyPress={handleKeyPress} />
        <DSKYStatus 
          connected={connected}
          account={account}
          balance={balance}
          inputMode={inputMode}
          verb={state.verb}
          noun={state.noun}
          cryptoCount={cryptoPrices.length}
        />
      </div>
    </div>
  );
};

export default DSKYModular;
