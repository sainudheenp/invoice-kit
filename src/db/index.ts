import Dexie, { type Table } from 'dexie'
import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { CustomerRecord } from '@/types/customer'
import type { ProductRecord } from '@/types/product'

export interface LocalSnapshot {
  id: string
  name: string
  createdAt: number
  payloadJson: string
}

export interface MetaRecord {
  key: string
  value: string
}

export class AppDatabase extends Dexie {
  companies!: Table<Company, string>
  invoices!: Table<Invoice, string>
  receipts!: Table<Receipt, string>
  quotations!: Table<Quotation, string>
  customers!: Table<CustomerRecord, string>
  products!: Table<ProductRecord, string>
  snapshots!: Table<LocalSnapshot, string>
  meta!: Table<MetaRecord, string>

  constructor() {
    super('DocGenDB')
    this.version(6).stores({
      companies: 'id, name',
      invoices: 'id, companyId',
      receipts: 'id, companyId',
      quotations: 'id, companyId',
      customers: 'id, companyId, name',
      products: 'id, companyId, name',
      snapshots: 'id, createdAt',
      meta: 'key',
    })
  }
}

export const db = new AppDatabase()

export const META_KEYS = {
  DATA_VERSION: 'data_version',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const

export const CURRENT_DATA_VERSION = '1'

export async function getMetaValue(key: string): Promise<string | undefined> {
  const record = await db.meta.get(key)
  return record?.value
}

export async function setMetaValue(key: string, value: string): Promise<void> {
  await db.meta.put({ key, value })
}

export async function isOnboardingComplete(): Promise<boolean> {
  const flag = await getMetaValue(META_KEYS.ONBOARDING_COMPLETE)
  return flag === 'true'
}

export async function markOnboardingComplete(): Promise<void> {
  await setMetaValue(META_KEYS.ONBOARDING_COMPLETE, 'true')
  await setMetaValue(META_KEYS.DATA_VERSION, CURRENT_DATA_VERSION)
}
