// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CarbonCreditsMarketplace {
    
    // Events
    event CarbonCreditsListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 amount,
        uint256 pricePerCredit,
        string projectName,          // Added for better event info
        string projectType,          // Added for better event info
        string accreditedRegistry,   // Added for better event info
        uint256 creditVintageYear     // Added for better event info
    );
    event CarbonCreditsPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 totalPrice);
    
    // Structs
    struct CarbonCreditListing {
        uint256 id;
        address seller;
        uint256 amount;
        uint256 pricePerCredit;
        bool isActive;
        
        // Project Information
        string projectName;         // Added from frontend
        string projectType;         // Added from frontend
        string projectCountry;      // Added from frontend
        string projectRegion;       // Added from frontend
        string projectAddress;      // Replaces projectCoordinates and original projectLocation
        string registryUrl;         // Added from frontend

        // Project Documentation & Integrity
        string accreditedRegistry;  // Replaces general certificationType
        string registryStandard;    // Added from frontend
        bool hostCountryAuthorization; // Added from frontend
        string authorizationLetter; // Added from frontend (IPFS hash/URL)
        bool parisAgreementCompliant; // Added from frontend
        string projectDocumentation; // Added from frontend (IPFS hash/URL)
        bool isVerified;            // Added from frontend (for third-party verification)

        // Credit Details
        uint256 creditVintageYear;  // Renamed from 'vintage' for clarity
        string vintageSerialNumbers; // Added from frontend
    }
    
    // State variables
    mapping(uint256 => CarbonCreditListing) public carbonCreditListings;
    mapping(address => uint256) public carbonCreditsOwned;
    
    uint256 public nextListingId = 1;
    address public owner;
    uint256 public platformFeePercentage = 25; // 2.5% (25/1000). Max 10% (100/1000).
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Carbon credits listing functions
    function listCarbonCredits(
        uint256 _amount,
        uint256 _pricePerCredit,
        // Project Information
        string memory _projectName,
        string memory _projectType,
        string memory _projectCountry,
        string memory _projectRegion,
        string memory _projectAddress,
        string memory _registryUrl,
        // Project Documentation & Integrity
        string memory _accreditedRegistry,
        string memory _registryStandard,
        bool _hostCountryAuthorization,
        string memory _authorizationLetter,
        bool _parisAgreementCompliant,
        string memory _projectDocumentation,
        bool _isVerified,
        // Credit Details
        uint256 _creditVintageYear,
        string memory _vintageSerialNumbers
    ) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(_pricePerCredit > 0, "Price must be greater than 0");
        require(carbonCreditsOwned[msg.sender] >= _amount, "Insufficient carbon credits");
        
        carbonCreditListings[nextListingId] = CarbonCreditListing({
            id: nextListingId,
            seller: msg.sender,
            amount: _amount,
            pricePerCredit: _pricePerCredit,
            isActive: true,
            // Project Information
            projectName: _projectName,
            projectType: _projectType,
            projectCountry: _projectCountry,
            projectRegion: _projectRegion,
            projectAddress: _projectAddress,
            registryUrl: _registryUrl,
            // Project Documentation & Integrity
            accreditedRegistry: _accreditedRegistry,
            registryStandard: _registryStandard,
            hostCountryAuthorization: _hostCountryAuthorization,
            authorizationLetter: _authorizationLetter,
            parisAgreementCompliant: _parisAgreementCompliant,
            projectDocumentation: _projectDocumentation,
            isVerified: _isVerified,
            // Credit Details
            creditVintageYear: _creditVintageYear,
            vintageSerialNumbers: _vintageSerialNumbers
        });
        
        // Lock the credits
        carbonCreditsOwned[msg.sender] -= _amount;
        
        emit CarbonCreditsListed(
            nextListingId,
            msg.sender,
            _amount,
            _pricePerCredit,
            _projectName,
            _projectType,
            _accreditedRegistry,
            _creditVintageYear
        );
        nextListingId++;
    }
    
    // Carbon credits buying functions (No change needed)
    function buyCarbonCredits(uint256 _listingId, uint256 _amount) external payable {
        CarbonCreditListing storage listing = carbonCreditListings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy from yourself");
        require(_amount > 0 && _amount <= listing.amount, "Invalid amount");
        
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
        carbonCreditsOwned[msg.sender] += _amount;
        
        // Transfer payments
        payable(listing.seller).transfer(sellerPayment);
        payable(owner).transfer(platformFee);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit CarbonCreditsPurchased(_listingId, msg.sender, _amount, totalPrice);
    }
    
    // View functions
    function getListingDetails(uint256 _listingId)
        external
        view
        returns (
            uint256 id,
            address seller,
            uint256 amount,
            uint256 pricePerCredit,
            bool isActive,
            string memory projectName,
            string memory projectType,
            string memory projectCountry,
            string memory projectRegion,
            string memory projectAddress,
            string memory registryUrl,
            string memory accreditedRegistry,
            string memory registryStandard,
            bool hostCountryAuthorization,
            string memory authorizationLetter,
            bool parisAgreementCompliant,
            string memory projectDocumentation,
            bool isVerified,
            uint256 creditVintageYear,
            string memory vintageSerialNumbers
        )
    {
        CarbonCreditListing storage listing = carbonCreditListings[_listingId];
        require(listing.id != 0, "Listing does not exist");

        return (
            listing.id,
            listing.seller,
            listing.amount,
            listing.pricePerCredit,
            listing.isActive,
            listing.projectName,
            listing.projectType,
            listing.projectCountry,
            listing.projectRegion,
            listing.projectAddress,
            listing.registryUrl,
            listing.accreditedRegistry,
            listing.registryStandard,
            listing.hostCountryAuthorization,
            listing.authorizationLetter,
            listing.parisAgreementCompliant,
            listing.projectDocumentation,
            listing.isVerified,
            listing.creditVintageYear,
            listing.vintageSerialNumbers
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
    
    // Owner functions
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 100, "Fee cannot exceed 10% (100/1000)"); // 100/1000 = 10%
        platformFeePercentage = _newFeePercentage;
    }
    
    function addCarbonCreditsToAccount(address _account, uint256 _amount) external onlyOwner {
        carbonCreditsOwned[_account] += _amount;
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}