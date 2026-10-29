import type { SortFrame } from '../../engine/types'

interface HeapTreeProps {
  frame: SortFrame
}

function heapLayout(count: number): {
  order: number[]
  depth: number[]
  maxDepth: number
} {
  const order: number[] = []
  const depth: number[] = new Array(count).fill(0)
  for (let index = 0; index < count; index += 1) {
    depth[index] = Math.floor(Math.log2(index + 1))
  }
  const walk = (index: number): void => {
    if (index >= count) return
    walk(index * 2 + 1)
    order.push(index)
    walk(index * 2 + 2)
  }
  walk(0)
  return {
    order,
    depth,
    maxDepth: count > 0 ? Math.floor(Math.log2(count)) : 0,
  }
}

export function HeapTree({ frame }: HeapTreeProps) {
  const count = frame.array.length
  const { order, depth, maxDepth } = heapLayout(count)
  const activeSize = frame.heapSize ?? count
  const rank = new Map<number, number>()
  order.forEach((index, position) => rank.set(index, position))

  const width = 640
  const height = 230
  const padX = 22
  const padTop = 22
  const padBottom = 16
  const levelHeight = maxDepth > 0 ? (height - padTop - padBottom) / maxDepth : 0
  const xFor = (index: number) => {
    const position = rank.get(index) ?? 0
    return padX + ((position + 0.5) / Math.max(1, count)) * (width - padX * 2)
  }
  const yFor = (index: number) => padTop + depth[index] * levelHeight
  const radius = count > 31 ? 8 : count > 18 ? 10 : 12
  const showValues = count <= 31

  return (
    <div className="heap-wrap">
      <div className="heap-caption">
        <span>heap view</span>
        <span className="heap-caption-note">
          {activeSize} in heap · {count - activeSize} settled
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="heap-svg"
        role="img"
        aria-label={`Binary heap with ${activeSize} active nodes. ${frame.note}`}
      >
        {frame.array.map((_, index) => {
          const left = index * 2 + 1
          const right = index * 2 + 2
          return [left, right].map((child) => {
            if (child >= count) return null
            const faded = index >= activeSize || child >= activeSize
            return (
              <line
                key={`edge-${index}-${child}`}
                x1={xFor(index)}
                y1={yFor(index)}
                x2={xFor(child)}
                y2={yFor(child)}
                stroke={faded ? 'var(--line)' : 'var(--line-strong)'}
                strokeWidth={1}
                strokeDasharray={faded ? '2 4' : undefined}
              />
            )
          })
        })}
        {frame.array.map((value, index) => {
          const inCompare = frame.compare?.includes(index) ?? false
          const inSwap = inCompare && frame.kind === 'swap'
          const isPivot = frame.pivot === index
          const settled = index >= activeSize
          const fill = settled
            ? 'var(--surface-sunken)'
            : inCompare
              ? inSwap
                ? 'var(--swap-fill)'
                : 'var(--compare-fill)'
              : isPivot
                ? 'var(--pivot-fill)'
                : 'var(--surface-raised)'
          const textFill =
            !settled && (inCompare || isPivot) ? 'var(--accent-ink)' : settled ? 'var(--faint)' : 'var(--ink)'
          return (
            <g key={`node-${index}`} opacity={settled ? 0.52 : 1}>
              <circle
                cx={xFor(index)}
                cy={yFor(index)}
                r={radius}
                fill={fill}
                stroke={settled ? 'var(--line)' : inCompare || isPivot ? 'transparent' : 'var(--line-strong)'}
                strokeWidth={1}
              />
              {showValues ? (
                <text
                  x={xFor(index)}
                  y={yFor(index) + 3.5}
                  textAnchor="middle"
                  className="heap-node-label"
                  fill={textFill}
                >
                  {value}
                </text>
              ) : null}
              {index === 0 && (
                <text
                  x={xFor(index)}
                  y={yFor(index) - radius - 7}
                  textAnchor="middle"
                  className="heap-root-label"
                >
                  root
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
