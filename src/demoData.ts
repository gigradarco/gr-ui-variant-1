import type { EventItem } from './types'

export const events: EventItem[] = [
  {
    id: 'marquee',
    title: 'Marquee Singapore',
    venue: 'Marquee',
    district: 'Clarke Quay',
    time: '22:30',
    genre: 'Techno',
    verified: 89,
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    host: 'Marcus',
    hostPrompt: 'any techno in Clarke Quay tonight?',
    friendsGoing: 2,
    vibeTags: ['Warehouse', 'Peak Energy'],
    ticketPrice: '$42.00',
  },
  {
    id: 'bluenote',
    title: 'The Blue Note Session',
    venue: 'BeBop Lounge',
    district: 'Tiong Bahru',
    time: '22:00',
    genre: 'Jazz',
    verified: 94,
    image:
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    host: 'Sarah Chen',
    hostPrompt: "who's down for some deep house tonight?",
    friendsGoing: 3,
    vibeTags: ['Intimate', 'Vinyl Audio'],
    ticketPrice: '$35.00',
  },
  {
    id: 'neonpulse',
    title: 'Neon Pulse: Architects',
    venue: 'The Obsidian Vault',
    district: 'Downtown Core',
    time: '23:00',
    genre: 'Electronic',
    verified: 92,
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    host: 'Alex Chen',
    hostPrompt: 'closing set is supposed to be unreal tonight.',
    friendsGoing: 4,
    vibeTags: ['Live Visuals', 'Hard Groove'],
    ticketPrice: '$45.00',
  },
]

export const exploreTargetPrompt = 'any good jazz tonight near tiong bahru ?'

export const exploreSuggestedPrompts = [
  'any good jazz tonight near Tiong Bahru ?',
  'best techno tonight in Clarke Quay?',
  'who is going to neon pulse tonight?',
]

export const feedSuggestedPrompts = [
  'Any good jazz tonight near Tiong Bahru?',
  'Best techno tonight in Clarke Quay?',
  'Rooftop vibes with friends tonight?',
]

export const telegramBotLink = 'http://t.me/gigradar123_bot?start=hello'
