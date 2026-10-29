import { describe, expect, it } from 'vitest'
import { SORTING_ALGORITHMS } from './index'

const cases: Array<{ name: string; input: number[] }> = [
  { name: 'empty array', input: [] },
  { name: 'single value', input: [42] },
  { name: 'duplicates', input: [4, 2, 4, 2, 4, 1, 1] },
  { name: 'negative values', input: [7, -3, 0, -9, 12, -1] },
  { name: 'already sorted', input: [1, 2, 3, 4, 5, 6] },
  { name: 'reverse sorted', input: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
  {
    name: 'random values',
    input: [38, 2, 91, 17, 5, 63, 24, 8, 77, 41, 12, 56],
  },
]

function sortedCopy(values: number[]): number[] {
  return values.slice().sort((a, b) => a - b)
}

describe('sorting algorithms', () => {
  for (const algorithm of SORTING_ALGORITHMS) {
    describe(algorithm.info.name, () => {
      for (const testCase of cases) {
        it(`sorts ${testCase.name}`, () => {
          const input = testCase.input.slice()
          const frames = algorithm.run(input)

          expect(frames.length).toBeGreaterThan(0)
          expect(input).toEqual(testCase.input)

          const final = frames[frames.length - 1]
          expect(final.array).toEqual(sortedCopy(testCase.input))
          expect(final.array).toHaveLength(testCase.input.length)
          expect(final.sorted.every(Boolean)).toBe(true)

          const counts = new Map<number, number>()
          const expected = new Map<number, number>()
          for (const value of final.array) counts.set(value, (counts.get(value) ?? 0) + 1)
          for (const value of testCase.input) expected.set(value, (expected.get(value) ?? 0) + 1)
          expect(counts).toEqual(expected)
        })
      }

      it('keeps operation counters monotonic and derived from the run', () => {
        const frames = algorithm.run([9, 1, 7, 3, 5, 2, 8, 4, 6])
        let previous = frames[0].stats

        for (const frame of frames) {
          expect(frame.stats.comparisons).toBeGreaterThanOrEqual(previous.comparisons)
          expect(frame.stats.swaps).toBeGreaterThanOrEqual(previous.swaps)
          expect(frame.stats.writes).toBeGreaterThanOrEqual(previous.writes)
          expect(frame.stats.accesses).toBeGreaterThanOrEqual(previous.accesses)
          previous = frame.stats
        }

        expect(previous.comparisons).toBeGreaterThan(0)
        expect(previous.accesses).toBeGreaterThan(0)
      })

      it('records the first frame without mutating it in later frames', () => {
        const frames = algorithm.run([5, 3, 1, 4, 2])
        const initial = frames[0].array.slice()
        expect(initial).toEqual([5, 3, 1, 4, 2])
        for (let index = 1; index < frames.length; index += 1) {
          expect(frames[index].array).not.toBe(frames[0].array)
        }
        expect(frames[0].array).toEqual([5, 3, 1, 4, 2])
      })
    })
  }

  it('has unique slugs', () => {
    const slugs = SORTING_ALGORITHMS.map((algorithm) => algorithm.info.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
