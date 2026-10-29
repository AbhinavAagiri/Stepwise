import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface LabHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  actions?: ReactNode
  mobilePicker?: ReactNode
}

export function LabHeader({ icon: Icon, title, subtitle, actions, mobilePicker }: LabHeaderProps) {
  return (
    <header className="lab-head">
      <div className="lab-head-main">
        <span className="lab-mark" aria-hidden="true">
          <Icon />
        </span>
        <div style={{ minWidth: 0 }}>
          <h1 className="lab-title">{title}</h1>
          <p className="lab-sub">{subtitle}</p>
        </div>
      </div>
      {mobilePicker && <div className="lab-mobile-picker">{mobilePicker}</div>}
      {actions && <div className="lab-head-actions">{actions}</div>}
    </header>
  )
}
