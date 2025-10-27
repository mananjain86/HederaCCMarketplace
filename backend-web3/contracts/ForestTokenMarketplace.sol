// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Interface matching your HandleCompany contract
interface IHandleCompany {
    function updateForestAreaPurchase(address _company, uint256 _forestAreaId) external;
    function updateCreditBalance(address _company, uint256 _amount) external;
}

contract DynamicForestFractionalMarketplaceDAO_v2 {
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
        uint256 totalShares; 
        uint256 baselineSequestrationPerYear;
        uint256 potentialSequestrationPerYear;
        uint256 regenerationScore;
        uint256 lastUpdated;
        uint256 accumulatedYield;
        bool active;
    }

    struct Ownership {
        address holder;
        uint256 shares;
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
    mapping(uint256 => Ownership[]) private forestOwners; 
    mapping(uint256 => mapping(address => uint256)) public shareBalance; 
    mapping(uint256 => mapping(uint256 => Proposal)) private forestProposals; // forestId => proposalId
    mapping(uint256 => uint256) public forestNextProposalId;

    uint256 public nextForestId = 1;
    address public governmentRegistrar;
    IHandleCompany public handleCompanyContract;
    mapping(address => bool) public relayers;

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

    // ------------------ Modifiers ------------------
    modifier onlyGovernment() {
        require(msg.sender == governmentRegistrar, "Not authorized registrar");
        _;
    }

    modifier onlyRelayer() {
        require(relayers[msg.sender] || msg.sender == governmentRegistrar, "Not relayer");
        _;
    }

    // ------------------ Constructor ------------------
    constructor(address _handleCompanyContract, address _govRegistrar) {
        require(_handleCompanyContract != address(0), "Invalid company contract");
        require(_govRegistrar != address(0), "Invalid government address");
        handleCompanyContract = IHandleCompany(_handleCompanyContract);
        governmentRegistrar = _govRegistrar;
    }

    // ------------------ Forest Registration ------------------
    /// @notice Government registers new forest with its HTS token id + serial (linked at registration)
    function registerForest(
        string calldata _htsTokenId,
        uint64 _serial,
        AreaInfo calldata _info,
        uint256 _totalShares,
        uint256 _baseline,
        uint256 _potential
    ) external onlyGovernment {
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
    }

    // ------------------ Fractional Ownership ------------------
    /// @notice Buy shares in a forest. Payment goes to the governmentRegistrar (treasury).
    /// pricePerShare uses regenerationScore as a driver; tweak formula as needed.
    function buyForestShares(uint256 _forestId, uint256 _shares) external payable {
        ForestArea storage f = forests[_forestId];
        require(f.active, "Forest not active");
        require(_shares > 0 && _shares <= remainingShares(_forestId), "Invalid share amount");

        // Example dynamic pricing: scale regenerationScore -> pricePerShare (in wei)
        // IMPORTANT: choose correct units for your environment. Here pricePerShare is in wei.
        uint256 pricePerShareWei = f.regenerationScore > 0 ? (f.regenerationScore * 1e15) / 10 : 1e15; // example: regen/10 * 0.001 ETH
        uint256 totalPrice = pricePerShareWei * _shares;
        require(msg.value == totalPrice, "Incorrect payment");

        shareBalance[_forestId][msg.sender] += _shares;
        forestOwners[_forestId].push(Ownership(msg.sender, _shares, block.timestamp));

        // Forward funds to government registrar (treasury)
        payable(governmentRegistrar).transfer(msg.value);

        // Notify HandleCompany about purchase (for bookkeeping / registry)
        // Note: HandleCompany requires caller to be authorized via setAuthorizedCaller
        handleCompanyContract.updateForestAreaPurchase(msg.sender, _forestId);

        emit SharesPurchased(_forestId, msg.sender, _shares, totalPrice);
    }

    /// @notice Called by an authorized relayer (mint.js) after an off-chain HTS share transfer to sync on-chain bookkeeping
    function recordShareTransfer(uint256 _forestId, address _from, address _to, uint256 _shares) external onlyRelayer {
        require(shareBalance[_forestId][_from] >= _shares, "Not enough shares");
        shareBalance[_forestId][_from] -= _shares;
        shareBalance[_forestId][_to] += _shares;
        forestOwners[_forestId].push(Ownership(_to, _shares, block.timestamp));

        emit ShareTransferRecorded(_forestId, _from, _to, _shares);
    }

    function remainingShares(uint256 _forestId) public view returns (uint256) {
        ForestArea storage f = forests[_forestId];
        uint256 sold;
        for (uint256 i = 0; i < forestOwners[_forestId].length; i++) {
            sold += forestOwners[_forestId][i].shares;
        }
        return f.totalShares - sold;
    }

    // ------------------ Regeneration & Yield ------------------
    /// @notice Called by oracle/relayer to update regeneration score & accumulate yield
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
        // yield units are same units as baselineSequestrationPerYear (choose consistent units e.g., kilograms)
        uint256 yieldGenerated = (_newScore * _baseline * delta) / (1000 * yearSeconds);
        f.accumulatedYield += yieldGenerated;
        f.regenerationScore = _newScore;
        f.baselineSequestrationPerYear = _baseline;
        f.potentialSequestrationPerYear = _potential;
        f.lastUpdated = block.timestamp;

        emit RegenerationUpdated(_forestId, _newScore, yieldGenerated);
    }

    /// @notice Claim accumulated yield for msg.sender based on their share percentage.
    /// This only updates bookkeeping and emits an event — actual issuance of HTS carbon tokens should be done off-chain or via a separate HTS mint flow.
    function claimYield(uint256 _forestId) external {
        ForestArea storage f = forests[_forestId];
        uint256 userShares = shareBalance[_forestId][msg.sender];
        require(userShares > 0, "No ownership");

        uint256 sharePercent = (userShares * 1e18) / f.totalShares;
        uint256 claimable = (f.accumulatedYield * sharePercent) / 1e18;
        require(claimable > 0, "No yield");

        f.accumulatedYield -= claimable;

        // Optionally: call HandleCompany.updateCreditBalance here to credit company bookkeeping
        // but avoid double-accounting if you prefer off-chain HTS mint + then call updateCreditBalance.
        emit YieldClaimed(_forestId, msg.sender, claimable);
    }

    // ------------------ DAO Proposal & Voting ------------------
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

    function executeProposal(uint256 _forestId, uint256 _proposalId) external {
        Proposal storage p = forestProposals[_forestId][_proposalId];
        require(block.timestamp > p.endTime, "Voting still active");
        require(!p.executed, "Already executed");

        uint256 totalShares = forests[_forestId].totalShares;
        bool passed = p.yesVotes > totalShares / 2; // simple majority
        p.executed = true;

        emit ProposalExecuted(_forestId, _proposalId, passed);
    }

    // ------------------ Carbon Credit Distribution ------------------
    /// @notice Distribute `totalCredits` to current owners proportionally.
    /// This function calls HandleCompany.updateCreditBalance for each holder (bookkeeping).
    /// Requires this contract to be authorized in HandleCompany via setAuthorizedCaller.
    function distributeCarbonCreditsOnChain(uint256 _forestId, uint256 totalCredits) external onlyRelayer returns (bool) {
        require(totalCredits > 0, "No credits to distribute");
        Ownership[] storage owners = forestOwners[_forestId];
        require(owners.length > 0, "No owners recorded for forest");

        // compute total shares among recorded owners
        uint256 totalRecordedShares = 0;
        for (uint256 i = 0; i < owners.length; i++) {
            totalRecordedShares += owners[i].shares;
        }
        require(totalRecordedShares > 0, "No shares recorded");

        // distribute credits proportional to recorded shares
        for (uint256 i = 0; i < owners.length; i++) {
            Ownership storage o = owners[i];
            uint256 credits = (totalCredits * o.shares) / totalRecordedShares;
            if (credits == 0) continue;
            // Call HandleCompany bookkeeping method
            handleCompanyContract.updateCreditBalance(o.holder, credits);
        }

        emit CarbonCreditsDistributed(_forestId, totalCredits);
        return true;
    }

    // ------------------ Helpers / Views ------------------
    /// @notice Returns owners list as two parallel arrays (addresses[], shares[]). Avoids returning structs directly.
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

    // ------------------ Relayer Management ------------------
    function setRelayer(address _addr, bool _status) external onlyGovernment {
        relayers[_addr] = _status;
    }

    // ------------------ Admin: update HandleCompany contract if needed ------------------
    function setHandleCompanyContract(address _new) external onlyGovernment {
        require(_new != address(0), "Invalid address");
        handleCompanyContract = IHandleCompany(_new);
    }

    receive() external payable {}
}
