import { describe, it, expect } from 'vitest'
import { dp, fmtAmount, invStatus } from '@/utils/format'

describe('dp', () => {
  it('returns 0 for subPer=1', () => {
    expect(dp(1)).toBe(0)
  })

  it('returns 2 for subPer=100', () => {
    expect(dp(100)).toBe(2)
  })

  it('returns 3 for subPer=1000', () => {
    expect(dp(1000)).toBe(3)
  })
})

describe('fmtAmount', () => {
  it('formats with correct decimals', () => {
    expect(fmtAmount(1234.5, 2)).toBe('1234.50')
  })

  it('formats with 3 decimals', () => {
    expect(fmtAmount(1234.567, 3)).toBe('1234.567')
  })

  it('formats zero', () => {
    expect(fmtAmount(0, 2)).toBe('0.00')
  })

  it('formats with 0 decimals', () => {
    expect(fmtAmount(100, 0)).toBe('100')
  })
})

describe('invStatus', () => {
  it('returns Paid for paid invoices', () => {
    expect(invStatus({ paid: true })).toEqual({ lbl: 'Paid', cls: 'green' })
  })

  it('returns Unpaid for unpaid invoices', () => {
    expect(invStatus({ paid: false })).toEqual({ lbl: 'Unpaid', cls: 'amber' })
  })
})
