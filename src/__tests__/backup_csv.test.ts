import { describe, it, expect } from 'vitest'
import {
  customersToCSV,
  productsToCSV,
  parseCustomersCsv,
  parseProductsCsv,
  parseCSVLines,
} from '@/utils/csv'

describe('csv utility', () => {
  describe('parseCSVLines', () => {
    it('parses basic csv lines with quotes', () => {
      const csv = `Name,Email,Phone\n"John, Doe",john@example.com,123456\nJane,jane@example.com,7890`
      const lines = parseCSVLines(csv)
      expect(lines).toHaveLength(3)
      expect(lines[1][0]).toBe('John, Doe')
      expect(lines[1][1]).toBe('john@example.com')
      expect(lines[2][0]).toBe('Jane')
    })
  })

  describe('customersToCSV & parseCustomersCsv', () => {
    it('exports customers to CSV and parses them back', () => {
      const customers = [
        { name: 'Acme Corp', email: 'info@acme.com', phone: '99887766', address: 'Muscat', cr: 'CR123' },
        { name: 'Beta LLC', email: 'contact@beta.com', phone: '11223344', address: 'Salalah', cr: 'CR456' },
      ]

      const csvText = customersToCSV(customers)
      expect(csvText).toContain('Acme Corp')
      expect(csvText).toContain('info@acme.com')

      const parsed = parseCustomersCsv(csvText, 'company_1')
      expect(parsed).toHaveLength(2)
      expect(parsed[0].name).toBe('Acme Corp')
      expect(parsed[0].email).toBe('info@acme.com')
      expect(parsed[0].companyId).toBe('company_1')
      expect(parsed[1].name).toBe('Beta LLC')
    })
  })

  describe('productsToCSV & parseProductsCsv', () => {
    it('exports products to CSV and parses them back', () => {
      const products = [
        { name: 'Web Design', desc: 'Custom website layout', price: 250 },
        { name: 'SEO Audit', desc: 'Full audit report', price: 150 },
      ]

      const csvText = productsToCSV(products, '$')
      expect(csvText).toContain('Web Design')
      expect(csvText).toContain('250.00')

      const parsed = parseProductsCsv(csvText, 'company_1')
      expect(parsed).toHaveLength(2)
      expect(parsed[0].name).toBe('Web Design')
      expect(parsed[0].price).toBe(250)
      expect(parsed[1].name).toBe('SEO Audit')
      expect(parsed[1].price).toBe(150)
    })
  })
})
