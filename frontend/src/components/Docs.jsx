import React from "react";
import { FileText, Sparkles } from "lucide-react";

export function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[60vw] h-[60vw] bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-emerald-400 animate-pulse" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            CarbonChain Documentation
          </h1>
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Learn how to integrate, trade, and explore carbon credits on the world’s
          most advanced blockchain-powered sustainability marketplace.
        </p>
      </header>

      {/* Content Section */}
      <main className="max-w-5xl mx-auto px-6 py-10 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl">
        <div className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-emerald-400">
          {/* 👇 Paste your documentation markdown or HTML content here */}
          <h2>Getting Started</h2>
          <p>
            Welcome to the CarbonChain developer documentation. Here you’ll find
            everything you need to connect your dApps, interact with smart
            contracts, and integrate tokenized carbon credits.
          </p>

          <h3>Installation</h3>
          <pre className="bg-slate-800/80 p-4 rounded-md text-emerald-300 text-sm overflow-x-auto">
            <code>npm install carbonchain-sdk</code>
          </pre>

          <h3>Example Usage</h3>
          <pre className="bg-slate-800/80 p-4 rounded-md text-emerald-300 text-sm overflow-x-auto">
            <code>{`import { CarbonClient } from "carbonchain-sdk";

const client = new CarbonClient({ network: "testnet" });
const tokens = await client.getAvailableCredits();
console.log(tokens);`}</code>
          </pre>

          <h3>Next Steps</h3>
          <ul>
            <li>🔗 Explore API endpoints</li>
            <li>🌍 Learn about carbon offset partners</li>
            <li>🧩 Contribute to CarbonChain open-source</li>
          </ul>
        </div>
      </main>

      {/* Floating Sparkles */}
      <div className="absolute bottom-10 left-10 animate-spin-slow text-emerald-400/20">
        <Sparkles className="h-12 w-12" />
      </div>
      <div className="absolute top-10 right-10 animate-ping text-blue-400/20">
        <Sparkles className="h-10 w-10" />
      </div>
    </div>
  );
}
