import type { SearchAlgorithm, SearchFrame, StepStats } from '../../engine/types'

const zero: StepStats = { comparisons: 0, swaps: 0, writes: 0, accesses: 0 }

export const linearSearch: SearchAlgorithm = {
  info: {
    slug: 'linear-search',
    name: 'Linear search',
    shortName: 'Linear',
    tagline: 'Check every value in turn until the target appears.',
    description:
      'Linear search visits each element from left to right, comparing it with the target. It makes no assumptions about order, so it works on any collection - but it may have to inspect everything before concluding the value is absent.',
    howItWorks: [
      'Start at index 0.',
      'Compare the current value with the target.',
      'If they match, return the index.',
      'Otherwise advance by one. If the end is reached, the target is absent.',
    ],
    complexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1)',
    },
    requiresSorted: false,
    takeaway: 'The only option when data is unordered or streamed one value at a time.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function linearSearch(a, target) {' },
      { id: 'n', text: '  const n = a.length;' },
      { id: 'loop', text: '  for (let i = 0; i < n; i++) {' },
      { id: 'cmp', text: '    if (a[i] === target) {' },
      { id: 'found', text: '      return i;' },
      { id: 'next', text: '    }' },
      { id: 'miss', text: '  return -1;' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure linearSearch(a, target)' },
      { id: 'n', text: '  n ← length(a)' },
      { id: 'loop', text: '  for i ← 0 to n − 1 do' },
      { id: 'cmp', text: '    if a[i] = target then' },
      { id: 'found', text: '      return i' },
      { id: 'next', text: '    end if' },
      { id: 'miss', text: '  return −1' },
      { id: 'close', text: 'end procedure' },
    ],
  },
  run(input, target) {
    const array = input.slice()
    const eliminated = new Array(array.length).fill(false)
    const frames: SearchFrame[] = []
    let comparisons = 0
    let accesses = 0
    const stats = (): StepStats => ({ ...zero, comparisons, accesses })

    const push = (patch: Omit<SearchFrame, 'array' | 'eliminated' | 'stats' | 'target'>): void => {
      frames.push({
        array: array.slice(),
        target,
        eliminated: eliminated.slice(),
        stats: stats(),
        ...patch,
      })
    }

    push({
      current: null,
      mid: null,
      low: 0,
      high: array.length - 1,
      found: null,
      kind: 'idle',
      line: 'fn',
      note:
        array.length === 0
          ? 'The array is empty, so the target cannot be present.'
          : `Searching for ${target} across ${array.length} values. No sorted order is required.`,
    })

    for (let i = 0; i < array.length; i += 1) {
      comparisons += 1
      accesses += 1
      const value = array[i]
      if (value === target) {
        push({
          current: i,
          mid: null,
          low: 0,
          high: array.length - 1,
          found: i,
          kind: 'found',
          line: 'found',
          note: `a[${i}] = ${value} matches the target. Return index ${i}.`,
        })
        return frames
      }

      eliminated[i] = true
      push({
        current: i,
        mid: null,
        low: 0,
        high: array.length - 1,
        found: null,
        kind: 'probe',
        line: 'cmp',
        note: `Compare a[${i}] = ${value} with ${target} → not a match. Move to index ${i + 1}.`,
      })
    }

    eliminated.fill(true)
    push({
      current: null,
      mid: null,
      low: 0,
      high: array.length - 1,
      found: null,
      kind: 'miss',
      line: 'miss',
      note: `Every value was checked. ${target} is not in the array; return −1.`,
    })
    return frames
  },
}
