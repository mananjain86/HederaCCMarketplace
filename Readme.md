# 🌱 CarbonChain Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-red.svg)](https://soliditylang.org/)
[![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-purple.svg)](https://hedera.com/)

> A decentralized carbon credits marketplace with automatic NFT certificate minting on Hedera Hashgraph network

## 🎯 Overview

CarbonChain Marketplace is a comprehensive web3 platform that enables companies to buy and sell verified carbon credits while automatically generating NFT certificates of ownership. The platform combines Ethereum smart contracts for marketplace functionality with Hedera Hashgraph for NFT minting and storage.

### ✨ Key Features

- 🏢 *Company Registration & KYC/KYB* - Complete onboarding with emissions tracking
- 💰 *Carbon Credits Trading* - Buy and sell verified carbon offset credits
- 🎨 *Automatic NFT Minting* - Each purchase generates an ownership certificate NFT
- 📊 *Real-time Analytics* - Market data and portfolio tracking
- 🌍 *IPFS Storage* - Decentralized metadata storage via Pinata
- 🔐 *Smart Contract Security* - Automated escrow and payment distribution
- 📱 *Responsive UI* - Modern React interface with TailwindCSS

## 🏗 Architecture


┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Ethereum +   │
│                 │    │                 │    │    Hedera)      │
│ • Marketplace   │    │ • API Server    │    │ • Smart         │
│ • Registration  │    │ • NFT Minting   │    │   Contracts     │
│ • Analytics     │    │ • Event         │    │ • NFT Storage   │
│ • Wallet        │    │   Listener      │    │ • IPFS          │
└─────────────────┘    └─────────────────┘    └─────────────────┘


## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Hedera Testnet account
- Pinata IPFS account

### Installation

bash
# Clone the repository
git clone https://github.com/mananjain86/carbonchain-marketplace.git
cd carbonchain-marketplace

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install smart contract dependencies
cd ../backend-web3
npm install


### Environment Setup

1. *Backend Configuration* (.env in /backend)
env
# Hedera Configuration
OPERATOR_ID=0.0.YOUR_HEDERA_ACCOUNT
OPERATOR_KEY=YOUR_HEDERA_PRIVATE_KEY

# IPFS Configuration
PINATA_JWT=YOUR_PINATA_JWT_TOKEN
GATEWAY_URL=https://gateway.pinata.cloud

# Blockchain Integration
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
BACKEND_PRIVATE_KEY=YOUR_ETHEREUM_PRIVATE_KEY
CARBON_CREDIT_BUYING_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS

# Server Configuration
PORT=5000


2. *Frontend Configuration* (.env in /frontend)
env
# Smart Contract Addresses
VITE_CONTRACT_ADDRESS=0xYOUR_MARKETPLACE_CONTRACT_ADDRESS
VITE_COMPANY_CONTRACT_ADDRESS=0xYOUR_COMPANY_CONTRACT_ADDRESS

# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Network Configuration
VITE_NETWORK_NAME=sepolia
VITE_NETWORK_ID=11155111


### Smart Contract Deployment

bash
cd backend-web3

# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Update contract addresses in .env files


### Running the Application

bash
# Terminal 1: Start backend server
cd backend
npm start

# Terminal 2: Start frontend development server
cd frontend
npm run dev

# Terminal 3: Start blockchain event listener (optional)
cd backend
node eventListener.js


Visit http://localhost:5173 to access the application.

## 📁 Project Structure


carbonchain-marketplace/
├── 📁 frontend/                 # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/       # React components
│   │   │   ├── CompanyRegistration.jsx
│   │   │   ├── Marketplace.jsx
│   │   │   ├── BuyingInterface.jsx
│   │   │   ├── CreditCard.jsx
│   │   │   └── ...
│   │   ├── 📁 services/         # Web3 and API services
│   │   ├── 📁 utils/           # Utility functions
│   │   └── 📁 abi/             # Smart contract ABIs
│   └── 📄 package.json
├── 📁 backend/                  # Node.js backend server
│   ├── 📄 server.js            # Express server
│   ├── 📄 mint.js              # NFT minting logic
│   ├── 📄 ipfs.js              # IPFS metadata handling
│   ├── 📄 eventListener.js     # Blockchain event processor
│   ├── 📄 consensus.js         # Hedera Consensus Service
│   └── 📄 package.json
├── 📁 backend-web3/            # Smart contracts
│   ├── 📁 contracts/
│   │   ├── 📄 company.sol      # Company registration
│   │   ├── 📄 Selling.sol      # Carbon credits marketplace
│   │   └── 📄 CarbonCreditBuying.sol # Enhanced buying with NFTs
│   ├── 📄 hardhat.config.cjs   # Hardhat configuration
│   └── 📄 package.json
└── 📄 README.md


