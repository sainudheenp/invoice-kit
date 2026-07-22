import { describe, it, expect } from 'vitest'
import { validate, validators } from '@/utils/validate'

describe('validate', () => {
  it('returns null when all rules pass', () => {
    expect(validate('hello', validators.required('Name'))).toBeNull()
  })

  it('returns first failing rule message', () => {
    expect(validate('', validators.required('Name'))).toBe('Name is required.')
  })
})

describe('validators.required', () => {
  it('fails on empty string', () => {
    expect(validators.required('Field').test('')).toBe(false)
  })

  it('fails on whitespace only', () => {
    expect(validators.required('Field').test('   ')).toBe(false)
  })

  it('passes on non-empty string', () => {
    expect(validators.required('Field').test('value')).toBe(true)
  })
})

describe('validators.email', () => {
  it('passes valid email', () => {
    expect(validators.email().test('test@example.com')).toBe(true)
  })

  it('passes empty email (optional)', () => {
    expect(validators.email().test('')).toBe(true)
  })

  it('fails invalid email', () => {
    expect(validators.email().test('not-an-email')).toBe(false)
  })
})

describe('validators.phone', () => {
  it('passes valid phone', () => {
    expect(validators.phone().test('+968 1234 5678')).toBe(true)
  })

  it('passes empty phone (optional)', () => {
    expect(validators.phone().test('')).toBe(true)
  })

  it('fails invalid phone', () => {
    expect(validators.phone().test('abc')).toBe(false)
  })
})

describe('validators.numeric', () => {
  it('passes numbers', () => {
    expect(validators.numeric('Price').test('123.45')).toBe(true)
  })

  it('passes empty', () => {
    expect(validators.numeric('Price').test('')).toBe(true)
  })

  it('fails non-numeric', () => {
    expect(validators.numeric('Price').test('abc')).toBe(false)
  })
})

describe('validators.positiveInt', () => {
  it('passes positive integers', () => {
    expect(validators.positiveInt('Qty').test('5')).toBe(true)
  })

  it('fails zero', () => {
    expect(validators.positiveInt('Qty').test('0')).toBe(false)
  })

  it('fails negative', () => {
    expect(validators.positiveInt('Qty').test('-1')).toBe(false)
  })

  it('fails decimals', () => {
    expect(validators.positiveInt('Qty').test('1.5')).toBe(false)
  })
})
