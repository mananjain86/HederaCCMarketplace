import React from "react";
import { FileText, Sparkles } from "lucide-react";

export function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] text-[#0f2d1c] relative overflow-hidden">
      {/* --- Subtle Gradient Green Backgrounds (Home style) --- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, #b7e4c7 0%, #40916c 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 w-[900px] h-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, #d8f3dc 0deg, #74c69d 120deg, #b7e4c7 240deg, #d8f3dc 360deg)",
          }}
        />
      </div>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-[#40916c] animate-pulse" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1b4332] tracking-tight">
            CarbonChain Documentation
          </h1>
        </div>
        <p className="text-[#3a5a40] text-lg max-w-2xl mx-auto">
          Learn how to integrate, trade, and explore carbon credits on the world’s
          most advanced blockchain-powered sustainability marketplace.
        </p>
      </header>

      {/* Content Section */}
      <main className="max-w-5xl mx-auto px-6 py-10 bg-white/60 backdrop-blur-xl rounded-3xl border border-[#3a5a40]/20 shadow-xl">
        <div className="prose prose-invert max-w-none prose-headings:text-[#1b4332] prose-a:text-[#40916c] prose-strong:text-[#1b4332] prose-p:text-[#0f2d1c] prose-li:text-[#0f2d1c]">
          <h2 className="text-2xl font-bold text-[#1b4332]">Getting Started</h2>
          <p>
            Welcome to the CarbonChain developer documentation. Here you’ll find
            everything you need to connect your dApps, interact with smart
            contracts, and integrate tokenized carbon credits.
          </p>

          <h3 className="text-xl font-bold text-[#1b4332] mt-10">
            Installation
          </h3>
          <div className="my-4">
            <span className="block text-base text-[#3a5a40] mb-2 font-semibold">
              Run the following command in your terminal:
            </span>
            <pre className="bg-[#e8f1ea] border border-[#3a5a40]/20 p-4 rounded-xl text-[#1b4332] text-base font-mono overflow-x-auto">
              <code>npm install carbonchain-sdk</code>
            </pre>
          </div>

          <h3 className="text-xl font-bold text-[#1b4332] mt-10">
            Example Usage
          </h3>
          <div className="my-4">
            <span className="block text-base text-[#3a5a40] mb-2 font-semibold">
              Sample code to fetch available credits:
            </span>
            <pre className="bg-[#e8f1ea] border border-[#3a5a40]/20 p-4 rounded-xl text-[#1b4332] text-base font-mono overflow-x-auto">
              <code>{`import { CarbonClient } from "carbonchain-sdk";

const client = new CarbonClient({ network: "testnet" });
const tokens = await client.getAvailableCredits();
console.log(tokens);`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-bold text-[#1b4332] mt-10">Next Steps</h3>
          <ul className="list-disc pl-6">
            <li>🔗 <strong>Explore API endpoints</strong></li>
            <li>🌍 <strong>Learn about carbon offset partners</strong></li>
            <li>🧩 <strong>Contribute to CarbonChain open-source</strong></li>
          </ul>
        </div>
      </main>

      {/* Floating Sparkles */}
      <div className="absolute bottom-10 left-10 animate-spin-slow text-[#40916c]/20">
        <Sparkles className="h-12 w-12" />
      </div>
      <div className="absolute top-10 right-10 animate-ping text-blue-400/20">
        <Sparkles className="h-10 w-10" />
      </div>
    </div>
  );
}
