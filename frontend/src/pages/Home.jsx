import React, { useState, useEffect, useRef } from "react";
import {
  Leaf,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Award,
  Globe,
  Lock,
  BarChart3,
  Users,
} from "lucide-react";

export function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI Forest Scoring",
      description:
        "Gemini AI analyzes IoT and satellite data to score forest regeneration and guide pricing.",
      gradient: "from-[#1b4332] to-[#4a6741]",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Cross-Chain Trading",
      description:
        "Seamlessly trade across Ethereum and Hedera with secure settlement and NFT minting.",
      gradient: "from-[#3a5a40] to-[#4a6741]",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "NFT Certification",
      description:
        "Every purchase mints a verified NFT certificate stored permanently on Hedera & IPFS.",
      gradient: "from-[#4a6741] to-[#1b4332]",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Transparent Records",
      description:
        "All actions are publicly auditable via Hedera Consensus Service for complete traceability.",
      gradient: "from-[#2d6a4f] to-[#4a6741]",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "KYC & Compliance",
      description:
        "Built-in KYC/KYB verification and DAO-based governance for eco stakeholders.",
      gradient: "from-[#4a6741] to-[#1b4332]",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Live Analytics",
      description:
        "Track CO₂ offsets, forest health, and portfolio growth through real-time dashboards.",
      gradient: "from-[#3a5a40] to-[#4a6741]",
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f4f8f5] to-[#e8f1ea] text-[#0f2d1c]">
      {/* --- Subtle Gradient Green Backgrounds --- */}
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
      {/* --- End Gradient Backgrounds --- */}

      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {/* Sunlight gradient blobs */}
        <div
          className="absolute w-[900px] h-[900px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,248,225,0.3), transparent 70%)",
            transform: `translate(${mousePosition.x * 0.02}px, ${
              mousePosition.y * 0.02
            }px)`,
          }}
        />
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 70% 80%, rgba(74,103,65,0.2), transparent 80%)",
            transform: `translate(-${mousePosition.x * 0.01}px, -${
              mousePosition.y * 0.01
            }px)`,
          }}
        />
        {/* Animated sunlight rays */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          style={{
            transform: `rotate(${mousePosition.x * 0.02}deg)`,
            transition: "transform 0.6s ease-out",
          }}
        >
          <defs>
            <linearGradient id="sunlight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff8e1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          {[...Array(10)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 50}
              x2="2000"
              y2={i * 80}
              stroke="url(#sunlight)"
              strokeWidth="4"
            />
          ))}
        </svg>
        {/* Subtle drifting leaves */}
        <div
          className="absolute inset-0 bg-[url('https://png.pngtree.com/png-vector/20220610/ourmid/pngtree-basil-ffresh-ginger-flat-isolated-on-white-background-png-image_4950347.png')] bg-no-repeat bg-contain opacity-10"
          style={{
            backgroundPosition: `${90 + Math.sin(mousePosition.x * 0.002) * 5}% ${
              20 + Math.cos(mousePosition.y * 0.002) * 5
            }%`,
            backgroundSize: "20%",
            transition: "background-position 0.5s ease-out",
          }}
        />
        <div
          className="absolute inset-0 bg-[url('https://png.pngtree.com/png-vector/20220610/ourmid/pngtree-basil-ffresh-ginger-flat-isolated-on-white-background-png-image_4950347.png')] bg-no-repeat bg-contain opacity-10"
          style={{
            backgroundPosition: `${0 + Math.sin(mousePosition.x * 0.002) * 5}% ${
              0 + Math.cos(mousePosition.y * 0.002) * 5
            }%`,
            backgroundSize: "20%",
            transition: "background-position 0.5s ease-out",
          }}
        />
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative z-10 px-6 py-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#1b4332]/20">
              <Sparkles className="w-5 h-5 text-[#4a6741]" />
              <span className="font-semibold text-base text-[#1b4332]">
                AI-Powered Carbon Marketplace
              </span>
            </div>

            <h1 className="text-6xl font-extrabold leading-tight">
              <span className="block text-[#1b4332]">
                Tokenize Carbon Credits.
              </span>
              <span className="block bg-gradient-to-r from-[#3a5a40] to-[#4a6741] bg-clip-text text-transparent">
                Protect Our Forests.
              </span>
            </h1>

            <p className="text-xl text-[#3a5a40]/90 leading-relaxed max-w-2xl">
              Buy, sell, and tokenize verified carbon credits and forest areas.
              CarbonChain combines AI-driven forest scoring, cross-chain trading, and NFT certification to bring transparency to climate finance.
            </p>

            <div className="flex gap-6 pt-6">
              <button className="group relative px-8 py-3 rounded-full font-bold text-lg text-white bg-gradient-to-r from-[#1b4332] to-[#3a5a40] hover:shadow-2xl hover:scale-105 transition-all">
                <span className="relative z-10 flex items-center gap-2">
                  Launch Marketplace
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              <button className="px-8 py-3 rounded-full font-bold text-lg border-2 border-[#1b4332]/30 hover:border-[#1b4332]/60 hover:bg-[#1b4332]/10 transition-all">
                Learn More
              </button>
            </div>
          </div>

          {/* Right animated card stack */}
             <div className="relative h-[650px] hidden lg:block">
            {[
              {
                title: "Forest Parcel #12,453",
                value: "5.2 tons CO₂",
                price: "0.089 ETH",
                color: "from-[#4a6741]/10 to-[#3a5a40]/10",
                border: "border-[#4a6741]/30",
                rotation: -6
              },
              {
                title: "Carbon Credit #8,921",
                value: "3.7 hectares",
                price: "0.156 ETH",
                color: "from-[#3a5a40]/10 to-[#1b4332]/10",
                border: "border-[#3a5a40]/30",
                rotation: 0
              },
              {
                title: "Green Bond #15,782",
                value: "8.9 tons CO₂",
                price: "0.127 ETH",
                color: "from-[#1b4332]/10 to-[#4a6741]/10",
                border: "border-[#1b4332]/30",
                rotation: 6
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className={`absolute top-1/2 left-1/2 w-80 h-72 bg-gradient-to-br ${card.color} rounded-3xl border ${card.border} p-8 shadow-2xl shadow-[#3a5a4020] backdrop-blur-xl`}
                style={{
                  transform: `translate(-50%, -50%) rotate(${card.rotation}deg) translateY(${idx * 20}px) translateY(${Math.sin(scrollY * 0.005 + idx) * 10}px)`,
                  transition: 'transform 0.4s ease-out',
                  zIndex: 3 - idx
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-xl bg-[#3a5a40]/10">
                    <Leaf className="w-8 h-8 text-[#3a5a40]" />
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#3a5a40]/10 text-sm font-bold text-[#3a5a40]">
                    Verified
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#1b4332] mb-2">{card.title}</h3>
                <p className="text-[#3a5a40]/80 mb-4 text-lg">{card.value}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#3a5a40]/20">
                  <span className="text-3xl font-bold text-[#1b4332]">{card.price}</span>
                  <TrendingUp className="w-6 h-6 text-[#3a5a40]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moving keywords strip */}
      <div className="relative z-10 overflow-hidden border-y border-[#3a5a40]/20 py-6 bg-[#f1f5f2]/70 backdrop-blur-md mx-32 rounded-xl">
        <div className="whitespace-nowrap flex text-[#1b4332]/90 text-lg font-semibold animate-marquee">
          <span className="px-8">
            🌿 AI Forest Scoring • 🌍 Cross-Chain NFT Certificates • 💧 Sustainable Finance • ☀️ Hedera Consensus • ♻️ DAO Governance • 🌱 Planet API Analytics • 🌳 Verified Carbon Offsets •
          </span>
          <span className="px-8">
            🌿 AI Forest Scoring • 🌍 Cross-Chain NFT Certificates • 💧 Sustainable Finance • ☀️ Hedera Consensus • ♻️ DAO Governance • 🌱 Planet API Analytics • 🌳 Verified Carbon Offsets •
          </span>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
            width: 200%;
          }
        `}</style>
      </div>
      <div
          className="absolute inset-0 bg-[url('https://png.pngtree.com/png-vector/20220610/ourmid/pngtree-basil-ffresh-ginger-flat-isolated-on-white-background-png-image_4950347.png')] bg-no-repeat bg-contain opacity-10"
          style={{
            backgroundPosition: `${0 + Math.sin(mousePosition.x * 0.002) * 5}% ${
              55 + Math.cos(mousePosition.y * 0.002) * 5
            }%`,
            backgroundSize: "20%",
            transition: "background-position 0.5s ease-out",
          }}
        />

      {/* Features Section */}
      <section className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#3a5a40]/10 rounded-full border border-[#3a5a40]/30 mb-8">
            <Zap className="w-6 h-6 text-[#4a6741]" />
            <span className="font-semibold text-xl text-[#1b4332]">
              Key Features
            </span>
          </div>
          <h2 className="text-6xl font-extrabold mb-6 text-[#1b4332]">
            Technology for a Greener Future
          </h2>
          <p className="text-2xl text-[#3a5a40]/80 max-w-3xl mx-auto">
            From AI-powered scoring to NFT-based verification — CarbonChain is redefining how carbon credits are traded and trusted.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group relative p-10 rounded-3xl bg-white/50 backdrop-blur-xl border border-[#3a5a40]/20 hover:border-[#3a5a40]/40 transition-all transform hover:scale-105 hover:-translate-y-2 duration-500"
            >
              <div
                className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${f.gradient} mb-6 text-white`}
              >
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#1b4332] mb-4">
                {f.title}
              </h3>
              <p className="text-lg text-[#3a5a40]/80 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>
        <div
          className="absolute inset-0 bg-[url('https://png.pngtree.com/png-vector/20220610/ourmid/pngtree-basil-ffresh-ginger-flat-isolated-on-white-background-png-image_4950347.png')] bg-no-repeat bg-contain opacity-10"
          style={{
            backgroundPosition: `${90 + Math.sin(mousePosition.x * 0.002) * 5}% ${
              90 + Math.cos(mousePosition.y * 0.002) * 5
            }%`,
            backgroundSize: "20%",
            transition: "background-position 0.5s ease-out",
          }}
        />
    </div>
  );
}