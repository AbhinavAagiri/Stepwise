import type { SortAlgorithm } from '../../engine/types'
import { SortRecorder } from './shared'

export const quickSort: SortAlgorithm = {
  info: {
    slug: 'quick-sort',
    name: 'Quick sort',
    shortName: 'Quick',
    family: 'divide',
    tagline: 'Choose a pivot, partition around it, and recurse on both sides.',
    description:
      'Quick sort picks a pivot and rearranges the range so smaller values sit to its left and larger values to its right. The pivot is then in its final position, and the two unsorted sides are partitioned independently. This implementation uses Lomuto partitioning with the last value as pivot.',
    howItWorks: [
      'Take the last value of the range as the pivot.',
      'Scan left to right, keeping a boundary i for values ≤ pivot.',
      'When a value is ≤ pivot, extend the boundary and swap it into place.',
      'Move the pivot between the partitions, then recurse on each side.',
    ],
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
      space: 'O(log n)',
    },
    stable: false,
    inPlace: true,
    adaptive: false,
    takeaway: 'Usually fastest in practice, but last-element pivots degrade on sorted input.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function quickSort(a, lo = 0, hi = a.length - 1) {' },
      { id: 'base', text: '  if (lo >= hi) return a;' },
      { id: 'pivot', text: '  const pivot = a[hi];' },
      { id: 'part', text: '  let i = lo - 1;' },
      { id: 'loop', text: '  for (let j = lo; j < hi; j++) {' },
      { id: 'cmp', text: '    if (a[j] <= pivot) {' },
      { id: 'small', text: '      i++;' },
      { id: 'swap', text: '      if (i !== j) [a[i], a[j]] = [a[j], a[i]];' },
      { id: 'place', text: '  [a[i + 1], a[hi]] = [a[hi], a[i + 1]];' },
      { id: 'rec1', text: '  quickSort(a, lo, i);' },
      { id: 'rec2', text: '  quickSort(a, i + 2, hi);' },
      { id: 'ret', text: '  return a;' },
      { id: 'close', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure quickSort(a, lo, hi)' },
      { id: 'base', text: '  if lo ≥ hi then return' },
      { id: 'pivot', text: '  pivot ← a[hi]' },
      { id: 'part', text: '  i ← lo − 1' },
      { id: 'loop', text: '  for j ← lo to hi − 1 do' },
      { id: 'cmp', text: '    if a[j] ≤ pivot then' },
      { id: 'small', text: '      i ← i + 1' },
      { id: 'swap', text: '      swap a[i], a[j]' },
      { id: 'place', text: '  swap a[i + 1], a[hi]' },
      { id: 'rec1', text: '  quickSort(a, lo, i)' },
      { id: 'rec2', text: '  quickSort(a, i + 2, hi)' },
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
          ? 'Add two or more values to watch partitioning.'
          : `${n} values loaded. Each pass fixes one pivot in its final position.`,
    })

    if (n <= 1) {
      recorder.finalize('Nothing to partition.')
      return recorder.frames
    }

    const sort = (lo: number, hi: number): void => {
      if (lo >= hi) {
        if (lo === hi) recorder.sorted[lo] = true
        recorder.push({
          kind: 'range',
          line: 'base',
          range: [lo, hi],
          note:
            lo === hi
              ? `Range [${lo}..${hi}] holds one value; it is already final.`
              : `Range [${lo}..${hi}] is empty; nothing to do.`,
        })
        return
      }

      const pivot = a[hi]
      let i = lo - 1

      recorder.push({
        kind: 'pivot',
        line: 'pivot',
        pivot: hi,
        range: [lo, hi],
        note: `Range [${lo}..${hi}] · choose pivot ${pivot} at index ${hi}.`,
      })

      recorder.push({
        kind: 'range',
        line: 'part',
        pivot: hi,
        range: [lo, hi],
        note: 'Partition: values ≤ pivot will collect on the left of boundary i.',
      })

      for (let j = lo; j < hi; j += 1) {
        stats.compare()
        if (a[j] <= pivot) {
          i += 1
          if (i !== j) {
            const moved = a[j]
            ;[a[i], a[j]] = [a[j], a[i]]
            stats.swap()
            recorder.push({
              kind: 'swap',
              line: 'swap',
              pivot: hi,
              compare: [i, j],
              range: [lo, hi],
              note: `${moved} ≤ pivot ${pivot}. Swap it across the boundary into index ${i}.`,
            })
          } else {
            recorder.push({
              kind: 'compare',
              line: 'small',
              pivot: hi,
              compare: [j, hi],
              range: [lo, hi],
              note: `${a[j]} ≤ pivot ${pivot}. Boundary advances; no swap needed.`,
            })
          }
        } else {
          recorder.push({
            kind: 'compare',
            line: 'cmp',
            pivot: hi,
            compare: [j, hi],
            range: [lo, hi],
            note: `${a[j]} > pivot ${pivot}. Leave it on the right side.`,
          })
        }
      }

      const pivotIndex = i + 1
      if (pivotIndex !== hi) {
        ;[a[pivotIndex], a[hi]] = [a[hi], a[pivotIndex]]
        stats.swap()
        recorder.push({
          kind: 'swap',
          line: 'place',
          pivot: pivotIndex,
          compare: [pivotIndex, hi],
          range: [lo, hi],
          note: `Move pivot ${pivot} to index ${pivotIndex}, between the partitions.`,
        })
      }

      recorder.sorted[pivotIndex] = true
      recorder.push({
        kind: 'range',
        line: 'place',
        pivot: pivotIndex,
        range: [lo, hi],
        note: `Pivot ${pivot} is final at index ${pivotIndex}. Now sort the left and right partitions.`,
      })

      sort(lo, pivotIndex - 1)
      sort(pivotIndex + 1, hi)
    }

    sort(0, n - 1)
    recorder.finalize(
      `Sorted with ${recorder.stats.comparisons.toLocaleString()} comparisons and ${recorder.stats.swaps.toLocaleString()} swaps.`,
    )
    return recorder.frames
  },
}
