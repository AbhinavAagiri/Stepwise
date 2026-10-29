import type { SortAlgorithm } from '../../engine/types'
import { SortRecorder } from './shared'

export const selectionSort: SortAlgorithm = {
  info: {
    slug: 'selection-sort',
    name: 'Selection sort',
    shortName: 'Selection',
    family: 'quadratic',
    tagline: 'Find the smallest remaining value, then move it into place.',
    description:
      'Selection sort divides the array into a sorted prefix and an unsorted suffix. Each pass scans the suffix for its minimum and swaps that value into the next prefix position.',
    howItWorks: [
      'Start at index i and assume it holds the minimum.',
      'Scan the rest of the unsorted suffix, remembering the smallest value seen.',
      'After the scan, swap the minimum into index i.',
      'Move i forward; the sorted prefix grows by exactly one value per pass.',
    ],
    complexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    stable: false,
    inPlace: true,
    adaptive: false,
    takeaway: 'Always makes the same number of comparisons, but at most n − 1 swaps.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function selectionSort(a) {' },
      { id: 'n', text: '  const n = a.length;' },
      { id: 'outer', text: '  for (let i = 0; i < n - 1; i++) {' },
      { id: 'min', text: '    let min = i;' },
      { id: 'inner', text: '    for (let j = i + 1; j < n; j++) {' },
      { id: 'cmp', text: '      if (a[j] < a[min]) {' },
      { id: 'newmin', text: '        min = j;' },
      { id: 'end', text: '      }' },
      { id: 'swap', text: '    if (min !== i) [a[i], a[min]] = [a[min], a[i]];' },
      { id: 'sorted', text: '    // a[i] is now final' },
      { id: 'ret', text: '  return a;' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure selectionSort(a)' },
      { id: 'n', text: '  n ← length(a)' },
      { id: 'outer', text: '  for i ← 0 to n − 2 do' },
      { id: 'min', text: '    min ← i' },
      { id: 'inner', text: '    for j ← i + 1 to n − 1 do' },
      { id: 'cmp', text: '      if a[j] < a[min] then' },
      { id: 'newmin', text: '        min ← j' },
      { id: 'end', text: '      end if' },
      { id: 'swap', text: '    if min ≠ i then swap a[i], a[min]' },
      { id: 'sorted', text: '    // a[i] is now final' },
      { id: 'ret', text: '  return a' },
      { id: 'close', text: 'end procedure' },
    ],
  },
  run(input) {
    const recorder = new SortRecorder(input)
    const { array: a, stats } = recorder
    const n = a.length

    recorder.push({
      kind: 'idle',
      line: 'fn',
      note:
        n <= 1
          ? 'Add two or more values to see selection sort work.'
          : `${n} values loaded. Each pass settles one more position from the left.`,
    })

    if (n <= 1) {
      recorder.finalize('Nothing to reorder.')
      return recorder.frames
    }

    for (let i = 0; i < n - 1; i += 1) {
      let min = i
      recorder.push({
        kind: 'range',
        line: 'min',
        min,
        range: [i, n - 1],
        note: `Assume a[${i}] = ${a[i]} is the smallest remaining value.`,
      })

      for (let j = i + 1; j < n; j += 1) {
        stats.compare()
        const candidate = a[j]
        const currentMin = a[min]
        if (candidate < currentMin) {
          min = j
          recorder.push({
            kind: 'compare',
            line: 'newmin',
            compare: [j, i],
            min,
            range: [i, n - 1],
            note: `${candidate} is smaller than ${currentMin}. New minimum at index ${j}.`,
          })
        } else {
          recorder.push({
            kind: 'compare',
            line: 'cmp',
            compare: [j, min],
            min,
            range: [i, n - 1],
            note: `Compare ${candidate} with the minimum ${currentMin} → keep ${currentMin}.`,
          })
        }
      }

      if (min !== i) {
        const value = a[i]
        ;[a[i], a[min]] = [a[min], a[i]]
        stats.swap()
        recorder.push({
          kind: 'swap',
          line: 'swap',
          compare: [i, min],
          min: i,
          range: [i, n - 1],
          note: `Swap ${value} with ${a[i]} so the minimum lands at index ${i}.`,
        })
      } else {
        recorder.push({
          kind: 'range',
          line: 'sorted',
          min: i,
          range: [i, n - 1],
          note: `a[${i}] already holds the minimum. No swap needed.`,
        })
      }

      recorder.sorted[i] = true
      recorder.push({
        kind: 'range',
        line: 'outer',
        range: [i + 1, n - 1],
        note: `Index ${i} is final. Sorted prefix is now ${i + 1} ${i + 1 === 1 ? 'value' : 'values'} long.`,
      })
    }

    recorder.finalize(
      `Sorted with ${recorder.stats.comparisons.toLocaleString()} comparisons and ${recorder.stats.swaps.toLocaleString()} swaps.`,
    )
    return recorder.frames
  },
}
