import { findSort } from '../algorithms/sorting'
import { findSearch } from '../algorithms/searching'
import { findPathAlgorithm } from '../algorithms/pathfinding'
import { findStructure } from '../content/structures'
import { findRecursionDemo } from '../algorithms/recursion'

export interface Crumb {
  label: string
  to?: string
}

export function getBreadcrumbs(pathname: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return [{ label: 'home', to: '/' }]

  const [section, slug] = parts

  if (section === 'sorting') {
    return [
      { label: 'sorting', to: '/sorting/bubble-sort' },
      { label: (slug && findSort(slug)?.info.name.toLowerCase()) ?? slug ?? 'lab' },
    ]
  }
  if (section === 'searching') {
    return [
      { label: 'searching', to: '/searching/linear-search' },
      { label: (slug && findSearch(slug)?.info.name.toLowerCase()) ?? slug ?? 'lab' },
    ]
  }
  if (section === 'pathfinding') {
    return [{ label: 'pathfinding', to: '/pathfinding' }]
  }
  if (section === 'structures') {
    return [
      { label: 'data structures', to: '/structures' },
      { label: (slug && findStructure(slug)?.name.toLowerCase()) ?? 'lab' },
    ]
  }
  if (section === 'recursion') {
    return [
      { label: 'recursion', to: '/recursion/factorial' },
      { label: (slug && findRecursionDemo(slug)?.info.name.toLowerCase()) ?? slug ?? 'lab' },
    ]
  }
  if (section === 'learn') {
    return [{ label: 'learn', to: '/learn' }, ...(slug ? [{ label: slug.replace(/-/g, ' ') }] : [])]
  }
  if (section === 'algorithms') {
    return [
      { label: 'algorithms', to: '/sorting/bubble-sort' },
      { label: (slug && findPathAlgorithm(slug)?.info.shortName.toLowerCase()) ?? slug ?? 'lab' },
    ]
  }

  return [{ label: section }]
}
