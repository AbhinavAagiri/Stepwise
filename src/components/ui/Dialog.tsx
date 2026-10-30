import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAppState } from '../../state/AppState'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
  bodyClassName?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
  bodyClassName,
}: DialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const { reduceMotion } = useAppState()
  const [rendered, setRendered] = useState(open)

  useEffect(() => {
    if (open) {
      setRendered(true)
      return
    }
    if (!rendered) return
    const timeout = window.setTimeout(() => setRendered(false), reduceMotion ? 0 : 160)
    return () => window.clearTimeout(timeout)
  }, [open, rendered, reduceMotion])

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    if (panel) {
      const target =
        panel.querySelector<HTMLElement>('[data-autofocus]') ??
        panel.querySelector<HTMLElement>(FOCUSABLE) ??
        panel
      window.setTimeout(() => target.focus(), 20)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus()
    }
  }, [open, rendered])

  const duration = reduceMotion ? 0 : 0.16

  if (!rendered) return null

  return createPortal(
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.14 }}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <motion.div
        ref={panelRef}
        className={cn('dialog', size === 'sm' && 'dialog-sm', size === 'lg' && 'dialog-lg', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: reduceMotion ? 1 : 0.995 }}
        animate={{
          opacity: open ? 1 : 0,
          y: open || reduceMotion ? 0 : 4,
          scale: open || reduceMotion ? 1 : 0.995,
        }}
        transition={{ duration, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="dialog-head">
          <h2 className="dialog-title" id={titleId}>
            {title}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className={cn('dialog-body', bodyClassName)}>{children}</div>
        {footer && <div className="dialog-foot">{footer}</div>}
      </motion.div>
    </motion.div>,
    document.body,
  )
}
