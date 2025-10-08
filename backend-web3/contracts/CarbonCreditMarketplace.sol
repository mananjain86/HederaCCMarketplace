// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IHandleCompany {
    function updateCreditBalance(address _company, uint256 _amount) external;
}

contract CarbonCreditsMarketplace {
    
    // ------------------ Events ------------------
    event CarbonCreditsListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 amount,
        uint256 pricePerCredit,
        string projectName,
        string projectType,
        string accreditedRegistry,
        uint256 creditVintageYear
    );

    event CarbonCreditsPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );
    
    // ------------------ Structs ------------------

    struct ProjectInfo {
        string projectName;
        string projectType;
        string projectCountry;
        string projectRegion;
        string projectAddress;
        string registryUrl;
    }

    struct ProjectDocs {
        string accreditedRegistry;
        string registryStandard;
        bool hostCountryAuthorization;
        string authorizationLetter;    // IPFS hash/URL
        bool parisAgreementCompliant;
        string projectDocumentation;   // IPFS hash/URL
        bool isVerified;
    }

    struct CreditDetails {
        uint256 creditVintageYear;
        string vintageSerialNumbers;
    }

    struct CarbonCreditListing {
        uint256 id;
        address seller;
        uint256 amount;
        uint256 pricePerCredit;
        bool isActive;

        ProjectInfo info;
        ProjectDocs docs;
        CreditDetails details;
    }

    struct ListingInput {
        uint256 amount;
        uint256 pricePerCredit;
        ProjectInfo info;
        ProjectDocs docs;
        CreditDetails details;
    }
    
    // ------------------ State ------------------
    mapping(uint256 => CarbonCreditListing) public carbonCreditListings;
    mapping(address => uint256) public carbonCreditsOwned;

    IHandleCompany public handleCompanyContract;
    uint256 public nextListingId = 1;
    address public owner;
    uint256 public platformFeePercentage = 25; // 2.5% (25/1000). Max 10% (100/1000).
    
    // ------------------ Modifiers ------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _handleCompanyAddress) {
        owner = msg.sender;
        require(_handleCompanyAddress != address(0), "INVALID_COMPANY_CONTRACT_ADDRESS");
        handleCompanyContract = IHandleCompany(_handleCompanyAddress);
    }
    
    // ------------------ Core Functions ------------------

    function listCarbonCredits(ListingInput calldata input) external {
        require(input.amount > 0, "Amount must be greater than 0");
        require(input.pricePerCredit > 0, "Price must be greater than 0");
        require(carbonCreditsOwned[msg.sender] >= input.amount, "Insufficient carbon credits");
        
        CarbonCreditListing storage listing = carbonCreditListings[nextListingId];
        listing.id = nextListingId;
        listing.seller = msg.sender;
        listing.amount = input.amount;
        listing.pricePerCredit = input.pricePerCredit;
        listing.isActive = true;

        listing.info = input.info;
        listing.docs = input.docs;
        listing.details = input.details;

        // Lock credits
        carbonCreditsOwned[msg.sender] -= input.amount;
        
        emit CarbonCreditsListed(
            nextListingId,
            msg.sender,
            input.amount,
            input.pricePerCredit,
            input.info.projectName,
            input.info.projectType,
            input.docs.accreditedRegistry,
            input.details.creditVintageYear
        );
        nextListingId++;
    }
    
    function buyCarbonCredits(uint256 _listingId, uint256 _amount) external payable {
        CarbonCreditListing storage listing = carbonCreditListings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy from yourself");
        require(_amount > 0 && _amount <= listing.amount, "Invalid amount");
        
        uint256 totalPrice = _amount * listing.pricePerCredit;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 platformFee = (totalPrice * platformFeePercentage) / 1000;
        uint256 sellerPayment = totalPrice - platformFee;
        
        listing.amount -= _amount;
        if (listing.amount == 0) {
            listing.isActive = false;
        }
        
        handleCompanyContract.updateCreditBalance(msg.sender, _amount);
        
        payable(listing.seller).transfer(sellerPayment);
        payable(owner).transfer(platformFee);
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit CarbonCreditsPurchased(_listingId, msg.sender, _amount, totalPrice);
    }
    
    // ------------------ Views ------------------
    function getListingDetails(uint256 _listingId)
        external
        view
        returns (CarbonCreditListing memory)
    {
        require(carbonCreditListings[_listingId].id != 0, "Listing does not exist");
        return carbonCreditListings[_listingId];
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
    
    // ------------------ Owner ------------------
    function updatePlatformFee(uint256 _newFeePercentage) external onlyOwner {
        require(_newFeePercentage <= 100, "Fee cannot exceed 10% (100/1000)");
        platformFeePercentage = _newFeePercentage;
    }
    
    function addCarbonCreditsToAccount(address _account, uint256 _amount) external onlyOwner {
        carbonCreditsOwned[_account] += _amount;
    }
    
    // ------------------ Emergency ------------------
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}