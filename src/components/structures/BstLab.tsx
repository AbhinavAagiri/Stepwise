import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownWideNarrow, Binary, Search, Trash2 } from 'lucide-react'
import { findStructure } from '../../content/structures'
import { useAppState } from '../../state/AppState'
import {
  bstHeight,
  deleteBST,
  emptyBST,
  insertBST,
  searchBST,
  traverseBST,
  type BSTState,
  type TraversalOrder,
} from '../../structures/bst'
import { useOpLog } from './StructureLog'
import { StructureLayout, ComplexityRail } from './StructureLayout'
import { Button } from '../ui/Button'

const SEED = [50, 30, 70, 20, 40, 60, 80]

function starterTree(): BSTState {
  let state = emptyBST()
  for (const value of SEED) state = insertBST(state, value).state
  return state
}

interface TreeLayoutNode {
  id: string
  value: number
  x: number
  y: number
  depth: number
}

function layoutTree(state: BSTState): {
  nodes: TreeLayoutNode[]
  edges: Array<{ id: string; from: TreeLayoutNode; to: TreeLayoutNode }>
  width: number
  height: number
} {
  const width = 700
  const height = 410
  const order: string[] = []
  const depths = new Map<string, number>()

  const walk = (id: string | null, depth: number): void => {
    if (!id || !state.nodes[id]) return
    const node = state.nodes[id]
    depths.set(id, depth)
    walk(node.left, depth + 1)
    order.push(id)
    walk(node.right, depth + 1)
  }
  walk(state.root, 0)

  const maxDepth = Math.max(0, ...Array.from(depths.values()))
  const rank = new Map(order.map((id, index) => [id, index]))
  const padX = 42
  const padTop = 38
  const padBottom = 26
  const usableHeight = height - padTop - padBottom
  const level = maxDepth > 0 ? usableHeight / maxDepth : 0
  const count = Math.max(1, order.length)

  const nodes = order.map((id) => {
    const position = rank.get(id) ?? 0
    return {
      id,
      value: state.nodes[id].value,
      x: padX + ((position + 0.5) / count) * (width - padX * 2),
      y: padTop + (depths.get(id) ?? 0) * level,
      depth: depths.get(id) ?? 0,
    }
  })
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const edges: Array<{ id: string; from: TreeLayoutNode; to: TreeLayoutNode }> = []
  for (const node of nodes) {
    const original = state.nodes[node.id]
    for (const childId of [original.left, original.right]) {
      if (!childId) continue
      const child = byId.get(childId)
      if (child) edges.push({ id: `${node.id}-${childId}`, from: node, to: child })
    }
  }

  return { nodes, edges, width, height }
}

