import { useCallback, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Tooltip } from '../ui/Tooltip'

export interface OpLogEntry {
  id: number
  operation: string
  steps: string[]
  tone?: 'ok' | 'error'
}

export function useOpLog() {
  const [entries, setEntries] = useState<OpLogEntry[]>([])
  const counter = useRef(0)

  const push = useCallback((operation: string, steps: string[], tone: 'ok' | 'error' = 'ok') => {
    counter.current += 1
    setEntries((current) => [{ id: counter.current, operation, steps, tone }, ...current].slice(0, 14))
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return { entries, push, clear }
}

interface StructureLogProps {
  entries: OpLogEntry[]
  onClear: () => void
}

export function StructureLog({ entries, onClear }: StructureLogProps) {
  return (
    <div className="ds-log-shell">
      <div className="ds-log-head">
        <span>operation log</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="ds-log-count">{entries.length}</span>
          <Tooltip label="Clear log">
            <button
              type="button"
              className="icon-btn"
              onClick={onClear}
              disabled={entries.length === 0}
              aria-label="Clear operation log"
              style={{ width: 24, height: 24 }}
            >
              <Trash2 aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="ds-log-list">
        {entries.length === 0 ? (
          <div className="lab-empty">
            <span className="lab-empty-title">No operations yet</span>
            <span className="lab-empty-text">
              Run an operation and its exact steps will be recorded here.
            </span>
          </div>
        ) : (
          entries.map((entry) => (
            <article className={`ds-log-entry${entry.tone === 'error' ? ' is-error' : ''}`} key={entry.id}>
              <h3 className="ds-log-op">
                <span>{entry.operation}</span>
                <span className="ds-log-number">#{String(entry.id).padStart(2, '0')}</span>
              </h3>
              <ol className="ds-log-steps">
                {entry.steps.map((step, index) => (
                  <li key={`${entry.id}-${index}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
