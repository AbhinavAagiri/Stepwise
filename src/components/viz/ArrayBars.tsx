import { useElementSize } from '../../hooks/useElementSize'
import type { SortFrame } from '../../engine/types'

interface ArrayBarsProps {
  frame: SortFrame
}

function shortValue(value: number): string {
  const text = String(value)
  return text.length > 5 ? `${text.slice(0, 4)}…` : text
}

export function ArrayBars({ frame }: ArrayBarsProps) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const values = frame.array
  const count = values.length
  const width = size.width
  const height = size.height

  const hasLane = Boolean(frame.aux) || frame.keyValue !== null
  const lowValue = count > 0 ? Math.min(0, ...values) : 0
  const highValue = count > 0 ? Math.max(0, ...values) : 1
  const span = highValue - lowValue || 1

  const left = 38
  const right = 10
  const top = 26
  const bottom = 23
  const plotWidth = Math.max(1, width - left - right)
  const plotHeight = Math.max(1, height - top - bottom)
  const zeroY = top + (highValue / span) * plotHeight
  const yFor = (value: number) => top + ((highValue - value) / span) * plotHeight
  const step = count > 0 ? plotWidth / count : plotWidth
  const gap = Math.min(6, Math.max(1, step * 0.2))
  const barWidth = Math.max(1, step - gap)
  const showValues = count <= 16 && step > 26
  const showAllIndices = count <= 30 && step > 17
  const indexStride = showAllIndices ? 1 : Math.ceil(count / 12)

  const compare = frame.compare
  const comparePair = compare && compare[0] !== compare[1] ? compare : null
  const isSwap = frame.kind === 'swap'

  const markColor = (index: number): string | null => {
    if (compare?.includes(index)) return isSwap ? 'var(--swap-fill)' : 'var(--compare-fill)'
    if (frame.pivot === index) return 'var(--pivot-fill)'
    if (frame.write === index) return 'var(--slate-fill)'
    return null
  }

  const barColor = (index: number): string => {
    const inPair = compare?.includes(index) ?? false
    if (inPair) return isSwap ? 'var(--swap-fill)' : 'var(--compare-fill)'
    if (frame.pivot === index) return 'var(--pivot-fill)'
    if (frame.write === index) return 'var(--slate-fill)'
    if (frame.sorted[index]) return 'var(--accent)'
    return 'var(--viz-base)'
  }

  const pairX = comparePair
    ? {
        x1: left + comparePair[0] * step + barWidth / 2,
        x2: left + comparePair[1] * step + barWidth / 2,
      }
    : null

  return (
    <div className="bars">
      {hasLane && (
        <div className="bars-lane">
          {frame.aux && (
            <>
              <div className="lane-group">
                <span className="lane-label">left</span>
                <div className="lane-cells">
                  {frame.aux.left.map((value, index) => (
                    <span
                      key={`l-${index}`}
                      className={`lane-cell${index === frame.aux?.leftPos ? ' is-active' : ''}${index < (frame.aux?.leftPos ?? 0) ? ' is-spent' : ''}`}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lane-sep" />
              <div className="lane-group">
                <span className="lane-label">right</span>
                <div className="lane-cells">
                  {frame.aux.right.map((value, index) => (
                    <span
                      key={`r-${index}`}
                      className={`lane-cell${index === frame.aux?.rightPos ? ' is-active is-right' : ''}${index < (frame.aux?.rightPos ?? 0) ? ' is-spent' : ''}`}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <span className="lane-note">compare fronts</span>
            </>
          )}
          {frame.keyValue !== null && (
            <div className="lane-key">
              <span className="lane-label">held key</span>
              <span className="lane-cell is-active">{frame.keyValue}</span>
              <span className="lane-note">lifted out of the array</span>
            </div>
          )}
        </div>
      )}

      <div className="bars-plot" ref={ref}>
        {count === 0 ? (
          <div className="bars-empty">No values in the array.</div>
        ) : width > 10 && height > 10 ? (
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Array of ${count} values. ${frame.note}`}
          >
            {frame.range && (
              <rect
                x={left + frame.range[0] * step}
                y={top - 4}
                width={Math.max(1, (frame.range[1] - frame.range[0] + 1) * step)}
                height={plotHeight + 4}
                fill="var(--surface-sunken)"
                opacity={0.42}
                rx={2}
              />
            )}
            {frame.range && (
              <g stroke="var(--line-strong)" strokeWidth={1}>
                <line
                  x1={left + frame.range[0] * step + 1}
                  x2={left + (frame.range[1] + 1) * step - 1}
                  y1={top - 8}
                  y2={top - 8}
                />
                <line x1={left + frame.range[0] * step + 1} x2={left + frame.range[0] * step + 1} y1={top - 8} y2={top - 3} />
                <line
                  x1={left + (frame.range[1] + 1) * step - 1}
                  x2={left + (frame.range[1] + 1) * step - 1}
                  y1={top - 8}
                  y2={top - 3}
                />
              </g>
            )}

            {[highValue, lowValue].map((value, index) => {
              const y = yFor(value)
              return (
                <g key={`grid-${index}`}>
                  <line
                    x1={left}
                    x2={width - right}
                    y1={y}
                    y2={y}
                    stroke="var(--line)"
                    strokeDasharray="2 5"
                    opacity={0.7}
                  />
                  <text x={left - 7} y={y + 3} textAnchor="end" className="axis-text">
                    {shortValue(value)}
                  </text>
                </g>
              )
            })}

            <line
              x1={left}
              x2={width - right}
              y1={zeroY}
              y2={zeroY}
              stroke="var(--line-strong)"
              strokeWidth={1}
            />

            {values.map((value, index) => {
              const yValue = yFor(value)
              const barY = Math.min(yValue, zeroY)
              const barH = Math.max(1, Math.abs(yValue - zeroY))
              const x = left + index * step + gap / 2
              const color = barColor(index)
              const mark = markColor(index)
              const outsideHeap = frame.heapSize !== null && index >= frame.heapSize && !frame.sorted[index]
              return (
                <g key={`bar-${index}`} opacity={outsideHeap ? 0.34 : 1}>
                  <rect
                    x={x}
                    y={barY}
                    width={barWidth}
                    height={barH}
                    fill={color}
                    stroke={mark ? 'var(--ink)' : 'none'}
                    strokeOpacity={0.18}
                    rx={barWidth > 5 ? 1 : 0}
                  >
                    <title>{`index ${index}: ${value}`}</title>
                  </rect>
                  {frame.sorted[index] && (
                    <rect
                      x={x + barWidth / 2 - 2}
                      y={zeroY + 3}
                      width={4}
                      height={3}
                      fill="var(--accent)"
                      rx={0.5}
                    />
                  )}
                  {showValues && (
                    <text
                      x={x + barWidth / 2}
                      y={value >= 0 ? barY - 5 : barY + barH + 10}
                      textAnchor="middle"
                      className="bar-value"
                    >
                      {value}
                    </text>
                  )}
                  {showAllIndices && (
                    <text
                      x={x + barWidth / 2}
                      y={height - 8}
                      textAnchor="middle"
                      className="axis-index"
                    >
                      {index}
                    </text>
                  )}
                </g>
              )
            })}

            {pairX && (
              <g
                stroke={isSwap ? 'var(--swap-fill)' : 'var(--compare-fill)'}
                strokeWidth={1.4}
                fill="none"
              >
                <path
                  d={`M ${pairX.x1} ${top - 17} L ${pairX.x1} ${top - 13} L ${pairX.x2} ${top - 13} L ${pairX.x2} ${top - 17}`}
                />
              </g>
            )}

            {frame.pivot !== null && (
              <path
                d={`M ${left + frame.pivot * step + barWidth / 2} ${top - 21} l 3.5 3.5 l -3.5 3.5 l -3.5 -3.5 z`}
                fill="var(--pivot-fill)"
              />
            )}

            {frame.min !== null && frame.min !== frame.pivot && (
              <path
                d={`M ${left + frame.min * step + barWidth / 2} ${top - 15} l 3.5 -5 l 3.5 5 z`}
                fill="var(--compare-fill)"
              />
            )}

            {frame.key !== null && (
              <rect
                x={left + frame.key * step + gap / 2 - 1}
                y={top + 1}
                width={barWidth + 2}
                height={plotHeight - 1}
                fill="none"
                stroke="var(--accent)"
                strokeDasharray="3 3"
                opacity={0.55}
              />
            )}

            {!showAllIndices &&
              values.map((_, index) =>
                index % indexStride === 0 ? (
                  <text
                    key={`idx-${index}`}
                    x={left + index * step + barWidth / 2}
                    y={height - 8}
                    textAnchor="middle"
                    className="axis-index"
                  >
                    {index}
                  </text>
                ) : null,
              )}
          </svg>
        ) : null}
      </div>
    </div>
  )
}
