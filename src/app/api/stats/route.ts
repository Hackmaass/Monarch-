export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getTotalSupply, getWalletCertificates } from "@/lib/blockchain";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet");

  const totalMinted = await getTotalSupply();

  if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
    return NextResponse.json({
      totalMinted: totalMinted ?? 0,
      walletCertCount: null,
      bestScore: null,
      lastCourse: null,
      lastScore: null,
      recentCerts: null,
    });
  }

  const certs = await getWalletCertificates(wallet);

  const bestScore = certs.length
    ? Math.max(...certs.map((c) => c.genuinenessScore))
    : null;

  const lastCert = certs[0] ?? null;

  return NextResponse.json({
    totalMinted: totalMinted ?? 0,
    walletCertCount: certs.length,
    bestScore,
    lastCourse: lastCert?.courseName ?? null,
    lastScore: lastCert?.genuinenessScore ?? null,
    recentCerts: certs.slice(0, 5),
  });
}
