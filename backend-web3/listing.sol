// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CarbonCreditsMarketplace {
    
    // Events
    event CompanyRegistered(address indexed company, string name, string companyType);
    event CompanyVerified(address indexed company, address indexed verifier, uint256 timestamp);
    event CompanyRejected(address indexed company, address indexed verifier, string reason, uint256 timestamp);
    event CarbonCreditsListed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 pricePerCredit);
    event CarbonCreditsPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    event ForestAreaPurchased(address indexed buyer, uint256 area, uint256 estimatedCredits, uint256 price);
    
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
        string companyType; // "buyer", "seller", or "both"
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
        string walletAddress; // Changed from bankAccountDetails to match frontend
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
    
    struct CarbonCreditListing {
        uint256 id;
        address seller;
        uint256 amount;
        uint256 pricePerCredit; // in wei
        bool isActive;
        string certificationType; // e.g., "VCS", "Gold Standard", "CDM"
        string projectLocation;
        uint256 vintage; // year of credit generation
    }
    
    struct ForestArea {
        uint256 area; // in hectares
        uint256 pricePerHectare; // in wei
        uint256 estimatedCreditsPerHectare; // estimated carbon credits per hectare
        string location;
        bool isAvailable;
    }
    
    // State variables
    mapping(address => Company) public companies;
    mapping(uint256 => CarbonCreditListing) public carbonCreditListings;
    mapping(uint256 => ForestArea) public forestAreas;
    mapping(address => bool) public verifiers; // Authorized verifiers
    
    address[] public registeredCompanies;
    address[] public pendingVerificationCompanies;
    uint256 public nextListingId = 1;
    uint256 public nextForestAreaId = 1;
    
    address public owner;
    uint256 public platformFeePercentage = 25; // 2.5% (25/1000)
    
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
        string memory _companyType,
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
        string memory _walletAddress, // Changed from _bankAccountDetails
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
        require(
            keccak256(bytes(_companyType)) == keccak256(bytes("buyer")) ||
            keccak256(bytes(_companyType)) == keccak256(bytes("seller")) ||
            keccak256(bytes(_companyType)) == keccak256(bytes("both")),
            "Invalid company type. Must be 'buyer', 'seller', or 'both'"
        );
        require(bytes(_legalEntityName).length > 0, "Legal entity name required");
        require(bytes(_registrationNumber).length > 0, "Registration number required");
        require(bytes(_contactEmail).length > 0, "Contact email required");
        require(_amlCompliance, "AML compliance declaration required");
        
        companies[msg.sender] = Company({
            name: _name,
            companyType: _companyType,
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
            walletAddress: _walletAddress, // Changed field name
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
        
        registeredCompanies.push(msg.sender);
        pendingVerificationCompanies.push(msg.sender);
        
        emit CompanyRegistered(msg.sender, _name, _companyType);
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
    
    // Carbon credits listing functions (now requires verification)
    function listCarbonCredits(
        uint256 _amount,
        uint256 _pricePerCredit,
        string memory _certificationType,
        string memory _projectLocation,
        uint256 _vintage
    ) external onlyVerifiedCompany { // Changed to require verification
        require(_amount > 0, "Amount must be greater than 0");
        require(_pricePerCredit > 0, "Price must be greater than 0");
        require(companies[msg.sender].carbonCreditsOwned >= _amount, "Insufficient carbon credits");
        
        // Check if company can sell
        require(
            keccak256(bytes(companies[msg.sender].companyType)) == keccak256(bytes("seller")) ||
            keccak256(bytes(companies[msg.sender].companyType)) == keccak256(bytes("both")),
            "Company not authorized to sell"
        );
        
        carbonCreditListings[nextListingId] = CarbonCreditListing({
            id: nextListingId,
            seller: msg.sender,
            amount: _amount,
            pricePerCredit: _pricePerCredit,
            isActive: true,
            certificationType: _certificationType,
            projectLocation: _projectLocation,
            vintage: _vintage
        });
        
        // Lock the credits (reduce from seller's available balance)
        companies[msg.sender].carbonCreditsOwned -= _amount;
        
        emit CarbonCreditsListed(nextListingId, msg.sender, _amount, _pricePerCredit);
        nextListingId++;
    }
    
    // Carbon credits buying functions (now requires verification)
    function buyCarbonCredits(uint256 _listingId, uint256 _amount) external payable onlyVerifiedCompany { // Changed to require verification
        CarbonCreditListing storage listing = carbonCreditListings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy from yourself");
        require(_amount > 0 && _amount <= listing.amount, "Invalid amount");
        
        // Check if company can buy
        require(
            keccak256(bytes(companies[msg.sender].companyType)) == keccak256(bytes("buyer")) ||
            keccak256(bytes(companies[msg.sender].companyType)) == keccak256(bytes("both")),
            "Company not authorized to buy"
        );
        
        uint256 totalPrice = _amount * listing.pricePerCredit;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Calculate platform fee
        uint256 platformFee = (totalPrice * platformFeePercentage) / 1000;
        uint256 sellerPayment = totalPrice - platformFee;
        
        // Update listing
        listing.amount -= _amount;
        if (listing.amount == 0) {
            listing.isActive = false;
        }
        
        // Update balances
        companies[msg.sender].carbonCreditsOwned += _amount;
        companies[msg.sender].totalPurchases += _amount;
        companies[listing.seller].totalSales += _amount;
        
        // Transfer payments
        payable(listing.seller).transfer(sellerPayment);
        payable(owner).transfer(platformFee);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit CarbonCreditsPurchased(_listingId, msg.sender, _amount, totalPrice);
    }
    
    // Forest area functions (now requires verification)
    function buyForestArea(uint256 _forestAreaId, uint256 _areaAmount) external payable onlyVerifiedCompany { // Changed to require verification
        ForestArea storage forestArea = forestAreas[_forestAreaId];
        require(forestArea.isAvailable, "Forest area not available");
        require(_areaAmount > 0 && _areaAmount <= forestArea.area, "Invalid area amount");
        
        // Check if company can buy
        require(
            keccak256(bytes(companies[msg.sender].companyType)) == keccak256(bytes("buyer")) ||
            keccak256(bytes(companies[msg.sender].companyType)) == keccak256(bytes("both")),
            "Company not authorized to buy"
        );
        
        uint256 totalPrice = _areaAmount * forestArea.pricePerHectare;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 estimatedCredits = _areaAmount * forestArea.estimatedCreditsPerHectare;
        
        // Update forest area
        forestArea.area -= _areaAmount;
        if (forestArea.area == 0) {
            forestArea.isAvailable = false;
        }
        
        // Award carbon credits to buyer (estimated)
        companies[msg.sender].carbonCreditsOwned += estimatedCredits;
        
        // Transfer payment to owner
        payable(owner).transfer(totalPrice);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit ForestAreaPurchased(msg.sender, _areaAmount, estimatedCredits, totalPrice);
    }
    
    // Forest area management (unchanged)
    function addForestArea(
        uint256 _area,
        uint256 _pricePerHectare,
        uint256 _estimatedCreditsPerHectare,
        string memory _location
    ) external onlyOwner {
        forestAreas[nextForestAreaId] = ForestArea({
            area: _area,
            pricePerHectare: _pricePerHectare,
            estimatedCreditsPerHectare: _estimatedCreditsPerHectare,
            location: _location,
            isAvailable: true
        });
        
        nextForestAreaId++;
    }
    
    // Enhanced view functions
    function getCompanyDetails(address _company) external view returns (
        string memory name,
        string memory companyType,
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
            company.companyType,
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
        string memory walletAddress, // Changed from bankAccountDetails
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
    
    // ... rest of the existing view functions remain the same ...
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
    
    function getActiveCarbonCreditListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (carbonCreditListings[i].isActive) {
                activeCount++;
            }
        }
        
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (carbonCreditListings[i].isActive) {
                activeListings[index] = i;
                index++;
            }
        }
        
        return activeListings;
    }
    
    function getAllRegisteredCompanies() external view returns (address[] memory) {
        return registeredCompanies;
    }
    
    // Owner functions (unchanged)
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 100, "Fee cannot exceed 10%"); // 100/1000 = 10%
        platformFeePercentage = _newFeePercentage;
    }
    
    function addCarbonCreditsToCompany(address _company, uint256 _amount) external onlyOwner {
        require(companies[_company].isRegistered, "Company not registered");
        companies[_company].carbonCreditsOwned += _amount;
    }
    
    // Emergency functions (unchanged)
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}