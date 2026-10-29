import type { SortAlgorithm } from '../../engine/types'
import { SortRecorder } from './shared'

export const heapSort: SortAlgorithm = {
  info: {
    slug: 'heap-sort',
    name: 'Heap sort',
    shortName: 'Heap',
    family: 'heap',
    tagline: 'Build a max-heap, then repeatedly pull the largest value to the end.',
    description:
      'Heap sort treats the array as a complete binary tree. It first rearranges values into a max-heap so every parent is at least as large as its children. It then swaps the root (the maximum) with the last heap value, shrinks the heap, and sifts the new root down until the heap property returns.',
    howItWorks: [
      'Heapify from the last parent back to the root.',
      'Sift down: compare a parent with its children and swap with the larger child when needed.',
      'The root is now the maximum. Swap it past the end of the heap.',
      'Shrink the heap and sift the new root down. Repeat until one value remains.',
    ],
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(1)',
    },
    stable: false,
    inPlace: true,
    adaptive: false,
    takeaway: 'Strong worst-case bounds and constant extra space, but poor cache locality.',
  },
  code: {
    javascript: [
      { id: 'fn', text: 'function heapSort(a) {' },
      { id: 'n', text: '  const n = a.length;' },
      { id: 'sift', text: '  function siftDown(root, size) {' },
      { id: 'largest', text: '    let largest = root;' },
      { id: 'left', text: '    const l = 2 * root + 1;' },
      { id: 'right', text: '    const r = 2 * root + 2;' },
      { id: 'leftcmp', text: '    if (l < size && a[l] > a[largest]) largest = l;' },
      { id: 'rightcmp', text: '    if (r < size && a[r] > a[largest]) largest = r;' },
      { id: 'swap', text: '    if (largest !== root) {' },
      { id: 'recurse', text: '      [a[root], a[largest]] = [a[largest], a[root]];' },
      { id: 'siftcall', text: '      siftDown(largest, size);' },
      { id: 'end', text: '    }' },
      { id: 'close', text: '  }' },
      { id: 'build', text: '  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n);' },
      { id: 'extract', text: '  for (let end = n - 1; end > 0; end--) {' },
      { id: 'settle', text: '    [a[0], a[end]] = [a[end], a[0]];' },
      { id: 'shrink', text: '    siftDown(0, end);' },
      { id: 'ret', text: '  return a;' },
      { id: 'close2', text: '}' },
    ],
    pseudocode: [
      { id: 'fn', text: 'procedure heapSort(a)' },
      { id: 'n', text: '  n ← length(a)' },
      { id: 'sift', text: 'procedure siftDown(root, size)' },
      { id: 'largest', text: '  largest ← root' },
      { id: 'left', text: '  l ← 2 × root + 1' },
      { id: 'right', text: '  r ← 2 × root + 2' },
      { id: 'leftcmp', text: '  if l < size and a[l] > a[largest] then largest ← l' },
      { id: 'rightcmp', text: '  if r < size and a[r] > a[largest] then largest ← r' },
      { id: 'swap', text: '  if largest ≠ root then' },
      { id: 'recurse', text: '    swap a[root], a[largest]' },
      { id: 'siftcall', text: '    siftDown(largest, size)' },
      { id: 'end', text: '  end if' },
      { id: 'close', text: 'end procedure' },
      { id: 'build', text: 'for i ← floor(n / 2) − 1 down to 0 do siftDown(i, n)' },
      { id: 'extract', text: 'for end ← n − 1 down to 1 do' },
      { id: 'settle', text: '  swap a[0], a[end]' },
      { id: 'shrink', text: '  siftDown(0, end)' },
      { id: 'ret', text: 'return a' },
      { id: 'close2', text: 'end procedure' },
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
          ? 'Add two or more values to build a heap.'
          : `${n} values loaded. The array is shown both as values and as a binary heap.`,
    })

    if (n <= 1) {
      recorder.finalize('Nothing to heapify.')
      return recorder.frames
    }

    const siftDown = (root: number, size: number): void => {
      recorder.push({
        kind: 'heapify',
        line: 'sift',
        range: [0, size - 1],
        heapSize: size,
        note: `Sift down index ${root} inside a heap of size ${size}.`,
      })

      let largest = root
      const left = 2 * root + 1
      const right = 2 * root + 2

      if (left < size) {
        stats.compare()
        if (a[left] > a[largest]) {
          recorder.push({
            kind: 'compare',
            line: 'leftcmp',
            compare: [root, left],
            range: [0, size - 1],
            heapSize: size,
            note: `Left child ${a[left]} is greater than ${a[largest]}. Candidate moves to index ${left}.`,
          })
          largest = left
        } else {
          recorder.push({
            kind: 'compare',
            line: 'leftcmp',
            compare: [root, left],
            range: [0, size - 1],
            heapSize: size,
            note: `Compare parent ${a[root]} with left child ${a[left]} → parent is larger.`,
          })
        }
      }

      if (right < size) {
        stats.compare()
        if (a[right] > a[largest]) {
          recorder.push({
            kind: 'compare',
            line: 'rightcmp',
            compare: [largest, right],
            range: [0, size - 1],
            heapSize: size,
            note: `Right child ${a[right]} is the largest so far. Candidate moves to index ${right}.`,
          })
          largest = right
        } else {
          recorder.push({
            kind: 'compare',
            line: 'rightcmp',
            compare: [largest, right],
            range: [0, size - 1],
            heapSize: size,
            note: `Compare current candidate ${a[largest]} with right child ${a[right]} → keep the candidate.`,
          })
        }
      }

      if (largest !== root) {
        const rootValue = a[root]
        ;[a[root], a[largest]] = [a[largest], a[root]]
        stats.swap()
        recorder.push({
          kind: 'swap',
          line: 'recurse',
          compare: [root, largest],
          range: [0, size - 1],
          heapSize: size,
          note: `Swap ${rootValue} with ${a[root]} to restore the parent-child order. Continue sifting at index ${largest}.`,
        })
        siftDown(largest, size)
      } else {
        recorder.push({
          kind: 'heapify',
          line: 'end',
          range: [0, size - 1],
          heapSize: size,
          note: `Index ${root} is at least as large as its children. This subtree is a valid heap.`,
        })
      }
    }

    recorder.push({
      kind: 'heapify',
      line: 'build',
      heapSize: n,
      range: [0, n - 1],
      note: 'Build phase: heapify every internal node from the bottom up.',
    })

    for (let i = Math.floor(n / 2) - 1; i >= 0; i -= 1) {
      siftDown(i, n)
    }

    recorder.push({
      kind: 'heapify',
      line: 'build',
      heapSize: n,
      range: [0, n - 1],
      note: 'Max-heap built. The largest value is now at index 0.',
    })

    for (let end = n - 1; end > 0; end -= 1) {
      ;[a[0], a[end]] = [a[end], a[0]]
      stats.swap()
      recorder.sorted[end] = true
      recorder.push({
        kind: 'swap',
        line: 'settle',
        compare: [0, end],
        range: [0, end - 1],
        heapSize: end,
        note: `Swap the heap maximum ${a[end]} to index ${end}. It is now final; shrink the heap to ${end} values.`,
      })
      siftDown(0, end)
    }

    recorder.sorted[0] = true
    recorder.finalize(
      `Sorted with ${recorder.stats.comparisons.toLocaleString()} comparisons and ${recorder.stats.swaps.toLocaleString()} swaps.`,
    )
    return recorder.frames
  },
}
