import React from 'react';
import { Leaf, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 mt-0 mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">CarbonChain</span>
            </div>
            <p className="text-slate-400 mb-4">
              The world's first blockchain-powered marketplace for carbon credits and forest conservation tokens.
            </p>
            <div className="flex space-x-4">
              <Github className="h-5 w-5 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Marketplace</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Browse Credits</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Forest Tokens</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Verified Projects</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Analytics</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">API Reference</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Whitepaper</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Support</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Press</li>
              <li className="hover:text-emerald-400 cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700/50 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            © 2025 CarbonChain Marketplace. Built with Hedera, powered by blockchain technology.
          </p>
        </div>
      </div>
    </footer>
  );
}