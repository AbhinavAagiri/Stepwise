import type { SearchAlgorithm } from '../../engine/types'
import { linearSearch } from './linear'
import { binarySearch } from './binary'

export const SEARCH_ALGORITHMS: SearchAlgorithm[] = [linearSearch, binarySearch]

export function findSearch(slug: string | undefined): SearchAlgorithm | undefined {
  return SEARCH_ALGORITHMS.find((algorithm) => algorithm.info.slug === slug)
}
