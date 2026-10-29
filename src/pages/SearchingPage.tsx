import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowDownAZ,
  BookOpen,
  ChevronDown,
  Code2,
  Info,
  ListTree,
  ScanSearch,
} from 'lucide-react'
import { findSearch, SEARCH_ALGORITHMS } from '../algorithms/searching'
import type { SearchAlgorithm, SearchFrame } from '../engine/types'
import { usePlayback } from '../engine/usePlayback'
import { useAppState } from '../state/AppState'
import { useRecordVisit } from '../hooks/useRecordVisit'
import { randomInt } from '../lib/random'
import { LabHeader } from '../components/lab/LabHeader'
import { ArrayControls } from '../components/lab/ArrayControls'
import { PlaybackBar } from '../components/lab/PlaybackBar'
import { StatsRow } from '../components/lab/StatsRow'
import { PlotLegend } from '../components/lab/PlotLegend'
import { CodePanel } from '../components/lab/CodePanel'
import { TracePanel } from '../components/lab/TracePanel'
import { AlgorithmAbout } from '../components/lab/AlgorithmAbout'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { SearchCells } from '../components/viz/SearchCells'

function uniqueSortedValues(count: number): number[] {
  const set = new Set<number>()
  while (set.size < count) set.add(randomInt(4, 96))
  return Array.from(set).sort((a, b) => a - b)
}

function isSorted(values: number[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1] > values[index]) return false
  }
  return true
}

function initialData() {
  const values = uniqueSortedValues(14)
  return { values, target: values[Math.floor(values.length * 0.64)] }
}

interface SearchingLabProps {
  algorithm: SearchAlgorithm
}

