export type Tab = 'feed' | 'explore' | 'plan' | 'profile'
export type Theme = 'dark' | 'light'

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
