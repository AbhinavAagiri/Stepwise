import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { findStructure, STRUCTURES, type StructureInfo } from '../content/structures'
import { useRecordVisit } from '../hooks/useRecordVisit'
import { LabHeader } from '../components/lab/LabHeader'
import { Tabs } from '../components/ui/Tabs'
import { ArrayLab } from '../components/structures/ArrayLab'
import { LinkedListLab } from '../components/structures/LinkedListLab'
import { LinearLab } from '../components/structures/LinearLab'
import { BstLab } from '../components/structures/BstLab'
import { HashLab } from '../components/structures/HashLab'

const NOTES: Record<string, string> = {
  array: '/learn/sorting-basics',
  'linked-list': '/learn/linked-lists',
  stack: '/learn/stacks-and-queues',
  queue: '/learn/stacks-and-queues',
  bst: '/learn/binary-search-trees',
  'hash-table': '/learn/hash-tables',
}

function StructureLabPage({ structure }: { structure: StructureInfo }) {
  const navigate = useNavigate()

  useRecordVisit({
    title: structure.name,
    path: `/structures/${structure.slug}`,
    group: 'Data structures',
  })

  return (
    <div className="lab">
      <LabHeader
        icon={structure.icon}
        title={structure.name}
        subtitle={`Data structure lab · ${structure.tagline}`}
        actions={
          <>
            <Link to={NOTES[structure.slug] ?? '/learn'} className="btn btn-sm btn-outline hide-sm">
              <BookOpen aria-hidden="true" />
              Notes
            </Link>
            <span className="chip">{structure.operations.length} operations</span>
          </>
        }
      />

      <div className="structure-tabs">
        <Tabs
          label="Choose a data structure"
          value={structure.slug}
          onChange={(slug) => navigate(`/structures/${slug}`)}
          items={STRUCTURES.map((item) => ({ id: item.slug, label: item.shortName, icon: item.icon }))}
        />
      </div>

      <div className="lab-body">
        {structure.slug === 'array' && <ArrayLab />}
        {structure.slug === 'linked-list' && <LinkedListLab />}
        {structure.slug === 'stack' && <LinearLab mode="stack" />}
        {structure.slug === 'queue' && <LinearLab mode="queue" />}
        {structure.slug === 'bst' && <BstLab />}
        {structure.slug === 'hash-table' && <HashLab />}
      </div>
    </div>
  )
}

export function StructuresPage() {
  const { slug } = useParams()
  const structure = findStructure(slug)
  if (!structure) return <Navigate to="/structures/array" replace />
  return <StructureLabPage structure={structure} key={structure.slug} />
}
