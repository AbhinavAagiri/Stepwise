import type { SortAlgorithm } from '../../engine/types'
import { bubbleSort } from './bubble'
import { selectionSort } from './selection'
import { insertionSort } from './insertion'
import { mergeSort } from './merge'
import { quickSort } from './quick'
import { heapSort } from './heap'

export const SORTING_ALGORITHMS: SortAlgorithm[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
]

export function findSort(slug: string | undefined): SortAlgorithm | undefined {
  return SORTING_ALGORITHMS.find((algorithm) => algorithm.info.slug === slug)
}
