import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { findStructure } from '../../content/structures'
import { useAppState } from '../../state/AppState'
import {
  bucketIndex,
  createHashTable,
  hashDelete,
  hashInsert,
  hashLookup,
  type HashTableState,
} from '../../structures/hashTable'
import { useOpLog } from './StructureLog'
import { StructureLayout, ComplexityRail } from './StructureLayout'
import { Button } from '../ui/Button'

const SEED: Array<[string, string]> = [
  ['ada', '1815'],
  ['grace', '1906'],
  ['alan', '1912'],
  ['edsger', '1972'],
  ['barbara', '1936'],
]

function starterTable(): HashTableState {
  let state = createHashTable(7)
  for (const [key, value] of SEED) state = hashInsert(state, key, value).state
  return state
}

interface Highlight {
  bucket: number
  position: number | null
}

export function HashLab() {
  const structure = findStructure('hash-table')!
  const { reduceMotion } = useAppState()
  const { entries, push, clear } = useOpLog()
  const [table, setTable] = useState<HashTableState>(starterTable)
  const [keyDraft, setKeyDraft] = useState('donald')
  const [valueDraft, setValueDraft] = useState('1938')
  const [highlight, setHighlight] = useState<Highlight | null>(null)
  const [last, setLast] = useState('ready')
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState(
    'Seven buckets, chained collisions. Hash a key to jump directly to its bucket instead of scanning every entry.',
  )

  const trimmedKey = keyDraft.trim()
  const hashPreview = useMemo(() => {
    if (!trimmedKey) return null
    return bucketIndex(trimmedKey, table.capacity)
  }, [trimmedKey, table.capacity])

  const validate = (requireValue: boolean): boolean => {
    if (!trimmedKey) {
      setError('Enter a key first.')
      return false
    }
    if (trimmedKey.length > 24) {
      setError('Keep keys under 25 characters.')
      return false
    }
    if (requireValue && !valueDraft.trim()) {
      setError('Enter a value to store with this key.')
      return false
    }
    setError(null)
    return true
  }

  const insert = () => {
    if (!validate(true)) return
    const operation = hashInsert(table, trimmedKey, valueDraft.trim())
    const position = operation.state.buckets[operation.index].findIndex((entry) => entry.key === trimmedKey)
    setTable(operation.state)
    setHighlight({ bucket: operation.index, position })
    setLast(`inserted ${trimmedKey}`)
    setNote(
      operation.found
        ? `${trimmedKey} already existed in bucket ${operation.index}; its value was replaced.`
        : `Stored ${trimmedKey} in bucket ${operation.index}. Chain length is ${operation.state.buckets[operation.index].length}.`,
    )
    push('Insert', operation.steps)
  }

  const lookup = () => {
    if (!validate(false)) return
    const operation = hashLookup(table, trimmedKey)
    const position = table.buckets[operation.index].findIndex((entry) => entry.key === trimmedKey)
    setTable(operation.state)
    setHighlight({ bucket: operation.index, position: operation.found ? position : null })
    setLast(operation.found ? `found ${trimmedKey}` : `${trimmedKey} absent`)
    setNote(
      operation.found
        ? `${trimmedKey} found in bucket ${operation.index} after ${operation.collisions + 1} chain ${operation.collisions === 0 ? 'check' : 'checks'}.`
        : `${trimmedKey} is not in bucket ${operation.index}. Only that chain was inspected.`,
    )
    push('Lookup', operation.steps, operation.found ? 'ok' : 'error')
  }

  const remove = () => {
    if (!validate(false)) return
    const operation = hashDelete(table, trimmedKey)
    setTable(operation.state)
    setHighlight({ bucket: operation.index, position: null })
    setLast(operation.found ? `deleted ${trimmedKey}` : `${trimmedKey} absent`)
    setNote(
      operation.found
        ? `${trimmedKey} unlinked from bucket ${operation.index}. The other chain entries stay put.`
        : `${trimmedKey} was not in bucket ${operation.index}; nothing changed.`,
    )
    push('Delete', operation.steps, operation.found ? 'ok' : 'error')
  }

  const clearTable = () => {
    setTable(createHashTable(7))
    setHighlight(null)
    setLast('cleared')
    setNote('Table cleared. Seven buckets remain; insert a key to watch the hash choose a bucket.')
    push('Clear table', ['Removed all entries.', 'Bucket count stays at 7, so the next insert starts a fresh chain.'])
  }

  const load = table.size / table.capacity
  const activeBucket = highlight ? table.buckets[highlight.bucket] : null

  return (
    <StructureLayout
      note={note}
      meta={`hash table · ${table.size} entries · ${last}`}
      entries={entries}
      onClearLog={clear}
      footer={
        <div className="stat-grid" style={{ width: '100%' }}>
          <div className="stat" style={{ borderLeft: 0, paddingLeft: 0 }}>
            <div className="stat-label">Entries</div>
            <div className="stat-value">{table.size}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Load factor</div>
            <div className="stat-value">{load.toFixed(2)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active bucket</div>
            <div className="stat-value">{highlight ? highlight.bucket : '-'}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Chain length</div>
            <div className="stat-value">{activeBucket ? activeBucket.length : '-'}</div>
          </div>
        </div>
      }
      controls={
        <>
          <div className="rail-section">
            <div className="rail-heading">
              <span>Operations</span>
              <span className="rail-heading-note">chaining</span>
            </div>
            <div className="field">
              <label className="label" htmlFor="hash-key">
                Key
                <span className="label-note">text</span>
              </label>
              <input
                id="hash-key"
                className="input mono"
                value={keyDraft}
                onChange={(event) => {
                  setKeyDraft(event.target.value)
                  setError(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    lookup()
                  }
                }}
                maxLength={24}
                aria-invalid={error ? true : undefined}
              />
              {hashPreview !== null && (
                <p className="hash-formula">
                  hash("{trimmedKey}") mod {table.capacity} = <b>{hashPreview}</b>
                </p>
              )}
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label className="label" htmlFor="hash-value">
                Value
                <span className="label-note">text or number</span>
              </label>
              <input
                id="hash-value"
                className="input mono"
                value={valueDraft}
                onChange={(event) => {
                  setValueDraft(event.target.value)
                  setError(null)
                }}
                maxLength={24}
              />
            </div>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <div className="ds-button-grid">
              <Button size="sm" variant="outline" onClick={insert}>
                <Plus aria-hidden="true" />
                Insert
              </Button>
              <Button size="sm" variant="outline" onClick={lookup}>
                <Search aria-hidden="true" />
                Lookup
              </Button>
              <Button size="sm" variant="outline" onClick={remove} style={{ gridColumn: 'span 2' }}>
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>

          <div className="rail-section">
            <div className="rail-actions">
              <Button size="sm" variant="ghost" onClick={clearTable} style={{ width: '100%' }}>
                Clear table
              </Button>
            </div>
            <p className="rail-note">
              This lab keeps seven buckets so chains stay visible. A production table usually resizes when
              the load factor passes about 0.75.
            </p>
          </div>

          <ComplexityRail
            operations={structure.operations}
            note="Average O(1) assumes a good hash and a sensible load factor. Long chains approach O(n)."
          />
        </>
      }
    >
      <div className="ds-canvas-copy" style={{ width: '100%' }}>
        <div className="hash-scene">
          <div className="hash-function">
            <span>djb2(key) mod 7</span>
            <span className="hash-function-note">the bucket index is computed, not searched</span>
          </div>
          <div className="hash-table">
            {table.buckets.map((bucket, index) => {
              const active = highlight?.bucket === index
              return (
                <div className={`hash-row${active ? ' is-active' : ''}`} key={index}>
                  <div className="hash-bucket-index">
                    <span>{index}</span>
                    <small>bucket</small>
                  </div>
                  <div className={`hash-chain${bucket.length > 1 ? ' has-collision' : ''}`}>
                    {bucket.length === 0 ? (
                      <span className="hash-empty">empty</span>
                    ) : (
                      bucket.map((entry, position) => (
                        <motion.span
                          key={entry.key}
                          layout
                          className={`hash-entry${active && highlight?.position === position ? ' is-highlighted' : ''}`}
                          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
                        >
                          <span className="hash-entry-key">{entry.key}</span>
                          <span className="hash-entry-value">{entry.value}</span>
                        </motion.span>
                      ))
                    )}
                    {bucket.length > 1 && <span className="hash-chain-label">chain {bucket.length}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="ds-caption">
          Each row is a bucket. Colliding keys share a bucket and are compared one by one inside that short
          chain. The highlighted row is the only bucket this operation touched.
        </p>
      </div>
    </StructureLayout>
  )
}
