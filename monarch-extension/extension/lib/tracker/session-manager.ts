// Monarch — Session Manager
// Orchestrates engagement monitoring, focus tracking, and session persistence

import { Storage } from "@plasmohq/storage"
import { sendToBackground } from "@plasmohq/messaging"

import type { WatchSession, VideoMetadata } from "~types/session"
import { EngagementMonitor } from "./engagement-monitor"
import { FocusTracker } from "./focus-tracker"
import { STORAGE_KEYS, SYNC_INTERVAL_MS } from "~lib/constants"

export class SessionManager {
  private storage: Storage
  private engagementMonitor: EngagementMonitor | null = null
  private focusTracker: FocusTracker
  private currentSession: WatchSession | null = null
  private syncInterval: ReturnType<typeof setInterval> | null = null
  private userId: string

  constructor(userId: string = "anonymous") {
    this.storage = new Storage({ area: "local" })
    this.focusTracker = new FocusTracker()
    this.userId = userId
  }

  /**
   * Start a new watch session for a video.
   * If an existing session is active, it will be ended first.
   */
  async startSession(
    video: HTMLVideoElement,
    metadata: VideoMetadata
  ): Promise<WatchSession> {
    // End any existing session
    if (this.currentSession) {
      await this.endSession()
    }

    // Try to get saved wallet address from popup
    const savedWallet = await this.storage.get<string>(STORAGE_KEYS.WALLET_ADDRESS)
    if (savedWallet) {
      this.userId = savedWallet
    }

    // Create new session
    this.currentSession = {
      id: generateSessionId(),
      userId: this.userId,
      video: metadata,
      startedAt: Date.now(),
      endedAt: null,
      watchedSegments: [],
      totalWatchTime: 0,
      seekEvents: [],
      speedChanges: [],
      focusEvents: [],
      pauseCount: 0,
      averageSpeed: 1,
      maxSpeed: 1,
      tabActiveTime: 0,
      tabInactiveTime: 0,
      isCompleted: false
    }

    // Start trackers
    this.engagementMonitor = new EngagementMonitor(video)
    this.engagementMonitor.start()
    this.focusTracker.start()

    // Persist and start sync interval
    await this.persistSession()
    this.startSyncInterval()

    console.log(
      `[Monarch] Session started: ${metadata.title} (${this.currentSession.id})`
    )

    return this.currentSession
  }

  /**
   * End the current watch session.
   * Finalizes all data and syncs to background.
   */
  async endSession(): Promise<WatchSession | null> {
    if (!this.currentSession) return null

    // Stop trackers
    this.engagementMonitor?.stop()
    this.focusTracker.stop()

    // Finalize session data
    this.snapshotSessionData()
    this.currentSession.endedAt = Date.now()
    this.currentSession.isCompleted = this.checkCompletion()

    // Sync to background and persist
    await this.syncToBackground()
    await this.persistSession()

    // Stop sync interval
    this.stopSyncInterval()

    const finishedSession = { ...this.currentSession }

    console.log(
      `[Monarch] Session ended: ${finishedSession.video.title} ` +
      `(watched ${Math.round(finishedSession.totalWatchTime)}s / ${Math.round(finishedSession.video.duration)}s)`
    )

    // Cleanup
    this.engagementMonitor?.destroy()
    this.engagementMonitor = null
    this.currentSession = null

    return finishedSession
  }

  /** Get the current active session snapshot */
  getCurrentSession(): WatchSession | null {
    if (!this.currentSession) return null
    this.snapshotSessionData()
    return { ...this.currentSession }
  }

  /** Send current session data to the background worker */
  async syncToBackground(): Promise<void> {
    if (!this.currentSession) return

    this.snapshotSessionData()

    try {
      await sendToBackground({
        name: "session-update" as never,
        body: {
          session: { ...this.currentSession }
        }
      })
    } catch (err) {
      console.warn("[Monarch] Failed to sync session to background:", err)
    }
  }

  /** Update the video element (e.g., after YouTube SPA navigation) */
  updateVideoElement(video: HTMLVideoElement, metadata: VideoMetadata): void {
    // If same video, just update the monitor's reference
    if (
      this.currentSession &&
      this.currentSession.video.videoId === metadata.videoId
    ) {
      // Video element might be new DOM node but same video — re-attach
      this.engagementMonitor?.stop()
      this.engagementMonitor?.destroy()
      this.engagementMonitor = new EngagementMonitor(video)
      this.engagementMonitor.start()
      return
    }

    // Different video — end old session and start new one
    this.startSession(video, metadata)
  }

  /** Set the user ID (e.g., after wallet connection) */
  setUserId(userId: string): void {
    this.userId = userId
    if (this.currentSession) {
      this.currentSession.userId = userId
    }
  }

  // ── Private methods ──

  /** Snapshot engagement + focus data into the current session */
  private snapshotSessionData(): void {
    if (!this.currentSession) return

    if (this.engagementMonitor) {
      const engagement = this.engagementMonitor.getSessionData()
      this.currentSession.watchedSegments = engagement.watchedSegments
      this.currentSession.seekEvents = engagement.seekEvents
      this.currentSession.speedChanges = engagement.speedChanges
      this.currentSession.pauseCount = engagement.pauseCount
      this.currentSession.averageSpeed = engagement.averageSpeed
      this.currentSession.maxSpeed = engagement.maxSpeed
      this.currentSession.totalWatchTime = engagement.totalWatchTime
    }

    this.currentSession.focusEvents = this.focusTracker.getEvents()
    this.currentSession.tabActiveTime = this.focusTracker.getActiveTime()
    this.currentSession.tabInactiveTime = this.focusTracker.getInactiveTime()
  }

  /** Check if the video was watched to sufficient completion */
  private checkCompletion(): boolean {
    if (!this.currentSession) return false
    const { totalWatchTime, video } = this.currentSession
    if (video.duration === 0) return false
    return totalWatchTime / video.duration >= 0.9
  }

  /** Persist current session to @plasmohq/storage */
  private async persistSession(): Promise<void> {
    if (!this.currentSession) return

    try {
      await this.storage.set(
        STORAGE_KEYS.ACTIVE_SESSION,
        JSON.stringify(this.currentSession)
      )
    } catch (err) {
      console.warn("[Monarch] Failed to persist session:", err)
    }
  }

  /** Start periodic sync interval */
  private startSyncInterval(): void {
    this.stopSyncInterval()
    this.syncInterval = setInterval(() => {
      this.syncToBackground()
      this.persistSession()
    }, SYNC_INTERVAL_MS)
  }

  /** Stop periodic sync interval */
  private stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
}

/** Generate a unique session ID */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `cs_${timestamp}_${random}`
}
