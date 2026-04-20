import { create } from 'zustand'
import {
  buildTasteIdentityItemsFromSession,
  cycleTasteAccent,
  getDefaultTasteIdentityItems,
  type TasteCategoryRow,
  type TasteIdentityItem,
} from '../data/profileIdentity'
import { DEFAULT_LOCATION_CITY_ID, getLocationCityById } from '../data/locationRegions'
import { schedulePersistUserTasteCategories } from '../lib/persist-user-taste'
import type { Tab, Theme } from '../types'

const WELCOME_SESSION_KEY = 'buzo-welcome-dismissed'
const DEFAULT_CITY_STORAGE_KEY = 'buzo-default-city-id'
const FAVORITES_STORAGE_KEY = 'buzo-favorite-events'

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

function readPersistedDefaultCityId(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCATION_CITY_ID
  try {
    const cityId = window.localStorage.getItem(DEFAULT_CITY_STORAGE_KEY)
    if (cityId && getLocationCityById(cityId)) return cityId
  } catch {
    /* ignore storage failure */
  }
  return DEFAULT_LOCATION_CITY_ID
}

function persistDefaultCityId(cityId: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DEFAULT_CITY_STORAGE_KEY, cityId)
  } catch {
    /* ignore quota / private mode */
  }
}

function clearPersistedDefaultCityId() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(DEFAULT_CITY_STORAGE_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

export type FavoriteEvent = {
  id: string
  title: string
  venueLine: string
  timeLabel: string
  image: string
  variant: 'upcoming' | 'past'
}

function readPersistedFavoriteEvents(): FavoriteEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((row): row is FavoriteEvent => {
        if (!row || typeof row !== 'object') return false
        const r = row as Record<string, unknown>
        return (
          typeof r.id === 'string' &&
          typeof r.title === 'string' &&
          typeof r.venueLine === 'string' &&
          typeof r.timeLabel === 'string' &&
          typeof r.image === 'string' &&
          (r.variant === 'upcoming' || r.variant === 'past')
        )
      })
      .slice(0, 100)
  } catch {
    return []
  }
}

