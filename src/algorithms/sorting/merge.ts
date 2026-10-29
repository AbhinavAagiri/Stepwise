import type { MergeAux, SortAlgorithm } from '../../engine/types'
import { SortRecorder } from './shared'

export const mergeSort: SortAlgorithm = {
  info: {
    slug: 'merge-sort',
    name: 'Merge sort',
    shortName: 'Merge',
    family: 'divide',
    tagline: 'Split until trivial, then merge sorted runs back together.',
    description:
      'Merge sort is divide and conquer. It splits the array in half until each piece holds one value, then repeatedly merges sorted halves by repeatedly taking the smaller front value. Every level does linear work, and there are roughly log₂ n levels.',
    howItWorks: [
      'Split the current range at its midpoint.',
      'Recursively sort the left half, then the right half.',
      'Copy both halves into buffers and compare their front values.',
      'Write the smaller value back, advance that buffer, and repeat until both are empty.',
    ],
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
    },
    stable: true,
    inPlace: false,
    adaptive: false,
    takeaway: 'Predictable n log n performance, at the cost of a temporary buffer.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function mergeSort(a) {' },
      { id: 'n', text: '  const n = a.length;' },
      { id: 'sort', text: '  function sort(lo, hi) {' },
      { id: 'base', text: '    if (lo >= hi) return;' },
      { id: 'mid', text: '    const mid = Math.floor((lo + hi) / 2);' },
      { id: 'rec1', text: '    sort(lo, mid);' },
      { id: 'rec2', text: '    sort(mid + 1, hi);' },
      { id: 'mergecall', text: '    merge(lo, mid, hi);' },
      { id: 'close', text: '  }' },
      { id: 'mergefn', text: '  function merge(lo, mid, hi) {' },
      { id: 'slice', text: '    const left = a.slice(lo, mid + 1);' },
      { id: 'slice2', text: '    const right = a.slice(mid + 1, hi + 1);' },
      { id: 'init', text: '    let i = 0, j = 0, k = lo;' },
      { id: 'while', text: '    while (i < left.length && j < right.length) {' },
      { id: 'cmp', text: '      if (left[i] <= right[j]) {' },
      { id: 'takeleft', text: '        a[k++] = left[i++];' },
      { id: 'takeright', text: '      } else a[k++] = right[j++];' },
      { id: 'leftrest', text: '    while (i < left.length) a[k++] = left[i++];' },
      { id: 'rightrest', text: '    while (j < right.length) a[k++] = right[j++];' },
      { id: 'call', text: '  sort(0, n - 1);' },
      { id: 'ret', text: '  return a;' },
      { id: 'close2', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure mergeSort(a)' },
      { id: 'n', text: '  n ← length(a)' },
      { id: 'sort', text: '  sort(0, n − 1)' },
      { id: 'base', text: '  if lo ≥ hi then return' },
      { id: 'mid', text: '  mid ← floor((lo + hi) / 2)' },
      { id: 'rec1', text: '  sort(lo, mid)' },
      { id: 'rec2', text: '  sort(mid + 1, hi)' },
      { id: 'mergecall', text: '  merge(lo, mid, hi)' },
      { id: 'close', text: 'end procedure' },
      { id: 'mergefn', text: 'procedure merge(lo, mid, hi)' },
      { id: 'slice', text: '  left ← a[lo..mid]' },
      { id: 'slice2', text: '  right ← a[mid + 1..hi]' },
      { id: 'init', text: '  i ← 0; j ← 0; k ← lo' },
      { id: 'while', text: '  while i < length(left) and j < length(right) do' },
      { id: 'cmp', text: '    if left[i] ≤ right[j] then' },
      { id: 'takeleft', text: '      a[k] ← left[i]; i ← i + 1' },
      { id: 'takeright', text: '    else a[k] ← right[j]; j ← j + 1' },
      { id: 'leftrest', text: '  copy remaining left values' },
      { id: 'rightrest', text: '  copy remaining right values' },
      { id: 'call', text: 'end procedure' },
      { id: 'ret', text: '  return a' },
      { id: 'close2', text: 'end merge' },
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
          ? 'Add two or more values to watch divide and conquer.'
          : `${n} values loaded. Merge sort divides first, then combines sorted runs.`,
    })

    if (n <= 1) {
      recorder.finalize('Nothing to divide.')
      return recorder.frames
    }

    const sort = (lo: number, hi: number): void => {
      if (lo >= hi) {
        if (lo === hi) recorder.sorted[lo] = false
        recorder.push({
          kind: 'range',
          line: 'base',
          range: [lo, hi],
          note:
            lo === hi
              ? `Range [${lo}..${hi}] holds one value - trivially sorted.`
              : `Range [${lo}..${hi}] is empty; return immediately.`,
        })
        return
      }

      const mid = Math.floor((lo + hi) / 2)
      recorder.push({
        kind: 'divide',
        line: 'mid',
        range: [lo, hi],
        mid,
        note: `Split [${lo}..${hi}] at ${mid}. Sort each half, then merge them.`,
      })

      sort(lo, mid)
      sort(mid + 1, hi)

      const left = a.slice(lo, mid + 1)
      const right = a.slice(mid + 1, hi + 1)
      let i = 0
      let j = 0
      let k = lo

      const aux = (): MergeAux => ({ left, right, leftPos: i, rightPos: j })

      recorder.push({
        kind: 'merge',
        line: 'mergefn',
        range: [lo, hi],
        mid,
        write: k,
        aux: aux(),
        note: `Merge [${lo}..${mid}] with [${mid + 1}..${hi}]. Compare the front of each buffer.`,
      })

      while (i < left.length && j < right.length) {
        stats.compare()
        const takeLeft = left[i] <= right[j]
        recorder.push({
          kind: 'compare',
          line: 'cmp',
          range: [lo, hi],
          mid,
          write: k,
          aux: aux(),
          note: `Compare left ${left[i]} with right ${right[j]} → take ${takeLeft ? left[i] : right[j]} from the ${takeLeft ? 'left' : 'right'}.`,
        })

        if (takeLeft) {
          const value = left[i]
          a[k] = value
          stats.read()
          stats.write()
          i += 1
          recorder.push({
            kind: 'write',
            line: 'takeleft',
            range: [lo, hi],
            mid,
            write: k,
            aux: aux(),
            note: `Write ${value} into index ${k} and advance the left buffer.`,
          })
        } else {
          const value = right[j]
          a[k] = value
          stats.read()
          stats.write()
          j += 1
          recorder.push({
            kind: 'write',
            line: 'takeright',
            range: [lo, hi],
            mid,
            write: k,
            aux: aux(),
            note: `Write ${value} into index ${k} and advance the right buffer.`,
          })
        }
        k += 1
      }

      while (i < left.length) {
        const value = left[i]
        a[k] = value
        stats.read()
        stats.write()
        i += 1
        recorder.push({
          kind: 'write',
          line: 'leftrest',
          range: [lo, hi],
          mid,
          write: k,
          aux: aux(),
          note: `Right buffer empty. Copy remaining left value ${value} to index ${k}.`,
        })
        k += 1
      }

      while (j < right.length) {
        const value = right[j]
        a[k] = value
        stats.read()
        stats.write()
        j += 1
        recorder.push({
          kind: 'write',
          line: 'rightrest',
          range: [lo, hi],
          mid,
          write: k,
          aux: aux(),
          note: `Left buffer empty. Copy remaining right value ${value} to index ${k}.`,
        })
        k += 1
      }

      recorder.push({
        kind: 'merge',
        line: 'mergecall',
        range: [lo, hi],
        mid,
        note: `Range [${lo}..${hi}] is merged and sorted. Return to the caller.`,
      })
    }

    sort(0, n - 1)
    recorder.finalize(
      `Sorted with ${recorder.stats.comparisons.toLocaleString()} comparisons and ${recorder.stats.writes.toLocaleString()} writes.`,
    )
    return recorder.frames
  },
}
