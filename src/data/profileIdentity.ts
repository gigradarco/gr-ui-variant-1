import type { LucideIcon } from 'lucide-react'
import { Building2, Crown, Flame, Headphones, Moon, Music, Star, Trophy, Zap } from 'lucide-react'

export type TasteAccent = true | false | 'muted'

export type TasteIdentityItem = {
  label: string
  accent: TasteAccent
}

/** Profile section, full-screen list, and Settings — keep in sync. */
export const TASTE_AND_RECOMMENDATIONS_TITLE = 'Taste & recommendations'

/** Cycles tag style when editing: default → primary → muted → default. */
export function cycleTasteAccent(accent: TasteAccent): TasteAccent {
  if (accent === false) return true
  if (accent === true) return 'muted'
  return false
}

/** Full taste map — profile preview shows a slice. */
export const tasteIdentityTags: TasteIdentityItem[] = [
  { label: 'DARK DISCO', accent: true },
  { label: 'MINIMAL TECHNO', accent: false },
  { label: 'INDUSTRIAL', accent: false },
  { label: 'EBM', accent: false },
  { label: 'POST-PUNK', accent: 'muted' },
  { label: 'ACID HOUSE', accent: false },
  { label: 'ITALO DISCO', accent: false },
  { label: 'NEW BEAT', accent: false },
  { label: 'SYNTHWAVE', accent: false },
  { label: 'TECH HOUSE', accent: false },
  { label: 'DEEP HOUSE', accent: 'muted' },
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
  if (accent === 'muted') return 'muted'
  if (accent === 'true') return true
  return false
}

export function tasteAccentToDb(accent: TasteAccent): 'true' | 'false' | 'muted' {
  if (accent === 'muted') return 'muted'
  if (accent === true) return 'true'
  return 'false'
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

/** How many tags/badges to show on the main profile when not editing taste. */
export const PROFILE_TASTE_PREVIEW_COUNT = 6
export const PROFILE_REPUTATION_PREVIEW_COUNT = 5
