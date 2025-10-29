# 🌱 CarbonChain Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-red.svg)](https://soliditylang.org/)
[![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-purple.svg)](https://hedera.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> **AI-Powered Carbon Credits & Forest Tokenization — Cross-Chain, Transparent, and Automated**

---

## 🚀 Overview

CarbonChain Marketplace is a decentralized platform that enables companies and individuals to buy, sell, and tokenize verified carbon credits and forest areas. Leveraging Ethereum smart contracts for marketplace logic and Hedera Hashgraph for NFT minting, consensus, and decentralized storage, CarbonChain brings transparency, automation, and real-world impact to environmental markets.

---

## ✨ Key Features

- **AI-Driven Regeneration Scoring**  
  Uses Gemini AI to analyze IoT and satellite data, generating dynamic forest health scores and influencing pricing.

- **Cross-Chain Asset Management**  
  Ethereum smart contracts for trading and settlement; Hedera for NFT certificates and consensus.

- **Automated NFT Certificates**  
  Every purchase mints a unique NFT (carbon credit or forest deed) on Hedera, with metadata stored on IPFS via Pinata.

- **Transparent On-Chain Records**  
  All transactions, purchases, and NFT mints are tracked on-chain and auditable via Hedera Consensus Service.

- **KYC/KYB & Compliance**  
  Company onboarding, verification, and compliance checks integrated into the registration and trading flow.

- **Real-Time Analytics**  
  Market data, environmental impact, and portfolio dashboards for buyers, sellers, and project owners.

- **DAO Governance**  
  Forest DAOs for decentralized proposal and voting on conservation actions.

- **Multi-Wallet Support**  
  MetaMask for Ethereum, HashConnect for Hedera.

---

## 🏗️ Architecture

```
┌───────────────┐    ┌───────────────┐    ┌────────────────────┐
│   Frontend    │    │   Backend     │    │   Blockchain       │
│ (React/Vite)  │◄──►│ (Node.js/Exp) │◄──►│ Ethereum + Hedera  │
│ • Marketplace │    │ • API Server  │    │ • Smart Contracts  │
│ • Analytics   │    │ • NFT Minting │    │ • NFT Storage      │
│ • Wallets     │    │ • AI Scoring  │    │ • HCS Topics       │
└───────────────┘    └───────────────┘    └────────────────────┘
```

---

## 💡 How It Works

1. **Company Registration & KYC**  
   Companies onboard via a KYC/KYB form, verified on-chain and by admins.

2. **Marketplace Listing**  
   Sellers list carbon credits or forest areas, providing documentation and compliance data.

3. **AI-Powered Scoring**  
   Forest health and regeneration scores are calculated using AI, influencing pricing and yield.

4. **Purchase & Tokenization**  
   Buyers purchase assets using MetaMask (Ethereum). The backend mints a corresponding NFT on Hedera and stores metadata on IPFS.

5. **NFT Delivery & Audit Trail**  
   NFT certificates are delivered to the buyer’s Hedera account. All actions are recorded on-chain and via Hedera Consensus Service.

6. **DAO Governance**  
   Forest DAOs allow stakeholders to propose and vote on conservation actions.

---

## 🧩 Tech Stack

| Component         | Technology                        |
|-------------------|-----------------------------------|
| Smart Contracts   | Solidity, Hardhat                 |
| Cross-Chain Layer | Ethereum (Sepolia), Hedera Hashgraph |
| NFTs              | Hedera Token Service (HTS)        |
| Frontend          | React, Vite, TailwindCSS          |
| AI Engine         | Gemini API                        |
| Blockchain APIs   | HashConnect, MetaMask, ethers.js  |
| Backend           | Node.js, Express                  |
| Storage           | IPFS / Pinata                     |
| Analytics         | Planet API                        |

---

## ⚙️ Setup & Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/carbonchain-marketplace.git
cd carbonchain-marketplace

# Install root dependencies
npm install

# Backend setup
cd backend
npm install

# Frontend setup
cd frontend
npm install

# Smart contract setup
cd backend-web3
npm install
```

---

## 🔗 Environment Variables

### Backend (`backend/.env`)
```
OPERATOR_ID=0.0.YOUR_HEDERA_ACCOUNT
OPERATOR_KEY=YOUR_HEDERA_PRIVATE_KEY
PINATA_JWT=YOUR_PINATA_JWT_TOKEN
GATEWAY_URL=https://gateway.pinata.cloud
PLANET_API_KEY=your-api-key
IOT_TOPIC_ID=0.0.XXXXXXX
REGEN_TOPIC_ID=0.0.XXXXXXX
GEMINI_API_KEY=your-api-key
```

### Frontend (`frontend/.env`)
```
VITE_HASHCONNECT_PROJECT_ID=your-hashconnect-project-id
VITE_CARBON_CONTRACT_ADDRESS="0x..."
VITE_COMPANY_CONTRACT_ADDRESS="0x..."
VITE_FOREST_CONTRACT_ADDRESS="0x..."
VITE_HEDERA_PRIVATE_KEY=your-private-key
VITE_CARBON_TOKEN_ID="0.0.XXXXXXX"
VITE_FOREST_TOKEN_ID="0.0.XXXXXXX"
VITE_BACKEND_URL="http://localhost:5000"
```

### Backend-web3 (`backend-web3/.env`)
```
SEPOLIA_RPC_URL=https://
SEPOLIA_PRIVATE_KEY=your-private-key
HEDERA_RPC_URL=https://...
HEDERA_PRIVATE_KEY=your-private-key
```
---

## 🌍 Deployment

### Smart Contracts

```bash
cd backend-web3
npx hardhat compile
npx hardhat run deploy.js --network sepolia
# Update .env files with deployed addresses
```

---

## 🎨 NFT Certificates

### Carbon Credit NFT

```json
{
  "name": "Carbon Credit Certificate #123",
  "description": "Certificate for 5 tons CO2 offset from verified forest conservation project",
  "image": "ipfs://QmHash.../certificate.png",
  "attributes": [
    {"trait_type": "CO2 Offset Amount", "value": "5 tons"},
    {"trait_type": "Project Name", "value": "Amazon Rainforest Conservation"},
    {"trait_type": "Vintage Year", "value": "2024"},
    {"trait_type": "Registry", "value": "Verified Carbon Standard (VCS)"},
    {"trait_type": "Project Country", "value": "Brazil"},
    {"trait_type": "Purchase Date", "value": "2024-10-04"}
  ],
  "properties": {
    "ethereum_tx_hash": "0x...",
    "buyer_hedera_id": "0.0.123456",
    "amount": 5,
    "total_price": "0.075 HBAR"
  }
}
```

### Forest Area NFT

```json
{
  "name": "Forest Area Deed #456",
  "description": "Digital deed for 2.5 hectares of protected forest land",
  "image": "ipfs://QmHash.../forest_deed.jpg",
  "attributes": [
    {"trait_type": "Area Size", "value": "2.5 hectares"},
    {"trait_type": "Location", "value": "Costa Rica, Guanacaste Province"},
    {"trait_type": "Conservation Status", "value": "Protected"},
    {"trait_type": "Biodiversity Score", "value": "High"},
    {"trait_type": "Purchase Date", "value": "2024-10-04"}
  ],
  "properties": {
    "ethereum_tx_hash": "0x...",
    "buyer_hedera_id": "0.0.789012",
    "area_hectares": 2.5,
    "deed_ipfs_hash": "QmDeedHash..."
  }
}
```

---

## 🌐 API Endpoints

- `POST /api/mint` — Mint NFT (carbon-credit or forest)
- `POST /api/tokenize-purchase` — Tokenize carbon credit purchase
- `POST /api/tokenize-forest-purchase` — Tokenize forest area purchase
- `POST /api/ai/regeneration-score` — AI-powered forest health scoring
- `POST /api/consensus/submitMessage` — Submit message to Hedera Consensus Service
- `GET /api/consensus/queryTopic/:topicId` — Query HCS topic messages

---

## 📊 Analytics & Reporting

- **Total Credits Traded** — Volume and value metrics
- **Forest Area Transactions** — Hectares sold and impact
- **Price Trends** — Historical and real-time data
- **Portfolio Dashboards** — For buyers, sellers, and companies
- **Environmental Impact** — CO₂ offset, forest protection, and more

---

## 🛡️ Security

- Smart contract access controls, reentrancy protection, and input validation
- Backend key management, rate limiting, and secure IPFS handling
- Frontend XSS protection, wallet security, and error boundaries

---

## 🛣️ Roadmap

- [x] Company registration and KYC/KYB
- [x] Carbon credits and forest area marketplace
- [x] NFT certificate minting on Hedera
- [x] AI-powered forest scoring
- [x] MetaMask and HashConnect integration
- [ ] Advanced analytics dashboard
- [ ] Batch purchasing and volume discounts
- [ ] DAO governance for forest management
- [ ] Cross-chain expansion (Polygon, Arbitrum)
- [ ] Mobile and multi-language support

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo and create a feature branch
2. Install dependencies in all directories
3. Set up environment variables as described above
4. Make your changes and test thoroughly
5. Open a Pull Request

**Code Standards:**  
- JavaScript/React: ESLint  
- Solidity: Hardhat best practices  
- Conventional commits and documentation required

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>🌱 Building a sustainable future through blockchain innovation 🌱</strong><br>
  <em>Made with ❤️ for environmental sustainability and carbon transparency</em>
</div>