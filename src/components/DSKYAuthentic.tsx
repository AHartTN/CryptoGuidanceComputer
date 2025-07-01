import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/dsky-authentic.css';
import { UnifiedWeb3Service } from '../services/UnifiedWeb3Service';
import { DSKYVerb, DSKYNoun, isValidVerbNounCombination } from '../enums/DSKYEnums';
import { IWalletConnection, IBlockchainData } from '../interfaces/IWeb3Operations';

// DSKY State Interface
interface DSKYState {
  verb: string;
  noun: string;
  prog: string;
  reg1: string;
  reg2: string;
  reg3: string;  // Status indicators
  compActy: boolean;
  uplinkActy: boolean;
  noAtt: boolean;
  stby: boolean;
  keyRel: boolean;
  oprErr: boolean;
  temp: boolean;
  gimbalLock: boolean;
  restart: boolean;  tracker: boolean;
  alt: boolean;
  vel: boolean;
  progStatus: boolean;
  prio: boolean;
}

// Web3 Connection State
interface Web3State {
  isConnected: boolean;
  account: string | null;
  network: string | null;
  balance: string | null;
}

// Input mode type
type InputMode = 'verb' | 'noun' | 'prog' | 'data' | null;

// Status indicators data
const statusIndicators = [
  { key: 'uplinkActy' as keyof DSKYState, label: 'UPLINK ACTY' },
  { key: 'noAtt' as keyof DSKYState, label: 'NO ATT' },
  { key: 'stby' as keyof DSKYState, label: 'STBY' },
  { key: 'keyRel' as keyof DSKYState, label: 'KEY REL' },
  { key: 'oprErr' as keyof DSKYState, label: 'OPR ERR' },
  { key: 'temp' as keyof DSKYState, label: 'TEMP' },
  { key: 'gimbalLock' as keyof DSKYState, label: 'GIMBAL LOCK' },
  { key: 'restart' as keyof DSKYState, label: 'RESTART' },
  { key: 'tracker' as keyof DSKYState, label: 'TRACKER' },
  { key: 'alt' as keyof DSKYState, label: 'ALT' },
  { key: 'vel' as keyof DSKYState, label: 'VEL' },
  { key: 'progStatus' as keyof DSKYState, label: 'PROG' },
  { key: 'prio' as keyof DSKYState, label: 'PRIO DISP' }
];

