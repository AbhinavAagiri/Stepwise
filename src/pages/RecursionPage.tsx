import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  BookOpen,
  ChevronDown,
  Code2,
  Info,
  Layers,
  ListTree,
  Minus,
  Plus,
} from 'lucide-react'
import {
  findRecursionDemo,
  RECURSION_DEMOS,
} from '../algorithms/recursion'
import type { RecursionDemo } from '../engine/types'
import { usePlayback } from '../engine/usePlayback'
import { useAppState } from '../state/AppState'
import { useRecordVisit } from '../hooks/useRecordVisit'
import { parseNumberList, randomInt } from '../lib/random'
import { LabHeader } from '../components/lab/LabHeader'
import { PlaybackBar } from '../components/lab/PlaybackBar'
import { StatsRow, type StatItem } from '../components/lab/StatsRow'
import { PlotLegend } from '../components/lab/PlotLegend'
import { CodePanel } from '../components/lab/CodePanel'
import { TracePanel } from '../components/lab/TracePanel'
import { AlgorithmAbout } from '../components/lab/AlgorithmAbout'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { RecursionScene } from '../components/recursion/RecursionScene'

const INITIAL_SEARCH_VALUES = [2, 4, 7, 9, 12, 15, 18, 21, 24, 27]
const INITIAL_SEARCH_TARGET = 18

const PRESETS: Record<string, number[]> = {
  factorial: [3, 4, 5, 6],
  fibonacci: [4, 5, 6, 7],
  'tower-of-hanoi': [2, 3, 4, 5],
}

const NOTES: Record<string, string> = {
  factorial: 'The base case is n ≤ 1. The final call to return hands the finished product back to the top.',
  fibonacci: 'Calls with the same n are recomputed. The repeated markers expose that wasted work.',
  'tower-of-hanoi': 'Each extra disk doubles the move count: 2ⁿ − 1. The smallest disk moves almost every other move.',
  'recursive-search': 'Each frame keeps its own low and high. Nothing is shared except the read-only array.',
}

function sortedSample(): number[] {
  const set = new Set<number>()
  while (set.size < 10) set.add(randomInt(3, 98))
  return Array.from(set).sort((a, b) => a - b)
}


interface RecursionLabProps {
  demo: RecursionDemo
}

