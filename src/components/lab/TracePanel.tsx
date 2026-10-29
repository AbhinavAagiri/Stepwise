import { useEffect, useRef } from 'react'

interface TraceFrame {
  note: string
}

interface TracePanelProps {
  frames: TraceFrame[]
  index: number
}

export function TracePanel({ frames, index }: TracePanelProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const start = Math.max(0, index - 80)
  const visible = frames.slice(start, index + 1).map((frame, offset) => ({
    note: frame.note,
    step: start + offset,
  }))

  useEffect(() => {
    const element = listRef.current?.querySelector<HTMLElement>('[data-current="true"]')
    element?.scrollIntoView({ block: 'nearest' })
  }, [index])

  return (
    <div className="trace-shell">
      <div className="trace-head">
        <span>execution trace</span>
        <span>
          {index + 1} / {frames.length} frames
        </span>
      </div>
      <div className="trace-list" ref={listRef}>
        {start > 0 && <div className="trace-cut">… {start} earlier frames not shown</div>}
        {visible.map((frame) => (
          <div
            key={frame.step}
            className={`trace-item${frame.step === index ? ' is-current' : ''}`}
            data-current={frame.step === index}
          >
            <span className="trace-index">{String(frame.step).padStart(3, '0')}</span>
            <span>{frame.note}</span>
          </div>
        ))}
        {frames.length === 0 && (
          <div className="lab-empty">
            <span className="lab-empty-title">No trace yet</span>
            <span className="lab-empty-text">Load an array to generate an execution trace.</span>
          </div>
        )}
      </div>
    </div>
  )
}
