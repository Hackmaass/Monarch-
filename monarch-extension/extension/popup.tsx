import React, { useState, useEffect } from "react"
import { Header } from "./components/layout/Header"
import { ScorePanel } from "./components/dashboard/ScorePanel"
import { AnalyticsPanel } from "./components/dashboard/AnalyticsPanel"
import { EligibilityPanel } from "./components/dashboard/EligibilityPanel"
import { MintPanel } from "./components/dashboard/MintPanel"
import "~style.css"

import { Storage } from "@plasmohq/storage"
import { STORAGE_KEYS, MIN_SCORE_FOR_CERT, MIN_COMPLETION_FOR_CERT } from "~lib/constants"
import type { Certificate } from "~types/certificate"
import type { WatchSession } from "~types/session"
import { calculateScoreBreakdown, computeUniqueCompletionPct } from "~lib/scoring"


/** Simple deterministic hash from a string — no ethers needed */
function simpleSessionHash(input: string): string {
  let hash = 0n
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31n + BigInt(input.charCodeAt(i))) % (2n ** 256n)
  }
  return "0x" + hash.toString(16).padStart(64, "0")
}

const storage = new Storage({ area: "local" })

function IndexPopup() {
  const [activeTab, setActiveTab] = useState<"current" | "analytics">("current")
  const [isTracking, setIsTracking] = useState(false)

  // MetaMask wallet address entered by user
  const [walletAddress, setWalletAddress] = useState("")
  const [walletInput, setWalletInput] = useState("")
  const [walletError, setWalletError] = useState("")
  
  // Real session data from storage
  const [sessionData, setSessionData] = useState<WatchSession | null>(null)
  const [currentScore, setCurrentScore] = useState(0)
  const [completionPct, setCompletionPct] = useState(0)
  const [breakdown, setBreakdown] = useState({
    completion: 0,
    engagement: 0,
    focus: 0,
    speedPenalty: 0,
    skipPenalty: 0,
    inactivityPenalty: 0,
  })

  // Analytics — aggregated from all stored sessions
  const [totalWatchTime, setTotalWatchTime] = useState(0)
  const [videosCompleted, setVideosCompleted] = useState(0)
  const [averageScore, setAverageScore] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [dailyActivity, setDailyActivity] = useState<{ date: string; seconds: number }[]>([])
  const [sessionHistory, setSessionHistory] = useState<WatchSession[]>([])
  const [overlayEnabled, setOverlayEnabled] = useState(true)

  const handleWalletSave = async () => {
    const trimmed = walletInput.trim()
    if (!trimmed.startsWith("0x") || trimmed.length !== 42) {
      setWalletError("Must start with 0x and be 42 characters")
      return
    }
    setWalletError("")
    setWalletAddress(trimmed)
    await storage.set(STORAGE_KEYS.WALLET_ADDRESS, trimmed)
  }





  useEffect(() => {
    const loadSession = async () => {
      // ── Load saved wallet ──
      const savedWallet = await storage.get<string>(STORAGE_KEYS.WALLET_ADDRESS)
      if (savedWallet) {
        setWalletAddress(savedWallet)
        setWalletInput(savedWallet)
      }

      // ── Load overlay setting ──
      const enabled = await storage.get<boolean>(STORAGE_KEYS.OVERLAY_ENABLED)
      if (enabled !== undefined) {
        setOverlayEnabled(enabled)
      } else {
        setOverlayEnabled(true)
      }

      // ── 1. Load active session ──
      const sessionJson = await storage.get(STORAGE_KEYS.ACTIVE_SESSION)
      if (sessionJson) {
        try {
          const session: WatchSession = typeof sessionJson === "string"
            ? JSON.parse(sessionJson)
            : sessionJson
          setSessionData(session)
          setIsTracking(true)

          // Real scoring from session data
          const scoreResult = calculateScoreBreakdown(session)
          const uniqueCompletion = computeUniqueCompletionPct(session)

          setCompletionPct(uniqueCompletion)
          setCurrentScore(scoreResult.finalScore)
          setBreakdown({
            completion: scoreResult.completion,
            engagement: scoreResult.engagement,
            focus: scoreResult.focus,
            speedPenalty: scoreResult.speedPenalty,
            skipPenalty: scoreResult.skipPenalty,
            inactivityPenalty: scoreResult.inactivityPenalty,
          })
        } catch {
          setIsTracking(false)
        }
      } else {
        setIsTracking(false)
      }

      // ── 2. Load all stored sessions for analytics ──
      const allKeys = await storage.getAll()
      const allSessions: WatchSession[] = []

      for (const [key, val] of Object.entries(allKeys)) {
        if (key.startsWith("sessions_") && Array.isArray(val)) {
          allSessions.push(...(val as WatchSession[]))
        }
      }

      setSessionHistory(allSessions)

      // Total watch time across all sessions
      const totalWT = allSessions.reduce((sum, s) => sum + (s.totalWatchTime || 0), 0)
      setTotalWatchTime(totalWT)

      // Videos completed (>= 90% completion)
      const completed = allSessions.filter(s => {
        const dur = s.video?.duration || 1
        return s.totalWatchTime / dur >= 0.9
      }).length
      setVideosCompleted(completed)

      // Add certificates count
      const certs = await storage.get<Certificate[]>(STORAGE_KEYS.CERTIFICATES)
      if (certs && certs.length > completed) {
        setVideosCompleted(certs.length)
      }

      // Average score across all sessions
      if (allSessions.length > 0) {
        const scores = allSessions.map(s => calculateScoreBreakdown(s).finalScore)
        const avg = scores.reduce((sum, sc) => sum + sc, 0) / scores.length
        setAverageScore(Math.round(avg))
      } else {
        setAverageScore(0)
      }

      // Daily streak — count consecutive days with sessions (backwards from today)
      const uniqueDays = new Set(
        allSessions.map(s => new Date(s.startedAt).toDateString())
      )
      let streak = 0
      const today = new Date()
      for (let d = 0; d < 365; d++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - d)
        if (uniqueDays.has(checkDate.toDateString())) {
          streak++
        } else if (d > 0) {
          break // gap found
        }
      }
      setCurrentStreak(streak)

      // Daily activity — last 14 days
      const activityMap = new Map<string, number>()
      for (let d = 13; d >= 0; d--) {
        const date = new Date(today)
        date.setDate(date.getDate() - d)
        const key = date.toISOString().split("T")[0]
        activityMap.set(key, 0)
      }
      for (const session of allSessions) {
        const key = new Date(session.startedAt).toISOString().split("T")[0]
        if (activityMap.has(key)) {
          activityMap.set(key, (activityMap.get(key) || 0) + (session.totalWatchTime || 0))
        }
      }
      setDailyActivity(
        Array.from(activityMap.entries()).map(([date, seconds]) => ({ date, seconds }))
      )
    }

    loadSession()
    // Poll for updates while popup is open
    const interval = setInterval(loadSession, 2000)
    return () => clearInterval(interval)
  }, [])

  const isEligible = currentScore >= MIN_SCORE_FOR_CERT && completionPct >= MIN_COMPLETION_FOR_CERT * 100

  // Compute sessionHash deterministically from session data
  const sessionHash = sessionData
    ? simpleSessionHash(`${sessionData.id}-${sessionData.video?.videoId || ""}-${currentScore}`)
    : ""

  const handleOverlayToggle = async () => {
    const next = !overlayEnabled
    setOverlayEnabled(next)
    await storage.set(STORAGE_KEYS.OVERLAY_ENABLED, next)
  }

  return (
    <div className="mesh-gradient relative overflow-hidden" style={{ width: 380, height: 600 }}>
      {/* Ambient Glows */}
      <div className="ambient-glow w-[300px] h-[300px] -top-20 -left-20 bg-emerald-500/10 animate-glow" />
      <div className="ambient-glow w-[250px] h-[250px] top-1/2 -right-20 bg-purple-500/5 animate-glow" style={{ animationDelay: '-3s' }} />

      <div className="relative z-10 h-full flex flex-col">
        <Header 
          isTracking={isTracking} 
          overlayEnabled={overlayEnabled}
          onOverlayToggle={handleOverlayToggle}
        />

        {/* Tabs */}
        <div className="flex px-5 mt-2 gap-4">
              <button
                className={`pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-b-2 ${
                  activeTab === "current" 
                    ? "border-white text-white" 
                    : "border-transparent text-white/30 hover:text-white/50"
                }`}
                onClick={() => setActiveTab("current")}
              >
                Current Session
              </button>
              <button
                className={`pb-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-b-2 ${
                  activeTab === "analytics" 
                    ? "border-white text-white" 
                    : "border-transparent text-white/30 hover:text-white/50"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                Analytics
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide">
              {activeTab === "current" ? (
                <div className="animate-fade-in-up">
                  {!isTracking ? (
                    <div className="px-5 py-12 text-center animate-fade-in-up">
                      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/[0.03] border border-white/5">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/15">
                          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <polygon points="10,7 16,10 10,13" fill="currentColor" opacity="0.4" />
                        </svg>
                      </div>
                      <p className="heading-heavy text-white/30 text-[13px] mb-1">NO ACTIVE SESSION</p>
                      <p className="text-[10px] text-white/20 font-medium leading-relaxed px-6">
                        Open a YouTube video to begin tracking your learning progress in real-time
                      </p>
                    </div>
                  ) : (
                    <>
                      {sessionData?.video?.title && (
                        <div className="px-5 pt-3 pb-1">
                          <p className="meta-label !text-[7px] opacity-30 mb-1">NOW TRACKING</p>
                          <p className="text-[11px] font-bold text-white/70 truncate">
                            {sessionData.video.title}
                          </p>
                          <p className="text-[9px] text-white/25 font-medium mt-0.5">
                            {sessionData.video.channelName}
                          </p>
                        </div>
                      )}

                      <ScorePanel score={currentScore} breakdown={breakdown} />
                      <EligibilityPanel 
                        score={currentScore} 
                        completion={completionPct} 
                        isEligible={isEligible} 
                      />
                      
                      <div className="px-5 pb-2">
                        <p className="meta-label opacity-40 mb-2">Your MetaMask Wallet</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={walletInput}
                            onChange={(e) => setWalletInput(e.target.value)}
                            placeholder="0x..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white placeholder-white/20 focus:outline-none focus:border-white/30 font-mono"
                          />
                          <button
                            onClick={handleWalletSave}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black text-white uppercase tracking-wider transition-all"
                          >
                            Save
                          </button>
                        </div>
                        {walletError && (
                          <p className="text-[9px] text-rose-400 mt-1">{walletError}</p>
                        )}
                        {walletAddress && !walletError && (
                          <p className="text-[9px] text-emerald-400 mt-1">
                            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)} saved
                          </p>
                        )}
                      </div>

                      <MintPanel
                        isEligible={isEligible}
                        videoTitle={sessionData?.video?.title || "Unknown Video"}
                        videoId={sessionData?.video?.videoId || ""}
                        score={currentScore}
                        completion={completionPct}
                        sessionHash={sessionHash}
                        walletAddress={walletAddress}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="animate-fade-in-up">
                  <AnalyticsPanel
                    totalWatchTime={totalWatchTime}
                    videosCompleted={videosCompleted}
                    averageScore={averageScore}
                    currentStreak={currentStreak}
                    dailyActivity={dailyActivity}
                    sessionHistory={sessionHistory}
                  />
                </div>
              )}
            </div>
      </div>
    </div>
  )
}

export default IndexPopup
