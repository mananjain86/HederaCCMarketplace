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
    
    // Structs for registration data to avoid stack too deep
    struct BasicInfo {
        string name;
        string hederaAccountId;
        string legalEntityName;
        string registrationNumber;
        string jurisdiction;
        string registeredAddress;
        string principalBusinessAddress;
        string localPartners;
    }
    
    struct ContactInfo {
        string contactName;
        string contactEmail;
        string contactPhone;
        string website;
        string socialProfiles;
        string industry;
        string businessActivities;
        string keyIndividualsProof;
    }
    
    struct FinancialInfo {
        string walletAddress;
        string taxId;
        bool amlCompliance;
    }
    
    struct EmissionsInfo {
        uint256 scope1Emissions;
        uint256 scope2Emissions;
        uint256 scope3Emissions;
        string emissionsCalculationMethod;
        bool emissionsVerified;
        string verificationStatement;
        string decarbonizationStrategy;
        string climatePledges;
    }

    // New structs for view function returns to avoid stack too deep
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

    struct CompanyKYCDetails {
        string legalEntityName;
        string registrationNumber;
        string jurisdiction;
        string registeredAddress;
        string principalBusinessAddress;
        string localPartners;
        string contactName;
        string contactEmail;
    }

    struct CompanyContactDetails {
        string contactPhone;
        string website;
        string socialProfiles;
        string industry;
        string businessActivities;
        string keyIndividualsProof;
    }

    struct CompanyEmissionsDetails {
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
    
    // Main company struct
    struct Company {
        // Basic info
        string name;
        string hederaAccountId;
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
        uint256 scope1Emissions;
        uint256 scope2Emissions;
        uint256 scope3Emissions;
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
    
    // Split registration into multiple functions to avoid stack too deep
    function registerCompany(
        BasicInfo memory _basicInfo,
        ContactInfo memory _contactInfo,
        FinancialInfo memory _financialInfo,
        EmissionsInfo memory _emissionsInfo
    ) external {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        require(bytes(_basicInfo.legalEntityName).length > 0, "Legal entity name required");
        require(bytes(_basicInfo.registrationNumber).length > 0, "Registration number required");
        require(bytes(_contactInfo.contactEmail).length > 0, "Contact email required");
        require(_financialInfo.amlCompliance, "AML compliance declaration required");
        
        // Initialize company with basic info first
        _initializeBasicInfo(_basicInfo);
        
        // Set contact information
        _setContactInfo(_contactInfo);
        
        // Set financial information
        _setFinancialInfo(_financialInfo);
        
        // Set emissions information
        _setEmissionsInfo(_emissionsInfo);
        
        // Finalize registration
        _finalizeRegistration(_basicInfo);
    }

    function _initializeBasicInfo(BasicInfo memory _basicInfo) internal {
        Company storage company = companies[msg.sender];
        company.name = _basicInfo.name;
        company.hederaAccountId = _basicInfo.hederaAccountId;
        company.isRegistered = true;
        company.verificationStatus = VerificationStatus.Pending;
        company.carbonCreditsOwned = 0;
        company.totalPurchases = 0;
        company.totalSales = 0;
        company.legalEntityName = _basicInfo.legalEntityName;
        company.registrationNumber = _basicInfo.registrationNumber;
        company.jurisdiction = _basicInfo.jurisdiction;
        company.registeredAddress = _basicInfo.registeredAddress;
        company.principalBusinessAddress = _basicInfo.principalBusinessAddress;
        company.localPartners = _basicInfo.localPartners;
    }

    function _setContactInfo(ContactInfo memory _contactInfo) internal {
        Company storage company = companies[msg.sender];
        company.contactName = _contactInfo.contactName;
        company.contactEmail = _contactInfo.contactEmail;
        company.contactPhone = _contactInfo.contactPhone;
        company.website = _contactInfo.website;
        company.socialProfiles = _contactInfo.socialProfiles;
        company.industry = _contactInfo.industry;
        company.businessActivities = _contactInfo.businessActivities;
        company.keyIndividualsProof = _contactInfo.keyIndividualsProof;
    }

    function _setFinancialInfo(FinancialInfo memory _financialInfo) internal {
        Company storage company = companies[msg.sender];
        company.walletAddress = _financialInfo.walletAddress;
        company.taxId = _financialInfo.taxId;
        company.amlCompliance = _financialInfo.amlCompliance;
    }

    function _setEmissionsInfo(EmissionsInfo memory _emissionsInfo) internal {
        Company storage company = companies[msg.sender];
        company.scope1Emissions = _emissionsInfo.scope1Emissions;
        company.scope2Emissions = _emissionsInfo.scope2Emissions;
        company.scope3Emissions = _emissionsInfo.scope3Emissions;
        company.emissionsCalculationMethod = _emissionsInfo.emissionsCalculationMethod;
        company.emissionsVerified = _emissionsInfo.emissionsVerified;
        company.verificationStatement = _emissionsInfo.verificationStatement;
        company.decarbonizationStrategy = _emissionsInfo.decarbonizationStrategy;
        company.climatePledges = _emissionsInfo.climatePledges;
    }

    function _finalizeRegistration(BasicInfo memory _basicInfo) internal {
        Company storage company = companies[msg.sender];
        company.registrationTimestamp = block.timestamp;
        company.verificationTimestamp = 0;
        company.rejectionReason = "";
        
        AddressTohederaAccount[msg.sender] = _basicInfo.hederaAccountId;
        registeredCompanies.push(msg.sender);
        pendingVerificationCompanies.push(msg.sender);
        
        emit CompanyRegistered(msg.sender, _basicInfo.name, _basicInfo.hederaAccountId);
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
        
    // Enhanced view functions - Fixed to avoid stack too deep
    function getCompanyDetails(address _company) external view returns (CompanyBasicDetails memory) {
        Company storage company = companies[_company];
        string memory name = company.name;
        string memory hederaAccountId = company.hederaAccountId;
        bool isRegistered = company.isRegistered;
        VerificationStatus verificationStatus = company.verificationStatus;
        uint256 carbonCreditsOwned = company.carbonCreditsOwned;
        uint256 totalPurchases = company.totalPurchases;
        uint256 totalSales = company.totalSales;
        uint256 registrationTimestamp = company.registrationTimestamp;
        uint256 verificationTimestamp = company.verificationTimestamp;
        string memory rejectionReason = company.rejectionReason;
        return CompanyBasicDetails({
            name: name,
            hederaAccountId: hederaAccountId,
            isRegistered: isRegistered,
            verificationStatus: verificationStatus,
            carbonCreditsOwned: carbonCreditsOwned,
            totalPurchases: totalPurchases,
            totalSales: totalSales,
            registrationTimestamp: registrationTimestamp,
            verificationTimestamp: verificationTimestamp,
            rejectionReason: rejectionReason
        });
    }
    
    function getCompanyFinancialDetails(address _company) external view returns (
        string memory walletAddress,
        string memory taxId,
        bool amlCompliance
    ) {
        Company storage company = companies[_company];
        string memory wallet = company.walletAddress;
        string memory tax = company.taxId;
        bool aml = company.amlCompliance;
        return (
            wallet,
            tax,
            aml
        );
    }
    
    // New view functions for verification management
    function getPendingVerificationCompanies() external view returns (address[] memory) {
        return pendingVerificationCompanies;
    }
    
    function getVerifiedCompanies() external view returns (address[] memory) {
        uint256 verifiedCount = 0;
        uint256 totalCompanies = registeredCompanies.length;
        
        // Count verified companies
        for (uint256 i = 0; i < totalCompanies; i++) {
            if (companies[registeredCompanies[i]].verificationStatus == VerificationStatus.Verified) {
                verifiedCount++;
            }
        }
        
        // Create array of verified companies
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
    
    // Split KYC details into two functions to avoid stack too deep
    function getCompanyKYCBasicDetails(address _company) external view returns (CompanyKYCDetails memory) {
        Company storage company = companies[_company];
        string memory legalEntityName = company.legalEntityName;
        string memory registrationNumber = company.registrationNumber;
        string memory jurisdiction = company.jurisdiction;
        string memory registeredAddress = company.registeredAddress;
        string memory principalBusinessAddress = company.principalBusinessAddress;
        string memory localPartners = company.localPartners;
        string memory contactName = company.contactName;
        string memory contactEmail = company.contactEmail;
        return CompanyKYCDetails({
            legalEntityName: legalEntityName,
            registrationNumber: registrationNumber,
            jurisdiction: jurisdiction,
            registeredAddress: registeredAddress,
            principalBusinessAddress: principalBusinessAddress,
            localPartners: localPartners,
            contactName: contactName,
            contactEmail: contactEmail
        });
    }

    function getCompanyContactDetails(address _company) external view returns (CompanyContactDetails memory) {
        Company storage company = companies[_company];
        string memory contactPhone = company.contactPhone;
        string memory website = company.website;
        string memory socialProfiles = company.socialProfiles;
        string memory industry = company.industry;
        string memory businessActivities = company.businessActivities;
        string memory keyIndividualsProof = company.keyIndividualsProof;
        return CompanyContactDetails({
            contactPhone: contactPhone,
            website: website,
            socialProfiles: socialProfiles,
            industry: industry,
            businessActivities: businessActivities,
            keyIndividualsProof: keyIndividualsProof
        });
    }
    
    function getCompanyEmissionsDetails(address _company) external view returns (CompanyEmissionsDetails memory) {
        Company storage company = companies[_company];
        uint256 scope1Emissions = company.scope1Emissions;
        uint256 scope2Emissions = company.scope2Emissions;
        uint256 scope3Emissions = company.scope3Emissions;
        string memory emissionsCalculationMethod = company.emissionsCalculationMethod;
        bool emissionsVerified = company.emissionsVerified;
        string memory verificationStatement = company.verificationStatement;
        string memory decarbonizationStrategy = company.decarbonizationStrategy;
        string memory climatePledges = company.climatePledges;
        uint256 registrationTimestamp = company.registrationTimestamp;
        return CompanyEmissionsDetails({
            scope1Emissions: scope1Emissions,
            scope2Emissions: scope2Emissions,
            scope3Emissions: scope3Emissions,
            emissionsCalculationMethod: emissionsCalculationMethod,
            emissionsVerified: emissionsVerified,
            verificationStatement: verificationStatement,
            decarbonizationStrategy: decarbonizationStrategy,
            climatePledges: climatePledges,
            registrationTimestamp: registrationTimestamp
        });
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