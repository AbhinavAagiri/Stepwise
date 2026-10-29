import type {
  RecursionDemo,
  RecursionFrame,
  RecursionRunOutput,
  StackEntry,
} from '../../engine/types'

function snapshot(
  frames: RecursionFrame[],
  stack: StackEntry[],
  line: string,
  note: string,
  result: number | string | null = null,
): void {
  frames.push({
    stack: stack.map((entry) => ({ ...entry })),
    line,
    note,
    result,
  })
}

export const factorialDemo: RecursionDemo = {
  info: {
    slug: 'factorial',
    name: 'Factorial',
    tagline: 'One call multiplies its way down to a base case, then unwinds.',
    description:
      'factorial(n) is defined as n × factorial(n − 1), with factorial(1) = 1. Each call must wait for the call below it to return before it can multiply. The stack grows to depth n, then collapses as values travel back up.',
    howItWorks: [
      'Call factorial(n). It cannot finish yet, because it needs factorial(n − 1).',
      'Repeat until the argument reaches the base case, 1.',
      'The base case returns 1 immediately.',
      'Each suspended call multiplies its own n by the returned value and returns.',
    ],
    complexity: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(n)',
    },
    limits: 'n from 0 to 8. Values above 12 overflow JavaScript safe integers.',
    takeaway: 'The clearest example of a stack growing on the way down and unwinding on the way up.',
    inputLabel: 'n',
    inputHint: 'How deep should the call stack go?',
    min: 0,
    max: 8,
    defaultValue: 4,
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function factorial(n) {' },
      { id: 'base', text: '  if (n <= 1) {' },
      { id: 'baseReturn', text: '    return 1;' },
      { id: 'recurse', text: '  return n * factorial(n - 1);' },
      { id: 'end', text: '  }' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'function factorial(n)' },
      { id: 'base', text: '  if n ≤ 1 then' },
      { id: 'baseReturn', text: '    return 1' },
      { id: 'recurse', text: '  return n × factorial(n − 1)' },
      { id: 'end', text: '  end if' },
      { id: 'close', text: 'end function' },
    ],
  },
  inputMode: 'number',
  run({ n }): RecursionRunOutput {
    const frames: RecursionFrame[] = []
    const stack: StackEntry[] = []
    let counter = 0

    snapshot(frames, stack, 'fn', `Ready to compute factorial(${n}). Start with an empty call stack.`)

    const factorial = (value: number, depth: number): number => {
      counter += 1
      const entry: StackEntry = {
        id: `factorial-${counter}`,
        label: `factorial(${value})`,
        detail: `n = ${value}`,
        depth,
        status: 'active',
      }
      stack.push(entry)
      snapshot(
        frames,
        stack,
        'fn',
        `Call factorial(${value}). ${value <= 1 ? 'This is the base case.' : `It needs ${value} × factorial(${value - 1}).`}`,
      )

      if (value <= 1) {
        entry.status = 'base'
        snapshot(frames, stack, 'base', `Base case reached: ${value} ≤ 1, so return 1 without recursing.`)
        entry.status = 'returned'
        entry.returnValue = 1
        snapshot(frames, stack, 'baseReturn', `factorial(${value}) returns 1. Pop its frame.`)
        stack.pop()
        return 1
      }

      snapshot(frames, stack, 'recurse', `factorial(${value}) pauses and calls factorial(${value - 1}).`)
      const below = factorial(value - 1, depth + 1)
      const result = value * below
      entry.status = 'returned'
      entry.returnValue = result
      snapshot(
        frames,
        stack,
        'recurse',
        `factorial(${value - 1}) returned ${below}. Now compute ${value} × ${below} = ${result}.`,
      )
      stack.pop()
      return result
    }

    const result = factorial(n, 0)
    snapshot(
      frames,
      stack,
      'close',
      `All frames are gone. factorial(${n}) = ${result}. The stack unwound from the base case back to the first call.`,
      result,
    )

    return { frames, result }
  },
}
