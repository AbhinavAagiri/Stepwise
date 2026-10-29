import { OPEN, WALL, WEIGHT, type CellCost, type GridModel } from '../../engine/types'

export const GRID_COLS = 29
export const GRID_ROWS = 16

export function indexOf(x: number, y: number, cols: number): number {
  return y * cols + x
}

export function pointOf(index: number, cols: number): { x: number; y: number } {
  return { x: index % cols, y: Math.floor(index / cols) }
}

export function createGrid(cols = GRID_COLS, rows = GRID_ROWS): GridModel {
  const start = indexOf(2, Math.floor(rows / 2), cols)
  const end = indexOf(cols - 3, Math.floor(rows / 2), cols)
  const cells = new Array<CellCost>(cols * rows).fill(OPEN)
  return { cols, rows, cells, start, end }
}

export function cloneGrid(grid: GridModel): GridModel {
  return { ...grid, cells: grid.cells.slice() }
}

export function isInside(grid: GridModel, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < grid.cols && y < grid.rows
}

export function inBounds(index: number, cols: number, rows: number): boolean {
  return index >= 0 && index < cols * rows
}

/** Returns neighbours in up, right, down, left order. Walls are included. */
export function neighbours(grid: GridModel, index: number): number[] {
  const { x, y } = pointOf(index, grid.cols)
  const result: number[] = []
  if (y > 0) result.push(index - grid.cols)
  if (x < grid.cols - 1) result.push(index + 1)
  if (y < grid.rows - 1) result.push(index + grid.cols)
  if (x > 0) result.push(index - 1)
  return result
}

export function isWall(grid: GridModel, index: number): boolean {
  return grid.cells[index] === WALL
}

/** Cost of entering a cell. Walls are impassable. */
export function movementCost(grid: GridModel, index: number): number {
  const cell = grid.cells[index]
  if (cell === WALL) return Number.POSITIVE_INFINITY
  if (cell === WEIGHT) return 5
  return 1
}

export function reconstructPath(
  parent: Int32Array,
  start: number,
  end: number,
): number[] {
  if (end === start) return [start]
  if (parent[end] === -1) return []
  const path: number[] = []
  let current = end
  let guard = 0
  while (current !== -1 && guard <= parent.length) {
    path.push(current)
    if (current === start) break
    current = parent[current]
    guard += 1
  }
  if (path[path.length - 1] !== start) return []
  return path.reverse()
}

export function pathMovementCost(grid: GridModel, path: number[]): number {
  let cost = 0
  for (let i = 1; i < path.length; i += 1) {
    const value = movementCost(grid, path[i])
    if (!Number.isFinite(value)) return Number.POSITIVE_INFINITY
    cost += value
  }
  return cost
}

export function manhattan(a: number, b: number, cols: number): number {
  const pa = pointOf(a, cols)
  const pb = pointOf(b, cols)
  return Math.abs(pa.x - pb.x) + Math.abs(pa.y - pb.y)
}

export function createExplored(cols: number, rows: number): Uint8Array {
  return new Uint8Array(cols * rows)
}

/** Lightweight reachability check used to seed a solvable starter grid. */
export function hasPath(grid: GridModel): boolean {
  if (grid.cells[grid.start] === WALL || grid.cells[grid.end] === WALL) return false
  const seen = new Uint8Array(grid.cols * grid.rows)
  const queue = [grid.start]
  seen[grid.start] = 1
  while (queue.length > 0) {
    const current = queue.shift() as number
    if (current === grid.end) return true
    for (const next of neighbours(grid, current)) {
      if (grid.cells[next] === WALL || seen[next]) continue
      seen[next] = 1
      queue.push(next)
    }
  }
  return false
}

export class MinHeap {
  private items: Array<{ index: number; priority: number; order: number }> = []
  private order = 0

  get size(): number {
    return this.items.length
  }

  get length(): number {
    return this.items.length
  }

  get indices(): number[] {
    return this.items.map((item) => item.index)
  }

  push(index: number, priority: number): void {
    this.items.push({ index, priority, order: this.order })
    this.order += 1
    this.bubbleUp(this.items.length - 1)
  }

  pop(): { index: number; priority: number } | undefined {
    if (this.items.length === 0) return undefined
    const top = this.items[0]
    const last = this.items.pop()
    if (this.items.length > 0 && last) {
      this.items[0] = last
      this.sinkDown(0)
    }
    return top ? { index: top.index, priority: top.priority } : undefined
  }

  private less(a: { priority: number; order: number }, b: { priority: number; order: number }): boolean {
    if (a.priority === b.priority) return a.order < b.order
    return a.priority < b.priority
  }

  private bubbleUp(start: number): void {
    let index = start
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (!this.less(this.items[index], this.items[parent])) break
      ;[this.items[index], this.items[parent]] = [this.items[parent], this.items[index]]
      index = parent
    }
  }

  private sinkDown(start: number): void {
    let index = start
    const length = this.items.length
    while (true) {
      const left = index * 2 + 1
      const right = left + 1
      let smallest = index
      if (left < length && this.less(this.items[left], this.items[smallest])) smallest = left
      if (right < length && this.less(this.items[right], this.items[smallest])) smallest = right
      if (smallest === index) break
      ;[this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]]
      index = smallest
    }
  }
}
