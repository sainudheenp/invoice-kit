import { describe, it, expect } from 'vitest'
import { num2words } from '@/utils/num2words'
import type { Currency } from '@/types/currency'

const OMR: Currency = {
  code: 'OMR', symbol: 'RO', name: 'Rial', namePl: 'Rials',
  sub: 'Baisa', subPl: 'Baisa', subPer: 1000,
}

const USD: Currency = {
  code: 'USD', symbol: '$', name: 'Dollar', namePl: 'Dollars',
  sub: 'Cent', subPl: 'Cents', subPer: 100,
}

describe('num2words', () => {
  it('converts zero', () => {
    expect(num2words(0, OMR)).toBe('Zero Rials')
  })

  it('converts whole numbers', () => {
    expect(num2words(1, OMR)).toBe('One Rial')
    expect(num2words(2, OMR)).toBe('Two Rials')
    expect(num2words(100, OMR)).toBe('One Hundred Rials')
  })

  it('converts plural currency names', () => {
    expect(num2words(5, OMR)).toBe('Five Rials')
  })

  it('converts fractional amounts', () => {
    expect(num2words(1.5, OMR)).toBe('One Rial and Five Hundred Baisa')
  })

  it('handles USD cents', () => {
    expect(num2words(1.5, USD)).toBe('One Dollar and Fifty Cents')
  })

  it('converts large numbers', () => {
    expect(num2words(1234567, USD)).toBe('One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven Dollars')
  })

  it('handles single sub-unit', () => {
    expect(num2words(1.001, OMR)).toBe('One Rial and One Baisa')
  })
})
