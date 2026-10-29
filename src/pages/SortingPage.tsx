import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowDownUp,
  BookOpen,
  ChevronDown,
  Code2,
  Info,
  ListTree,
} from 'lucide-react'
import { findSort, SORTING_ALGORITHMS } from '../algorithms/sorting'
import type { SortAlgorithm } from '../engine/types'
import { usePlayback } from '../engine/usePlayback'
import { useAppState } from '../state/AppState'
import { useRecordVisit } from '../hooks/useRecordVisit'
import { randomArray } from '../lib/random'
import { LabHeader } from '../components/lab/LabHeader'
import { ArrayControls } from '../components/lab/ArrayControls'
import { PlaybackBar } from '../components/lab/PlaybackBar'
import { StatsRow } from '../components/lab/StatsRow'
import { PlotLegend } from '../components/lab/PlotLegend'
import { CodePanel } from '../components/lab/CodePanel'
import { TracePanel } from '../components/lab/TracePanel'
import { AlgorithmAbout } from '../components/lab/AlgorithmAbout'
import { Tabs } from '../components/ui/Tabs'
import { ArrayBars } from '../components/viz/ArrayBars'
import { HeapTree } from '../components/viz/HeapTree'

interface SortingLabProps {
  algorithm: SortAlgorithm
}

function legendFor(slug: string) {
  if (slug === 'selection-sort') {
    return {
      items: [
        { label: 'Compare', color: 'var(--compare-fill)' },
        { label: 'Minimum', color: 'var(--compare-fill)' },
        { label: 'Settled', color: 'var(--accent)' },
      ],
      note: 'caret marks the current minimum',
    }
  }
  if (slug === 'insertion-sort') {
    return {
      items: [
        { label: 'Compare', color: 'var(--compare-fill)' },
        { label: 'Write / shift', color: 'var(--slate-fill)' },
        { label: 'Sorted prefix', color: 'var(--accent)' },
      ],
      note: 'dashed outline = held key',
    }
  }
  if (slug === 'merge-sort') {
    return {
      items: [
        { label: 'Active range', color: 'var(--viz-base)' },
        { label: 'Write', color: 'var(--slate-fill)' },
        { label: 'Sorted', color: 'var(--accent)' },
      ],
      note: 'lane shows the two merge buffers',
    }
  }
  if (slug === 'quick-sort') {
    return {
      items: [
        { label: 'Compare', color: 'var(--compare-fill)' },
        { label: 'Pivot', color: 'var(--pivot-fill)' },
        { label: 'Settled', color: 'var(--accent)' },
      ],
      note: 'diamond marks the active pivot',
    }
  }
  if (slug === 'heap-sort') {
    return {
      items: [
        { label: 'Compare', color: 'var(--compare-fill)' },
        { label: 'Swap', color: 'var(--swap-fill)' },
        { label: 'Settled', color: 'var(--accent)' },
      ],
      note: 'the tree mirrors the active heap',
    }
  }
  return {
    items: [
      { label: 'Compare', color: 'var(--compare-fill)' },
      { label: 'Swap', color: 'var(--swap-fill)' },
      { label: 'Settled', color: 'var(--accent)' },
    ],
    note: 'bracket marks the compared pair',
  }
}

