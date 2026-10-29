import type { RecursionDemo, RecursionFrame, SearchFrame } from '../../engine/types'
import { CallStack } from './CallStack'
import { FibTree } from './FibTree'
import { HanoiView } from './HanoiView'
import { SearchCells } from '../viz/SearchCells'

interface RecursionSceneProps {
  demo: RecursionDemo
  frame: RecursionFrame
  n: number
}

function searchFrameFrom(frame: RecursionFrame): SearchFrame {
  const array = frame.array ?? []
  const found = typeof frame.result === 'number' && frame.result >= 0 ? frame.result : null
  const empty =
    frame.low !== null &&
    frame.low !== undefined &&
    frame.high !== null &&
    frame.high !== undefined &&
    frame.low > frame.high
  const kind: SearchFrame['kind'] = found !== null ? 'found' : empty ? 'miss' : 'probe'
  return {
    array,
    target: frame.target ?? 0,
    current: null,
    mid: frame.mid ?? null,
    low: frame.low ?? null,
    high: frame.high ?? null,
    eliminated: frame.eliminated ?? array.map(() => false),
    found,
    kind,
    line: frame.line,
    note: frame.note,
    stats: {
      comparisons: Math.max(0, frame.stack.length - 1),
      swaps: 0,
      writes: 0,
      accesses: Math.max(0, frame.stack.length - 1),
    },
  }
}

export function RecursionScene({ demo, frame, n }: RecursionSceneProps) {
  const slug = demo.info.slug

  if (slug === 'factorial') {
    return (
      <div className="rec-factorial">
        <div className="rec-factorial-head">
          <span className="rec-figure-kicker">the product being assembled</span>
          <span className="rec-factorial-formula">
            {n <= 1
              ? '1'
              : Array.from({ length: n }, (_, index) => n - index)
                    .slice(0, n <= 4 ? n : 2)
                    .join(' × ') + (n > 4 ? ' × … × 1' : '')}
          </span>
        </div>
        <div className="rec-factorial-flow">
          <span className="rec-flow-side rec-flow-in" aria-hidden="true">
            calls ↓
          </span>
          <CallStack
            stack={frame.stack}
            large
            emptyNote="The stack is empty. Start playback to watch factorial calls accumulate."
          />
          <span className="rec-flow-side rec-flow-out" aria-hidden="true">
            returns ↑
          </span>
        </div>
        {frame.result !== null && (
          <div className="rec-result-band">
            <span>returned to the top</span>
            <strong>
              factorial({n}) = {frame.result}
            </strong>
          </div>
        )}
      </div>
    )
  }

  if (slug === 'fibonacci') {
    return (
      <div className="rec-split is-stacked">
        <div className="rec-primary">
          <FibTree frame={frame} />
        </div>
        <CallStack
          stack={frame.stack}
          emptyNote="The recursive calls have all returned. The tree holds the record."
        />
      </div>
    )
  }

  if (slug === 'tower-of-hanoi') {
    return (
      <div className="rec-split">
        <div className="rec-primary">
          <HanoiView frame={frame} disks={n} />
        </div>
        <CallStack
          stack={frame.stack}
          emptyNote="Every disk has reached rod C. The stack unwound completely."
        />
      </div>
    )
  }

  const searchFrame = searchFrameFrom(frame)
  return (
    <div className="rec-split is-stacked">
      <div className="rec-primary rec-search-scene">
        <div className="rec-search-head">
          <span className="rec-figure-kicker">the current interval</span>
          <span className="rec-search-range">
            low {frame.low ?? '-'} · high {frame.high ?? '-'} · mid {frame.mid ?? '-'}
          </span>
        </div>
        <SearchCells
          frame={searchFrame}
          showRange
          algorithmName="Recursive binary search"
        />
      </div>
      <CallStack
        stack={frame.stack}
        emptyNote="The search has returned. No intervals remain on the stack."
      />
    </div>
  )
}
