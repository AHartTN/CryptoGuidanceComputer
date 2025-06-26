# CryptoGuidanceComputer
I told Claude to give me a react front-end designed like an Apollo DSKY that I can punch in verbs and nouns like astronauts and have it return crypto prices to start with

# Apollo DSKY Crypto Prices

A React application that mimics the Apollo Guidance Computer (AGC) DSKY (Display and Keyboard) interface for displaying cryptocurrency prices with Web3 integration.

## Features

- **Authentic Apollo DSKY Interface**: Retro computer aesthetic with green monospace styling
- **Verb-Noun Command System**: Uses Apollo-style verb commands (Verb 12 for crypto prices)
- **Real-time Crypto Prices**: Fetches live cryptocurrency data from CoinGecko API
- **Web3 Integration**: Connects to Ethereum networks and wallet functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Status Indicators**: LED-style status lights for system status

## Supported Commands

### Verb 12 - Display Crypto Prices

- **V12 N01**: Display Bitcoin (BTC) price
- **V12 N02**: Display Ethereum (ETH) price  
- **V12 N03**: Display Cardano (ADA) price
- **V12 N04**: Display Polkadot (DOT) price
- **V12 N05**: Display Polygon (MATIC) price
- **V12 N10**: Display BTC & ETH prices
- **V12 N20**: Display all supported cryptocurrencies

## How to Use

1. Press **VERB** to start entering a verb command
2. Enter the verb number (e.g., `12`)
3. Press **NOUN** to enter the noun
4. Enter the noun number (e.g., `01` for Bitcoin)
5. Press **ENTR** to execute the command
6. Use **CLR** to clear current entry or **RSET** to reset the display

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Styled Components** for CSS-in-JS styling
- **Axios** for API requests
- **Web3.js** for blockchain integration
- **CoinGecko API** for cryptocurrency data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd React_DSKY_CryptoPrices
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  components/
    DSKY.tsx              # Main DSKY interface component
  services/
    cryptoService.ts      # Cryptocurrency data fetching
    web3Service.ts        # Web3 and wallet integration
  styles/
    dsky.css             # Apollo DSKY styling
  types/
    crypto.ts            # TypeScript type definitions
```

## Environment Variables

Create a `.env` file in the root directory for configuration:

```env
VITE_COINGECKO_API_URL=https://api.coingecko.com/api/v3
VITE_WEB3_RPC_URL=https://cloudflare-eth.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by the Apollo Guidance Computer DSKY interface
- CoinGecko for providing free cryptocurrency API
- The React and Web3 communities
  },
})
```
