# Apollo DSKY Crypto Guidance Computer 🚀

A React TypeScript application that recreates the Apollo Guidance Computer (AGC) DSKY (Display and Keyboard) interface for interacting with cryptocurrency prices and blockchain data through MetaMask and Hardhat.

## 🌟 Features

- **Authentic Apollo DSKY Interface**: Retro computer aesthetic with green phosphor styling and seven-segment displays
- **Verb-Noun Command System**: Apollo-style command interface for crypto prices and Web3 operations
- **Real-time Crypto Prices**: Live cryptocurrency data with auto-refresh
- **MetaMask Integration**: Connect wallet, view account balance, and interact with blockchain
- **Hardhat Network Support**: Direct integration with your local Hardhat node
- **Modern Tech Stack**: Built with React, TypeScript, Viem, and styled-components
- **Responsive Design**: Works on desktop and mobile devices

## 🎮 Command Reference

### V12 - Cryptocurrency Prices

- **V12N01**: Bitcoin (BTC) price
- **V12N02**: Ethereum (ETH) price
- **V12N03**: Cardano (ADA) price
- **V12N04**: Polkadot (DOT) price
- **V12N05**: Polygon (MATIC) price

### Additional Commands

- **VERB**: Start entering a verb command
- **NOUN**: Start entering a noun parameter
- **ENTR**: Execute the entered command
- **CONN**: Connect to MetaMask wallet
- **CLR**: Clear current input

## 🔧 Setup

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Hardhat node running (optional, for blockchain features)

### Installation

```bash
npm install
npm run dev
```

### Hardhat Configuration

Your application is configured to connect to:

- **Local Hardhat**: `http://localhost:8545`
- **Remote Hardhat**: `https://hardhat.hartonomous.com` (your nginx proxy)
- **V22 N03**: Current block number

### V23 - Block Information

- **V23 N01**: Block number
- **V23 N02**: Block timestamp
- **V23 N03**: Gas limit
- **V23 N04**: Block hash

### V31 - Wallet Operations

- **V31 N01**: Connect MetaMask wallet

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MetaMask browser extension
- npm or yarn

### Installation

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd CryptoGuidanceComputer
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env
# Edit .env with your API keys if needed
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## 🛠️ Technologies Used

- **React 18** with TypeScript for type safety
- **Viem** for modern Web3 integration (replacing Web3.js)
- **Wagmi** for React hooks and wallet management
- **@tanstack/react-query** for efficient state management and caching
- **Vite** for fast development and optimized builds
- **CSS-in-JS** with styled-components approach
- **CoinGecko API** for real-time cryptocurrency data

## 🏗️ Project Structure

```
src/
  components/
    DSKY.tsx                    # Main Apollo DSKY interface
  hooks/
    useWeb3.ts                  # Web3 connection hook
  services/
    web3Service.ts              # Primary Web3 service
    alternativeWeb3Service.ts   # Fallback Web3 service
    robustWeb3Service.ts        # Multi-endpoint RPC service
    cryptoService.ts            # Cryptocurrency data service
    commandExecutor.ts          # Command processing logic
  styles/
    dsky.css                    # Authentic Apollo DSKY styling
  types/
    crypto.ts                   # TypeScript type definitions
server/
  CORS_FIX_GUIDE.md            # Server configuration guide
  nginx-minimal.conf           # Minimal Nginx configuration
  hardhat.config.js            # Hardhat network configuration
```

## ⚙️ Configuration

### Environment Variables

The application uses these environment variables (`.env`):

```env
# Hardhat Network Configuration
VITE_HARDHAT_RPC_URL=https://hardhat.hartonomous.com
VITE_HARDHAT_RPC_URL_2=http://hardhat.hartonomous.com
VITE_HARDHAT_CHAIN_ID=31337

# Cryptocurrency API
VITE_COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### Web3 Network

The application is configured to connect to a custom Hardhat network:

- **URL**: `hardhat.hartonomous.com`
- **Chain ID**: `31337`
- **Network Name**: `Hardhat Local`

## 🧪 Testing

### Manual Testing

1. Click **TEST** button in the interface for comprehensive diagnostics
2. Test MetaMask connection with **V31 N01**
3. Verify cryptocurrency prices with **V12 N01-N05**
4. Check account info with **V21 N01-N03**

### Browser Console

- Check for MetaMask detection: `✅ MetaMask detected and ready`
- Monitor RPC connection status
- View detailed error messages for troubleshooting

## 🚨 Known Issues

### CORS Policy Error

**Issue**: Connection to `hardhat.hartonomous.com` blocked by CORS policy
**Cause**: Duplicate CORS headers (`Access-Control-Allow-Origin: *, *`)
**Solution**: See `server/CORS_FIX_GUIDE.md` for server configuration fixes

## 🎯 How to Use

1. **Connect Wallet**: Press **V31**, then **N01**, then **ENTR**
2. **Check Account**: Press **V21**, then **N01**, then **ENTR**
3. **View Crypto Prices**: Press **V12**, then **N01** (for Bitcoin), then **ENTR**
4. **Clear Display**: Press **CLR** to clear current entry
5. **Reset Interface**: Press **RSET** to reset all displays

### Interface Elements

- **VERB Display**: Shows current verb being entered (green, large font)
- **NOUN Display**: Shows current noun being entered
- **PROG Display**: Shows program/status information
- **Data Display**: Three rows showing command results
- **Status Panel**: Connection state, account info, network details
- **Keypad**: Numeric input with special function keys

## 🚀 Building for Production

```bash
npm run build
```

The optimized build will be available in the `dist/` directory.

## 📚 API Reference

### Supported Verbs

- **V12**: Cryptocurrency data operations
- **V21**: Account information operations
- **V22**: Network information operations
- **V23**: Block information operations
- **V31**: Wallet connection operations

### Error Codes

- **NO WALLET**: MetaMask not installed or available
- **USER REJECT**: User denied wallet connection
- **NET ERROR**: Network or RPC connection issues
- **CONN ERROR**: General connection errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Follow the coding guidelines in `/.copilot-instructions.md`
4. Make your changes with TypeScript
5. Test thoroughly with MetaMask
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Apollo Guidance Computer**: Inspired by the authentic NASA AGC DSKY interface
- **CoinGecko**: Providing reliable cryptocurrency price API
- **MetaMask**: Essential Web3 wallet integration
- **Viem Team**: Modern Web3 library architecture
- **React Community**: Excellent ecosystem and documentation

---

**Status**: ✅ Development Complete | 🔧 Pending Server CORS Fix | 🚀 Ready for Deployment
