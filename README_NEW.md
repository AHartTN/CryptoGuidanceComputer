# Apollo DSKY Cryptocurrency Computer

A cryptocurrency monitoring and trading interface inspired by the Apollo Guidance Computer's DSKY (Display and Keyboard) unit. This enterprise-grade application provides authentic Apollo-era aesthetics with modern Web3 functionality.

## 🚀 Features

### Authentic Apollo DSKY Experience
- **Responsive Design**: Automatically scales to fill available viewport space
- **Seven-Segment Display**: Authentic Apollo-era display styling
- **Warning Lights**: Real-time status indicators
- **DSKY Keypad**: Original verb/noun/program entry system

### Web3 Integration
- **Unified Web3 Service**: Enterprise-grade architecture with SOLID/DRY principles
- **MetaMask Integration**: Primary wallet provider
- **Alchemy Blockchain Provider**: Reliable blockchain data source
- **Multi-Network Support**: Hardhat, Mainnet, Polygon, and more

### Command System
Commands follow the original Apollo DSKY convention using Verb + Noun combinations:

#### Basic System Operations (01-09)
- **V01N11**: Connect wallet to system
- **V02N01**: System health check
- **V03N01**: Reset system
- **V99N11**: Disconnect wallet (shutdown)

#### Wallet Operations (11-19)
- **V11N11**: Display wallet information
- **V12N12**: Display wallet balance
- **V13N13**: Display token balances
- **V15N24**: Switch network

#### Blockchain Data (21-29)
- **V22N21**: Display current block
- **V24N23**: Display gas prices
- **V25N25**: Display network status

#### Crypto Prices (31-39)
- **V31N31**: Bitcoin price
- **V31N32**: Ethereum price
- **V31N40**: Top 10 cryptocurrencies

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MetaMask browser extension
- Alchemy API key (optional, demo key provided)

### Setup
```powershell
# Clone repository
git clone <repository-url>
cd CryptoGuidanceComputer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:
```
VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
VITE_HARDHAT_RPC_URL=http://localhost:8545
```

## 🎮 Usage

### Basic Operation
1. **Connect Wallet**: Enter V01 (VERB), then N11 (NOUN), then ENTR
2. **Check Balance**: Enter V12 (VERB), then N12 (NOUN), then ENTR
3. **View Current Block**: Enter V22 (VERB), then N21 (NOUN), then ENTR
4. **System Reset**: Press RSET button

### Command Entry System
1. Press **VERB** button - enters verb mode
2. Enter 2-digit verb number (01-99)
3. Press **ENTR** to confirm
4. Press **NOUN** button - enters noun mode
5. Enter 2-digit noun number (01-99)
6. Press **ENTR** to execute command

### Status Display
- **Left Panel**: Real-time system status, wallet info, and command history
- **R1/R2/R3 Registers**: Display command results and data
- **Warning Lights**: Show system status and errors

### Error Handling
- **OPR ERR**: Invalid verb/noun combination or execution error
- **KEY REL**: Input mode active, press KEY REL to clear
- **COMP ACTY**: System processing command

## 🏗️ Architecture

### Enterprise Design Patterns
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion
- **DRY Architecture**: Don't repeat yourself - unified service layer
- **Strategy Pattern**: Interchangeable wallet and blockchain providers
- **Observer Pattern**: Event-driven status updates

### Component Structure
```
src/
├── components/
│   └── DSKYAuthentic.tsx        # Main DSKY interface component
├── services/
│   └── UnifiedWeb3Service.ts    # Orchestrates all Web3 operations
├── providers/
│   ├── MetaMaskWalletProvider.ts # MetaMask integration
│   └── AlchemyBlockchainProvider.ts # Alchemy blockchain data
├── interfaces/
│   ├── IWalletProvider.ts       # Wallet provider contract
│   └── IBlockchainProvider.ts   # Blockchain provider contract
├── enums/
│   └── DSKYEnums.ts            # Verb/noun/program definitions
└── styles/
    └── dsky-*.css              # Authentic Apollo styling
