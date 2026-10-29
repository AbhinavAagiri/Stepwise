import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import type { QuizQuestion } from '../../content/learn'
import { useAppState } from '../../state/AppState'
import { Button } from '../ui/Button'

interface QuizProps {
  slug: string
  questions: QuizQuestion[]
}

export function Quiz({ slug, questions }: QuizProps) {
  const { quizzes, saveQuiz } = useAppState()
  const savedAnswers = quizzes[slug]?.answers ?? {}
  const [answers, setAnswers] = useState<Record<string, number>>(savedAnswers)
  const [current, setCurrent] = useState(0)
  const [finished, setFinished] = useState(() =>
    questions.every((question) => savedAnswers[question.id] !== undefined),
  )

  if (questions.length === 0) return null

  const question = questions[current]
  const selected = answers[question.id]
  const answered = selected !== undefined
  const correctCount = questions.filter((item) => answers[item.id] === item.answer).length
  const allAnswered = questions.every((item) => answers[item.id] !== undefined)
  const isLast = current === questions.length - 1

  const choose = (optionIndex: number) => {
    if (answers[question.id] !== undefined) return
    const next = { ...answers, [question.id]: optionIndex }
    setAnswers(next)
    saveQuiz(slug, {
      correct: questions.filter((item) => next[item.id] === item.answer).length,
      total: questions.length,
      answers: next,
    })
  }

  const retake = () => {
    setAnswers({})
    setCurrent(0)
    setFinished(false)
    saveQuiz(slug, { correct: 0, total: questions.length, answers: {} })
  }

  if (finished) {
    return (
      <div className="quiz-result">
        <div className="quiz-result-head">
          <span className="quiz-result-kicker">quiz complete</span>
          <span className="quiz-result-score">
            {correctCount} / {questions.length}
          </span>
        </div>
        <p className="quiz-result-copy">
          {correctCount === questions.length
            ? 'Every answer was right. The explanation above each result is the part worth keeping.'
            : correctCount === 0
              ? 'None of the answers were right this time. Read the explanations below, then retake it.'
              : 'Part of the material is solid, part needs another look. The explanations are below.'}
        </p>
        <ol className="quiz-review">
          {questions.map((item) => {
            const given = answers[item.id]
            const isRight = given === item.answer
            return (
              <li key={item.id} className={isRight ? 'is-right' : 'is-wrong'}>
                <span className="quiz-review-prompt">{item.prompt}</span>
                <span className="quiz-review-answer">
                  {isRight ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
                  your answer: {given !== undefined ? item.options[given] : 'not answered'}
                  {!isRight && <> · correct: {item.options[item.answer]}</>}
                </span>
              </li>
            )
          })}
        </ol>
        <div className="quiz-actions">
          <Button size="sm" variant="outline" onClick={retake}>
            <RotateCcw aria-hidden="true" />
            Retake quiz
          </Button>
          <span className="quiz-save-note">Responses are stored in this browser only.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-shell">
      <div className="quiz-head">
        <span className="quiz-progress">
          question <b>{current + 1}</b> / {questions.length}
        </span>
        <span className="quiz-save-note">saved locally</span>
      </div>

      <fieldset className="quiz-question">
        <legend className="quiz-prompt">{question.prompt}</legend>
        <div className="quiz-options">
          {question.options.map((option, index) => {
            const chosen = selected === index
            const correct = question.answer === index
            const showResult = answered
            const className = [
              'quiz-option',
              chosen ? 'is-chosen' : '',
              showResult && correct ? 'is-correct' : '',
              showResult && chosen && !correct ? 'is-wrong' : '',
              showResult && !chosen && !correct ? 'is-dimmed' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                type="button"
                key={option}
                className={className}
                onClick={() => choose(index)}
                aria-pressed={chosen}
                aria-disabled={answered}
              >
                <span className="quiz-option-mark" aria-hidden="true">
                  {showResult && correct ? (
                    <Check />
                  ) : showResult && chosen && !correct ? (
                    <X />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span>{option}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {answered && (
        <div className={`quiz-explain${selected === question.answer ? ' is-correct' : ' is-wrong'}`}>
          <span className="quiz-explain-label">
            {selected === question.answer ? 'correct' : 'not quite'}
          </span>
          <p>{question.explanation}</p>
        </div>
      )}

      <div className="quiz-actions">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCurrent((value) => Math.max(0, value - 1))}
          disabled={current === 0}
        >
          <ArrowLeft aria-hidden="true" />
          Back
        </Button>
        <div className="quiz-actions-right">
          {!allAnswered && !isLast && (
            <span className="quiz-save-note">
              {Object.keys(answers).length} of {questions.length} answered
            </span>
          )}
          {isLast ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setFinished(true)}
              disabled={!allAnswered}
            >
              See result
              <Check aria-hidden="true" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrent((value) => Math.min(questions.length - 1, value + 1))}
              disabled={!answered}
            >
              Next question
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
