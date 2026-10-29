import { describe, expect, it } from 'vitest'
import { factorialDemo } from './factorial'
import { fibonacciDemo } from './fibonacci'
import { hanoiDemo } from './hanoi'
import { recursiveSearchDemo } from './search'

describe('factorial recursion', () => {
  it('computes the correct result and ends with an empty stack', () => {
    for (const [n, expected] of [
      [0, 1],
      [1, 1],
      [4, 24],
      [6, 720],
      [8, 40320],
    ] as const) {
      const run = factorialDemo.run({ n })
      const final = run.frames.at(-1)
      expect(run.result).toBe(expected)
      expect(final?.result).toBe(expected)
      expect(final?.stack).toEqual([])
    }
  })

  it('grows the call stack to the base case before unwinding', () => {
    const frames = factorialDemo.run({ n: 4 }).frames
    const maxDepth = Math.max(...frames.map((frame) => frame.stack.length))
    expect(maxDepth).toBe(4)
    expect(frames.some((frame) => frame.stack.some((entry) => entry.status === 'base'))).toBe(true)
    expect(frames.some((frame) => frame.stack.some((entry) => entry.returnValue !== undefined))).toBe(true)
  })
})

describe('Fibonacci recursion', () => {
  it('computes the correct values', () => {
    for (const [n, expected, calls] of [
      [0, 0, 1],
      [1, 1, 1],
      [5, 5, 15],
      [8, 21, 67],
    ] as const) {
      const run = fibonacciDemo.run({ n })
      expect(run.result).toBe(expected)
      expect(run.frames.at(-1)?.callCount).toBe(calls)
    }
  })

  it('marks repeated subproblems and builds a parent-linked tree', () => {
    const run = fibonacciDemo.run({ n: 5 })
    const final = run.frames.at(-1)
    expect(final?.repeatedCount).toBe(9)
    expect(final?.fibNodes).toHaveLength(15)
    const ids = new Set(final?.fibNodes?.map((node) => node.id))
    for (const node of final?.fibNodes ?? []) {
      if (node.parent) expect(ids.has(node.parent)).toBe(true)
    }
    expect(final?.fibNodes?.some((node) => node.repeated)).toBe(true)
  })

  it('returns the base case for n < 2 without deeper calls', () => {
    const run = fibonacciDemo.run({ n: 1 })
    expect(run.frames.at(-1)?.callCount).toBe(1)
    expect(run.frames.at(-1)?.repeatedCount).toBe(0)
  })
})

describe('Tower of Hanoi', () => {
  it('solves in exactly 2^n - 1 moves', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const run = hanoiDemo.run({ n })
      const final = run.frames.at(-1)
      expect(run.result).toBe(`${2 ** n - 1} moves`)
      expect(final?.moveCount).toBe(2 ** n - 1)
      expect(final?.hanoi?.rods[2]).toEqual(Array.from({ length: n }, (_, index) => n - index))
      expect(final?.stack).toEqual([])
    }
  })

  it('never places a larger disk on a smaller one', () => {
    const run = hanoiDemo.run({ n: 4 })
    for (const frame of run.frames) {
      if (!frame.hanoi) continue
      for (const rod of frame.hanoi.rods) {
        for (let index = 1; index < rod.length; index += 1) {
          expect(rod[index]).toBeLessThan(rod[index - 1])
        }
      }
    }
  })
})

describe('recursive binary search', () => {
  it('finds a target and unwinds the result', () => {
    const run = recursiveSearchDemo.run({
      n: 0,
      values: [1, 3, 5, 7, 9, 11],
      target: 9,
    })
    expect(run.result).toBe(4)
    const final = run.frames.at(-1)
    expect(final?.result).toBe(4)
    expect(final?.stack).toEqual([])
    expect(final?.array).toEqual([1, 3, 5, 7, 9, 11])
  })

  it('sorts input and locates a value that moved', () => {
    const run = recursiveSearchDemo.run({
      n: 0,
      values: [9, 1, 7, 3],
      target: 7,
    })
    expect(run.values).toEqual([1, 3, 7, 9])
    expect(run.result).toBe(2)
  })

  it('returns -1 for an absent target', () => {
    const run = recursiveSearchDemo.run({
      n: 0,
      values: [2, 4, 6, 8],
      target: 5,
    })
    expect(run.result).toBe(-1)
    expect(run.frames.at(-1)?.result).toBe(-1)
  })

  it('handles an empty array', () => {
    const run = recursiveSearchDemo.run({ n: 0, values: [], target: 3 })
    expect(run.result).toBe(-1)
    expect(run.frames.at(-1)?.stack).toEqual([])
  })
})
