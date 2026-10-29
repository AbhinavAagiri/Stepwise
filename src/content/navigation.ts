import {
  ArrowDownUp,
  BookOpen,
  Boxes,
  House,
  Layers,
  Route,
  ScanSearch,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: 'Home', to: '/', icon: House, end: true }],
  },
  {
    label: 'Algorithms',
    items: [
      { label: 'Sorting', to: '/sorting', icon: ArrowDownUp },
      { label: 'Searching', to: '/searching', icon: ScanSearch },
      { label: 'Pathfinding', to: '/pathfinding', icon: Route },
    ],
  },
  {
    label: 'Foundations',
    items: [
      { label: 'Data structures', to: '/structures', icon: Boxes },
      { label: 'Recursion', to: '/recursion', icon: Layers },
    ],
  },
  {
    items: [{ label: 'Learn', to: '/learn', icon: BookOpen }],
  },
]
