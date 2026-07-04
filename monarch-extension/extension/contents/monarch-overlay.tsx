import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState, useRef } from "react"
import { Storage } from "@plasmohq/storage"
import { STORAGE_KEYS } from "~lib/constants"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/*"],
  run_at: "document_idle"
}

const POLL_MS = 1000
const storage = new Storage({ area: "local" })

// Allowed channels — mirror of video-detector.ts
const ALLOWED_CHANNELS = [
  "freecodecamp.org",
  "freecodecamp",
]

function checkChannelAllowed(): boolean {
  const selectors = [
    "#channel-name yt-formatted-string a",
    "#channel-name a",
    "ytd-channel-name yt-formatted-string a",
    "#owner-name a",
    "#upload-info ytd-channel-name yt-formatted-string",
  ]
  for (const sel of selectors) {
    const el = document.querySelector(sel)
    const name = el?.textContent?.trim()
    if (name) {
      return ALLOWED_CHANNELS.some(
        (c) => c.toLowerCase() === name.toLowerCase()
      )
    }
  }
  return false
}

interface TrackingState {
  isActive: boolean
  isAllowedChannel: boolean
  channelName: string
  videoTitle: string
  videoId: string | null
  duration: number
  currentTime: number
  watchedPct: number
  totalWatchTime: number
  pauseCount: number
  playbackRate: number
  tabFocused: boolean
  scoreEstimate: number
}

const MonarchOverlay = () => {
  const [state, setState] = useState<TrackingState>({
    isActive: false,
    isAllowedChannel: false,
    channelName: "",
    videoTitle: "",
    videoId: null,
    duration: 0,
    currentTime: 0,
    watchedPct: 0,
    totalWatchTime: 0,
    pauseCount: 0,
    playbackRate: 1,
    tabFocused: true,
    scoreEstimate: 0,
  })
  const [minimized, setMinimized] = useState(false)
  const [overlayEnabled, setOverlayEnabled] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Restore overlay preference from Plasmo storage
    storage.get<boolean>(STORAGE_KEYS.OVERLAY_ENABLED).then((val) => {
      if (val !== undefined) setOverlayEnabled(val)
    })

    // Watch for live changes from popup toggle
    storage.watch({
      [STORAGE_KEYS.OVERLAY_ENABLED]: (c) => {
        if (c.newValue !== undefined) {
          setOverlayEnabled(c.newValue)
        }
      }
    })

    const poll = () => {
      const video = document.querySelector("video") as HTMLVideoElement | null
      if (!video || !isFinite(video.duration) || video.duration === 0) {
        setState(prev => ({ ...prev, isActive: false, isAllowedChannel: false }))
        return
      }

      // Check if this is a freeCodeCamp video
      const allowed = checkChannelAllowed()
      const channelEl = document.querySelector("#channel-name yt-formatted-string a") ||
                         document.querySelector("#channel-name a") ||
                         document.querySelector("ytd-channel-name yt-formatted-string a")
      const channelName = channelEl?.textContent?.trim() || ""
      const titleEl = document.querySelector("h1.ytd-watch-metadata yt-formatted-string") || document.querySelector("h1.title yt-formatted-string")
      const videoTitle = titleEl?.textContent?.trim() || document.title.replace(" - YouTube", "")

      if (!allowed) {
        setState(prev => ({ ...prev, isActive: false, isAllowedChannel: false, channelName, videoTitle }))
        return
      }

      const duration = video.duration
      const currentTime = video.currentTime
      const watchedPct = (currentTime / duration) * 100

      // Approximate score
      const completionFactor = Math.min(watchedPct / 100, 1) * 35
      const focusFactor = document.hasFocus() ? 20 : 5
      const speedPenalty = video.playbackRate > 1.5 ? (video.playbackRate - 1) * 15 : 0
      const scoreEstimate = Math.max(0, Math.min(100,
        completionFactor + 25 + focusFactor + 10 - speedPenalty
      ))

      setState({
        isActive: true,
        isAllowedChannel: true,
        channelName,
        videoTitle,
        videoId: new URLSearchParams(window.location.search).get("v"),
        duration,
        currentTime,
        watchedPct,
        totalWatchTime: currentTime,
        pauseCount: 0,
        playbackRate: video.playbackRate,
        tabFocused: document.hasFocus(),
        scoreEstimate: Math.round(scoreEstimate),
      })
    }

    intervalRef.current = setInterval(poll, POLL_MS)
    poll()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const toggleOverlay = async () => {
    const next = !overlayEnabled
    setOverlayEnabled(next)
    await storage.set(STORAGE_KEYS.OVERLAY_ENABLED, next)
  }

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const completionTarget = state.duration * 0.8

  // If not on a freeCodeCamp video, render nothing
  if (!state.isActive || !state.isAllowedChannel) return null

  // If overlay is disabled, show only a small re-enable pill
  if (!overlayEnabled) {
    return (
      <>
        <div
          style={{
            position: "fixed",
            top: "72px",
            right: "16px",
            zIndex: 2147483647,
            fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
          }}
        >
          <button
            onClick={toggleOverlay}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 10px",
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "999px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              fontSize: "8px",
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
            }}
            title="Re-enable Monarch Overlay"
          >
            <span style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
            }} />
            MONARCH
          </button>
        </div>
        <style>{`
          @keyframes monarch-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.85); }
          }
        `}</style>
      </>
    )
  }

  const isPastThreshold = state.watchedPct >= 80
  const isEligible = state.scoreEstimate >= 35 && isPastThreshold

  return (
    <>
      {/* ═══ 80% MARKER on YouTube progress bar ═══ */}
      <div
        id="monarch-marker-line"
        style={{
          position: "fixed",
          bottom: "43px",
          left: `${80}%`,
          width: "2px",
          height: "48px",
          background: isPastThreshold
            ? "linear-gradient(to top, #10b981, #10b98100)"
            : "linear-gradient(to top, #f59e0b, #f59e0b00)",
          zIndex: 2147483647,
          pointerEvents: "none",
          transition: "background 0.5s ease",
        }}
      />
      {/* Marker label */}
      <div
        id="monarch-marker-label"
        style={{
          position: "fixed",
          bottom: "88px",
          left: `calc(${80}% - 22px)`,
          zIndex: 2147483647,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            color: isPastThreshold ? "#10b981" : "#f59e0b",
            textShadow: `0 0 12px ${isPastThreshold ? "rgba(16,185,129,0.6)" : "rgba(245,158,11,0.6)"}`,
            fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
            whiteSpace: "nowrap" as const,
          }}
        >
          80%
        </div>
        <div
          style={{
            fontSize: "8px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
            whiteSpace: "nowrap" as const,
          }}
        >
          {formatTime(completionTarget)}
        </div>
      </div>

      {/* ═══ FLOATING HUD — top-right corner ═══ */}
      <div
        id="monarch-overlay-hud"
        style={{
          position: "fixed",
          top: "72px",
          right: "16px",
          zIndex: 2147483647,
          fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {minimized ? (
          /* ── Minimized pill ── */
          <button
            onClick={() => setMinimized(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "999px",
              cursor: "pointer",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 900,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px rgba(16,185,129,0.5)",
              animation: "monarch-pulse 2s ease-in-out infinite",
            }} />
            {Math.round(state.watchedPct)}%
          </button>
        ) : (
          /* ── Full HUD panel ── */
          <div
            style={{
              width: "220px",
              background: "rgba(0, 0, 0, 0.82)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                  animation: "monarch-pulse 2s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase" as const,
                  color: "#10b981",
                }}>
                  TRACKING
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {/* Disable overlay button */}
                <button
                  onClick={toggleOverlay}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    fontSize: "9px",
                    lineHeight: 1,
                    padding: "2px 4px",
                    borderRadius: "4px",
                    transition: "all 0.2s ease",
                  }}
                  title="Hide Overlay"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                >
                  ✕
                </button>
                {/* Minimize button */}
                <button
                  onClick={() => setMinimized(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    fontSize: "14px",
                    lineHeight: 1,
                    padding: "2px",
                  }}
                  title="Minimize"
                >
                  ─
                </button>
              </div>
            </div>

            {/* Score ring */}
            <div style={{ padding: "12px 14px 8px", textAlign: "center" as const }}>
              <div style={{
                fontSize: "32px",
                fontWeight: 900,
                letterSpacing: "-0.05em",
                color: "#fff",
                textShadow: "0 0 20px rgba(255,255,255,0.15)",
                lineHeight: 1,
              }}>
                {Math.round(state.watchedPct)}<span style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>%</span>
              </div>
              <div style={{
                fontSize: "8px",
                fontWeight: 900,
                letterSpacing: "0.3em",
                textTransform: "uppercase" as const,
                color: "rgba(255,255,255,0.3)",
                marginTop: "2px",
              }}>
                COMPLETION
              </div>

              {/* Progress bar with 80% marker */}
              <div style={{
                position: "relative" as const,
                height: "4px",
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "999px",
                marginTop: "10px",
                overflow: "visible",
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min(state.watchedPct, 100)}%`,
                  background: isPastThreshold
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.8))",
                  borderRadius: "999px",
                  transition: "width 1s ease, background 0.5s ease",
                }} />
                <div style={{
                  position: "absolute" as const,
                  left: "80%",
                  top: "-3px",
                  width: "2px",
                  height: "10px",
                  background: isPastThreshold ? "#10b981" : "#f59e0b",
                  borderRadius: "999px",
                  boxShadow: `0 0 6px ${isPastThreshold ? "rgba(16,185,129,0.5)" : "rgba(245,158,11,0.5)"}`,
                }} />
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ padding: "4px 14px 12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <StatBox
                  label="WATCH TIME"
                  value={formatTime(state.currentTime)}
                  subtext={`/ ${formatTime(state.duration)}`}
                />
                <StatBox
                  label="SCORE EST."
                  value={`${state.scoreEstimate}`}
                  color={state.scoreEstimate >= 70 ? "#10b981" : state.scoreEstimate >= 50 ? "#f59e0b" : "#ef4444"}
                />
                <StatBox
                  label="SPEED"
                  value={`${state.playbackRate}x`}
                  color={state.playbackRate > 1.5 ? "#ef4444" : "#fff"}
                />
                <StatBox
                  label="FOCUS"
                  value={state.tabFocused ? "YES" : "NO"}
                  color={state.tabFocused ? "#10b981" : "#ef4444"}
                />
              </div>
            </div>

            {/* Action Area */}
            {isEligible && (
              <div style={{ padding: "0 14px 12px" }}>
                <button
                  onClick={() => window.open(`https://monarch.yolkone.com/quiz/${state.videoId}?title=${encodeURIComponent(state.videoTitle)}`, "_blank")}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#10b981",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    boxShadow: "0 0 16px rgba(16,185,129,0.4)"
                  }}
                >
                  Take Quiz
                </button>
              </div>
            )}

            {/* Eligibility badge */}
            <div style={{
              padding: "8px 14px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isEligible ? "#10b981" : "rgba(255,255,255,0.15)",
                boxShadow: isEligible ? "0 0 10px rgba(16,185,129,0.5)" : "none",
                transition: "all 0.5s ease",
              }} />
              <span style={{
                fontSize: "8px",
                fontWeight: 900,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: isEligible ? "#10b981" : "rgba(255,255,255,0.25)",
                transition: "color 0.5s ease",
              }}>
                {isEligible ? "ELIGIBLE FOR CERTIFICATE" : `${isPastThreshold ? "SCORE TOO LOW" : `${Math.round(80 - state.watchedPct)}% REMAINING`}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Global keyframe injection ═══ */}
      <style>{`
        @keyframes monarch-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </>
  )
}

/* ── Stat box sub-component ── */
const StatBox = ({
  label,
  value,
  subtext,
  color = "#fff",
}: {
  label: string
  value: string
  subtext?: string
  color?: string
}) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    borderRadius: "8px",
    padding: "6px 8px",
  }}>
    <div style={{
      fontSize: "7px",
      fontWeight: 900,
      letterSpacing: "0.25em",
      textTransform: "uppercase" as const,
      color: "rgba(255,255,255,0.25)",
      marginBottom: "2px",
    }}>
      {label}
    </div>
    <div style={{
      fontSize: "13px",
      fontWeight: 900,
      letterSpacing: "-0.02em",
      color,
      lineHeight: 1.2,
    }}>
      {value}
      {subtext && (
        <span style={{
          fontSize: "9px",
          fontWeight: 600,
          color: "rgba(255,255,255,0.2)",
          marginLeft: "2px",
        }}>
          {subtext}
        </span>
      )}
    </div>
  </div>
)

export default MonarchOverlay
