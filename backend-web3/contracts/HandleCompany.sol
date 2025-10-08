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
    
    // NEW INPUT STRUCT for consolidated registration data
    struct RegistrationData {
        string name;
        string hederaAccountId;
        string legalEntityName;
        string registrationNumber;
        string walletAddress; // Added as it's provided by frontend or MetaMask
        string taxId;
        bool amlCompliance;   
        uint256 scope1Emissions;
        uint256 scope2Emissions;
        uint256 scope3Emissions;
        string emissionsCalculationMethod;
        bool emissionsVerified;
    }

    // View function return structs - Simplified to match available data
    struct CompanyBasicDetails {
        string name;
        string hederaAccountId;
        bool isRegistered;
        VerificationStatus verificationStatus;
        uint256 carbonCreditsOwned;
        uint256 totalPurchases;
        uint256 totalSales;
        uint256 registrationTimestamp;
        uint256 verificationTimestamp;
        string rejectionReason;
    }

    struct CompanyRegulatoryInfo {
        string legalEntityName;
        string registrationNumber;
        string walletAddress;
        string taxId;
        bool amlCompliance;
    }
    
    struct CompanyEmissionsSummary {
        uint256 scope1Emissions;
        uint256 scope2Emissions;
        uint256 scope3Emissions;
        string emissionsCalculationMethod;
        bool emissionsVerified;
    }
    
    // Main company struct - Only includes fields collected by your current frontend
    struct Company {
        string name;
        string hederaAccountId;
        bool isRegistered;
        VerificationStatus verificationStatus;
        uint256 carbonCreditsOwned;
        uint256 totalPurchases;
        uint256 totalSales;
        // KYC/KYB & Financial Information
        string legalEntityName;
        string registrationNumber;
        string walletAddress; // Primary wallet for transactions
        string taxId;
        bool amlCompliance;
        // Carbon Emissions Data
        uint256 scope1Emissions;
        uint256 scope2Emissions;
        uint256 scope3Emissions;
        string emissionsCalculationMethod;
        bool emissionsVerified;
        uint256 registrationTimestamp;
        uint256 verificationTimestamp;
        string rejectionReason;
        uint256[] ownedForestAreaIds;
    }
        
    // State variables
    // NOTE: made `companies` non-public to avoid Solidity auto-generated getter
    // which returns all struct fields and causes "stack too deep".
    mapping(address => bool) public isAuthorizedCaller;
    mapping(address => Company) private companies;
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
    modifier onlyAuthorizedCaller() {
        require(isAuthorizedCaller[msg.sender], "Caller is not an authorized marketplace");
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
    //sets marketplace address
    function setAuthorizedCaller(address _caller, bool _isAuthorized) external onlyOwner {
        isAuthorizedCaller[_caller] = _isAuthorized;
    }
    //common update credits
    function updateCreditBalance(address _company, uint256 _amount) external onlyAuthorizedCaller {
        require(companies[_company].isRegistered, "COMPANY_NOT_REGISTERED");
        companies[_company].carbonCreditsOwned += _amount;
        // Optionally, you can also track the number of purchases
        companies[_company].totalPurchases += 1;
    }
    //The function for the ForestTokenMarketplace to call
    function updateForestAreaPurchase(address _company, uint256 _forestAreaId) external onlyAuthorizedCaller {
        require(companies[_company].isRegistered, "Company not registered");
        companies[_company].ownedForestAreaIds.push(_forestAreaId);
    }
    
    function removeVerifier(address _verifier) external onlyOwner {
        require(_verifier != owner, "Cannot remove owner as verifier");
        verifiers[_verifier] = false;
    }
    
    // Consolidated registration function, accepts single struct with all form data
    function registerCompany(RegistrationData memory _data) external {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        require(bytes(_data.name).length > 0, "Company name required");
        require(bytes(_data.hederaAccountId).length > 0, "Hedera Account ID required");
        require(bytes(_data.legalEntityName).length > 0, "Legal entity name required");
        require(bytes(_data.registrationNumber).length > 0, "Registration number required");
        require(bytes(_data.taxId).length > 0, "Tax ID required");
        require(bytes(_data.walletAddress).length > 0, "Wallet address required");
        require(_data.amlCompliance, "AML compliance declaration required");
        require(bytes(_data.emissionsCalculationMethod).length > 0, "Emissions calculation method required");

        Company storage company = companies[msg.sender];
        company.name = _data.name;
        company.hederaAccountId = _data.hederaAccountId;
        company.legalEntityName = _data.legalEntityName;
        company.registrationNumber = _data.registrationNumber;
        company.walletAddress = _data.walletAddress;
        company.taxId = _data.taxId;
        company.amlCompliance = _data.amlCompliance;
        company.scope1Emissions = _data.scope1Emissions;
        company.scope2Emissions = _data.scope2Emissions;
        company.scope3Emissions = _data.scope3Emissions;
        company.emissionsCalculationMethod = _data.emissionsCalculationMethod;
        company.emissionsVerified = _data.emissionsVerified;

        // Set core status fields
        company.isRegistered = true;
        company.verificationStatus = VerificationStatus.Pending;
        company.carbonCreditsOwned = 0;
        company.totalPurchases = 0;
        company.totalSales = 0;
        company.registrationTimestamp = block.timestamp;
        company.verificationTimestamp = 0;
        company.rejectionReason = "";
        
        AddressTohederaAccount[msg.sender] = _data.hederaAccountId;
        registeredCompanies.push(msg.sender);
        pendingVerificationCompanies.push(msg.sender);
        
        emit CompanyRegistered(msg.sender, _data.name, _data.hederaAccountId);
    }
    
    // --- Removed all update functions as all data is submitted at registration based on new form ---

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
    
    // Get Hedera account ID for msg.sender
    function getAccountId() external view returns (string memory) {
        return AddressTohederaAccount[msg.sender];
    }
        
    // View functions for retrieving company data - Adjusted to new `Company` struct
    function getCompanyDetails(address _company) external view returns (CompanyBasicDetails memory) {
        Company storage company = companies[_company];
        return CompanyBasicDetails({
            name: company.name,
            hederaAccountId: company.hederaAccountId,
            isRegistered: company.isRegistered,
            verificationStatus: company.verificationStatus,
            carbonCreditsOwned: company.carbonCreditsOwned,
            totalPurchases: company.totalPurchases,
            totalSales: company.totalSales,
            registrationTimestamp: company.registrationTimestamp,
            verificationTimestamp: company.verificationTimestamp,
            rejectionReason: company.rejectionReason
        });
    }
    
    function getCompanyRegulatoryInfo(address _company) external view returns (CompanyRegulatoryInfo memory) {
        Company storage company = companies[_company];
        return CompanyRegulatoryInfo({
            legalEntityName: company.legalEntityName,
            registrationNumber: company.registrationNumber,
            walletAddress: company.walletAddress,
            taxId: company.taxId,
            amlCompliance: company.amlCompliance
        });
    }
    
    function getCompanyEmissionsSummary(address _company) external view returns (CompanyEmissionsSummary memory) {
        Company storage company = companies[_company];
        return CompanyEmissionsSummary({
            scope1Emissions: company.scope1Emissions,
            scope2Emissions: company.scope2Emissions,
            scope3Emissions: company.scope3Emissions,
            emissionsCalculationMethod: company.emissionsCalculationMethod,
            emissionsVerified: company.emissionsVerified
        });
    }
    
    function getPendingVerificationCompanies() external view returns (address[] memory) {
        return pendingVerificationCompanies;
    }
    
    function getVerifiedCompanies() external view returns (address[] memory) {
        uint256 verifiedCount = 0;
        uint256 totalCompanies = registeredCompanies.length;
        
        for (uint256 i = 0; i < totalCompanies; i++) {
            if (companies[registeredCompanies[i]].verificationStatus == VerificationStatus.Verified) {
                verifiedCount++;
            }
        }
        
        address[] memory verified = new address[](verifiedCount);
        uint256 index = 0;
        for (uint256 i = 0; i < totalCompanies; i++) {
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
    
    function getAllRegisteredCompanies() external view returns (address[] memory) {
        return registeredCompanies;
    }
    
    // Owner functions for managing carbon credits
    function addCarbonCreditsToCompany(address _company, uint256 _amount) external onlyOwner {
        require(companies[_company].isRegistered, "Company not registered");
        companies[_company].carbonCreditsOwned += _amount;
    }
}
