import { useId, useRef } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useAppState } from '../../state/AppState'

interface SegmentedProps<T extends string> {
  options: Array<{ value: T; label: string; icon?: LucideIcon }>
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedProps<T>) {
  const layoutId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const { reduceMotion } = useAppState()

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((option) => option.value === value)
    if (index < 0) return
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % options.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length
    else return
    event.preventDefault()
    onChange(options[next].value)
    ref.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus()
  }

  return (
    <div
      className={cn('segmented', className)}
      role="group"
      aria-label={label}
      ref={ref}
      onKeyDown={onKeyDown}
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
          >
            {active && (
              <motion.span
                className="segmented-active"
                layoutId={`segmented-${layoutId}`}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
              />
            )}
            {Icon && <Icon size={12} aria-hidden />}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
