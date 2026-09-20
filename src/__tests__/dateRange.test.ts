import { describe, it, expect } from 'vitest'
import { ymd, docYmd, presetRange, detectPreset, sameRange, dateInRange, DATE_PRESETS } from '@/utils/dateRange'

// Fixed "now": 2026-09-20 (a Sunday) at 15:00 local time.
const NOW = new Date(2026, 8, 20, 15, 0, 0)

describe('ymd', () => {
  it('formats local dates zero-padded', () => {
    expect(ymd(new Date(2026, 8, 20))).toBe('2026-09-20')
    expect(ymd(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('docYmd', () => {
  it('passes through ISO dates and trims time parts', () => {
    expect(docYmd('2026-09-20')).toBe('2026-09-20')
    expect(docYmd(' 2026-09-20T14:30 ')).toBe('2026-09-20')
  })

  it('parses legacy Date-parseable values', () => {
    expect(docYmd('Sep 20, 2026')).toBe('2026-09-20')
  })

  it('returns null for empty or unparseable values', () => {
    expect(docYmd('')).toBeNull()
    expect(docYmd(null)).toBeNull()
    expect(docYmd('not-a-date')).toBeNull()
  })
})

describe('presetRange', () => {
  it('today bounds to NOW', () => {
    expect(presetRange('today', NOW)).toEqual({ from: '2026-09-20', to: '2026-09-20' })
  })

  it('yesterday', () => {
    expect(presetRange('yesterday', NOW)).toEqual({ from: '2026-09-19', to: '2026-09-19' })
  })

  it('last 7 days includes today', () => {
    expect(presetRange('7d', NOW)).toEqual({ from: '2026-09-14', to: '2026-09-20' })
  })

  it('last 30 days includes today', () => {
    expect(presetRange('30d', NOW)).toEqual({ from: '2026-08-22', to: '2026-09-20' })
  })

  it('this month starts on the 1st', () => {
    expect(presetRange('month', NOW)).toEqual({ from: '2026-09-01', to: '2026-09-20' })
  })

  it('last month spans the full previous month, across year boundaries', () => {
    expect(presetRange('lastMonth', NOW)).toEqual({ from: '2026-08-01', to: '2026-08-31' })
    expect(presetRange('lastMonth', new Date(2026, 0, 15))).toEqual({ from: '2025-12-01', to: '2025-12-31' })
  })

  it('this year starts on Jan 1st', () => {
    expect(presetRange('year', NOW)).toEqual({ from: '2026-01-01', to: '2026-09-20' })
  })

  it('all and custom have open bounds', () => {
    expect(presetRange('all', NOW)).toEqual({ from: '', to: '' })
    expect(presetRange('custom', NOW)).toEqual({ from: '', to: '' })
  })
})

describe('detectPreset', () => {
  it('detects all when unbounded', () => {
    expect(detectPreset({ from: '', to: '' }, NOW)).toBe('all')
  })

  it('detects matching presets', () => {
    expect(detectPreset(presetRange('7d', NOW), NOW)).toBe('7d')
    expect(detectPreset(presetRange('month', NOW), NOW)).toBe('month')
  })

  it('falls back to custom for arbitrary bounds', () => {
    expect(detectPreset({ from: '2026-09-01', to: '2026-09-15' }, NOW)).toBe('custom')
  })
})

describe('sameRange', () => {
  it('compares both bounds', () => {
    expect(sameRange({ from: 'a', to: 'b' }, { from: 'a', to: 'b' })).toBe(true)
    expect(sameRange({ from: 'a', to: 'b' }, { from: 'a', to: 'c' })).toBe(false)
  })
})

describe('dateInRange', () => {
  const rows = ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21']

  it('includes everything when unbounded', () => {
    expect(rows.filter((d) => dateInRange(d, '', ''))).toHaveLength(4)
  })

  it('filters with both bounds, inclusive', () => {
    expect(rows.filter((d) => dateInRange(d, '2026-09-19', '2026-09-20'))).toEqual(['2026-09-19', '2026-09-20'])
  })

  it('filters with only one bound', () => {
    expect(rows.filter((d) => dateInRange(d, '2026-09-20', ''))).toEqual(['2026-09-20', '2026-09-21'])
    expect(rows.filter((d) => dateInRange(d, '', '2026-09-19'))).toEqual(['2026-09-18', '2026-09-19'])
  })

  it('excludes unparseable dates while a filter is active', () => {
    expect(dateInRange('', '2026-09-01', '')).toBe(false)
    expect(dateInRange('garbage', '2026-09-01', '')).toBe(false)
    expect(dateInRange('', '', '')).toBe(true)
  })

  it('handles swapped bounds by matching nothing', () => {
    expect(rows.filter((d) => dateInRange(d, '2026-09-20', '2026-09-18'))).toEqual([])
  })
})

describe('DATE_PRESETS', () => {
  it('offers the expected preset list', () => {
    expect(DATE_PRESETS.map((p) => p.id)).toEqual([
      'all', 'today', 'yesterday', '7d', '30d', 'month', 'lastMonth', 'year', 'custom',
    ])
  })
})
