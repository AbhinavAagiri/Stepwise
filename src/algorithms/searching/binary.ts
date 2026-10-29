import type { SearchAlgorithm, SearchFrame, StepStats } from '../../engine/types'

const zero: StepStats = { comparisons: 0, swaps: 0, writes: 0, accesses: 0 }

export const binarySearch: SearchAlgorithm = {
  info: {
    slug: 'binary-search',
    name: 'Binary search',
    shortName: 'Binary',
    tagline: 'Halve a sorted range until the target is found or the range vanishes.',
    description:
      'Binary search compares the target with the middle of a sorted range. One comparison discards half of the remaining candidates, which is why it needs only about log₂ n probes. The sorted precondition is not optional: without it, discarding a half could throw away the target.',
    howItWorks: [
      'Maintain a low and high boundary around the candidates.',
      'Inspect the midpoint value.',
      'If it is too small, move low past the midpoint.',
      'If it is too large, move high before the midpoint. Stop when low passes high.',
    ],
    complexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
    },
    requiresSorted: true,
    takeaway: 'Dramatically faster than linear search - provided the data is sorted.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function binarySearch(a, target) {' },
      { id: 'init', text: '  let low = 0, high = a.length - 1;' },
      { id: 'while', text: '  while (low <= high) {' },
      { id: 'mid', text: '    const mid = Math.floor((low + high) / 2);' },
      { id: 'cmp', text: '    if (a[mid] === target) {' },
      { id: 'found', text: '      return mid;' },
      { id: 'less', text: '    } else if (a[mid] < target) {' },
      { id: 'lowup', text: '      low = mid + 1;' },
      { id: 'more', text: '    } else {' },
      { id: 'highdown', text: '      high = mid - 1;' },
      { id: 'end', text: '    }' },
      { id: 'miss', text: '  return -1;' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure binarySearch(a, target)' },
      { id: 'init', text: '  low ← 0; high ← length(a) − 1' },
      { id: 'while', text: '  while low ≤ high do' },
      { id: 'mid', text: '    mid ← floor((low + high) / 2)' },
      { id: 'cmp', text: '    if a[mid] = target then' },
      { id: 'found', text: '      return mid' },
      { id: 'less', text: '    else if a[mid] < target then' },
      { id: 'lowup', text: '      low ← mid + 1' },
      { id: 'more', text: '    else' },
      { id: 'highdown', text: '      high ← mid − 1' },
      { id: 'end', text: '    end if' },
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

    let low = 0
    let high = array.length - 1

    const eliminateOutside = (lo: number, hi: number): void => {
      for (let i = 0; i < eliminated.length; i += 1) {
        if (i < lo || i > hi) eliminated[i] = true
      }
    }

    const push = (patch: Omit<SearchFrame, 'array' | 'eliminated' | 'stats' | 'target'>): void => {
      frames.push({
        array: array.slice(),
        target,
        eliminated: eliminated.slice(),
        stats: stats(),
        ...patch,
      })
    }

    eliminateOutside(low, high)
    push({
      current: null,
      mid: null,
      low,
      high,
      found: null,
      kind: 'idle',
      line: 'fn',
      note:
        array.length === 0
          ? 'The array is empty, so the target cannot be present.'
          : `Searching for ${target}. The active range is [${low}..${high}]; everything outside is ruled out.`,
    })

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      accesses += 2 // midpoint value + range bound check
      comparisons += 1

      push({
        current: mid,
        mid,
        low,
        high,
        found: null,
        kind: 'range',
        line: 'mid',
        note: `Active range [${low}..${high}] of ${high - low + 1} candidates. Probe the midpoint, index ${mid}.`,
      })

      const value = array[mid]

      if (value === target) {
        push({
          current: mid,
          mid,
          low,
          high,
          found: mid,
          kind: 'found',
          line: 'found',
          note: `a[${mid}] = ${value} matches the target. Return index ${mid} after ${comparisons} probe${comparisons === 1 ? '' : 's'}.`,
        })
        return frames
      }

      if (value < target) {
        low = mid + 1
        eliminateOutside(low, high)
        push({
          current: mid,
          mid,
          low,
          high,
          found: null,
          kind: 'probe',
          line: 'lowup',
          note: `${value} < ${target}. Discard the left half and indices before ${low}.`,
        })
      } else {
        high = mid - 1
        eliminateOutside(low, high)
        push({
          current: mid,
          mid,
          low,
          high,
          found: null,
          kind: 'probe',
          line: 'highdown',
          note: `${value} > ${target}. Discard the right half and indices after ${high}.`,
        })
      }
    }

    eliminated.fill(true)
    push({
      current: null,
      mid: null,
      low,
      high,
      found: null,
      kind: 'miss',
      line: 'miss',
      note:
        low > high
          ? `The range is empty (low ${low} > high ${high}). ${target} is not present; return −1.`
          : `${target} is not present. Return −1.`,
    })
    return frames
  },
}
