import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowDownToLine, ArrowUpFromLine, Eye } from 'lucide-react'
import { findStructure } from '../../content/structures'
import { useAppState } from '../../state/AppState'
import {
  dequeue,
  enqueue,
  peekQueue,
  peekStack,
  popStack,
  pushStack,
} from '../../structures/linearStructures'
import { useOpLog } from './StructureLog'
import { StructureLayout, ComplexityRail } from './StructureLayout'
import { Button } from '../ui/Button'

interface LinearLabProps {
  mode: 'stack' | 'queue'
}

export function LinearLab({ mode }: LinearLabProps) {
  const isStack = mode === 'stack'
  const structure = findStructure(isStack ? 'stack' : 'queue')!
  const { reduceMotion } = useAppState()
  const { entries, push, clear } = useOpLog()
  const [items, setItems] = useState<number[]>([12, 7, 24])
  const [valueDraft, setValueDraft] = useState('9')
  const [highlight, setHighlight] = useState<number | null>(null)
  const [last, setLast] = useState('ready')
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState(
    isStack
      ? 'A stack exposes only its top. Push and pop operate on the most recently added value.'
      : 'A queue exposes its front and back. Enqueue adds at the back; dequeue removes from the front.',
  )

  const parseValue = (): number | null => {
    if (!/^-?\d+$/.test(valueDraft.trim()) || Math.abs(Number(valueDraft)) > 999) {
      setError('Value must be a whole number between −999 and 999.')
      return null
    }
    setError(null)
    return Number(valueDraft)
  }

  const add = () => {
    const value = parseValue()
    if (value === null) return
    const operation = isStack ? pushStack(items, value) : enqueue(items, value)
    setItems(operation.items)
    setHighlight(operation.items.length - 1)
    setLast(`${isStack ? 'pushed' : 'enqueued'} ${value}`)
    setNote(
      isStack
        ? `Push ${value}. It becomes the new top and the next value popped.`
        : `Enqueue ${value} at the back. It will wait behind ${items.length} existing ${items.length === 1 ? 'value' : 'values'}.`,
    )
    push(isStack ? 'Push' : 'Enqueue', operation.steps)
  }

  const remove = () => {
    const operation = isStack ? popStack(items) : dequeue(items)
    setItems(operation.items)
    setHighlight(null)
    if (!operation.ok) {
      setError(null)
      setLast(isStack ? 'empty stack' : 'empty queue')
      setNote(operation.steps[0])
      push(isStack ? 'Pop' : 'Dequeue', operation.steps, 'error')
      return
    }
    setLast(`${isStack ? 'popped' : 'dequeued'} ${operation.removed}`)
    setNote(
      isStack
        ? `Pop removed ${operation.removed} from the top. The next value is now exposed.`
        : `Dequeue removed ${operation.removed} from the front. The remaining values keep their order.`,
    )
    push(isStack ? 'Pop' : 'Dequeue', operation.steps)
  }

  const peek = () => {
    const operation = isStack ? peekStack(items) : peekQueue(items)
    if (!operation.ok) {
      setLast('empty')
      setNote(operation.steps[0])
      push('Peek', operation.steps, 'error')
      return
    }
    setHighlight(isStack ? items.length - 1 : 0)
    setLast(`peek ${operation.peek}`)
    setNote(
      isStack
        ? `Peek shows ${operation.peek} at the top without removing it.`
        : `Peek shows ${operation.peek} at the front without removing it.`,
    )
    push('Peek', operation.steps)
  }

  const topValue = items.length > 0 ? (isStack ? items[items.length - 1] : items[0]) : null
  const backValue = items.length > 0 ? items[items.length - 1] : null

  return (
    <StructureLayout
      note={note}
      meta={`${isStack ? 'stack' : 'queue'} · ${items.length} ${items.length === 1 ? 'value' : 'values'}`}
      entries={entries}
      onClearLog={clear}
      footer={
        <div className="stat-grid" style={{ width: '100%' }}>
          <div className="stat" style={{ borderLeft: 0, paddingLeft: 0 }}>
            <div className="stat-label">Size</div>
            <div className="stat-value">{items.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">{isStack ? 'Top' : 'Front'}</div>
            <div className="stat-value">{topValue ?? '-'}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Back</div>
            <div className="stat-value">{backValue ?? '-'}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Last action</div>
            <div className="stat-value" style={{ fontSize: 12 }}>{last}</div>
          </div>
        </div>
      }
      controls={
        <>
          <div className="rail-section">
            <div className="rail-heading">
              <span>Operations</span>
              <span className="rail-heading-note">{isStack ? 'LIFO' : 'FIFO'}</span>
            </div>
            <div className="field">
              <label className="label" htmlFor={`${mode}-value`}>
                Value
                <span className="label-note">whole number</span>
              </label>
              <input
                id={`${mode}-value`}
                className="input"
                inputMode="numeric"
                value={valueDraft}
                onChange={(event) => {
                  setValueDraft(event.target.value)
                  setError(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    add()
                  }
                }}
                aria-invalid={error ? true : undefined}
              />
            </div>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <div className="ds-button-grid">
              <Button size="sm" variant="outline" onClick={add}>
                {isStack ? <ArrowDownToLine aria-hidden="true" /> : <ArrowUpFromLine aria-hidden="true" />}
                {isStack ? 'Push' : 'Enqueue'}
              </Button>
              <Button size="sm" variant="outline" onClick={remove}>
                {isStack ? <ArrowUpFromLine aria-hidden="true" /> : <ArrowDownToLine aria-hidden="true" />}
                {isStack ? 'Pop' : 'Dequeue'}
              </Button>
              <Button size="sm" variant="secondary" onClick={peek} style={{ gridColumn: 'span 2' }}>
                <Eye aria-hidden="true" />
                Peek at the {isStack ? 'top' : 'front'}
              </Button>
            </div>
            <p className="hint" style={{ marginTop: 7 }}>
              {isStack
                ? 'Only the top is reachable. The bottom cannot be removed first.'
                : 'The oldest value leaves first. New values join at the back.'}
            </p>
          </div>
          <ComplexityRail
            operations={structure.operations}
            note={isStack ? 'Push, pop, and peek are all O(1).' : 'Enqueue, dequeue, and peek are all O(1).'}
          />
        </>
      }
    >
      <div className="ds-canvas-copy" style={{ width: '100%' }}>
        {isStack ? (
          <div className="stack-scene">
            <div className="stack-frame">
              <div className="stack-top-label">
                <span>top</span>
                <span aria-hidden="true">↓</span>
              </div>
              <div className="stack-body">
                {items.length === 0 ? (
                  <div className="stack-empty">empty stack</div>
                ) : (
                  [...items].reverse().map((value, reversedIndex) => {
                    const originalIndex = items.length - 1 - reversedIndex
                    return (
                      <motion.div
                        layout
                        key={`${value}-${originalIndex}`}
                        className={[
                          'stack-item',
                          originalIndex === items.length - 1 ? 'is-top' : '',
                          highlight === originalIndex ? 'is-highlighted' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        initial={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                      >
                        <span className="stack-value">{value}</span>
                        {originalIndex === items.length - 1 && <span className="stack-badge">top</span>}
                      </motion.div>
                    )
                  })
                )}
              </div>
              <div className="stack-base" aria-hidden="true" />
            </div>
          </div>
        ) : (
          <div className="queue-scene">
            <div className="queue-labels">
              <span>front · dequeue</span>
              <span>back · enqueue</span>
            </div>
            <div className="queue-track">
              {items.length === 0 ? (
                <div className="queue-empty">empty queue</div>
              ) : (
                items.map((value, index) => (
                  <motion.div
                    layout
                    key={`${value}-${index}`}
                    className={[
                      'queue-item',
                      index === 0 ? 'is-front' : '',
                      index === items.length - 1 ? 'is-back' : '',
                      highlight === index ? 'is-highlighted' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                  >
                    <span>{value}</span>
                    <span className="queue-index">{index}</span>
                  </motion.div>
                ))
              )}
              <div className="queue-tail" aria-hidden="true">
                {items.length === 0 ? 'front = back = null' : 'back'}
              </div>
            </div>
          </div>
        )}
        <p className="ds-caption">
          {isStack
            ? 'A vertical frame makes the access rule obvious: the top is the only open end.'
            : 'Values leave from the left and arrive on the right. Order is preserved end to end.'}
        </p>
      </div>
    </StructureLayout>
  )
}
