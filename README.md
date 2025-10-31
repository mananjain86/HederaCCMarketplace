# 🌱 CarbonChain Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-red.svg)](https://soliditylang.org/)
[![Hedera](https://img.shields.io/badge/Hedera-Hashgraph-purple.svg)](https://hedera.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

> **AI-Powered Carbon Credits & Forest Tokenization — Cross-Chain, Transparent, and Automated**

---

## 🏆 Project Title & Track

**Project Name:** CarbonChain Marketplace  
**Track:** Onchain Finance & RWA (Real-World Assets)

---

## 🚀 Overview

CarbonChain Marketplace is a decentralized platform that enables companies and individuals to buy, sell, and tokenize verified carbon credits and forest areas. Leveraging Ethereum smart contracts for marketplace logic and Hedera Hashgraph for NFT minting, consensus, and decentralized storage, CarbonChain brings transparency, automation, and real-world impact to environmental markets.

---

## ✨ Key Features

- **AI-Driven Dynamic Regeneration Scoring**  
  An on-chain metric (scaled 0-1000) updated by trusted oracles (Relayers) based on off-chain AI analysis using Gemini API
  - Uses satellite imagery data (based on the forest coordinates) + Rate of Carbon Dioxide Sequestration (Planet API)
  - Data from the IOT sensors (Temprature, Humidity, Soil Moisture, Air Quality, Light Intensity) planted at the forest.  
  **Dynamic Pricing of Forest NFTs:** This score dynamically adjusts the price of forest shares and determines the carbon yield generated over time.

- **Cross-Chain Asset Management**  
  Ethereum smart contracts for trading and settlement; Hedera for NFT certificates **(HTS)** and consensus **(HCS)** .

- **Automated NFT Certificates**  
  Every purchase mints a unique NFT (carbon credit or forest deed) on Hedera, with metadata stored on IPFS via Pinata.

  **Dynamic Forest NFTs:** The metadata for the forest nfts changes based on the regeneration score of the forest. One would be able to see different image of the NFT based   on the current regeneration scores. After changes in forest data the NFT metadata is automatically updated.  

- **Transparent On-Chain Records**  
  All transactions, purchases, and NFT mints are tracked on-chain and posted via Hedera Consensus Service.
  The Metadata of the minted NFTs also contain informations such as Transaction hash, Hedera Token ID, and buyer ID.

- **KYC/KYB & Compliance**  
  Company onboarding, verification, and compliance checks integrated into the registration and trading flow.
  Off chain compliance and KYC can be done for our Carbon Credit as well as the Forest Tokens - built **ERC3643** functionalities using HTS

- **Real-Time Analytics**  
  Market data, environmental impact, and portfolio dashboards for buyers, sellers, and project owners.

- **DAO Governance**  
  Forest DAOs for decentralized proposal and voting on conservation actions.
  
  One major issue arises when native communities are displaced or banned from traditional hunting and gathering after corporations purchase forest land for so-called environmental projects. CarbonChain solves this by introducing DAO-based governance through forest tokens, giving both natives and companies an equal voice in forest conservation decisions that benefit all stakeholders.

- **Multi-Wallet Support**  
  MetaMask for Ethereum, HashConnect for Hedera (Token Association).
  
- **Forest Data Oracle**  
The oracle streams real-time IoT data from forest sensors including metrics like soil health, humidity, and CO₂ levels directly to the blockchain. It computes a Regeneration Score that reflects the land’s ecological health and recovery potential. This enables transparent, data-backed insights into forest vitality for on-chain applications.

---

## 🪙 Hedera Integration Summary (Detailed)

CarbonChain leverages multiple Hedera services to ensure scalability, transparency, and verifiable trust for carbon markets in Africa.

### 🌿 Hedera Token Service (HTS)
We use HTS to mint and manage both Carbon Credit and Dynamic Forest NFTs.  
**Why:** HTS provides native tokenization with predictable, low fees and finality under 5 seconds - ideal for high-volume, low-margin carbon transactions.  
**Transaction Types:** Token creation, minting, association, and transfer.  
**Economic Justification:** Compared to Ethereum gas fees (~$0.30–$3), HTS fees remain stable and affordable for smallholder reforestation projects, making carbon participation accessible in African markets.

---

### 🔗 Hedera Consensus Service (HCS)
Used for immutable logging of purchase events, AI score updates, and oracle submissions.  
**Why:** HCS ensures trust and auditability for critical environmental data and trading records.  
**Transaction Types:** Topic creation, message submission, and querying topic messages.  
**Economic Justification:** At a predictable $0.0001 per message, HCS provides a cost-stable way to maintain transparent climate audit trails, ensuring operational feasibility even in micro-scale projects.

---

### 🧠 Hedera Smart Contracts (EVM)
The cross-chain Ethereum smart contracts interact with Hedera through EVM-compatible bridges for yield and DAO logic.  
**Why:** To allow seamless interoperability while using Hedera for storage and final certification.  
**Transaction Types:** Contract deployment, read/write state changes.  
**Economic Justification:** Hedera’s ABFT consensus ensures secure finality while bridging low-cost operations with Ethereum’s DeFi ecosystem.

---

## 🏗️ Architecture
<img width="1920" height="1080" alt="Carbon Chain Architecture" src="https://github.com/user-attachments/assets/3f1eabc5-4150-4d9b-aca3-1d03aa5df488" />

---

## 💡 How It Works

### Forest NFTs

1. **Company Registration & KYC**  
   Companies onboard via a KYC/KYB form, verified on-chain, off-chain compliance layer and KYC grants by admins.

2. **Marketplace Listing**  
   Government list forest areas, providing documentation and compliance data.

3. **AI-Powered Scoring**  
   Forest health and regeneration scores are calculated using AI, influencing pricing and yield.

4. **Purchase & Tokenization**  
   Buyers purchase assets using MetaMask (Ethereum). The backend mints a corresponding NFT on Hedera and stores metadata on IPFS.

5. **NFT Delivery & Audit Trail**  
   NFT certificates are delivered to the buyer’s Hedera account. All actions are recorded on-chain and via Hedera Consensus Service.
   
6. **Yield Generation**
   Based on the amount of shares and the regeneration score of the forest the share holders would get yield reward as Carbon Credits getting added to their portfolio.

7. **DAO Governance**  
   Forest DAOs allow stakeholders to propose and vote on conservation actions.

### Carbon Credit NFTs

1. **Company Registration & KYC**  
   Companies onboard via a KYC/KYB form, verified on-chain, off-chain compliance layer and KYC grants by admins.

2. **Marketplace Listing**  
   Sellers list carbon credits, providing documentation and compliance data.

3. **Purchase & Tokenization**  
   Buyers purchase assets using MetaMask (Ethereum). The backend mints a corresponding NFT on Hedera and stores metadata on IPFS.

4. **NFT Delivery & Audit Trail**  
   NFT certificates are delivered to the buyer’s Hedera account. All actions are recorded on-chain and via Hedera Consensus Service.
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
npm run dev
# Backend will start running at localhost:5000

# Frontend setup
cd frontend
npm install
npm run dev
# Frontend will start running at localhost:5173

# Smart contract setup
cd backend-web3
npm install
npx hardhat compile
npx hardhat run deploy.js --network < network-name > 
# Update .env files with deployed addresses
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
GEMINI_API_KEY=your-api-key
HCS_TOPIC_ID=0.0.XXXXXXX
HEDERA_RPC_URL=https://
FOREST_CONTRACT_ADDRESS="0x..."
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

## 🎨 NFT Certificates

### Carbon Credit NFT

```json
{
  "name": "Carbon Credit #512",
  "description": "Tradable carbon credit representing 5 tons of CO₂ offset.",
  "image": "ipfs://",
  "properties": {
    "credit_id": 512,
    "co2_offset_tons": 5,
    "purchase_price_hbar": "0.075",
    "owner": "0.0.123456",
    "asset_type": "Carbon Credit",
    "certification_standard": "Verified Carbon Standard (VCS)",
    "vintage_year": 2025,
    "minted_at": "2025-10-31T10:00:00Z"
  }
}
```

### Forest Area NFT

```json
{
  "name": "Forest Shares (10) - Amazon Rainforest, Acre",
  "description": "Fractional ownership certificate for 10 shares in Amazon Rainforest, Acre, linked to Forest ID 1023.",
  "image": "ipfs://QmHash.../forest_image.jpg",
  "attributes": [
    {"trait_type": "Asset Type", "value": "Forest Share Certificate"},
    {"trait_type": "Forest ID", "value": "1023"},
    {"trait_type": "Location", "value": "Amazon Rainforest, Acre"},
    {"trait_type": "Shares Bought", "value": "10"},
    {"trait_type": "Regeneration Score", "value": "725", "display_type": "number"},
    {"trait_type": "Baseline Sequestration (CO2/yr)", "value": "3.8", "display_type": "number"},
    {"trait_type": "Potential Sequestration (CO2/yr)", "value": "6.4", "display_type": "number"},
    {"trait_type": "Sustainability Rating", "value": "A"},
    {"trait_type": "Original NFT ID", "value": "9876"}
  ],
  "properties": {
    "asset_type": "Forest Share Certificate",
    "forest_id": 1023,
    "shares_bought": 10,
    "location": "Amazon Rainforest, Acre",
    "total_forest_area_sq_m": 25000,
    "original_nft_id": "9876",
    "ipfs_deed_hash": "QmDeedHash...",
    "owner_account_id": "0.0.345678",
    "owner_eth_address": "0xAbc123...",
    "price_paid_hbar": "0.082",
    "purchase_tx_hash": "0xTxHash...",
    "regeneration_score": 725,
    "baseline_sequestration_c02_yr": 3.8,
    "potential_sequestration_c02_yr": 6.4,
    "sustainability_rating": "A",
    "certification_status": "Verified",
    "minted_at": "2025-10-31T10:00:00Z"
  }
}
```
<img width="697" height="333" alt="image" src="https://github.com/user-attachments/assets/84a808d3-d7b7-4336-9325-d51a7d0bc7e3" />


---

## 🌐 API Endpoints

- `POST /api/mint` — Mint NFT (carbon-credit or forest)
- `POST /api/tokenize-purchase` — Tokenize carbon credit purchase
- `POST /api/tokenize-forest-purchase` — Tokenize forest area purchase
- `POST /api/ai/regeneration-score` — AI-powered forest health scoring
- `POST /api/consensus/submitMessage` — Submit message to Hedera Consensus Service
- `GET /api/consensus/queryTopic/:topicId` — Query HCS topic messages
- `GET /api/forest-data/:forestId` — Query forest data stored onchain , our oracle endpoint

---

## 🪪 Deployed Hedera IDs (Testnet)

| Resource Type | Description | Hedera Testnet ID |
|----------------|-------------|------------------|
| Operator Account | Backend wallet used for token minting | 0.0.6780075 |
| Forest NFT Token | HTS token for forest ownership certificates | 0.0.7074734 |
| Carbon Credit NFT Token | HTS token for carbon credits | 0.0.7074735 |
| HCS Topic | storing post-purchase transaction data for carbon credit and forest share buys | 0.0.6886610 |
| HCS Topic | storing IoT sensor feed for forests | 0.0.6886609 |

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
- [x] Advanced analytics dashboard
- [x] Batch purchasing
- [X] DAO governance for forest management
- [X] Providing Oracle using onchain forest data
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
NOTE: Before testing the platform through below URLs make sure to call https://carbonchain-backend.onrender.com/api/health to wake up the backend.

**Frontend URL:** https://carbonchain-qupo.onrender.com  
**Backend URL:**  https://carbonchain-backend.onrender.com  
**Forest Oracle** `https://carbonchain-backend.onrender.com/api/forest-data/<forest-id>`  
example: https://carbonchain-backend.onrender.com/api/forest-data/1

---
**Hedera Certification:** https://drive.google.com/file/d/1BJx4QggGaNkC9PbP3R9jiKA58TWIeIRG/view?usp=sharing  
**Pitch Deck** https://drive.google.com/file/d/1K8omyRfoN2R-Jl0qMRgQKEmXst187Djs/view?usp=sharing  
**Demo Video** https://drive.google.com/file/d/1v_Z5O7vt55dxF39f7ADkaOxcNyn4AxHZ/view

---
## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>🌱 Building a sustainable future through blockchain innovation 🌱</strong><br>
  <em>Made with ❤️ for environmental sustainability and carbon transparency</em>
</div>
