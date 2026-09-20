/**
 * Date-range helpers powering the Documents (History) page filter.
 *
 * Document dates are stored as `YYYY-MM-DD` strings (from <input type="date">),
 * so range checks are done on normalized ISO day strings — lexical comparison
 * is correct for this format and avoids timezone pitfalls.
 */

export type DatePreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'month'
  | 'lastMonth'
  | 'year'
  | 'custom'

export const DATE_PRESETS: ReadonlyArray<{ id: DatePreset; label: string }> = [
  { id: 'all', label: 'All dates' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'year', label: 'This year' },
  { id: 'custom', label: 'Custom range' },
]

export interface DateRange {
  from: string
  to: string
}

/** Local-time `YYYY-MM-DD` for a Date. */
export function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Normalize any stored date string to `YYYY-MM-DD`. Handles the canonical
 * `YYYY-MM-DD[...]` form directly and falls back to Date parsing for legacy
 * values. Returns null when the value cannot be interpreted as a day.
 */
export function docYmd(date: string | null | undefined): string | null {
  const s = (date ?? '').trim()
  if (!s) return null
  const iso = /^(\d{4}-\d{2}-\d{2})/.exec(s)
  if (iso) return iso[1]
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return ymd(parsed)
  return null
}

/** Resolve a preset to a concrete range relative to `now` ('all'/'custom' → empty bounds). */
export function presetRange(preset: DatePreset, now: Date = new Date()): DateRange {
  const today = ymd(now)
  const daysAgo = (n: number): string => {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    return ymd(d)
  }
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'yesterday':
      return { from: daysAgo(1), to: daysAgo(1) }
    case '7d':
      return { from: daysAgo(6), to: today }
    case '30d':
      return { from: daysAgo(29), to: today }
    case 'month':
      return { from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), to: today }
    case 'lastMonth': {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: ymd(first), to: ymd(last) }
    }
    case 'year':
      return { from: `${now.getFullYear()}-01-01`, to: today }
    default:
      return { from: '', to: '' }
  }
}

export function sameRange(a: DateRange, b: DateRange): boolean {
  return a.from === b.from && a.to === b.to
}

/**
 * Which preset (if any) matches the given bounds. 'all' when unbounded,
 * 'custom' when bounds exist but match no preset.
 */
export function detectPreset(range: DateRange, now: Date = new Date()): DatePreset {
  if (!range.from && !range.to) return 'all'
  const match = DATE_PRESETS.find(
    (p) => p.id !== 'all' && p.id !== 'custom' && sameRange(presetRange(p.id, now), range),
  )
  return match?.id ?? 'custom'
}

/**
 * Inclusive range check. Empty `from`/`to` are open bounds. Documents whose
 * date cannot be parsed are excluded while any bound is active (they cannot
 * be placed on a timeline), and included when no filter is active.
 */
export function dateInRange(date: string | null | undefined, from: string, to: string): boolean {
  if (!from && !to) return true
  const d = docYmd(date)
  if (!d) return false
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}
