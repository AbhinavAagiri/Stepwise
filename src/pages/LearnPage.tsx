import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Check,
  Clock,
  Layers,
  Route,
  ScanSearch,
} from 'lucide-react'
import { findLearnTopic, LEARN_TOPICS, type LearnTopic } from '../content/learn'
import { useAppState } from '../state/AppState'
import { useRecordVisit } from '../hooks/useRecordVisit'
import { Quiz } from '../components/learn/Quiz'

const GROUP_ORDER: LearnTopic['group'][] = [
  'Sorting',
  'Searching',
  'Pathfinding',
  'Data structures',
  'Recursion',
]

const GROUP_ICONS = {
  Sorting: ArrowDownUp,
  Searching: ScanSearch,
  Pathfinding: Route,
  'Data structures': Boxes,
  Recursion: Layers,
} as const

function groupTopics(group: LearnTopic['group']): LearnTopic[] {
  return LEARN_TOPICS.filter((topic) => topic.group === group)
}

function quizSummary(correct: number, total: number) {
  return `${correct}/${total}`
}

export function LearnPage() {
  const { explored, quizzes, recents } = useAppState()
  const exploredCount = explored.filter((slug) => LEARN_TOPICS.some((topic) => topic.slug === slug)).length
  const progress = (exploredCount / LEARN_TOPICS.length) * 100
  const quizEntries = LEARN_TOPICS.filter((topic) => quizzes[topic.slug])
    .slice()
    .sort((a, b) => (quizzes[b.slug]?.updatedAt ?? 0) - (quizzes[a.slug]?.updatedAt ?? 0))
    .slice(0, 3)
  const nextTopic = LEARN_TOPICS.find((topic) => !explored.includes(topic.slug)) ?? LEARN_TOPICS[0]

  let itemNumber = 0

  return (
    <div className="page learn-page">
      <header className="learn-head">
        <div className="learn-head-copy">
          <p className="page-kicker">Learn · field notes</p>
          <h1 className="page-title learn-title">
            Short notes on why the algorithms behave the way they do.
          </h1>
          <p className="page-sub">
            Each note is a few minutes long, connects to a working lab, and ends with a question or two.
            No walls of textbook text.
          </p>
        </div>
        <div className="learn-progress-panel" aria-label="Learning progress">
          <div className="learn-progress-head">
            <span>Topics explored</span>
            <span className="mono">
              {exploredCount} / {LEARN_TOPICS.length}
            </span>
          </div>
          <div className="learn-progress-rail" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>
            Reading notes and quiz answers are stored in this browser. There is no account and no
            leaderboard.
          </p>
        </div>
      </header>

      <div className="learn-layout">
        <div className="learn-index">
          {GROUP_ORDER.map((group) => {
            const topics = groupTopics(group)
            if (topics.length === 0) return null
            const Icon = GROUP_ICONS[group]
            return (
              <section className="learn-group" key={group}>
                <div className="learn-group-head">
                  <span className="learn-group-title">
                    <Icon aria-hidden="true" />
                    {group}
                  </span>
                  <span className="learn-group-count">
                    {topics.length} {topics.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>
                <ul className="learn-list">
                  {topics.map((topic) => {
                    itemNumber += 1
                    const seen = explored.includes(topic.slug)
                    const attempt = quizzes[topic.slug]
                    return (
                      <li key={topic.slug}>
                        <Link to={`/learn/${topic.slug}`} className="learn-row">
                          <span className="learn-row-number" aria-hidden="true">
                            {String(itemNumber).padStart(2, '0')}
                          </span>
                          <span className="learn-row-body">
                            <span className="learn-row-title">{topic.title}</span>
                            <span className="learn-row-summary">{topic.summary}</span>
                          </span>
                          <span className="learn-row-meta">
                            <span className="learn-row-time">
                              <Clock aria-hidden="true" />
                              {topic.readMinutes} min
                            </span>
                            {seen && (
                              <span className="learn-row-seen">
                                <Check aria-hidden="true" />
                                read
                              </span>
                            )}
                            {attempt && (
                              <span className="learn-row-quiz">
                                quiz {quizSummary(attempt.correct, attempt.total)}
                              </span>
                            )}
                          </span>
                          <ArrowUpRight className="learn-row-arrow" aria-hidden="true" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>

        <aside className="learn-side" aria-label="Reading context">
          <div className="learn-side-block">
            <span className="learn-side-kicker">Next unfinished note</span>
            <Link to={`/learn/${nextTopic.slug}`} className="learn-next-link">
              <span>{nextTopic.title}</span>
              <ArrowRight aria-hidden="true" />
            </Link>
            <p className="learn-side-note">
              {nextTopic.readMinutes} min · {nextTopic.group}
            </p>
          </div>

          <div className="learn-side-block">
            <span className="learn-side-kicker">How to read these</span>
            <p className="learn-side-copy">
              Read the explanation, then open the matching lab and move through it one operation at a
              time. The quiz is there to catch the parts you skimmed.
            </p>
            <Link to="/sorting/bubble-sort" className="text-link" style={{ marginTop: 8 }}>
              Start in the sorting lab
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className="learn-side-block">
            <span className="learn-side-kicker">Recent quiz attempts</span>
            {quizEntries.length > 0 ? (
              <ul className="learn-record-list">
                {quizEntries.map((topic) => {
                  const attempt = quizzes[topic.slug]
                  return (
                    <li key={topic.slug}>
                      <Link to={`/learn/${topic.slug}`} className="learn-record">
                        <span className="learn-record-title">{topic.title}</span>
                        <span className="learn-record-score">
                          {quizSummary(attempt.correct, attempt.total)}
                        </span>
                        <span className="learn-record-bar" aria-hidden="true">
                          <span style={{ width: `${(attempt.correct / attempt.total) * 100}%` }} />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="learn-side-copy">
                No attempts yet. Finish a note and answer its questions to start a local record.
              </p>
            )}
          </div>

          {recents.length > 0 && (
            <div className="learn-side-block">
              <span className="learn-side-kicker">Recently opened</span>
              <ul className="learn-recent-list">
                {recents.slice(0, 3).map((recent) => (
                  <li key={recent.path}>
                    <Link to={recent.path}>
                      <span>{recent.title}</span>
                      <small>{recent.group}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="learn-side-note learn-side-note-foot">
            <BookOpen aria-hidden="true" />
            The labs carry their own code, trace, and complexity panels, so a note never has to stand
            between you and the execution.
          </div>
        </aside>
      </div>
    </div>
  )
}

export function LearnTopicPage() {
  const { slug } = useParams()
  const topic = findLearnTopic(slug)
  const { explored, markExplored, quizzes } = useAppState()

  useEffect(() => {
    if (topic) markExplored(topic.slug)
  }, [markExplored, topic])

  useRecordVisit({
    title: topic?.title ?? 'Learn',
    path: topic ? `/learn/${topic.slug}` : '/learn',
    group: topic?.group ?? 'Learn',
  })

  if (!topic) return <Navigate to="/learn" replace />

  const topicIndex = LEARN_TOPICS.findIndex((item) => item.slug === topic.slug)
  const previous = topicIndex > 0 ? LEARN_TOPICS[topicIndex - 1] : null
  const next = topicIndex >= 0 && topicIndex < LEARN_TOPICS.length - 1 ? LEARN_TOPICS[topicIndex + 1] : null
  const attempt = quizzes[topic.slug]
  const Icon = GROUP_ICONS[topic.group]

  return (
    <div className="page learn-page learn-topic-page">
      <div className="learn-topic-top">
        <Link to="/learn" className="learn-back">
          <ArrowLeft aria-hidden="true" />
          All notes
        </Link>
        <span className="learn-topic-group">
          <Icon aria-hidden="true" />
          {topic.group}
        </span>
      </div>

      <div className="learn-topic-layout">
        <article className="learn-article">
          <header className="learn-article-head">
            <div className="learn-article-meta">
              <span>
                <Clock aria-hidden="true" />
                {topic.readMinutes} min read
              </span>
              <span className={explored.includes(topic.slug) ? 'is-read' : undefined}>
                {explored.includes(topic.slug) ? (
                  <>
                    <Check aria-hidden="true" />
                    read
                  </>
                ) : (
                  'not read yet'
                )}
              </span>
            </div>
            <h1 className="learn-article-title">{topic.title}</h1>
            <p className="learn-article-lead">{topic.summary}</p>
            <div className="learn-article-links">
              <Link to={topic.relatedPath} className="btn btn-sm btn-secondary">
                {topic.relatedLabel}
                <ArrowUpRight aria-hidden="true" />
              </Link>
              {attempt && (
                <span className="learn-attempt">
                  Last quiz: <b>{quizSummary(attempt.correct, attempt.total)}</b>
                </span>
              )}
            </div>
          </header>

          <section className="learn-section" id="what">
            <h2>What it is</h2>
            <p>{topic.what}</p>
          </section>

          <section className="learn-section" id="how">
            <h2>How it works</h2>
            <ol className="learn-steps">
              {topic.how.map((step, index) => (
                <li key={step}>
                  <span className="learn-step-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="learn-section" id="when">
            <h2>When it is useful</h2>
            <p>{topic.when}</p>
          </section>

          <section className="learn-section" id="complexity">
            <h2>Complexity</h2>
            <table className="learn-complexity">
              <tbody>
                {topic.complexity.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="learn-section" id="tradeoffs">
            <h2>Trade-offs</h2>
            <div className="learn-tradeoffs">
              <div>
                <h3>Advantages</h3>
                <ul className="learn-mark-list is-positive">
                  {topic.pros.map((pro) => (
                    <li key={pro}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Costs</h3>
                <ul className="learn-mark-list is-negative">
                  {topic.cons.map((con) => (
                    <li key={con}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="learn-section" id="example">
            <h2>A concrete example</h2>
            <div className="learn-example">
              <span className="learn-example-mark" aria-hidden="true">
                e.g.
              </span>
              <p>{topic.example}</p>
            </div>
          </section>

          <section className="learn-section learn-quiz-section" id="quiz">
            <div className="learn-section-head">
              <h2>Check your understanding</h2>
              <span>
                {topic.quiz.length} {topic.quiz.length === 1 ? 'question' : 'questions'}
              </span>
            </div>
            <Quiz slug={topic.slug} questions={topic.quiz} />
          </section>

          <nav className="learn-pager" aria-label="More notes">
            {previous ? (
              <Link to={`/learn/${previous.slug}`} className="learn-pager-link">
                <span className="learn-pager-label">Previous</span>
                <span className="learn-pager-title">
                  <ArrowLeft aria-hidden="true" />
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/learn/${next.slug}`} className="learn-pager-link is-next">
                <span className="learn-pager-label">Next</span>
                <span className="learn-pager-title">
                  {next.title}
                  <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            )}
          </nav>
        </article>

        <aside className="learn-margin" aria-label="Topic navigation">
          <div className="learn-margin-block">
            <span className="learn-side-kicker">On this page</span>
            <nav className="learn-toc" aria-label="Sections">
              <a href="#what">What it is</a>
              <a href="#how">How it works</a>
              <a href="#when">When it is useful</a>
              <a href="#complexity">Complexity</a>
              <a href="#tradeoffs">Trade-offs</a>
              <a href="#example">A concrete example</a>
              <a href="#quiz">Check your understanding</a>
            </nav>
          </div>

          <div className="learn-margin-block">
            <span className="learn-side-kicker">Practice</span>
            <Link to={topic.relatedPath} className="learn-margin-link">
              {topic.relatedLabel}
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <p className="learn-side-note">
              Every lab records its own trace so you can step through the exact operation described
              here.
            </p>
          </div>

          <div className="learn-margin-block">
            <span className="learn-side-kicker">Local record</span>
            <p className="learn-side-note">
              {attempt
                ? `Last quiz attempt: ${attempt.correct} of ${attempt.total} correct.`
                : 'No quiz attempt yet. Nothing leaves this browser.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
