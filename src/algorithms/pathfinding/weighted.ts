import type { GridModel, PathAlgorithm, PathFrame, PathRun } from '../../engine/types'
import {
  MinHeap,
  manhattan,
  movementCost,
  neighbours,
  pathMovementCost,
  pointOf,
  reconstructPath,
} from './grid'

function frontierFromHeap(heap: MinHeap, closed: Uint8Array): number[] {
  const unique = new Set<number>()
  for (const index of heap.indices) {
    if (!closed[index]) unique.add(index)
  }
  return Array.from(unique).sort((a, b) => a - b)
}

interface WeightedSetup {
  frames: PathFrame[]
  explored: Uint8Array
  closed: Uint8Array
  parent: Int32Array
  heap: MinHeap
  dist: Float64Array
  visited: number
  grid: GridModel
}

function createSetup(grid: GridModel): WeightedSetup {
  const total = grid.cols * grid.rows
  return {
    frames: [],
    explored: new Uint8Array(total),
    closed: new Uint8Array(total),
    parent: new Int32Array(total).fill(-1),
    heap: new MinHeap(),
    dist: new Float64Array(total).fill(Number.POSITIVE_INFINITY),
    visited: 0,
    grid,
  }
}

function finish(
  setup: WeightedSetup,
  path: number[],
  reachable: boolean,
  note: string,
  line = 'ret',
): PathRun {
  const cost = reachable ? pathMovementCost(setup.grid, path) : 0
  setup.frames.push({
    explored: setup.explored.slice(),
    frontier: [],
    current: reachable ? setup.grid.end : null,
    path: reachable ? path : null,
    visitedCount: setup.visited,
    line,
    note,
  })
  return {
    frames: setup.frames,
    path: reachable ? path : [],
    visitedCount: setup.visited,
    pathLength: reachable ? path.length - 1 : 0,
    pathCost: cost,
    reachable,
    line,
  }
}

function blockedEnd(setup: WeightedSetup): PathRun | null {
  if (setup.grid.start === setup.grid.end) {
    setup.visited = 1
    return finish(setup, [setup.grid.start], true, 'Start and destination are the same cell. No movement is required.')
  }
  if (setup.grid.cells[setup.grid.start] === 0 || setup.grid.cells[setup.grid.end] === 0) {
    return finish(setup, [], false, 'The start or destination cell is blocked by a wall. Clear it and run again.')
  }
  return null
}

