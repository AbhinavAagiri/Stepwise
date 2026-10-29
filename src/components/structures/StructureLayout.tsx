import type { ReactNode } from 'react'
import { Activity } from 'lucide-react'
import type { StructureOperation } from '../../content/structures'
import { StructureLog, type OpLogEntry } from './StructureLog'

interface StructureLayoutProps {
  controls: ReactNode
  note: string
  meta?: string
  children: ReactNode
  footer?: ReactNode
  entries: OpLogEntry[]
  onClearLog: () => void
}

export function StructureLayout({
  controls,
  note,
  meta,
  children,
  footer,
  entries,
  onClearLog,
}: StructureLayoutProps) {
  return (
    <>
      <aside className="lab-rail" aria-label="Data structure controls">
        {controls}
      </aside>

      <section className="lab-main" aria-label="Data structure visualization">
        <div className="stage">
          <div className="stage-top">
            <div className="stage-op">
              <Activity className="stage-op-icon" aria-hidden="true" />
              <span className="stage-op-text" title={note}>
                {note}
              </span>
            </div>
            {meta && <div className="stage-meta">{meta}</div>}
          </div>
          <div className="stage-plot">
            <div className="ds-plot">{children}</div>
          </div>
          {footer && <div className="stage-stats ds-footer">{footer}</div>}
        </div>
      </section>

      <aside className="lab-inspector" aria-label="Operation log">
        <StructureLog entries={entries} onClear={onClearLog} />
      </aside>
    </>
  )
}

export function ComplexityRail({
  operations,
  note,
}: {
  operations: StructureOperation[]
  note?: string
}) {
  return (
    <div className="rail-section">
      <div className="rail-heading">
        <span>Complexity</span>
      </div>
      <table className="complexity-table">
        <tbody>
          {operations.map((operation) => (
            <tr key={operation.name}>
              <th scope="row">{operation.name}</th>
              <td>{operation.complexity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="rail-note">{note}</p>}
    </div>
  )
}
