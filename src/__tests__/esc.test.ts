import { describe, it, expect } from 'vitest'
import { esc, safeImgSrc } from '@/utils/esc'

describe('esc', () => {
  it('escapes ampersands', () => {
    expect(esc('a & b')).toBe('a &amp; b')
  })

  it('escapes angle brackets', () => {
    expect(esc('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes quotes', () => {
    expect(esc('he said "hi"')).toBe('he said &quot;hi&quot;')
  })

  it('escapes single quotes', () => {
    expect(esc("it's")).toBe('it&#39;s')
  })

  it('escapes multiple special chars', () => {
    expect(esc('<img src="x" />')).toBe('&lt;img src=&quot;x&quot; /&gt;')
  })

  it('returns empty string unchanged', () => {
    expect(esc('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(esc('Hello World')).toBe('Hello World')
  })
})

describe('safeImgSrc', () => {
  it('allows data:image/ URLs', () => {
    expect(safeImgSrc('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
  })

  it('allows https URLs', () => {
    expect(safeImgSrc('https://example.com/logo.png')).toBe('https://example.com/logo.png')
  })

  it('allows http URLs', () => {
    expect(safeImgSrc('http://example.com/logo.png')).toBe('http://example.com/logo.png')
  })

  it('blocks javascript: URLs', () => {
    expect(safeImgSrc('javascript:alert(1)')).toBe('')
  })

  it('blocks data:text/html URLs', () => {
    expect(safeImgSrc('data:text/html,<script>alert(1)</script>')).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(safeImgSrc('')).toBe('')
  })

  it('blocks unknown protocols', () => {
    expect(safeImgSrc('file:///etc/passwd')).toBe('')
  })
})
