import { useEffect, type ReactNode } from 'react'
import { useAppState } from '../store/appStore'
import { fetchAuthSession } from './auth-api'
import { consumeOAuthHash } from './session'

/**
 * Hydrates profile UI from `GET /api/auth/session` and reacts to token changes.
 * OAuth / magic-link redirects put tokens in `location.hash`; `consumeOAuthHash` persists them.
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
        useAppState.getState().applySupabaseSession(user, profile)
      } catch {
        if (!cancelled) useAppState.getState().applySupabaseSession(null, null)
      }
    }

    void sync()

    const onAuth = () => void sync()
    window.addEventListener('buzo-auth-changed', onAuth)
    return () => {
      cancelled = true
      window.removeEventListener('buzo-auth-changed', onAuth)
      window.removeEventListener('buzo-auth-hash-error', onHashError)
    }
  }, [])

  return children
}
