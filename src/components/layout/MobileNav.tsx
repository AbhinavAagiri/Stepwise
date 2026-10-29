import { Settings2 } from 'lucide-react'
import { Dialog } from '../ui/Dialog'
import { NavLinks } from './NavLinks'

interface MobileNavProps {
  open: boolean
  onClose: () => void
  onOpenSettings: () => void
}

export function MobileNav({ open, onClose, onOpenSettings }: MobileNavProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Navigate"
      size="sm"
      bodyClassName="mobile-nav-body"
    >
      <NavLinks animate={false} onNavigate={onClose} />
      <div className="mobile-nav-foot">
        <button
          type="button"
          className="sidebar-action"
          onClick={() => {
            onClose()
            onOpenSettings()
          }}
        >
          <Settings2 aria-hidden="true" />
          Settings
        </button>
        <p className="sidebar-fineprint">local-first · progress stays in this browser</p>
      </div>
    </Dialog>
  )
}
