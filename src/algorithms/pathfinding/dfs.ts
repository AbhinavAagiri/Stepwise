import type { PathAlgorithm, PathFrame, PathRun } from '../../engine/types'
import { neighbours, pathMovementCost, pointOf, reconstructPath } from './grid'

export const dfs: PathAlgorithm = {
  info: {
    slug: 'dfs',
    name: 'Depth-first search',
    shortName: 'DFS',
    tagline: 'Follow one route as far as possible before backtracking.',
    description:
      'DFS uses a stack, so it dives down one corridor before trying alternatives. It finds a path when one exists, but that path is usually far from the shortest. Watch the frontier: instead of expanding like a ring, it keeps replacing the top of the stack.',
    howItWorks: [
      'Put the start node on a stack.',
      'Pop the top node and mark it explored.',
      'Push unvisited, passable neighbours onto the stack.',
      'Stop when the destination is popped. Backtracking is implicit in the stack order.',
    ],
    costModel: 'Every edge costs one step. Terrain costs are ignored.',
    guarantee: 'Finds a path if one exists, but not necessarily a short one.',
    weighted: false,
    complexity: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V)',
    },
    takeaway: 'Great for exploring every possibility; poor for shortest routes.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function dfs(grid, start, end) {' },
      { id: 'init', text: '  const stack = [start], seen = new Set([start]);' },
      { id: 'while', text: '  while (stack.length) {' },
      { id: 'pop', text: '    const node = stack.pop();' },
      { id: 'goal', text: '    if (node === end) return path(node);' },
      { id: 'loop', text: '    for (const next of neighbours(node)) {' },
      { id: 'skip', text: '      if (seen.has(next) || isWall(next)) continue;' },
      { id: 'visit', text: '      seen.add(next); parent.set(next, node);' },
      { id: 'push', text: '      stack.push(next);' },
      { id: 'end', text: '    }' },
      { id: 'miss', text: '  return null;' },
      { id: 'ret', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure DFS(grid, start, end)' },
      { id: 'init', text: '  stack ← [start]; seen ← {start}' },
      { id: 'while', text: '  while stack is not empty do' },
      { id: 'pop', text: '    node ← pop stack' },
      { id: 'goal', text: '    if node = end then return rebuild path' },
      { id: 'loop', text: '    for each passable neighbour next do' },
      { id: 'skip', text: '      if next ∈ seen then continue' },
      { id: 'visit', text: '      seen ← seen ∪ {next}; parent[next] ← node' },
      { id: 'push', text: '      push next' },
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
    const stack: number[] = [grid.start]
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
      note: 'Stack starts with the start node. DFS will always expand the most recently pushed node.',
    })

    if (grid.start === grid.end) {
      visited = 1
      return finish([grid.start], true, 'Start and destination are the same cell.')
    }

    if (grid.cells[grid.start] === 0 || grid.cells[grid.end] === 0) {
      return finish([], false, 'The start or destination cell is blocked by a wall. Clear it and run again.')
    }

    while (stack.length > 0) {
      const current = stack.pop() as number
      explored[current] = 1
      visited += 1

      if (current === grid.end) {
        const path = reconstructPath(parent, grid.start, grid.end)
        return finish(path, true, `Destination reached after exploring ${visited} nodes. DFS took the first route it could follow.`)
      }

      let added = 0
      for (const next of neighbours(grid, current)) {
        if (grid.cells[next] === 0 || seen[next]) continue
        seen[next] = 1
        parent[next] = current
        stack.push(next)
        added += 1
      }

      frames.push({
        explored: explored.slice(),
        frontier: stack.slice(),
        current,
        path: null,
        visitedCount: visited,
        line: added > 0 ? 'push' : 'pop',
        note: `Pop (${pointOf(current, grid.cols).x}, ${pointOf(current, grid.cols).y}); pushed ${added} unvisited ${added === 1 ? 'neighbour' : 'neighbours'}.`,
      })
    }

    return finish([], false, `Stack exhausted after ${visited} nodes. The destination cannot be reached.`)
  },
}
