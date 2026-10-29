import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  BookOpen,
  Code2,
  Eraser,
  Flag,
  Info,
  Layers,
  MapPin,
  Mountain,
  Play,
  Route,
  Square,
  Trash2,
} from 'lucide-react'
import {
  PATH_ALGORITHMS,
  comparePathAlgorithms,
  findPathAlgorithm,
  type ComparisonResult,
} from '../algorithms/pathfinding'
import { bfs } from '../algorithms/pathfinding/bfs'
import {
  createGrid,
  hasPath,
  pathMovementCost,
  pointOf,
} from '../algorithms/pathfinding/grid'
import {
  OPEN,
  WALL,
  WEIGHT,
  type GridModel,
  type PathRun,
} from '../engine/types'
import { usePlayback } from '../engine/usePlayback'
import { useAppState } from '../state/AppState'
import { useRecordVisit } from '../hooks/useRecordVisit'
import { formatMs } from '../lib/format'
import { randomGridWalls, randomInt } from '../lib/random'
import { LabHeader } from '../components/lab/LabHeader'
import { PlaybackBar } from '../components/lab/PlaybackBar'
import { StatsRow } from '../components/lab/StatsRow'
import { PlotLegend } from '../components/lab/PlotLegend'
import { CodePanel } from '../components/lab/CodePanel'
import { AlgorithmAbout } from '../components/lab/AlgorithmAbout'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { Tooltip } from '../components/ui/Tooltip'
import { PathGrid, type GridTool } from '../components/viz/PathGrid'

interface RunState {
  run: PathRun
  durationMs: number
}

function starterGrid(): GridModel {
  const grid = createGrid()
  const cells = grid.cells.slice()
  const put = (x: number, y: number, value: typeof OPEN | typeof WALL | typeof WEIGHT) => {
    cells[y * grid.cols + x] = value
  }

  for (let y = 1; y <= 11; y += 1) put(9, y, WALL)
  for (let y = 4; y <= 14; y += 1) put(18, y, WALL)
  for (let x = 12; x <= 17; x += 1) put(x, 5, WALL)
  for (let y = 7; y <= 9; y += 1) {
    for (let x = 13; x <= 16; x += 1) put(x, y, WEIGHT)
  }
  put(2, 8, OPEN)
  put(26, 8, OPEN)

  const candidate = { ...grid, cells }
  return hasPath(candidate) ? candidate : createGrid()
}

function toolLabel(tool: GridTool): string {
  if (tool === 'wall') return 'Wall'
  if (tool === 'weight') return 'Rough terrain'
  if (tool === 'erase') return 'Erase'
  if (tool === 'start') return 'Move start'
  return 'Move destination'
}

function toolHint(tool: GridTool): string {
  if (tool === 'wall') return 'Click or drag across cells to block them.'
  if (tool === 'weight') return 'Rough cells cost 5 to enter; open cells cost 1.'
  if (tool === 'erase') return 'Click or drag to restore open ground.'
  if (tool === 'start') return 'Click a cell to move the start node.'
  return 'Click a cell to move the destination.'
}

