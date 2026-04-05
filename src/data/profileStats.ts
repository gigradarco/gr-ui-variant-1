/** Demo stats aligned with profile hero numbers (12 / 87 / 24). */

export type ProfileCityVisit = {
  name: string
  country: string
  visits: number
  lastVisit: string
}

export const profileCitiesVisited: ProfileCityVisit[] = [
  { name: 'Singapore', country: 'Singapore', visits: 34, lastVisit: 'Mar 2026' },
  { name: 'Kuala Lumpur', country: 'Malaysia', visits: 12, lastVisit: 'Feb 2026' },
  { name: 'Bangkok', country: 'Thailand', visits: 9, lastVisit: 'Jan 2026' },
  { name: 'Jakarta', country: 'Indonesia', visits: 8, lastVisit: 'Dec 2025' },
  { name: 'Manila', country: 'Philippines', visits: 6, lastVisit: 'Nov 2025' },
  { name: 'Ho Chi Minh City', country: 'Vietnam', visits: 6, lastVisit: 'Oct 2025' },
  { name: 'Tokyo', country: 'Japan', visits: 5, lastVisit: 'Sep 2025' },
  { name: 'Seoul', country: 'South Korea', visits: 4, lastVisit: 'Aug 2025' },
  { name: 'Berlin', country: 'Germany', visits: 4, lastVisit: 'Jul 2025' },
  { name: 'London', country: 'UK', visits: 3, lastVisit: 'Jun 2025' },
  { name: 'Barcelona', country: 'Spain', visits: 2, lastVisit: 'May 2025' },
  { name: 'Amsterdam', country: 'Netherlands', visits: 2, lastVisit: 'Apr 2025' },
]

export type ProfileGigEntry = {
  title: string
  venue: string
  city: string
  date: string
}

/** Recent gigs — hero total is 87. */
export const profileGigsRecent: ProfileGigEntry[] = [
  { title: 'Sunset Techno', venue: 'Warehouse 21', city: 'Singapore', date: '28 Mar 2026' },
  { title: 'Analog Nights', venue: 'The Council', city: 'Singapore', date: '21 Mar 2026' },
  { title: 'Industrial Live', venue: 'KYO', city: 'Kuala Lumpur', date: '14 Mar 2026' },
  { title: 'Deep Sunday', venue: 'Zui', city: 'Singapore', date: '9 Mar 2026' },
  { title: 'EBM All Night', venue: 'Golden Mile Tower', city: 'Singapore', date: '2 Mar 2026' },
  { title: 'Afters x Friends', venue: 'Privé', city: 'Singapore', date: '22 Feb 2026' },
  { title: 'Minimal Showcase', venue: 'Jenja', city: 'Bali', date: '15 Feb 2026' },
  { title: 'Dark Disco', venue: 'TUFF Club', city: 'Singapore', date: '8 Feb 2026' },
]

export const PROFILE_GIGS_TOTAL = 87

export type ProfileGenreStat = {
  label: string
  gigs: number
}

/** Genre footprint — hero shows 24 distinct genres tracked. */
export const profileGenreFootprint: ProfileGenreStat[] = [
  { label: 'Techno', gigs: 22 },
  { label: 'House', gigs: 14 },
  { label: 'EBM / industrial', gigs: 11 },
  { label: 'Disco', gigs: 9 },
  { label: 'Breaks', gigs: 7 },
  { label: 'Trance', gigs: 6 },
  { label: 'Drum & bass', gigs: 5 },
  { label: 'Ambient', gigs: 4 },
  { label: 'Hard dance', gigs: 4 },
  { label: 'Live electronics', gigs: 3 },
  { label: 'Italo / wave', gigs: 3 },
  { label: 'UK garage', gigs: 3 },
  { label: 'Hip-hop clubs', gigs: 2 },
  { label: 'Jazz club nights', gigs: 2 },
  { label: 'Reggae / dub', gigs: 2 },
  { label: 'Funk & soul', gigs: 2 },
  { label: 'Latin club', gigs: 2 },
  { label: 'Pop / mainstream', gigs: 1 },
  { label: 'K-pop nights', gigs: 1 },
  { label: 'Shoegaze live', gigs: 1 },
  { label: 'Metal', gigs: 1 },
  { label: 'Indie rock', gigs: 1 },
  { label: 'Afrobeats', gigs: 1 },
  { label: 'Open format', gigs: 1 },
]

export const PROFILE_GENRES_TRACKED = profileGenreFootprint.length
export const PROFILE_CITIES_COUNT = profileCitiesVisited.length
