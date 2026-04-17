import { useEffect, type ReactNode } from 'react'
import { useAppState } from '../store/appStore'
import { fetchAuthSession, refreshAccessToken } from './auth-api'
import { consumeOAuthHash, getRefreshToken, getAccessToken } from './session'

function prewarmImage(url: string | null | undefined) {
  if (!url) return
  const src = url.trim()
  if (!src) return
  const img = new Image()
  img.decoding = 'async'
  img.src = src
}

/** Check if access token is expired (JWT exp claim). */
function isAccessTokenExpired(token: string): boolean {
  try {
    const part = token.split('.')[1]
    if (!part) return true
    const padded = part + '='.repeat((4 - (part.length % 4)) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json) as { exp?: number }
    if (typeof payload.exp !== 'number') return true
    const now = Math.floor(Date.now() / 1000)
    return payload.exp <= now
  } catch {
    return true
  }
}

/**
 * Hydrates profile UI from `GET /api/auth/session` and reacts to token changes.
 * OAuth / magic-link redirects put tokens in `location.hash`; `consumeOAuthHash` persists them.
 * Automatically refreshes access tokens every 50 minutes to keep sessions alive.
 */
export function AuthSync({ children }: { children: ReactNode }) {
  useEffect(() => {
    const onHashError = (ev: Event) => {
      const msg = (ev as CustomEvent<{ message: string }>).detail?.message
      if (msg) {
        useAppState.setState({ showSignIn: true, signInRedirectError: msg })
      }
    }
    window.addEventListener('buzo-auth-hash-error', onHashError)
    consumeOAuthHash()

    let cancelled = false
    const sync = async () => {
      try {
        const { user, profile } = await fetchAuthSession()
        if (cancelled) return
        prewarmImage(profile?.avatar_url)
        useAppState.getState().applySupabaseSession(user, profile)
      } catch {
        if (!cancelled) {
          const state = useAppState.getState()
          // If user was on profile tab when session expired, redirect to discover
          if (state.tab === 'profile' && state.isAuthenticated) {
            state.setTab('discover')
            state.applySupabaseSession(null, null)
            // Show sign-in sheet with logout message
            setTimeout(() => {
              useAppState.setState({ 
                showSignIn: true, 
                signInRedirectError: 'Your session has expired. Please sign in again.' 
              })
            }, 300)
          } else {
            state.applySupabaseSession(null, null)
          }
        }
      }
    }

    // On app load: refresh token if expired (handles users returning after closing app)
    const init = async () => {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()
      if (accessToken && refreshToken && isAccessTokenExpired(accessToken)) {
        await refreshAccessToken()
      }
      void sync()
    }

    void init()

    const onAuth = () => void sync()
    window.addEventListener('buzo-auth-changed', onAuth)

    // Auto-refresh tokens every 50 minutes (Supabase JWTs expire after 1 hour)
    const refreshInterval = setInterval(async () => {
      if (!getRefreshToken()) return
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        void sync()
      }
    }, 50 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(refreshInterval)
      window.removeEventListener('buzo-auth-changed', onAuth)
      window.removeEventListener('buzo-auth-hash-error', onHashError)
    }
  }, [])

  return children
}
