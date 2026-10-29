import type { RecursionDemo } from '../../engine/types'
import { factorialDemo } from './factorial'
import { fibonacciDemo } from './fibonacci'
import { hanoiDemo } from './hanoi'
import { recursiveSearchDemo } from './search'

export const RECURSION_DEMOS: RecursionDemo[] = [
  factorialDemo,
  fibonacciDemo,
  hanoiDemo,
  recursiveSearchDemo,
]

export function findRecursionDemo(slug: string | undefined): RecursionDemo | undefined {
  return RECURSION_DEMOS.find((demo) => demo.info.slug === slug)
}
