// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Minimal interface matching your HandleCompany contract
interface IHandleCompany {
    function updateForestAreaPurchase(address _company, uint256 _forestAreaId) external;
    function updateCreditBalance(address _company, uint256 _amount) external;
}

contract DynamicForestFractionalMarketplaceDAO_Final {
    // ------------------ Structs ------------------
    struct AreaInfo {
        string location;
        string gpsCoordinates;
        uint256 areaSize;
        string ipfsDeedHash;
    }

    struct ForestArea {
        uint256 forestId;
        string htsTokenId;
        uint64 serial;
        AreaInfo info;
        uint256 totalShares; // total share units (e.g., 10000 == 100%)
        uint256 baselineSequestrationPerYear;
        uint256 potentialSequestrationPerYear;
        uint256 regenerationScore; // scaled (e.g., 0..1000 for 0..100%)
        uint256 lastUpdated;
        uint256 accumulatedYield; // yield units (choose consistent unit: e.g., grams CO2)
        bool active;
    }

    struct Ownership {
        address holder;
        uint256 shares;     // integer share units
        uint256 lastClaimed;
    }

    struct Proposal {
        uint256 proposalId;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    // ------------------ State ------------------
    mapping(uint256 => ForestArea) public forests;
    mapping(uint256 => Ownership[]) private forestOwners;               // forestId => list of owner records (deduped)
    mapping(uint256 => mapping(address => uint256)) public shareBalance; // forestId => address => shares owned
    mapping(uint256 => mapping(uint256 => Proposal)) private forestProposals; // forestId => proposalId => Proposal
    mapping(uint256 => uint256) public forestNextProposalId;

    uint256 public nextForestId = 1;

    address public governmentRegistrar; // government account that can register forests
    address public owner;               // contract owner (platform admin) who can withdraw fees
    IHandleCompany public handleCompanyContract;

    // Platform fee (basis points). 10000 = 100%
    uint256 public platformFeeBP = 200; // default 2%
    uint256 public accumulatedPlatformFees;

    mapping(address => bool) public relayers; // oracle/relayer addresses authorized for updates & syncs

    // ------------------ Events ------------------
    event ForestRegistered(uint256 indexed forestId, string location, string htsTokenId, uint64 serial);
    event SharesPurchased(uint256 indexed forestId, address indexed buyer, uint256 shares, uint256 pricePaid);
    event ShareTransferRecorded(uint256 indexed forestId, address indexed from, address indexed to, uint256 shares);
    event RegenerationUpdated(uint256 indexed forestId, uint256 regenScore, uint256 yieldGenerated);
    event YieldClaimed(uint256 indexed forestId, address indexed holder, uint256 amount);
    event ProposalCreated(uint256 indexed forestId, uint256 proposalId, string description, uint256 startTime, uint256 endTime);
    event Voted(uint256 indexed forestId, uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed forestId, uint256 indexed proposalId, bool passed);
    event CarbonCreditsDistributed(uint256 indexed forestId, uint256 totalCredits);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event SetRelayer(address indexed relayer, bool enabled);
    event SetHandleCompany(address indexed newAddress);

    // ------------------ Modifiers ------------------
    modifier onlyGovernment() {
        require(msg.sender == governmentRegistrar, "Not authorized registrar");
        _;
    }

    modifier onlyRelayer() {
        require(relayers[msg.sender] || msg.sender == governmentRegistrar, "Not relayer");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    // ------------------ Constructor ------------------
    /// @param _handleCompanyContract address of HandleCompany contract
    /// @param _govRegistrar government registrar address (allowed to register forests)
    constructor(address _handleCompanyContract, address _govRegistrar) {
        require(_handleCompanyContract != address(0), "Invalid HandleCompany address");
        require(_govRegistrar != address(0), "Invalid government registrar address");
        handleCompanyContract = IHandleCompany(_handleCompanyContract);
        governmentRegistrar = _govRegistrar;
        owner = msg.sender;
    }

    // ------------------ ADMIN / RELAYER ------------------
    function setRelayer(address _addr, bool _status) external onlyGovernment {
        relayers[_addr] = _status;
        emit SetRelayer(_addr, _status);
    }

    function setHandleCompanyContract(address _new) external onlyGovernment {
        require(_new != address(0), "Invalid address");
        handleCompanyContract = IHandleCompany(_new);
        emit SetHandleCompany(_new);
    }

    function setPlatformFeeBP(uint256 _bp) external onlyOwner {
        require(_bp <= 1000, "Fee too high"); // example cap 10%
        platformFeeBP = _bp;
    }

    // ------------------ Registration ------------------
    /// @notice Government registers new forest with its HTS token id + serial (linked at registration)
    function registerForest(
        string calldata _htsTokenId,
        uint64 _serial,
        AreaInfo calldata _info,
        uint256 _totalShares,
        uint256 _baseline,
        uint256 _potential
    ) external onlyGovernment returns (uint256) {
        require(_totalShares > 0, "Invalid total shares");
        uint256 id = nextForestId++;

        forests[id] = ForestArea({
            forestId: id,
            htsTokenId: _htsTokenId,
            serial: _serial,
            info: _info,
            totalShares: _totalShares,
            baselineSequestrationPerYear: _baseline,
            potentialSequestrationPerYear: _potential,
            regenerationScore: 0,
            lastUpdated: block.timestamp,
            accumulatedYield: 0,
            active: true
        });

        emit ForestRegistered(id, _info.location, _htsTokenId, _serial);
        return id;
    }

    // ------------------ Fractional Ownership (buy) ------------------
    /// @notice Buy shares in a forest. Payment is split: government gets payment minus platform fee; platform fee stays in contract.
    /// pricePerShare uses regenerationScore as a driver; adjust formula to your economics.
    function buyForestShares(uint256 _forestId, uint256 _shares) external payable {
        ForestArea storage f = forests[_forestId];
        require(f.active, "Forest not active");
        require(_shares > 0 && _shares <= remainingShares(_forestId), "Invalid share amount");

        // Example dynamic pricing: pricePerShare in wei (example formula)
        // You should decide proper units. Here we use: pricePerShare = (regenScore / 10) * 0.001 ether scaled to wei if regen>0 else default 0.001 ether.
        uint256 pricePerShareWei = f.regenerationScore > 0 ? (f.regenerationScore * 1e15) / 10 : 1e15;
        uint256 totalPrice = pricePerShareWei * _shares;
        require(msg.value == totalPrice, "Incorrect payment");

        // Calculate platform fee and net amount to forward to government
        uint256 fee = (totalPrice * platformFeeBP) / 10000;
        uint256 amountToGov = totalPrice - fee;

        // Accumulate platform fees in contract (kept until owner withdraws)
        accumulatedPlatformFees += fee;

        // Update share balances (dedupe owners list)
        if (shareBalance[_forestId][msg.sender] > 0) {
            // existing holder: increase balance and update existing Ownership array entry
            shareBalance[_forestId][msg.sender] += _shares;

            Ownership[] storage owners = forestOwners[_forestId];
            bool found = false;
            for (uint256 i = 0; i < owners.length; i++) {
                if (owners[i].holder == msg.sender) {
                    owners[i].shares += _shares;
                    owners[i].lastClaimed = block.timestamp;
                    found = true;
                    break;
                }
            }
            if (!found) {
                // rare: shareBalance indicated they had shares but not in owners array — push new entry
                owners.push(Ownership(msg.sender, _shares, block.timestamp));
            }
        } else {
            // new holder
            shareBalance[_forestId][msg.sender] = _shares;
            forestOwners[_forestId].push(Ownership(msg.sender, _shares, block.timestamp));
        }

        // Forward net amount to governmentRegistrar (treasury)
        (bool sent, ) = payable(governmentRegistrar).call{value: amountToGov}("");
        require(sent, "Forward to government failed");

        // Notify HandleCompany bookkeeping about purchase (HandleCompany must allow this contract as authorized caller)
        handleCompanyContract.updateForestAreaPurchase(msg.sender, _forestId);

        emit SharesPurchased(_forestId, msg.sender, _shares, totalPrice);
    }

    /// @notice Relayer syncs off-chain HTS share transfers to on-chain bookkeeping
    function recordShareTransfer(uint256 _forestId, address _from, address _to, uint256 _shares) external onlyRelayer {
        require(shareBalance[_forestId][_from] >= _shares, "Not enough shares");
        shareBalance[_forestId][_from] -= _shares;
        shareBalance[_forestId][_to] += _shares;

        // Update destination owner record (dedupe)
        Ownership[] storage owners = forestOwners[_forestId];
        bool found = false;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i].holder == _to) {
                owners[i].shares += _shares;
                owners[i].lastClaimed = block.timestamp;
                found = true;
                break;
            }
        }
        if (!found) {
            owners.push(Ownership(_to, _shares, block.timestamp));
        }

        emit ShareTransferRecorded(_forestId, _from, _to, _shares);
    }

    /// @notice Calculate remaining shares (derived from recorded owner entries)
    function remainingShares(uint256 _forestId) public view returns (uint256) {
        ForestArea storage f = forests[_forestId];
        Ownership[] storage owners = forestOwners[_forestId];
        uint256 sold = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            sold += owners[i].shares;
        }
        if (sold >= f.totalShares) return 0;
        return f.totalShares - sold;
    }

    // ------------------ Regeneration & Yield ------------------
    /// @notice Update regeneration score and accumulate yield since last update. Called by oracle/relayer.
    function updateRegeneration(
        uint256 _forestId,
        uint256 _newScore,
        uint256 _baseline,
        uint256 _potential
    ) external onlyRelayer {
        ForestArea storage f = forests[_forestId];
        require(f.active, "Forest inactive");
        uint256 delta = block.timestamp - f.lastUpdated;
        require(delta > 0, "No time passed");

        uint256 yearSeconds = 365 days;
        // Example yield calculation: regenScore% * baseline * timeDelta / year
        // regenScore is scaled 0..1000 representing 0..100% (per-mille)
        uint256 yieldGenerated = (_newScore * _baseline * delta) / (1000 * yearSeconds);
        f.accumulatedYield += yieldGenerated;
        f.regenerationScore = _newScore;
        f.baselineSequestrationPerYear = _baseline;
        f.potentialSequestrationPerYear = _potential;
        f.lastUpdated = block.timestamp;

        emit RegenerationUpdated(_forestId, _newScore, yieldGenerated);
    }

    /// @notice Claim accumulated yield for msg.sender proportionally to shares.
    /// Emits YieldClaimed — actual HTS carbon-token minting must be done off-chain and `HandleCompany.updateCreditBalance` called accordingly.
    function claimYield(uint256 _forestId) external {
        ForestArea storage f = forests[_forestId];
        uint256 userShares = shareBalance[_forestId][msg.sender];
        require(userShares > 0, "No ownership");

        uint256 sharePercent = (userShares * 1e18) / f.totalShares;
        uint256 claimable = (f.accumulatedYield * sharePercent) / 1e18;
        require(claimable > 0, "No yield");

        f.accumulatedYield -= claimable;
        // Record last claimed time in owner entry
        Ownership[] storage owners = forestOwners[_forestId];
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i].holder == msg.sender) {
                owners[i].lastClaimed = block.timestamp;
                break;
            }
        }

        emit YieldClaimed(_forestId, msg.sender, claimable);
    } 

    // ------------------ DAO: Proposals & Voting ------------------
    /// @notice Create a proposal for a forest (must hold shares)
    function createProposal(uint256 _forestId, string calldata _description, uint256 _duration) external {
        require(shareBalance[_forestId][msg.sender] > 0, "Must hold shares to propose");
        uint256 proposalId = forestNextProposalId[_forestId]++;
        Proposal storage p = forestProposals[_forestId][proposalId];
        p.proposalId = proposalId;
        p.description = _description;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + _duration;
        p.executed = false;

        emit ProposalCreated(_forestId, proposalId, _description, p.startTime, p.endTime);
    }

    /// @notice Vote on a proposal using share-weighted voting. Provide number of shares you want to commit to vote (shares aren't locked).
    function vote(uint256 _forestId, uint256 _proposalId, bool _support, uint256 _shares) external {
        Proposal storage p = forestProposals[_forestId][_proposalId];
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "Voting not active");
        require(!p.hasVoted[msg.sender], "Already voted");
        require(shareBalance[_forestId][msg.sender] >= _shares, "Insufficient shares");

        p.hasVoted[msg.sender] = true;
        if (_support) p.yesVotes += _shares;
        else p.noVotes += _shares;

        emit Voted(_forestId, _proposalId, msg.sender, _support, _shares);
    }

    /// @notice Execute a proposal after voting period ends. Simple majority of total shares decides.
    function executeProposal(uint256 _forestId, uint256 _proposalId) external {
        Proposal storage p = forestProposals[_forestId][_proposalId];
        require(block.timestamp > p.endTime, "Voting still active");
        require(!p.executed, "Already executed");

        uint256 totalShares = forests[_forestId].totalShares;
        bool passed = p.yesVotes > totalShares / 2; // simple majority of total shares
        p.executed = true;

        emit ProposalExecuted(_forestId, _proposalId, passed);
    }

    // ------------------ Carbon Credit Distribution ------------------
    /// @notice Distribute `totalCredits` to recorded owners proportionally and update HandleCompany bookkeeping.
    /// Only relayer should call after HTS mint and/or validation that credits were issued.
    function distributeCarbonCreditsOnChain(uint256 _forestId, uint256 totalCredits) external onlyRelayer returns (bool) {
        require(totalCredits > 0, "No credits to distribute");
        Ownership[] storage owners = forestOwners[_forestId];
        require(owners.length > 0, "No owners recorded");

        // compute total shares among recorded owners
        uint256 totalRecordedShares = 0;
        for (uint256 i = 0; i < owners.length; i++) totalRecordedShares += owners[i].shares;
        require(totalRecordedShares > 0, "No shares recorded");

        // distribute credits proportional to recorded shares
        for (uint256 i = 0; i < owners.length; i++) {
            Ownership storage o = owners[i];
            uint256 credits = (totalCredits * o.shares) / totalRecordedShares;
            if (credits == 0) continue;
            // call HandleCompany bookkeeping method (contract must be authorized)
            handleCompanyContract.updateCreditBalance(o.holder, credits);
        }

        emit CarbonCreditsDistributed(_forestId, totalCredits);
        return true;
    }

    // ------------------ Views / Helpers ------------------
    /// @notice Returns owners list as two arrays to avoid returning structs
    function getOwners(uint256 _forestId) external view returns (address[] memory holders, uint256[] memory shares) {
        Ownership[] storage owners = forestOwners[_forestId];
        uint256 len = owners.length;
        holders = new address[](len);
        shares = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            holders[i] = owners[i].holder;
            shares[i] = owners[i].shares;
        }
        return (holders, shares);
    }

    /// @notice Read proposal summary (non-mapping fields only)
    function getProposalSummary(uint256 _forestId, uint256 _proposalId) external view returns (
        uint256 proposalId,
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage p = forestProposals[_forestId][_proposalId];
        return (
            p.proposalId,
            p.description,
            p.yesVotes,
            p.noVotes,
            p.startTime,
            p.endTime,
            p.executed
        );
    }

    // ------------------ Fee Withdrawal (platform owner) ------------------
    /// @notice Owner withdraws accumulated platform fees to `_to`
    function withdrawFees(address payable _to) external onlyOwner {
        require(_to != address(0), "Invalid recipient");
        require(accumulatedPlatformFees > 0, "No fees to withdraw");
        uint256 amount = accumulatedPlatformFees;
        accumulatedPlatformFees = 0;
        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Withdraw failed");
        emit FeesWithdrawn(_to, amount);
    }

    // ------------------ Utilities ------------------
    /// @notice Owner can transfer ownership
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner");
        owner = _newOwner;
    }

    /// @notice Government can change registrar address
    function setGovernmentRegistrar(address _newRegistrar) external onlyGovernment {
        require(_newRegistrar != address(0), "Invalid registrar");
        governmentRegistrar = _newRegistrar;
    }

    receive() external payable {}
}