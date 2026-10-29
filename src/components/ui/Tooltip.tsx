import type { ReactNode } from 'react'

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="tip">
      {children}
      <span className="tip-bubble" aria-hidden="true">
        {label}
      </span>
    </span>
  )
}
