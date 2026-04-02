import { Compass, Flame, Ticket, User, type LucideIcon } from 'lucide-react'
import type { Tab } from './types'

export type TabNavItem = {
  key: Tab
  label: string
  icon: LucideIcon
}

export const tabNavItems: TabNavItem[] = [
  { key: 'feed', label: 'Feed', icon: Flame },
  { key: 'explore', label: 'Explore', icon: Compass },
  { key: 'plan', label: 'Plan', icon: Ticket },
  { key: 'profile', label: 'Profile', icon: User },
]
