import { describe, expect, it } from 'vitest'
import { binarySearch } from './binary'
import { linearSearch } from './linear'

describe('linear search', () => {
  it('finds a value and reports its index', () => {
    const frames = linearSearch.run([8, 3, 12, 3, 5], 12)
    const final = frames[frames.length - 1]
    expect(final.kind).toBe('found')
    expect(final.found).toBe(2)
    expect(final.stats.comparisons).toBe(3)
  })

  it('reports the first matching duplicate', () => {
    const frames = linearSearch.run([8, 3, 12, 3, 5], 3)
    expect(frames[frames.length - 1].found).toBe(1)
  })

  it('concludes a missing target correctly', () => {
    const frames = linearSearch.run([8, 3, 12], 7)
    const final = frames[frames.length - 1]
    expect(final.kind).toBe('miss')
    expect(final.found).toBeNull()
    expect(final.stats.comparisons).toBe(3)
  })

  it('handles empty input', () => {
    const frames = linearSearch.run([], 4)
    expect(frames[frames.length - 1].kind).toBe('miss')
    expect(frames[frames.length - 1].found).toBeNull()
  })
})

describe('binary search', () => {
  it('finds a value in a sorted array', () => {
    const frames = binarySearch.run([1, 3, 4, 7, 9, 12, 15], 12)
    const final = frames[frames.length - 1]
    expect(final.kind).toBe('found')
    expect(final.found).toBe(5)
  })

  it('finds a matching index among duplicates', () => {
    const array = [1, 3, 3, 3, 5, 7]
    const frames = binarySearch.run(array, 3)
    const final = frames[frames.length - 1]
    expect(final.found).not.toBeNull()
    expect(array[final.found as number]).toBe(3)
  })

  it('concludes a missing target and narrows to an empty range', () => {
    const frames = binarySearch.run([1, 3, 5, 7, 9], 6)
    const final = frames[frames.length - 1]
    expect(final.kind).toBe('miss')
    expect(final.found).toBeNull()
    if (final.low === null || final.high === null) throw new Error('Expected explicit bounds')
    expect(final.low).toBeGreaterThan(final.high)
    expect(final.eliminated.every(Boolean)).toBe(true)
  })

  it('handles empty and single-value arrays', () => {
    expect(binarySearch.run([], 4).at(-1)?.kind).toBe('miss')
    const single = binarySearch.run([4], 4)
    expect(single.at(-1)?.found).toBe(0)
    expect(binarySearch.run([4], 5).at(-1)?.kind).toBe('miss')
  })

  it('uses a logarithmic number of comparisons on a large sorted array', () => {
    const array = Array.from({ length: 4096 }, (_, index) => index * 2)
    const frames = binarySearch.run(array, 4090)
    const final = frames[frames.length - 1]
    expect(final.found).toBe(2045)
    expect(final.stats.comparisons).toBeLessThanOrEqual(13)
  })
})
