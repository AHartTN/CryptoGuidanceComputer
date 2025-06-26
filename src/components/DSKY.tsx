import React, { useState, useEffect, useCallback } from 'react';
import { CryptoService } from '../services/cryptoService';
import type { CryptoPriceData } from '../types/crypto';
import '../styles/dsky.css';

interface DSKYState {
  verb: string;
  noun: string;
  display: string;
  mode: 'STANDBY' | 'VERB_ENTRY' | 'NOUN_ENTRY' | 'EXECUTING' | 'ERROR';
  error: string | null;
}

const DSKY: React.FC = () => {
  const [state, setState] = useState<DSKYState>({
    verb: '',
    noun: '',
    display: '00000',
    mode: 'STANDBY',
    error: null
  });

  const [cryptoData, setCryptoData] = useState<CryptoPriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const cryptoService = new CryptoService();

  // Initialize display
  useEffect(() => {
    setState(prev => ({
      ...prev,
      display: 'READY'
    }));
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    setState(prev => {
      const newState = { ...prev };

      switch (key) {
        case 'VERB':
          newState.mode = 'VERB_ENTRY';
          newState.verb = '';
          newState.display = 'VERB?';
          newState.error = null;
          break;

        case 'NOUN':
          if (prev.mode === 'VERB_ENTRY' && prev.verb) {
            newState.mode = 'NOUN_ENTRY';
            newState.noun = '';
            newState.display = 'NOUN?';
          }
          break;

        case 'ENTR':
          if (prev.mode === 'NOUN_ENTRY' && prev.verb && prev.noun) {
            executeVerbNoun(prev.verb, prev.noun);
            newState.mode = 'EXECUTING';
            newState.display = 'EXEC';
          }
          break;

        case 'CLR':
          newState.verb = '';
          newState.noun = '';
          newState.display = 'READY';
          newState.mode = 'STANDBY';
          newState.error = null;
          break;

        case 'RSET':
          newState.verb = '';
          newState.noun = '';
          newState.display = 'RESET';
          newState.mode = 'STANDBY';
          newState.error = null;
          setCryptoData([]);
          break;

        default:
          // Handle numeric input
          if (/^\d$/.test(key)) {
            if (prev.mode === 'VERB_ENTRY') {
              if (prev.verb.length < 2) {
                newState.verb = prev.verb + key;
                newState.display = `V${newState.verb.padStart(2, '0')}`;
              }
            } else if (prev.mode === 'NOUN_ENTRY') {
              if (prev.noun.length < 2) {
                newState.noun = prev.noun + key;
                newState.display = `N${newState.noun.padStart(2, '0')}`;
              }
            }
          }
          break;
      }

      return newState;
    });
  }, []);

  const executeVerbNoun = async (verb: string, noun: string) => {
    setLoading(true);
    
    try {
      if (verb === '12') {
        // Verb 12: Display crypto prices
        let symbols: string[] = [];
        
        switch (noun) {
          case '01':
            symbols = ['BTC'];
            break;
          case '02':
            symbols = ['ETH'];
            break;
          case '03':
            symbols = ['ADA'];
            break;
          case '04':
            symbols = ['DOT'];
            break;
          case '05':
            symbols = ['MATIC'];
            break;
          case '10':
            symbols = ['BTC', 'ETH'];
            break;
          case '20':
            symbols = ['BTC', 'ETH', 'ADA', 'DOT', 'MATIC'];
            break;
          default:
            throw new Error(`Unknown noun: ${noun}`);
        }

        const data = await cryptoService.getCryptoPrices(symbols);
        setCryptoData(data);
        setLastUpdate(new Date());
        
        setState(prev => ({
          ...prev,
          mode: 'STANDBY',
          display: 'DONE',
          error: null
        }));
      } else {
        throw new Error(`Unknown verb: ${verb}`);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        mode: 'ERROR',
        display: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const getStatusLights = () => {
    return {
      power: true,
      computer: state.mode !== 'ERROR',
      uplink: cryptoData.length > 0,
      temp: state.mode === 'ERROR',
      keyRel: state.mode === 'VERB_ENTRY' || state.mode === 'NOUN_ENTRY'
    };
  };

  const statusLights = getStatusLights();

  return (
    <div className="dsky-container">
      <div className="dsky-panel">
        <h1 className="dsky-title">APOLLO DSKY</h1>
        <p className="dsky-subtitle">CRYPTO GUIDANCE COMPUTER</p>
        
        {/* Status Lights */}
        <div className="status-lights">
          <div className={`status-light ${statusLights.power ? 'active' : ''}`} title="Power" />
          <div className={`status-light ${statusLights.computer ? 'active' : 'error'}`} title="Computer" />
          <div className={`status-light ${statusLights.uplink ? 'active' : ''}`} title="Uplink" />
          <div className={`status-light ${statusLights.temp ? 'warning' : ''}`} title="Temp" />
          <div className={`status-light ${statusLights.keyRel ? 'warning' : ''}`} title="Key Rel" />
        </div>

        {/* Display Section */}
        <div className="display-section">
          <div className="verb-noun-display">
            <div className="verb-section">
              <h3>VERB</h3>
              <input 
                type="text" 
                className="verb-input seven-segment" 
                value={state.verb.padStart(2, '0')}
                readOnly
              />
            </div>
            <div className="noun-section">
              <h3>NOUN</h3>
              <input 
                type="text" 
                className="noun-input seven-segment" 
                value={state.noun.padStart(2, '0')}
                readOnly
              />
            </div>
          </div>
          
          <div className="seven-segment" style={{ fontSize: '1.5rem' }}>
            {state.display}
          </div>
          
          {loading && <div className="loading">FETCHING DATA...</div>}
          {state.error && <div className="error">ERROR: {state.error}</div>}
        </div>

        {/* Crypto Data Display */}
        {cryptoData.length > 0 && (
          <div className="crypto-data">
            <h3 style={{ color: 'var(--dsky-amber)', textAlign: 'center', marginBottom: '20px' }}>
              CRYPTO PRICES
            </h3>
            {cryptoData.map((crypto) => (
              <div key={crypto.symbol} className="crypto-item">
                <span className="crypto-symbol">{crypto.symbol}</span>
                <span className="crypto-price">${crypto.price.toLocaleString()}</span>
              </div>
            ))}
            {lastUpdate && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '15px', 
                fontSize: '0.8rem', 
                color: 'var(--dsky-amber)',
                opacity: 0.7
              }}>
                Last Update: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* Keypad */}
        <div className="keypad">
          {['1', '2', '3'].map(num => (
            <button 
              key={num} 
              className="key-button" 
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </button>
          ))}
          {['4', '5', '6'].map(num => (
            <button 
              key={num} 
              className="key-button" 
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </button>
          ))}
          {['7', '8', '9'].map(num => (
            <button 
              key={num} 
              className="key-button" 
              onClick={() => handleKeyPress(num)}
            >
              {num}
            </button>
          ))}
          <button 
            className="key-button special-key" 
            onClick={() => handleKeyPress('CLR')}
          >
            CLR
          </button>
          <button 
            className="key-button" 
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>
          <button 
            className="key-button special-key" 
            onClick={() => handleKeyPress('RSET')}
          >
            RSET
          </button>
          <button 
            className="key-button special-key" 
            onClick={() => handleKeyPress('VERB')}
          >
            VERB
          </button>
          <button 
            className="key-button special-key" 
            onClick={() => handleKeyPress('NOUN')}
          >
            NOUN
          </button>
          <button 
            className="key-button special-key" 
            onClick={() => handleKeyPress('ENTR')}
          >
            ENTR
          </button>
        </div>

        {/* Instructions */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--dsky-border)',
          borderRadius: '6px',
          fontSize: '0.9rem',
          color: 'var(--dsky-amber)',
          lineHeight: '1.6'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'var(--dsky-green)' }}>VERB 12 OPERATIONS:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', alignItems: 'center' }}>
            <span>V12 N01:</span><span>Display Bitcoin (BTC)</span>
            <span>V12 N02:</span><span>Display Ethereum (ETH)</span>
            <span>V12 N03:</span><span>Display Cardano (ADA)</span>
            <span>V12 N04:</span><span>Display Polkadot (DOT)</span>
            <span>V12 N05:</span><span>Display Polygon (MATIC)</span>
            <span>V12 N10:</span><span>Display BTC & ETH</span>
            <span>V12 N20:</span><span>Display All Supported Coins</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSKY;
