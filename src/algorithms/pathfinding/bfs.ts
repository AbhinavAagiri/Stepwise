import type { PathAlgorithm, PathFrame, PathRun } from '../../engine/types'
import { pathMovementCost, pointOf } from './grid'

export const bfs: PathAlgorithm = {
  info: {
    slug: 'bfs',
    name: 'Breadth-first search',
    shortName: 'BFS',
    tagline: 'Explore in rings; the first path found is the shortest by steps.',
    description:
      'BFS explores all nodes one step away, then two steps away, and so on. Because a queue is first-in first-out, the destination is first reached along a path with the fewest edges. On weighted terrain BFS ignores costs, so its path may be short in steps but expensive to travel.',
    howItWorks: [
      'Put the start node in a queue.',
      'Remove the front node and mark it explored.',
      'Add its unvisited, passable neighbours to the back of the queue.',
      'Stop when the destination is removed. The parent links form a shortest path by step count.',
    ],
    costModel: 'Every edge costs one step. Terrain costs are ignored.',
    guarantee: 'Shortest path by number of steps, when one exists.',
    weighted: false,
    complexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)',
    },
    takeaway: 'The reference algorithm for unweighted shortest paths.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function bfs(grid, start, end) {' },
      { id: 'init', text: '  const queue = [start], seen = new Set([start]);' },
      { id: 'while', text: '  while (queue.length) {' },
      { id: 'dequeue', text: '    const node = queue.shift();' },
      { id: 'goal', text: '    if (node === end) return path(node);' },
      { id: 'loop', text: '    for (const next of neighbours(node)) {' },
      { id: 'skip', text: '      if (seen.has(next) || isWall(next)) continue;' },
      { id: 'visit', text: '      seen.add(next); parent.set(next, node);' },
      { id: 'enqueue', text: '      queue.push(next);' },
      { id: 'end', text: '    }' },
      { id: 'miss', text: '  return null;' },
      { id: 'ret', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure BFS(grid, start, end)' },
      { id: 'init', text: '  queue ← [start]; seen ← {start}' },
      { id: 'while', text: '  while queue is not empty do' },
      { id: 'dequeue', text: '    node ← remove front of queue' },
      { id: 'goal', text: '    if node = end then return rebuild path' },
      { id: 'loop', text: '    for each passable neighbour next do' },
      { id: 'skip', text: '      if next ∈ seen then continue' },
      { id: 'visit', text: '      seen ← seen ∪ {next}; parent[next] ← node' },
      { id: 'enqueue', text: '      enqueue next' },
      { id: 'end', text: '    end for' },
      { id: 'miss', text: '  return no path' },
      { id: 'ret', text: 'end procedure' },
    ],
  },
  run(grid) {
    const total = grid.cols * grid.rows
    const frames: PathFrame[] = []
    const explored = new Uint8Array(total)
    const parent = new Int32Array(total).fill(-1)
    const seen = new Uint8Array(total)
    const queue: number[] = [grid.start]
    seen[grid.start] = 1
    let visited = 0

    const finish = (path: number[], reachable: boolean, note: string): PathRun => {
      frames.push({
        explored: explored.slice(),
        frontier: [],
        current: reachable ? grid.end : null,
        path: reachable ? path : null,
        visitedCount: visited,
        line: 'ret',
        note,
      })
      return {
        frames,
        path: reachable ? path : [],
        visitedCount: visited,
        pathLength: reachable ? path.length - 1 : 0,
        pathCost: reachable ? pathMovementCost(grid, path) : 0,
        reachable,
        line: 'ret',
      }
    }

    frames.push({
      explored: explored.slice(),
      frontier: [grid.start],
      current: null,
      path: null,
      visitedCount: 0,
      line: 'init',
      note: `Queue starts with the start node at (${pointOf(grid.start, grid.cols).x}, ${pointOf(grid.start, grid.cols).y}).`,
    })

    if (grid.start === grid.end) {
      visited = 1
      return finish([grid.start], true, 'Start and destination are the same cell. Path length is zero.')
    }

    if (grid.cells[grid.start] === 0 || grid.cells[grid.end] === 0) {
      return finish([], false, 'The start or destination cell is blocked by a wall. Clear the wall and run again.')
    }

    while (queue.length > 0) {
      const current = queue.shift() as number
      explored[current] = 1
      visited += 1

      if (current === grid.end) {
        const path = rebuild(parent, grid.start, grid.end)
        return finish(path, true, `Destination reached after exploring ${visited} nodes. BFS found the fewest-step path.`)
      }

      let added = 0
      for (const next of neighboursOf(grid, current)) {
        if (grid.cells[next] === 0 || seen[next]) continue
        seen[next] = 1
        parent[next] = current
        queue.push(next)
        added += 1
      }

      frames.push({
        explored: explored.slice(),
        frontier: queue.slice(),
        current,
        path: null,
        visitedCount: visited,
        line: added > 0 ? 'enqueue' : 'dequeue',
        note: `Dequeue (${pointOf(current, grid.cols).x}, ${pointOf(current, grid.cols).y}); added ${added} new ${added === 1 ? 'neighbour' : 'neighbours'} to the back of the queue.`,
      })
    }

    return finish([], false, `Queue exhausted after ${visited} nodes. The destination is unreachable behind walls.`)
  },
}

function neighboursOf(grid: { cols: number; rows: number }, index: number): number[] {
  const x = index % grid.cols
  const y = Math.floor(index / grid.cols)
  const result: number[] = []
  if (y > 0) result.push(index - grid.cols)
  if (x < grid.cols - 1) result.push(index + 1)
  if (y < grid.rows - 1) result.push(index + grid.cols)
  if (x > 0) result.push(index - 1)
  return result
}

function rebuild(parent: Int32Array, start: number, end: number): number[] {
  const path: number[] = []
  let current = end
  let guard = 0
  while (current !== start && current !== -1 && guard < parent.length + 1) {
    path.push(current)
    current = parent[current]
    guard += 1
  }
  path.push(start)
  return path.reverse()
}
