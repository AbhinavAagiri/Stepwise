import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ListPlus, ListStart, Search, Trash2, Waypoints } from 'lucide-react'
import { findStructure } from '../../content/structures'
import { useAppState } from '../../state/AppState'
import {
  deleteByValue,
  deleteHead,
  emptyList,
  insertAtHead,
  insertAtTail,
  listValues,
  searchList,
  traverseList,
  type LinkedListState,
} from '../../structures/linkedList'
import { useOpLog } from './StructureLog'
import { StructureLayout, ComplexityRail } from './StructureLayout'
import { Button } from '../ui/Button'

function starterList(): LinkedListState {
  let state = emptyList()
  for (const value of [3, 8, 12, 5]) state = insertAtTail(state, value).state
  return state
}

export function LinkedListLab() {
  const structure = findStructure('linked-list')!
  const { reduceMotion } = useAppState()
  const { entries, push, clear } = useOpLog()
  const [list, setList] = useState<LinkedListState>(starterList)
  const [valueDraft, setValueDraft] = useState('7')
  const [highlight, setHighlight] = useState<string[]>([])
  const [note, setNote] = useState('The head pointer is the only way in. Every other node is reached by following next links.')
  const [last, setLast] = useState('ready')
  const [error, setError] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  const nodesInOrder = (() => {
    const nodes: Array<{ id: string; value: number; next: string | null }> = []
    let current = list.head
    let guard = 0
    while (current && list.nodes[current] && guard <= list.size) {
      const node = list.nodes[current]
      nodes.push({ id: node.id, value: node.value, next: node.next })
      current = node.next
      guard += 1
    }
    return nodes
  })()

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const parseValue = (): number | null => {
    if (!/^-?\d+$/.test(valueDraft.trim()) || Math.abs(Number(valueDraft)) > 999) {
      setError('Value must be a whole number between −999 and 999.')
      return null
    }
    setError(null)
    return Number(valueDraft)
  }

  const animatePath = (visited: string[], steps: string[], finalNote: string) => {
    clearTimers()
    if (reduceMotion || visited.length <= 1) {
      setHighlight(visited)
      setNote(finalNote)
      return
    }
    setHighlight([])
    visited.forEach((id, index) => {
      const timer = window.setTimeout(() => {
        setHighlight((current) => [...current, id])
        setNote(steps[index] ?? finalNote)
      }, index * 430)
      timers.current.push(timer)
    })
    const finish = window.setTimeout(() => setNote(finalNote), visited.length * 430)
    timers.current.push(finish)
  }

  const pushHead = () => {
    const value = parseValue()
    if (value === null) return
    const operation = insertAtHead(list, value)
    setList(operation.state)
    setHighlight(operation.visited)
    setLast(`inserted ${value}`)
    setNote(`Insert ${value} at the head. One new node and one head-pointer change.`)
    push('Insert at head', operation.steps)
  }

  const pushTail = () => {
    const value = parseValue()
    if (value === null) return
    const operation = insertAtTail(list, value)
    setList(operation.state)
    setHighlight(operation.visited)
    setLast(`appended ${value}`)
    setNote(`Walk to the tail, then link the new node ${value} at the end.`)
    push('Insert at tail', operation.steps)
  }

  const removeHead = () => {
    if (!list.head) {
      setError('The list is empty; there is no head to delete.')
      push('Delete head', ['The list is empty. Nothing was removed.'], 'error')
      return
    }
    const operation = deleteHead(list)
    setList(operation.state)
    setHighlight([])
    setLast('deleted head')
    setNote('Move head to the next node and release the old head. Constant time.')
    push('Delete head', operation.steps)
  }

  const removeValue = () => {
    const value = parseValue()
    if (value === null) return
    const operation = deleteByValue(list, value)
    setList(operation.state)
    setHighlight(operation.visited.filter((id) => id !== operation.visited[operation.visited.length - 1] || operation.state.nodes[id]))
    setLast(operation.state.size < list.size ? `deleted ${value}` : `${value} not found`)
    setNote(
      operation.state.size < list.size
        ? `Unlink the node holding ${value}. Its neighbours never move in memory.`
        : `${value} was not found; the list is unchanged.`,
    )
    push('Delete by value', operation.steps, operation.state.size < list.size ? 'ok' : 'error')
  }

  const find = () => {
    const value = parseValue()
    if (value === null) return
    const result = searchList(list, value)
    setLast(result.found ? `found at ${result.index}` : 'not found')
    animatePath(result.visited, result.steps, result.found ? `${value} found at position ${result.index} after ${result.index + 1} comparisons.` : `Reached null. ${value} is not in the list.`)
    push('Search', result.steps, result.found ? 'ok' : 'error')
  }

  const traverse = () => {
    const result = traverseList(list)
    setLast('traversed')
    animatePath(result.visited, result.steps, `Traversal visited ${result.values.length} ${result.values.length === 1 ? 'node' : 'nodes'}.`)
    push('Traverse', result.steps)
  }

  const values = listValues(list)

  return (
    <StructureLayout
      note={note}
      meta={`linked list · ${list.size} ${list.size === 1 ? 'node' : 'nodes'}`}
      entries={entries}
      onClearLog={clear}
      footer={
        <div className="stat-grid" style={{ width: '100%' }}>
          <div className="stat" style={{ borderLeft: 0, paddingLeft: 0 }}>
            <div className="stat-label">Length</div>
            <div className="stat-value">{list.size}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Head</div>
            <div className="stat-value">{list.head ? list.nodes[list.head].value : 'null'}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Values</div>
            <div className="stat-value" style={{ fontSize: 12 }}>
              {values.length ? values.join(' → ') : '-'}
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Last result</div>
            <div className="stat-value" style={{ fontSize: 12 }}>{last}</div>
          </div>
        </div>
      }
      controls={
        <>
          <div className="rail-section">
            <div className="rail-heading">
              <span>Operations</span>
              <span className="rail-heading-note">{list.size} nodes</span>
            </div>
            <div className="field">
              <label className="label" htmlFor="ll-value">
                Value
                <span className="label-note">whole number</span>
              </label>
              <input
                id="ll-value"
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
                    find()
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
              <Button size="sm" variant="outline" onClick={pushHead}>
                <ListStart aria-hidden="true" />
                Head insert
              </Button>
              <Button size="sm" variant="outline" onClick={pushTail}>
                <ListPlus aria-hidden="true" />
                Tail insert
              </Button>
              <Button size="sm" variant="outline" onClick={removeHead}>
                <Trash2 aria-hidden="true" />
                Delete head
              </Button>
              <Button size="sm" variant="outline" onClick={removeValue}>
                <Trash2 aria-hidden="true" />
                Delete value
              </Button>
              <Button size="sm" variant="secondary" onClick={find}>
                <Search aria-hidden="true" />
                Search
              </Button>
              <Button size="sm" variant="secondary" onClick={traverse}>
                <Waypoints aria-hidden="true" />
                Traverse
              </Button>
            </div>
            <p className="hint" style={{ marginTop: 7 }}>
              Search and traverse animate one pointer hop at a time.
            </p>
          </div>
          <ComplexityRail
            operations={structure.operations}
            note="There is no index. Reaching position k costs k pointer hops."
          />
        </>
      }
    >
      <div className="ds-canvas-copy" style={{ width: '100%' }}>
        <div className="ll-scene">
          <div className="ll-head">
            <span className="ll-head-label">head</span>
            <span className="ll-head-line" aria-hidden="true" />
          </div>
          <div className="ll-track">
            {nodesInOrder.map((node, index) => (
              <div className="ll-unit" key={node.id}>
                <motion.div
                  layout
                  className={`ll-node-wrap${highlight.includes(node.id) ? ' is-highlighted' : ''}`}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <div className="ll-node">
                    <span className="ll-node-value">{node.value}</span>
                    <span className="ll-node-pointer" aria-hidden="true">
                      <span />
                    </span>
                  </div>
                  <span className="ll-address">{node.id}</span>
                  {index === 0 && <span className="ll-head-tick" aria-hidden="true" />}
                </motion.div>
                <span className={`ll-arrow${node.next ? '' : ' is-null'}`} aria-hidden="true">
                  {node.next ? '→' : '∅'}
                </span>
              </div>
            ))}
            {nodesInOrder.length === 0 && (
              <div className="ll-empty-node">
                <span className="ll-head-label">head</span>
                <span className="mono">null</span>
              </div>
            )}
          </div>
        </div>
        <p className="ds-caption">
          Nodes are not contiguous. Each box stores a value and a next pointer; the last pointer is null.
          Address labels are node identifiers, not memory claims.
        </p>
      </div>
    </StructureLayout>
  )
}
