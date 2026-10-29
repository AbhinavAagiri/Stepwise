import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import type { CodeBlock, CodeLanguage } from '../../engine/types'
import { Segmented } from '../ui/Segmented'
import { Tooltip } from '../ui/Tooltip'

interface CodePanelProps {
  code: CodeBlock
  activeLine: string
  note?: string
}

const TOKEN_RE =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(\d+(?:\.\d+)?)\b|\b(function|const|let|var|if|else|for|while|return|break|continue|new|of|in|true|false|null|undefined|procedure|then|do|end|repeat|until|each|not|and|or|swap|class|this|floor|length)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()/g

function highlightLine(line: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  TOKEN_RE.lastIndex = 0
  let match = TOKEN_RE.exec(line)
  while (match) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index))
    }
    const [text, comment, string, number, keyword, fn] = match
    const className = comment
      ? 'tok-com'
      : string
        ? 'tok-str'
        : number
          ? 'tok-num'
          : keyword
            ? 'tok-key'
            : fn
              ? 'tok-fn'
              : undefined
    nodes.push(
      <span className={className} key={`t-${key}`}>
        {text}
      </span>,
    )
    key += 1
    lastIndex = match.index + text.length
    if (text.length === 0) break
    match = TOKEN_RE.exec(line)
  }
  if (lastIndex < line.length) nodes.push(line.slice(lastIndex))
  return nodes
}

export function CodePanel({ code, activeLine, note }: CodePanelProps) {
  const [language, setLanguage] = useState<CodeLanguage>('javascript')
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lines = code[language]

  const copyText = useMemo(() => lines.map((line) => line.text).join('\n'), [lines])

  useEffect(() => {
    const element = scrollRef.current?.querySelector<HTMLElement>(`[data-line="${activeLine}"]`)
    element?.scrollIntoView({ block: 'nearest' })
  }, [activeLine, language])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-shell">
      <div className="code-toolbar">
        <span className="code-toolbar-label">implementation</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Segmented<CodeLanguage>
            label="Code language"
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'javascript', label: 'JS' },
              { value: 'pseudocode', label: 'Pseudo' },
            ]}
          />
          <Tooltip label={copied ? 'Copied' : 'Copy code'}>
            <button
              type="button"
              className="icon-btn"
              style={{ width: 26, height: 26 }}
              onClick={copy}
              aria-label={copied ? 'Code copied' : 'Copy code'}
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="code-scroll" ref={scrollRef}>
        {lines.map((line, index) => (
          <div
            key={`${line.id}-${index}`}
            className={`code-line${line.id === activeLine ? ' is-active' : ''}`}
            data-line={line.id}
          >
            <span className="code-gutter" aria-hidden="true">
              {index + 1}
            </span>
            <code className="code-text">{highlightLine(line.text)}</code>
          </div>
        ))}
      </div>
      <div className="code-foot">
        <span>{copied ? 'Copied to clipboard' : 'Highlight follows the execution frame'}</span>
        <span aria-hidden="true" className="mono">
          {language === 'javascript' ? 'js' : 'alg'}
        </span>
      </div>
      {note && <span className="sr-only">Current operation: {note}</span>}
    </div>
  )
}
