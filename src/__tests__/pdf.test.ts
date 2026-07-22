import { describe, it, expect } from 'vitest'
import { safePdfName } from '@/utils/pdf'

describe('safePdfName', () => {
  it('returns cleaned name', () => {
    expect(safePdfName('INV-001')).toBe('INV-001')
  })

  it('strips path separators', () => {
    expect(safePdfName('../etc/passwd')).toBe('-etc-passwd')
  })

  it('strips illegal characters', () => {
    expect(safePdfName('file<>:"|?*name')).toBe('filename')
  })

  it('truncates to 120 chars', () => {
    const long = 'a'.repeat(200)
    expect(safePdfName(long).length).toBe(120)
  })

  it('returns fallback for empty/null', () => {
    expect(safePdfName(null)).toBe('document')
    expect(safePdfName('')).toBe('document')
  })

  it('trims whitespace', () => {
    expect(safePdfName('  hello  ')).toBe('hello')
  })
})
