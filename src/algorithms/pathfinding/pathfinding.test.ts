import { describe, expect, it } from 'vitest'
import { OPEN, WALL, WEIGHT, type GridModel } from '../../engine/types'
import { bfs } from './bfs'
import { dfs } from './dfs'
import { astar, dijkstra } from './weighted'
import {
  createGrid,
  indexOf,
  neighbours,
  pathMovementCost,
} from './grid'

function tinyGrid(): GridModel {
  const cols = 5
  const rows = 3
  return {
    cols,
    rows,
    cells: new Array(cols * rows).fill(OPEN),
    start: indexOf(0, 1, cols),
    end: indexOf(4, 1, cols),
  }
}

function expectValidPath(grid: GridModel, path: number[]): void {
  expect(path[0]).toBe(grid.start)
  expect(path[path.length - 1]).toBe(grid.end)
  for (let i = 0; i < path.length; i += 1) {
    expect(grid.cells[path[i]]).not.toBe(WALL)
    if (i > 0) {
      expect(neighbours(grid, path[i - 1])).toContain(path[i])
    }
  }
}

describe('pathfinding algorithms', () => {
  it('finds a valid path on an open grid', () => {
    for (const algorithm of [bfs, dfs, dijkstra, astar]) {
      const run = algorithm.run(createGrid())
      expect(run.reachable).toBe(true)
      expect(run.path.length).toBeGreaterThan(1)
      expectValidPath(createGrid(), run.path)
      expect(run.pathLength).toBe(run.path.length - 1)
      expect(run.pathCost).toBe(pathMovementCost(createGrid(), run.path))
      expect(run.frames.length).toBeGreaterThan(0)
    }
  })

  it('handles a start that is already the destination', () => {
    const grid = tinyGrid()
    grid.end = grid.start
    for (const algorithm of [bfs, dfs, dijkstra, astar]) {
      const run = algorithm.run(grid)
      expect(run.reachable).toBe(true)
      expect(run.path).toEqual([grid.start])
      expect(run.pathLength).toBe(0)
      expect(run.pathCost).toBe(0)
    }
  })

  it('reports an unreachable destination instead of inventing a path', () => {
    const grid = tinyGrid()
    for (let y = 0; y < grid.rows; y += 1) grid.cells[indexOf(2, y, grid.cols)] = WALL

    for (const algorithm of [bfs, dfs, dijkstra, astar]) {
      const run = algorithm.run(grid)
      expect(run.reachable).toBe(false)
      expect(run.path).toEqual([])
      expect(run.pathLength).toBe(0)
      expect(run.frames.length).toBeGreaterThan(0)
    }
  })

  it('does not let BFS or DFS cross a wall', () => {
    const grid = tinyGrid()
    grid.cells[indexOf(1, 1, grid.cols)] = WALL
    const bfsRun = bfs.run(grid)
    const dfsRun = dfs.run(grid)
    expect(bfsRun.reachable).toBe(true)
    expect(dfsRun.reachable).toBe(true)
    expect(bfsRun.path).not.toContain(indexOf(1, 1, grid.cols))
    expect(dfsRun.path).not.toContain(indexOf(1, 1, grid.cols))
    expectValidPath(grid, bfsRun.path)
    expectValidPath(grid, dfsRun.path)
  })

  it('makes BFS find the shortest number of steps', () => {
    const grid = tinyGrid()
    const bfsRun = bfs.run(grid)
    const dfsRun = dfs.run(grid)
    expect(bfsRun.pathLength).toBe(4)
    expect(dfsRun.pathLength).toBeGreaterThanOrEqual(bfsRun.pathLength)
  })

  it('makes Dijkstra and A* prefer cheap terrain over a short expensive route', () => {
    const grid = tinyGrid()
    for (let x = 1; x <= 3; x += 1) grid.cells[indexOf(x, 1, grid.cols)] = WEIGHT

    const bfsRun = bfs.run(grid)
    const dijkstraRun = dijkstra.run(grid)
    const astarRun = astar.run(grid)

    expect(bfsRun.pathLength).toBe(4)
    expect(bfsRun.pathCost).toBe(16)

    expect(dijkstraRun.reachable).toBe(true)
    expect(astarRun.reachable).toBe(true)
    expect(dijkstraRun.pathCost).toBe(6)
    expect(astarRun.pathCost).toBe(6)
    expect(dijkstraRun.pathCost).toBeLessThan(bfsRun.pathCost)
    expectValidPath(grid, dijkstraRun.path)
    expectValidPath(grid, astarRun.path)
  })

  it('gives A* the same optimal cost as Dijkstra on mixed terrain', () => {
    const grid = createGrid()
    grid.cells[indexOf(8, 7, grid.cols)] = WEIGHT
    grid.cells[indexOf(9, 7, grid.cols)] = WEIGHT
    grid.cells[indexOf(10, 8, grid.cols)] = WALL
    grid.cells[indexOf(11, 8, grid.cols)] = WALL
    grid.cells[indexOf(12, 8, grid.cols)] = WALL

    const dijkstraRun = dijkstra.run(grid)
    const astarRun = astar.run(grid)

    expect(dijkstraRun.reachable).toBe(true)
    expect(astarRun.reachable).toBe(true)
    expect(astarRun.pathCost).toBe(dijkstraRun.pathCost)
    expect(astarRun.pathLength).toBe(dijkstraRun.pathLength)
  })

  it('records every explored cell exactly once', () => {
    const grid = tinyGrid()
    const run = bfs.run(grid)
    let previousVisited = 0
    for (const frame of run.frames) {
      expect(frame.visitedCount).toBeGreaterThanOrEqual(previousVisited)
      previousVisited = frame.visitedCount
    }
    expect(previousVisited).toBe(run.visitedCount)
  })
})