function SearchingLab({ algorithm }: SearchingLabProps) {
  const navigate = useNavigate()
  const { settings } = useAppState()
  const initial = useMemo(initialData, [])
  const [values, setValues] = useState<number[]>(initial.values)
  const [target, setTarget] = useState(initial.target)
  const [targetDraft, setTargetDraft] = useState(String(initial.target))
  const [targetError, setTargetError] = useState<string | null>(null)
  const [runId, setRunId] = useState(0)
  const [tab, setTab] = useState<'code' | 'trace' | 'about'>('code')

  useRecordVisit({
    title: algorithm.info.name,
    path: `/searching/${algorithm.info.slug}`,
    group: 'Searching',
  })

  const sortedOk = !algorithm.info.requiresSorted || isSorted(values)
  const frames = useMemo(
    () => (sortedOk ? algorithm.run(values, target) : []),
    [algorithm, values, target, sortedOk],
  )
  const playback = usePlayback(frames.length, {
    resetKey: `${algorithm.info.slug}:${runId}:${target}:${values.length}`,
    baseDelay: 460,
    initialSpeed: Math.max(1, settings.defaultSpeed),
  })
  const frame: SearchFrame | undefined = frames[Math.min(playback.index, frames.length - 1)]
  const last = Math.max(0, frames.length - 1)
  const rangeSize =
    frame && frame.low !== null && frame.high !== null && frame.low <= frame.high
      ? frame.high - frame.low + 1
      : 0
  const resultLabel = frame?.found !== null && frame?.found !== undefined ? `index ${frame.found}` : frame?.kind === 'miss' ? 'absent' : '-'

  const updateValues = (next: number[]) => {
    setValues(next)
    setRunId((current) => current + 1)
    if (next.length > 0 && !next.includes(target)) {
      const replacement = next[Math.floor(next.length / 2)]
      setTarget(replacement)
      setTargetDraft(String(replacement))
      setTargetError(null)
    }
  }

  const applyTarget = () => {
    const trimmed = targetDraft.trim()
    if (!/^-?\d+$/.test(trimmed)) {
      setTargetError('Enter a whole number, such as 42 or −7.')
      return
    }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed) || Math.abs(parsed) > 999) {
      setTargetError('Keep the target between −999 and 999.')
      return
    }
    setTargetError(null)
    setTarget(parsed)
    setRunId((current) => current + 1)
  }

  const sortValues = () => {
    setValues((current) => [...current].sort((a, b) => a - b))
    setRunId((current) => current + 1)
  }

  const chooseAlgorithm = (slug: string) => {
    navigate(`/searching/${slug}`)
  }

  return (
    <div className="lab">
      <LabHeader
        icon={ScanSearch}
        title={algorithm.info.name}
        subtitle={`Searching lab · ${algorithm.info.tagline}`}
        mobilePicker={
          <div className="select-wrap">
            <select
              className="select"
              aria-label="Choose searching algorithm"
              value={algorithm.info.slug}
              onChange={(event) => chooseAlgorithm(event.target.value)}
            >
              {SEARCH_ALGORITHMS.map((item) => (
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
              to={algorithm.info.requiresSorted ? '/learn/binary-search' : '/learn/graph-search'}
              className="btn btn-sm btn-outline hide-sm"
            >
              <BookOpen aria-hidden="true" />
              Notes
            </Link>
            <span className="chip">target {target}</span>
          </>
        }
      />

      <div className="lab-body">
        <aside className="lab-rail" aria-label="Searching controls">
          <div className="rail-heading">
            <span>Algorithm</span>
            <span className="rail-heading-note">2 total</span>
          </div>
          <div className="rail-list">
            {SEARCH_ALGORITHMS.map((item) => (
              <button
                type="button"
                key={item.info.slug}
                className={`rail-item${item.info.slug === algorithm.info.slug ? ' is-active' : ''}`}
                onClick={() => chooseAlgorithm(item.info.slug)}
                aria-current={item.info.slug === algorithm.info.slug ? 'page' : undefined}
              >
                <span className="rail-item-name">{item.info.name}</span>
                <span className="rail-item-meta">{item.info.complexity.average}</span>
              </button>
            ))}
          </div>

          <div className="rail-section">
            <div className="rail-heading">
              <span>Target</span>
            </div>
            <div className="field">
              <label htmlFor="search-target" className="label">
                Value to find
                <span className="label-note">integer</span>
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                <input
                  id="search-target"
                  className="input"
                  type="number"
                  value={targetDraft}
                  onChange={(event) => {
                    setTargetDraft(event.target.value)
                    setTargetError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      applyTarget()
                    }
                  }}
                  aria-invalid={targetError ? true : undefined}
                  aria-describedby="target-help"
                />
                <Button size="sm" variant="secondary" onClick={applyTarget}>
                  Set
                </Button>
              </div>
              {targetError ? (
                <p className="error-text" role="alert">
                  {targetError}
                </p>
              ) : (
                <p className="hint" id="target-help">
                  {values.includes(target) ? 'Present in the current array.' : 'Not in the array - the search should conclude absent.'}
                </p>
              )}
            </div>
          </div>

          <ArrayControls
            values={values}
            onChange={updateValues}
            minSize={6}
            maxSize={32}
            allowShuffle={!algorithm.info.requiresSorted}
            generateSorted={algorithm.info.requiresSorted}
            hint={
              algorithm.info.requiresSorted
                ? 'Random arrays are generated in ascending order. Custom input can still be unsorted.'
                : 'Linear search makes no assumptions about order.'
            }
          />

          {algorithm.info.requiresSorted && (
            <div className="rail-section">
              <div className="rail-heading">
                <span>Order</span>
                <span className="rail-heading-note">{isSorted(values) ? 'sorted' : 'unsorted'}</span>
              </div>
              <p className={`rail-note${isSorted(values) ? '' : ' rail-note-warn'}`}>
                Binary search discards half the range after each probe. That is only sound when values are
                ordered - otherwise the target could be in the discarded half.
              </p>
              {!isSorted(values) && (
                <Button size="sm" variant="secondary" onClick={sortValues} style={{ marginTop: 7, width: '100%' }}>
                  <ArrowDownAZ aria-hidden="true" />
                  Sort ascending
                </Button>
              )}
            </div>
          )}

          {values.length === 0 && (
            <p className="rail-note rail-note-warn">The array is empty. Generate values or enter your own.</p>
          )}
        </aside>

        <section className="lab-main" aria-label="Searching visualization">
          <div className="stage">
            <div className="stage-top">
              <div className="stage-op">
                <Activity className="stage-op-icon" aria-hidden="true" />
                <span className="stage-op-text" title={frame?.note}>
                  {frame?.note ?? 'Binary search is paused until the array is sorted.'}
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
              {sortedOk && frame ? (
                <SearchCells
                  frame={frame}
                  showRange={algorithm.info.requiresSorted}
                  algorithmName={algorithm.info.shortName}
                />
              ) : (
                <div className="lab-empty">
                  <ArrowDownAZ aria-hidden="true" />
                  <span className="lab-empty-title">Binary search needs order</span>
                  <span className="lab-empty-text">
                    Without sorted input, discarding a half could throw away the target. Sort this array to
                    enable the trace.
                  </span>
                  <Button size="sm" variant="primary" onClick={sortValues}>
                    <ArrowDownAZ aria-hidden="true" />
                    Sort ascending
                  </Button>
                </div>
              )}
            </div>

            <PlotLegend
              items={
                algorithm.info.requiresSorted
                  ? [
                      { label: 'Active range', color: 'var(--accent-line)', shape: 'line' },
                      { label: 'Midpoint', color: 'var(--pivot-fill)' },
                      { label: 'Current', color: 'var(--swap-fill)' },
                      { label: 'Ruled out', color: 'var(--faint)', shape: 'ring' },
                      { label: 'Found', color: 'var(--accent)' },
                    ]
                  : [
                      { label: 'Current', color: 'var(--swap-fill)' },
                      { label: 'Checked', color: 'var(--faint)', shape: 'ring' },
                      { label: 'Found', color: 'var(--accent)' },
                    ]
              }
              note={algorithm.info.requiresSorted ? 'range shrinks after every probe' : 'each value is checked once'}
            />

            <div className="stage-stats">
              <StatsRow
                items={[
                  { label: 'Comparisons', value: frame?.stats.comparisons ?? 0 },
                  { label: 'Array reads', value: frame?.stats.accesses ?? 0 },
                  { label: 'Candidates', value: rangeSize },
                  { label: 'Result', value: resultLabel },
                ]}
              />
              <div className="stage-complexity">
                avg <b>{algorithm.info.complexity.average}</b>
              </div>
            </div>

            <PlaybackBar playback={playback} />
          </div>
        </section>

        <aside className="lab-inspector" aria-label="Search detail">
          <Tabs
            label="Search detail"
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
              <CodePanel code={algorithm.code} activeLine={frame?.line ?? 'init'} note={frame?.note} />
            )}
            {tab === 'trace' && <TracePanel frames={frames} index={playback.index} />}
            {tab === 'about' && (
              <div className="tab-panel">
                <AlgorithmAbout
                  description={algorithm.info.description}
                  howItWorks={algorithm.info.howItWorks}
                  complexity={algorithm.info.complexity}
                  badges={[
                    algorithm.info.requiresSorted ? 'requires sorted input' : 'works on unsorted input',
                    'returns an index',
                  ]}
                  takeaway={algorithm.info.takeaway}
                />
                <div className="about-foot">
                  <span>Related notes</span>
                  <Link
                    to={algorithm.info.requiresSorted ? '/learn/binary-search' : '/learn/graph-search'}
                    className="text-link"
                  >
                    Read more
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

export function SearchingPage() {
  const { slug } = useParams()
  const algorithm = findSearch(slug)
  if (!algorithm) return <Navigate to="/searching/linear-search" replace />
  return <SearchingLab algorithm={algorithm} />
}
