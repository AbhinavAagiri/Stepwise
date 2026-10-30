import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PolicyPoint {
  term: string
  body: string
}

const DATA_POINTS: PolicyPoint[] = [
  {
    term: 'No server-side logging',
    body: 'We do not collect, track, or store any personal information, email addresses, or algorithmic inputs on a remote server.',
  },
  {
    term: 'Local calculations',
    body: 'All data structure experiments, including custom arrays, linked lists, stacks, queues, binary search trees, hash tables, and recursive execution stacks, are processed and rendered directly within your local browser sandbox.',
  },
  {
    term: 'No tracking',
    body: 'This tool does not use cookies, user tracking accounts, or external behavioral advertising pixels. If lightweight, privacy-respecting analytics are ever used to count daily visitors, no personal identifying information is transmitted.',
  },
]

const TERMS_POINTS: PolicyPoint[] = [
  {
    term: '"As Is" Provision',
    body: 'This educational utility is provided purely for learning and visualization purposes "as is," without any warranties of any kind.',
  },
  {
    term: 'Educational use',
    body: 'You are fully encouraged to use the visualizations and logic paths to assist with your personal studies, web development projects, or teaching.',
  },
  {
    term: 'Accountability',
    body: 'The developer is not responsible for any logic discrepancies, structural visualization errors, or technical bugs that may occur during runtime experimentation.',
  },
]

function PolicyList({ points }: { points: PolicyPoint[] }) {
  return (
    <dl className="privacy-list">
      {points.map((point) => (
        <div className="privacy-row" key={point.term}>
          <dt>{point.term}</dt>
          <dd>{point.body}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PrivacyPage() {
  return (
    <div className="page privacy-page">
      <div className="page-head privacy-head">
        <div>
          <p className="page-kicker">Legal</p>
          <h1 className="page-title">Privacy Policy & Terms of Use</h1>
          <p className="page-sub">
            Stepwise is a free, non-commercial educational platform built as an interactive lab for
            computer science and data structures.
          </p>
        </div>
        <Link to="/" className="btn btn-sm btn-outline privacy-back">
          <ArrowLeft aria-hidden="true" />
          Back home
        </Link>
      </div>

      <section className="privacy-section" aria-labelledby="privacy-data">
        <div className="privacy-section-head">
          <span className="privacy-index" aria-hidden="true">
            01
          </span>
          <h2 id="privacy-data">Data & Privacy</h2>
          <span className="privacy-note">local only</span>
        </div>
        <PolicyList points={DATA_POINTS} />
      </section>

      <section className="privacy-section" aria-labelledby="privacy-terms">
        <div className="privacy-section-head">
          <span className="privacy-index" aria-hidden="true">
            02
          </span>
          <h2 id="privacy-terms">Terms of Use</h2>
          <span className="privacy-note">plain terms</span>
        </div>
        <PolicyList points={TERMS_POINTS} />
      </section>
    </div>
  )
}
