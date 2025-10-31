import React from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-[#e8f1ea]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Left Section */}
          <div className="max-w-md">
            <div className="flex items-center space-x-2 mb-3">
              <Leaf className="h-7 w-7 text-[#4a6741]" />
              <span className="text-2xl font-bold text-[#1b4332]">
                CarbonChain
              </span>
            </div>
            <p className="text-[#3a5a40] mb-4 leading-relaxed text-sm">
              The world's first blockchain-powered marketplace for carbon
              credits and forest conservation tokens.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="GitHub">
                <Github className="h-5 w-5 text-[#3a5a40] hover:text-[#4a6741] transition-colors duration-200" />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-[#3a5a40] hover:text-[#4a6741] transition-colors duration-200" />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-[#3a5a40] hover:text-[#4a6741] transition-colors duration-200" />
              </a>
            </div>
          </div>

          {/* Right Section: Links */}
          <div className="flex gap-16">
            <div>
              <h3 className="text-lg font-semibold text-[#1b4332] mb-3">
                Resources
              </h3>
              <ul className="space-y-1 text-[#3a5a40]">
                <li>
                  <a
                    href="https://github.com/mananjain86/HederaCCMarketplace/blob/main/README.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#4a6741] transition-colors duration-200 cursor-pointer"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1b4332] mb-3">
                Company
              </h3>
              <ul className="space-y-1 text-[#3a5a40]">
                <li>
                  <a
                    href="https://dorahacks.io/buidl/35687/team"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#4a6741] transition-colors duration-200 cursor-pointer"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-[#e8f1ea] mt-8 pt-6 text-center">
          <p className="text-[#3a5a40] text-sm">
            © 2025 CarbonChain Marketplace — Built with{" "}
            <span className="text-[#4a6741]">Hedera</span>, powered by
            blockchain technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
