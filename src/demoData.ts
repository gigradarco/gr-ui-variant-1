import type { EventItem, GigEntry } from './types'

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

export const gigHistory: GigEntry[] = [
  {
    id: 'g1',
    venue: 'Berghain / Panorama Bar',
    when: 'YESTERDAY',
    description: 'Klockworks Night w/ Ben Klock & Marcel Dettmann',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g2',
    venue: 'Tresor Berlin',
    when: '3 DAYS AGO',
    description: 'Vault Series: Surgeon (Live)',
    attended: false,
    images: [],
  },
  {
    id: 'g3',
    venue: 'Fabric London',
    when: '1 WEEK AGO',
    description: 'Room 1: Objekt b2b Dj Stingray',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g4',
    venue: 'De School Amsterdam',
    when: '2 WEEKS AGO',
    description: 'Closing Party: Dj Stingray 313',
    attended: true,
    images: [],
  },
  {
    id: 'g5',
    venue: 'Robert Johnson Frankfurt',
    when: '3 WEEKS AGO',
    description: 'Zip b2b Move D — all night long',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g6',
    venue: 'Corsica Studios London',
    when: '1 MONTH AGO',
    description: 'Perc Trax Showcase',
    attended: false,
    images: [],
  },
  {
    id: 'g7',
    venue: 'Shelter Amsterdam',
    when: '1 MONTH AGO',
    description: 'Dekmantel Selectors: Palms Trax',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g8',
    venue: 'OHM Berlin',
    when: '6 WEEKS AGO',
    description: 'Oscillate: Blawan Live',
    attended: true,
    images: [],
  },
  {
    id: 'g9',
    venue: 'Printworks London',
    when: '2 MONTHS AGO',
    description: 'Junction 2 presents: Amelie Lens',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g10',
    venue: 'Watergate Berlin',
    when: '2 MONTHS AGO',
    description: 'Innervisions: Dixon & Âme',
    attended: false,
    images: [],
  },
  {
    id: 'g11',
    venue: 'Nitsa Barcelona',
    when: '3 MONTHS AGO',
    description: 'Sonar Off: Paula Temple Live',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g12',
    venue: 'Concrete Paris',
    when: '3 MONTHS AGO',
    description: 'Possession: Rebekah b2b Alignment',
    attended: true,
    images: [],
  },
  {
    id: 'g13',
    venue: 'Fabric London',
    when: '4 MONTHS AGO',
    description: 'Room 2: Floating Points Live AV',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g14',
    venue: 'Tresor Berlin',
    when: '4 MONTHS AGO',
    description: 'Globus: Ancient Methods',
    attended: false,
    images: [],
  },
  {
    id: 'g15',
    venue: 'De Marktkantine Amsterdam',
    when: '5 MONTHS AGO',
    description: 'ADE Special: Peggy Gou',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g16',
    venue: 'Berghain / Panorama Bar',
    when: '5 MONTHS AGO',
    description: 'Len Faki b2b Answer Code Request',
    attended: true,
    images: [],
  },
  {
    id: 'g17',
    venue: 'Corsica Studios London',
    when: '6 MONTHS AGO',
    description: 'Hessle Audio: Pangaea Live',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g18',
    venue: 'Razzmatazz Barcelona',
    when: '6 MONTHS AGO',
    description: 'The Loft: Maceo Plex',
    attended: false,
    images: [],
  },
  {
    id: 'g19',
    venue: 'Fabric London',
    when: '7 MONTHS AGO',
    description: 'fabric x Hessle: Ben UFO',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g20',
    venue: 'Watergate Berlin',
    when: '8 MONTHS AGO',
    description: 'Kompakt: Michael Mayer b2b Tobias Thomas',
    attended: true,
    images: [],
  },
  {
    id: 'g21',
    venue: 'OHM Berlin',
    when: '9 MONTHS AGO',
    description: 'Stroboscopic Artefacts: Lucy Live',
    attended: true,
    images: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'g22',
    venue: 'Shelter Amsterdam',
    when: '10 MONTHS AGO',
    description: 'Berceuse Heroique: Surgeon Live',
    attended: false,
    images: [],
  },
]
