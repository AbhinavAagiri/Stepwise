import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Pause, Play, Shuffle } from 'lucide-react'
import { insertionSort } from '../../algorithms/sorting/insertion'
import { usePlayback } from '../../engine/usePlayback'
import { randomArray, shuffleArray } from '../../lib/random'
import { useAppState } from '../../state/AppState'
import { ArrayBars } from '../viz/ArrayBars'

export function LivePreview() {
  const [values, setValues] = useState(() => randomArray(18, 7, 94))
  const [run, setRun] = useState(0)
  const { reduceMotion } = useAppState()
  const frames = useMemo(() => insertionSort.run(values), [values])
  const playback = usePlayback(frames.length, {
    resetKey: run,
    baseDelay: 115,
    initialSpeed: 1.5,
    autoPlay: !reduceMotion,
  })
  const frame = frames[Math.min(playback.index, frames.length - 1)]

  const shuffle = () => {
    setValues((current) => shuffleArray(current))
    setRun((current) => current + 1)
  }

  const generate = () => {
    setValues(randomArray(18, 7, 94))
    setRun((current) => current + 1)
  }

  return (
    <div className="hero-demo">
      <div className="demo-head">
        <div className="demo-title">
          <span className="demo-live" aria-hidden="true" />
          insertion sort
          <span className="demo-divider" aria-hidden="true" />
          <span className="demo-muted">live engine</span>
        </div>
        <div className="demo-step">
          step <b>{playback.index}</b> / {Math.max(0, frames.length - 1)}
        </div>
      </div>

      <div className="demo-bars">
        <ArrayBars frame={frame} />
      </div>

      <div className="demo-foot">
        <div className="demo-controls">
          <button
            type="button"
            className="demo-play"
            onClick={playback.toggle}
            aria-label={playback.playing ? 'Pause preview' : 'Play preview'}
          >
            {playback.playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button type="button" className="icon-btn" onClick={shuffle} aria-label="Shuffle preview values">
            <Shuffle aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={generate}
            aria-label="Generate new preview values"
            title="New values"
          >
            <span className="mono" style={{ fontSize: 11 }}>↻</span>
          </button>
          <span className="demo-note">
            {frame.stats.comparisons} comparisons · {frame.stats.writes} writes
          </span>
        </div>
        <Link to="/sorting/insertion-sort" className="demo-link">
          Open the lab
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
