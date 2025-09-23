import { mintNFT } from './mint.js';
import { buyCreditsContract, buyForestAreaContract } from './contract.js';
import { submitMessage } from './consensus.js';

/**
 * Buy carbon credits - calls smart contract and mints NFT
 * @param {string} buyerAccountId - Hedera account ID of the buyer
 * @param {number} creditAmount - Amount of credits to buy
 * @param {string} price - Price in HBAR
 * @param {string} topicId - Topic ID for consensus service
 * @returns {Object} Transaction result and NFT details
 */
async function buyCredits(buyerAccountId, creditAmount, price, topicId) {
    try {
        console.log(`Initiating credit purchase: ${creditAmount} credits for ${price} HBAR`);
        
        // Step 1: Call smart contract to handle the purchase
        const contractResult = await buyCreditsContract(buyerAccountId, creditAmount, price);
        
        if (!contractResult.success) {
            throw new Error(`Contract call failed: ${contractResult.error}`);
        }
        
        // Step 2: Mint NFT representing the carbon credits
        const nftMetadata = {
            name: `Carbon Credits - ${creditAmount}`,
            description: `${creditAmount} verified carbon credits`,
            type: "carbon_credits",
            amount: creditAmount,
            purchaseDate: new Date().toISOString(),
            buyerId: buyerAccountId,
            contractTxId: contractResult.transactionId
        };
        
        const mintResult = await mintNFT(nftMetadata, buyerAccountId);
        
        if (!mintResult.success) {
            throw new Error(`NFT minting failed: ${mintResult.error}`);
        }
        
        // Step 3: Submit transaction details to consensus service
        const consensusMessage = {
            type: "credit_purchase",
            buyer: buyerAccountId,
            amount: creditAmount,
            price: price,
            nftTokenId: mintResult.tokenId,
            nftSequenceNumber: mintResult.sequenceNumber,
            timestamp: new Date().toISOString()
        };
        
        await submitMessage(topicId, JSON.stringify(consensusMessage));
        
        return {
            success: true,
            transactionId: contractResult.transactionId,
            nftTokenId: mintResult.tokenId,
            nftSerialNumber: mintResult.serialNumber,
            creditAmount: creditAmount,
            totalCost: price
        };
        
    } catch (error) {
        console.error("Error buying credits:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Buy forest area - calls smart contract and mints NFT
 * @param {string} buyerAccountId - Hedera account ID of the buyer
 * @param {number} areaSize - Size of forest area in hectares
 * @param {string} price - Price in HBAR
 * @param {string} location - Forest location details
 * @param {string} topicId - Topic ID for consensus service
 * @returns {Object} Transaction result and NFT details
 */
async function buyForestArea(buyerAccountId, areaSize, price, location, topicId) {
    try {
        console.log(`Initiating forest area purchase: ${areaSize} hectares at ${location}`);
        
        // Step 1: Call smart contract to handle the purchase
        const contractResult = await buyForestAreaContract(buyerAccountId, areaSize, price, location);
        
        if (!contractResult.success) {
            throw new Error(`Contract call failed: ${contractResult.error}`);
        }
        
        // Step 2: Mint NFT representing the forest area ownership
        const nftMetadata = {
            name: `Forest Area - ${location}`,
            description: `${areaSize} hectares of protected forest area at ${location}`,
            type: "forest_area",
            size: areaSize,
            location: location,
            purchaseDate: new Date().toISOString(),
            ownerId: buyerAccountId,
            contractTxId: contractResult.transactionId
        };
        
        const mintResult = await mintNFT(nftMetadata, buyerAccountId);
        
        if (!mintResult.success) {
            throw new Error(`NFT minting failed: ${mintResult.error}`);
        }
        
        // Step 3: Submit transaction details to consensus service
        const consensusMessage = {
            type: "forest_purchase",
            buyer: buyerAccountId,
            areaSize: areaSize,
            location: location,
            price: price,
            nftTokenId: mintResult.tokenId,
            nftSerialNumber: mintResult.serialNumber,
            timestamp: new Date().toISOString()
        };
        
        await submitMessage(topicId, JSON.stringify(consensusMessage));
        
        return {
            success: true,
            transactionId: contractResult.transactionId,
            nftTokenId: mintResult.tokenId,
            nftSerialNumber: mintResult.serialNumber,
            areaSize: areaSize,
            location: location,
            totalCost: price
        };
        
    } catch (error) {
        console.error("Error buying forest area:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export { buyCredits, buyForestArea };