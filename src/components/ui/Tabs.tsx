import { useId, useRef } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAppState } from '../../state/AppState'

export interface TabItem {
  id: string
  label: string
  icon?: LucideIcon
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  label: string
  className?: string
}

export function Tabs({ items, value, onChange, label, className }: TabsProps) {
  const layoutId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const { reduceMotion } = useAppState()

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === value)
    if (index < 0) return
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % items.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = items.length - 1
    else return
    event.preventDefault()
    onChange(items[next].id)
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus()
  }

  return (
    <div className={cn('tabs', className)} role="tablist" aria-label={label} onKeyDown={onKeyDown} ref={listRef}>
      {items.map((item) => {
        const Icon = item.icon
        const selected = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            className="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
          >
            {Icon && <Icon aria-hidden="true" />}
            {item.label}
            {selected && (
              <motion.span
                className="tab-underline"
                layoutId={`tab-underline-${layoutId}`}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