function RecursionLab({ demo }: RecursionLabProps) {
  const navigate = useNavigate()
  const { settings } = useAppState()
  const isSearch = demo.inputMode === 'search'
  const presets = PRESETS[demo.info.slug] ?? []

  const [n, setN] = useState(demo.info.defaultValue)
  const [nDraft, setNDraft] = useState(String(demo.info.defaultValue))
  const [nError, setNError] = useState<string | null>(null)

  const [values, setValues] = useState<number[]>(INITIAL_SEARCH_VALUES)
  const [valuesDraft, setValuesDraft] = useState(INITIAL_SEARCH_VALUES.join(', '))
  const [target, setTarget] = useState(INITIAL_SEARCH_TARGET)
  const [targetDraft, setTargetDraft] = useState(String(INITIAL_SEARCH_TARGET))
  const [searchError, setSearchError] = useState<string | null>(null)
  const [tab, setTab] = useState<'code' | 'trace' | 'about'>('code')

  useRecordVisit({
    title: demo.info.name,
    path: `/recursion/${demo.info.slug}`,
    group: 'Recursion',
  })

  const trace = useMemo(
    () => demo.run(isSearch ? { n: 0, values, target } : { n }),
    [demo, isSearch, n, values, target],
  )
  const frames = trace.frames
  const playback = usePlayback(frames.length, {
    resetKey: `${demo.info.slug}:${n}:${values.join(',')}:${target}`,
    baseDelay: 660,
    initialSpeed: Math.max(1, settings.defaultSpeed),
  })
  const index = Math.min(playback.index, Math.max(0, frames.length - 1))
  const frame = frames[index] ?? frames[0]
  const last = Math.max(0, frames.length - 1)

  if (!frame) return null

  const setNValue = (next: number) => {
    const clamped = Math.max(demo.info.min, Math.min(demo.info.max, Math.round(next)))
    setN(clamped)
    setNDraft(String(clamped))
    setNError(null)
  }

  const handleNInput = (raw: string) => {
    setNDraft(raw)
    if (raw.trim() === '') {
      setNError('Enter a whole number.')
      return
    }
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed < demo.info.min || parsed > demo.info.max) {
      setNError(`Choose a whole number from ${demo.info.min} to ${demo.info.max}.`)
      return
    }
    setNError(null)
    setN(parsed)
  }

  const pickTarget = (next: number) => {
    setTarget(next)
    setTargetDraft(String(next))
    setSearchError(null)
  }

  const applySearchInput = () => {
    const parsedValues = parseNumberList(valuesDraft, 16)
    if (parsedValues.error || !parsedValues.values) {
      setSearchError(parsedValues.error ?? 'Enter a valid list of numbers.')
      return
    }
    if (parsedValues.values.length < 2) {
      setSearchError('Enter at least two values so there is an interval to divide.')
      return
    }
    const trimmedTarget = targetDraft.trim()
    if (!/^-?\d+$/.test(trimmedTarget)) {
      setSearchError('The target must be a whole number.')
      return
    }
    const nextTarget = Number(trimmedTarget)
    if (!Number.isFinite(nextTarget) || Math.abs(nextTarget) > 999) {
      setSearchError('Keep the target between −999 and 999.')
      return
    }
    const sorted = parsedValues.values.slice().sort((a, b) => a - b)
    setValues(sorted)
    setValuesDraft(sorted.join(', '))
    setTarget(nextTarget)
    setTargetDraft(String(nextTarget))
    setSearchError(null)
  }

  const regenerateSearch = () => {
    const next = sortedSample()
    const nextTarget = next[Math.floor(next.length * 0.7)]
    setValues(next)
    setValuesDraft(next.join(', '))
    setTarget(nextTarget)
    setTargetDraft(String(nextTarget))
    setSearchError(null)
  }

  const absentTarget = () => {
    const highest = values.length > 0 ? Math.max(...values) : 0
    pickTarget(highest + 3 <= 999 ? highest + 3 : highest - 3)
  }

  const stats: StatItem[] = (() => {
    if (demo.info.slug === 'fibonacci') {
      return [
        { label: 'Call depth', value: frame.stack.length },
        { label: 'Calls made', value: frame.callCount ?? 0 },
        { label: 'Repeated', value: frame.repeatedCount ?? 0 },
        { label: 'Result', value: frame.result ?? '-' },
      ]
    }
    if (demo.info.slug === 'tower-of-hanoi') {
      return [
        { label: 'Call depth', value: frame.stack.length },
        { label: 'Moves made', value: frame.moveCount ?? 0 },
        { label: 'Disks', value: n },
        { label: 'Result', value: frame.result ?? '-' },
      ]
    }
    if (demo.info.slug === 'recursive-search') {
      const low = frame.low
      const high = frame.high
      const inRange =
        typeof low === 'number' && typeof high === 'number' && low <= high
          ? high - low + 1
          : 0
      return [
        { label: 'Call depth', value: frame.stack.length },
        { label: 'Candidates', value: inRange },
        { label: 'Target', value: target },
        { label: 'Result', value: frame.result ?? '-' },
      ]
    }
    return [
      { label: 'Call depth', value: frame.stack.length },
      { label: 'Returned frames', value: frame.stack.filter((entry) => entry.status === 'returned').length },
      { label: 'Input', value: n },
      { label: 'Result', value: frame.result ?? '-' },
    ]
  })()

  const legend =
    demo.info.slug === 'recursive-search'
      ? {
          items: [
            { label: 'Active interval', color: 'var(--accent-line)', shape: 'line' as const },
            { label: 'Midpoint', color: 'var(--pivot-fill)' },
            { label: 'Found index', color: 'var(--accent)' },
            { label: 'Ruled out', color: 'var(--faint)', shape: 'ring' as const },
          ],
          note: 'the interval halves on each call',
        }
      : demo.info.slug === 'tower-of-hanoi'
        ? {
            items: [
              { label: 'Disk on a rod', color: 'var(--slate-fill)' },
              { label: 'Disk being moved', color: 'var(--compare-fill)' },
              { label: 'Call stack', color: 'var(--accent)' },
            ],
            note: 'disk number gives its size',
          }
        : demo.info.slug === 'fibonacci'
          ? {
              items: [
                { label: 'Active call', color: 'var(--accent)' },
                { label: 'Base case', color: 'var(--compare-fill)' },
                { label: 'Returned', color: 'var(--accent-line)' },
                { label: 'Repeated n', color: 'var(--swap-fill)' },
              ],
              note: 'edges show caller → callee',
            }
          : {
              items: [
                { label: 'Waiting call', color: 'var(--surface-raised)' },
                { label: 'Base case', color: 'var(--compare-fill)' },
                { label: 'Returned', color: 'var(--accent-line)' },
              ],
              note: 'newest frame at the top',
            }

  return (
    <div className="lab">
      <LabHeader
        icon={Layers}
        title={demo.info.name}
        subtitle={`Recursion lab · ${demo.info.tagline}`}
        mobilePicker={
          <div className="select-wrap">
            <select
              className="select"
              aria-label="Choose recursion demo"
              value={demo.info.slug}
              onChange={(event) => navigate(`/recursion/${event.target.value}`)}
            >
              {RECURSION_DEMOS.map((item) => (
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
            <Link to="/learn/recursion-and-the-stack" className="btn btn-sm btn-outline hide-sm">
              <BookOpen aria-hidden="true" />
              Notes
            </Link>
            <span className="chip">
              {isSearch
                ? `${values.length} values`
                : demo.info.inputLabel === 'n'
                  ? `n = ${n}`
                  : `${n} ${demo.info.inputLabel}`}
            </span>
          </>
        }
      />

      <div className="lab-body">
        <aside className="lab-rail" aria-label="Recursion controls">
          <div className="rail-heading">
            <span>Demo</span>
            <span className="rail-heading-note">4 total</span>
          </div>
          <div className="rail-list">
            {RECURSION_DEMOS.map((item) => (
              <button
                type="button"
                key={item.info.slug}
                className={`rail-item${item.info.slug === demo.info.slug ? ' is-active' : ''}`}
                onClick={() => navigate(`/recursion/${item.info.slug}`)}
                aria-current={item.info.slug === demo.info.slug ? 'page' : undefined}
              >
                <span className="rail-item-name">{item.info.name}</span>
                <span className="rail-item-meta">{item.info.complexity.average}</span>
              </button>
            ))}
          </div>

          {isSearch ? (
            <form
              className="rail-section rec-search-form"
              onSubmit={(event) => {
                event.preventDefault()
                applySearchInput()
              }}
            >
              <div className="rail-heading">
                <span>Input</span>
                <span className="rail-heading-note">2-16 values</span>
              </div>
              <div className="field">
                <label htmlFor="rec-values" className="label">
                  Sorted values
                  <span className="label-note">comma separated</span>
                </label>
                <textarea
                  id="rec-values"
                  className="input rec-values-input"
                  rows={2}
                  value={valuesDraft}
                  onChange={(event) => {
                    setValuesDraft(event.target.value)
                    setSearchError(null)
                  }}
                  spellCheck={false}
                  aria-invalid={searchError ? true : undefined}
                  aria-describedby="rec-values-hint"
                />
              </div>
              <div className="field">
                <label htmlFor="rec-target" className="label">
                  Target
                  <span className="label-note">whole number</span>
                </label>
                <input
                  id="rec-target"
                  className="input"
                  type="number"
                  value={targetDraft}
                  onChange={(event) => {
                    setTargetDraft(event.target.value)
                    setSearchError(null)
                  }}
                  aria-describedby="rec-target-hint"
                />
              </div>
              {searchError ? (
                <p className="error-text" role="alert">
                  {searchError}
                </p>
              ) : (
                <p className="hint" id="rec-values-hint">
                  Values are sorted before searching. The trace starts from the full array.
                </p>
              )}
              <div className="rec-form-actions">
                <Button type="submit" size="sm" variant="secondary">
                  Apply input
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={regenerateSearch}>
                  New values
                </Button>
              </div>

              <div className="rec-target-picks" id="rec-target-hint">
                <span className="rec-control-label">Try a target</span>
                <div className="rec-chip-row">
                  {Array.from(new Set(values)).slice(0, 6).map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={`rec-chip${value === target ? ' is-active' : ''}`}
                      onClick={() => pickTarget(value)}
                      aria-pressed={value === target}
                    >
                      {value}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`rec-chip rec-chip-absent${!values.includes(target) ? ' is-active' : ''}`}
                    onClick={absentTarget}
                    aria-pressed={!values.includes(target)}
                  >
                    absent
                  </button>
                </div>
              </div>
              <p className={`hint${values.includes(target) ? '' : ' is-warn'}`}>
                {values.includes(target)
                  ? `${target} is present in the array.`
                  : `${target} is not present - expect a miss.`}
              </p>
            </form>
          ) : (
            <div className="rail-section">
              <div className="rail-heading">
                <span>Input</span>
                <span className="rail-heading-note">
                  {demo.info.min}-{demo.info.max}
                </span>
              </div>
              <div className="field">
                <label htmlFor="rec-number" className="label">
                  {demo.info.inputLabel}
                  <span className="label-note">{demo.info.inputHint}</span>
                </label>
                <div className="rec-stepper">
                  <button
                    type="button"
                    className="rec-stepper-btn"
                    onClick={() => setNValue(n - 1)}
                    disabled={n <= demo.info.min}
                    aria-label={`Decrease ${demo.info.inputLabel}`}
                  >
                    <Minus aria-hidden="true" />
                  </button>
                  <input
                    id="rec-number"
                    className="input rec-number-input"
                    type="number"
                    min={demo.info.min}
                    max={demo.info.max}
                    step={1}
                    value={nDraft}
                    onChange={(event) => handleNInput(event.target.value)}
                    aria-invalid={nError ? true : undefined}
                    aria-describedby="rec-number-hint"
                  />
                  <button
                    type="button"
                    className="rec-stepper-btn"
                    onClick={() => setNValue(n + 1)}
                    disabled={n >= demo.info.max}
                    aria-label={`Increase ${demo.info.inputLabel}`}
                  >
                    <Plus aria-hidden="true" />
                  </button>
                </div>
                <input
                  className="range rec-range"
                  type="range"
                  min={demo.info.min}
                  max={demo.info.max}
                  value={n}
                  onChange={(event) => setNValue(Number(event.target.value))}
                  aria-label={`${demo.info.inputLabel} slider`}
                />
                {nError ? (
                  <p className="error-text" role="alert">
                    {nError}
                  </p>
                ) : (
                  <p className="hint" id="rec-number-hint">
                    {demo.info.limits}
                  </p>
                )}
              </div>

              <div className="rec-presets">
                {presets.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={`rec-chip${value === n ? ' is-active' : ''}`}
                    onClick={() => setNValue(value)}
                    aria-pressed={value === n}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="rail-note">The trace is rebuilt immediately; playback starts at the first frame.</p>
            </div>
          )}

          <div className="rail-section">
            <div className="rail-heading">
              <span>Watch for</span>
            </div>
            <p className="rail-note">{NOTES[demo.info.slug]}</p>
            <div className="inline-meta" style={{ marginTop: 9 }}>
              <span>call stack</span>
              <span className="sep">/</span>
              <span>{demo.info.complexity.space} space</span>
            </div>
          </div>
        </aside>

        <section className="lab-main" aria-label="Recursion visualization">
          <div className="stage">
            <div className="stage-top">
              <div className="stage-op">
                <Activity className="stage-op-icon" aria-hidden="true" />
                <span className="stage-op-text" title={frame.note}>
                  {frame.note}
                </span>
              </div>
              <div className="stage-meta">
                <span>{demo.info.slug.replace(/-/g, ' ')}</span>
                <span className="sep">·</span>
                <span>
                  step <b>{index}</b> / {last}
                </span>
              </div>
            </div>

            <div className="stage-plot">
              <RecursionScene demo={demo} frame={frame} n={n} />
            </div>

            <PlotLegend items={legend.items} note={legend.note} />

            <div className="stage-stats">
              <StatsRow items={stats} />
              <div className="stage-complexity">
                avg <b>{demo.info.complexity.average}</b>
              </div>
            </div>

            <PlaybackBar playback={playback} />
          </div>
        </section>

        <aside className="lab-inspector" aria-label="Recursion detail">
          <Tabs
            label="Recursion detail"
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
              <CodePanel code={demo.code} activeLine={frame.line} note={frame.note} />
            )}
            {tab === 'trace' && <TracePanel frames={frames} index={index} />}
            {tab === 'about' && (
              <div className="tab-panel">
                <AlgorithmAbout
                  description={demo.info.description}
                  howItWorks={demo.info.howItWorks}
                  complexity={demo.info.complexity}
                  badges={[
                    'base case required',
                    isSearch ? 'own interval per frame' : 'grows with call depth',
                  ]}
                  extra={[{ label: 'Input limit', value: `${demo.info.min}-${demo.info.max}` }]}
                  takeaway={demo.info.takeaway}
                />
                <div className="about-foot">
                  <span>Why the stack matters</span>
                  <Link to="/learn/recursion-and-the-stack" className="text-link">
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

export function RecursionPage() {
  const { slug } = useParams()
  const demo = findRecursionDemo(slug)
  if (!demo) return <Navigate to="/recursion/factorial" replace />
  return <RecursionLab demo={demo} key={demo.info.slug} />
}
