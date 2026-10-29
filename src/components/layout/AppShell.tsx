import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAppState } from '../../state/AppState'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { SettingsDialog } from './SettingsDialog'
import { MobileNav } from './MobileNav'

export function AppShell() {
  const location = useLocation()
  const { reduceMotion } = useAppState()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <div className="main">
        <TopBar
          onOpenMenu={() => setMobileOpen(true)}
          onOpenCommand={() => setPaletteOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <main id="main" className="route-host">
          <motion.div
            key={location.pathname}
            className="route-view"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.17, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenSettings={() => {
          setMobileOpen(false)
          window.setTimeout(() => setSettingsOpen(true), 170)
        }}
      />
    </div>
  )
}
