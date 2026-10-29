export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomArray(length: number, min = 5, max = 99): number[] {
  return Array.from({ length }, () => randomInt(min, max))
}

export function shuffleArray<T>(input: readonly T[]): T[] {
  const output = input.slice()
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[output[i], output[j]] = [output[j], output[i]]
  }
  return output
}

export interface ParseResult {
  values?: number[]
  error?: string
}

/**
 * Accepts comma, space, or newline separated integers. Keeps the parser strict
 * so a typo never becomes a silent zero in a visualization.
 */
export function parseNumberList(raw: string, max = 64): ParseResult {
  const trimmed = raw.trim()
  if (!trimmed) return { error: 'Enter at least one number.' }

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean)
  if (tokens.length > max) {
    return { error: `Use ${max} values or fewer. Large arrays are hard to step through.` }
  }

  const values: number[] = []
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `"${token}" is not a whole number.` }
    }
    const value = Number(token)
    if (!Number.isFinite(value) || Math.abs(value) > 999) {
      return { error: 'Keep values between -999 and 999.' }
    }
    values.push(value)
  }

  return { values }
}

export function randomGridWalls(
  cols: number,
  rows: number,
  start: number,
  end: number,
  density = 0.23,
): number[] {
  const walls = new Set<number>()
  const total = cols * rows
  const target = Math.floor(total * density)
  while (walls.size < target) {
    const index = randomInt(0, total - 1)
    if (index === start || index === end) continue
    walls.add(index)
  }
  return Array.from(walls)
}

export function randomKey(prefix = 'k'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
