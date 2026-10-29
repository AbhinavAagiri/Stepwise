import { useEffect, useState } from 'react'
import { AlertCircle, Dices, Eraser, Shuffle } from 'lucide-react'
import { parseNumberList, randomArray, shuffleArray } from '../../lib/random'
import { Button } from '../ui/Button'
import { Tooltip } from '../ui/Tooltip'

interface ArrayControlsProps {
  values: number[]
  onChange: (values: number[]) => void
  minSize?: number
  maxSize?: number
  sizeStep?: number
  hint?: string
  label?: string
  allowShuffle?: boolean
  generateSorted?: boolean
}

export function ArrayControls({
  values,
  onChange,
  minSize = 8,
  maxSize = 64,
  sizeStep = 1,
  hint,
  label = 'Array',
  allowShuffle = true,
  generateSorted = false,
}: ArrayControlsProps) {
  const [size, setSize] = useState(values.length)
  const [draft, setDraft] = useState(values.join(', '))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(values.join(', '))
    setSize(values.length)
  }, [values])

  const generate = (length: number) => {
    const safe = Math.max(minSize, Math.min(maxSize, length))
    const next = randomArray(safe, 3, 98)
    onChange(generateSorted ? next.sort((a, b) => a - b) : next)
    setError(null)
  }

  const applyCustom = () => {
    const result = parseNumberList(draft, maxSize)
    if (!result.values) {
      setError(result.error ?? 'Invalid values.')
      return
    }
    setError(null)
    onChange(result.values)
  }

  return (
    <div className="rail-section">
      <div className="rail-heading">
        <span>{label}</span>
        <span className="rail-heading-note">{values.length} values</span>
      </div>

      <div className="rail-actions">
        <Button size="sm" variant="secondary" onClick={() => generate(size)}>
          <Dices aria-hidden="true" />
          Random
        </Button>
        {allowShuffle && (
          <Button size="sm" variant="ghost" onClick={() => onChange(shuffleArray(values))} disabled={values.length < 2}>
            <Shuffle aria-hidden="true" />
            Shuffle
          </Button>
        )}
        <Tooltip label="Clear the array">
          <Button
            size="sm"
            variant="ghost"
            iconOnly
            onClick={() => onChange([])}
            disabled={values.length === 0}
            aria-label="Clear the array"
          >
            <Eraser aria-hidden="true" />
          </Button>
        </Tooltip>
      </div>

      <div className="rail-field">
        <div className="control-row">
          <label htmlFor="array-size" className="label" style={{ margin: 0 }}>
            Size
          </label>
          <span className="control-value">{size}</span>
        </div>
        <input
          id="array-size"
          type="range"
          className="range"
          min={minSize}
          max={maxSize}
          step={sizeStep}
          value={size}
          onChange={(event) => {
            const nextSize = Number(event.target.value)
            setSize(nextSize)
            generate(nextSize)
          }}
          aria-label="Array size"
        />
        {size > 48 && (
          <p className="hint">
            Long arrays create long traces. Use 4× or jump to the end to scan the result.
          </p>
        )}
      </div>

      <div className="rail-field">
        <label className="label" htmlFor="array-custom">
          Custom values
          <span className="label-note">whole numbers</span>
        </label>
        <textarea
          id="array-custom"
          className="input"
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault()
              applyCustom()
            }
          }}
          aria-describedby="array-custom-hint"
          aria-invalid={error ? true : undefined}
          placeholder="8, 3, 12, 5, 9"
        />
        <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
          <Button size="sm" variant="outline" onClick={applyCustom} style={{ flex: 1 }}>
            Apply values
          </Button>
        </div>
        {error ? (
          <p className="error-text" role="alert">
            <AlertCircle aria-hidden="true" />
            {error}
          </p>
        ) : (
          <p className="hint" id="array-custom-hint">
            Comma or space separated, −999 to 999. {hint ?? 'Duplicates and negatives are allowed.'}
          </p>
        )}
      </div>
    </div>
  )
}
