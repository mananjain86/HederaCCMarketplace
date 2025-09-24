// Web3 service for interacting with the CarbonCreditsMarketplace contract

import { ethers } from 'ethers';

// Contract ABI - This would typically be imported from a build folder
const contractABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_companyType", "type": "string"},
      {"internalType": "string", "name": "_legalEntityName", "type": "string"},
      {"internalType": "string", "name": "_registrationNumber", "type": "string"},
      {"internalType": "string", "name": "_jurisdiction", "type": "string"},
      {"internalType": "string", "name": "_registeredAddress", "type": "string"},
      {"internalType": "string", "name": "_principalBusinessAddress", "type": "string"},
      {"internalType": "string", "name": "_localPartners", "type": "string"},
      {"internalType": "string", "name": "_contactName", "type": "string"},
      {"internalType": "string", "name": "_contactEmail", "type": "string"},
      {"internalType": "string", "name": "_contactPhone", "type": "string"},
      {"internalType": "string", "name": "_website", "type": "string"},
      {"internalType": "string", "name": "_socialProfiles", "type": "string"},
      {"internalType": "string", "name": "_industry", "type": "string"},
      {"internalType": "string", "name": "_businessActivities", "type": "string"},
      {"internalType": "string", "name": "_keyIndividualsProof", "type": "string"},
      {"internalType": "string", "name": "_bankAccountDetails", "type": "string"},
      {"internalType": "string", "name": "_taxId", "type": "string"},
      {"internalType": "bool", "name": "_amlCompliance", "type": "bool"},
      {"internalType": "uint256", "name": "_scope1Emissions", "type": "uint256"},
      {"internalType": "uint256", "name": "_scope2Emissions", "type": "uint256"},
      {"internalType": "uint256", "name": "_scope3Emissions", "type": "uint256"},
      {"internalType": "string", "name": "_emissionsCalculationMethod", "type": "string"},
      {"internalType": "bool", "name": "_emissionsVerified", "type": "bool"},
      {"internalType": "string", "name": "_verificationStatement", "type": "string"},
      {"internalType": "string", "name": "_decarbonizationStrategy", "type": "string"},
      {"internalType": "string", "name": "_climatePledges", "type": "string"}
    ],
    "name": "registerCompany",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_company", "type": "address"}],
    "name": "getCompanyDetails",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "companyType", "type": "string"},
      {"internalType": "bool", "name": "isRegistered", "type": "bool"},
      {"internalType": "uint256", "name": "carbonCreditsOwned", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPurchases", "type": "uint256"},
      {"internalType": "uint256", "name": "totalSales", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_company", "type": "address"}],
    "name": "getCompanyKYCDetails",
    "outputs": [
      {"internalType": "string", "name": "legalEntityName", "type": "string"},
      {"internalType": "string", "name": "registrationNumber", "type": "string"},
      {"internalType": "string", "name": "jurisdiction", "type": "string"},
      {"internalType": "string", "name": "registeredAddress", "type": "string"},
      {"internalType": "string", "name": "principalBusinessAddress", "type": "string"},
      {"internalType": "string", "name": "localPartners", "type": "string"},
      {"internalType": "string", "name": "contactName", "type": "string"},
      {"internalType": "string", "name": "contactEmail", "type": "string"},
      {"internalType": "string", "name": "contactPhone", "type": "string"},
      {"internalType": "string", "name": "website", "type": "string"},
      {"internalType": "string", "name": "socialProfiles", "type": "string"},
      {"internalType": "string", "name": "industry", "type": "string"},
      {"internalType": "string", "name": "businessActivities", "type": "string"},
      {"internalType": "string", "name": "keyIndividualsProof", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "company", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "companyType", "type": "string"}
    ],
    "name": "CompanyRegistered",
    "type": "event"
  }
];

// Contract address - This would be set after deployment
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.isConnected = false;
  }

  async connectWallet() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Check if contract address is configured
        if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x1234567890123456789012345678901234567890") {
          console.warn('Contract address not properly configured. Using placeholder address.');
        }
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        
        // Create contract instance
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.signer);
        
        this.isConnected = true;
        
        // Get connected address
        const address = await this.signer.getAddress();
        
        return {
          success: true,
          address: address
        };
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkWalletConnection() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
          this.signer = this.provider.getSigner();
          this.contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, this.signer);
          this.isConnected = true;
          return accounts[0];
        }
      }
      return null;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      return null;
    }
  }

  async registerCompany(formData) {
    try {
      if (!this.isConnected || !this.contract) {
        throw new Error('Wallet not connected');
      }

      // Convert emissions values to BigNumber (assuming they're in tons)
      const scope1 = ethers.utils.parseUnits((formData.scope1Emissions || '0').toString(), 0);
      const scope2 = ethers.utils.parseUnits((formData.scope2Emissions || '0').toString(), 0);
      const scope3 = ethers.utils.parseUnits((formData.scope3Emissions || '0').toString(), 0);

      // Call the smart contract function
      const tx = await this.contract.registerCompany(
        formData.name || '',
        formData.companyType || 'buyer',
        formData.legalEntityName || '',
        formData.registrationNumber || '',
        formData.jurisdiction || '',
        formData.registeredAddress || '',
        formData.principalBusinessAddress || '',
        formData.localPartners || '',
        formData.contactName || '',
        formData.contactEmail || '',
        formData.contactPhone || '',
        formData.website || '',
        formData.socialProfiles || '',
        formData.industry || '',
        formData.businessActivities || '',
        formData.keyIndividualsProof || '',
        formData.bankAccountDetails || '',
        formData.taxId || '',
        formData.amlCompliance || false,
        scope1,
        scope2,
        scope3,
        formData.emissionsCalculationMethod || '',
        formData.emissionsVerified || false,
        formData.verificationStatement || '',
        formData.decarbonizationStrategy || '',
        formData.climatePledges || ''
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('Error registering company:', error);
      
      // Parse error message for user-friendly display
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getCompanyDetails(address) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const details = await this.contract.getCompanyDetails(address);
      const kycDetails = await this.contract.getCompanyKYCDetails(address);
      
      return {
        success: true,
        data: {
          name: details.name,
          companyType: details.companyType,
          isRegistered: details.isRegistered,
          carbonCreditsOwned: details.carbonCreditsOwned.toString(),
          totalPurchases: details.totalPurchases.toString(),
          totalSales: details.totalSales.toString(),
          legalEntityName: kycDetails.legalEntityName,
          registrationNumber: kycDetails.registrationNumber,
          jurisdiction: kycDetails.jurisdiction,
          // ... other KYC fields
        }
      };
    } catch (error) {
      console.error('Error fetching company details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async isCompanyRegistered(address) {
    try {
      if (!this.contract) {
        return false;
      }
      
      const details = await this.contract.getCompanyDetails(address);
      return details.isRegistered;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  }

  // Listen for contract events
  onCompanyRegistered(callback) {
    if (this.contract) {
      this.contract.on('CompanyRegistered', (company, name, companyType, event) => {
        callback({
          company,
          name,
          companyType,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      });
    }
  }

  // Clean up event listeners
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// Export singleton instance
export const web3Service = new Web3Service();

// Helper functions
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTransactionHash = (hash) => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};