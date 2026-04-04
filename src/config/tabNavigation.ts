import { Calendar, LayoutGrid, Search, User, type LucideIcon } from 'lucide-react'
import type { Tab } from '../types'

export type TabNavItem = {
  key: Tab
  label: string
  icon: LucideIcon
  /** Small dot on icon (e.g. calendar “marked date”) */
  iconDot?: boolean
}

export const tabNavItems: TabNavItem[] = [
  { key: 'feed', label: 'Feed', icon: LayoutGrid },
  { key: 'explore', label: 'Explore', icon: Search },
  { key: 'plan', label: 'Plan', icon: Calendar, iconDot: true },
  { key: 'profile', label: 'Profile', icon: User },
]
