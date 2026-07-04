export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x0A3769Ada9cBA047678998293D3cE25f04C397DB";

// Monarch ABI — only the mint function needed
const MONARCH_ABI = [
  "function mint(address recipient, string memory courseName, uint8 score) public returns (uint256)",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, score, course, completion, videoId, sessionHash } = body;

    // Basic validation
    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }
    if (typeof score !== "number" || score < 0 || score > 100) {
      return NextResponse.json({ error: "Score must be 0-100" }, { status: 400 });
    }
    if (!course || typeof course !== "string" || course.trim().length === 0) {
      return NextResponse.json({ error: "Course name required" }, { status: 400 });
    }

    const privateKey = process.env.MONARCH_PRIVATE_KEY;

    if (!privateKey) {
      // Demo mode — return a simulated successful response
      const mockTxHash = "0x" + Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      return NextResponse.json({
        success: true,
        txHash: mockTxHash,
        tokenId: Math.floor(Math.random() * 1000) + 1,
        demo: true,
        metadata: { completion, videoId, sessionHash },
      });
    }

    // Real UGF minting
    const { UGFClient, BASE_SEPOLIA_CHAIN_ID, TYI_USD_PAYMENT_COIN } = await import(
      "@tychilabs/ugf-testnet-js"
    );

    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const signer = new ethers.Wallet(privateKey, provider);
    const iface = new ethers.Interface(MONARCH_ABI);

    const safeScore = Math.min(100, Math.max(0, Math.floor(score)));
    const encodedData = iface.encodeFunctionData("mint", [
      wallet,
      course,
      safeScore,
    ]);

    const client = new UGFClient();
    await client.auth.login(signer);

    // Quote
    const quote = await client.quote.get({
      payer_address: signer.address,
      payment_coin: TYI_USD_PAYMENT_COIN,
      dest_chain_id: BASE_SEPOLIA_CHAIN_ID,
      dest_chain_type: "evm",
      tx_object: JSON.stringify({
        from: signer.address,
        to: CONTRACT_ADDRESS,
        data: encodedData,
        value: "0",
      }),
    });

    // Settle
    await client.payment.x402.execute({ quote, signer });

    // Execute
    const { userTxHash } = await client.chains.evm.sponsorAndExecute(
      quote.digest,
      signer,
      async () => ({ to: CONTRACT_ADDRESS, data: encodedData, value: 0n })
    );

    // Confirm
    const receipt = await provider.getTransactionReceipt(userTxHash);
    if (!receipt || receipt.status !== 1) {
      throw new Error("Transaction failed on-chain");
    }

    // Parse tokenId from Transfer event (ERC-721 Transfer has topics[3] = tokenId)
    let tokenId = 0;
    for (const log of receipt.logs) {
      if (log.topics.length === 4) {
        tokenId = Number(BigInt(log.topics[3]));
        break;
      }
    }

    return NextResponse.json({
      success: true,
      txHash: userTxHash,
      tokenId,
      metadata: { completion, videoId, sessionHash },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mint failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