## 🔧 Core Components

### Smart Contracts

#### 1. Company Registration (company.sol)
- Company KYC/KYB onboarding
- Hedera account ID mapping
- Verification workflow
- Emissions tracking

#### 2. Carbon Credits Marketplace (Selling.sol)
- Credit listing and trading
- Payment processing with fees
- Project verification
- Registry integration

#### 3. Enhanced Buying with NFTs (CarbonCreditBuying.sol)
- Automated NFT minting on purchase
- Integration with company registration
- Event-driven NFT creation
- Purchase tracking and confirmation

### Backend Services

#### API Server (server.js)
- RESTful API endpoints
- Carbon credit purchase processing
- NFT minting coordination
- CORS and security middleware

#### NFT Minting Service (mint.js)
- Hedera NFT creation
- Metadata generation and IPFS upload
- Token transfer to buyers
- Support for multiple NFT types

#### Blockchain Event Listener (eventListener.js)
- Real-time purchase detection
- Automatic NFT minting triggers
- Error handling and retry logic
- Smart contract state synchronization

### Frontend Application

#### React Components
- *CompanyRegistration*: Complete KYC/KYB form
- *Marketplace*: Browse and search carbon credits
- *BuyingInterface*: Purchase flow with wallet integration
- *CreditCard*: Individual credit listing display
- *Analytics*: Market data and portfolio views

#### Web3 Integration
- MetaMask wallet connection
- Smart contract interactions
- Dynamic Hedera account ID fetching
- Transaction status monitoring

## 🔄 User Journey

### 1. Company Registration
mermaid
graph LR
    A[Connect Wallet] --> B[Fill KYC Form]
    B --> C[Submit Registration]
    C --> D[Admin Verification]
    D --> E[Registration Complete]


### 2. Buying Carbon Credits
mermaid
graph LR
    A[Browse Marketplace] --> B[Select Credits]
    B --> C[Connect Wallet]
    C --> D[Execute Purchase]
    D --> E[Smart Contract Transfer]
    E --> F[Auto NFT Minting]
    F --> G[NFT Delivered to Hedera Account]


### 3. Selling Carbon Credits
mermaid
graph LR
    A[Register as Seller] --> B[List Credits]
    B --> C[Set Price & Details]
    C --> D[Marketplace Listing]
    D --> E[Buyer Purchase]
    E --> F[Automatic Payment Distribution]


## 🎨 NFT Certificates

Each carbon credit purchase automatically generates an NFT certificate containing:

- *Project Information*: Name, type, location, registry
- *Credit Details*: Amount, vintage year, serial numbers
- *Purchase Data*: Date, price, buyer/seller information
- *Verification*: Registry compliance and documentation links
- *Metadata*: IPFS-stored rich metadata with standards compliance

### NFT Metadata Structure
json
{
  "name": "Carbon Credit Purchase #123",
  "description": "Certificate of 5 tons CO2 offset from Forest Conservation Project",
  "attributes": [
    {"trait_type": "CO2 Offset Amount", "value": 5},
    {"trait_type": "Project Name", "value": "Amazon Rainforest Conservation"},
    {"trait_type": "Vintage Year", "value": 2024},
    {"trait_type": "Registry", "value": "Verified Carbon Standard (VCS)"}
  ]
}


## 📊 Analytics & Reporting

### Market Analytics
- Total carbon credits traded
- Price trends and market data
- Active buyers and sellers
- Project type distribution

