"use client";

import React, { Suspense } from "react";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  ExternalLink,
  Database,
  Link as LinkIcon,
  Calendar,
  User,
  Fingerprint,
  QrCode,
  Hexagon,
  Share2,
  Play,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, useSearchParams } from "next/navigation";

const CONTRACT_ADDRESS = "0x0A3769Ada9cBA047678998293D3cE25f04C397DB";

function VerificationContent() {
  const params = useParams();
  const search = useSearchParams();

  const tokenId = params.id as string;

  // Prefer query params (passed from /claim page); fall back to mock
  const course = search.get("course") ?? "Full-Stack React Development";
  const score = Number(search.get("score") ?? 98);
  const completion = Number(search.get("completion") ?? 0);
  const videoId = search.get("videoId") ?? "";
  const wallet = search.get("wallet") ?? "0xABCD...1234";

  const issueDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();

  const scoreColor =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";

  const truncate = (s: string) =>
    s.length > 18 ? `${s.slice(0, 10)}...${s.slice(-8)}` : s;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10 overflow-x-hidden relative">
      {/* Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-8 py-20 md:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-8 mb-24"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-500 mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">AUTHENTICITY SECURED</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none uppercase">
            PROTOCOL <br />VERIFICATION
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto font-medium leading-relaxed">
            Official decentralized proof of achievement issued via the Monarch Protocol.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Main Certificate Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            <Card className="relative overflow-hidden p-1 group">
              <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors duration-1000" />
              <CardHeader className="text-center pb-12 pt-16">
                <div className="flex justify-center mb-10">
                  <div className="relative">
                    <div className="flex h-32 w-32 items-center justify-center rounded-[40px] bg-white/[0.03] border border-white/[0.05] shadow-2xl">
                      <Hexagon className="w-16 h-16 text-white/10" strokeWidth={0.5} />
                      <Award className="absolute w-12 h-12 text-white" />
                    </div>
                    <div
                      className="absolute -inset-6 border border-dashed border-white/5 rounded-full"
                      style={{ animation: "spin 30s linear infinite" }}
                    />
                  </div>
                </div>
                <CardTitle className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-none">
                  {course}
                </CardTitle>
                {videoId && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Play className="w-4 h-4 text-white/20" />
                    <span className="text-xs font-mono text-white/30">{videoId}</span>
                  </div>
                )}
                <CardDescription className="text-white/20 font-black uppercase tracking-[0.4em] text-xs mt-3">
                  ISSUED BY MONARCH PROTOCOL
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-12 pb-16 px-12">
                {/* Recipient */}
                <div className="flex flex-col items-center justify-center space-y-3 py-10 border-y border-white/[0.03]">
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.5em]">RECIPIENT NODE</span>
                  <span className="text-xl font-black text-white/70 font-mono tracking-tighter break-all text-center">
                    {wallet.length > 24 ? `${wallet.slice(0, 12)}...${wallet.slice(-10)}` : wallet}
                  </span>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Genuineness Score */}
                  <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.03] text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-white/20" />
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
                        Genuineness Score
                      </span>
                    </div>
                    <p className={`text-5xl font-black tracking-tighter ${scoreColor}`}>{score}</p>
                    <p className="text-[10px] text-white/20 font-medium mt-2">out of 100</p>
                  </div>

                  {/* Completion */}
                  <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.03] text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <BarChart2 className="w-4 h-4 text-white/20" />
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
                        Completion
                      </span>
                    </div>
                    <p className="text-5xl font-black tracking-tighter text-blue-400">
                      {Math.round(completion)}%
                    </p>
                    <p className="text-[10px] text-white/20 font-medium mt-2">of video</p>
                  </div>
                </div>

                {/* Issue date + Protocol ID */}
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> ISSUE DATE
                    </span>
                    <p className="text-lg font-bold text-white tracking-tight">{issueDate}</p>
                  </div>
                  <div className="space-y-3 text-right">
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] flex items-center gap-2 justify-end">
                      <Fingerprint className="w-4 h-4" /> TOKEN ID
                    </span>
                    <p className="text-lg font-bold text-white font-mono tracking-tighter">#{tokenId}</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-white/[0.02] flex items-center justify-between p-12 py-8 border-t border-white/[0.03]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">TRUST SCORE</p>
                    <p className="text-lg font-black text-emerald-400 tracking-tight">{score}.0% SECURE</p>
                  </div>
                </div>
                <Button variant="ghost" className="h-12 px-6 gap-3 group/btn">
                  <Share2 className="w-5 h-5 transition-transform group-hover/btn:rotate-12" />
                  SHARE PROOF
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 space-y-10"
          >
            {/* Blockchain Proof */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-3">
                  <Database className="w-4 h-4" />
                  BLOCKCHAIN PROOF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.03] space-y-5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">NETWORK</span>
                    <span className="text-white">MONAD TESTNET</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">CONTRACT</span>
                    <span className="text-blue-400 font-mono tracking-tighter">
                      {truncate(CONTRACT_ADDRESS)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">ASSET ID</span>
                    <span className="text-white font-mono tracking-tighter">#{tokenId}</span>
                  </div>
                  {videoId && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/20">VIDEO ID</span>
                      <span className="text-white/60 font-mono tracking-tighter">{videoId}</span>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full h-14 bg-white text-black hover:bg-white/90 text-[11px] font-black uppercase tracking-widest rounded-2xl"
                  onClick={() => window.open(`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-3" />
                  VIEW ON BASESCAN
                </Button>
              </CardContent>
            </Card>

            {/* Issuer */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black text-white/20 uppercase tracking-[0.4em] flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4" />
                  ISSUER STATUS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5 p-5 rounded-[24px] bg-emerald-500/[0.03] border border-emerald-500/10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">VERIFIED ISSUER</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">MONARCH AUTHORITY</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR */}
            <div className="p-10 rounded-[40px] bg-white/[0.03] border border-white/[0.05] flex flex-col items-center gap-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors duration-700" />
              <div className="p-6 bg-white rounded-[32px] shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-105">
                <QrCode className="w-24 h-24 text-black" />
              </div>
              <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] text-center leading-relaxed relative z-10">
                OFFICIAL QR <br />AUTHENTICATION
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-32 pt-16 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-8 text-white/10"
        >
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em]">
            <LinkIcon className="w-4 h-4" />
            <span>CONTRACT: {CONTRACT_ADDRESS}</span>
          </div>
          <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em]">
            <span>POWERED BY MONARCH</span>
            <span>MONAD TESTNET · CHAIN ID 10143</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/20 font-black text-sm uppercase tracking-widest">Loading...</div>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
}
