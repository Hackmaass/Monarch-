import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { submitTelemetryToFirebase } from "../../lib/firebase"

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  if (!req.body) {
    res.send({ success: false, error: "No payload" })
    return
  }

  try {
    const { problemSlug, entropyScore, keystrokeCount, timestamp } = req.body

    if (!problemSlug) {
      res.send({ success: false, error: "Missing problemSlug" })
      return
    }

    const key = `leetcode_${problemSlug}`
    
    const sessionData = {
      problemSlug,
      entropyScore,
      keystrokeCount,
      lastUpdated: timestamp
    }

    await storage.set(key, sessionData)
    
    // Push directly to Firebase
    await submitTelemetryToFirebase("leetcode", sessionData)
    
    console.log(`[Monarch] Saved LeetCode data for ${problemSlug} (Entropy: ${entropyScore})`)

    res.send({ success: true })
  } catch (err) {
    console.error("[Monarch] Error saving LeetCode session:", err)
    res.send({ success: false, error: String(err) })
  }
}

export default handler
