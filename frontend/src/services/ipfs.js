import dotenv from 'dotenv';
dotenv.config();

import { PinataSDK } from 'pinata';
import { Blob, File } from 'buffer';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

// Upload image file to IPFS
const uploadImageToIPFS = async (req, res) => {
  try {
    const imageBlob = new Blob([req.file.buffer]);
    const imageFile = new File([imageBlob], req.file.originalname, { type: req.file.mimetype });
    let imageUpload = pinata.upload.public.file(imageFile);
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

// Utility function to upload metadata JSON to IPFS (no file, just data)
async function uploadMetadataToIPFS(data) {
  // Sanitize and validate input
  if (typeof data.name === 'string' && /<|>|script/i.test(data.name)) {
    throw new Error('Invalid characters in name.');
  }
  if (typeof data.description === 'string' && /<|>|script/i.test(data.description)) {
    throw new Error('Invalid characters in description.');
  }
  // Limit metadata size
  if (JSON.stringify(data).length > 10 * 1024) {
    throw new Error('Metadata too large.');
  }
  let metadataUpload = pinata.upload.public.json(data);
  if (data.name) {
    metadataUpload = metadataUpload.name(data.name + '.json');
  }
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
    return `${process.env.GATEWAY_URL}/ipfs/${cid}`;
  } catch (error) {
    res.status(404).json({ success: false, message: 'NFT not found' });
  }
};

// Get NFT Metadata by name
const listDataByName = async (req,res) => {
  try{
    const {name} = req.query;
    const fileResult = await pinata.files.public.list().name(name);
    const fileArray = Array.isArray(fileResult.files) ? fileResult.files : [];
    const nfts = fileArray.map(file => {
      const cid = file.cid;
      const id = file.id;
      if (!cid || !id) return null;
      return { url: `https://${process.env.GATEWAY_URL}/ipfs/${cid}`, id, cid };
    }).filter(Boolean);
    res.json({ success: true, nfts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    }
}

// Generate forest area NFT metadata and upload to IPFS
async function createForestAreaNFTMetadata(areaId, location, area, buyer, totalPrice) {
  try {
    // Create forest area NFT metadata
    const metadata = {
      name: `Forest Area #${areaId}`,
      description: `Certificate of forest area ownership in ${location}. This NFT represents ownership rights to ${area} of forest land.`,
      attributes: [
        {
          trait_type: "Area ID",
          value: areaId
        },
        {
          trait_type: "Location",
          value: location
        },
        {
          trait_type: "Area Size",
          value: area
        },
        {
          trait_type: "Purchase Price",
          display_type: "number",
          value: totalPrice
        },
        {
          trait_type: "Owner",
          value: buyer
        },
        {
          trait_type: "Asset Type",
          value: "Forest Area Certificate"
        },
        {
          trait_type: "Sustainability Rating",
          value: "A+"
        }
      ],
      type: "nft",
      category: "environmental"
    };

    // Upload metadata to IPFS
    const result = await uploadMetadataToIPFS(metadata);
    return result;
  } catch (error) {
    throw new Error(`Failed to create forest area NFT metadata: ${error.message}`);
  }
}

export {
  uploadImageToIPFS,
  getDataByCid,
  listDataByName,
  createForestAreaNFTMetadata
};