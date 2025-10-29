import dotenv from 'dotenv';
dotenv.config();

import { PinataSDK } from 'pinata';
import { Blob, File } from 'buffer';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

const IMAGE_BARREN = "https://white-generous-iguana-225.mypinata.cloud/ipfs/bafkreihnss2s7ilwikjmx2lxbtx44ikfrnor3g3avp5zajxcapbjjuhjze";
const IMAGE_MIXED = "https://white-generous-iguana-225.mypinata.cloud/ipfs/bafybeiet5vzjkcbiy7r7crhsfij4oiwo7vliv2iryi6o2jdcy2bxvb67fu";   
const IMAGE_GREEN = "https://white-generous-iguana-225.mypinata.cloud/ipfs/bafybeicd7o7g7jtj4kjhmeqex45bhoth4ppokzlrdgzrzrzez2ulavcofe";   

// Upload image file to IPFS
const uploadImageToIPFS = async (req, res) => {
  try {
    const imageBlob = new Blob([req.file.buffer]);
    const imageFile = new File([imageBlob], req.file.originalname, { type: req.file.mimetype });
    let imageUpload = await pinata.upload.public.file(imageFile);
    if (req.body.group) imageUpload = imageUpload.group(req.body.group);
    if (req.body.imageName) imageUpload = imageUpload.name(req.body.imageName);
    if (req.body.keyvalues) imageUpload = imageUpload.keyvalues(req.body.keyvalues);

    const imageResult = await imageUpload;

    res.json({
      success: true,
      imageCid: imageResult.cid,
      imageUrl: `${process.env.GATEWAY_URL}/ipfs/${imageResult.cid}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Utility function to upload metadata JSON to IPFS
async function uploadMetadataToIPFS(data) {
  if (typeof data.name === 'string' && /<|>|script/i.test(data.name)) {
    throw new Error('Invalid characters in name.');
  }
  if (typeof data.description === 'string' && /<|>|script/i.test(data.description)) {
    throw new Error('Invalid characters in description.');
  }
  if (JSON.stringify(data).length > 10 * 1024) {
    throw new Error('Metadata too large.');
  }

  let metadataUpload = pinata.upload.public.json(data);
  if (data.name) metadataUpload = metadataUpload.name(`${data.name}.json`);
  const metadataResult = await metadataUpload;

  return {
    success: true,
    metadataCid: metadataResult.cid,
    metadataUrl: `${process.env.GATEWAY_URL}/ipfs/${metadataResult.cid}`,
    id: metadataResult.id
  };
}

// Get NFT metadata by CID
const getDataByCid = async (req, res) => {
  try {
    const { cid } = req.params;
    const url = `${process.env.GATEWAY_URL}/ipfs/${cid}`;
    res.json({ success: true, url });
  } catch (error) {
    res.status(404).json({ success: false, message: 'NFT not found' });
  }
};

// Get NFT Metadata by name
const listDataByName = async (req, res) => {
  try {
    const { name } = req.query;
    const fileResult = await pinata.files.public.list().name(name);
    const fileArray = Array.isArray(fileResult.files) ? fileResult.files : [];
    const nfts = fileArray
      .map(file => {
        const { cid, id } = file;
        if (!cid || !id) return null;
        return { url: `${process.env.GATEWAY_URL}/ipfs/${cid}`, id, cid };
      })
      .filter(Boolean);
    res.json({ success: true, nfts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate NFT metadata (forest or carbon) - UPDATED for Dynamic NFTs
async function createNFTMetadata(type, data) {
  try {
    const base = {
      type: "image/png",
      format: "HIP412@1.0.0"
    };

    let metadata;

    if (type === "forest") {
  
    let regenScore = data.regenerationScore;
    let imageUrl = IMAGE_MIXED; 

    if (typeof regenScore === "number") {
        if (regenScore < 300) imageUrl = IMAGE_BARREN;
        else if (regenScore > 750) imageUrl = IMAGE_GREEN;
        else imageUrl = IMAGE_MIXED;
    } else {
        imageUrl = IMAGE_MIXED; // Fallback
    }
    let sustainabilityRating = "Pending";
       if (typeof regenScore === "number") {
           if (regenScore >= 800) sustainabilityRating = "A+";
           else if (regenScore >= 600) sustainabilityRating = "A";
           else if (regenScore >= 400) sustainabilityRating = "B";
           else sustainabilityRating = "C";
       }

    metadata = {
        ...base,
        name: data.name || `Forest Shares (${data.sharesBought}) - ${data.location}`,
        creator: "Carbon Chain Inc.",
        // UPDATED: Description uses new fields
        description: data.description || `Fractional ownership certificate for ${data.sharesBought} shares in ${data.location}, linked to Forest ID ${data.forestId}.`,
        image: imageUrl,
        attributes: [
          { trait_type: "Asset Type", value: "Forest Share Certificate" },
          { trait_type: "Forest ID", value: String(data.forestId || "N/A") },
          { trait_type: "Location", value: String(data.location || "Unknown") },
          { trait_type: "Shares Bought", value: String(data.sharesBought || "N/A") },
          { trait_type: "Regeneration Score", value: String(regenScore ?? "Pending"), display_type: "number" },
          { trait_type: "Baseline Sequestration (CO2/yr)", value: String(data.baselineSequestration || 0), display_type: "number" },
          { trait_type: "Potential Sequestration (CO2/yr)", value: String(data.potentialSequestration || 0), display_type: "number" },
          { trait_type: "Sustainability Rating", value: sustainabilityRating }, // USE IT HERE
          { trait_type: "Original NFT ID", value: String(data.originalNftId || "N/A") },
        ],
        properties: {
            // --- Share Info ---
            asset_type: "Forest Share Certificate",
            forest_id: data.forestId,
            shares_bought: data.sharesBought,

            // --- Original Forest Info ---
            location: data.location,
            total_forest_area_sq_m: data.areaSize, // Clarified unit
            original_nft_id: data.originalNftId,
            ipfs_deed_hash: data.ipfsDeedHash,

            // --- Purchase Info ---
            owner_account_id: data.buyerAccountId,
            owner_eth_address: data.buyerEthAddress,
            price_paid_hbar: data.pricePaid,
            purchase_tx_hash: data.purchaseTxHash,
            
            // --- Regeneration & Sequestration Data ---
            regeneration_score: data.regenerationScore,
            baseline_sequestration_c02_yr: data.baselineSequestration,
            potential_sequestration_c02_yr: data.potentialSequestration,
            
            // --- Metadata ---
            // UPDATED: Logic is for a score out of 1000
            sustainability_rating: data.regenerationScore 
                ? (data.regenerationScore >= 800 ? "A+" 
                : data.regenerationScore >= 600 ? "A" 
                : data.regenerationScore >= 400 ? "B" : "C")
                : "Pending",
            certification_status: "Verified",
            minted_at: new Date().toISOString()
        },
    };

    } else {
      // Carbon Credit NFT (unchanged)
      metadata = {
        ...base,
        name: `Carbon Credit #${data.id}`,
        creator: "Carbon Chain Inc.",
        description: `Tradable carbon credit representing ${data.amount} tons of CO₂ offset.`,
        image: "ipfs://bafybeigyi6bpq2httfil2jbrgolqcnecd5i7t3vyqjq3bqj4tsethyuay4",
        properties: {
          credit_id: data.id,
          co2_offset_tons: data.amount,
          purchase_price_hbar: data.totalPrice,
          owner: data.buyer,
          asset_type: "Carbon Credit",
          certification_standard: "Verified Carbon Standard (VCS)",
          vintage_year: new Date().getFullYear(),
          minted_at: new Date().toISOString()
        }
      };
    }

    const result = await uploadMetadataToIPFS(metadata);
    return result;
  } catch (error) {
    throw new Error(`Failed to create NFT metadata: ${error.message}`);
  }
}

export {
  uploadImageToIPFS,
  uploadMetadataToIPFS,
  getDataByCid,
  listDataByName,
  createNFTMetadata
};