const DSKYAuthentic: React.FC = () => {
  // DSKY State
  const [dskyState, setDskyState] = useState<DSKYState>({
    verb: '00',
    noun: '00',
    prog: '00',
    reg1: '00000',
    reg2: '00000',
    reg3: '00000',
    compActy: false,
    uplinkActy: false,
    noAtt: false,    stby: false,
    keyRel: false,
    oprErr: false,
    temp: false,
    gimbalLock: false,
    restart: false,    tracker: false,
    alt: false,
    vel: false,
    progStatus: false,
    prio: false
  });

  // Web3 State
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    account: null,
    network: null,
    balance: null
  });

  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Web3 Service Reference
  const web3ServiceRef = useRef<UnifiedWeb3Service | null>(null);

  // Initialize Web3 Service
  useEffect(() => {
    const initializeWeb3Service = async () => {
      try {
        const alchemyApiKey = 'demo-key';
        
        // Create the service using the factory method for Hardhat
        web3ServiceRef.current = UnifiedWeb3Service.createForHardhat(alchemyApiKey);
        
        setStatusMessages(prev => [...prev, 'Web3 service initialized']);
      } catch (error) {
        setStatusMessages(prev => [...prev, `Failed to initialize Web3: ${error}`]);
        setDskyState(prev => ({ ...prev, oprErr: true }));
      }
    };

    initializeWeb3Service();
  }, []);

  // Execute DSKY command
  const executeCommand = useCallback(async (verb: string, noun: string) => {
    if (!web3ServiceRef.current) {
      setStatusMessages(prev => [...prev, 'Web3 service not initialized']);
      setDskyState(prev => ({ ...prev, oprErr: true }));
      return;
    }

    setIsProcessing(true);
    setDskyState(prev => ({ ...prev, compActy: true, oprErr: false }));

    try {
      const verbNum = parseInt(verb, 10);
      const nounNum = parseInt(noun, 10);

      if (!isValidVerbNounCombination(verbNum, nounNum)) {
        setStatusMessages(prev => [...prev, `Invalid V${verb}N${noun} combination`]);
        setDskyState(prev => ({ ...prev, oprErr: true }));
        return;
      }

      // Execute based on verb/noun combination
      switch (verbNum) {
        case DSKYVerb.VERB_CONNECT_WALLET:
          if (nounNum === DSKYNoun.NOUN_WALLET_ADDRESS) {
            const connection = await web3ServiceRef.current.connect() as IWalletConnection;
            setWeb3State(prev => ({ ...prev, isConnected: true, account: connection.address }));
            setDskyState(prev => ({ ...prev, reg1: connection.address.slice(0, 5) }));
            setStatusMessages(prev => [...prev, `Wallet connected: ${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`]);
          }
          break;

        case DSKYVerb.VERB_SYSTEM_SHUTDOWN:
          if (nounNum === DSKYNoun.NOUN_WALLET_ADDRESS) {
            await web3ServiceRef.current.disconnect();
            setWeb3State(prev => ({ ...prev, isConnected: false, account: null, balance: null }));
            setDskyState(prev => ({ ...prev, reg1: '00000' }));
            setStatusMessages(prev => [...prev, 'Wallet disconnected']);
          }
          break;

        case DSKYVerb.VERB_WALLET_BALANCE:
          if (nounNum === DSKYNoun.NOUN_WALLET_BALANCE && web3State.account) {
            const balance = await web3ServiceRef.current.getBalance(web3State.account) as string;
            setWeb3State(prev => ({ ...prev, balance }));
            setDskyState(prev => ({ ...prev, reg1: parseFloat(balance).toFixed(2).slice(0, 5) }));
            setStatusMessages(prev => [...prev, `Balance: ${parseFloat(balance).toFixed(4)} ETH`]);
          }
          break;

        case DSKYVerb.VERB_BLOCK_CURRENT:
          if (nounNum === DSKYNoun.NOUN_CURRENT_BLOCK) {
            const blockInfo = await web3ServiceRef.current.getCurrentBlock() as { number: number };
            setDskyState(prev => ({ ...prev, reg1: blockInfo.number.toString().slice(-5) }));
            setStatusMessages(prev => [...prev, `Current block: ${blockInfo.number}`]);
          }
          break;

        case DSKYVerb.VERB_NETWORK_STATUS:
          if (nounNum === DSKYNoun.NOUN_NETWORK_NAME) {
            const networkInfo = await web3ServiceRef.current.getNetworkInfo() as IBlockchainData;
            setWeb3State(prev => ({ ...prev, network: networkInfo.networkName }));
            setDskyState(prev => ({ ...prev, reg1: networkInfo.blockNumber.toString().slice(-5) }));
            setStatusMessages(prev => [...prev, `Network: ${networkInfo.networkName} Block: ${networkInfo.blockNumber}`]);
          }
          break;

        case DSKYVerb.VERB_GAS_PRICES:
          if (nounNum === DSKYNoun.NOUN_GAS_PRICE) {
            const gasData = await web3ServiceRef.current.getGasPrice() as { standard: string };
            const gasInGwei = parseFloat(gasData.standard) / 1e9;
            setDskyState(prev => ({ ...prev, reg1: Math.round(gasInGwei).toString().slice(0, 5) }));
            setStatusMessages(prev => [...prev, `Gas price: ${gasInGwei.toFixed(2)} Gwei`]);
          }
          break;

        case DSKYVerb.VERB_WALLET_INFO:
          if (nounNum === DSKYNoun.NOUN_WALLET_ADDRESS && web3State.account) {
            setDskyState(prev => ({ 
              ...prev, 
              reg1: web3State.account!.slice(2, 7),
              reg2: web3State.account!.slice(7, 12),
              reg3: web3State.account!.slice(-5)
            }));
            setStatusMessages(prev => [...prev, `Monitoring wallet: ${web3State.account}`]);
          }
          break;

        case DSKYVerb.VERB_HEALTH_CHECK:
          if (nounNum === DSKYNoun.NOUN_SYSTEM_STATUS) {
            const healthResult = await web3ServiceRef.current.healthCheck() as boolean;
            setDskyState(prev => ({ ...prev, reg1: healthResult ? '01000' : '00000' }));
            setStatusMessages(prev => [...prev, `Health check: ${healthResult ? 'PASS' : 'FAIL'}`]);
          }
          break;

        default:
          setStatusMessages(prev => [...prev, `Command V${verb}N${noun} not implemented`]);
          setDskyState(prev => ({ ...prev, oprErr: true }));
          break;
      }

    } catch (error) {
      setStatusMessages(prev => [...prev, `Error executing V${verb}N${noun}: ${error}`]);
      setDskyState(prev => ({ ...prev, oprErr: true }));
    } finally {
      setIsProcessing(false);
      setDskyState(prev => ({ ...prev, compActy: false }));
    }
  }, [web3State.account]);

  // Handle key press
  const handleKeyPress = useCallback((key: string) => {
    console.log(`Key pressed: ${key}`);
    
    switch (key) {
      case 'VERB':
        setInputMode('verb');
        setCurrentInput('');
        setStatusMessages(prev => [...prev, 'VERB mode activated']);
        setDskyState(prev => ({ ...prev, keyRel: true }));
        break;

      case 'NOUN':
        setInputMode('noun');
        setCurrentInput('');
        setStatusMessages(prev => [...prev, 'NOUN mode activated']);
        setDskyState(prev => ({ ...prev, keyRel: true }));
        break;

      case 'PROC':
        setInputMode('prog');
        setCurrentInput('');
        setStatusMessages(prev => [...prev, 'PROC mode activated']);
        setDskyState(prev => ({ ...prev, keyRel: true }));
        break;

      case 'CLR':
        setInputMode(null);
        setCurrentInput('');
        setDskyState(prev => ({ ...prev, keyRel: false, oprErr: false }));
        setStatusMessages(prev => [...prev, 'Input cleared']);
        break;

      case 'ENTR':
        if (inputMode && currentInput) {
          const paddedInput = currentInput.padStart(2, '0');
          setDskyState(prev => ({
            ...prev,
            [inputMode]: paddedInput,
            keyRel: false
          }));
          setStatusMessages(prev => [...prev, `${inputMode.toUpperCase()}: ${paddedInput}`]);

          // Auto-execute if we have both verb and noun
          if (inputMode === 'noun' && dskyState.verb !== '00') {
            executeCommand(dskyState.verb, paddedInput);
          } else if (inputMode === 'verb' && dskyState.noun !== '00') {
            executeCommand(paddedInput, dskyState.noun);
          }
        }
        setInputMode(null);
        setCurrentInput('');
        break;

      case 'KEY REL':
        setDskyState(prev => ({ ...prev, keyRel: false }));
        setInputMode(null);
        setCurrentInput('');
        break;

      case 'RSET':
        setDskyState(prev => ({
          ...prev,
          verb: '00',
          noun: '00',
          prog: '00',
          reg1: '00000',
          reg2: '00000',
          reg3: '00000',
          keyRel: false,
          oprErr: false
        }));
        setInputMode(null);
        setCurrentInput('');
        setStatusMessages(prev => [...prev, 'System reset']);
        break;

      case '+':
        if (inputMode && currentInput.length < 2) {
          setCurrentInput(prev => prev + '+');
        }
        break;

      case '−':
        if (inputMode && currentInput.length < 2) {
          setCurrentInput(prev => prev + '−');
        }
        break;

      default:
        // Handle numeric input
        if (/\d/.test(key) && inputMode) {
          const maxLength = 2;
          if (currentInput.length < maxLength) {
            setCurrentInput(prev => prev + key);
          }
        }
        break;
    }
  }, [inputMode, currentInput, dskyState.verb, dskyState.noun, executeCommand]);

  // Simulate computer activity and connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setDskyState(prev => ({
        ...prev,
        compActy: isProcessing || Math.random() > 0.85,
        uplinkActy: web3State.isConnected
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, web3State.isConnected]);

  return (
    <div className="dsky-container">
      <div className="dsky-main">
        {/* Header */}
        <div className="dsky-header">
          <div className="dsky-header-title">CRYPTO GUIDANCE COMPUTER</div>
          <div className="dsky-header-subtitle">DSKY INTERFACE</div>
        </div>

        <div className="dsky-body">
          {/* Main Control Section */}
          <div className="dsky-controls">
            {/* Top Row: Status Indicators and Display Area */}
            <div className="dsky-top-row">
              {/* Status Indicators - Left of Display */}
              <div className="dsky-status-indicators">
                <div className={`dsky-status-light status-comp-acty ${dskyState.compActy ? 'active' : ''}`}>
                  COMP ACTY
                </div>
                {statusIndicators.map((light) => (
                  <div
                    key={light.key}
                    className={`dsky-status-light status-${light.key.toLowerCase().replace(/([A-Z])/g, '-$1')} ${
                      dskyState[light.key] ? 'active' : ''
                    }`}
                  >
                    {light.label}
                  </div>
                ))}
              </div>

              {/* Display Area - Right of Status Indicators */}
              <div className="dsky-display-area">
                {/* PROG */}
                <div className="dsky-display-label dsky-prog-label">PROG</div>
                <div className={`dsky-display-value dsky-prog-value ${inputMode === 'prog' ? 'input-mode' : ''}`}>
                  {inputMode === 'prog' ? currentInput.padEnd(2, '_') : dskyState.prog}
                </div>
                
                {/* VERB */}
                <div className="dsky-display-label dsky-verb-label">VERB</div>
                <div className={`dsky-display-value dsky-verb-value ${inputMode === 'verb' ? 'input-mode' : ''}`}>
                  {inputMode === 'verb' ? currentInput.padEnd(2, '_') : dskyState.verb}
                </div>
                
                {/* NOUN */}
                <div className="dsky-display-label dsky-noun-label">NOUN</div>
                <div className={`dsky-display-value dsky-noun-value ${inputMode === 'noun' ? 'input-mode' : ''}`}>
                  {inputMode === 'noun' ? currentInput.padEnd(2, '_') : dskyState.noun}
                </div>
                
                {/* R1 */}
                <div className="dsky-display-label dsky-r1-label">R1</div>
                <div className="dsky-display-value dsky-r1-value">{dskyState.reg1}</div>
                
                {/* R2 */}
                <div className="dsky-display-label dsky-r2-label">R2</div>
                <div className="dsky-display-value dsky-r2-value">{dskyState.reg2}</div>
                
                {/* R3 */}
                <div className="dsky-display-label dsky-r3-label">R3</div>
                <div className="dsky-display-value dsky-r3-value">{dskyState.reg3}</div>
              </div>
            </div>

            {/* Keypad - Below Top Row */}
            <div className="dsky-keypad">
              <button className="dsky-button btn-verb" onClick={() => handleKeyPress('VERB')}>VERB</button>
              <button className="dsky-button btn-noun" onClick={() => handleKeyPress('NOUN')}>NOUN</button>
              <button className="dsky-button btn-proc" onClick={() => handleKeyPress('PROC')}>PROC</button>
              <button className="dsky-button btn-rset" onClick={() => handleKeyPress('RSET')}>RSET</button>
              
              <button className="dsky-button btn-plus" onClick={() => handleKeyPress('+')}>+</button>
              <button className="dsky-button btn-7" onClick={() => handleKeyPress('7')}>7</button>
              <button className="dsky-button btn-8" onClick={() => handleKeyPress('8')}>8</button>
              <button className="dsky-button btn-9" onClick={() => handleKeyPress('9')}>9</button>
              
              <button className="dsky-button btn-minus" onClick={() => handleKeyPress('−')}>−</button>
              <button className="dsky-button btn-4" onClick={() => handleKeyPress('4')}>4</button>
              <button className="dsky-button btn-5" onClick={() => handleKeyPress('5')}>5</button>
              <button className="dsky-button btn-6" onClick={() => handleKeyPress('6')}>6</button>
              
              <button className="dsky-button btn-0" onClick={() => handleKeyPress('0')}>0</button>
              <button className="dsky-button btn-1" onClick={() => handleKeyPress('1')}>1</button>
              <button className="dsky-button btn-2" onClick={() => handleKeyPress('2')}>2</button>
              <button className="dsky-button btn-3" onClick={() => handleKeyPress('3')}>3</button>
              
              <div></div> {/* Blank space */}
              <button className="dsky-button btn-key-rel" onClick={() => handleKeyPress('KEY REL')}>KEY REL</button>
              <button className="dsky-button btn-entr" onClick={() => handleKeyPress('ENTR')}>ENTR</button>
              <button className="dsky-button btn-clr" onClick={() => handleKeyPress('CLR')}>CLR</button>
            </div>

            {/* Output Section - Below Keypad */}
            <div className="dsky-output">
              <div className="dsky-output-title">System Output</div>
              <div className="dsky-output-content">
                <div>Wallet: {web3State.isConnected ? 'CONNECTED' : 'DISCONNECTED'}</div>
                <div>Network: {web3State.network || 'UNKNOWN'}</div>
                <div>Account: {web3State.account ? `${web3State.account.slice(0, 6)}...${web3State.account.slice(-4)}` : 'NONE'}</div>
                <div>Balance: {web3State.balance ? `${parseFloat(web3State.balance).toFixed(4)} ETH` : 'N/A'}</div>
                <div className="output-separator">───────────</div>
                {statusMessages.slice(-6).map((msg, index) => (
                  <div key={index} className="output-message">{msg}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSKYAuthentic;
