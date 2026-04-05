import { create } from 'zustand'
import { DEFAULT_LOCATION_CITY_ID } from '../data/locationRegions'
import type { Tab, Theme } from '../types'

const WELCOME_SESSION_KEY = 'buzo-welcome-dismissed'

function readWelcomeDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  try {
    return window.sessionStorage.getItem(WELCOME_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function persistWelcomeDismissed() {
  try {
    window.sessionStorage.setItem(WELCOME_SESSION_KEY, '1')
  } catch {
    /* ignore quota / private mode */
  }
}

function clearWelcomeDismissedPersisted() {
  try {
    window.sessionStorage.removeItem(WELCOME_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export type UserProfile = {
  displayName: string
  /** Handle without leading @ */
  username: string
  bio: string
  avatarUrl: string
}

const defaultUserProfile: UserProfile = {
  displayName: 'Vincenzo K',
  username: 'VINCENZO_K',
  bio: '',
  avatarUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
}

export type PendingPlanDetail = {
  id: string
  kind: 'upcoming' | 'past'
  /** If set, leaving this detail (back) restores this tab instead of staying on Plan. */
  returnTab?: Tab
}

export type SubscriptionTier = 'basic' | 'pro'

type AppState = {
  userProfile: UserProfile
  /** After the Layla-style welcome, user can explore before optional sign-in. */
  welcomeDismissed: boolean
  /** Demo flag — replace with real session. */
  isAuthenticated: boolean
  tab: Tab
  theme: Theme
  /** Which plan the signed-in user is on (drives subscription screen highlights). */
  subscriptionTier: SubscriptionTier
  activeEventId: string | null
  /** When set, Plan tab opens this detail (same as tapping a plan list card). */
  pendingPlanDetail: PendingPlanDetail | null
  /** Feed location pill — Plan explore detail defaults country/city filter to this. */
  feedLocationCityId: string
  showBuzzPoints: boolean
  showSettings: boolean
  showLanguage: boolean
  showPrivacySafety: boolean
  showFeedback: boolean
  showEmailLogin: boolean
  /** Pre-app sign-in sheet from the welcome screen. */
  showSignIn: boolean
  showEditProfile: boolean
  showSubscription: boolean
  dismissWelcome: () => void
  openSignIn: () => void
  closeSignIn: () => void
  /** Demo only — call after OAuth / email auth succeeds. */
  completeSignInDemo: () => void
  /** Sign out demo session and show the pre-login welcome again. */
  returnToLanding: () => void
  setTab: (tab: Tab) => void
  setTheme: (theme: Theme) => void
  openEvent: (eventId: string) => void
  closeEvent: () => void
  requestPlanDetail: (
    eventId: string,
    kind?: 'upcoming' | 'past',
    returnTab?: Tab,
  ) => void
  clearPendingPlanDetail: () => void
  openBuzzPoints: () => void
  closeBuzzPoints: () => void
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
  openEditProfile: () => void
  closeEditProfile: () => void
  openSubscription: () => void
  closeSubscription: () => void
  setUserProfile: (patch: Partial<UserProfile>) => void
  setSubscriptionTier: (tier: SubscriptionTier) => void
  setFeedLocationCityId: (cityId: string) => void
  isDiscoverExpanded: boolean
  toggleDiscoverExpanded: () => void
}

export const useAppState = create<AppState>((set) => ({
  userProfile: defaultUserProfile,
  welcomeDismissed: readWelcomeDismissed(),
  isAuthenticated: false,
  tab: 'discover',
  theme: 'dark',
  subscriptionTier: 'pro',
  activeEventId: null,
  pendingPlanDetail: null,
  feedLocationCityId: DEFAULT_LOCATION_CITY_ID,
  showBuzzPoints: false,
  showSettings: false,
  showLanguage: false,
  showPrivacySafety: false,
  showFeedback: false,
  showEmailLogin: false,
  showSignIn: false,
  showEditProfile: false,
  showSubscription: false,
  isDiscoverExpanded: false,
  dismissWelcome: () => {
    persistWelcomeDismissed()
    set({ welcomeDismissed: true, showSignIn: false })
  },
  openSignIn: () => set({ showSignIn: true }),
  closeSignIn: () => set({ showSignIn: false }),
  completeSignInDemo: () => {
    persistWelcomeDismissed()
    set({
      welcomeDismissed: true,
      isAuthenticated: true,
      showSignIn: false,
      tab: 'discover',
    })
  },
  returnToLanding: () => {
    clearWelcomeDismissedPersisted()
    set({
      welcomeDismissed: false,
      isAuthenticated: false,
      showSignIn: false,
      tab: 'discover',
      activeEventId: null,
      pendingPlanDetail: null,
      showBuzzPoints: false,
      showSettings: false,
      showLanguage: false,
      showPrivacySafety: false,
      showFeedback: false,
      showEmailLogin: false,
      showEditProfile: false,
      showSubscription: false,
    })
  },
  setTab: (tab) => set({ tab }),
  setTheme: (theme) => set({ theme }),
  openEvent: (eventId) => set({ activeEventId: eventId }),
  closeEvent: () => set({ activeEventId: null }),
  requestPlanDetail: (eventId, kind = 'upcoming', returnTab) =>
    set({
      pendingPlanDetail: {
        id: eventId,
        kind,
        ...(returnTab != null ? { returnTab } : {}),
      },
    }),
  clearPendingPlanDetail: () => set({ pendingPlanDetail: null }),
  openBuzzPoints: () => set({ showBuzzPoints: true }),
  closeBuzzPoints: () => set({ showBuzzPoints: false }),
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
  openEditProfile: () => set({ showEditProfile: true }),
  closeEditProfile: () => set({ showEditProfile: false }),
  openSubscription: () => set({ showSubscription: true }),
  closeSubscription: () => set({ showSubscription: false }),
  setUserProfile: (patch) =>
    set((s) => ({ userProfile: { ...s.userProfile, ...patch } })),
  setSubscriptionTier: (subscriptionTier) => set({ subscriptionTier }),
  setFeedLocationCityId: (feedLocationCityId) => set({ feedLocationCityId }),
  toggleDiscoverExpanded: () => set((s) => ({ isDiscoverExpanded: !s.isDiscoverExpanded })),
}))
