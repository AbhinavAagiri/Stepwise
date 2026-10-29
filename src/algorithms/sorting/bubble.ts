import type { SortAlgorithm } from '../../engine/types'
import { SortRecorder } from './shared'

export const bubbleSort: SortAlgorithm = {
  info: {
    slug: 'bubble-sort',
    name: 'Bubble sort',
    shortName: 'Bubble',
    family: 'quadratic',
    tagline: 'Compare neighbours; the largest value drifts right each pass.',
    description:
      'Bubble sort walks the array repeatedly, swapping any two neighbours that are out of order. After each pass the largest remaining value has bubbled to the end, so the sorted tail grows from the right.',
    howItWorks: [
      'Compare each adjacent pair from left to right.',
      'Swap when the left value is larger, so the bigger value moves right.',
      'After a full pass, the last unsorted position holds its final value.',
      'Stop early when a pass makes no swaps - the array is already sorted.',
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
    takeaway: 'Easiest sorting algorithm to reason about, but it moves data far more than necessary.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function bubbleSort(a) {' },
      { id: 'n', text: '  const n = a.length;' },
      { id: 'outer', text: '  for (let i = 0; i < n - 1; i++) {' },
      { id: 'swapped', text: '    let swapped = false;' },
      { id: 'inner', text: '    for (let j = 0; j < n - 1 - i; j++) {' },
      { id: 'cmp', text: '      if (a[j] > a[j + 1]) {' },
      { id: 'swap', text: '        [a[j], a[j + 1]] = [a[j + 1], a[j]];' },
      { id: 'flag', text: '        swapped = true;' },
      { id: 'end', text: '      }' },
      { id: 'loopend', text: '    }' },
      { id: 'early', text: '    if (!swapped) break;' },
      { id: 'ret', text: '  return a;' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure bubbleSort(a)' },
      { id: 'n', text: '  n ← length(a)' },
      { id: 'outer', text: '  repeat' },
      { id: 'swapped', text: '    swapped ← false' },
      { id: 'inner', text: '    for j ← 0 to n − 2 do' },
      { id: 'cmp', text: '      if a[j] > a[j + 1] then' },
      { id: 'swap', text: '        swap a[j], a[j + 1]' },
      { id: 'flag', text: '        swapped ← true' },
      { id: 'end', text: '      end if' },
      { id: 'loopend', text: '    end for' },
      { id: 'early', text: '  until not swapped' },
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
          ? n === 0
            ? 'No values to sort. Add an array to begin.'
            : 'A single value is already sorted.'
          : `${n} values loaded. Bubble sort will compare neighbours and swap the out-of-order pairs.`,
    })

    if (n <= 1) {
      recorder.finalize(n === 0 ? 'Nothing to sort.' : 'One value is already in place.')
      return recorder.frames
    }

    for (let i = 0; i < n - 1; i += 1) {
      let swapped = false
      for (let j = 0; j < n - 1 - i; j += 1) {
        stats.compare()
        const left = a[j]
        const right = a[j + 1]
        if (left > right) {
          recorder.push({
            kind: 'compare',
            line: 'cmp',
            compare: [j, j + 1],
            range: [0, n - 1 - i],
            note: `Compare a[${j}] = ${left} with a[${j + 1}] = ${right} → out of order.`,
          })
          ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
          stats.swap()
          recorder.push({
            kind: 'swap',
            line: 'swap',
            compare: [j, j + 1],
            range: [0, n - 1 - i],
            note: `Swap ${left} and ${right}. The larger value moves right.`,
          })
          swapped = true
        } else {
          recorder.push({
            kind: 'compare',
            line: 'cmp',
            compare: [j, j + 1],
            range: [0, n - 1 - i],
            note: `Compare a[${j}] = ${left} with a[${j + 1}] = ${right} → already in order.`,
          })
        }
      }

      recorder.sorted[n - 1 - i] = true
      recorder.push({
        kind: 'range',
        line: 'outer',
        range: [0, n - 2 - i],
        note: `Pass ${i + 1} complete. Index ${n - 1 - i} is now final.`,
      })

      if (!swapped) {
        recorder.sorted.fill(true)
        recorder.push({
          kind: 'done',
          line: 'early',
          note: 'No swaps in that pass, so the array is already sorted. Bubble sort can stop early.',
        })
        return recorder.frames
      }
    }

    recorder.finalize(
      `Sorted with ${recorder.stats.comparisons.toLocaleString()} comparisons and ${recorder.stats.swaps.toLocaleString()} swaps.`,
    )
    return recorder.frames
  },
}
