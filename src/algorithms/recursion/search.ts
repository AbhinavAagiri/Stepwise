import type {
  RecursionDemo,
  RecursionFrame,
  RecursionRunOutput,
  StackEntry,
} from '../../engine/types'

export const recursiveSearchDemo: RecursionDemo = {
  info: {
    slug: 'recursive-search',
    name: 'Recursive binary search',
    tagline: 'Each recursive call owns a smaller interval of a sorted array.',
    description:
      'The recursive version of binary search passes new low and high bounds into each call instead of looping. The call stack records every interval that was considered, and returns unwind the result back to the first call.',
    howItWorks: [
      'If low passes high, the interval is empty: return −1.',
      'Inspect the midpoint of the current interval.',
      'If it matches, return that index.',
      'Otherwise recurse into the half that could still contain the target.',
    ],
    complexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(log n)',
    },
    limits: 'Up to 16 sorted values. The array must be sorted before searching.',
    takeaway: 'Same comparisons as the loop version, but the stack makes the shrinking interval explicit.',
    inputLabel: 'values',
    inputHint: 'Enter sorted values, then choose a target.',
    min: 2,
    max: 16,
    defaultValue: 9,
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function search(a, low, high, target) {' },
      { id: 'base', text: '  if (low > high) return -1;' },
      { id: 'mid', text: '  const mid = Math.floor((low + high) / 2);' },
      { id: 'found', text: '  if (a[mid] === target) return mid;' },
      { id: 'right', text: '  if (a[mid] < target)' },
      { id: 'rightCall', text: '    return search(a, mid + 1, high, target);' },
      { id: 'left', text: '  return search(a, low, mid - 1, target);' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'function search(a, low, high, target)' },
      { id: 'base', text: '  if low > high then return −1' },
      { id: 'mid', text: '  mid ← floor((low + high) / 2)' },
      { id: 'found', text: '  if a[mid] = target then return mid' },
      { id: 'right', text: '  if a[mid] < target then' },
      { id: 'rightCall', text: '    return search(mid + 1, high, target)' },
      { id: 'left', text: '  return search(low, mid − 1, target)' },
      { id: 'close', text: 'end function' },
    ],
  },
  inputMode: 'search',
  run({ values, target }): RecursionRunOutput {
    const array = (values ?? []).slice().sort((a, b) => a - b)
    const sought = target ?? 0
    const frames: RecursionFrame[] = []
    const stack: StackEntry[] = []
    let counter = 0

    const eliminatedFor = (low: number, high: number): boolean[] =>
      array.map((_, index) => index < low || index > high)

    const snapshot = (
      low: number,
      high: number,
      mid: number | null,
      line: string,
      note: string,
      result: number | string | null = null,
    ): void => {
      frames.push({
        stack: stack.map((entry) => ({ ...entry })),
        line,
        note,
        result,
        array: array.slice(),
        target: sought,
        low,
        high,
        mid,
        eliminated: eliminatedFor(low, high),
      })
    }

    snapshot(0, array.length - 1, null, 'fn', `Search for ${sought} in a sorted array of ${array.length} values.`)

    const search = (low: number, high: number, depth: number): number => {
      counter += 1
      const entry: StackEntry = {
        id: `search-${counter}`,
        label: `search(${low}, ${high})`,
        detail: `interval ${low}..${high}`,
        depth,
        status: 'active',
      }
      stack.push(entry)
      snapshot(low, high, null, 'fn', `Call search(${low}, ${high}) for the interval [${low}..${high}].`)

      if (low > high) {
        entry.status = 'base'
        entry.returnValue = -1
        snapshot(low, high, null, 'base', `low ${low} > high ${high}. Interval is empty; return −1.`, -1)
        stack.pop()
        return -1
      }

      const mid = Math.floor((low + high) / 2)
      snapshot(low, high, mid, 'mid', `Midpoint of [${low}..${high}] is index ${mid}, value ${array[mid]}.`)

      if (array[mid] === sought) {
        entry.status = 'base'
        entry.returnValue = mid
        snapshot(low, high, mid, 'found', `${array[mid]} matches ${sought}. Return index ${mid} immediately.`, mid)
        stack.pop()
        return mid
      }

      if (array[mid] < sought) {
        snapshot(low, high, mid, 'right', `${array[mid]} < ${sought}. The answer can only be to the right; recurse on [${mid + 1}..${high}].`)
        const result = search(mid + 1, high, depth + 1)
        entry.status = 'returned'
        entry.returnValue = result
        snapshot(
          low,
          high,
          mid,
          result === -1 ? 'base' : 'found',
          `search(${mid + 1}, ${high}) returned ${result}. Unwind this call with the same result.`,
          result,
        )
        stack.pop()
        return result
      }

      snapshot(low, high, mid, 'left', `${array[mid]} > ${sought}. The answer can only be to the left; recurse on [${low}..${mid - 1}].`)
      const result = search(low, mid - 1, depth + 1)
      entry.status = 'returned'
      entry.returnValue = result
      snapshot(
        low,
        high,
        mid,
        result === -1 ? 'base' : 'found',
        `search(${low}, ${mid - 1}) returned ${result}. Unwind this call with the same result.`,
        result,
      )
      stack.pop()
      return result
    }

    const result = search(0, array.length - 1, 0)
    snapshot(
      0,
      array.length - 1,
      null,
      'close',
      result === -1
        ? `${sought} is not present. The stack unwound to −1.`
        : `${sought} is at index ${result}. The stack unwound and returned ${result} to every caller.`,
      result,
    )

    return { frames, result, values: array, target: sought }
  },
}
