import { create } from 'zustand'
import type { Tab, Theme } from '../types'

type AppState = {
  tab: Tab
  theme: Theme
  activeEventId: string | null
  showGigHistory: boolean
  showSettings: boolean
  showLanguage: boolean
  showPrivacySafety: boolean
  showFeedback: boolean
  showEmailLogin: boolean
  setTab: (tab: Tab) => void
  setTheme: (theme: Theme) => void
  openEvent: (eventId: string) => void
  closeEvent: () => void
  openGigHistory: () => void
  closeGigHistory: () => void
  openSettings: () => void
  closeSettings: () => void
  openLanguage: () => void
  closeLanguage: () => void
  openPrivacySafety: () => void
  closePrivacySafety: () => void
  openFeedback: () => void
  closeFeedback: () => void
  openEmailLogin: () => void
  closeEmailLogin: () => void
}

export const useAppState = create<AppState>((set) => ({
  tab: 'feed',
  theme: 'dark',
  activeEventId: null,
  showGigHistory: false,
  showSettings: false,
  showLanguage: false,
  showPrivacySafety: false,
  showFeedback: false,
  showEmailLogin: false,
  setTab: (tab) => set({ tab }),
  setTheme: (theme) => set({ theme }),
  openEvent: (eventId) => set({ activeEventId: eventId }),
  closeEvent: () => set({ activeEventId: null }),
  openGigHistory: () => set({ showGigHistory: true }),
  closeGigHistory: () => set({ showGigHistory: false }),
  openSettings: () => set({ showSettings: true }),
  closeSettings: () => set({ showSettings: false }),
  openLanguage: () => set({ showLanguage: true }),
  closeLanguage: () => set({ showLanguage: false }),
  openPrivacySafety: () => set({ showPrivacySafety: true }),
  closePrivacySafety: () => set({ showPrivacySafety: false }),
  openFeedback: () => set({ showFeedback: true }),
  closeFeedback: () => set({ showFeedback: false }),
  openEmailLogin: () => set({ showEmailLogin: true }),
  closeEmailLogin: () => set({ showEmailLogin: false }),
}))