export function PathfindingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { settings } = useAppState()
  const selectedSlug = searchParams.get('algo') ?? 'bfs'
  const algorithm = findPathAlgorithm(selectedSlug) ?? bfs

  const [grid, setGrid] = useState<GridModel>(starterGrid)
  const [tool, setTool] = useState<GridTool>('wall')
  const [run, setRun] = useState<RunState | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult[] | null>(null)
  const [compareTime, setCompareTime] = useState<number | null>(null)
  const [runId, setRunId] = useState(0)
  const [tab, setTab] = useState<'results' | 'code' | 'about'>('results')

  useRecordVisit({
    title: `Pathfinding · ${algorithm.info.shortName}`,
    path: '/pathfinding',
    group: 'Pathfinding',
  })

  const frames = run?.run.frames ?? []
  const playback = usePlayback(frames.length, {
    resetKey: runId,
    baseDelay: 40,
    initialSpeed: Math.max(1, settings.defaultSpeed),
    autoPlay: true,
  })
  const index = Math.min(playback.index, Math.max(0, frames.length - 1))
  const frame = frames[index] ?? null
  const last = Math.max(0, frames.length - 1)

  useEffect(() => {
    setRun(null)
    setRunId((current) => current + 1)
  }, [algorithm.info.slug])

  const clearRun = useCallback(() => {
    setRun(null)
    setComparison(null)
    setCompareTime(null)
  }, [])

  const editCell = useCallback(
    (indexToEdit: number, activeTool: GridTool) => {
      setGrid((current) => {
        if (activeTool === 'start') {
          if (indexToEdit === current.end) return current
          const cells = current.cells.slice()
          cells[indexToEdit] = OPEN
          return { ...current, start: indexToEdit, cells }
        }
        if (activeTool === 'end') {
          if (indexToEdit === current.start) return current
          const cells = current.cells.slice()
          cells[indexToEdit] = OPEN
          return { ...current, end: indexToEdit, cells }
        }
        if (indexToEdit === current.start || indexToEdit === current.end) return current
        const cells = current.cells.slice()
        if (activeTool === 'wall') {
          if (cells[indexToEdit] === WALL) return current
          cells[indexToEdit] = WALL
        } else if (activeTool === 'weight') {
          if (cells[indexToEdit] === WEIGHT) return current
          cells[indexToEdit] = WEIGHT
        } else {
          if (cells[indexToEdit] === OPEN) return current
          cells[indexToEdit] = OPEN
        }
        return { ...current, cells }
      })
      clearRun()
    },
    [clearRun],
  )

  const randomWalls = () => {
    setGrid((current) => {
      const cells = Array.from({ length: current.cols * current.rows }, () => OPEN) as GridModel['cells']
      for (const index of randomGridWalls(current.cols, current.rows, current.start, current.end, 0.2)) {
        cells[index] = WALL
      }
      const total = current.cols * current.rows
      for (let i = 0; i < Math.floor(total * 0.09); i += 1) {
        const index = randomInt(0, total - 1)
        if (cells[index] === OPEN && index !== current.start && index !== current.end) {
          cells[index] = WEIGHT
        }
      }
      return { ...current, cells }
    })
    clearRun()
  }

  const clearGrid = () => {
    setGrid((current) => ({
      ...current,
      cells: new Array(current.cols * current.rows).fill(OPEN) as GridModel['cells'],
    }))
    clearRun()
  }

  const resetStarter = () => {
    setGrid(starterGrid())
    clearRun()
  }

  const runSearch = () => {
    const started = performance.now()
    const result = algorithm.run(grid)
    const durationMs = performance.now() - started
    setRun({ run: result, durationMs })
    setRunId((current) => current + 1)
  }

  const compareAll = () => {
    const started = performance.now()
    const results = comparePathAlgorithms(grid)
    setComparison(results)
    setCompareTime(performance.now() - started)
  }

  const chooseAlgorithm = (slug: string) => {
    navigate(`/pathfinding?algo=${slug}`)
  }

  const pathSteps = frame?.path ? Math.max(0, frame.path.length - 1) : null
  const pathCost = frame?.path ? pathMovementCost(grid, frame.path) : null
  const visitedNow = frame?.visitedCount ?? 0
  const frontierNow = frame?.frontier.length ?? 0
  const runStatus = !run
    ? 'not run'
    : !frame
      ? 'ready'
      : frame.path
        ? 'complete'
        : index >= last
          ? 'unreachable'
          : 'searching'
  const finalNote = run?.run.frames.at(-1)?.note

  const bestVisited = comparison?.reduce(
    (best, item) => (item.reachable ? Math.min(best, item.visited) : best),
    Infinity,
  )
  const bestSteps = comparison?.reduce(
    (best, item) => (item.reachable ? Math.min(best, item.pathLength) : best),
    Infinity,
  )
  const bestCost = comparison?.reduce(
    (best, item) => (item.reachable ? Math.min(best, item.pathCost) : best),
    Infinity,
  )

  const comparisonTable = useMemo(() => {
    if (!comparison) return null
    return (
      <div>
        <table className="result-table">
          <thead>
            <tr>
              <th scope="col">algorithm</th>
              <th scope="col">visited</th>
              <th scope="col">steps</th>
              <th scope="col">cost</th>
              <th scope="col">compute</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((result) => (
              <tr key={result.slug}>
                <td>{result.name}</td>
                <td className={result.reachable && result.visited === bestVisited ? 'is-best' : undefined}>
                  {result.visited}
                </td>
                <td className={result.reachable && result.pathLength === bestSteps ? 'is-best' : undefined}>
                  {result.reachable ? result.pathLength : '-'}
                </td>
                <td className={result.reachable && result.pathCost === bestCost ? 'is-best' : undefined}>
                  {result.reachable ? result.pathCost : '-'}
                </td>
                <td className={result.reachable ? undefined : 'is-unreachable'}>
                  {result.reachable ? formatMs(result.durationMs) : 'no path'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="compare-note">
          Visited counts settled cells. Steps count edges; cost sums terrain entry costs. BFS and DFS ignore
          terrain cost, so their routes can be short in steps yet expensive to cross.
          {compareTime !== null && ` All four ran in ${formatMs(compareTime)}.`}
        </p>
      </div>
    )
  }, [bestCost, bestSteps, bestVisited, compareTime, comparison])

  const toolIcons: Array<{ id: GridTool; icon: typeof Square; label: string }> = [
    { id: 'wall', icon: Square, label: 'Wall' },
    { id: 'weight', icon: Mountain, label: 'Rough' },
    { id: 'erase', icon: Eraser, label: 'Erase' },
    { id: 'start', icon: MapPin, label: 'Start' },
    { id: 'end', icon: Flag, label: 'End' },
  ]

  return (
    <div className="lab">
      <LabHeader
        icon={Route}
        title="Pathfinding"
        subtitle="Grid lab · paint terrain, then watch the frontier grow"
        mobilePicker={
          <div className="select-wrap">
            <select
              className="select"
              aria-label="Choose pathfinding algorithm"
              value={algorithm.info.slug}
              onChange={(event) => chooseAlgorithm(event.target.value)}
            >
              {PATH_ALGORITHMS.map((item) => (
                <option key={item.info.slug} value={item.info.slug}>
                  {item.info.name}
                </option>
              ))}
            </select>
          </div>
        }
        actions={
          <>
            <Link
              to={algorithm.info.weighted ? '/learn/weighted-paths' : '/learn/graph-search'}
              className="btn btn-sm btn-outline hide-sm"
            >
              <BookOpen aria-hidden="true" />
              Notes
            </Link>
            <span className="chip">
              {grid.cols} × {grid.rows}
            </span>
          </>
        }
      />

      <div className="lab-body">
        <aside className="lab-rail" aria-label="Pathfinding controls">
          <div className="rail-heading">
            <span>Algorithm</span>
            <span className="rail-heading-note">4 total</span>
          </div>
          <div className="rail-list">
            {PATH_ALGORITHMS.map((item) => (
              <button
                type="button"
                key={item.info.slug}
                className={`rail-item${item.info.slug === algorithm.info.slug ? ' is-active' : ''}`}
                onClick={() => chooseAlgorithm(item.info.slug)}
                aria-current={item.info.slug === algorithm.info.slug ? 'page' : undefined}
              >
                <span className="rail-item-name">{item.info.shortName}</span>
                <span className="rail-item-meta">{item.info.weighted ? 'weighted' : 'steps'}</span>
              </button>
            ))}
          </div>

          <div className="rail-section">
            <div className="rail-heading">
              <span>Paint</span>
              <span className="rail-heading-note">{toolLabel(tool)}</span>
            </div>
            <div className="tool-grid" role="group" aria-label="Grid painting tool">
              {toolIcons.map(({ id, icon: Icon, label }) => (
                <Tooltip key={id} label={label}>
                  <button
                    type="button"
                    aria-pressed={tool === id}
                    aria-label={`${label} tool`}
                    onClick={() => setTool(id)}
                  >
                    <Icon aria-hidden="true" />
                  </button>
                </Tooltip>
              ))}
            </div>
            <p className="path-tool-hint">{toolHint(tool)}</p>
            <p className="path-tool-hint">
              Shift-drag or right-drag erases. The canvas is keyboard focusable: arrows move the cursor,
              Enter applies the tool, Delete erases.
            </p>
          </div>

          <div className="rail-section">
            <div className="rail-heading">
              <span>Grid</span>
            </div>
            <div className="rail-actions" style={{ flexWrap: 'wrap' }}>
              <Button size="sm" variant="outline" onClick={randomWalls}>
                <Layers aria-hidden="true" />
                Random walls
              </Button>
              <Button size="sm" variant="ghost" onClick={clearGrid}>
                <Trash2 aria-hidden="true" />
                Clear
              </Button>
            </div>
            <div className="rail-actions" style={{ marginTop: 5 }}>
              <Button size="sm" variant="ghost" onClick={resetStarter} style={{ width: '100%' }}>
                Reset starter grid
              </Button>
            </div>
            <div className="inline-meta" style={{ marginTop: 8 }}>
              <span>
                start {pointOf(grid.start, grid.cols).x},{pointOf(grid.start, grid.cols).y}
              </span>
              <span className="sep">→</span>
              <span>
                end {pointOf(grid.end, grid.cols).x},{pointOf(grid.end, grid.cols).y}
              </span>
            </div>
          </div>

          <div className="rail-section">
            <Button variant="primary" onClick={runSearch} style={{ width: '100%' }}>
              <Play aria-hidden="true" />
              {run ? 'Run again' : `Run ${algorithm.info.shortName}`}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={compareAll}
              style={{ width: '100%', marginTop: 5 }}
            >
              <BarChart3 aria-hidden="true" />
              Compare all four
            </Button>
            <p className="path-tool-hint">
              Each run starts from the current grid. Comparisons are computed on the same terrain.
            </p>
          </div>
        </aside>

        <section className="lab-main" aria-label="Pathfinding visualization">
          <div className="stage">
            <div className="stage-top">
              <div className="stage-op">
                <Activity className="stage-op-icon" aria-hidden="true" />
                <span className="stage-op-text" title={frame?.note}>
                  {frame?.note ?? 'Paint walls or rough terrain, place the nodes, then run a search.'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={runSearch}
                  aria-label={`Run ${algorithm.info.name}`}
                >
                  <Play aria-hidden="true" />
                  Run
                </Button>
                <div className="stage-meta">
                  <span>{runStatus}</span>
                  <span className="sep">·</span>
                  <span>
                    {index} / {last}
                  </span>
                </div>
              </div>
            </div>

            <div className="stage-plot">
              <PathGrid
                grid={grid}
                frame={frame}
                tool={tool}
                onEdit={editCell}
                showGrid={settings.showGrid}
              />
            </div>

            <PlotLegend
              items={[
                { label: 'Start', color: 'var(--accent)' },
                { label: 'Destination', color: 'var(--swap)' },
                { label: 'Wall', color: 'var(--ink)' },
                { label: 'Visited', color: 'var(--slate-fill)' },
                { label: 'Frontier', color: 'var(--compare-fill)' },
                { label: 'Path', color: 'var(--accent)', shape: 'line' },
                { label: 'Rough ×5', color: 'var(--compare)' },
              ]}
              note="drag to paint · shift-drag erases"
            />

            <div className="stage-stats">
              <StatsRow
                items={[
                  { label: 'Visited', value: visitedNow },
                  { label: 'Frontier', value: frontierNow },
                  { label: 'Path steps', value: pathSteps ?? '-' },
                  { label: 'Terrain cost', value: pathCost ?? '-' },
                ]}
              />
              <div className="stage-complexity">
                avg <b>{algorithm.info.complexity.average}</b>
              </div>
            </div>

            <PlaybackBar playback={playback} />
          </div>
        </section>

        <aside className="lab-inspector" aria-label="Pathfinding detail">
          <Tabs
            label="Pathfinding detail"
            value={tab}
            onChange={(next) => setTab(next as 'results' | 'code' | 'about')}
            items={[
              { id: 'results', label: 'Results', icon: BarChart3 },
              { id: 'code', label: 'Code', icon: Code2 },
              { id: 'about', label: 'About', icon: Info },
            ]}
          />
          <div className="inspector-body" role="tabpanel" aria-label={`${tab} panel`}>
            {tab === 'results' && (
              <div className="tab-panel tab-panel-pad">
                <section className="info-section" style={{ paddingTop: 0 }}>
                  <div className="info-kicker">This run · {algorithm.info.name}</div>
                  {run ? (
                    <>
                      <div className="stat-grid" style={{ marginBottom: 9 }}>
                        <div className="stat" style={{ paddingLeft: 0, borderLeft: 0 }}>
                          <div className="stat-label">Visited</div>
                          <div className="stat-value">{run.run.visitedCount}</div>
                        </div>
                        <div className="stat">
                          <div className="stat-label">Path steps</div>
                          <div className="stat-value">{run.run.reachable ? run.run.pathLength : '-'}</div>
                        </div>
                        <div className="stat">
                          <div className="stat-label">Cost</div>
                          <div className="stat-value">{run.run.reachable ? run.run.pathCost : '-'}</div>
                        </div>
                        <div className="stat">
                          <div className="stat-label">Trace build</div>
                          <div className="stat-value" style={{ fontSize: 13 }}>{formatMs(run.durationMs)}</div>
                        </div>
                      </div>
                      <p className={run.run.reachable ? 'info-p' : 'info-p'} style={{ color: run.run.reachable ? undefined : 'var(--swap)' }}>
                        {finalNote}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="info-p">
                        Nothing has been computed yet. Paint the grid, then run {algorithm.info.name} to
                        record every expansion.
                      </p>
                      <Button size="sm" variant="primary" onClick={runSearch} style={{ marginTop: 9 }}>
                        <Play aria-hidden="true" />
                        Run {algorithm.info.shortName}
                      </Button>
                    </>
                  )}
                </section>

                <section className="info-section">
                  <div className="info-kicker">Same grid, four algorithms</div>
                  {comparisonTable ? (
                    comparisonTable
                  ) : (
                    <>
                      <p className="info-p">
                        Compare all four pathfinders on exactly this terrain. Weighted costs count here;
                        BFS and DFS only minimise steps.
                      </p>
                      <Button size="sm" variant="outline" onClick={compareAll} style={{ marginTop: 9 }}>
                        <BarChart3 aria-hidden="true" />
                        Run comparison
                      </Button>
                    </>
                  )}
                </section>

                <section className="info-section">
                  <div className="info-kicker">Terrain prices</div>
                  <div className="terrain-key">
                    <div className="terrain-key-row">
                      <span className="terrain-swatch" style={{ background: 'var(--surface-raised)', borderColor: 'var(--line-strong)' }} />
                      open ground - entering costs 1
                    </div>
                    <div className="terrain-key-row">
                      <span className="terrain-swatch" style={{ background: 'var(--compare-soft)', borderColor: 'var(--compare)' }} />
                      rough terrain - entering costs 5
                    </div>
                    <div className="terrain-key-row">
                      <span className="terrain-swatch" style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }} />
                      wall - impassable
                    </div>
                  </div>
                  <p className="compare-note">{algorithm.info.costModel}</p>
                </section>
              </div>
            )}
            {tab === 'code' && (
              <CodePanel code={algorithm.code} activeLine={frame?.line ?? 'init'} note={frame?.note} />
            )}
            {tab === 'about' && (
              <div className="tab-panel">
                <AlgorithmAbout
                  description={algorithm.info.description}
                  howItWorks={algorithm.info.howItWorks}
                  complexity={algorithm.info.complexity}
                  badges={[
                    algorithm.info.weighted ? 'respects terrain cost' : 'counts steps only',
                    algorithm.info.guarantee,
                  ]}
                  extra={[{ label: 'Cost model', value: algorithm.info.weighted ? 'weighted, non-negative' : 'unweighted' }]}
                  takeaway={algorithm.info.takeaway}
                />
                <div className="about-foot">
                  <span>Why the explored area differs</span>
                  <Link
                    to={algorithm.info.weighted ? '/learn/weighted-paths' : '/learn/graph-search'}
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
