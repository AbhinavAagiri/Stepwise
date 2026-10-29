import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { StackEntry } from '../../engine/types'
import { useAppState } from '../../state/AppState'

interface CallStackProps {
  stack: StackEntry[]
  large?: boolean
  emptyNote?: string
}

function statusLabel(entry: StackEntry): string {
  if (entry.status === 'base') return 'base case'
  if (entry.status === 'returned') return 'returned'
  return 'waiting'
}

export function CallStack({ stack, large = false, emptyNote }: CallStackProps) {
  const { reduceMotion } = useAppState()
  const listRef = useRef<HTMLDivElement>(null)
  const entries = stack.slice().reverse()

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = 0
  }, [stack.length])

  return (
    <div className={`call-stack${large ? ' is-large' : ''}`}>
      <div className="call-stack-head">
        <span>call stack</span>
        <span>
          {stack.length} {stack.length === 1 ? 'frame' : 'frames'}
        </span>
      </div>
      <div className="call-stack-body" ref={listRef}>
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              layout
              key={entry.id}
              className={`call-frame is-${entry.status}`}
              initial={reduceMotion ? false : { opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -3 }}
              transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <span className="call-frame-depth" aria-hidden="true">
                {entry.depth}
              </span>
              <span className="call-frame-copy">
                <span className="call-frame-label">{entry.label}</span>
                <span className="call-frame-detail">{entry.detail}</span>
              </span>
              <span className="call-frame-tail">
                <span className={`call-frame-state is-${entry.status}`}>{statusLabel(entry)}</span>
                {entry.returnValue !== undefined && (
                  <span className="call-frame-return">→ {entry.returnValue}</span>
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {entries.length === 0 && (
          <div className="call-stack-empty">
            <span>empty stack</span>
            <p>{emptyNote ?? 'The call stack is empty. Start playback to watch frames accumulate.'}</p>
          </div>
        )}
      </div>
      <div className="call-stack-foot">
        <span>newest frame on top</span>
        <span aria-hidden="true">↓ base</span>
      </div>
    </div>
  )
}
