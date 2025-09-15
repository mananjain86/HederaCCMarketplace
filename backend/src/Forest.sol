// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.40;

contract ForestArea {
    struct Area {
        string location;
        string area;
        uint256 totalPrice;
        uint256 areaId;
        string nftTokenId;
        uint256 serialNumber;
    }

    address public owner;
    uint256 public constant NFT_MINTING_COST = 1 HBAR ; 
    
    constructor() {
        owner = msg.sender;
    }

    mapping(address => Area) public areas;
    mapping(uint256 => bool) public areaExists;
    
    event ForestAreaPurchased(address indexed buyer, uint256 indexed areaId, string location, string area, uint256 totalPrice, uint256 nftCost, uint256 ownerPayment);
    event NFTMinted(address indexed buyer, uint256 indexed areaId, string nftTokenId, uint256 serialNumber);
    
    function buyForestArea(string memory location, string memory area, uint256 areaId) external payable {
        require(msg.value >= NFT_MINTING_COST, "Insufficient funds for NFT minting");
        require(msg.sender != owner, "Owner cannot buy");
        require(!areaExists[areaId], "Area already purchased");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(bytes(area).length > 0, "Area cannot be empty");
        
        // Calculate payments
        uint256 nftCost = NFT_MINTING_COST;
        uint256 ownerPayment = msg.value - nftCost;
        
        // Transfer owner's share (everything except NFT minting cost)
        if (ownerPayment > 0) {
            payable(owner).transfer(ownerPayment);
        }
        
        // Store area information
        areas[msg.sender] = Area({
            location: location,
            area: area,
            totalPrice: msg.value,
            areaId: areaId,
            nftTokenId: "", // Will be updated after NFT is minted
            serialNumber: 0  // Will be updated after NFT is minted
        });
        
        areaExists[areaId] = true;
        
        // Emit event to trigger NFT minting off-chain
        emit ForestAreaPurchased(msg.sender, areaId, location, area, msg.value, nftCost, ownerPayment);
    }
    
    function updateNFTInfo(address buyer, uint256 areaId, string memory nftTokenId, uint256 serialNumber) external {
        require(msg.sender == owner, "Only owner can update NFT info");
        require(areas[buyer].areaId == areaId, "Area not found for buyer");
        
        areas[buyer].nftTokenId = nftTokenId;
        areas[buyer].serialNumber = serialNumber;
        
        emit NFTMinted(buyer, areaId, nftTokenId, serialNumber);
    }
    
    function getAreaInfo(address buyer) external view returns (Area memory) {
        return areas[buyer];
    }
    
    function withdrawEmergency() external {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}