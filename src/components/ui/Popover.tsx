import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PopoverProps {
  label: string
  children: ReactNode
  trigger: (props: {
    onClick: () => void
    'aria-expanded': boolean
    'aria-haspopup': 'dialog'
  }) => ReactNode
  align?: 'start' | 'end'
  className?: string
}

export function Popover({ label, children, trigger, align = 'end', className }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="popover-anchor">
      {trigger({
        onClick: () => setOpen((value) => !value),
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
      })}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={cn('popover', className)}
          style={{
            top: 'calc(100% + 6px)',
            [align === 'end' ? 'right' : 'left']: 0,
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
