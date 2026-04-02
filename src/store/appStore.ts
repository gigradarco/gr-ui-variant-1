import { create } from 'zustand'
import type { Tab, Theme } from '../types'

type AppState = {
  tab: Tab
  theme: Theme
  activeEventId: string | null
  setTab: (tab: Tab) => void
  setTheme: (theme: Theme) => void
  openEvent: (eventId: string) => void
  closeEvent: () => void
}

export const useAppState = create<AppState>((set) => ({
  tab: 'feed',
  theme: 'dark',
  activeEventId: null,
  setTab: (tab) => set({ tab }),
  setTheme: (theme) => set({ theme }),
  openEvent: (eventId) => set({ activeEventId: eventId }),
  closeEvent: () => set({ activeEventId: null }),
}))
