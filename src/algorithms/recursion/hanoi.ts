import type {
  HanoiState,
  RecursionDemo,
  RecursionFrame,
  RecursionRunOutput,
  StackEntry,
} from '../../engine/types'

const ROD_NAMES = ['A', 'B', 'C']

export const hanoiDemo: RecursionDemo = {
  info: {
    slug: 'tower-of-hanoi',
    name: 'Tower of Hanoi',
    tagline: 'Two recursive tower moves surround a single disk move.',
    description:
      'To move n disks from A to C, first move n − 1 disks to B, move the largest disk to C, then move the n − 1 disks from B to C. Each recursive call makes two smaller recursive calls, producing exactly 2ⁿ − 1 moves.',
    howItWorks: [
      'The base case is zero disks: do nothing.',
      'Move the top n − 1 disks to the spare rod.',
      'Move disk n to the destination rod.',
      'Move the n − 1 disks from the spare rod onto disk n.',
    ],
    complexity: {
      best: 'O(2ⁿ)',
      average: 'O(2ⁿ)',
      worst: 'O(2ⁿ)',
      space: 'O(n)',
    },
    limits: '1 to 5 disks. Six disks would need 63 moves.',
    takeaway: 'A small recursion with an unavoidably exponential number of moves.',
    inputLabel: 'disks',
    inputHint: 'The minimum number of moves is 2ⁿ − 1.',
    min: 1,
    max: 5,
    defaultValue: 3,
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function hanoi(n, from, to, spare) {' },
      { id: 'base', text: '  if (n === 0) return;' },
      { id: 'call1', text: '  hanoi(n - 1, from, spare, to);' },
      { id: 'move', text: '  moveDisk(n, from, to);' },
      { id: 'call2', text: '  hanoi(n - 1, spare, to, from);' },
      { id: 'ret', text: '  // this call is complete' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure hanoi(n, from, to, spare)' },
      { id: 'base', text: '  if n = 0 then return' },
      { id: 'call1', text: '  hanoi(n − 1, from, spare, to)' },
      { id: 'move', text: '  move disk n from → to' },
      { id: 'call2', text: '  hanoi(n − 1, spare, to, from)' },
      { id: 'ret', text: '  // return to caller' },
      { id: 'close', text: 'end procedure' },
    ],
  },
  inputMode: 'number',
  run({ n }): RecursionRunOutput {
    const rods: [number[], number[], number[]] = [
      Array.from({ length: n }, (_, index) => n - index),
      [],
      [],
    ]
    const frames: RecursionFrame[] = []
    const stack: StackEntry[] = []
    let moveCount = 0
    let callCounter = 0

    const cloneRods = (): [number[], number[], number[]] => [
      rods[0].slice(),
      rods[1].slice(),
      rods[2].slice(),
    ]

    const snapshot = (
      line: string,
      note: string,
      moving: HanoiState['moving'] = null,
      result: number | string | null = null,
    ): void => {
      frames.push({
        stack: stack.map((entry) => ({ ...entry })),
        line,
        note,
        result,
        hanoi: { rods: cloneRods(), moving },
        moveCount,
      })
    }

    snapshot('fn', `Ready. ${n} ${n === 1 ? 'disk' : 'disks'} on rod A; the goal is rod C. The minimum is ${2 ** n - 1} moves.`)

    const moveDisk = (disk: number, from: number, to: number): void => {
      snapshot(
        'move',
        `Lift disk ${disk} from rod ${ROD_NAMES[from]} to rod ${ROD_NAMES[to]}.`,
        { disk, from, to },
      )
      const removed = rods[from].pop()
      if (removed !== undefined) rods[to].push(removed)
      moveCount += 1
      snapshot(
        'move',
        `Moved disk ${disk}: ${ROD_NAMES[from]} → ${ROD_NAMES[to]}. Move ${moveCount} of ${2 ** n - 1}.`,
      )
    }

    const solve = (count: number, from: number, to: number, spare: number, depth: number): void => {
      if (count === 0) {
        snapshot('base', `No disks to move in this subproblem. Return immediately.`)
        return
      }

      callCounter += 1
      const entry: StackEntry = {
        id: `hanoi-${callCounter}`,
        label: `hanoi(${count}, ${ROD_NAMES[from]}→${ROD_NAMES[to]})`,
        detail: `spare: ${ROD_NAMES[spare]}`,
        depth,
        status: 'active',
      }
      stack.push(entry)
      snapshot(
        'fn',
        `hanoi(${count}, ${ROD_NAMES[from]}→${ROD_NAMES[to]}): move ${count - 1} ${count - 1 === 1 ? 'disk' : 'disks'} from ${ROD_NAMES[from]} to ${ROD_NAMES[spare]}.`,
      )

      snapshot('call1', `First recursive call: clear the smaller disks out of the way.`)
      solve(count - 1, from, spare, to, depth + 1)

      snapshot('move', `Now disk ${count} is exposed on rod ${ROD_NAMES[from]}. Move it to ${ROD_NAMES[to]}.`)
      moveDisk(count, from, to)

      snapshot('call2', `Second recursive call: move the ${count - 1} smaller disks onto disk ${count}.`)
      solve(count - 1, spare, to, from, depth + 1)

      entry.status = 'returned'
      snapshot('ret', `hanoi(${count}, ${ROD_NAMES[from]}→${ROD_NAMES[to]}) complete. Return to caller.`)
      stack.pop()
    }

    solve(n, 0, 2, 1, 0)
    const result = `${moveCount} moves`
    snapshot(
      'close',
      `Solved in ${moveCount} moves. The minimum possible is ${2 ** n - 1}, so this sequence is optimal.`,
      null,
      result,
    )

    return { frames, result }
  },
}
