import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["*://leetcode.com/problems/*"],
  run_at: "document_idle"
}

console.log("[Monarch] LeetCode tracker loaded.")

interface KeystrokeEvent {
  key: string
  timestamp: number
  isPaste: boolean
}

let keystrokes: KeystrokeEvent[] = []
let sessionActive = false
let problemSlug = ""
let typingEntropy = 0 // scale of 0-1 (0 = all pasted/robotic, 1 = natural human typing)

function extractProblemSlug() {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/)
  return match ? match[1] : "unknown-problem"
}

function calculateLocalEntropy(events: KeystrokeEvent[]): number {
  if (events.length < 10) return 0.5 // Default to mid if not enough data

  let pasteCount = 0
  let fastTypeCount = 0
  let naturalTypeCount = 0

  for (let i = 1; i < events.length; i++) {
    const timeDiff = events[i].timestamp - events[i - 1].timestamp
    if (events[i].isPaste || timeDiff < 20) {
      pasteCount++
    } else if (timeDiff < 70) {
      fastTypeCount++
    } else {
      naturalTypeCount++
    }
  }

  // A very simple heuristic for "entropy":
  // Natural typing has high variance and higher time diffs. Pasting is instantaneous.
  const total = pasteCount + fastTypeCount + naturalTypeCount
  const naturalRatio = naturalTypeCount / total
  
  return Math.min(Math.max(naturalRatio * 1.5, 0), 1) // Scale up slightly, cap at 1
}

async function syncSession() {
  if (!sessionActive || keystrokes.length === 0) return

  typingEntropy = calculateLocalEntropy(keystrokes)
  
  console.log(`[Monarch] Syncing LeetCode session for ${problemSlug}. Entropy: ${typingEntropy.toFixed(2)}`)

  try {
    await sendToBackground({
      name: "leetcode-sync" as never,
      body: {
        problemSlug,
        entropyScore: typingEntropy,
        keystrokeCount: keystrokes.length,
        timestamp: Date.now()
      }
    })
  } catch (err) {
    console.warn("[Monarch] Failed to sync LeetCode session:", err)
  }
}

function attachEditorListeners() {
  // LeetCode uses Monaco editor, which captures keyboard events on a specific textarea
  const editorTextarea = document.querySelector('.monaco-editor textarea') as HTMLTextAreaElement
  
  if (!editorTextarea) {
    // Keep trying if editor isn't loaded yet
    setTimeout(attachEditorListeners, 1000)
    return
  }

  console.log("[Monarch] Attached to LeetCode editor.")
  sessionActive = true
  problemSlug = extractProblemSlug()

  editorTextarea.addEventListener('keydown', (e) => {
    // Ignore pure modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return

    keystrokes.push({
      key: e.key,
      timestamp: Date.now(),
      isPaste: e.ctrlKey && e.key.toLowerCase() === 'v'
    })
  })

  editorTextarea.addEventListener('paste', () => {
    keystrokes.push({
      key: "PASTE_EVENT",
      timestamp: Date.now(),
      isPaste: true
    })
  })
}

// Start watching for editor
attachEditorListeners()

// Sync every 30 seconds
setInterval(syncSession, 30000)

// Sync on unload
window.addEventListener("beforeunload", syncSession)
