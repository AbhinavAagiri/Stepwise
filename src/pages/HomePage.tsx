import { Link } from 'react-router-dom'
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Layers,
  Route,
  ScanSearch,
} from 'lucide-react'
import { LivePreview } from '../components/home/LivePreview'
import { TopicSpark, type SparkKind } from '../components/home/TopicSpark'
import { useAppState } from '../state/AppState'
import { LEARN_TOPICS } from '../content/learn'

const CATEGORIES: Array<{
  title: string
  description: string
  to: string
  icon: typeof ArrowDownUp
  spark: SparkKind
  meta: string
}> = [
  {
    title: 'Sorting',
    description: 'Watch algorithms organize data through comparisons, swaps, and merging.',
    to: '/sorting/insertion-sort',
    icon: ArrowDownUp,
    spark: 'sorting',
    meta: 'six algorithms',
  },
  {
    title: 'Searching',
    description: 'Explore how algorithms locate values within collections.',
    to: '/searching/binary-search',
    icon: ScanSearch,
    spark: 'searching',
    meta: 'linear + binary',
  },
  {
    title: 'Pathfinding',
    description: 'Discover how different algorithms find their way through a grid.',
    to: '/pathfinding',
    icon: Route,
    spark: 'pathfinding',
    meta: 'four searches',
  },
  {
    title: 'Data structures',
    description: 'See how data is organized, accessed, and modified.',
    to: '/structures/array',
    icon: Boxes,
    spark: 'structures',
    meta: 'six structures',
  },
  {
    title: 'Recursion',
    description: 'Visualize function calls, call stacks, and recursive problem-solving.',
    to: '/recursion/factorial',
    icon: Layers,
    spark: 'recursion',
    meta: 'four demos',
  },
]

export function HomePage() {
  const { recents, explored } = useAppState()
  const exploredCount = explored.filter((slug) => LEARN_TOPICS.some((topic) => topic.slug === slug)).length
  const progress = (exploredCount / LEARN_TOPICS.length) * 100

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-copy">
          <h1 className="hero-title">Understand code, one step at a time.</h1>
          <p className="hero-lead">
            Explore algorithms, visualize data structures, and see what happens beneath the code.
          </p>
          <div className="hero-actions">
            <Link to="/sorting/bubble-sort" className="btn btn-primary btn-lg">
              Start Exploring
              <ArrowRight aria-hidden="true" />
            </Link>
            <a href="#explore" className="btn btn-secondary btn-lg">
              Browse Algorithms
            </a>
          </div>
          <p className="hero-foot">
            Every frame is computed in your browser. No account, no upload, no API keys.
          </p>
        </div>
        <LivePreview />
      </section>

      <div className="home-body" id="explore">
        <section className="explore-section">
          <div className="section-head">
            <h2 className="section-title">Explore the lab</h2>
            <span className="section-note">Five entry points, each fully interactive</span>
          </div>
          <div className="topic-index">
            {CATEGORIES.map((category) => {
              const Icon = category.icon
              return (
                <Link to={category.to} className="topic-row" key={category.title}>
                  <span className="topic-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="topic-copy">
                    <span className="topic-title-line">
                      <span className="topic-title">{category.title}</span>
                      <span className="topic-meta">{category.meta}</span>
                    </span>
                    <span className="topic-description">{category.description}</span>
                  </span>
                  <span className="topic-spark-wrap">
                    <TopicSpark kind={category.spark} />
                  </span>
                  <ArrowUpRight className="topic-arrow" aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        </section>

        <aside className="home-aside">
          <div className="continue-panel">
            <div className="continue-head">
              <h2 className="continue-title">Continue learning</h2>
              <Link to="/learn" className="text-link">
                All topics
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>

            {recents.length > 0 ? (
              <ul className="recent-list">
                {recents.slice(0, 3).map((recent) => (
                  <li key={recent.path}>
                    <Link to={recent.path} className="recent-item">
                      <span className="recent-group">{recent.group}</span>
                      <span className="recent-title">{recent.title}</span>
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="recent-empty">
                <p>New here? Three good places to begin.</p>
                <ul>
                  <li>
                    <Link to="/sorting/bubble-sort">Bubble sort, slowly</Link>
                  </li>
                  <li>
                    <Link to="/pathfinding">BFS on a grid</Link>
                  </li>
                  <li>
                    <Link to="/structures/hash-table">A hash table with collisions</Link>
                  </li>
                </ul>
              </div>
            )}

            <div className="learning-progress">
              <div className="learning-progress-head">
                <span>Topics explored</span>
                <span className="mono">
                  {exploredCount}/{LEARN_TOPICS.length}
                </span>
              </div>
              <div className="progress-rail" aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p className="hint">Progress is stored in this browser only.</p>
            </div>
          </div>

          <div className="home-note">
            <span className="home-note-mark" aria-hidden="true">
              ↳
            </span>
            <p>
              Start with any algorithm. Every lab lets you step backward through the exact trace, not a
              replayed animation.
            </p>
          </div>
        </aside>
      </div>

      <section className="method-strip">
        <div className="method-head">
          <h2 className="section-title">A lab, not a lecture.</h2>
          <p>
            The interface stays out of the way of the algorithm. What you see is what the code actually did.
          </p>
        </div>
        <div className="method-grid">
          <div className="method-item">
            <h3>Real execution</h3>
            <p>Counters come from the implementation itself - comparisons, writes, and array reads included.</p>
          </div>
          <div className="method-item">
            <h3>Line-level sync</h3>
            <p>The highlighted line, the operation note, and the visual state all come from one recorded frame.</p>
          </div>
          <div className="method-item">
            <h3>Local by design</h3>
            <p>Preferences and progress use localStorage. No backend, no tracking, nothing to sign into.</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div>
          <span className="footer-mark">stepwise</span>
          <p>An interactive lab for algorithms and data structures.</p>
        </div>
        <div className="footer-links">
          <Link to="/sorting/merge-sort">Sorting</Link>
          <Link to="/pathfinding">Pathfinding</Link>
          <Link to="/learn">Learn</Link>
          <Link to="/privacy" className="btn btn-sm btn-outline footer-privacy">
            Privacy policy
          </Link>
        </div>
      </footer>
    </div>
  )
}
