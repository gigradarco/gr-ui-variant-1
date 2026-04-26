import { Calendar, MessageCircle, Search, type LucideIcon } from 'lucide-react'
import type { Tab } from '../types'

export type TabNavItem = {
  key: Tab
  label: string
  icon: LucideIcon
  /** Small dot on icon (e.g. calendar "marked date") */
  iconDot?: boolean
}

export const tabNavItems: TabNavItem[] = [
  { key: 'discover', label: 'Discover', icon: Search },
  { key: 'ask', label: 'Ask Buzo', icon: MessageCircle },
  { key: 'plan', label: 'Plan', icon: Calendar, iconDot: true },
]
