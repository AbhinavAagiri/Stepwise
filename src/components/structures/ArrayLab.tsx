import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { findStructure } from '../../content/structures'
import { useAppState } from '../../state/AppState'
import { useOpLog } from './StructureLog'
import { StructureLayout, ComplexityRail } from './StructureLayout'
import { Button } from '../ui/Button'

interface ArrayItem {
  id: string
  value: number
}

let arrayId = 0

function makeItem(value: number): ArrayItem {
  arrayId += 1
  return { id: `cell-${arrayId}`, value }
}

const INITIAL = [12, 7, 24, 3, 18, 9, 31, 15]

export function ArrayLab() {
  const structure = findStructure('array')!
  const { reduceMotion } = useAppState()
  const { entries, push, clear } = useOpLog()
  const [items, setItems] = useState<ArrayItem[]>(() => INITIAL.map(makeItem))
  const [indexDraft, setIndexDraft] = useState('2')
  const [valueDraft, setValueDraft] = useState('42')
  const [highlight, setHighlight] = useState<number | null>(null)
  const [note, setNote] = useState('Choose an index and run an operation. Every write is counted as a real array operation.')
  const [error, setError] = useState<string | null>(null)
  const [last, setLast] = useState('ready')

  const parsedIndex = useMemo(() => {
    if (!/^\d+$/.test(indexDraft.trim())) return null
    return Number(indexDraft)
  }, [indexDraft])

  const parseValue = (): number | null => {
    if (!/^-?\d+$/.test(valueDraft.trim())) {
      setError('Value must be a whole number between −999 and 999.')
      return null
    }
    const value = Number(valueDraft)
    if (Math.abs(value) > 999) {
      setError('Keep values between −999 and 999.')
      return null
    }
    return value
  }

  const access = () => {
    if (parsedIndex === null || parsedIndex >= items.length) {
      setError(`Index must be between 0 and ${Math.max(0, items.length - 1)}.`)
      return
    }
    setError(null)
    setHighlight(parsedIndex)
    setLast(`a[${parsedIndex}] = ${items[parsedIndex].value}`)
    setNote(`Read a[${parsedIndex}] directly. No other cell is touched.`)
    push('Access by index', [
      `Compute address: base + ${parsedIndex} × cellSize.`,
      `Read a[${parsedIndex}] = ${items[parsedIndex].value} in O(1).`,
    ])
  }

  const update = () => {
    if (parsedIndex === null || parsedIndex >= items.length) {
      setError(`Index must be between 0 and ${Math.max(0, items.length - 1)}.`)
      return
    }
    const value = parseValue()
    if (value === null) return
    setError(null)
    const previous = items[parsedIndex].value
    setItems((current) => current.map((item, index) => (index === parsedIndex ? { ...item, value } : item)))
    setHighlight(parsedIndex)
    setLast(`updated ${parsedIndex}`)
    setNote(`Overwrite a[${parsedIndex}]: ${previous} → ${value}. The address is computed directly.`)
    push('Update', [`Compute the address for index ${parsedIndex}.`, `Write ${value} over ${previous}.`, 'No shifting is required.'])
  }

  const insert = () => {
    if (parsedIndex === null || parsedIndex > items.length) {
      setError(`Insert index must be between 0 and ${items.length}.`)
      return
    }
    const value = parseValue()
    if (value === null) return
    setError(null)
    setItems((current) => {
      const next = current.slice()
      next.splice(parsedIndex, 0, makeItem(value))
      return next
    })
    setHighlight(parsedIndex)
    setLast(`inserted ${value}`)
    setNote(`Insert ${value} at index ${parsedIndex}. Later values shift right to open the gap.`)
    push('Insert', [
      `Open a gap at index ${parsedIndex}.`,
      `Shift indices ${parsedIndex}..${items.length - 1} one slot right.`,
      `Write ${value} into the gap. Cost is O(n) in the worst case.`,
    ])
  }

  const remove = () => {
    if (parsedIndex === null || parsedIndex >= items.length) {
      setError(`Delete index must be between 0 and ${Math.max(0, items.length - 1)}.`)
      return
    }
    setError(null)
    const removed = items[parsedIndex].value
    setItems((current) => current.filter((_, index) => index !== parsedIndex))
    setHighlight(null)
    setLast(`deleted ${parsedIndex}`)
    setNote(`Delete a[${parsedIndex}] (${removed}). Every later value shifts one index left.`)
    push('Delete', [
      `Read and remove ${removed} at index ${parsedIndex}.`,
      `Shift indices ${parsedIndex + 1}..${items.length - 1} one slot left.`,
      'The length decreases by one.',
    ])
  }

  const search = () => {
    const value = parseValue()
    if (value === null) return
    setError(null)
    const steps: string[] = []
    let found = -1
    items.forEach((item, index) => {
      steps.push(`Compare a[${index}] = ${item.value} with ${value}.`)
      if (item.value === value && found === -1) found = index
    })
    setHighlight(found >= 0 ? found : null)
    setLast(found >= 0 ? `found at ${found}` : 'not found')
    setNote(
      found >= 0
        ? `${value} first appears at index ${found}. Unsorted search inspected ${found + 1} ${found === 0 ? 'cell' : 'cells'}.`
        : `${value} is not present. Search inspected all ${items.length} cells.`,
    )
    push('Search value', steps.length > 0 ? [...steps, found >= 0 ? `Found at index ${found}.` : 'Reached the end: not found.'] : ['Array is empty.'])
  }

  const complexity = (
    <ComplexityRail
      operations={structure.operations}
      note="Access is constant time. Insert and delete in the middle are linear because later values shift."
    />
  )

  return (
    <StructureLayout
      note={note}
      meta={`array · length ${items.length}`}
      entries={entries}
      onClearLog={clear}
      footer={
        <div className="stat-grid" style={{ width: '100%' }}>
          <div className="stat" style={{ borderLeft: 0, paddingLeft: 0 }}>
            <div className="stat-label">Length</div>
            <div className="stat-value">{items.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Highlighted</div>
            <div className="stat-value">{highlight ?? '-'}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Last operation</div>
            <div className="stat-value" style={{ fontSize: 12 }}>{last}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Indexing</div>
            <div className="stat-value">O(1)</div>
          </div>
        </div>
      }
      controls={
        <>
          <div className="rail-section">
            <div className="rail-heading">
              <span>Operations</span>
              <span className="rail-heading-note">direct access</span>
            </div>
            <div className="field">
              <label className="label" htmlFor="array-index">
                Index
                <span className="label-note">0 - {Math.max(0, items.length - 1)}</span>
              </label>
              <input
                id="array-index"
                className="input"
                inputMode="numeric"
                value={indexDraft}
                onChange={(event) => {
                  setIndexDraft(event.target.value)
                  setError(null)
                }}
              />
            </div>
            <div className="field" style={{ marginTop: 8 }}>
              <label className="label" htmlFor="array-value">
                Value
                <span className="label-note">−999…999</span>
              </label>
              <input
                id="array-value"
                className="input"
                inputMode="numeric"
                value={valueDraft}
                onChange={(event) => {
                  setValueDraft(event.target.value)
                  setError(null)
                }}
              />
            </div>
            {error && (
              <p className="error-text" role="alert">
                {error}
              </p>
            )}
            <div className="ds-button-grid">
              <Button size="sm" variant="outline" onClick={access}>
                <Eye aria-hidden="true" />
                Access
              </Button>
              <Button size="sm" variant="outline" onClick={update}>
                <Pencil aria-hidden="true" />
                Update
              </Button>
              <Button size="sm" variant="outline" onClick={insert}>
                <Plus aria-hidden="true" />
                Insert
              </Button>
              <Button size="sm" variant="outline" onClick={remove}>
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
              <Button size="sm" variant="secondary" onClick={search} style={{ gridColumn: 'span 2' }}>
                <Search aria-hidden="true" />
                Search value
              </Button>
            </div>
            <p className="hint" style={{ marginTop: 7 }}>
              Click a cell to load its index. Insert can also append at index {items.length}.
            </p>
          </div>
          {complexity}
        </>
      }
    >
      <div className="ds-canvas-copy">
        <div className="array-viz">
          {items.length === 0 ? (
            <div className="lab-empty" style={{ minHeight: 160 }}>
              <span className="lab-empty-title">Empty array</span>
              <span className="lab-empty-text">Insert a value to create the first cell.</span>
            </div>
          ) : (
            <div className="array-cells">
              {items.map((item, index) => (
                <motion.button
                  type="button"
                  layout
                  key={item.id}
                  className={[
                    'array-cell',
                    highlight === index ? 'is-active' : '',
                    parsedIndex === index ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
                  onClick={() => setIndexDraft(String(index))}
                  aria-label={`Index ${index}, value ${item.value}. Select index.`}
                >
                  <span className="array-cell-value">{item.value}</span>
                  <span className="array-cell-index">{index}</span>
                </motion.button>
              ))}
              <div className="array-length" aria-hidden="true">
                len {items.length}
              </div>
            </div>
          )}
        </div>
        <p className="ds-caption">
          Contiguous slots. The index is an offset, not a search: address = base + index × cell size.
        </p>
      </div>
    </StructureLayout>
  )
}
