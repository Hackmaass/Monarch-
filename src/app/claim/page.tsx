"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  ExternalLink,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

function deriveName(user: { displayName?: string | null; email?: string | null } | null): string {
  if (user?.displayName) return user.displayName;
  if (user?.email) {
    const local = user.email.split("@")[0];
    return local.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }
  return "Monarch Learner";
}

type MintState = "idle" | "minting" | "success" | "error";

function ClaimContent() {
  const params = useSearchParams();
  const { user } = useAuth();
  const recipientName = deriveName(user);

  const wallet = params.get("wallet") ?? "";
  const score = Number(params.get("score") ?? 0);
  const course = params.get("course") ?? "Unknown Course";
  const completion = Number(params.get("completion") ?? 0);
  const videoId = params.get("videoId") ?? "";
  const sessionHash = params.get("sessionHash") ?? "";

  const [mintState, setMintState] = useState<MintState>("idle");
  const [txHash, setTxHash] = useState("");
  const [tokenId, setTokenId] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  // Persist wallet so the dashboard can read it without needing the extension
  useEffect(() => {
    if (wallet && wallet.startsWith("0x") && wallet.length === 42) {
      localStorage.setItem("monarch_wallet", wallet);
      sessionStorage.setItem("monarch_wallet", wallet);
    }
  }, [wallet]);

  const isValid =
    wallet.startsWith("0x") && wallet.length === 42 && score > 0 && course.length > 0;

  const handleMint = async () => {
    if (!isValid) return;
    setMintState("minting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, score, course, completion, videoId, sessionHash }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Mint failed");
      }

      setTxHash(data.txHash);
      setTokenId(data.tokenId);
      setIsDemo(!!data.demo);
      setMintState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setMintState("error");
    }
  };

  const scoreColor =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Ambient glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Monarch · Gasless Certificate Claim
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white leading-none mb-4">
            CLAIM YOUR<br />CERTIFICATE
          </h1>
          <p className="text-white/40 text-base font-medium max-w-md mx-auto">
            Your learning session has been verified. Mint your soulbound NFT certificate — no ETH required.
          </p>
        </motion.div>

        {/* Certificate Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                  <Award className="w-7 h-7 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-black truncate">{course}</CardTitle>
                  {videoId && (
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Play className="w-3 h-3" />
                      <span className="font-mono text-[10px]">{videoId}</span>
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Score row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">
                    Genuineness Score
                  </p>
                  <p className={`text-4xl font-black tracking-tighter ${scoreColor}`}>
                    {score}
                  </p>
                  <p className="text-[10px] text-white/20 font-medium mt-1">out of 100</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">
                    Completion
                  </p>
                  <p className="text-4xl font-black tracking-tighter text-blue-400">
                    {Math.round(completion)}%
                  </p>
                  <p className="text-[10px] text-white/20 font-medium mt-1">of video watched</p>
                </div>
              </div>

              {/* Wallet */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">
                  Recipient Wallet
                </p>
                <p className="font-mono text-sm text-white/60 break-all">{wallet}</p>
              </div>

              {/* Chain info */}
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Monad Testnet · ERC-721 · Soulbound · UGF Gasless
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mint Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {mintState === "idle" && (
            <button
              onClick={handleMint}
              disabled={!isValid}
              className="w-full h-16 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl"
            >
              Mint Soulbound Certificate
            </button>
          )}

          {mintState === "minting" && (
            <div className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
              <span className="text-sm font-black uppercase tracking-widest text-white/60">
                Minting via UGF...
              </span>
            </div>
          )}

          {mintState === "success" && (
            <div className="space-y-4">
              <div className="w-full rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-black text-emerald-400 uppercase tracking-widest text-sm">
                    Certificate Minted!
                  </p>
                  <p className="text-[11px] text-white/40 font-medium mt-1">
                    Token #{tokenId} · {isDemo ? "Demo mode — no LEARNCERT_PRIVATE_KEY set" : "On-chain · Monad Testnet"}
                  </p>
                </div>
              </div>

              {txHash && (
                <a
                  href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all group"
                >
                  <span className="text-[11px] font-mono text-blue-400">
                    {txHash.slice(0, 18)}...{txHash.slice(-8)}
                  </span>
                  <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </a>
              )}

              <a
                href={`/dashboard/generator?name=${encodeURIComponent(recipientName)}&course=${encodeURIComponent(course)}&score=${score}&tokenId=${tokenId}&wallet=${encodeURIComponent(wallet)}&completion=${completion}&videoId=${encodeURIComponent(videoId)}`}
                className="flex items-center justify-center w-full h-14 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-white/90 transition-all"
              >
                View Certificate →
              </a>
              <a
                href={`/verify/${tokenId}?completion=${completion}&videoId=${encodeURIComponent(videoId)}&course=${encodeURIComponent(course)}&score=${score}&wallet=${encodeURIComponent(wallet)}`}
                className="flex items-center justify-center w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white"
              >
                View Blockchain Proof →
              </a>
            </div>
          )}

          {mintState === "error" && (
            <div className="space-y-4">
              <div className="w-full rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-black text-rose-400 uppercase tracking-widest text-xs mb-1">
                    Mint Failed
                  </p>
                  <p className="text-[11px] text-white/40">{errorMsg}</p>
                </div>
              </div>
              <button
                onClick={handleMint}
                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {!isValid && mintState === "idle" && (
            <p className="text-center text-[11px] text-white/30 mt-3 font-medium">
              Missing or invalid parameters in URL
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    }>
      <ClaimContent />
    </Suspense>
  );
}
