export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import crypto from 'crypto';

// In a real app, this would use @tychilabs/ugf-testnet-js and ethers.js
// to actually mint the SBT on Monad Testnet.
// For the scope of this file setup, we mock the UGF call.

export async function POST(req: Request) {
  try {
    const { sessionId, passed, explanation } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const sessionRef = db.collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessionDoc.data();

    if (!session || session.status !== 'VERIFIED') {
      return NextResponse.json({ error: 'Session not verified or not found' }, { status: 400 });
    }

    // 1. Generate Evidence Report JSON
    const reportJson = {
      issuer: "Monarch Protocol v1",
      platform: session.platform || "LeetCode",
      integrity: { 
        entropyScore: session.entropyScore, 
        status: (session.entropyScore && session.entropyScore > 70) ? "High Confidence" : "Low Confidence" 
      },
      assessment: { 
        passed, 
        explanation 
      },
      timestamp: new Date().toISOString()
    };

    // 2. Generate Hash (Deterministic Stringify)
    const reportString = JSON.stringify(reportJson, Object.keys(reportJson).sort());
    const reportHash = crypto.createHash('sha256').update(reportString).digest('hex');

    // 3. Save Evidence Report to Firestore
    const evidenceReportRef = db.collection('evidence_reports').doc();
    
    // 4. Mock UGF Minting Call
    // const tx = await mintSBT(user.walletAddress, metadataUri, `0x${reportHash}`);
    const mockTokenId = Math.floor(Math.random() * 10000);

    // 5. Update Firestore with report and token ID
    await evidenceReportRef.set({
      sessionId,
      reportJson,
      reportHash,
      sbtTokenId: mockTokenId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      reportHash,
      sbtTokenId: mockTokenId
    }, { status: 200 });

  } catch (error) {
    console.error('Issue Mint Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
