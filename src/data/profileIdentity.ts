import type { LucideIcon } from 'lucide-react'
import { Building2, Crown, Flame, Headphones, Moon, Music, Star, Trophy, Zap } from 'lucide-react'

export type TasteAccent = true | false | 'muted'

export type TasteIdentityItem = {
  label: string
  accent: TasteAccent
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

/** How many tags/badges to show on the main profile before “Show all”. */
export const PROFILE_TASTE_PREVIEW_COUNT = 6
export const PROFILE_REPUTATION_PREVIEW_COUNT = 5
