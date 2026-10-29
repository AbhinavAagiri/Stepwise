import type { SortAlgorithm } from '../../engine/types'
import { SortRecorder } from './shared'

export const insertionSort: SortAlgorithm = {
  info: {
    slug: 'insertion-sort',
    name: 'Insertion sort',
    shortName: 'Insertion',
    family: 'quadratic',
    tagline: 'Grow a sorted prefix by inserting each new value into place.',
    description:
      'Insertion sort keeps the left side of the array sorted. It lifts the next value out as a key, shifts larger values one slot right, then drops the key into the gap. On nearly sorted data, very little shifting is needed.',
    howItWorks: [
      'Treat index 0 as a sorted prefix of length one.',
      'Lift a[i] into a temporary key, leaving a gap at index i.',
      'Move left while the previous value is greater than the key, shifting each value right.',
      'Drop the key into the gap. The sorted prefix now includes i.',
    ],
    complexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    stable: true,
    inPlace: true,
    adaptive: true,
    takeaway: 'Excellent for small or nearly sorted arrays; quadratic when values arrive reversed.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function insertionSort(a) {' },
      { id: 'n', text: '  const n = a.length;' },
      { id: 'outer', text: '  for (let i = 1; i < n; i++) {' },
      { id: 'key', text: '    const key = a[i];' },
      { id: 'initj', text: '    let j = i - 1;' },
      { id: 'inner', text: '    while (j >= 0 && a[j] > key) {' },
      { id: 'cmp', text: '      if (a[j] > key) {' },
      { id: 'shift', text: '        a[j + 1] = a[j];' },
      { id: 'decr', text: '        j--;' },
      { id: 'end', text: '      }' },
      { id: 'place', text: '    a[j + 1] = key;' },
      { id: 'ret', text: '  return a;' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure insertionSort(a)' },
      { id: 'n', text: '  n ← length(a)' },
      { id: 'outer', text: '  for i ← 1 to n − 1 do' },
      { id: 'key', text: '    key ← a[i]' },
      { id: 'initj', text: '    j ← i − 1' },
      { id: 'inner', text: '    while j ≥ 0 and a[j] > key do' },
      { id: 'cmp', text: '      if a[j] > key then' },
      { id: 'shift', text: '        a[j + 1] ← a[j]' },
      { id: 'decr', text: '        j ← j − 1' },
      { id: 'end', text: '      end if' },
      { id: 'place', text: '    a[j + 1] ← key' },
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
          ? 'Add two or more values to watch the sorted prefix grow.'
          : `${n} values loaded. The sorted prefix starts with a single value.`,
    })

    if (n <= 1) {
      recorder.finalize('Nothing to reorder.')
      return recorder.frames
    }

    recorder.sorted[0] = true

    for (let i = 1; i < n; i += 1) {
      const key = a[i]
      stats.read()
      recorder.push({
        kind: 'range',
        line: 'key',
        key: i,
        keyValue: key,
        range: [0, i],
        note: `Lift a[${i}] = ${key} out as the key. Positions 0..${i - 1} are already sorted.`,
      })

      let j = i - 1
      while (j >= 0) {
        stats.compare()
        const compared = a[j]
        if (compared > key) {
          recorder.push({
            kind: 'compare',
            line: 'cmp',
            compare: [j, i],
            keyValue: key,
            range: [0, i],
            note: `Compare a[${j}] = ${compared} with key ${key} → larger, so shift it right.`,
          })
          a[j + 1] = a[j]
          stats.read()
          stats.write()
          recorder.push({
            kind: 'write',
            line: 'shift',
            write: j + 1,
            keyValue: key,
            range: [0, i],
            note: `Shift ${compared} from index ${j} to ${j + 1}. The gap moves left.`,
          })
          j -= 1
        } else {
          recorder.push({
            kind: 'compare',
            line: 'cmp',
            compare: [j, i],
            keyValue: key,
            range: [0, i],
            note: `Compare a[${j}] = ${compared} with key ${key} → key belongs to its right.`,
          })
          break
        }
      }

      a[j + 1] = key
      stats.write()
      for (let k = 0; k <= i; k += 1) recorder.sorted[k] = true
      recorder.push({
        kind: 'write',
        line: 'place',
        write: j + 1,
        range: [0, i],
        note: `Insert key ${key} at index ${j + 1}. Sorted prefix now spans 0..${i}.`,
      })
    }

    recorder.finalize(
      `Sorted with ${recorder.stats.comparisons.toLocaleString()} comparisons and ${recorder.stats.writes.toLocaleString()} writes.`,
    )
    return recorder.frames
  },
}
