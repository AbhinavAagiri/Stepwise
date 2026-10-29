export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return '-'
  if (ms < 1) return '<1 ms'
  if (ms < 1000) return `${ms.toFixed(ms < 100 ? 1 : 0)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function formatSigned(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return count === 1 ? singular : (pluralForm ?? `${singular}s`)
}
