"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Download,
  ShieldCheck,
  Share2,
  Database,
  Link as LinkIcon,
  Calendar,
  Hexagon,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getWalletCertificates, type Certificate } from "@/lib/blockchain";

const CONTRACT_ADDRESS = "0x0A3769Ada9cBA047678998293D3cE25f04C397DB";

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

function getRarity(score: number): "LEGENDARY" | "EPIC" | "RARE" {
  if (score >= 80) return "LEGENDARY";
  if (score >= 60) return "EPIC";
  return "RARE";
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function CertificateVault() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [wallet, setWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedWallet = localStorage.getItem("monarch_wallet");
    if (!savedWallet) {
      setLoading(false);
      return;
    }
    setWallet(savedWallet);
    getWalletCertificates(savedWallet).then((data) => {
      setCerts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Badge variant="outline" className="px-3 py-1">
              {loading ? "..." : `${certs.length} ASSETS MINTED`}
            </Badge>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
            ASSET VAULT
          </h1>
          <p className="text-xl text-white/40 font-medium max-w-2xl">
            Manage your blockchain-backed educational credentials and non-transferable assets.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="h-14 px-8 rounded-2xl group">
            <Share2 className="w-5 h-5 mr-3 text-white/20 group-hover:text-white transition-colors" />
            SHARE PROFILE
          </Button>
          <Link href="/dashboard/generator">
            <Button className="bg-white text-black hover:bg-white/90 h-14 px-10 rounded-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95">
              <Award className="w-5 h-5 mr-3" />
              MINT NEW ASSET
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-widest text-white/20">
            Loading certificates...
          </p>
        </div>
      )}

      {/* No wallet */}
      {!loading && !wallet && (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-white/20" />
          </div>
          <div>
            <p className="text-sm font-black text-white/30 uppercase tracking-widest mb-2">
              No Wallet Connected
            </p>
            <p className="text-xs text-white/20 max-w-[280px] leading-relaxed">
              Open a YouTube video and enter your wallet address in the Monarch extension to get started.
            </p>
          </div>
          <Link href="/dashboard/generator">
            <Button className="bg-white text-black hover:bg-white/90 h-12 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest">
              <Award className="w-4 h-4 mr-2" />
              Mint New Asset
            </Button>
          </Link>
        </div>
      )}

      {/* Wallet but no certs */}
      {!loading && wallet && certs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white/20" />
          </div>
          <div>
            <p className="text-sm font-black text-white/30 uppercase tracking-widest mb-2">
              No Certificates Yet
            </p>
            <p className="text-xs text-white/20 max-w-[280px] leading-relaxed">
              Complete a course and claim your first soulbound NFT certificate.
            </p>
          </div>
          <Link href="/dashboard/generator">
            <Button className="bg-white text-black hover:bg-white/90 h-12 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest">
              <Award className="w-4 h-4 mr-2" />
              Mint New Asset
            </Button>
          </Link>
        </div>
      )}

      {/* Certificate Grid */}
      {!loading && certs.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {certs.map((cert) => {
            const rarity = getRarity(cert.genuinenessScore);
            return (
              <motion.div key={cert.tokenId} variants={item}>
                <Card className="group relative overflow-hidden h-full flex flex-col hover:bg-white/[0.04] transition-all duration-700">
                  {/* Rarity Badge */}
                  <div className={cn(
                    "absolute top-6 right-6 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full z-10",
                    rarity === "LEGENDARY" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                    rarity === "EPIC" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" :
                    "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  )}>
                    {rarity}
                  </div>

                  {/* Card Header */}
                  <CardHeader className="relative pb-8 pt-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.03] border border-white/[0.05] group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-2xl">
                          <Hexagon className={cn(
                            "w-10 h-10",
                            rarity === "LEGENDARY" ? "text-amber-500 group-hover:text-black" :
                            rarity === "EPIC" ? "text-purple-500 group-hover:text-black" :
                            "text-blue-500 group-hover:text-black"
                          )} />
                          <Award className="absolute w-5 h-5" />
                        </div>
                        <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-1">SCORE</div>
                        <div className="text-3xl font-black text-white group-hover:text-glow transition-all">{cert.genuinenessScore}</div>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black leading-tight text-white mb-2">
                      {cert.courseName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-[11px] font-black text-white/20 uppercase tracking-widest mt-3">
                      <Database className="w-3.5 h-3.5" /> MONARCH PROTOCOL
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-8 flex-1">
                    {/* Date + Token ID */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" /> ISSUED
                        </div>
                        <div className="text-sm font-bold text-white tracking-tight">
                          {cert.issuedAt ? formatDate(cert.issuedAt) : "—"}
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] flex items-center gap-2 justify-end">
                          <ShieldCheck className="w-3.5 h-3.5" /> TOKEN
                        </div>
                        <div className="text-sm font-bold text-white tracking-tight">#{cert.tokenId}</div>
                      </div>
                    </div>

                    {/* BaseScan link */}
                    <a
                      href={`https://testnet.monadexplorer.com/token/${CONTRACT_ADDRESS}?a=${cert.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] border border-white/[0.03] group-hover:bg-white/[0.05] hover:border-white/10 transition-colors"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5" /> VIEW ON BASESCAN
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    </a>
                  </CardContent>

                  <CardFooter className="grid grid-cols-2 gap-4 p-8 pt-4">
                    <Link
                      href={`/dashboard/generator?course=${encodeURIComponent(cert.courseName)}&score=${cert.genuinenessScore}&tokenId=${cert.tokenId}&wallet=${encodeURIComponent(cert.studentWallet)}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest group/btn">
                        <Download className="w-4 h-4 mr-2 text-white/20 group-hover/btn:text-white" />
                        DOWNLOAD
                      </Button>
                    </Link>
                    <Link href={`/verify/${cert.tokenId}`} className="w-full">
                      <Button className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/[0.05] hover:bg-white/10 text-white border-white/[0.05] group/btn">
                        VERIFY
                        <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                      </Button>
                    </Link>
                  </CardFooter>

                  {/* Ambient Glow */}
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/[0.02] blur-[100px] rounded-full group-hover:bg-white/[0.05] transition-all duration-700" />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
