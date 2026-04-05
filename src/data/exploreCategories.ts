/**
 * Plan “Explore events” category metadata (labels, demo counts).
 * Pair with icon map in `PlanExploreEvents` / filtering via `EventItem.exploreCategoryId`.
 */

export type ExploreCategoryDef = {
  id: string
  label: string
  countLabel: string
  accent: string
}

export const EXPLORE_CATEGORY_DEFS: ExploreCategoryDef[] = [
  { id: 'live-music', label: 'Live Music', countLabel: '5K events', accent: '#ca8a04' },
  { id: 'club-nights', label: 'Club Nights', countLabel: '4K events', accent: '#db2777' },
  { id: 'jazz-blues', label: 'Jazz & Blues', countLabel: '2K events', accent: '#ea580c' },
  { id: 'underground', label: 'Underground', countLabel: '1K events', accent: '#16a34a' },
  { id: 'arts', label: 'Arts & Culture', countLabel: '2K events', accent: '#059669' },
  { id: 'food', label: 'Food & Drink', countLabel: '3K events', accent: '#e11d48' },
  { id: 'popups', label: 'Pop-ups', countLabel: '800 events', accent: '#0d9488' },
  { id: 'festivals', label: 'Festivals', countLabel: '120 events', accent: '#9333ea' },
]

export function getExploreCategoryDef(categoryId: string): ExploreCategoryDef | undefined {
  return EXPLORE_CATEGORY_DEFS.find((c) => c.id === categoryId)
}
