import { Settings2 } from 'lucide-react'
import { Logo } from './Logo'
import { NavLinks } from './NavLinks'

interface SidebarProps {
  onOpenSettings: () => void
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <Logo />
        <div className="sidebar-rule" />
        <NavLinks />
        <div className="sidebar-spacer" />
        <div className="sidebar-foot">
          <button type="button" className="sidebar-action" onClick={onOpenSettings}>
            <Settings2 aria-hidden="true" />
            Settings
          </button>
          <div className="sidebar-fineprint">
            local-first · your progress
            <br />
            stays in this browser
          </div>
        </div>
      </div>
    </aside>
  )
}
