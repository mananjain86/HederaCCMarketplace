// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Interface to communicate with your company registration contract
interface IHandleCompany {
    function updateForestAreaPurchase(address _company, uint256 _forestAreaId) external;
}

contract ForestTokenMarketplace {

    // ------------------ Events ------------------
    event ForestAreaListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 price,
        string location
    );

    event ForestAreaPurchased(
        uint256 indexed listingId,
        address indexed newOwner,
        uint256 price
    );

    // ------------------ Structs ------------------
    struct AreaInfo {
        string location;
        string gpsCoordinates;
        uint256 areaSize; // e.g., in square meters
        string ipfsDeedHash; // Link to a legal document or image on IPFS
    }

    struct ForestAreaListing {
        uint256 listingId;
        address seller;
        address currentOwner;
        uint256 price; // Price in WEI
        bool isActive; // True if available for sale
        AreaInfo info;
    }

    // ------------------ State ------------------
    mapping(uint256 => ForestAreaListing) public forestAreaListings;
    uint256 public nextListingId = 1;

    address public owner;
    IHandleCompany public handleCompanyContract;
    uint256 public platformFeePercentage = 50; // 5.0% (50 / 1000)

    // ------------------ Modifiers ------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // ------------------ Constructor ------------------
    constructor(address _handleCompanyAddress) {
        owner = msg.sender;
        require(_handleCompanyAddress != address(0), "INVALID_COMPANY_CONTRACT_ADDRESS");
        handleCompanyContract = IHandleCompany(_handleCompanyAddress);
    }

    // ------------------ Core Functions ------------------

    /**
     * @dev Allows the platform owner to list a new forest area for sale.
     */
    function listForestArea(AreaInfo calldata _info, uint256 _price) external onlyOwner {
        require(_price > 0, "Price must be greater than 0");
        
        ForestAreaListing storage listing = forestAreaListings[nextListingId];
        listing.listingId = nextListingId;
        listing.seller = msg.sender; // The platform is the initial seller
        listing.currentOwner = address(0); // No owner until purchased
        listing.price = _price;
        listing.isActive = true;
        listing.info = _info;

        emit ForestAreaListed(nextListingId, msg.sender, _price, _info.location);
        nextListingId++;
    }

    /**
     * @dev Allows a registered company to buy an active forest area listing.
     */
    function buyForestArea(uint256 _listingId) external payable {
        ForestAreaListing storage listing = forestAreaListings[_listingId];
        require(listing.isActive, "Listing is not for sale");
        require(msg.value == listing.price, "Incorrect ETH amount sent");
        
        uint256 platformFee = (listing.price * platformFeePercentage) / 1000;
        uint256 sellerPayment = listing.price - platformFee;
        
        // Update the state of the listing
        listing.isActive = false;
        listing.currentOwner = msg.sender;
        
        // Notify the company contract about the purchase
        handleCompanyContract.updateForestAreaPurchase(msg.sender, _listingId);
        
        // Transfer funds
        payable(listing.seller).transfer(sellerPayment);
        payable(owner).transfer(platformFee);
        
        emit ForestAreaPurchased(_listingId, msg.sender, listing.price);
    }

    // ------------------ View Functions ------------------

    function getListingDetails(uint256 _listingId) external view returns (ForestAreaListing memory) {
        require(forestAreaListings[_listingId].listingId != 0, "Listing does not exist");
        return forestAreaListings[_listingId];
    }

    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (forestAreaListings[i].isActive) {
                activeCount++;
            }
        }
        
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (forestAreaListings[i].isActive) {
                activeListings[index] = i;
                index++;
            }
        }
        return activeListings;
    }
}
