// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./company.sol";
import "./Selling.sol";

contract BuyCredits {
    HandleCompany public companyContract;
    CarbonCreditsMarketplace public marketplaceContract;
    
    constructor(address _companyContract, address _marketplaceContract) {
        companyContract = HandleCompany(_companyContract);
        marketplaceContract = CarbonCreditsMarketplace(_marketplaceContract);
    }
    
    function buyCredits(
        uint256 _listingId,
        uint256 _totalCredits,
        uint256 _pricePerCredit,
        uint256 _totalPrice,
        address _buyerAddress
    ) external payable {
        // Get listing details to verify seller and availability
        (
            uint256 id,
            address seller,
            uint256 amount,
            uint256 pricePerCredit,
            bool isActive,
            , , , , , , , , , , , , , ,  // Skip other return values
        ) = marketplaceContract.getListingDetails(_listingId);
        
        require(isActive, "Listing not active");
        require(_totalCredits <= amount, "Insufficient credits available");
        require(_pricePerCredit == pricePerCredit, "Price mismatch");
        require(_totalPrice == _totalCredits * _pricePerCredit, "Total price mismatch");
        require(msg.value >= _totalPrice, "Insufficient payment");
        
        // Purchase through marketplace contract
        marketplaceContract.buyCarbonCredits{value: _totalPrice}(_listingId, _totalCredits);
        
        // Add credits to buyer's company account
        companyContract.addCarbonCreditsToCompany(_buyerAddress, _totalCredits);
        
        // Refund excess payment
        if (msg.value > _totalPrice) {
            payable(msg.sender).transfer(msg.value - _totalPrice);
        }
    }
}