// Interactive help dialog component for Apollo DSKY interface

import React, { useState } from 'react';

interface DSKYHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DSKYHelpDialog: React.FC<DSKYHelpDialogProps> = ({ isOpen, onClose }) => {
  const [currentSection, setCurrentSection] = useState<'overview' | 'verbs' | 'nouns' | 'examples'>('overview');

  if (!isOpen) return null;

  const helpSections = {
    overview: {
      title: 'Apollo DSKY Interface Overview',
      content: (
        <div>
          <p>Welcome to the Apollo DSKY Crypto Guidance Computer!</p>
          <p>This interface mimics the Apollo Command Module's Display and Keyboard (DSKY) system but for cryptocurrency operations.</p>
            <h4>How to Use:</h4>
          <ol>
            <li><strong>Connect Wallet:</strong> Use VERB 01 NOUN 11 to connect MetaMask</li>
            <li><strong>Enter Commands:</strong> Press VERB → number → NOUN → number → ENTR</li>
            <li><strong>View Data:</strong> Check the main display for results</li>
            <li><strong>Monitor Status:</strong> Watch status indicators for system state</li>
          </ol>

          <h4>Status Indicators:</h4>
          <ul>
            <li><strong>COMP ACTY:</strong> Computer activity in progress</li>
            <li><strong>OPR ERR:</strong> Operator error - check your input</li>
            <li><strong>UPLINK ACTY:</strong> Network communication active</li>
            <li><strong>TEMP:</strong> Temporary status indicator</li>
          </ul>
        </div>
      )
    },
    verbs: {
      title: 'Available VERBS',
      content: (        <div>
          <h4>System Operations:</h4>
          <ul>
            <li><strong>VERB 01:</strong> Connect wallet</li>
            <li><strong>VERB 02:</strong> Health check</li>
            <li><strong>VERB 99:</strong> Disconnect wallet</li>
          </ul>

          <h4>Wallet Operations:</h4>
          <ul>
            <li><strong>VERB 11:</strong> Display wallet info</li>
            <li><strong>VERB 12:</strong> Get wallet balance</li>
          </ul>          <h4>Blockchain Data:</h4>
          <ul>
            <li><strong>VERB 22:</strong> Current block number</li>
            <li><strong>VERB 24:</strong> Gas price</li>
            <li><strong>VERB 25:</strong> Network status</li>
            <li><strong>VERB 31:</strong> Crypto prices</li>
          </ul>

          <h4>Note:</h4>
          <p>These are the currently implemented verbs. Additional functionality will be added in future updates.</p>
        </div>
      )
    },
    nouns: {
      title: 'Available NOUNS',
      content: (        <div>
          <h4>System Nouns:</h4>
          <ul>
            <li><strong>NOUN 01:</strong> System status</li>
            <li><strong>NOUN 11:</strong> Wallet address</li>
            <li><strong>NOUN 12:</strong> Wallet balance</li>
          </ul>          <h4>Blockchain Nouns:</h4>
          <ul>
            <li><strong>NOUN 21:</strong> Current block</li>
            <li><strong>NOUN 23:</strong> Gas price</li>
            <li><strong>NOUN 25:</strong> Network name</li>
            <li><strong>NOUN 31:</strong> Bitcoin (BTC)</li>
            <li><strong>NOUN 32:</strong> Ethereum (ETH)</li>
            <li><strong>NOUN 34:</strong> Polygon (MATIC)</li>
            <li><strong>NOUN 36:</strong> Cardano (ADA)</li>
          </ul>

          <h4>Note:</h4>
          <p>These are the currently implemented nouns. Each verb requires a specific noun to function properly.</p>
        </div>
      )
    },
    examples: {
      title: 'Common Commands',
      content: (        <div>          <h4>Working Commands (Currently Implemented):</h4>
          <ul>
            <li><strong>VERB 01 NOUN 11:</strong> Connect MetaMask wallet</li>
            <li><strong>VERB 02 NOUN 01:</strong> System health check</li>
            <li><strong>VERB 11 NOUN 11:</strong> Display wallet address</li>
            <li><strong>VERB 12 NOUN 12:</strong> Show wallet balance</li>
            <li><strong>VERB 22 NOUN 21:</strong> Get current block number</li>
            <li><strong>VERB 24 NOUN 23:</strong> Get current gas price</li>
            <li><strong>VERB 25 NOUN 25:</strong> Display network status</li>
            <li><strong>VERB 31 NOUN 31:</strong> Bitcoin price</li>
            <li><strong>VERB 31 NOUN 32:</strong> Ethereum price</li>
            <li><strong>VERB 31 NOUN 34:</strong> Polygon price</li>
            <li><strong>VERB 31 NOUN 36:</strong> Cardano price</li>
            <li><strong>VERB 99 NOUN 11:</strong> Disconnect wallet</li>
          </ul>          <h4>Quick Start Guide:</h4>
          <ol>
            <li><strong>First:</strong> Connect wallet with V01 N11 ENTR</li>
            <li><strong>Then:</strong> Check balance with V12 N12 ENTR</li>
            <li><strong>Crypto Prices:</strong> Try V31 N31 ENTR for Bitcoin</li>
            <li><strong>Explore:</strong> Try V22 N21 ENTR for block info</li>
          </ol>

          <h4>Input Sequence:</h4>
          <ol>
            <li>Press <strong>VERB</strong> button</li>
            <li>Enter 2-digit verb number (e.g., 0, 1 for VERB 01)</li>
            <li>Press <strong>NOUN</strong> button</li>
            <li>Enter 2-digit noun number (e.g., 1, 1 for NOUN 11)</li>
            <li>Press <strong>ENTR</strong> to execute</li>
          </ol>

          <h4>Troubleshooting:</h4>
          <ul>
            <li><strong>OPR ERR light:</strong> Invalid verb/noun combination</li>
            <li><strong>No response:</strong> Check if wallet is connected first</li>
            <li><strong>Clear input:</strong> Press CLR button</li>
            <li><strong>Reset all:</strong> Press RSET button</li>          </ul>
        </div>
      )
    }
  };

  return (
    <div className="dsky-help-overlay">
      <div className="dsky-help-dialog">
        <div className="dsky-help-header">
          <h2>Apollo DSKY Help System</h2>
          <button className="dsky-help-close" onClick={onClose}>×</button>
        </div>
        
        <div className="dsky-help-nav">
          <button 
            className={`dsky-help-nav-btn ${currentSection === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentSection('overview')}
          >
            Overview
          </button>
          <button 
            className={`dsky-help-nav-btn ${currentSection === 'verbs' ? 'active' : ''}`}
            onClick={() => setCurrentSection('verbs')}
          >
            Verbs
          </button>
          <button 
            className={`dsky-help-nav-btn ${currentSection === 'nouns' ? 'active' : ''}`}
            onClick={() => setCurrentSection('nouns')}
          >
            Nouns
          </button>
          <button 
            className={`dsky-help-nav-btn ${currentSection === 'examples' ? 'active' : ''}`}
            onClick={() => setCurrentSection('examples')}
          >
            Examples
          </button>
        </div>

        <div className="dsky-help-content">
          <h3>{helpSections[currentSection].title}</h3>
          {helpSections[currentSection].content}
        </div>

        <div className="dsky-help-footer">
          <p><strong>Tip:</strong> Press ESC key to close this help dialog at any time.</p>
        </div>
      </div>
    </div>
  );
};
