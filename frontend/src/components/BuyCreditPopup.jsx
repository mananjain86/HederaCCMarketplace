import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, AlertCircle, DollarSign } from 'lucide-react';
import { ethers } from "ethers";
import { mintNFT } from "../utils/mint.js";
import buyCreditAbi from "../abi/BuyCredits.json";
import companyAbi from "../abi/HandleCompany.json";

const BUY_CREDITS_CONTRACT_ADDRESS = "YOUR_BUY_CREDITS_CONTRACT_ADDRESS"; // Add your deployed contract address
const COMPANY_CONTRACT_ADDRESS = "0xf1A975549085613B4399931d95b4ab10791887C9";

export function BuyCreditPopup({ 
  isOpen, 
  onClose, 
  creditData, 
}) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !creditData) return null;

  const pricePerCredit = parseFloat(creditData.pricePerCredit) || 0;
  const totalPrice = quantity * pricePerCredit;
  const maxQuantity = creditData.availableCredits || 0;

  const handleQuantityChange = (newQuantity) => {
    setError('');
    
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    
    if (newQuantity > maxQuantity) {
      setQuantity(maxQuantity);
      setError(`Maximum available credits: ${maxQuantity}`);
      return;
    }
    
    setQuantity(newQuantity);
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    handleQuantityChange(value);
  };

  const handlePurchase = async () => {
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantity > maxQuantity) {
      setError(`Maximum available credits: ${maxQuantity}`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const buyerAddress = await signer.getAddress();

      // Get buyer's Hedera account ID from company contract
      const companyContract = new ethers.Contract(
        COMPANY_CONTRACT_ADDRESS,
        companyAbi,
        signer
      );
      
      const buyerHederaAccountId = await companyContract.getAccountId();
      if (!buyerHederaAccountId) {
        throw new Error('You must be registered as a company to purchase credits');
      }

      // Calculate total price in wei
      const totalPriceWei = ethers.parseEther((quantity * pricePerCredit).toString());

      // Call the buy credits contract
      const buyCreditsContract = new ethers.Contract(
        BUY_CREDITS_CONTRACT_ADDRESS,
        buyCreditAbi,
        signer
      );

      // Execute the purchase
      const tx = await buyCreditsContract.buyCredits(
        creditData.id, // listing ID
        quantity,
        ethers.parseEther(pricePerCredit.toString()),
        totalPriceWei,
        buyerAddress,
        { value: totalPriceWei }
      );

      console.log('Purchase transaction submitted:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Purchase confirmed:', receipt);

      // Mint and transfer NFT after successful purchase
      try {
        const nftMetadata = {
          name: `Carbon Credit Certificate - ${creditData.projectName}`,
          description: `Certificate for ${quantity} carbon credits from project: ${creditData.projectName}`,
          projectName: creditData.projectName,
          projectType: creditData.projectType || 'Carbon Offset',
          location: creditData.location,
          creditsAmount: quantity,
          purchaseDate: new Date().toISOString(),
          vintage: creditData.creditVintageYear,
          registry: creditData.accreditedRegistry,
          txHash: receipt.hash
        };

        console.log('Minting NFT certificate...');
        const nftResult = await mintNFT(buyerHederaAccountId, nftMetadata);
        console.log('NFT minted successfully:', nftResult);
        
      } catch (nftError) {
        console.error('NFT minting failed:', nftError);
        // Don't fail the entire transaction if NFT minting fails
        setError('Credits purchased successfully, but NFT certificate minting failed. Please contact support.');
      }

      // Success - close popup
      alert(`Successfully purchased ${quantity} carbon credits! Transaction: ${tx.hash}`);
      onClose();
      
    } catch (err) {
      console.error('Purchase error:', err);
      
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaction was rejected by user');
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient funds for this purchase');
      } else if (err.message.includes('Listing not active')) {
        setError('This listing is no longer available');
      } else if (err.message.includes('Insufficient credits available')) {
        setError('Not enough credits available for this quantity');
      } else {
        setError(err.message || 'Purchase failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-emerald-500/20 p-6 w-full max-w-md mx-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Purchase Carbon Credits</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Project Info */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">{creditData.projectName}</h3>
          <div className="text-sm text-slate-400 space-y-1">
            <div>📍 {creditData.location}</div>
            <div>🏭 {creditData.accreditedRegistry}</div>
            <div>📅 Vintage: {creditData.creditVintageYear}</div>
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-emerald-300 mb-3">
            Select Quantity (tons CO₂)
          </label>
          
          <div className="flex items-center space-x-3 mb-3">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-center focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="flex items-center justify-center w-10 h-10 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400 text-center">
            Available: {maxQuantity.toLocaleString()} credits
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-slate-800/30 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Price per credit:</span>
            <span className="text-white">{pricePerCredit} ETH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Quantity:</span>
            <span className="text-white">{quantity.toLocaleString()} credits</span>
          </div>
          <div className="border-t border-slate-700 pt-2">
            <div className="flex justify-between">
              <span className="text-white font-semibold">Total:</span>
              <span className="text-emerald-400 font-bold text-lg">
                {totalPrice.toFixed(6)} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handlePurchase}
            disabled={isProcessing || quantity < 1 || quantity > maxQuantity}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                <span>Purchase Credits</span>
              </>
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
          <div className="flex items-start space-x-2 text-blue-400">
            <DollarSign className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-medium mb-1">Transaction Details:</div>
              <div>• Gas fees will be added at checkout</div>
              <div>• Credits will be transferred to your wallet</div>
              <div>• Transaction is irreversible once confirmed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}