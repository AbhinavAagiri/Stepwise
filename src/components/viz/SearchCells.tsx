import { useEffect, useRef } from 'react'
import type { SearchFrame } from '../../engine/types'
import { useAppState } from '../../state/AppState'

interface SearchCellsProps {
  frame: SearchFrame
  showRange: boolean
  algorithmName: string
}

export function SearchCells({ frame, showRange, algorithmName }: SearchCellsProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const { reduceMotion } = useAppState()
  const count = frame.array.length
  const cell = count > 24 ? 32 : 40
  const gap = 6
  const trackWidth = Math.max(0, count * cell + Math.max(0, count - 1) * gap)
  const hasRange = showRange && frame.low !== null && frame.high !== null && frame.low <= frame.high
  const rangeLeft = hasRange ? (frame.low as number) * (cell + gap) : 0
  const rangeWidth = hasRange ? ((frame.high as number) - (frame.low as number) + 1) * (cell + gap) - gap : 0

  useEffect(() => {
    const strip = stripRef.current
    const focusIndex = frame.found ?? frame.current ?? frame.mid
    if (!strip || focusIndex === null || focusIndex === undefined) return
    const targetLeft = focusIndex * (cell + gap)
    const left = targetLeft - strip.clientWidth / 2 + cell / 2
    strip.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [cell, frame.current, frame.found, frame.mid, gap, reduceMotion])

  return (
    <div className="search-view">
      <div className="search-readout">
        <span>
          target <b>{frame.target}</b>
        </span>
        {hasRange ? (
          <span>
            range <b>{frame.low}-{frame.high}</b>
          </span>
        ) : (
          <span className="search-readout-muted">no active range</span>
        )}
        <span>
          step <b>{frame.stats.comparisons}</b>
        </span>
        {frame.found !== null && <span className="search-hit">found at index {frame.found}</span>}
      </div>

      <div className="search-strip" ref={stripRef}>
        <div className="search-track" style={{ width: `${Math.max(trackWidth, 100)}px` }}>
          {hasRange && (
            <div
              className="search-window"
              style={{ left: `${rangeLeft}px`, width: `${rangeWidth}px` }}
              aria-hidden="true"
            >
              <span className="search-window-label">lo {frame.low}</span>
              <span className="search-window-label search-window-label-end">hi {frame.high}</span>
            </div>
          )}
          <div className="search-cells" style={{ gap: `${gap}px` }}>
            {frame.array.map((value, index) => {
              const isMid = frame.mid === index
              const isCurrent = frame.current === index
              const isFound = frame.found === index
              const eliminated = frame.eliminated[index]
              const inRange =
                hasRange && frame.low !== null && frame.high !== null && index >= frame.low && index <= frame.high
              return (
                <div
                  key={`${index}-${value}`}
                  className={[
                    'search-cell',
                    eliminated ? 'is-eliminated' : '',
                    inRange ? 'is-in-range' : '',
                    isMid ? 'is-mid' : '',
                    isCurrent && !isFound ? 'is-current' : '',
                    isFound ? 'is-found' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ width: `${cell}px` }}
                >
                  {isMid && !isFound && (
                    <span className="cell-flag" aria-hidden="true">
                      mid
                    </span>
                  )}
                  {isFound && (
                    <span className="cell-flag cell-flag-found" aria-hidden="true">
                      hit
                    </span>
                  )}
                  <span className="search-cell-value">{value}</span>
                  <span className="search-cell-index">{index}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <p className="search-caption">
        {frame.kind === 'miss'
          ? `${algorithmName} concluded: ${frame.target} is not present.`
          : frame.kind === 'found'
            ? `${algorithmName} matched ${frame.target} at index ${frame.found}.`
            : frame.note}
      </p>
    </div>
  )
}
