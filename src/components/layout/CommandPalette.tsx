import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search } from 'lucide-react'
import { Dialog } from '../ui/Dialog'
import { SORTING_ALGORITHMS } from '../../algorithms/sorting'
import { SEARCH_ALGORITHMS } from '../../algorithms/searching'
import { PATH_ALGORITHMS } from '../../algorithms/pathfinding'
import { STRUCTURES } from '../../content/structures'
import { RECURSION_DEMOS } from '../../algorithms/recursion'
import { LEARN_TOPICS } from '../../content/learn'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface CommandEntry {
  label: string
  group: string
  to: string
  hint?: string
}

const PAGES: CommandEntry[] = [
  { label: 'Home', group: 'Pages', to: '/', hint: 'overview' },
  { label: 'Sorting lab', group: 'Pages', to: '/sorting/bubble-sort', hint: '6 algorithms' },
  { label: 'Searching lab', group: 'Pages', to: '/searching/linear-search', hint: '2 algorithms' },
  { label: 'Pathfinding lab', group: 'Pages', to: '/pathfinding', hint: 'grid' },
  { label: 'Data structures', group: 'Pages', to: '/structures/array', hint: '6 structures' },
  { label: 'Recursion', group: 'Pages', to: '/recursion/factorial', hint: '4 demos' },
  { label: 'Learn', group: 'Pages', to: '/learn', hint: 'topics + quizzes' },
  { label: 'Privacy & terms', group: 'Pages', to: '/privacy', hint: 'policy' },
]

const ALGORITHM_ENTRIES: CommandEntry[] = [
  ...SORTING_ALGORITHMS.map((algorithm) => ({
    label: algorithm.info.name,
    group: 'Algorithms',
    to: `/sorting/${algorithm.info.slug}`,
    hint: algorithm.info.complexity.average,
  })),
  ...SEARCH_ALGORITHMS.map((algorithm) => ({
    label: algorithm.info.name,
    group: 'Algorithms',
    to: `/searching/${algorithm.info.slug}`,
    hint: algorithm.info.complexity.average,
  })),
  ...PATH_ALGORITHMS.map((algorithm) => ({
    label: algorithm.info.name,
    group: 'Algorithms',
    to: `/pathfinding?algo=${algorithm.info.slug}`,
    hint: algorithm.info.weighted ? 'weighted' : 'unweighted',
  })),
]

const STRUCTURE_ENTRIES: CommandEntry[] = STRUCTURES.map((structure) => ({
  label: structure.name,
  group: 'Data structures',
  to: `/structures/${structure.slug}`,
  hint: structure.shortName,
}))

const RECURSION_ENTRIES: CommandEntry[] = RECURSION_DEMOS.map((demo) => ({
  label: demo.info.name,
  group: 'Recursion',
  to: `/recursion/${demo.info.slug}`,
  hint: demo.info.complexity.average,
}))

const LEARN_ENTRIES: CommandEntry[] = LEARN_TOPICS.map((topic) => ({
  label: topic.title,
  group: 'Learn',
  to: `/learn/${topic.slug}`,
  hint: topic.group,
}))

const ALL_ENTRIES = [...PAGES, ...ALGORITHM_ENTRIES, ...STRUCTURE_ENTRIES, ...RECURSION_ENTRIES, ...LEARN_ENTRIES]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return ALL_ENTRIES
    return ALL_ENTRIES.filter((entry) =>
      `${entry.label} ${entry.group} ${entry.hint ?? ''}`.toLowerCase().includes(needle),
    )
  }, [query])

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(0, results.length - 1)))
  }, [results.length])

  useEffect(() => {
    const activeElement = listRef.current?.querySelector<HTMLElement>('.command-item[data-active="true"]')
    activeElement?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (entry: CommandEntry | undefined) => {
    if (!entry) return
    navigate(entry.to)
    onClose()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (results.length === 0 ? 0 : (current + 1) % results.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (results.length === 0 ? 0 : (current - 1 + results.length) % results.length))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(Math.max(0, results.length - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(results[active])
    }
  }

  let lastGroup = ''

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Jump to"
      bodyClassName="dialog-body-tight"
      className="command-dialog"
    >
      <div className="command-input-wrap">
        <Search aria-hidden="true" className="command-search-icon" />
        <input
          className="command-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search pages, algorithms, topics…"
          aria-label="Search pages, algorithms, and topics"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-autocomplete="list"
          aria-activedescendant={results[active] ? `command-item-${active}` : undefined}
          data-autofocus
        />
        <kbd className="kbd">esc</kbd>
      </div>

      <div className="command-list" id="command-results" role="listbox" aria-label="Results" ref={listRef}>
        {results.length === 0 && (
          <div className="command-empty">
            <p>No matches for “{query.trim()}”.</p>
            <span>Try “merge”, “stack”, or “dijkstra”.</span>
          </div>
        )}
        {results.map((entry, index) => {
          const showGroup = entry.group !== lastGroup
          lastGroup = entry.group
          return (
            <div key={`${entry.group}-${entry.to}-${entry.label}`}>
              {showGroup && <div className="command-group">{entry.group}</div>}
              <button
                type="button"
                id={`command-item-${index}`}
                role="option"
                aria-selected={index === active}
                data-active={index === active}
                className="command-item"
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(entry)}
              >
                <span className="command-item-label">{entry.label}</span>
                {entry.hint && <span className="command-item-hint">{entry.hint}</span>}
                {index === active && <CornerDownLeft className="command-enter" aria-hidden="true" />}
              </button>
            </div>
          )
        })}
      </div>

      <div className="command-footer">
        <span>
          <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navigate
        </span>
        <span>
          <kbd className="kbd">↵</kbd> open
        </span>
        <span className="command-footer-count">{results.length} results</span>
      </div>
    </Dialog>
  )
}
