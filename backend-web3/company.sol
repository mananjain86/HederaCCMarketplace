// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HandleCompany {
    
    // Events
    event CompanyRegistered(address indexed company, string name, string hederaAccountId);
    event CompanyVerified(address indexed company, address indexed verifier, uint256 timestamp);
    event CompanyRejected(address indexed company, address indexed verifier, string reason, uint256 timestamp);
    
    // Enums
    enum VerificationStatus {
        Pending,     // Default status after registration
        Verified,    // Approved by admin/verifier
        Rejected,    // Rejected by admin/verifier
        Suspended    // Temporarily suspended
    }
    
    // Structs
    struct Company {
        // Basic info
        string name;
        string hederaAccountId; // Added Hedera account ID
        bool isRegistered;
        VerificationStatus verificationStatus;
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
        string walletAddress;
        string taxId;
        bool amlCompliance;
        
        // Carbon Emissions Data
        uint256 scope1Emissions; // Direct emissions
        uint256 scope2Emissions; // Indirect energy emissions
        uint256 scope3Emissions; // Value chain emissions
        string emissionsCalculationMethod;
        bool emissionsVerified;
        string verificationStatement;
        string decarbonizationStrategy;
        string climatePledges;
        uint256 registrationTimestamp;
        uint256 verificationTimestamp;
        string rejectionReason;
    }
        
    // State variables
    mapping(address => Company) public companies;
    mapping(address => bool) public verifiers; // Authorized verifiers
    mapping(address => string) public AddressTohederaAccount; // Map Hedera account ID to Ethereum address
    
    address[] public registeredCompanies;
    address[] public pendingVerificationCompanies;
    
    address public owner;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegisteredCompany() {
        require(companies[msg.sender].isRegistered, "Company must be registered");
        _;
    }
    
    modifier onlyVerifiedCompany() {
        require(companies[msg.sender].isRegistered, "Company must be registered");
        require(companies[msg.sender].verificationStatus == VerificationStatus.Verified, "Company must be verified");
        _;
    }
    
    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner, "Only authorized verifiers can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        verifiers[msg.sender] = true; // Owner is default verifier
    }
    
    // Verifier management functions
    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        verifiers[_verifier] = true;
    }
    
    function removeVerifier(address _verifier) external onlyOwner {
        require(_verifier != owner, "Cannot remove owner as verifier");
        verifiers[_verifier] = false;
    }
    
    // Company registration functions
    function registerCompany(
        string memory _name,
        string memory _hederaAccountId, // Added parameter
        string memory _legalEntityName,
        string memory _registrationNumber,
        string memory _jurisdiction,
        string memory _registeredAddress,
        string memory _principalBusinessAddress,
        string memory _localPartners,
        string memory _contactName,
        string memory _contactEmail,
        string memory _contactPhone,
        string memory _website,
        string memory _socialProfiles,
        string memory _industry,
        string memory _businessActivities,
        string memory _keyIndividualsProof,
        string memory _walletAddress,
        string memory _taxId,
        bool _amlCompliance,
        uint256 _scope1Emissions,
        uint256 _scope2Emissions,
        uint256 _scope3Emissions,
        string memory _emissionsCalculationMethod,
        bool _emissionsVerified,
        string memory _verificationStatement,
        string memory _decarbonizationStrategy,
        string memory _climatePledges
    ) external {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        require(bytes(_legalEntityName).length > 0, "Legal entity name required");
        require(bytes(_registrationNumber).length > 0, "Registration number required");
        require(bytes(_contactEmail).length > 0, "Contact email required");
        require(_amlCompliance, "AML compliance declaration required");
        
        companies[msg.sender] = Company({
            name: _name,
            hederaAccountId: _hederaAccountId, // Added field
            isRegistered: true,
            verificationStatus: VerificationStatus.Pending, // Default to pending
            carbonCreditsOwned: 0,
            totalPurchases: 0,
            totalSales: 0,
            legalEntityName: _legalEntityName,
            registrationNumber: _registrationNumber,
            jurisdiction: _jurisdiction,
            registeredAddress: _registeredAddress,
            principalBusinessAddress: _principalBusinessAddress,
            localPartners: _localPartners,
            contactName: _contactName,
            contactEmail: _contactEmail,
            contactPhone: _contactPhone,
            website: _website,
            socialProfiles: _socialProfiles,
            industry: _industry,
            businessActivities: _businessActivities,
            keyIndividualsProof: _keyIndividualsProof,
            walletAddress: _walletAddress,
            taxId: _taxId,
            amlCompliance: _amlCompliance,
            scope1Emissions: _scope1Emissions,
            scope2Emissions: _scope2Emissions,
            scope3Emissions: _scope3Emissions,
            emissionsCalculationMethod: _emissionsCalculationMethod,
            emissionsVerified: _emissionsVerified,
            verificationStatement: _verificationStatement,
            decarbonizationStrategy: _decarbonizationStrategy,
            climatePledges: _climatePledges,
            registrationTimestamp: block.timestamp,
            verificationTimestamp: 0,
            rejectionReason: ""
        });
        
        // Map Hedera account ID to Ethereum address
        AddressTohederaAccount[msg.sender] = _hederaAccountId;
        
        registeredCompanies.push(msg.sender);
        pendingVerificationCompanies.push(msg.sender);
        
        emit CompanyRegistered(msg.sender, _name, _hederaAccountId);
    }
    
    // Company verification functions
    function verifyCompany(address _company) external onlyVerifier {
        require(companies[_company].isRegistered, "Company not registered");
        require(companies[_company].verificationStatus == VerificationStatus.Pending, "Company not in pending status");
        
        companies[_company].verificationStatus = VerificationStatus.Verified;
        companies[_company].verificationTimestamp = block.timestamp;
        companies[_company].rejectionReason = ""; // Clear any previous rejection reason
        
        // Remove from pending list
        _removeFromPendingList(_company);
        
        emit CompanyVerified(_company, msg.sender, block.timestamp);
    }
    
    function rejectCompany(address _company, string memory _reason) external onlyVerifier {
        require(companies[_company].isRegistered, "Company not registered");
        require(companies[_company].verificationStatus == VerificationStatus.Pending, "Company not in pending status");
        require(bytes(_reason).length > 0, "Rejection reason required");
        
        companies[_company].verificationStatus = VerificationStatus.Rejected;
        companies[_company].rejectionReason = _reason;
        
        // Remove from pending list
        _removeFromPendingList(_company);
        
        emit CompanyRejected(_company, msg.sender, _reason, block.timestamp);
    }
        
    // Internal helper function
    function _removeFromPendingList(address _company) internal {
        for (uint256 i = 0; i < pendingVerificationCompanies.length; i++) {
            if (pendingVerificationCompanies[i] == _company) {
                pendingVerificationCompanies[i] = pendingVerificationCompanies[pendingVerificationCompanies.length - 1];
                pendingVerificationCompanies.pop();
                break;
            }
        }
    }
    
    // New function to get account ID
    function getAccountId() external view returns (string memory) {
        return AddressTohederaAccount[msg.sender];
    }
        
    // Enhanced view functions
    function getCompanyDetails(address _company) external view returns (
        string memory name,
        string memory hederaAccountId, // Added to return values
        bool isRegistered,
        VerificationStatus verificationStatus,
        uint256 carbonCreditsOwned,
        uint256 totalPurchases,
        uint256 totalSales,
        uint256 registrationTimestamp,
        uint256 verificationTimestamp,
        string memory rejectionReason
    ) {
        Company memory company = companies[_company];
        return (
            company.name,
            company.hederaAccountId, // Added field
            company.isRegistered,
            company.verificationStatus,
            company.carbonCreditsOwned,
            company.totalPurchases,
            company.totalSales,
            company.registrationTimestamp,
            company.verificationTimestamp,
            company.rejectionReason
        );
    }
    
    function getCompanyFinancialDetails(address _company) external view returns (
        string memory walletAddress,
        string memory taxId,
        bool amlCompliance
    ) {
        Company memory company = companies[_company];
        return (
            company.walletAddress,
            company.taxId,
            company.amlCompliance
        );
    }
    
    // New view functions for verification management
    function getPendingVerificationCompanies() external view returns (address[] memory) {
        return pendingVerificationCompanies;
    }
    
    function getVerifiedCompanies() external view returns (address[] memory) {
        uint256 verifiedCount = 0;
        for (uint256 i = 0; i < registeredCompanies.length; i++) {
            if (companies[registeredCompanies[i]].verificationStatus == VerificationStatus.Verified) {
                verifiedCount++;
            }
        }
        
        address[] memory verified = new address[](verifiedCount);
        uint256 index = 0;
        for (uint256 i = 0; i < registeredCompanies.length; i++) {
            if (companies[registeredCompanies[i]].verificationStatus == VerificationStatus.Verified) {
                verified[index] = registeredCompanies[i];
                index++;
            }
        }
        
        return verified;
    }
    
    function isVerifier(address _address) external view returns (bool) {
        return verifiers[_address];
    }
    
    function getCompanyKYCDetails(address _company) external view returns (
        string memory legalEntityName,
        string memory registrationNumber,
        string memory jurisdiction,
        string memory registeredAddress,
        string memory principalBusinessAddress,
        string memory localPartners,
        string memory contactName,
        string memory contactEmail,
        string memory contactPhone,
        string memory website,
        string memory socialProfiles,
        string memory industry,
        string memory businessActivities,
        string memory keyIndividualsProof
    ) {
        Company memory company = companies[_company];
        return (
            company.legalEntityName,
            company.registrationNumber,
            company.jurisdiction,
            company.registeredAddress,
            company.principalBusinessAddress,
            company.localPartners,
            company.contactName,
            company.contactEmail,
            company.contactPhone,
            company.website,
            company.socialProfiles,
            company.industry,
            company.businessActivities,
            company.keyIndividualsProof
        );
    }
    
    function getCompanyEmissionsDetails(address _company) external view returns (
        uint256 scope1Emissions,
        uint256 scope2Emissions,
        uint256 scope3Emissions,
        string memory emissionsCalculationMethod,
        bool emissionsVerified,
        string memory verificationStatement,
        string memory decarbonizationStrategy,
        string memory climatePledges,
        uint256 registrationTimestamp
    ) {
        Company memory company = companies[_company];
        return (
            company.scope1Emissions,
            company.scope2Emissions,
            company.scope3Emissions,
            company.emissionsCalculationMethod,
            company.emissionsVerified,
            company.verificationStatement,
            company.decarbonizationStrategy,
            company.climatePledges,
            company.registrationTimestamp
        );
    }
    
    function getAllRegisteredCompanies() external view returns (address[] memory) {
        return registeredCompanies;
    }
    
    // Owner functions for managing carbon credits (kept for company management)
    function addCarbonCreditsToCompany(address _company, uint256 _amount) external onlyOwner {
        require(companies[_company].isRegistered, "Company not registered");
        companies[_company].carbonCreditsOwned += _amount;
    }
}
