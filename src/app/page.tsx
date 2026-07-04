"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Menu, 
  X,
  ChevronRight
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "next-themes";

// --- Wave Component ---
const Wave = ({ className }: { className?: string }) => (
  <svg 
    fill="none" 
    height="120" 
    viewBox="0 0 1440 120" 
    width="1440" 
    className={className}
  >
    <clipPath id="wave">
      <path d="m0 0h1440v120h-1440z" />
    </clipPath>
    <g clipPath="url(#wave)">
      <ellipse cx="720" cy="-600" fill="currentColor" rx="1316" ry="720" />
    </g>
  </svg>
);



export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";



  return (
    <div className="oku-landing-page min-h-screen relative overflow-x-hidden text-black dark:text-white bg-[#FAF9F7] dark:bg-[#0A0A0A]">
      
      {/* Floating Navbar */}
      <header className={`fixed top-0 left-0 right-0 h-20 z-50 transition-all duration-300 flex items-center justify-center ${scrolled ? 'bg-[#FAF9F7] dark:bg-[#0A0A0A]/95 border-b border-[#E8E8E9] dark:border-white/10 shadow-sm backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="w-full max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden">
              <img src="/images/homepage/logo.png" alt="Monarch Logo" className="w-full h-full object-contain dark:invert-0 invert" />
            </div>
            <span className="font-bold text-xl tracking-tight text-black dark:text-white">Monarch</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#46474E] dark:text-gray-300">
            <Link href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How It Works</Link>
            <Link href="https://github.com/Sarthak030506/learncert-hackmumbai" target="_blank" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </Link>
            <Link href="mailto:tejasgodse.tech@gmail.com" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle className="text-[#46474E] dark:text-gray-300 hover:text-black dark:hover:text-white" />
            <Link href="/login" className="text-sm font-medium text-[#46474E] dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/login">
              <button className="bg-black dark:bg-white dark:text-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0">
                Start Verifying
              </button>
            </Link>
          </div>

          {/* Mobile Burger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-black dark:text-white hover:opacity-80 transition-opacity"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#FAF9F7] dark:bg-[#0A0A0A] flex flex-col p-6 pt-24 md:hidden">
          <nav className="flex flex-col gap-6 text-xl font-normal text-black dark:text-white mt-8">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:opacity-75">Features</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:opacity-75">How It Works</Link>
            <Link href="https://github.com/Sarthak030506/learncert-hackmumbai" target="_blank" className="hover:opacity-75 flex items-center gap-1.5">
              GitHub <ExternalLink className="w-4 h-4" />
            </Link>
            <Link href="mailto:tejasgodse.tech@gmail.com" className="hover:opacity-75">Contact</Link>
            <div className="h-px bg-[#E8E8E9] my-4" />
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="hover:opacity-75">Sign in</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <button className="bg-black text-white dark:bg-white dark:text-black w-full py-3 rounded-full text-base font-semibold shadow-xs">
                Start Verifying
              </button>
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-16 md:pt-48 md:pb-28 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 flex flex-col items-start text-left">
          <h1 className="oku-font-serif text-5xl md:text-6xl text-black dark:text-white font-normal leading-[1.1] mb-6">
            Skills Genuinely Verified. Not Just Completed.
          </h1>
          <p className="text-[#46474E] dark:text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-md">
            Monarch builds a credibility verification layer for online learning platforms. We verify whether you actually understood the content — not just clicked through it. Blockchain-backed, gasless, and genuinely trustworthy.
          </p>
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="bg-black text-white dark:bg-white dark:text-black w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold hover:bg-neutral-800 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0">
                Start Verifying
              </button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <button className="bg-[#F3F4F4] dark:bg-[#111111] text-[#131314] dark:text-gray-200 w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold hover:bg-[#E8E8E9] dark:hover:bg-[#1a1a1a] transition-all">
                Explore Features
              </button>
            </Link>
          </div>
          <p className="text-sm text-[#8C8C90] dark:text-gray-400 mt-5">
            Already a member? <Link href="/login" className="text-[#46474E] dark:text-gray-300 hover:text-black dark:hover:text-white underline transition-colors">Sign in.</Link>
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end relative">
          <img 
            src="/images/homepage/monarch-dashboard.png" 
            alt="Monarch Dashboard" 
            className="w-full max-w-[560px] h-auto object-contain transition-transform duration-700 hover:scale-[1.01] rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]" 
          />
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-6">
        
        {/* Block 1 (Wide) - Core Value Prop */}
        <div className="bg-[#F3F4F4] dark:bg-[#111111] rounded-[28px] overflow-hidden flex flex-col justify-between pt-12 border border-black/2 shadow-xs">
          <div className="px-6 md:px-12 text-center pb-6">
            <h2 className="oku-font-serif text-3xl md:text-4xl text-black dark:text-white font-normal mb-3">
              Verify real learning, not just completion
            </h2>
            <p className="text-[#46474E] dark:text-gray-300 text-base md:text-lg max-w-lg mx-auto">
              We track active watch patterns, quiz consistency, engagement depth, and solving behavior to determine if you genuinely learned — no more meaningless completion badges.
            </p>
          </div>
          <div className="flex justify-center -mb-16 md:-mb-28">
            <img 
              src="/images/homepage/monarch-dashboard.png" 
              alt="Learning credibility verification dashboard" 
              className="w-[90%] max-w-[860px] h-auto object-contain transition-transform duration-500 hover:scale-[1.02] rounded-t-2xl shadow-[0_-10px_40px_rgba(255,255,255,0.05)] border-t border-white/10" 
            />
          </div>
        </div>

        {/* Top Grid (Platform Integration & Trust Score) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Block 2 - Platform Integration */}
          <div className="bg-[#F3F4F4] dark:bg-[#111111] rounded-[28px] overflow-hidden flex flex-col justify-between pt-12 border border-black/2 shadow-xs">
            <div className="px-6 text-center pb-6">
              <h2 className="oku-font-serif text-3xl text-black dark:text-white font-normal mb-3">
                Works with platforms you already use
              </h2>
              <p className="text-[#46474E] dark:text-gray-300 text-base max-w-sm mx-auto">
                Connect your Udemy, Coursera, LeetCode, HackerRank, or YouTube learning accounts. Monarch monitors your real engagement across all of them.
              </p>
            </div>
            <div className="flex justify-center -mb-56 md:-mb-64">
              <img 
                src="/images/homepage/monarch-analytics.png" 
                alt="Platform integrations" 
                className="w-full max-w-[280px] h-auto object-contain transition-transform duration-500 hover:scale-[1.02] rounded-t-2xl shadow-[0_-10px_40px_rgba(255,255,255,0.05)] border-t border-white/10" 
              />
            </div>
          </div>

          {/* Block 3 - Trust Score */}
          <div className="bg-[#F3F4F4] dark:bg-[#111111] rounded-[28px] overflow-hidden flex flex-col justify-between pb-12 pt-0 border border-black/2 shadow-xs">
            <div className="flex justify-center -mt-56 md:-mt-64 mb-6">
              <img 
                src="/images/homepage/monarch-tracking.png" 
                alt="Trust score metrics" 
                className="w-full max-w-[280px] h-auto object-contain transition-transform duration-500 hover:scale-[1.02] rounded-b-2xl shadow-[0_10px_40px_rgba(255,255,255,0.05)] border-b border-white/10" 
              />
            </div>
            <div className="px-6 text-center">
              <h2 className="oku-font-serif text-3xl text-black dark:text-white font-normal mb-3">
                Build a trust score that matters
              </h2>
              <p className="text-[#46474E] dark:text-gray-300 text-base max-w-sm mx-auto">
                Your Monarch Score reflects genuine understanding — watch consistency, quiz accuracy, solving patterns, and plagiarism-free behavior, all in one metric.
              </p>
            </div>
          </div>
        </div>

        {/* Block 4 (Wide - Analytics) */}
        <div className="bg-[#F3F4F4] dark:bg-[#111111] rounded-[28px] overflow-hidden flex flex-col justify-between pt-12 border border-black/2 shadow-xs">
          <div className="px-6 md:px-12 text-center pb-6">
            <h2 className="oku-font-serif text-3xl md:text-4xl text-black dark:text-white font-normal mb-3">
              Deep analytics on your learning credibility
            </h2>
            <p className="text-[#46474E] dark:text-gray-300 text-base md:text-lg max-w-lg mx-auto">
              See detailed breakdowns of watch presence, tab focus rates, playback patterns, code originality scores, and solving consistency metrics.
            </p>
          </div>
          <div className="flex justify-center -mb-20 md:-mb-36">
            <img 
              src="/images/homepage/monarch-dashboard.png" 
              alt="Learning credibility analytics" 
              className="w-[90%] max-w-[860px] h-auto object-contain transition-transform duration-500 hover:scale-[1.02] rounded-t-2xl shadow-[0_-10px_40px_rgba(255,255,255,0.05)] border-t border-white/10" 
            />
          </div>
        </div>

        {/* Bottom Grid (Blockchain Certs & Recruiter Proof) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Block 5 - Blockchain Certificates */}
          <div className="bg-[#F3F4F4] dark:bg-[#111111] rounded-[28px] overflow-hidden flex flex-col justify-between pt-12 border border-black/2 shadow-xs">
            <div className="px-6 text-center pb-6">
              <h2 className="oku-font-serif text-3xl text-black dark:text-white font-normal mb-3">
                Blockchain-backed certificates
              </h2>
              <p className="text-[#46474E] dark:text-gray-300 text-base max-w-sm mx-auto">
                Mint tamper-proof Soulbound Tokens as proof of verified learning. Gas fees are handled in the background via UGF — you never need ETH.
              </p>
            </div>
            <div className="flex justify-center -mb-40 md:-mb-44">
              <img 
                src="/images/homepage/monarch-analytics.png" 
                alt="Blockchain certificate minting" 
                className="w-full max-w-[280px] h-auto object-contain transition-transform duration-500 hover:scale-[1.02] rounded-t-2xl shadow-[0_-10px_40px_rgba(255,255,255,0.05)] border-t border-white/10" 
              />
            </div>
          </div>

          {/* Block 6 - Recruiter Verification */}
          <div className="bg-[#F3F4F4] dark:bg-[#111111] rounded-[28px] overflow-hidden flex flex-col justify-between pt-12 border border-black/2 shadow-xs">
            <div className="px-6 text-center pb-6">
              <h2 className="oku-font-serif text-3xl text-black dark:text-white font-normal mb-3">
                Shareable proof for recruiters
              </h2>
              <p className="text-[#46474E] dark:text-gray-300 text-base max-w-sm mx-auto">
                Generate verification links that let employers audit your learning credentials — watch depth, solve patterns, and trust metrics — all on-chain and verifiable.
              </p>
            </div>
            <div className="flex justify-center -mb-28 md:-mb-36">
              <img 
                src="/images/homepage/monarch-tracking.png" 
                alt="Recruiter verification portal" 
                className="w-full max-w-[340px] h-auto object-contain transition-transform duration-500 hover:scale-[1.02] rounded-t-2xl shadow-[0_-10px_40px_rgba(255,255,255,0.05)] border-t border-white/10" 
              />
            </div>
          </div>
        </div>

      </section>

      {/* Social Proof / Testimonials Section */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12 border-b border-[#E8E8E9] dark:border-white/10 pb-24 mb-20">
        <div className="md:w-[55%] flex flex-col items-start">
          <h2 className="oku-font-serif text-4xl md:text-5xl text-black dark:text-white font-normal leading-[1.1] mb-6">
            Trusted by learners who care about credibility
          </h2>
          <p className="text-[#46474E] dark:text-gray-300 text-lg leading-relaxed max-w-md">
            Developers and students are tired of certificates that prove nothing. Monarch gives your learning real weight — verified, auditable, and blockchain-permanent.
          </p>
        </div>
        <div className="md:w-[45%] w-full flex flex-col gap-6 relative">
          
          {/* Testimonial 1 */}
          <div className="bg-[#F3F4F4] dark:bg-[#111111] p-6 rounded-2xl border border-[#E8E8E9] dark:border-white/10 max-w-md ml-auto relative md:w-[110%] z-10 shadow-xs hover:border-black/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AR</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white leading-none">Aarav R.</h4>
                <span className="text-xs text-[#8C8C90] dark:text-gray-400">@aarav_dev</span>
              </div>
              <span className="text-xs text-[#8C8C90] dark:text-gray-400 ml-auto">Apr 12</span>
            </div>
            <p className="text-[#131314] dark:text-gray-200 text-[15px] leading-relaxed">
              I finished 3 Udemy courses last month but my employer didn&apos;t trust those certificates. Monarch&apos;s verified badge with actual watch-depth data changed the conversation completely. 🔥
            </p>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-[#F3F4F4] dark:bg-[#111111] p-6 rounded-2xl border border-[#E8E8E9] dark:border-white/10 max-w-md ml-auto md:w-[110%] md:translate-x-[10%] shadow-xs hover:border-black/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-black dark:text-white leading-none">Priya S.</h4>
                <span className="text-xs text-[#8C8C90] dark:text-gray-400">@priya_codes</span>
              </div>
              <span className="text-xs text-[#8C8C90] dark:text-gray-400 ml-auto">Mar 28</span>
            </div>
            <p className="text-[#131314] dark:text-gray-200 text-[15px] leading-relaxed">
              Finally, someone solved the &quot;course completed but didn&apos;t learn anything&quot; problem. My LeetCode Monarch score actually reflects my solving consistency — not just that I hit submit 200 times.
            </p>
          </div>

        </div>
      </section>

      {/* More Info Section */}
      <section className="max-w-5xl mx-auto px-6 pb-16 md:pb-24 border-b border-[#E8E8E9] dark:border-white/10 mb-20">
        <div className="flex flex-col gap-12">
          {/* Column 1 */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="md:w-[30%]">
              <h4 className="text-sm font-bold text-[#8C8C90] dark:text-gray-400 uppercase tracking-wider">Platform Integration</h4>
            </div>
            <div className="md:w-[70%] text-left">
              <h3 className="oku-font-serif text-2xl text-black dark:text-white font-normal mb-2">Connect any learning platform</h3>
              <p className="text-[#46474E] dark:text-gray-300 text-base leading-relaxed">
                Monarch works across Udemy, Coursera, YouTube, LeetCode, HackerRank, and more. Sync your learning activity in seconds — no manual logging, no spreadsheets. Just connect and let us track the real signals.
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="md:w-[30%]">
              <h4 className="text-sm font-bold text-[#8C8C90] dark:text-gray-400 uppercase tracking-wider">Data &amp; Privacy</h4>
            </div>
            <div className="md:w-[70%] text-left">
              <h3 className="oku-font-serif text-2xl text-black dark:text-white font-normal mb-2">Your data stays yours</h3>
              <p className="text-[#46474E] dark:text-gray-300 text-base leading-relaxed">
                We never sell your learning data to third parties. Verification proofs are stored on-chain as Soulbound Tokens — immutable, transparent, and fully under your control. Export or revoke access anytime.
              </p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="md:w-[30%]">
              <h4 className="text-sm font-bold text-[#8C8C90] dark:text-gray-400 uppercase tracking-wider">Gasless &amp; Free</h4>
            </div>
            <div className="md:w-[70%] text-left">
              <h3 className="oku-font-serif text-2xl text-black dark:text-white font-normal mb-2">No crypto wallet needed</h3>
              <p className="text-[#46474E] dark:text-gray-300 text-base leading-relaxed">
                Monarch uses the Universal Gas Fund (UGF) to sponsor all blockchain transactions in the background. You get the security of on-chain verification without needing ETH, a wallet setup, or any crypto knowledge at all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Block */}
      <footer className="relative bg-[#F6F6F6] dark:bg-[#050505] pt-12 overflow-hidden border-t border-[#E8E8E9] dark:border-white/10">
        <Wave className="w-full h-auto text-[#FAF9F7] bg-[#F6F6F6] dark:bg-[#050505] -mt-12" />

        {/* Floating Books - decorative */}
        <figure className="absolute top-[140px] left-[14vw] animate-float-book-1 hidden md:block select-none pointer-events-none">
          <img src="/images/homepage/bookOne.png" width={92} height={105} alt="Decorative element" />
        </figure>
        <figure className="absolute bottom-[180px] left-[7vw] animate-float-book-2 hidden md:block select-none pointer-events-none">
          <img src="/images/homepage/bookTwo.png" width={110} height={120} alt="Decorative element" />
        </figure>
        <figure className="absolute top-[240px] right-[7vw] animate-float-book-3 hidden md:block select-none pointer-events-none">
          <img src="/images/homepage/bookThree.png" width={120} height={100} alt="Decorative element" />
        </figure>

        {/* CTA section inside footer */}
        <div className="max-w-[700px] mx-auto text-center py-20 px-6 relative z-10">
          <h2 className="oku-font-serif text-4xl md:text-5xl text-black dark:text-white font-normal mb-4">
            Ready to prove what you&apos;ve learned?
          </h2>
          <p className="text-[#46474E] dark:text-gray-300 text-lg max-w-[500px] mx-auto mb-8 leading-relaxed">
            Monarch is the credibility layer for online learning. Start verifying your skills for free — blockchain-backed, gasless, and genuinely trustworthy.
          </p>
          <Link href="/login">
            <button className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-full text-base font-semibold hover:bg-neutral-800 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0">
              Start verifying for free
            </button>
          </Link>
        </div>

        {/* Bottom links and copyright */}
        <div className="max-w-5xl mx-auto px-6 py-12 relative border-t border-[#E8E8E9] dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Decorative element */}
          <div className="absolute bottom-2.5 right-[-150px] hidden xl:block select-none pointer-events-none w-[270px] h-[240px] overflow-hidden">
            <img 
              src="/images/homepage/fuji.png" 
              alt="Decorative element" 
              className="animate-tail-swing w-full h-full object-contain" 
            />
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[#46474E] dark:text-gray-300 font-medium text-sm z-10">
            <Link href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How It Works</Link>
            <Link href="https://github.com/Sarthak030506/learncert-hackmumbai" target="_blank" className="hover:text-black dark:hover:text-white transition-colors">GitHub</Link>
            <Link href="mailto:tejasgodse.tech@gmail.com" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link>
          </div>

          <div className="text-[#8C8C90] dark:text-gray-400 text-sm z-10">
            Copyright &copy; 2026 Monarch. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
