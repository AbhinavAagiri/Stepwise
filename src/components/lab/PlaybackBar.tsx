import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import type { Playback } from '../../engine/usePlayback'
import { PLAYBACK_SPEEDS } from '../../engine/usePlayback'
import { Tooltip } from '../ui/Tooltip'

interface PlaybackBarProps {
  playback: Playback
}

export function PlaybackBar({ playback }: PlaybackBarProps) {
  const last = Math.max(0, playback.total - 1)
  const percent = last > 0 ? (playback.index / last) * 100 : 0
  const sliderStyle = { '--progress': `${percent}%` } as CSSProperties

  return (
    <>
      <div className="playback" role="group" aria-label="Playback controls">
        <div className="playback-group">
          <Tooltip label="Reset">
            <button
              type="button"
              className="icon-btn"
              onClick={playback.reset}
              disabled={playback.atStart}
              aria-label="Reset to the first step"
            >
              <SkipBack aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip label="Step back">
            <button
              type="button"
              className="icon-btn"
              onClick={playback.prev}
              disabled={playback.atStart}
              aria-label="Step backward one operation"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
          </Tooltip>
          <button
            type="button"
            className="play-btn"
            onClick={playback.toggle}
            aria-label={playback.playing ? 'Pause execution' : 'Play execution'}
            disabled={last === 0}
          >
            {playback.playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <Tooltip label="Step forward">
            <button
              type="button"
              className="icon-btn"
              onClick={playback.next}
              disabled={playback.atEnd}
              aria-label="Step forward one operation"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip label="Jump to end">
            <button
              type="button"
              className="icon-btn"
              onClick={playback.finish}
              disabled={playback.atEnd}
              aria-label="Jump to the final step"
            >
              <SkipForward aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        <div className="playback-divider" aria-hidden="true" />

        <Tooltip label="Replay from start">
          <button
            type="button"
            className="icon-btn"
            onClick={playback.restart}
            disabled={last === 0}
            aria-label="Replay from the first step"
          >
            <RotateCcw aria-hidden="true" />
          </button>
        </Tooltip>

        <div className="playback-meta">
          <span aria-hidden="true">{playback.playing ? 'running' : playback.atEnd ? 'complete' : 'idle'}</span>
          <span aria-hidden="true" className="playback-divider" style={{ height: 12 }} />
          <label htmlFor="playback-speed" className="sr-only">
            Playback speed
          </label>
          <div className="select-wrap">
            <select
              id="playback-speed"
              className="select speed-select"
              value={playback.speed}
              onChange={(event) => playback.setSpeed(Number(event.target.value))}
              aria-label="Playback speed"
            >
              {PLAYBACK_SPEEDS.map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="scrubber">
        <div className="scrub-rail">
          <div className="scrub-ticks" aria-hidden="true" />
          <input
            type="range"
            className="range range-progress"
            min={0}
            max={last}
            step={1}
            value={Math.min(playback.index, last)}
            onChange={(event) => playback.goTo(Number(event.target.value))}
            style={sliderStyle}
            aria-label="Execution step"
            aria-valuetext={`Step ${playback.index} of ${last}`}
            disabled={last === 0}
          />
        </div>
        <div className="scrub-labels">
          <span>0</span>
          <span>
            step <b>{playback.index}</b> / {last}
          </span>
          <span>{last}</span>
        </div>
      </div>
    </>
  )
}
