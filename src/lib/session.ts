const AT = 'buzo_access_token'
const RT = 'buzo_refresh_token'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(AT)
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(RT)
  } catch {
    return null
  }
}

export function setTokens(tokens: { access_token: string; refresh_token?: string | null }) {
  try {
    window.localStorage.setItem(AT, tokens.access_token)
    if (tokens.refresh_token) {
      window.localStorage.setItem(RT, tokens.refresh_token)
    }
  } catch {
    /* private mode */
  }
  notifyAuthChanged()
}

export function clearSession() {
  try {
    window.localStorage.removeItem(AT)
    window.localStorage.removeItem(RT)
  } catch {
    /* ignore */
  }
  notifyAuthChanged()
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event('buzo-auth-changed'))
}

function decodeAuthParam(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

function stripUrlToPathAndSearch(): void {
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`,
  )
}

function emitAuthHashError(message: string) {
  window.dispatchEvent(new CustomEvent('buzo-auth-hash-error', { detail: { message } }))
}

/**
 * After Supabase OAuth / magic link, tokens arrive in the URL `#hash` (implicit flow).
 * Some errors also arrive in the hash or `?error=` query. Clears the fragment/query and persists tokens.
 */
export function consumeOAuthHash(): boolean {
  const path = window.location.pathname
  const search = window.location.search

  const sp = new URLSearchParams(search)
  const qErr = sp.get('error_description') ?? sp.get('error')
  if (qErr) {
    window.history.replaceState(null, '', path)
    emitAuthHashError(decodeAuthParam(qErr))
    return false
  }

  const raw = window.location.hash?.replace(/^#/, '')
  if (!raw) return false

  const params = new URLSearchParams(raw)
  const errDesc = params.get('error_description') ?? params.get('error')
  if (errDesc) {
    stripUrlToPathAndSearch()
    emitAuthHashError(decodeAuthParam(errDesc))
    return false
  }

  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  if (!access_token) {
    stripUrlToPathAndSearch()
    return false
  }

  setTokens({ access_token, refresh_token })
  stripUrlToPathAndSearch()
  return true
}
