"use client";

import React from "react";
import { ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import type { Certificate } from "@/lib/blockchain";

const CONTRACT_ADDRESS = "0x0A3769Ada9cBA047678998293D3cE25f04C397DB";

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-rose-400";
}

interface RecentSessionsProps {
  wallet: string | null;
  certs: Certificate[] | null;
  loading?: boolean;
}

export function RecentSessions({ wallet, certs, loading = false }: RecentSessionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>RECENT CERTIFICATES</CardTitle>
        <CardDescription>
          Your last 5 on-chain certificates from Monad Testnet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-5 rounded-2xl border border-white/[0.03] bg-white/[0.01] p-5">
                <Skeleton className="h-12 w-12 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 bg-white/5" />
                  <Skeleton className="h-3 w-32 bg-white/5" />
                </div>
                <Skeleton className="h-6 w-14 rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && !wallet && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-white/20" />
            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
              Connect via extension
            </p>
            <p className="text-xs text-white/20 max-w-[240px] leading-relaxed">
              Open a freeCodeCamp video and enter your wallet in the Monarch extension to get started.
            </p>
          </div>
        )}

        {!loading && wallet && certs !== null && certs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <ShieldCheck className="w-8 h-8 text-white/20" />
            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">
              No certificates yet
            </p>
            <p className="text-xs text-white/20 max-w-[240px] leading-relaxed">
              Complete a course and claim your first soulbound NFT certificate.
            </p>
          </div>
        )}

        {!loading && wallet && certs && certs.length > 0 && (
          <div className="space-y-4">
            {certs.map((cert, index) => (
              <motion.div
                key={cert.tokenId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-center justify-between rounded-2xl border border-white/[0.03] bg-white/[0.01] p-5 transition-all hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] group-hover:bg-white group-hover:text-black transition-all duration-500">
                    <ShieldCheck className="h-6 w-6 text-white/40 group-hover:text-black transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-white tracking-tight truncate max-w-[200px]">
                      {cert.courseName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        Token #{cert.tokenId}
                      </span>
                      <span className="text-[10px] text-white/10">•</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        {cert.issuedAt ? formatDate(cert.issuedAt) : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <Badge
                    variant="outline"
                    className={`font-black text-xs px-3 border-white/10 bg-white/[0.02] ${scoreColor(cert.genuinenessScore)}`}
                  >
                    {cert.genuinenessScore}/100
                  </Badge>
                  <a
                    href={`https://testnet.monadexplorer.com/token/${CONTRACT_ADDRESS}?a=${cert.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full p-2.5 text-white/20 hover:bg-white/[0.05] hover:text-white transition-all"
                    title="View on BaseScan"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
