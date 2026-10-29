import type { GridModel, PathAlgorithm, PathRun } from '../../engine/types'
import { bfs } from './bfs'
import { dfs } from './dfs'
import { astar, dijkstra } from './weighted'

export const PATH_ALGORITHMS: PathAlgorithm[] = [bfs, dfs, dijkstra, astar]

export function findPathAlgorithm(slug: string | undefined): PathAlgorithm | undefined {
  return PATH_ALGORITHMS.find((algorithm) => algorithm.info.slug === slug)
}

export interface ComparisonResult {
  slug: string
  name: string
  visited: number
  pathLength: number
  pathCost: number
  durationMs: number
  reachable: boolean
}

/** Runs every pathfinder synchronously on a copy of the grid for the comparison table. */
export function comparePathAlgorithms(grid: GridModel): ComparisonResult[] {
  return PATH_ALGORITHMS.map((algorithm) => {
    const started = performance.now()
    const run: PathRun = algorithm.run({ ...grid, cells: grid.cells.slice() })
    const durationMs = performance.now() - started
    return {
      slug: algorithm.info.slug,
      name: algorithm.info.shortName,
      visited: run.visitedCount,
      pathLength: run.pathLength,
      pathCost: run.pathCost,
      durationMs,
      reachable: run.reachable,
    }
  })
}
