import {ethers} from 'ethers';

const FOREST_ADDRESS = process.env.FOREST_CONTRACT_ADDRESS; 
const RPC_URL = "https://testnet.hashio.io/api";
const FOREST_ABI=[
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_shares",
				"type": "uint256"
			}
		],
		"name": "buyForestShares",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			}
		],
		"name": "claimYield",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_duration",
				"type": "uint256"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_handleCompanyContract",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_govRegistrar",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalCredits",
				"type": "uint256"
			}
		],
		"name": "CarbonCreditsDistributed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalCredits",
				"type": "uint256"
			}
		],
		"name": "distributeCarbonCreditsOnChain",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "executeProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FeesWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "location",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "htsTokenId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "serial",
				"type": "uint64"
			}
		],
		"name": "ForestRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			}
		],
		"name": "ProposalCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "passed",
				"type": "bool"
			}
		],
		"name": "ProposalExecuted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_shares",
				"type": "uint256"
			}
		],
		"name": "recordShareTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "regenScore",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "yieldGenerated",
				"type": "uint256"
			}
		],
		"name": "RegenerationUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_htsTokenId",
				"type": "string"
			},
			{
				"internalType": "uint64",
				"name": "_serial",
				"type": "uint64"
			},
			{
				"components": [
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "gpsCoordinates",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "areaSize",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "ipfsDeedHash",
						"type": "string"
					}
				],
				"internalType": "struct DynamicForestFractionalMarketplaceDAO_Final.AreaInfo",
				"name": "_info",
				"type": "tuple"
			},
			{
				"internalType": "uint256",
				"name": "_totalShares",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_baseline",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_potential",
				"type": "uint256"
			}
		],
		"name": "registerForest",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newRegistrar",
				"type": "address"
			}
		],
		"name": "setGovernmentRegistrar",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			}
		],
		"name": "SetHandleCompany",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_new",
				"type": "address"
			}
		],
		"name": "setHandleCompanyContract",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_bp",
				"type": "uint256"
			}
		],
		"name": "setPlatformFeeBP",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_addr",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "_status",
				"type": "bool"
			}
		],
		"name": "setRelayer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "relayer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "enabled",
				"type": "bool"
			}
		],
		"name": "SetRelayer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "shares",
				"type": "uint256"
			}
		],
		"name": "ShareTransferRecorded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "shares",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pricePaid",
				"type": "uint256"
			}
		],
		"name": "SharesPurchased",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_newScore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_baseline",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_potential",
				"type": "uint256"
			}
		],
		"name": "updateRegeneration",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_support",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "_shares",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "support",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "weight",
				"type": "uint256"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address payable",
				"name": "_to",
				"type": "address"
			}
		],
		"name": "withdrawFees",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "holder",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "YieldClaimed",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "accumulatedPlatformFees",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "claimedSoFar",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "forestNextProposalId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "forests",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "forestId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "htsTokenId",
				"type": "string"
			},
			{
				"internalType": "uint64",
				"name": "serial",
				"type": "uint64"
			},
			{
				"components": [
					{
						"internalType": "string",
						"name": "location",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "gpsCoordinates",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "areaSize",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "ipfsDeedHash",
						"type": "string"
					}
				],
				"internalType": "struct DynamicForestFractionalMarketplaceDAO_Final.AreaInfo",
				"name": "info",
				"type": "tuple"
			},
			{
				"internalType": "uint256",
				"name": "totalShares",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "baselineSequestrationPerYear",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "potentialSequestrationPerYear",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "regenerationScore",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdated",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "accumulatedYield",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getClaimableYield",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "claimable",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			}
		],
		"name": "getOwners",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "holders",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "shares",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			}
		],
		"name": "getProposalSummary",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "yesVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "noVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "governmentRegistrar",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "handleCompanyContract",
		"outputs": [
			{
				"internalType": "contract IHandleCompany",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextForestId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "platformFeeBP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "relayers",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_forestId",
				"type": "uint256"
			}
		],
		"name": "remainingShares",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "shareBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "totalGeneratedYield",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
export const getData = async (id) => {
  try {
    // Validate id (expect numeric string or number)
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return { success: false, error: "Invalid Forest ID.", statusCode: 400 };
    }

    if (!FOREST_ADDRESS) {
      return { success: false, error: "Forest contract address is not configured on the server.", statusCode: 500 };
    }

    // 1. Connect to the blockchain (read-only)
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(FOREST_ADDRESS, FOREST_ABI, provider);

    // Ensure id is a number when calling the contract
    const forestIdNum = Number(id);

    // 2. Call the public 'forests' function
    const forest = await contract.forests(forestIdNum);

    // 3. Check if the forest exists
    // forest.forestId is likely a BigNumber - convert to string for comparison
    if (!forest || forest.forestId?.toString() === "0") {
      return { success: false, error: "Forest not found.", statusCode: 404 };
    }

    // 4. Format the data into clean JSON
    const responseData = {
      success: true,
      forestId: Number(forest.forestId.toString()),
      active: !!forest.active,
      htsTokenId: forest.htsTokenId,
      serial: Number(forest.serial?.toString() || 0),
      info: {
        location: forest.info?.location || "",
        gpsCoordinates: forest.info?.gpsCoordinates || "",
        areaSize: forest.info?.areaSize?.toString() || "0",
        ipfsDeedHash: forest.info?.ipfsDeedHash || "",
      },
      totalShares: forest.totalShares?.toString() || "0",
      regenerationScore: Number(forest.regenerationScore?.toString() || 0),
      baselineSequestrationPerYear: forest.baselineSequestrationPerYear?.toString() || "0",
      potentialSequestrationPerYear: forest.potentialSequestrationPerYear?.toString() || "0",
      accumulatedYield: forest.accumulatedYield?.toString() || "0",
      lastUpdated: forest.lastUpdated
        ? new Date(Number(forest.lastUpdated.toString()) * 1000).toISOString()
        : null,
    };

    return responseData;
  } catch (error) {
    console.error("Error fetching forest data:", error);
    return { success: false, error: error.message || "Internal server error.", statusCode: 500 };
  }
}