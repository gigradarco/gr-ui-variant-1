import type { LucideIcon } from 'lucide-react'
import { Building2, Crown, Flame, Headphones, Moon, Music, Star, Trophy, Zap } from 'lucide-react'

/** Highlighted on profile (`true`) vs standard chip (`false`). Tap toggles while editing. */
export type TasteAccent = boolean

export type TasteIdentityItem = {
  label: string
  accent: TasteAccent
}

/** Deep compare for skipping no-op taste saves (order matches store / catalog). */
export function tasteIdentityItemsEqual(a: TasteIdentityItem[], b: TasteIdentityItem[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].label !== b[i].label || a[i].accent !== b[i].accent) return false
  }
  return true
}

/** Profile section, full-screen list, and Settings — keep in sync. */
export const TASTE_AND_RECOMMENDATIONS_TITLE = 'Taste & recommendations'

/** Toggle highlight while editing (show on / show off). */
export function cycleTasteAccent(accent: TasteAccent): TasteAccent {
  return !accent
}

/** Full taste map — profile preview shows a slice. */
export const tasteIdentityTags: TasteIdentityItem[] = [
  { label: 'DARK DISCO', accent: true },
  { label: 'MINIMAL TECHNO', accent: false },
  { label: 'INDUSTRIAL', accent: false },
  { label: 'EBM', accent: false },
  { label: 'POST-PUNK', accent: false },
  { label: 'ACID HOUSE', accent: false },
  { label: 'ITALO DISCO', accent: false },
  { label: 'NEW BEAT', accent: false },
  { label: 'SYNTHWAVE', accent: false },
  { label: 'TECH HOUSE', accent: false },
  { label: 'DEEP HOUSE', accent: false },
  { label: 'BREAKBEAT', accent: false },
  { label: 'DRUM & BASS', accent: false },
  { label: 'GABBER', accent: false },
]

export function getDefaultTasteIdentityItems(): TasteIdentityItem[] {
  return tasteIdentityTags.map((t) => ({ ...t }))
}

/** Row from `taste_categories` or session `taste_categories` (snake_case accent strings). */
export type TasteCategoryRow = { label: string; accent: string }

export function tasteAccentFromDb(accent: string): TasteAccent {
  return accent === 'true'
}

export function tasteAccentToDb(accent: TasteAccent): 'true' | 'false' {
  return accent ? 'true' : 'false'
}

/** Merge catalog order + defaults with saved `profiles.user_taste_categories`. */
export function mergeCatalogWithSavedTastes(
  catalog: TasteCategoryRow[],
  saved: Array<{ label: string; accent: string }> | null | undefined,
): TasteIdentityItem[] {
  const byLabel = new Map(
    (saved ?? []).map((s) => [s.label, tasteAccentFromDb(s.accent)] as const),
  )
  const ordered = [...catalog].sort((a, b) => a.label.localeCompare(b.label))
  return ordered.map((row) => ({
    label: row.label,
    accent: byLabel.has(row.label) ? (byLabel.get(row.label) as TasteAccent) : tasteAccentFromDb(row.accent),
  }))
}

/** Session hydration: prefer API catalog; if missing, still apply saved tastes from profile. */
export function buildTasteIdentityItemsFromSession(
  isRealUser: boolean,
  catalog: TasteCategoryRow[],
  saved: Array<{ label: string; accent: string }> | null | undefined,
): TasteIdentityItem[] {
  if (!isRealUser) return getDefaultTasteIdentityItems()
  if (catalog.length > 0) {
    return mergeCatalogWithSavedTastes(catalog, saved)
  }
  const rawSaved = (saved ?? []).filter((s) => s?.label)
  if (rawSaved.length > 0) {
    const byLabel = new Map<string, TasteIdentityItem>()
    for (const s of rawSaved) {
      byLabel.set(s.label, { label: s.label, accent: tasteAccentFromDb(s.accent) })
    }
    for (const d of getDefaultTasteIdentityItems()) {
      if (!byLabel.has(d.label)) byLabel.set(d.label, d)
    }
    return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label))
  }
  return getDefaultTasteIdentityItems()
}

export type ReputationBadgeItem = {
  icon: LucideIcon
  label: string
  accent?: boolean
}

/** Full reputation list — profile preview shows a slice. */
export const reputationBadges: ReputationBadgeItem[] = [
  { icon: Star, label: 'FIRST\nCHECK-IN', accent: true },
  { icon: Building2, label: 'CITY\nCURATOR' },
  { icon: Moon, label: 'NIGHT\nOWL', accent: true },
  { icon: Zap, label: 'STREAK\nMASTER' },
  { icon: Trophy, label: 'LEGEND' },
  { icon: Crown, label: 'SCENE\nROYALTY' },
  { icon: Flame, label: 'DANCEFLOOR\nVIP' },
  { icon: Headphones, label: 'LINEUP\nSAGE' },
  { icon: Music, label: 'RECORD\nVULTURE' },
  { icon: Star, label: 'EARLY\nBIRD' },
]

export const PROFILE_REPUTATION_PREVIEW_COUNT = 5