export const dijkstra: PathAlgorithm = {
  info: {
    slug: 'dijkstra',
    name: "Dijkstra's algorithm",
    shortName: 'Dijkstra',
    tagline: 'Settle the cheapest known node first; costs accumulate from the start.',
    description:
      "Dijkstra's algorithm keeps the best known cost to every cell. It always expands the unsettled cell with the smallest cost, so once a cell is settled its distance cannot improve. On weighted terrain this yields the cheapest path, not merely the path with the fewest steps.",
    howItWorks: [
      'Set the start distance to 0 and push it into a min-priority queue.',
      'Pop the cheapest unsettled node and settle it.',
      "For each neighbour, compute the cost of entering it from the current node.",
      'Relax the neighbour if that total beats its previous best; push it again with the new distance.',
    ],
    costModel: 'Entering open ground costs 1; entering rough terrain costs 5.',
    guarantee: 'Least total terrain cost, when a path exists.',
    weighted: true,
    complexity: {
      best: 'O((V + E) log V)',
      average: 'O((V + E) log V)',
      worst: 'O((V + E) log V)',
      space: 'O(V)',
    },
    takeaway: 'The correct weighted-path baseline. It explores in every direction equally.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function dijkstra(grid, start, end) {' },
      { id: 'init', text: '  const dist = new Map([[start, 0]]);\n  const open = new MinHeap([[0, start]]);' },
      { id: 'while', text: '  while (open.size) {' },
      { id: 'pop', text: '    const [cost, node] = open.pop();' },
      { id: 'stale', text: '    if (cost > (dist.get(node) ?? Infinity)) continue;' },
      { id: 'goal', text: '    if (node === end) return rebuildPath(node);' },
      { id: 'loop', text: '    for (const next of neighbours(node)) {' },
      { id: 'skip', text: '      if (isWall(next)) continue;' },
      { id: 'relax', text: '      const nextCost = cost + terrainCost(next);' },
      { id: 'update', text: '      if (nextCost < (dist.get(next) ?? Infinity)) {' },
      { id: 'push', text: '        dist.set(next, nextCost); open.push([nextCost, next]);' },
      { id: 'end', text: '      }' },
      { id: 'miss', text: '  return null;' },
      { id: 'ret', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: "procedure dijkstra(grid, start, end)" },
      { id: 'init', text: '  dist[start] ← 0; open ← priority queue with start' },
      { id: 'while', text: '  while open is not empty do' },
      { id: 'pop', text: '    node ← open.popMin()' },
      { id: 'stale', text: '    if node is already settled then continue' },
      { id: 'goal', text: '    if node = end then return rebuild path' },
      { id: 'loop', text: '    for each passable neighbour next do' },
      { id: 'skip', text: '      if next is settled then continue' },
      { id: 'relax', text: '      nextCost ← dist[node] + terrainCost(next)' },
      { id: 'update', text: '      if nextCost < dist[next] then' },
      { id: 'push', text: '        dist[next] ← nextCost; open.push(next, nextCost)' },
      { id: 'end', text: '      end if' },
      { id: 'miss', text: '  return no path' },
      { id: 'ret', text: 'end procedure' },
    ],
  },
  run(grid) {
    const setup = createSetup(grid)
    const { frames, explored, closed, parent, heap, dist, grid: model } = setup

    frames.push({
      explored: explored.slice(),
      frontier: [grid.start],
      current: null,
      path: null,
      visitedCount: 0,
      line: 'init',
      note: 'The start cell has cost 0. Every other cell begins at infinity.',
    })

    const immediate = blockedEnd(setup)
    if (immediate) return immediate

    dist[grid.start] = 0
    heap.push(grid.start, 0)

    while (heap.size > 0) {
      const entry = heap.pop()
      if (!entry) break
      if (closed[entry.index]) continue

      const current = entry.index
      closed[current] = 1
      explored[current] = 1
      setup.visited += 1

      if (current === grid.end) {
        const path = reconstructPath(parent, grid.start, grid.end)
        return finish(
          setup,
          path,
          true,
          `Destination settled with total cost ${dist[grid.end]}. Settling in cost order makes this distance final.`,
          'goal',
        )
      }

      let relaxed = 0
      for (const next of neighbours(model, current)) {
        if (model.cells[next] === 0 || closed[next]) continue
        const nextCost = dist[current] + movementCost(model, next)
        if (nextCost < dist[next]) {
          dist[next] = nextCost
          parent[next] = current
          heap.push(next, nextCost)
          relaxed += 1
        }
      }

      frames.push({
        explored: explored.slice(),
        frontier: frontierFromHeap(heap, closed),
        current,
        path: null,
        visitedCount: setup.visited,
        line: 'update',
        note: `Settle (${pointOf(current, grid.cols).x}, ${pointOf(current, grid.cols).y}) at cost ${dist[current]}; relax ${relaxed} ${relaxed === 1 ? 'neighbour' : 'neighbours'}.`,
      })
    }

    return finish(
      setup,
      [],
      false,
      `Open set exhausted after settling ${setup.visited} cells. The destination is unreachable.`,
      'miss',
    )
  },
}

