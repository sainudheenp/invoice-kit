import { describe, it, expect } from 'vitest'
import { sampleInvData, sampleRecData, sampleQuotData, INV_TEMPLATES, REC_TEMPLATES, QUOT_TEMPLATES } from '@/templates'
import { defCompany } from '@/utils/defCompany'

const comp = defCompany('Test Co')

describe('sample data generators', () => {
  it('sampleInvData returns valid data', () => {
    const data = sampleInvData(comp)
    expect(data).not.toBeNull()
    expect(data!.items.length).toBeGreaterThan(0)
    expect(data!.comp.name).toBe('Test Co')
  })

  it('sampleRecData returns valid data', () => {
    const data = sampleRecData(comp)
    expect(data).not.toBeNull()
    expect(data!.am).toBeGreaterThan(0)
  })

  it('sampleQuotData returns valid data', () => {
    const data = sampleQuotData(comp)
    expect(data).not.toBeNull()
    expect(data!.items.length).toBeGreaterThan(0)
  })
})

describe('invoice templates', () => {
  const names = ['classic', 'modern', 'professional', 'minimal', 'elegant', 'bold', 'beirak']

  for (const name of names) {
    it(`${name} renders HTML`, () => {
      const data = sampleInvData(comp)
      const fn = INV_TEMPLATES[name]
      expect(fn).toBeDefined()
      const html = fn(data!)
      expect(html).toContain('<html')
      expect(html).toContain('</html>')
      expect(html).toContain('Test Co')
    })
  }
})

describe('receipt templates', () => {
  const names = ['classic', 'modern', 'professional', 'minimal', 'elegant', 'bold', 'beirak']

  for (const name of names) {
    it(`${name} renders HTML`, () => {
      const data = sampleRecData(comp)
      const fn = REC_TEMPLATES[name]
      expect(fn).toBeDefined()
      const html = fn(data!)
      expect(html).toContain('<html')
      expect(html).toContain('Test Co')
    })
  }
})

describe('quotation templates', () => {
  const names = ['classic', 'modern', 'professional', 'minimal', 'elegant', 'bold', 'beirak']

  for (const name of names) {
    it(`${name} renders HTML`, () => {
      const data = sampleQuotData(comp)
      const fn = QUOT_TEMPLATES[name]
      expect(fn).toBeDefined()
      const html = fn(data!)
      expect(html).toContain('<html')
      expect(html).toContain('Test Co')
    })
  }
})