function SortingLab({ algorithm }: SortingLabProps) {
  const navigate = useNavigate()
  const { settings } = useAppState()
  const [values, setValues] = useState(() => randomArray(24, 5, 96))
  const [runId, setRunId] = useState(0)
  const [tab, setTab] = useState<'code' | 'trace' | 'about'>('code')

  useRecordVisit({
    title: algorithm.info.name,
    path: `/sorting/${algorithm.info.slug}`,
    group: 'Sorting',
  })

  const frames = useMemo(() => algorithm.run(values), [algorithm, values])
  const playback = usePlayback(frames.length, {
    resetKey: `${algorithm.info.slug}:${runId}`,
    baseDelay: 120,
    initialSpeed: settings.defaultSpeed,
  })
  const frame = frames[Math.min(playback.index, frames.length - 1)] ?? frames[0]
  const legend = legendFor(algorithm.info.slug)
  const last = Math.max(0, frames.length - 1)

  const updateValues = (next: number[]) => {
    setValues(next)
    setRunId((current) => current + 1)
  }

  if (!frame) return null

  return (
    <div className="lab">
      <LabHeader
        icon={ArrowDownUp}
        title={algorithm.info.name}
        subtitle={`Sorting lab · ${algorithm.info.tagline}`}
        mobilePicker={
          <div className="select-wrap">
            <select
              className="select"
              aria-label="Choose sorting algorithm"
              value={algorithm.info.slug}
              onChange={(event) => navigate(`/sorting/${event.target.value}`)}
            >
              {SORTING_ALGORITHMS.map((item) => (
                <option key={item.info.slug} value={item.info.slug}>
                  {item.info.name}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" />
          </div>
        }
        actions={
          <>
            <Link
              to="/learn/sorting-basics"
              className="btn btn-sm btn-outline hide-sm"
              aria-label="Read the sorting notes"
            >
              <BookOpen aria-hidden="true" />
              Notes
            </Link>
            <span className="chip">{values.length} values</span>
          </>
        }
      />

      <div className="lab-body">
        <aside className="lab-rail" aria-label="Sorting controls">
          <div className="rail-heading">
            <span>Algorithm</span>
            <span className="rail-heading-note">6 total</span>
          </div>
          <div className="rail-list">
            {SORTING_ALGORITHMS.map((item) => (
              <button
                type="button"
                key={item.info.slug}
                className={`rail-item${item.info.slug === algorithm.info.slug ? ' is-active' : ''}`}
                onClick={() => navigate(`/sorting/${item.info.slug}`)}
                aria-current={item.info.slug === algorithm.info.slug ? 'page' : undefined}
              >
                <span className="rail-item-name">{item.info.name}</span>
                <span className="rail-item-meta">{item.info.complexity.average}</span>
              </button>
            ))}
          </div>

          <ArrayControls
            values={values}
            onChange={updateValues}
            minSize={8}
            maxSize={64}
            hint="Empty and single-value arrays are valid inputs."
          />

          <div className="rail-section">
            <div className="rail-heading">
              <span>This run</span>
            </div>
            <div className="inline-meta">
              <span>{algorithm.info.family === 'quadratic' ? 'comparison sort' : algorithm.info.family === 'divide' ? 'divide & conquer' : 'heap-based'}</span>
              <span className="sep">/</span>
              <span>{algorithm.info.stable ? 'stable' : 'not stable'}</span>
              <span className="sep">/</span>
              <span>{algorithm.info.inPlace ? 'in place' : 'extra buffer'}</span>
            </div>
            {algorithm.info.slug === 'heap-sort' && (
              <p className="rail-note">
                The lower panel is the same array drawn as a complete binary tree. Sorted values leave the
                heap and fade out of the tree.
              </p>
            )}
            {algorithm.info.slug === 'merge-sort' && (
              <p className="rail-note">
                The buffer lane above the chart shows exactly which values each half has left to merge.
              </p>
            )}
            {values.length === 0 && (
              <p className="rail-note rail-note-warn">The array is empty. Add values or generate a new one.</p>
            )}
          </div>
        </aside>

        <section className="lab-main" aria-label="Sorting visualization">
          <div className="stage">
            <div className="stage-top">
              <div className="stage-op">
                <Activity className="stage-op-icon" aria-hidden="true" />
                <span className="stage-op-text" title={frame.note}>
                  {frame.note}
                </span>
              </div>
              <div className="stage-meta">
                <span>{algorithm.info.shortName.toLowerCase()}</span>
                <span className="sep">·</span>
                <span>
                  step <b>{playback.index}</b> / {last}
                </span>
              </div>
            </div>

            <div className="stage-plot">
              {algorithm.info.slug === 'heap-sort' ? (
                <div className="heap-split">
                  <div className="heap-bars">
                    <ArrayBars frame={frame} />
                  </div>
                  <HeapTree frame={frame} />
                </div>
              ) : (
                <ArrayBars frame={frame} />
              )}
            </div>

            <PlotLegend items={legend.items} note={legend.note} />

            <div className="stage-stats">
              <StatsRow
                items={[
                  { label: 'Comparisons', value: frame.stats.comparisons },
                  { label: 'Swaps', value: frame.stats.swaps },
                  { label: 'Writes', value: frame.stats.writes },
                  { label: 'Array reads', value: frame.stats.accesses },
                ]}
              />
              <div className="stage-complexity">
                avg <b>{algorithm.info.complexity.average}</b>
              </div>
            </div>

            <PlaybackBar playback={playback} />
          </div>
        </section>

        <aside className="lab-inspector" aria-label="Algorithm detail">
          <Tabs
            label="Algorithm detail"
            value={tab}
            onChange={(next) => setTab(next as 'code' | 'trace' | 'about')}
            items={[
              { id: 'code', label: 'Code', icon: Code2 },
              { id: 'trace', label: 'Trace', icon: ListTree },
              { id: 'about', label: 'About', icon: Info },
            ]}
          />
          <div className="inspector-body" role="tabpanel" aria-label={`${tab} panel`}>
            {tab === 'code' && (
              <CodePanel
                code={algorithm.code}
                activeLine={frame.line}
                note={frame.note}
              />
            )}
            {tab === 'trace' && <TracePanel frames={frames} index={playback.index} />}
            {tab === 'about' && (
              <div className="tab-panel">
                <AlgorithmAbout
                  description={algorithm.info.description}
                  howItWorks={algorithm.info.howItWorks}
                  complexity={algorithm.info.complexity}
                  badges={[
                    algorithm.info.stable ? 'stable' : 'unstable',
                    algorithm.info.inPlace ? 'in place' : 'uses buffer',
                    algorithm.info.adaptive ? 'adaptive' : 'fixed work',
                  ]}
                  takeaway={algorithm.info.takeaway}
                />
                <div className="about-foot">
                  <span>Want the longer explanation?</span>
                  <Link to="/learn/sorting-basics" className="text-link">
                    Read the notes
                  </Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export function SortingPage() {
  const { slug } = useParams()
  const algorithm = findSort(slug)
  if (!algorithm) return <Navigate to="/sorting/bubble-sort" replace />
  return <SortingLab algorithm={algorithm} />
}
