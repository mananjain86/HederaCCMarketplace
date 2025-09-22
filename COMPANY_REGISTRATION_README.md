# Company Registration System

## Overview

This system provides a comprehensive company registration form for the CarbonChain marketplace, allowing companies to register with detailed KYC/KYB information, financial details, and carbon emissions data directly on the blockchain.

## Features

### Multi-Step Registration Process

1. **General Company Information (KYC/KYB)**
   - Legal entity name and registration details
   - Jurisdiction and business addresses
   - Contact information and industry details
   - Local partners and key individuals

2. **Financial & Compliance Information**
   - Bank account details for transactions
   - Tax identification number (TIN)
   - Anti-Money Laundering (AML) compliance declaration

3. **Carbon Emissions & Climate Strategy**
   - Historical GHG emissions data (Scope 1, 2, 3)
   - Emissions calculation methodology
   - Third-party verification status
   - Decarbonization strategy and climate pledges

### Technical Features

- **Blockchain Integration**: All company data is stored on-chain using Ethereum smart contracts
- **Wallet Connection**: MetaMask integration for secure transaction signing
- **Form Validation**: Comprehensive client-side validation with real-time error feedback
- **Responsive Design**: Works on desktop and mobile devices
- **Progress Tracking**: Step-by-step progress indicator

## Smart Contract

The registration data is stored in an enhanced `Company` struct that includes:

```solidity
struct Company {
    // Basic info
    string name;
    string companyType; // "buyer", "seller", or "both"
    bool isRegistered;
    uint256 carbonCreditsOwned;
    uint256 totalPurchases;
    uint256 totalSales;
    
    // KYC/KYB Information
    string legalEntityName;
    string registrationNumber;
    string jurisdiction;
    string registeredAddress;
    string principalBusinessAddress;
    string localPartners;
    string contactName;
    string contactEmail;
    string contactPhone;
    string website;
    string socialProfiles;
    string industry;
    string businessActivities;
    string keyIndividualsProof;
    
    // Financial and Compliance
    string bankAccountDetails;
    string taxId;
    bool amlCompliance;
    
    // Carbon Emissions Data
    uint256 scope1Emissions;
    uint256 scope2Emissions;
    uint256 scope3Emissions;
    string emissionsCalculationMethod;
    bool emissionsVerified;
    string verificationStatement;
    string decarbonizationStrategy;
    string climatePledges;
    uint256 registrationTimestamp;
}
```

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MetaMask browser extension
- Access to an Ethereum network (local or testnet)

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Update `VITE_CONTRACT_ADDRESS` with your deployed contract address (Vite uses VITE_ prefix)
   - Configure network settings as needed

3. **Deploy Smart Contract** (if needed):
   - Deploy the `main.sol` contract to your chosen network
   - Update the contract address in your environment variables

4. **Start the application**:
   ```bash
   npm run dev
   ```

### Usage

1. **Access Registration**:
   - Click "Register Company" in the navigation bar
   - Connect your MetaMask wallet when prompted

2. **Complete Registration**:
   - Fill out all three steps of the registration form
   - Review and submit your information
   - Confirm the blockchain transaction in MetaMask

3. **Verification**:
   - Wait for transaction confirmation
   - Your company will be registered on the blockchain
   - You can now participate in the carbon credits marketplace

## Form Validation

The system includes comprehensive validation:

### Step 1 - General Information
- **Required fields**: Legal entity name, registration number, jurisdiction, contact name, contact email
- **Email validation**: Proper email format validation
- **Phone validation**: International phone number format support
- **URL validation**: Website URL format checking

### Step 2 - Financial & Compliance
- **Required fields**: Tax ID, AML compliance declaration
- **Tax ID validation**: Minimum length and format requirements
- **AML compliance**: Mandatory checkbox for regulatory compliance

### Step 3 - Carbon Emissions
- **Required fields**: Emissions calculation methodology
- **Numeric validation**: Proper format for emissions values
- **Conditional validation**: Verification statement required if emissions are verified

## Security Considerations

- All sensitive data is validated on both client and smart contract levels
- MetaMask provides secure transaction signing
- Input sanitization prevents injection attacks
- Client-side validation provides immediate feedback
- Server-side validation ensures data integrity

## Supported Networks

- Ethereum Mainnet
- Ethereum Testnets (Goerli, Sepolia)
- Local development networks (Hardhat, Ganache)
- Other EVM-compatible networks

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**:
   - Ensure MetaMask is installed and unlocked
   - Check that you're connected to the correct network
   - Refresh the page if connection fails

2. **Transaction Failures**:
   - Ensure sufficient ETH for gas fees
   - Check that all required fields are completed
   - Verify the contract address is correct

3. **Validation Errors**:
   - Review error messages for specific field requirements
   - Ensure email addresses are in proper format
   - Complete all required fields before proceeding

### Support

For technical support or questions about the registration system, please refer to the project documentation or contact the development team.

## Future Enhancements

- Document upload for KYC verification
- Integration with external identity verification services
- Multi-signature support for enterprise accounts
- Advanced carbon footprint calculation tools
- Integration with carbon credit verification standards (VCS, Gold Standard)