function persistFavoriteEvents(items: FavoriteEvent[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore quota / private mode */
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
  username: 'vincenzo_k',
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
export type LocationPreferenceMode = 'precise' | 'city'
export type LocationPermissionState = 'unknown' | 'granted' | 'denied'
export type LocationSettingsDraft = {
  cityId: string
  mode: LocationPreferenceMode
  radiusKm: number
}

/** Section to scroll to when opening scene stats from profile. */
export type ProfileStatsFocus = 'cities' | 'gigs' | 'genres'

/** Auth user from `GET /api/auth/session` (no Supabase client in the browser). */
export type AuthUserPayload = {
  id: string
  email?: string | null
  is_anonymous?: boolean
  user_metadata?: Record<string, unknown>
}

type AppState = {
  userProfile: UserProfile
  /** After the Layla-style welcome, user can explore before optional sign-in. */
  welcomeDismissed: boolean
  /** Show "Welcome Back" transition screen after successful sign-in */
  showWelcomeBack: boolean
  /** Demo flag — replace with real session. */
  isAuthenticated: boolean
  /** Email from auth session for signed-in (non-anonymous) users; null otherwise. */
  authEmail: string | null
  tab: Tab
  theme: Theme
  /** Which plan the signed-in user is on (drives subscription screen highlights). */
  subscriptionTier: SubscriptionTier
  activeEventId: string | null
  /** When set, Plan tab opens this detail (same as tapping a plan list card). */
  pendingPlanDetail: PendingPlanDetail | null
  favoriteEvents: FavoriteEvent[]
  /** Feed location pill — Plan explore detail defaults country/city filter to this. */
  feedLocationCityId: string
  /** Nullable profile-level default city preference from local storage / profiles.default_city_id. */
  profileDefaultCityId: string | null
  /** Location preference for discovery when precise position is available. */
  locationPreferenceMode: LocationPreferenceMode
  /** Radius used when locationPreferenceMode = 'precise'. */
  nearbyRadiusKm: number
  /** Browser location permission state tracked from settings flow. */
  locationPermission: LocationPermissionState
  /** Staged edits from Location settings; committed only when user taps Save. */
  locationSettingsDraft: LocationSettingsDraft | null
  showBuzzPoints: boolean
  /** Editable copy of demo taste tags — profile + taste screen read this. */
  tasteIdentityItems: TasteIdentityItem[]
  showProfileTasteAll: boolean
  showProfileReputationAll: boolean
  showProfileStats: boolean
  /** When non-null, stats screen scrolls to this block after open. */
  profileStatsFocus: ProfileStatsFocus | null
  showSettings: boolean
  showLocationSettings: boolean
  showLocationCityPicker: boolean
  showLanguage: boolean
  showPrivacySafety: boolean
  showPrivacyPolicy: boolean
  showFeedback: boolean
  showEmailLogin: boolean
  /** Pre-app sign-in sheet from the welcome screen. */
  showSignIn: boolean
  /** Set when magic link / OAuth redirect returns #error (shown in the sign-in sheet). */
  signInRedirectError: string | null
  showEditProfile: boolean
  showSubscription: boolean
  dismissWelcome: () => void
  dismissWelcomeBack: () => void
  openSignIn: () => void
  closeSignIn: () => void
  /** Demo only — call after OAuth / email auth succeeds. */
  completeSignInDemo: () => void
  /**
   * Sync UI from auth user + optional `profiles` row (from backend).
   * `isAuthenticated` is true only for non-anonymous users (Google / email).
   */
  applySupabaseSession: (
    user: AuthUserPayload | null,
    profile?: {
      display_name?: string | null
      username?: string | null
      avatar_url?: string | null
      bio?: string | null
      default_city_id?: string | null
      user_taste_categories?: Array<{ label: string; accent: string }> | null
    } | null,
    options?: { isFreshSignIn?: boolean; tasteCategories?: TasteCategoryRow[] },
  ) => void
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
  toggleFavoriteEvent: (event: FavoriteEvent) => void
  isEventFavorited: (eventId: string) => boolean
  openBuzzPoints: () => void
  closeBuzzPoints: () => void
  openProfileTasteAll: () => void
  closeProfileTasteAll: () => void
  cycleTasteIdentityTag: (label: string) => void
  openProfileReputationAll: () => void
  closeProfileReputationAll: () => void
  openProfileStats: (focus?: ProfileStatsFocus | null) => void
  closeProfileStats: () => void
  openSettings: () => void
  closeSettings: () => void
  openLocationSettings: () => void
  closeLocationSettings: () => void
  openLocationCityPicker: () => void
  closeLocationCityPicker: () => void
  updateLocationSettingsDraft: (patch: Partial<LocationSettingsDraft>) => void
  commitLocationSettingsDraft: () => void
  openLanguage: () => void
  closeLanguage: () => void
  openPrivacySafety: () => void
  closePrivacySafety: () => void
  openPrivacyPolicy: () => void
  closePrivacyPolicy: () => void
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
  setLocationPreferenceMode: (mode: LocationPreferenceMode) => void
  setNearbyRadiusKm: (km: number) => void
  setLocationPermission: (permission: LocationPermissionState) => void
  isDiscoverExpanded: boolean
  toggleDiscoverExpanded: () => void
}

export const useAppState = create<AppState>((set, get) => ({
  userProfile: defaultUserProfile,
  welcomeDismissed: readWelcomeDismissed(),
  showWelcomeBack: false,
  isAuthenticated: false,
  authEmail: null,
  tab: 'discover',
  theme: 'dark',
  subscriptionTier: 'pro',
  activeEventId: null,
  pendingPlanDetail: null,
  favoriteEvents: readPersistedFavoriteEvents(),
  feedLocationCityId: readPersistedDefaultCityId() ?? DEFAULT_LOCATION_CITY_ID,
  profileDefaultCityId: readPersistedDefaultCityId(),
  locationPreferenceMode: 'city',
  nearbyRadiusKm: 3,
  locationPermission: 'unknown',
  locationSettingsDraft: null,
  showBuzzPoints: false,
  tasteIdentityItems: getDefaultTasteIdentityItems(),
  showProfileTasteAll: false,
  showProfileReputationAll: false,
  showProfileStats: false,
  profileStatsFocus: null,
  showSettings: false,
  showLocationSettings: false,
  showLocationCityPicker: false,
  showLanguage: false,
  showPrivacySafety: false,
  showPrivacyPolicy: false,
  showFeedback: false,
  showEmailLogin: false,
  showSignIn: false,
  signInRedirectError: null,
  showEditProfile: false,
  showSubscription: false,
  isDiscoverExpanded: false,
  dismissWelcome: () => {
    persistWelcomeDismissed()
    set({ welcomeDismissed: true, showSignIn: false, signInRedirectError: null })
  },
  dismissWelcomeBack: () => set({ showWelcomeBack: false }),
  openSignIn: () => set({ showSignIn: true, signInRedirectError: null }),
  closeSignIn: () => set({ showSignIn: false, signInRedirectError: null }),
  completeSignInDemo: () => {
    persistWelcomeDismissed()
    set({
      welcomeDismissed: true,
      isAuthenticated: true,
      showSignIn: false,
      signInRedirectError: null,
      tab: 'discover',
    })
  },
  applySupabaseSession: (user, profile, options) => {
    if (!user) {
      set({
        isAuthenticated: false,
        userProfile: defaultUserProfile,
        authEmail: null,
        tasteIdentityItems: getDefaultTasteIdentityItems(),
        profileDefaultCityId: readPersistedDefaultCityId(),
      })
      return
    }

    const u = user
    const isRealUser = !u.is_anonymous
    const authEmail = isRealUser ? (u.email?.trim() || null) : null
    const isFreshSignIn = options?.isFreshSignIn === true
    const meta = (u.user_metadata ?? {}) as Record<string, string | undefined>
    const displayName =
      profile?.display_name?.trim() ||
      meta.full_name ||
      meta.name ||
      u.email?.split('@')[0] ||
      defaultUserProfile.displayName
    const usernameFromProfile = profile?.username?.trim().replace(/^@+/, '').toLowerCase() ?? ''
    const usernameFromMeta = meta.username?.trim().replace(/^@+/, '').toLowerCase() ?? ''
    const usernameFromDisplay = displayName
      .replace(/\s+/g, '_')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
    const username =
      usernameFromProfile ||
      usernameFromMeta ||
      usernameFromDisplay ||
      defaultUserProfile.username
    const avatarUrl =
      profile?.avatar_url?.trim() ||
      meta.avatar_url ||
      defaultUserProfile.avatarUrl
    const bio = profile?.bio?.trim() ?? ''
    const sessionDefaultCityId = profile?.default_city_id?.trim() ?? ''
    const resolvedDefaultCityId =
      sessionDefaultCityId && getLocationCityById(sessionDefaultCityId) ? sessionDefaultCityId : null
    if (resolvedDefaultCityId) {
      persistDefaultCityId(resolvedDefaultCityId)
    } else if (isRealUser) {
      clearPersistedDefaultCityId()
    }

    const catalog = options?.tasteCategories ?? []
    const tasteIdentityItems = buildTasteIdentityItemsFromSession(
      isRealUser,
      catalog,
      profile?.user_taste_categories,
    )

    const wasAuthenticated = get().isAuthenticated
    set({
      isAuthenticated: isRealUser,
      authEmail,
      userProfile: {
        displayName,
        username,
        bio,
        avatarUrl,
      },
      profileDefaultCityId: resolvedDefaultCityId,
      ...(resolvedDefaultCityId ? { feedLocationCityId: resolvedDefaultCityId } : {}),
      tasteIdentityItems,
      ...(isRealUser
        ? {
            showSignIn: false,
            signInRedirectError: null,
            welcomeDismissed: true,
            // Only set true here — do not set false on every session poll (Strict Mode 2nd mount / refresh sync).
            ...(isFreshSignIn && !wasAuthenticated ? { showWelcomeBack: true } : {}),
            tab: 'discover' as Tab,
          }
        : {}),
    })

    if (isRealUser) {
      persistWelcomeDismissed()
    }
  },
  returnToLanding: () => {
    clearWelcomeDismissedPersisted()
    set({
      welcomeDismissed: false,
      isAuthenticated: false,
      authEmail: null,
      showSignIn: false,
      signInRedirectError: null,
      tab: 'discover',
      activeEventId: null,
      pendingPlanDetail: null,
      showBuzzPoints: false,
      tasteIdentityItems: getDefaultTasteIdentityItems(),
      showProfileTasteAll: false,
      showProfileReputationAll: false,
      showProfileStats: false,
      profileStatsFocus: null,
      showSettings: false,
      showLocationSettings: false,
      showLocationCityPicker: false,
      locationSettingsDraft: null,
      showLanguage: false,
      showPrivacySafety: false,
      showPrivacyPolicy: false,
      showFeedback: false,
      showEmailLogin: false,
      showEditProfile: false,
      showSubscription: false,
      profileDefaultCityId: readPersistedDefaultCityId(),
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
  toggleFavoriteEvent: (event) =>
    set((state) => {
      const alreadyFavorited = state.favoriteEvents.some((item) => item.id === event.id)
      const next = alreadyFavorited
        ? state.favoriteEvents.filter((item) => item.id !== event.id)
        : [event, ...state.favoriteEvents.filter((item) => item.id !== event.id)]
      persistFavoriteEvents(next)
      return { favoriteEvents: next }
    }),
  isEventFavorited: (eventId) => get().favoriteEvents.some((item) => item.id === eventId),
  openBuzzPoints: () => set({ showBuzzPoints: true }),
  closeBuzzPoints: () => set({ showBuzzPoints: false }),
  openProfileTasteAll: () => set({ showProfileTasteAll: true }),
  closeProfileTasteAll: () => set({ showProfileTasteAll: false }),
  cycleTasteIdentityTag: (label) => {
    set((s) => ({
      tasteIdentityItems: s.tasteIdentityItems.map((item) =>
        item.label === label ? { ...item, accent: cycleTasteAccent(item.accent) } : item,
      ),
    }))
    schedulePersistUserTasteCategories(
      () => get().tasteIdentityItems,
      () => get().isAuthenticated,
    )
  },
  openProfileReputationAll: () => set({ showProfileReputationAll: true }),
  closeProfileReputationAll: () => set({ showProfileReputationAll: false }),
  openProfileStats: (focus) =>
    set({
      showProfileStats: true,
      profileStatsFocus: focus === undefined ? null : focus,
    }),
  closeProfileStats: () => set({ showProfileStats: false, profileStatsFocus: null }),
  openSettings: () => set({ showSettings: true }),
  closeSettings: () => set({ showSettings: false }),
  openLocationSettings: () =>
    set((state) => ({
      showLocationSettings: true,
      locationSettingsDraft: {
        cityId: state.feedLocationCityId,
        mode: state.locationPreferenceMode,
        radiusKm: state.nearbyRadiusKm,
      },
    })),
  closeLocationSettings: () =>
    set({
      showLocationSettings: false,
      showLocationCityPicker: false,
      locationSettingsDraft: null,
    }),
  openLocationCityPicker: () => set({ showLocationCityPicker: true }),
  closeLocationCityPicker: () => set({ showLocationCityPicker: false }),
  updateLocationSettingsDraft: (patch) =>
    set((state) => {
      const current =
        state.locationSettingsDraft ?? {
          cityId: state.feedLocationCityId,
          mode: state.locationPreferenceMode,
          radiusKm: state.nearbyRadiusKm,
        }
      return { locationSettingsDraft: { ...current, ...patch } }
    }),
  commitLocationSettingsDraft: () =>
    set((state) => {
      const draft = state.locationSettingsDraft
      if (!draft) {
        return {
          showLocationSettings: false,
          showLocationCityPicker: false,
        }
      }
      persistDefaultCityId(draft.cityId)
      return {
        profileDefaultCityId: draft.cityId,
        feedLocationCityId: draft.cityId,
        locationPreferenceMode: draft.mode,
        nearbyRadiusKm: draft.radiusKm,
        showLocationSettings: false,
        showLocationCityPicker: false,
        locationSettingsDraft: null,
      }
    }),
  openLanguage: () => set({ showLanguage: true }),
  closeLanguage: () => set({ showLanguage: false }),
  openPrivacySafety: () => set({ showPrivacySafety: true }),
  closePrivacySafety: () => set({ showPrivacySafety: false, showPrivacyPolicy: false }),
  openPrivacyPolicy: () => set({ showPrivacyPolicy: true }),
  closePrivacyPolicy: () => set({ showPrivacyPolicy: false }),
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
  setFeedLocationCityId: (feedLocationCityId) => {
    persistDefaultCityId(feedLocationCityId)
    set({ feedLocationCityId })
  },
  setLocationPreferenceMode: (locationPreferenceMode) => set({ locationPreferenceMode }),
  setNearbyRadiusKm: (nearbyRadiusKm) => set({ nearbyRadiusKm }),
  setLocationPermission: (locationPermission) =>
    set((state) => ({
      locationPermission,
      locationPreferenceMode:
        locationPermission === 'denied' ? 'city' : state.locationPreferenceMode,
    })),
  toggleDiscoverExpanded: () => set((s) => ({ isDiscoverExpanded: !s.isDiscoverExpanded })),
}))
