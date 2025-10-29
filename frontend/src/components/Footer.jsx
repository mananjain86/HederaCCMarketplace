import React from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Left Section */}
          <div className="max-w-md">
            <div className="flex items-center space-x-2 mb-3">
              <Leaf className="h-7 w-7 text-emerald-400" />
              <span className="text-2xl font-bold text-white">CarbonChain</span>
            </div>
            <p className="text-slate-400 mb-4 leading-relaxed text-sm">
              The world's first blockchain-powered marketplace for carbon credits
              and forest conservation tokens.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="GitHub">
                <Github className="h-5 w-5 text-slate-400 hover:text-emerald-400 transition-colors duration-200" />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-slate-400 hover:text-emerald-400 transition-colors duration-200" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-slate-400 hover:text-emerald-400 transition-colors duration-200" />
              </a>
            </div>
          </div>

          {/* Right Section: Links */}
          <div className="flex gap-16">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
              <ul className="space-y-1 text-slate-400">
                <li
                  onClick={() => navigate("/documentation")}
                  className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer"
                >
                  Documentation
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-1 text-slate-400">
                <li
                  onClick={() => navigate("/about")}
                  className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer"
                >
                  About Us
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-800 mt-8 pt-6 text-center">
          <p className="text-slate-500 text-sm">
            © 2025 CarbonChain Marketplace — Built with{" "}
            <span className="text-emerald-400">Hedera</span>, powered by blockchain technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
