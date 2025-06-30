import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import '../styles/dsky.css';

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

// Extend window type for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: string[] }) => Promise<string[]>;
      isMetaMask?: boolean;
    };
  }
}

// Fallback crypto data for demo purposes
const FALLBACK_CRYPTO_PRICES: CryptoPrice[] = [
  { name: 'Bitcoin', symbol: 'BTC', price: 45000, change24h: 2.5 },
  { name: 'Ethereum', symbol: 'ETH', price: 3200, change24h: -1.2 },
  { name: 'Chainlink', symbol: 'LINK', price: 25, change24h: 5.8 },
  { name: 'Polygon', symbol: 'MATIC', price: 0.85, change24h: -3.1 },
  { name: 'Uniswap', symbol: 'UNI', price: 12, change24h: 1.9 }
];

const DSKY: React.FC = () => {
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
  const [account, setAccount] = useState<string>('');  const [balance, setBalance] = useState<string>('0');
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
        
        console.log(`📱 Accounts received:`, accounts.map(acc => `${acc.slice(0, 6)}...${acc.slice(-4)}`));
        
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
            console.log(`📋 Wallet info displayed in registers`);          } catch (balanceError: unknown) {
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
      }    } catch (error: unknown) {
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
      console.log(`✅ Crypto prices loaded successfully`);    } catch (error: unknown) {
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
  // Execute DSKY commands
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
      // V12 - Display crypto prices
      if (verb === '12') {
        console.log(`💰 V12 Crypto Price Command - Noun: ${noun}`);
        await fetchCryptoPrices();
        const nounNum = parseInt(noun);
        console.log(`🔍 Parsed noun number: ${nounNum}, Available cryptos: ${cryptoPrices.length}`);
        
        if (nounNum >= 1 && nounNum <= 5 && cryptoPrices.length > 0) {
          const crypto = cryptoPrices[nounNum - 1] || FALLBACK_CRYPTO_PRICES[nounNum - 1];
          console.log(`📈 Selected crypto:`, crypto);
          
          if (crypto) {
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
          } else {
            console.error(`❌ V12 Command failed: No crypto data found for noun ${noun}`);
            setState(prev => ({ ...prev, oprErr: true, compActy: false }));
            setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
          }
        } else {
          console.error(`❌ V12 Command failed: Invalid noun ${noun} or no crypto data available`);
          setState(prev => ({ ...prev, oprErr: true, compActy: false }));
          setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
        }
      }
      
      // V21 - Display account information
      else if (verb === '21') {
        console.log(`🔐 V21 Wallet Command - Noun: ${noun}, Connected: ${connected}`);
        
        if (connected && account) {
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
        } else {
          console.log(`🔗 Wallet not connected, attempting to connect...`);
          await connectWallet();
          console.log(`✅ V21 Command completed - wallet connection attempted`);
        }
      }      
      // V31 - System commands
      else if (verb === '31') {
        console.log(`⚙️ V31 System Command - Noun: ${noun}`);
        
        if (noun === '01') {
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
        } else if (noun === '02') {
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
        } else {
          console.error(`❌ V31 Command failed: Invalid noun ${noun} (valid: 01, 02)`);
          setState(prev => ({ ...prev, oprErr: true, compActy: false }));
          setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
        }
      }
      
      else {
        console.error(`❌ Command failed: Unknown verb ${verb} (valid: 12, 21, 31)`);
        setState(prev => ({ ...prev, oprErr: true, compActy: false }));
        setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
      }    } catch (error: unknown) {
      console.error(`💥 Command execution failed for V${verb}N${noun}:`, error);
      setState(prev => ({ ...prev, oprErr: true, compActy: false }));
      setTimeout(() => setState(prev => ({ ...prev, oprErr: false })), 2000);
    }
  }, [connected, account, balance, cryptoPrices, connectWallet, fetchCryptoPrices]);
  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    console.log(`⌨️ Key pressed: ${key}, Input mode: ${inputMode}, Current input: "${currentInput}"`);
    
    if (key === 'VERB') {
      console.log(`🔤 VERB mode activated`);
      setInputMode('verb');
      setCurrentInput('');
      setState(prev => ({ ...prev, keyRel: true }));
    } else if (key === 'NOUN') {
      console.log(`🔢 NOUN mode activated`);
      setInputMode('noun');
      setCurrentInput('');
      setState(prev => ({ ...prev, keyRel: true }));
    } else if (key === 'ENTR') {
      console.log(`✅ ENTER pressed`);
      if (inputMode === 'verb' && currentInput.length === 2) {
        console.log(`📝 Setting VERB to: ${currentInput}`);
        setState(prev => ({ ...prev, verb: currentInput, keyRel: false }));
        setInputMode(null);
        setCurrentInput('');
      } else if (inputMode === 'noun' && currentInput.length === 2) {
        console.log(`📝 Setting NOUN to: ${currentInput}, executing V${state.verb}N${currentInput}`);
        setState(prev => ({ ...prev, noun: currentInput, keyRel: false }));
        executeCommand(state.verb, currentInput);
        setInputMode(null);
        setCurrentInput('');
      } else {
        console.warn(`⚠️ ENTER pressed but invalid state: mode=${inputMode}, input="${currentInput}", length=${currentInput.length}`);
      }
    } else if (key === 'CLR') {
      console.log(`🧹 CLEAR pressed - resetting input`);
      setInputMode(null);
      setCurrentInput('');
      setState(prev => ({ ...prev, keyRel: false }));
    } else if (key === 'RSET') {
      console.log(`🔄 RESET pressed - executing V31N02`);
      executeCommand('31', '02');
    } else if (/^\d$/.test(key) && currentInput.length < 2) {
      const newInput = currentInput + key;
      console.log(`🔢 Numeric input: ${key}, new input: "${newInput}"`);
      setCurrentInput(newInput);
    } else {
      console.warn(`⚠️ Invalid key or input too long: key=${key}, current="${currentInput}", mode=${inputMode}`);
    }
  }, [inputMode, currentInput, state.verb, executeCommand]);  // Initialize crypto prices on mount
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
    
    initializeCrypto();
  }, []); // Empty dependency array to run only once

  return (
    <div className="dsky-container">
      <div className="dsky-panel">
        {/* Warning Lights */}
        <div className="warning-lights">
          <div className={`warning-light ${state.compActy ? 'active' : ''}`}>COMP ACTY</div>
          <div className={`warning-light ${state.uplinkActy ? 'active' : ''}`}>UPLINK ACTY</div>
          <div className={`warning-light ${state.noAtt ? 'active' : ''}`}>NO ATT</div>
          <div className={`warning-light ${state.stby ? 'active' : ''}`}>STBY</div>
          <div className={`warning-light ${state.keyRel ? 'active' : ''}`}>KEY REL</div>
          <div className={`warning-light ${state.oprErr ? 'active' : ''}`}>OPR ERR</div>
          <div className={`warning-light ${state.temp ? 'active' : ''}`}>TEMP</div>
          <div className={`warning-light ${state.gimbalLock ? 'active' : ''}`}>GIMBAL LOCK</div>
          <div className={`warning-light ${state.restart ? 'active' : ''}`}>RESTART</div>
        </div>

        {/* Displays */}
        <div className="displays">
          <div className="display-row">
            <div className="display-label">PROG</div>
            <div className="display-value">{state.prog}</div>
          </div>
          <div className="display-row">
            <div className="display-label">VERB</div>
            <div className="display-value">{inputMode === 'verb' ? currentInput.padEnd(2, '_') : state.verb}</div>
          </div>
          <div className="display-row">
            <div className="display-label">NOUN</div>
            <div className="display-value">{inputMode === 'noun' ? currentInput.padEnd(2, '_') : state.noun}</div>
          </div>
          <div className="register-displays">
            <div className="register">
              <div className="register-label">R1</div>
              <div className="register-value">{state.reg1}</div>
            </div>
            <div className="register">
              <div className="register-label">R2</div>
              <div className="register-value">{state.reg2}</div>
            </div>
            <div className="register">
              <div className="register-label">R3</div>
              <div className="register-value">{state.reg3}</div>
            </div>
          </div>
        </div>

        {/* Keyboard */}
        <div className="keyboard">
          <div className="key-row">
            <button className="key verb-key" onClick={() => handleKeyPress('VERB')}>VERB</button>
            <button className="key noun-key" onClick={() => handleKeyPress('NOUN')}>NOUN</button>
          </div>
          <div className="key-row">
            <button className="key" onClick={() => handleKeyPress('1')}>1</button>
            <button className="key" onClick={() => handleKeyPress('2')}>2</button>
            <button className="key" onClick={() => handleKeyPress('3')}>3</button>
          </div>
          <div className="key-row">
            <button className="key" onClick={() => handleKeyPress('4')}>4</button>
            <button className="key" onClick={() => handleKeyPress('5')}>5</button>
            <button className="key" onClick={() => handleKeyPress('6')}>6</button>
          </div>
          <div className="key-row">
            <button className="key" onClick={() => handleKeyPress('7')}>7</button>
            <button className="key" onClick={() => handleKeyPress('8')}>8</button>
            <button className="key" onClick={() => handleKeyPress('9')}>9</button>
          </div>
          <div className="key-row">
            <button className="key" onClick={() => handleKeyPress('CLR')}>CLR</button>
            <button className="key" onClick={() => handleKeyPress('0')}>0</button>
            <button className="key" onClick={() => handleKeyPress('ENTR')}>ENTR</button>
          </div>
          <div className="key-row">
            <button className="key reset-key" onClick={() => handleKeyPress('RSET')}>RSET</button>
          </div>
        </div>        {/* Status Display */}
        <div className="status-display">
          <div className="status-row">
            <span>Wallet: {connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {connected && (
            <div className="status-row">
              <span>Account: {account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          )}
          <div className="status-row">
            <span>Commands: V12N01-05 (Crypto), V21 (Account), V31N01-02 (System)</span>
          </div>
          
          {/* Debug Panel */}
          <div className="debug-panel">
            <div className="debug-title">🔍 DEBUG STATUS</div>
            <div className="debug-row">
              <span className="debug-label">Input Mode:</span>
              <span className="debug-value">{inputMode || 'None'}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Current Input:</span>
              <span className="debug-value">"{currentInput}"</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Last Verb:</span>
              <span className="debug-value">{state.verb}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Last Noun:</span>
              <span className="debug-value">{state.noun}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Crypto Count:</span>
              <span className="debug-value">{cryptoPrices.length}</span>
            </div>
            <div className="debug-row">
              <span className="debug-label">Balance:</span>
              <span className="debug-value">{balance} ETH</span>
            </div>
            <div className="debug-info">
              💡 Check browser console (F12) for detailed logs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSKY;
