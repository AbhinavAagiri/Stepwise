export type SparkKind = 'sorting' | 'searching' | 'pathfinding' | 'structures' | 'recursion'

export function TopicSpark({ kind }: { kind: SparkKind }) {
  if (kind === 'sorting') {
    const heights = [12, 18, 26, 22, 34, 30]
    return (
      <svg viewBox="0 0 112 44" className="topic-spark" aria-hidden="true">
        <line x1="4" y1="38" x2="108" y2="38" stroke="var(--line-strong)" />
        {heights.map((height, index) => (
          <rect
            key={index}
            x={8 + index * 17}
            y={38 - height}
            width={11}
            height={height}
            fill={index === 3 ? 'var(--accent)' : 'var(--viz-base)'}
            opacity={index === 3 ? 1 : 0.55}
            className={index === 3 ? 'spark-accent' : undefined}
          />
        ))}
      </svg>
    )
  }

  if (kind === 'searching') {
    return (
      <svg viewBox="0 0 112 44" className="topic-spark" aria-hidden="true">
        <line x1="8" y1="12" x2="70" y2="12" stroke="var(--accent)" />
        <line x1="8" y1="8" x2="8" y2="16" stroke="var(--accent)" />
        <line x1="70" y1="8" x2="70" y2="16" stroke="var(--accent)" />
        {Array.from({ length: 8 }).map((_, index) => {
          const x = 4 + index * 13.5
          const active = index === 4
          return (
            <g key={index}>
              <rect
                x={x}
                y={23}
                width={10}
                height={12}
                fill={active ? 'var(--accent)' : 'var(--surface-sunken)'}
                stroke={active ? 'var(--accent)' : 'var(--line-strong)'}
                rx={1}
              />
              {active && (
                <path d="M105 11l3 4h-6z" fill="var(--swap)" className="spark-accent" />
              )}
            </g>
          )
        })}
        <circle cx="106.5" cy="30" r="3.5" fill="none" stroke="var(--swap)" strokeWidth="1.6" />
        <line x1="109" y1="33" x2="112" y2="37" stroke="var(--swap)" strokeWidth="1.6" />
      </svg>
    )
  }

  if (kind === 'pathfinding') {
    const cols = 9
    const rows = 4
    const cells = []
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const isWall = (x === 3 && y < 3) || (x === 6 && y > 0)
        const isStart = x === 0 && y === 2
        const isEnd = x === 8 && y === 1
        const isPath = (x === 0 && y === 2) || (x === 1 && y === 2) || (x === 2 && y === 2) || (x === 2 && y === 1) || (x === 4 && y === 1) || (x === 5 && y === 1) || (x === 6 && y === 1)
        cells.push(
          <rect
            key={`${x}-${y}`}
            x={8 + x * 10.5}
            y={5 + y * 8.5}
            width={9}
            height={7}
            fill={
              isWall
                ? 'var(--ink)'
                : isStart || isEnd
                  ? isEnd
                    ? 'var(--swap)'
                    : 'var(--accent)'
                  : isPath
                    ? 'var(--accent-line)'
                    : 'var(--surface-sunken)'
            }
            stroke="var(--surface-raised)"
            strokeWidth={0.6}
          />
        )
      }
    }
    return (
      <svg viewBox="0 0 112 44" className="topic-spark" aria-hidden="true">
        {cells}
      </svg>
    )
  }

  if (kind === 'structures') {
    return (
      <svg viewBox="0 0 112 44" className="topic-spark" aria-hidden="true">
        <line x1="18" y1="22" x2="39" y2="22" stroke="var(--line-strong)" />
        <line x1="55" y1="22" x2="76" y2="22" stroke="var(--line-strong)" />
        <path d="M38 19l3 3-3 3" fill="none" stroke="var(--line-strong)" />
        <path d="M75 19l3 3-3 3" fill="none" stroke="var(--line-strong)" />
        {[8, 45.5, 83].map((x, index) => (
          <g key={x}>
            <rect
              x={x}
              y={14}
              width={16}
              height={16}
              rx={2}
              fill={index === 1 ? 'var(--accent)' : 'var(--surface-sunken)'}
              stroke={index === 1 ? 'var(--accent)' : 'var(--line-strong)'}
            />
            <circle cx={x + 16} cy={19} r={1.4} fill={index === 1 ? 'var(--accent-ink)' : 'var(--faint)'} />
          </g>
        ))}
        <text x="4" y="41" className="spark-label">head</text>
        <text x="88" y="41" className="spark-label">null</text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 112 44" className="topic-spark" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <rect
            x={14 + index * 14}
            y={9 + index * 10}
            width={58 - index * 4}
            height={13}
            rx={1.5}
            fill={index === 2 ? 'var(--accent-soft)' : 'var(--surface-sunken)'}
            stroke={index === 2 ? 'var(--accent)' : 'var(--line-strong)'}
          />
          <text x={19 + index * 14} y={18 + index * 10} className="spark-label">
            {index === 0 ? 'f(3)' : index === 1 ? 'f(2)' : 'f(1) base'}
          </text>
        </g>
      ))}
      <path d="M78 9v20" stroke="var(--line-strong)" strokeDasharray="2 3" />
      <path d="M76 27l2 3 2-3" fill="none" stroke="var(--line-strong)" />
      <text x="85" y="24" className="spark-label">returns</text>
    </svg>
  )
}