### Company Dashboard
- Purchase history and certificates
- Emissions reduction tracking
- Portfolio value and performance
- Compliance reporting

## 🔐 Security Features

### Smart Contract Security
- Reentrancy protection
- Access control modifiers
- Input validation and sanitization
- Emergency pause functionality

### Backend Security
- Private key management
- Rate limiting and DDoS protection
- Input validation and sanitization
- Secure IPFS metadata handling

### Frontend Security
- XSS protection
- Secure wallet connections
- Input validation
- Error boundary handling

## 🌐 API Documentation

### Purchase Carbon Credits
http
POST /api/buy-carbon-credits
Content-Type: application/json

{
  "listingId": "1",
  "amount": 5,
  "buyerHederaAccountId": "0.0.123456",
  "listingDetails": {
    "projectName": "Forest Conservation Project",
    "projectType": "Carbon Credit",
    "projectCountry": "Brazil"
  }
}


### Mint NFT
http
POST /api/mint
Content-Type: application/json

{
  "type": "carbon-credit",
  "data": {
    "buyer": "0.0.123456",
    "amount": 5,
    "projectName": "Forest Conservation"
  }
}


### Consensus Service
http
POST /api/consensus/submitMessage
Content-Type: application/json

{
  "topicId": "0.0.123456",
  "message": "Carbon credit transaction data"
}


## 🚀 Deployment

### Production Deployment

1. *Smart Contracts*
bash
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network mainnet


2. *Backend*
bash
# Build and deploy backend
npm run build
pm2 start server.js --name carbonchain-backend


3. *Frontend*
bash
# Build for production
npm run build

# Deploy to hosting service (Vercel, Netlify, etc.)
vercel deploy --prod


### Environment Variables for Production
- Update all contract addresses to mainnet deployments
- Use production Hedera mainnet accounts
- Configure production IPFS gateways
- Set up monitoring and alerting

## 🧪 Testing

### Smart Contract Testing
bash
cd backend-web3
npx hardhat test


### Backend Testing
bash
cd backend
npm test


### Frontend Testing
bash
cd frontend
npm run test


## 🛣 Roadmap

### Phase 1: Core Platform ✅
- [x] Company registration and KYC
- [x] Carbon credits marketplace
- [x] NFT certificate minting
- [x] Wallet integration

### Phase 2: Enhanced Features 🚧
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Batch purchasing discounts

### Phase 3: Ecosystem Expansion 📋
- [ ] Carbon credit fractionalization
- [ ] Secondary market trading
- [ ] Cross-chain integration
- [ ] Carbon footprint tracking

### Phase 4: Enterprise Features 📋
- [ ] White-label solutions
- [ ] API for third-party integration
- [ ] Advanced reporting and compliance
- [ ] Carbon accounting automation

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code style and standards
- Pull request process
- Issue reporting
- Development workflow

### Development Setup

1. Fork the repository
2. Create a feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- *Manan Jain* - [@mananjain86](https://github.com/mananjain86) - Project Lead & Full-Stack Developer

## 🔗 Links

- *Website*: [carbonchain.market](https://carbonchain.market)
- *Documentation*: [docs.carbonchain.market](https://docs.carbonchain.market)
- *API Docs*: [api.carbonchain.market](https://api.carbonchain.market)
- *Hedera Portal*: [portal.hedera.com](https://portal.hedera.com)

## 📞 Support

For support and questions:

- 📧 Email: support@carbonchain.market
- 💬 Discord: [Join our community](https://discord.gg/carbonchain)
- 🐦 Twitter: [@CarbonChainMarket](https://twitter.com/CarbonChainMarket)
- 📖 Documentation: [GitHub Wiki](https://github.com/mananjain86/carbonchain-marketplace/wiki)

## 🙏 Acknowledgments

- [Hedera Hashgraph](https://hedera.com) for the NFT infrastructure
- [OpenZeppelin](https://openzeppelin.com) for smart contract libraries
- [Pinata](https://pinata.cloud) for IPFS hosting
- [Ethereum Foundation](https://ethereum.org) for the smart contract platform

---

<div align="center">
  <strong>🌱 Building a sustainable future with blockchain technology 🌱</strong>
</div>
