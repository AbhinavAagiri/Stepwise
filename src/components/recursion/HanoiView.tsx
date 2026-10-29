import type { RecursionFrame } from '../../engine/types'

interface HanoiViewProps {
  frame: RecursionFrame
  disks: number
}

const ROD_NAMES = ['A', 'B', 'C']

export function HanoiView({ frame, disks }: HanoiViewProps) {
  const state = frame.hanoi
  if (!state) return null
  const moving = state.moving
  const minimumMoves = 2 ** disks - 1

  return (
    <div className="hanoi-scene">
      <div className="hanoi-readout">
        <span>
          move <b>{frame.moveCount ?? 0}</b> / {minimumMoves}
        </span>
        <span className={moving ? 'hanoi-move is-active' : 'hanoi-move'}>
          {moving
            ? `disk ${moving.disk}: ${ROD_NAMES[moving.from]} → ${ROD_NAMES[moving.to]}`
            : 'between moves'}
        </span>
      </div>

      <div className="hanoi-rods">
        {state.rods.map((rod, rodIndex) => {
          const isFrom = moving?.from === rodIndex
          const isTo = moving?.to === rodIndex
          return (
            <div
              key={ROD_NAMES[rodIndex]}
              className={`hanoi-rod${isFrom ? ' is-from' : ''}${isTo ? ' is-to' : ''}`}
            >
              <div className="hanoi-stack">
                {rod
                  .slice()
                  .reverse()
                  .map((disk) => (
                    <div
                      key={disk}
                      className={`hanoi-disk${moving?.disk === disk ? ' is-moving' : ''}`}
                      style={{
                        width: `${34 + (disk / Math.max(1, disks)) * 62}%`,
                        height: `${Math.max(13, 29 - disks * 2)}px`,
                      }}
                      title={`disk ${disk}`}
                    >
                      <span>{disk}</span>
                    </div>
                  ))}
              </div>
              <div className="hanoi-base" />
              <span className="hanoi-rod-label">
                {ROD_NAMES[rodIndex]}
                <small>{rod.length}</small>
              </span>
            </div>
          )
        })}
      </div>

      <p className="hanoi-caption">
        The goal is to rebuild the tower on rod C. A larger disk can never sit on a smaller one, so the
        recursive calls clear smaller disks out of the way first.
      </p>
    </div>
  )
}