export function BstLab() {
  const structure = findStructure('bst')!
  const { reduceMotion } = useAppState()
  const { entries, push, clear } = useOpLog()
  const [state, setState] = useState<BSTState>(starterTree)
  const [valueDraft, setValueDraft] = useState('45')
  const [path, setPath] = useState<string[]>([])
  const [traversalIds, setTraversalIds] = useState<string[]>([])
  const [output, setOutput] = useState<number[]>([])
  const [outputOrder, setOutputOrder] = useState<TraversalOrder | null>(null)
  const [comparisons, setComparisons] = useState(0)
  const [last, setLast] = useState('ready')
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState(
    'Every node keeps smaller values on the left and larger values on the right. Watch the path a comparison follows.',
  )
  const timers = useRef<number[]>([])
  const layout = useMemo(() => layoutTree(state), [state])
  const height = bstHeight(state)

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const parseValue = (): number | null => {
    if (!/^-?\d+$/.test(valueDraft.trim()) || Math.abs(Number(valueDraft)) > 999) {
      setError('Value must be a whole number between −999 and 999.')
      return null
    }
    setError(null)
    return Number(valueDraft)
  }

  const insert = () => {
    const value = parseValue()
    if (value === null) return
    clearTimers()
    setTraversalIds([])
    setOutput([])
    setOutputOrder(null)
    const operation = insertBST(state, value)
    setState(operation.state)
    setPath(operation.visited)
    setComparisons(operation.visited.length)
    setLast(operation.state.size > state.size ? `inserted ${value}` : `${value} exists`)
    setNote(
      operation.state.size > state.size
        ? `Insert ${value} at depth ${operation.depth} by following comparisons from the root.`
        : `${value} is already present. This lab ignores duplicate inserts.`,
    )
    push('Insert', operation.steps, operation.state.size > state.size ? 'ok' : 'error')
  }

  const find = () => {
    const value = parseValue()
    if (value === null) return
    clearTimers()
    setTraversalIds([])
    setOutput([])
    setOutputOrder(null)
    const operation = searchBST(state, value)
    setPath(operation.visited)
    setComparisons(operation.visited.length)
    setLast(operation.found ? `found ${value}` : `${value} absent`)
    setNote(
      operation.found
        ? `${value} found after ${operation.visited.length} comparisons at depth ${operation.depth}.`
        : `${value} is absent. The search followed one path and reached a null child.`,
    )
    push('Search', operation.steps, operation.found ? 'ok' : 'error')
  }

  const remove = () => {
    const value = parseValue()
    if (value === null) return
    clearTimers()
    setTraversalIds([])
    setOutput([])
    setOutputOrder(null)
    const operation = deleteBST(state, value)
    setState(operation.state)
    setPath(operation.visited)
    setComparisons(operation.visited.length)
    setLast(operation.found ? `deleted ${value}` : `${value} absent`)
    setNote(
      operation.found
        ? `Deleted ${value}. Notice which node changes role when a node has two children.`
        : `${value} is not in the tree, so nothing changed.`,
    )
    push('Delete', operation.steps, operation.found ? 'ok' : 'error')
  }

  const traverse = (order: TraversalOrder) => {
    clearTimers()
    const operation = traverseBST(state, order)
    setPath([])
    setComparisons(0)
    setTraversalIds([])
    setOutput([])
    setOutputOrder(order)
    setLast(`${order} traversal`)
    push(`${order[0].toUpperCase()}${order.slice(1)} traversal`, operation.steps)
    setNote(
      order === 'inorder'
        ? 'In-order visits left, then node, then right. A BST returns its values in ascending order.'
        : order === 'preorder'
          ? 'Pre-order visits a node before its children - useful for copying a tree.'
          : 'Post-order visits children before their parent - useful for freeing a tree.',
    )

    if (reduceMotion) {
      setTraversalIds(operation.visited)
      setOutput(operation.values)
      return
    }

    operation.visited.forEach((id, index) => {
      const timer = window.setTimeout(() => {
        setTraversalIds((current) => [...current, id])
        setOutput((current) => [...current, operation.values[index]])
      }, index * 330)
      timers.current.push(timer)
    })
  }

  const pathSet = new Set(path)
  const traversalSet = new Set(traversalIds)
  const activeId = path[path.length - 1]

  return (
    <StructureLayout
      note={note}
      meta={`bst · ${state.size} nodes · height ${height}`}
      entries={entries}
      onClearLog={clear}
      footer={
        <div className="stat-grid" style={{ width: '100%' }}>
          <div className="stat" style={{ borderLeft: 0, paddingLeft: 0 }}>
            <div className="stat-label">Nodes</div>
            <div className="stat-value">{state.size}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Height</div>
            <div className="stat-value">{height}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Comparisons</div>
            <div className="stat-value">{comparisons}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Last operation</div>
            <div className="stat-value" style={{ fontSize: 12 }}>{last}</div>
          </div>
        </div>
      }
      controls={
        <>
          <div className="rail-section">
            <div className="rail-heading">
              <span>Operations</span>
              <span className="rail-heading-note">duplicates ignored</span>
            </div>
            <div className="field">
              <label className="label" htmlFor="bst-value">
                Value
                <span className="label-note">integer</span>
              </label>
              <input
                id="bst-value"
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
              <Button size="sm" variant="outline" onClick={insert}>
                <Binary aria-hidden="true" />
                Insert
              </Button>
              <Button size="sm" variant="outline" onClick={find}>
                <Search aria-hidden="true" />
                Search
              </Button>
              <Button size="sm" variant="outline" onClick={remove} style={{ gridColumn: 'span 2' }}>
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>

          <div className="rail-section">
            <div className="rail-heading">
              <span>Traverse</span>
              <span className="rail-heading-note">visit order</span>
            </div>
            <div className="ds-button-grid">
              <Button size="sm" variant="secondary" onClick={() => traverse('inorder')}>
                <ArrowDownWideNarrow aria-hidden="true" />
                In-order
              </Button>
              <Button size="sm" variant="ghost" onClick={() => traverse('preorder')}>
                Pre-order
              </Button>
              <Button size="sm" variant="ghost" onClick={() => traverse('postorder')}>
                Post-order
              </Button>
            </div>
            <p className="hint" style={{ marginTop: 7 }}>
              Traversal highlights nodes one visit at a time. In-order on a BST is always ascending.
            </p>
          </div>

          <ComplexityRail
            operations={structure.operations}
            note={`This tree's height is ${height}. Search cost is O(height), and the worst case is a chain of n nodes.`}
          />
        </>
      }
    >
      <div className="ds-canvas-copy" style={{ width: '100%', height: '100%' }}>
        <div className="tree-output">
          <span className="tree-output-label">{outputOrder ?? 'traversal'}</span>
          <div className="tree-output-values">
            {output.length > 0
              ? output.map((value, index) => (
                  <span className="tree-chip" key={`${value}-${index}`}>
                    {value}
                  </span>
                ))
              : <span className="tree-output-empty">Run a traversal to collect values here.</span>}
          </div>
        </div>

        <div className="tree-wrap">
          {state.size === 0 ? (
            <div className="lab-empty">
              <span className="lab-empty-title">Empty tree</span>
              <span className="lab-empty-text">Insert a value to create the root.</span>
            </div>
          ) : (
            <svg
              className="tree-svg"
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={`Binary search tree with ${state.size} nodes and height ${height}.`}
            >
              {layout.edges.map((edge) => {
                const highlighted = pathSet.has(edge.from.id) && pathSet.has(edge.to.id)
                const traversed = traversalSet.has(edge.from.id) && traversalSet.has(edge.to.id)
                return (
                  <line
                    key={edge.id}
                    x1={edge.from.x}
                    y1={edge.from.y + 15}
                    x2={edge.to.x}
                    y2={edge.to.y - 15}
                    stroke={traversed ? 'var(--accent)' : highlighted ? 'var(--compare)' : 'var(--line-strong)'}
                    strokeWidth={traversed || highlighted ? 1.6 : 1}
                  />
                )
              })}
              {layout.nodes.map((node) => {
                const isTraversed = traversalSet.has(node.id)
                const isActive = node.id === activeId
                const isPath = pathSet.has(node.id)
                return (
                  <g
                    key={node.id}
                    className={[
                      'tree-node',
                      isTraversed ? 'is-traversed' : '',
                      isPath ? 'is-path' : '',
                      isActive ? 'is-active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <rect x={node.x - 23} y={node.y - 15} width={46} height={30} rx={4} />
                    <text x={node.x} y={node.y + 4} textAnchor="middle">
                      {node.value}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>
        <p className="ds-caption">
          Layout is derived from the tree structure, not the insertion history. Balanced shape is not
          guaranteed - this lab mirrors the real tree.
        </p>
      </div>
    </StructureLayout>
  )
}
