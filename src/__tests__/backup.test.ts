import { describe, it, expect } from 'vitest'
import { exportBackupData, validateBackupFile } from '@/utils/backup'

describe('backup utility', () => {
  const dummyState = {
    companies: [{ id: 'co1', name: 'Test Co' } as any],
    invoices: [{ id: 'inv1', invNo: 'INV-001' } as any],
    receipts: [{ id: 'rec1', recNo: 'REC-001' } as any],
    quotations: [{ id: 'quot1', quotNo: 'QUOT-001' } as any],
    customers: [{ id: 'cust1', name: 'John Doe' } as any],
    products: [{ id: 'prod1', name: 'Widget' } as any],
    activeId: 'co1',
  }

  describe('exportBackupData', () => {
    it('generates a JSON string with metadata and state entities', () => {
      const jsonStr = exportBackupData(dummyState)
      expect(typeof jsonStr).toBe('string')

      const parsed = JSON.parse(jsonStr)
      expect(parsed.metadata).toBeDefined()
      expect(parsed.metadata.version).toBe(1)
      expect(parsed.metadata.app).toBe('invoicekitz')
      expect(parsed.metadata.counts).toEqual({
        companies: 1,
        invoices: 1,
        receipts: 1,
        quotations: 1,
        customers: 1,
        products: 1,
      })
      expect(parsed.companies).toHaveLength(1)
      expect(parsed.customers).toHaveLength(1)
      expect(parsed.products).toHaveLength(1)
      expect(parsed.activeId).toBe('co1')
    })
  })

  describe('validateBackupFile', () => {
    it('validates a correct modern backup file', () => {
      const jsonStr = exportBackupData(dummyState)
      const res = validateBackupFile(jsonStr)
      expect(res.valid).toBe(true)
      expect(res.payload).toBeDefined()
      expect(res.payload?.companies).toHaveLength(1)
      expect(res.payload?.customers).toHaveLength(1)
      expect(res.payload?.products).toHaveLength(1)
    })

    it('handles legacy backup format without metadata, customers or products', () => {
      const legacyBackup = {
        companies: [{ id: 'co1', name: 'Old Co' }],
        invoices: [{ id: 'inv1' }],
      }
      const res = validateBackupFile(JSON.stringify(legacyBackup))
      expect(res.valid).toBe(true)
      expect(res.payload).toBeDefined()
      expect(res.payload?.companies).toHaveLength(1)
      expect(res.payload?.customers).toEqual([])
      expect(res.payload?.products).toEqual([])
      expect(res.payload?.metadata?.counts.companies).toBe(1)
    })

    it('rejects invalid JSON syntax', () => {
      const res = validateBackupFile('{ invalid json')
      expect(res.valid).toBe(false)
      expect(res.error).toContain('JSON Parse Error')
    })

    it('rejects JSON missing the companies array', () => {
      const res = validateBackupFile(JSON.stringify({ invoices: [] }))
      expect(res.valid).toBe(false)
      expect(res.error).toContain('"companies" array is missing')
    })
  })
})
