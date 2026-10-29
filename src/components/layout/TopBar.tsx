import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, Search, Settings2, Sun } from 'lucide-react'
import { getBreadcrumbs } from '../../lib/breadcrumbs'
import { useAppState } from '../../state/AppState'
import { Tooltip } from '../ui/Tooltip'

interface TopBarProps {
  onOpenMenu: () => void
  onOpenCommand: () => void
  onOpenSettings: () => void
}

export function TopBar({ onOpenMenu, onOpenCommand, onOpenSettings }: TopBarProps) {
  const { pathname } = useLocation()
  const { resolvedTheme, toggleTheme } = useAppState()
  const crumbs = getBreadcrumbs(pathname)
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-btn topbar-menu"
          onClick={onOpenMenu}
          aria-label="Open navigation"
        >
          <Menu aria-hidden="true" />
        </button>
        <nav className="crumb" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              {index > 0 && (
                <span className="crumb-sep" aria-hidden="true">
                  /
                </span>
              )}
              {crumb.to && index < crumbs.length - 1 ? (
                <Link to={crumb.to}>{crumb.label}</Link>
              ) : (
                <span className={index === crumbs.length - 1 ? 'crumb-current' : undefined}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
      <div className="topbar-right">
        <button type="button" className="cmd-trigger" onClick={onOpenCommand} aria-label="Jump to a page or algorithm">
          <Search aria-hidden="true" />
          <span className="cmd-label">Jump to</span>
          <kbd className="kbd">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </button>
        <Tooltip label={resolvedTheme === 'dark' ? 'Light theme' : 'Dark theme'}>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {resolvedTheme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </Tooltip>
        <Tooltip label="Settings">
          <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Open settings">
            <Settings2 aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
