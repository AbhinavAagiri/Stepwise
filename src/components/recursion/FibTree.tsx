import type { FibNode, RecursionFrame } from '../../engine/types'

interface FibTreeProps {
  frame: RecursionFrame
}

interface Positioned {
  node: FibNode
  x: number
  y: number
}

const MAX_WIDTH = 760
const PAD_X = 26
const PAD_TOP = 30
const PAD_BOTTOM = 22

export function FibTree({ frame }: FibTreeProps) {
  const nodes = frame.fibNodes ?? []
  const activeId = frame.activeFibId ?? null

  if (nodes.length === 0) {
    return (
      <div className="fib-empty">
        <span>No call tree yet</span>
        <p>Start playback to grow the tree one call at a time.</p>
      </div>
    )
  }

  const levels: FibNode[][] = []
  for (const node of nodes) {
    if (!levels[node.depth]) levels[node.depth] = []
    levels[node.depth].push(node)
  }

  const widest = levels.reduce((max, level) => Math.max(max, level ? level.length : 0), 1)
  const gapX = widest > 1 ? Math.min(46, (MAX_WIDTH - PAD_X * 2) / (widest - 1)) : 0
  const width = widest > 1 ? Math.max(260, (widest - 1) * gapX + PAD_X * 2) : 360
  const gapY = 45
  const radius = widest > 24 ? 5.4 : widest > 16 ? 6.6 : widest > 9 ? 8 : 9.5
  const height = PAD_TOP + Math.max(1, levels.length - 1) * gapY + PAD_BOTTOM

  const position = new Map<string, Positioned>()
  for (let depth = 0; depth < levels.length; depth += 1) {
    const level = levels[depth] ?? []
    const rowWidth = (level.length - 1) * gapX
    level.forEach((node, index) => {
      position.set(node.id, {
        node,
        x: width / 2 - rowWidth / 2 + index * gapX,
        y: PAD_TOP + depth * gapY,
      })
    })
  }

  const activePath = new Set<string>()
  let cursor = activeId
  while (cursor) {
    activePath.add(cursor)
    const node = nodes.find((item) => item.id === cursor)
    cursor = node?.parent ?? null
  }

  return (
    <div className="fib-scene">
      <svg
        className="fib-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Fibonacci call tree with ${nodes.length} calls. ${frame.note}`}
      >
        {nodes.map((node) => {
          if (!node.parent) return null
          const from = position.get(node.parent)
          const to = position.get(node.id)
          if (!from || !to) return null
          const onPath = activePath.has(node.id) && activePath.has(node.parent)
          return (
            <path
              key={`edge-${node.id}`}
              d={`M ${from.x} ${from.y + radius} C ${from.x} ${from.y + gapY * 0.55}, ${to.x} ${to.y - gapY * 0.55}, ${to.x} ${to.y - radius}`}
              fill="none"
              stroke={onPath ? 'var(--accent)' : 'var(--line-strong)'}
              strokeWidth={onPath ? 1.4 : 1}
              strokeOpacity={onPath ? 1 : 0.75}
            />
          )
        })}

        {nodes.map((node) => {
          const spot = position.get(node.id)
          if (!spot) return null
          const isActive = node.id === activeId
          const isBase = node.status === 'base'
          const isReturned = node.status === 'returned'
          const isRepeated = Boolean(node.repeated)
          const onPath = activePath.has(node.id)
          const fill = isActive
            ? 'var(--accent)'
            : isBase
              ? 'var(--compare-fill)'
              : isReturned
                ? 'var(--accent-soft)'
                : 'var(--surface-raised)'
          const stroke = isActive || isBase
            ? 'transparent'
            : isRepeated
              ? 'var(--swap-fill)'
              : onPath || isReturned
                ? 'var(--accent-line)'
                : 'var(--line-strong)'
          const textFill =
            isActive || isBase
              ? 'var(--accent-ink)'
              : isReturned
                ? 'var(--accent)'
                : isRepeated
                  ? 'var(--swap)'
                  : 'var(--ink-2)'

          return (
            <g key={node.id} className="fib-node">
              {isRepeated && (
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={radius + 2.6}
                  fill="none"
                  stroke="var(--swap-fill)"
                  strokeWidth={0.9}
                  strokeDasharray="2 2.4"
                  opacity={0.8}
                />
              )}
              {isActive && (
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={radius + 3.4}
                  fill="none"
                  stroke="var(--accent-line)"
                  strokeWidth={1}
                  opacity={0.8}
                />
              )}
              <circle
                cx={spot.x}
                cy={spot.y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={1}
              />
              <text
                x={spot.x}
                y={spot.y + (radius > 7 ? 3.2 : 2.6)}
                textAnchor="middle"
                className="fib-node-label"
                fill={textFill}
              >
                {node.n}
              </text>
              {node.value !== undefined && isReturned && radius >= 8 && (
                <text
                  x={spot.x}
                  y={spot.y + radius + 9}
                  textAnchor="middle"
                  className="fib-node-value"
                >
                  {node.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="fib-foot">
        <span>
          <i className="fib-key is-active" aria-hidden="true" /> active call
        </span>
        <span>
          <i className="fib-key is-base" aria-hidden="true" /> base case
        </span>
        <span>
          <i className="fib-key is-repeated" aria-hidden="true" /> repeated work
        </span>
        <span className="fib-foot-note">depth grows downward</span>
      </div>
    </div>
  )
}
