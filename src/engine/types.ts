export interface StepStats {
  comparisons: number
  swaps: number
  writes: number
  accesses: number
}

export const ZERO_STATS: StepStats = {
  comparisons: 0,
  swaps: 0,
  writes: 0,
  accesses: 0,
}

export function statsSnapshot(stats: StepStats): StepStats {
  return {
    comparisons: stats.comparisons,
    swaps: stats.swaps,
    writes: stats.writes,
    accesses: stats.accesses,
  }
}

/** Mutable counter used while generating an execution trace. */
export class Counter {
  comparisons = 0
  swaps = 0
  writes = 0
  accesses = 0

  read(): void {
    this.accesses += 1
  }

  compare(): void {
    this.comparisons += 1
    this.accesses += 2
  }

  swap(): void {
    this.swaps += 1
    this.accesses += 2
    this.writes += 2
  }

  write(): void {
    this.writes += 1
    this.accesses += 1
  }

  snapshot(): StepStats {
    return statsSnapshot(this)
  }
}

export type CodeLanguage = 'javascript' | 'pseudocode'

export interface CodeLine {
  id: string
  text: string
}

export type CodeBlock = Record<CodeLanguage, CodeLine[]>

export interface Complexity {
  best: string
  average: string
  worst: string
  space: string
}

export type SortFamily = 'quadratic' | 'divide' | 'heap'

export type SortFrameKind =
  | 'idle'
  | 'compare'
  | 'swap'
  | 'write'
  | 'pivot'
  | 'range'
  | 'divide'
  | 'merge'
  | 'heapify'
  | 'done'

export interface MergeAux {
  left: number[]
  right: number[]
  leftPos: number
  rightPos: number
}

export interface SortFrame {
  array: number[]
  compare: [number, number] | null
  pivot: number | null
  min: number | null
  key: number | null
  keyValue: number | null
  write: number | null
  range: [number, number] | null
  mid: number | null
  sorted: boolean[]
  heapSize: number | null
  aux: MergeAux | null
  kind: SortFrameKind
  line: string
  note: string
  stats: StepStats
}

export interface SortInfo {
  slug: string
  name: string
  shortName: string
  family: SortFamily
  tagline: string
  description: string
  howItWorks: string[]
  complexity: Complexity
  stable: boolean
  inPlace: boolean
  adaptive: boolean
  takeaway: string
}

export interface SortAlgorithm {
  info: SortInfo
  code: CodeBlock
  run: (input: readonly number[]) => SortFrame[]
}

export type SearchFrameKind = 'idle' | 'probe' | 'range' | 'found' | 'miss' | 'done'

export interface SearchFrame {
  array: number[]
  target: number
  current: number | null
  mid: number | null
  low: number | null
  high: number | null
  eliminated: boolean[]
  found: number | null
  kind: SearchFrameKind
  line: string
  note: string
  stats: StepStats
}

export interface SearchInfo {
  slug: string
  name: string
  shortName: string
  tagline: string
  description: string
  howItWorks: string[]
  complexity: Complexity
  requiresSorted: boolean
  takeaway: string
}

export interface SearchAlgorithm {
  info: SearchInfo
  code: CodeBlock
  run: (input: readonly number[], target: number) => SearchFrame[]
}

export interface Point {
  x: number
  y: number
}

export const WALL = 0
export const OPEN = 1
export const WEIGHT = 5

export type CellCost = typeof WALL | typeof OPEN | typeof WEIGHT

export interface GridModel {
  cols: number
  rows: number
  cells: CellCost[]
  start: number
  end: number
}

export interface PathFrame {
  explored: Uint8Array
  frontier: number[]
  current: number | null
  path: number[] | null
  visitedCount: number
  line: string
  note: string
}

export interface PathRun {
  frames: PathFrame[]
  path: number[]
  visitedCount: number
  pathLength: number
  pathCost: number
  reachable: boolean
  line: string
}

export interface PathInfo {
  slug: string
  name: string
  shortName: string
  tagline: string
  description: string
  howItWorks: string[]
  costModel: string
  guarantee: string
  weighted: boolean
  complexity: Complexity
  takeaway: string
}

export interface PathAlgorithm {
  info: PathInfo
  code: CodeBlock
  run: (grid: GridModel) => PathRun
}

export interface StackEntry {
  id: string
  label: string
  detail: string
  depth: number
  status: 'active' | 'returned' | 'base'
  returnValue?: number | string
}

export interface FibNode {
  id: string
  n: number
  parent: string | null
  depth: number
  status: 'pending' | 'active' | 'returned' | 'base'
  value?: number
  children: string[]
  repeated?: boolean
}

export interface HanoiState {
  rods: [number[], number[], number[]]
  moving: { disk: number; from: number; to: number } | null
}

export interface RecursionFrame {
  stack: StackEntry[]
  line: string
  note: string
  result: number | string | null
  /** Binary search recursion only. */
  array?: number[]
  target?: number
  low?: number | null
  high?: number | null
  mid?: number | null
  eliminated?: boolean[]
  /** Fibonacci only. */
  fibNodes?: FibNode[]
  activeFibId?: string | null
  callCount?: number
  repeatedCount?: number
  /** Tower of Hanoi only. */
  hanoi?: HanoiState
  moveCount?: number
}

export interface RecursionInfo {
  slug: string
  name: string
  tagline: string
  description: string
  howItWorks: string[]
  complexity: Complexity
  limits: string
  takeaway: string
  inputLabel: string
  inputHint: string
  min: number
  max: number
  defaultValue: number
}

export interface RecursionRunInput {
  n: number
  values?: number[]
  target?: number
}

export interface RecursionRunOutput {
  frames: RecursionFrame[]
  result: number | string
  values?: number[]
  target?: number
}

export interface RecursionDemo {
  info: RecursionInfo
  code: CodeBlock
  inputMode: 'number' | 'search'
  run: (input: RecursionRunInput) => RecursionRunOutput
}
