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

// Generate NFT metadata (forest or carbon)
async function createNFTMetadata(type, data) {
  try {
    const base = {
      type: "image/png",
      format: "HIP412@1.0.0"
    };

    let metadata;

    if (type === "forest") {
      metadata = {
        ...base,
        name: `Forest Area #${data.areaId}`,
        creator: "Carbon Chain Inc.",
        description: `Certificate of ownership for ${data.area} hectares of forest land in ${data.location}.`,
        image: "ipfs://bafybeibkvvab3fnqmbhgoeilxbkszyvjehu6wa55d7b2ymifpbdp73zhje",
        properties: {
          area_id: data.areaId,
          location: data.location,
          area_size: data.area,
          purchase_price_hbar: data.totalPrice,
          owner: data.buyer,
          asset_type: "Forest Area Certificate",
          sustainability_rating: "A+"
        }
      };
    } else {
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
          vintage_year: new Date().getFullYear()
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
