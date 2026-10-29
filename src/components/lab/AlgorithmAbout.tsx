import type { Complexity } from '../../engine/types'

interface AlgorithmAboutProps {
  description: string
  howItWorks: string[]
  complexity: Complexity
  badges?: string[]
  extra?: Array<{ label: string; value: string }>
  takeaway?: string
}

export function AlgorithmAbout({
  description,
  howItWorks,
  complexity,
  badges = [],
  extra = [],
  takeaway,
}: AlgorithmAboutProps) {
  return (
    <div>
      <section className="info-section">
        <p className="info-p">{description}</p>
        {badges.length > 0 && (
          <div className="fact-row">
            {badges.map((badge) => (
              <span className="chip" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="info-section">
        <div className="info-kicker">How it works</div>
        <ul className="info-list">
          {howItWorks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="info-section">
        <div className="info-kicker">Complexity</div>
        <table className="complexity-table">
          <tbody>
            <tr>
              <th scope="row">Best case</th>
              <td>{complexity.best}</td>
            </tr>
            <tr>
              <th scope="row">Average case</th>
              <td>{complexity.average}</td>
            </tr>
            <tr>
              <th scope="row">Worst case</th>
              <td>{complexity.worst}</td>
            </tr>
            <tr>
              <th scope="row">Extra space</th>
              <td>{complexity.space}</td>
            </tr>
            {extra.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {takeaway && (
        <section className="info-section">
          <div className="info-kicker">Keep in mind</div>
          <p className="info-p">{takeaway}</p>
        </section>
      )}
    </div>
  )
}
