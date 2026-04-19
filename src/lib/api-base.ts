/**
 * API origin for tRPC + `/api/*`.
 *
 * **Switch with `VITE_API_MODE`:**
 * - `local` — Omit `VITE_API_LOCAL_URL` or leave it empty for **same-origin + Vite proxy** (recommended;
 *   avoids CORS and localhost vs 127.0.0.1 OAuth issues). Set `VITE_API_LOCAL_URL` only if you must
 *   call the Worker origin directly (e.g. `http://127.0.0.1:8787`).
 * - `cloud` — `VITE_API_CLOUD_URL`, then legacy `VITE_API_BASE_URL`.
 *
 * If `VITE_API_MODE` is unset, legacy behavior: empty `VITE_API_BASE_URL` → proxy; else that URL.
 */
export function apiBase(): string {
  const mode = (import.meta.env.VITE_API_MODE as string | undefined)?.trim().toLowerCase() ?? ''

  if (mode === 'local') {
    const raw = import.meta.env.VITE_API_LOCAL_URL as string | undefined
    if (raw === '') return ''
    const trimmed = raw?.trim() ?? ''
    if (!trimmed) return ''
    return normalizeApiOrigin(trimmed)
  }

  if (mode === 'cloud') {
    const raw =
      (import.meta.env.VITE_API_CLOUD_URL as string | undefined)?.trim() ||
      (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
      ''
    return raw ? normalizeApiOrigin(raw) : ''
  }

  // Legacy: single var
  const legacy = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? ''
  if (!legacy) return ''
  return normalizeApiOrigin(legacy)
}

function normalizeApiOrigin(trimmed: string): string {
  const noTrail = trimmed.replace(/\/$/, '')
  if (/^https?:\/\//i.test(noTrail)) return noTrail
  if (noTrail.startsWith('/')) return noTrail

  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(noTrail)
  const scheme = isLocal ? 'http' : 'https'
  return `${scheme}://${noTrail}`
}
