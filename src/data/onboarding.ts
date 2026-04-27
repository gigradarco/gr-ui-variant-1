import { EXPLORE_CATEGORY_DEFS } from './exploreCategories'

export type OnboardingGenre = {
  /** Same as Discover filter / `EventItem.exploreCategoryId`. */
  id: string
  label: string
  sub: string
}

/** Genre rows on onboarding step 2 — synced with Discover → Filter → Category. */
export const ONBOARDING_GENRES: OnboardingGenre[] = EXPLORE_CATEGORY_DEFS.map((c) => ({
  id: c.id,
  label: c.label,
  sub: c.filterSub,
}))