```

### Responsive Design
- **Viewport Scaling**: Uses `clamp()` for fluid responsive design
- **Minimum Size**: 320px width minimum for mobile
- **Maximum Size**: 1200px width maximum for large displays
- **Aspect Ratio**: Maintains authentic DSKY proportions

## 🔧 Development

### Hardhat Integration
The application is configured to work with the Hardhat development network:
- **Network**: http://localhost:8545
- **Chain ID**: 31337
- **Accounts**: Pre-funded development accounts available

### Testing Commands
Use these verb/noun combinations to test functionality:
1. **V01N11** - Connect MetaMask wallet
2. **V12N12** - Get wallet balance
3. **V22N21** - Get current block number
4. **V24N23** - Get current gas price
5. **V02N01** - Run health check

### Error Scenarios
Test error handling with:
- Invalid verb/noun combinations (e.g., V99N99)
- Network disconnection
- Wallet rejection
- Invalid addresses

## 📋 Command Reference

### System Verbs (01-09)
| Verb | Description |
|------|-------------|
| 01   | Connect wallet |
| 02   | Health check |
| 03   | Reset system |
| 04   | Test system |

### Wallet Verbs (11-19)
| Verb | Description |
|------|-------------|
| 11   | Wallet info |
| 12   | Wallet balance |
| 13   | Token balances |
| 14   | NFT holdings |
| 15   | Switch network |

### Blockchain Verbs (21-29)
| Verb | Description |
|------|-------------|
| 21   | Block info |
| 22   | Current block |
| 23   | Specific block |
| 24   | Gas prices |
| 25   | Network status |

### System Nouns (01-09)
| Noun | Description |
|------|-------------|
| 01   | System status |
| 02   | Wallet status |
| 03   | Network status |
| 04   | Error status |
| 05   | Health status |

### Wallet Nouns (11-19)
| Noun | Description |
|------|-------------|
| 11   | Wallet address |
| 12   | ETH balance |
| 13   | Token balances |
| 14   | NFT holdings |

### Blockchain Nouns (21-29)
| Noun | Description |
|------|-------------|
| 21   | Current block |
| 22   | Block time |
| 23   | Gas price |
| 24   | Chain ID |
| 25   | Network name |

## 🎨 Styling

### Apollo Aesthetic
- **Colors**: Authentic Apollo mission colors (amber, white, black)
- **Typography**: Monospace fonts for authenticity
- **Layout**: Faithful DSKY proportions and spacing
- **Lighting**: Realistic warning light behaviors

### Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔐 Security

### Best Practices
- **No Private Key Storage**: Uses MetaMask for secure key management
- **Input Validation**: All user inputs validated before processing
- **Error Boundaries**: Comprehensive error handling prevents crashes
- **Rate Limiting**: Built-in request throttling and retry logic

### Network Security
- **HTTPS Only**: Production builds enforce secure connections
- **CSP Headers**: Content Security Policy for XSS protection
- **Environment Variables**: Sensitive data stored in env files

## 🚀 Deployment

### Production Build
```powershell
npm run build
npm run preview
```

### Environment Setup
Configure production environment variables:
```
VITE_ALCHEMY_API_KEY=production_key
VITE_APP_ENVIRONMENT=production
```

## 📞 Support

### Troubleshooting
1. **Wallet Connection Issues**: Ensure MetaMask is installed and unlocked
2. **Network Problems**: Check RPC endpoint configuration
3. **Display Issues**: Verify browser supports CSS Grid and Flexbox
4. **Performance**: Enable browser hardware acceleration

### Known Issues
- **MetaMask Mobile**: Some features limited on mobile browsers
- **Network Switching**: Manual approval required for new networks
- **Gas Estimation**: May vary significantly during network congestion

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **NASA Apollo Program**: Inspiration for the DSKY interface design
- **Ethereum Foundation**: Web3 standards and documentation
- **MetaMask Team**: Wallet integration support
- **Alchemy**: Reliable blockchain infrastructure
