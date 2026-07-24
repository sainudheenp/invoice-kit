import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { CustomerRecord } from '@/types/customer'
import type { ProductRecord } from '@/types/product'
import { db } from '@/db'

export interface BackupMetaData {
  version: number
  app: string
  exportedAt: string
  counts: {
    companies: number
    invoices: number
    receipts: number
    quotations: number
    customers: number
    products: number
  }
}

export interface BackupPayload {
  metadata?: BackupMetaData
  companies: Company[]
  invoices: Invoice[]
  receipts: Receipt[]
  quotations: Quotation[]
  customers: CustomerRecord[]
  products: ProductRecord[]
  activeId?: string | null
}

export interface ImportResult {
  companies: number
  invoices: number
  receipts: number
  quotations: number
  customers: number
  products: number
}

const STORAGE_ACTIVE_ID_KEY = 'ik_activeId'

/**
 * Generates a versioned JSON backup payload string from current state.
 */
export function exportBackupData(state: {
  companies: Company[]
  invoices: Invoice[]
  receipts: Receipt[]
  quotations: Quotation[]
  customers: CustomerRecord[]
  products: ProductRecord[]
  activeId: string | null
}): string {
  const payload: BackupPayload = {
    metadata: {
      version: 1,
      app: 'invoicekitz',
      exportedAt: new Date().toISOString(),
      counts: {
        companies: state.companies?.length || 0,
        invoices: state.invoices?.length || 0,
        receipts: state.receipts?.length || 0,
        quotations: state.quotations?.length || 0,
        customers: state.customers?.length || 0,
        products: state.products?.length || 0,
      },
    },
    companies: state.companies || [],
    invoices: state.invoices || [],
    receipts: state.receipts || [],
    quotations: state.quotations || [],
    customers: state.customers || [],
    products: state.products || [],
    activeId: state.activeId,
  }
  return JSON.stringify(payload, null, 2)
}

/**
 * Validates and sanitizes a raw JSON string into a valid BackupPayload object.
 * Supports legacy formats that may lack metadata, customers, or products keys.
 */
export function validateBackupFile(jsonString: string): {
  valid: boolean
  error?: string
  payload?: BackupPayload
} {
  try {
    const raw = JSON.parse(jsonString)
    if (!raw || typeof raw !== 'object') {
      return { valid: false, error: 'Invalid backup file format (not a JSON object).' }
    }

    if (!Array.isArray(raw.companies)) {
      return { valid: false, error: 'Invalid backup file: "companies" array is missing.' }
    }

    const payload: BackupPayload = {
      companies: Array.isArray(raw.companies) ? raw.companies : [],
      invoices: Array.isArray(raw.invoices) ? raw.invoices : [],
      receipts: Array.isArray(raw.receipts) ? raw.receipts : [],
      quotations: Array.isArray(raw.quotations) ? raw.quotations : [],
      customers: Array.isArray(raw.customers) ? raw.customers : [],
      products: Array.isArray(raw.products) ? raw.products : [],
      activeId: typeof raw.activeId === 'string' ? raw.activeId : null,
    }

    if (raw.metadata && typeof raw.metadata === 'object') {
      payload.metadata = raw.metadata
    } else {
      payload.metadata = {
        version: 1,
        app: 'invoicekitz',
        exportedAt: new Date().toISOString(),
        counts: {
          companies: payload.companies.length,
          invoices: payload.invoices.length,
          receipts: payload.receipts.length,
          quotations: payload.quotations.length,
          customers: payload.customers.length,
          products: payload.products.length,
        },
      }
    }

    return { valid: true, payload }
  } catch (e: any) {
    return { valid: false, error: `JSON Parse Error: ${e?.message || 'Invalid JSON format'}` }
  }
}

/**
 * Performs database restore and returns entity counts.
 */
export async function executeRestore(
  payload: BackupPayload,
  mode: 'merge' | 'replace'
): Promise<{
  counts: ImportResult
  allData: {
    companies: Company[]
    invoices: Invoice[]
    receipts: Receipt[]
    quotations: Quotation[]
    customers: CustomerRecord[]
    products: ProductRecord[]
    activeId: string | null
  }
}> {
  await db.open()

  if (mode === 'replace') {
    await Promise.all([
      db.companies.clear(),
      db.invoices.clear(),
      db.receipts.clear(),
      db.quotations.clear(),
      db.customers.clear(),
      db.products.clear(),
    ])
  }

  // Bulk put/upsert items
  if (payload.companies.length > 0) await db.companies.bulkPut(payload.companies)
  if (payload.invoices.length > 0) await db.invoices.bulkPut(payload.invoices)
  if (payload.receipts.length > 0) await db.receipts.bulkPut(payload.receipts)
  if (payload.quotations.length > 0) await db.quotations.bulkPut(payload.quotations)
  if (payload.customers.length > 0) await db.customers.bulkPut(payload.customers)
  if (payload.products.length > 0) await db.products.bulkPut(payload.products)

  // Fetch updated dataset
  const [companies, invoices, receipts, quotations, customers, products] = await Promise.all([
    db.companies.toArray(),
    db.invoices.toArray(),
    db.receipts.toArray(),
    db.quotations.toArray(),
    db.customers.toArray(),
    db.products.toArray(),
  ])

  // Determine active company ID
  let activeId: string | null = null
  const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY)

  if (payload.activeId && companies.some((c) => c.id === payload.activeId)) {
    activeId = payload.activeId
  } else if (storedActiveId && companies.some((c) => c.id === storedActiveId)) {
    activeId = storedActiveId
  } else if (companies.length > 0) {
    activeId = companies[0].id
  }

  if (activeId) {
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeId)
  }

  const counts: ImportResult = {
    companies: payload.companies.length,
    invoices: payload.invoices.length,
    receipts: payload.receipts.length,
    quotations: payload.quotations.length,
    customers: payload.customers.length,
    products: payload.products.length,
  }

  return {
    counts,
    allData: { companies, invoices, receipts, quotations, customers, products, activeId },
  }
}
