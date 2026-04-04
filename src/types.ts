export type Tab = 'feed' | 'explore' | 'plan' | 'profile'
export type Theme = 'dark' | 'light'

export type GigEntry = {
  id: string
  venue: string
  when: string
  description: string
  attended: boolean
  images: string[]
}

export type EventItem = {
  id: string
  title: string
  venue: string
  district: string
  time: string
  genre: string
  verified: number
  image: string
  host: string
  hostPrompt: string
  friendsGoing: number
  vibeTags: string[]
  ticketPrice: string
}

/** Rich mock for the Plan tab event-detail layout (wireframe). */
export type PlanPageFriend = {
  id: string
  name: string
  avatar: string
  /** Orange ring (e.g. close friends). */
  ring?: boolean
}

/** Row in Plan tab “Past” list (gig history style). */
export type PlanPastEvent = {
  id: string
  title: string
  venue: string
  whenLabel: string
  image: string
}

export type PlanPageEvent = {
  /** Matches `EventItem.id` for upcoming (global sheet). Past rows use `past-*` ids. */
  eventId: string
  heroImage: string
  displayTitle: string
  artistLine: string
  genreTags: [string, string]
  venueLine: string
  timeRange: string
  aiVibeScore: number
  eliteVerifiedCount: number
  eliteStackExtra: number
  experienceParts: {
    before: string
    emphasis: string
    after: string
  }
  audioPreviewLabel: string
  audioCurrent: string
  audioTotal: string
  friendsAttendingCount: number
  friends: PlanPageFriend[]
}
