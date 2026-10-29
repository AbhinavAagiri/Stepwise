import type {
  FibNode,
  RecursionDemo,
  RecursionFrame,
  RecursionRunOutput,
  StackEntry,
} from '../../engine/types'

export const fibonacciDemo: RecursionDemo = {
  info: {
    slug: 'fibonacci',
    name: 'Fibonacci',
    tagline: 'Two recursive calls form a tree - and repeat enormous amounts of work.',
    description:
      'Naive fib(n) calls fib(n − 1) and fib(n − 2). Those calls overlap, so the call tree contains the same subproblems many times. The number of calls grows roughly with the golden ratio to the power n, even though only n distinct values exist.',
    howItWorks: [
      'If n < 2, return n immediately - the base case.',
      'Otherwise call fib(n − 1) and wait for its result.',
      'Then call fib(n − 2) and add the two values.',
      'Repeated nodes in the tree mark calls whose n had already been computed before.',
    ],
    complexity: {
      best: 'O(2ⁿ)',
      average: 'O(2ⁿ)',
      worst: 'O(2ⁿ)',
      space: 'O(n)',
    },
    limits: 'n from 0 to 8. The call count already reaches 67 at n = 8.',
    takeaway: 'A precise picture of why memoization turns exponential recursion into linear work.',
    inputLabel: 'n',
    inputHint: 'Higher values create a much larger call tree.',
    min: 0,
    max: 8,
    defaultValue: 5,
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function fib(n) {' },
      { id: 'base', text: '  if (n < 2) return n;' },
      { id: 'recurse', text: '  return fib(n - 1) + fib(n - 2);' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'function fib(n)' },
      { id: 'base', text: '  if n < 2 then return n' },
      { id: 'recurse', text: '  return fib(n − 1) + fib(n − 2)' },
      { id: 'close', text: 'end function' },
    ],
  },
  inputMode: 'number',
  run({ n }): RecursionRunOutput {
    const frames: RecursionFrame[] = []
    const stack: StackEntry[] = []
    const nodes: FibNode[] = []
    const nodeIndex = new Map<string, number>()
    const completed = new Map<number, number>()
    let callCounter = 0
    let repeatedCount = 0
    let callCount = 0

    const snapshot = (line: string, note: string, activeId: string | null, result: number | string | null = null): void => {
      frames.push({
        stack: stack.map((entry) => ({ ...entry })),
        line,
        note,
        result,
        fibNodes: nodes.map((node) => ({ ...node, children: node.children.slice() })),
        activeFibId: activeId,
        callCount,
        repeatedCount,
      })
    }

    snapshot('fn', `Ready to compute fib(${n}). The tree starts empty.`, null)

    const fib = (value: number, parentId: string | null, depth: number): number => {
      callCount += 1
      callCounter += 1
      const id = `fib-${callCounter}`
      const repeated = (completed.get(value) ?? 0) > 0
      if (repeated) repeatedCount += 1

      const node: FibNode = {
        id,
        n: value,
        parent: parentId,
        depth,
        status: 'active',
        children: [],
        repeated,
      }
      nodeIndex.set(id, nodes.length)
      nodes.push(node)
      if (parentId) {
        const parentIndex = nodeIndex.get(parentId)
        if (parentIndex !== undefined) nodes[parentIndex].children.push(id)
      }

      const entry: StackEntry = {
        id: `call-${callCounter}`,
        label: `fib(${value})`,
        detail: `n = ${value}`,
        depth,
        status: 'active',
      }
      stack.push(entry)

      snapshot(
        'fn',
        `Call fib(${value})${repeated ? ' - this n was already computed earlier in the tree.' : '.'}`,
        id,
      )

      if (value < 2) {
        node.status = 'base'
        node.value = value
        entry.status = 'base'
        snapshot('base', `Base case: ${value} < 2, return ${value} immediately.`, id)
        completed.set(value, (completed.get(value) ?? 0) + 1)
        entry.status = 'returned'
        entry.returnValue = value
        snapshot('base', `fib(${value}) returns ${value}. Pop the frame.`, id)
        stack.pop()
        return value
      }

      snapshot('recurse', `fib(${value}) needs fib(${value - 1}) first.`, id)
      const left = fib(value - 1, id, depth + 1)
      snapshot('recurse', `fib(${value - 1}) returned ${left}. Now fib(${value}) calls fib(${value - 2}).`, id)
      const right = fib(value - 2, id, depth + 1)

      const result = left + right
      node.value = result
      node.status = 'returned'
      entry.status = 'returned'
      entry.returnValue = result
      completed.set(value, (completed.get(value) ?? 0) + 1)
      snapshot('recurse', `fib(${value}) = ${left} + ${right} = ${result}. Return and pop the frame.`, id)
      stack.pop()
      return result
    }

    const result = fib(n, null, 0)
    snapshot(
      'close',
      `fib(${n}) = ${result}. The naive tree made ${callCount} calls; ${repeatedCount} repeated a value that had already been computed.`,
      null,
      result,
    )

    return { frames, result }
  },
}