export const astar: PathAlgorithm = {
  info: {
    slug: 'a-star',
    name: 'A* search',
    shortName: 'A*',
    tagline: 'Use a distance estimate to aim the search at the destination.',
    description:
      'A* behaves like Dijkstra but orders the queue by cost so far plus a heuristic estimate of the remaining distance. With the Manhattan estimate, which never overestimates on this grid, the first time the destination is settled its path is optimal - and usually far fewer cells are explored.',
    howItWorks: [
      'Track the known cost g from the start to each cell.',
      'Estimate the remaining distance h with Manhattan distance.',
      'Expand the cell with the smallest g + h first.',
      'Update g when a cheaper route is found. Settle the destination when it leaves the queue.',
    ],
    costModel: 'Entering open ground costs 1; rough terrain costs 5. The heuristic multiplies steps by the minimum cost, 1.',
    guarantee: 'Least total cost with the Manhattan heuristic used here.',
    weighted: true,
    complexity: {
      best: 'O(E)',
      average: 'O(E log V)',
      worst: 'O(E log V)',
      space: 'O(V)',
    },
    takeaway: 'Same answer as Dijkstra, often after touching far fewer cells.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function aStar(grid, start, end) {' },
      { id: 'init', text: '  const g = new Map([[start, 0]]);\n  const open = new MinHeap([[heuristic(start), start]]);' },
      { id: 'while', text: '  while (open.size) {' },
      { id: 'pop', text: '    const [priority, node] = open.pop();' },
      { id: 'stale', text: '    if (priority > g.get(node) + h(node)) continue;' },
      { id: 'goal', text: '    if (node === end) return rebuildPath(node);' },
      { id: 'loop', text: '    for (const next of neighbours(node)) {' },
      { id: 'skip', text: '      if (isWall(next)) continue;' },
      { id: 'tentative', text: '      const tentative = g.get(node) + terrainCost(next);' },
      { id: 'update', text: '      if (tentative < (g.get(next) ?? Infinity)) {' },
      { id: 'push', text: '        g.set(next, tentative);' },
      { id: 'enqueue', text: '        open.push([tentative + heuristic(next), next]);' },
      { id: 'end', text: '      }' },
      { id: 'miss', text: '  return null;' },
      { id: 'ret', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure aStar(grid, start, end)' },
      { id: 'init', text: '  g[start] ← 0; open ← priority queue with start + h(start)' },
      { id: 'while', text: '  while open is not empty do' },
      { id: 'pop', text: '    node ← open.popMin()' },
      { id: 'stale', text: '    if node is already settled then continue' },
      { id: 'goal', text: '    if node = end then return rebuild path' },
      { id: 'loop', text: '    for each passable neighbour next do' },
      { id: 'skip', text: '      if next is settled then continue' },
      { id: 'tentative', text: '      tentative ← g[node] + terrainCost(next)' },
      { id: 'update', text: '      if tentative < g[next] then' },
      { id: 'push', text: '        g[next] ← tentative' },
      { id: 'enqueue', text: '        open.push(next, tentative + h(next))' },
      { id: 'end', text: '      end if' },
      { id: 'miss', text: '  return no path' },
      { id: 'ret', text: 'end procedure' },
    ],
  },
  run(grid) {
    const setup = createSetup(grid)
    const { frames, explored, closed, parent, heap, dist, grid: model } = setup

    const heuristic = (index: number): number => manhattan(index, grid.end, grid.cols)

    frames.push({
      explored: explored.slice(),
      frontier: [grid.start],
      current: null,
      path: null,
      visitedCount: 0,
      line: 'init',
      note: `The start is queued with priority g + h = 0 + ${heuristic(grid.start)}.`,
    })

    const immediate = blockedEnd(setup)
    if (immediate) return immediate

    dist[grid.start] = 0
    heap.push(grid.start, heuristic(grid.start))

    while (heap.size > 0) {
      const entry = heap.pop()
      if (!entry) break
      if (closed[entry.index]) continue

      const current = entry.index
      closed[current] = 1
      explored[current] = 1
      setup.visited += 1

      if (current === grid.end) {
        const path = reconstructPath(parent, grid.start, grid.end)
        return finish(
          setup,
          path,
          true,
          `Destination settled with total cost ${dist[grid.end]}. A* reached it after ${setup.visited} cells.`,
          'goal',
        )
      }

      let relaxed = 0
      for (const next of neighbours(model, current)) {
        if (model.cells[next] === 0 || closed[next]) continue
        const tentative = dist[current] + movementCost(model, next)
        if (tentative < dist[next]) {
          dist[next] = tentative
          parent[next] = current
          heap.push(next, tentative + heuristic(next))
          relaxed += 1
        }
      }

      frames.push({
        explored: explored.slice(),
        frontier: frontierFromHeap(heap, closed),
        current,
        path: null,
        visitedCount: setup.visited,
        line: 'update',
        note: `Expand (${pointOf(current, grid.cols).x}, ${pointOf(current, grid.cols).y}) · g = ${dist[current]}, h = ${heuristic(current)}. Priority ${dist[current] + heuristic(current)}.`,
      })
    }

    return finish(
      setup,
      [],
      false,
      `Open set exhausted after expanding ${setup.visited} cells. The destination is unreachable.`,
      'miss',
    )
  },
}
