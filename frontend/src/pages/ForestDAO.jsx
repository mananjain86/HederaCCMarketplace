import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import ForestABI from "../abi/ForestTokenMarketplace.json";
import { useToast } from "../hooks/useToast";

const FOREST_CONTRACT_ADDRESS =
  import.meta.env.VITE_FOREST_CONTRACT_ADDRESS ||
  "0xD8a0C3B0CB1FDc61262772eE502a97C74dbA86B9";
const RPC_URL = "https://testnet.hashio.io/api";

export default function ForestDAO() {
  const [forestId, setForestId] = useState("");
  const [proposals, setProposals] = useState([]);
  const [newProposalDesc, setNewProposalDesc] = useState("");
  const [newProposalDuration, setNewProposalDuration] = useState(86400); // 1 day
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [sharesToVote, setSharesToVote] = useState(1); // <-- move shares state here
  const [voting, setVoting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [userShares, setUserShares] = useState(0);
  const [createForestId, setCreateForestId] = useState(""); // for create proposal section
  const { toast } = useToast();

  // Fetch proposals for a forest
  const fetchProposals = async () => {
    if (!forestId) return;
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(FOREST_CONTRACT_ADDRESS, ForestABI, provider);

      // Get the next proposal id
      const nextProposalId = await contract.forestNextProposalId(forestId);
      const proposalsArr = [];
      for (let i = 0; i < Number(nextProposalId); i++) {
        const summary = await contract.getProposalSummary(forestId, i);
        proposalsArr.push({
          proposalId: Number(summary[0]),
          description: summary[1],
          yesVotes: Number(summary[2]),
          noVotes: Number(summary[3]),
          startTime: Number(summary[4]),
          endTime: Number(summary[5]),
          executed: summary[6],
        });
      }
      setProposals(proposalsArr.reverse());
    } catch (err) {
      toast.error("Failed to fetch proposals");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's share balance for the forest
  const fetchUserShares = async () => {
    if (!window.ethereum || !forestId) return setUserShares(0);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(FOREST_CONTRACT_ADDRESS, ForestABI, provider);
      const shares = await contract.shareBalance(forestId, address);
      setUserShares(Number(shares));
    } catch {
      setUserShares(0);
    }
  };

  useEffect(() => {
    if (forestId) {
      fetchProposals();
      fetchUserShares();
    }
    // eslint-disable-next-line
  }, [forestId]);

  // Create a new proposal
  const handleCreateProposal = async (inputForestId) => {
    if (!window.ethereum) return toast.error("Connect MetaMask");
    if (!inputForestId || !newProposalDesc) return toast.error("Fill all fields");
    setCreating(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FOREST_CONTRACT_ADDRESS, ForestABI, signer);

      const tx = await contract.createProposal(
        inputForestId,
        newProposalDesc,
        newProposalDuration
      );
      await tx.wait();
      toast.success("Proposal created!");
      setNewProposalDesc("");
      setCreateForestId("");
      fetchProposals();
    } catch (err) {
      toast.error("Failed to create proposal: " + (err.reason || err.message));
    } finally {
      setCreating(false);
    }
  };

  // Vote on a proposal
  const handleVote = async (proposalId, support, shares) => {
    if (!window.ethereum) return toast.error("Connect MetaMask");
    if (!forestId || !shares) return toast.error("Enter shares to vote");
    setVoting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FOREST_CONTRACT_ADDRESS, ForestABI, signer);

      const tx = await contract.vote(forestId, proposalId, support, shares);
      await tx.wait();
      toast.success("Vote submitted!");
      setSelectedProposal(null);
      fetchProposals();
    } catch (err) {
      toast.error("Failed to vote: " + (err.reason || err.message));
    } finally {
      setVoting(false);
    }
  };

  // Execute a proposal
  const handleExecute = async (proposalId) => {
    if (!window.ethereum) return toast.error("Connect MetaMask");
    setExecuting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FOREST_CONTRACT_ADDRESS, ForestABI, signer);

      const tx = await contract.executeProposal(forestId, proposalId);
      await tx.wait();
      toast.success("Proposal executed!");
      fetchProposals();
    } catch (err) {
      toast.error("Failed to execute: " + (err.reason || err.message));
    } finally {
      setExecuting(false);
    }
  };

  // Section 1: View Proposals
  const renderProposals = () => (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-[#1b4332] mb-4 tracking-tight">Proposals</h2>
      {loading ? (
        <div className="text-[#3a5a40]/80">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="text-[#3a5a40]/80">No proposals found for this forest.</div>
      ) : (
        <div className="space-y-6">
          {proposals.map((p) => {
            const now = Math.floor(Date.now() / 1000);
            const canExecute = !p.executed && now > p.endTime;
            return (
              <div
                key={p.proposalId}
                className={`bg-white/80 backdrop-blur-xl border border-[#b7e4c7]/40 rounded-2xl p-6 shadow-lg cursor-pointer transition-all hover:ring-2 hover:ring-[#40916c] ${userShares > 0 && !p.executed && now <= p.endTime ? 'hover:scale-[1.01]' : ''}`}
                onClick={() => userShares > 0 && !p.executed && now <= p.endTime ? (setSelectedProposal(p), setSharesToVote(1)) : null}
                title={userShares > 0 && !p.executed && now <= p.endTime ? "Click to vote" : ""}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-lg font-bold text-[#1b4332]">#{p.proposalId}</span>
                    <span className="ml-2 text-[#3a5a40]/90">{p.description}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.executed ? "bg-gradient-to-r from-[#b7e4c7] to-[#40916c] text-[#1b4332]" : "bg-yellow-100 text-yellow-700 border border-yellow-300"}`}>
                    {p.executed ? "Executed" : "Active"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 mb-2">
                  <div className="text-[#3a5a40]/80">Yes: <span className="text-[#40916c] font-bold">{p.yesVotes}</span></div>
                  <div className="text-[#3a5a40]/80">No: <span className="text-red-700 font-bold">{p.noVotes}</span></div>
                  <div className="text-[#3a5a40]/80">Start: <span className="text-[#1b4332]">{new Date(p.startTime * 1000).toLocaleString()}</span></div>
                  <div className="text-[#3a5a40]/80">End: <span className="text-[#1b4332]">{new Date(p.endTime * 1000).toLocaleString()}</span></div>
                </div>
                {canExecute && (
                  <button
                    onClick={e => { e.stopPropagation(); handleExecute(p.proposalId); }}
                    disabled={executing}
                    className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
                  >
                    {executing ? "Executing..." : "Execute Proposal"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Section 2: Create Proposal (restyled)
  const renderCreateProposal = () => (
    <div className="mb-10 p-6 bg-white/70 rounded-2xl border border-[#3a5a40]/10 shadow-sm">
      <h2 className="text-xl font-bold text-[#1b4332] mb-4">Create Proposal</h2>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <label className="text-[#3a5a40] font-semibold">Forest ID:</label>
        <input
          type="number"
          value={createForestId}
          onChange={e => setCreateForestId(e.target.value)}
          className="w-40 px-4 py-3 rounded-xl bg-white/70 text-[#1b4332] border border-[#3a5a40]/20 placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] transition-all"
          placeholder="Enter Forest ID"
          disabled={creating}
        />
      </div>
      <input
        type="text"
        value={newProposalDesc}
        onChange={e => setNewProposalDesc(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/70 text-[#1b4332] border border-[#3a5a40]/20 placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] transition-all mb-4"
        placeholder="Proposal description"
        disabled={creating}
      />
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
        <label className="text-[#3a5a40] font-semibold">Duration (seconds):</label>
        <input
          type="number"
          value={newProposalDuration}
          onChange={e => setNewProposalDuration(Number(e.target.value))}
          className="w-32 px-4 py-3 rounded-xl bg-white/70 text-[#1b4332] border border-[#3a5a40]/20 placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] transition-all"
          disabled={creating}
        />
      </div>
      <button
        onClick={() => handleCreateProposal(createForestId)}
        disabled={creating || !newProposalDesc || !createForestId}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
      >
        {creating ? "Creating..." : "Create Proposal"}
      </button>
    </div>
  );

  // Section 3: Vote Modal/Section (fixed)
  const renderVoteSection = () => {
    if (!selectedProposal) return null;
    const p = selectedProposal;

    // Only allow voting if user has shares, proposal is active, and endTime not passed
    const now = Math.floor(Date.now() / 1000);
    if (userShares === 0 || p.executed || now > p.endTime) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-xl border border-[#b7e4c7]/40 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
          <button
            className="absolute top-2 right-2 text-[#3a5a40]/60 hover:text-[#1b4332] text-2xl font-bold"
            onClick={() => setSelectedProposal(null)}
            aria-label="Close vote modal"
          >
            ✕
          </button>
          <h3 className="text-2xl font-extrabold text-[#1b4332] mb-2 tracking-tight">Vote on Proposal #{p.proposalId}</h3>
          <p className="text-[#3a5a40]/90 mb-4">{p.description}</p>
          <div className="mb-4">
            <label className="text-[#3a5a40] mr-2 font-semibold">Shares to vote:</label>
            <input
              type="number"
              min={1}
              max={userShares}
              value={sharesToVote}
              onChange={e => setSharesToVote(Math.max(1, Math.min(userShares, Number(e.target.value))))}
              className="w-24 px-3 py-2 rounded-xl bg-white/70 text-[#1b4332] border border-[#3a5a40]/20 placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#40916c] focus:border-[#40916c] font-mono"
              disabled={voting}
            />
            <span className="ml-2 text-[#3a5a40]/70">/ {userShares} shares</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleVote(p.proposalId, true, sharesToVote)}
              disabled={voting}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#1b4332] to-[#40916c] text-white font-bold hover:from-[#40916c] hover:to-[#1b4332] transition-all disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
            >
              {voting ? "Voting..." : "Vote Yes"}
            </button>
            <button
              onClick={() => handleVote(p.proposalId, false, sharesToVote)}
              disabled={voting}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-red-800 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-400 transition-all disabled:from-gray-400 disabled:to-gray-300 disabled:cursor-not-allowed"
            >
              Vote No
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] text-[#0f2d1c] py-12 px-4 overflow-hidden">
      {/* --- Subtle Gradient Green Backgrounds (Home style) --- */}
            <div className="pointer-events-none absolute inset-0 z-0">
        {/* Top left green gradient blob */}
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        {/* Bottom right green gradient blob */}
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        {/* Center faint green swirl */}
        <div
          className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-[#3a5a40]/20">
        <h1 className="text-3xl font-extrabold text-[#1b4332] mb-8 tracking-tight flex items-center gap-2">🌲 Forest DAO Governance</h1>
        <div className="mb-8">
          <label className="block text-[#3a5a40] mb-2 font-semibold">Forest ID:</label>
          <input
            type="number"
            value={forestId}
            onChange={e => setForestId(e.target.value)}
            className="w-40 px-4 py-3 rounded-xl bg-white/70 text-[#1b4332] border border-[#3a5a40]/20 placeholder-[#3a5a40]/40 focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-[#4a6741] transition-all"
            placeholder="Enter Forest ID"
          />
        </div>

        {/* Section 2: Create Proposal (now always visible) */}
        {renderCreateProposal()}

        {/* Section 1: View Proposals */}
        {renderProposals()}

        {/* Section 3: Vote Modal/Section */}
        {renderVoteSection()}
      </div>
    </div>
  );
}