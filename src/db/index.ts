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

export class AppDatabase extends Dexie {
  companies!: Table<Company, string>
  invoices!: Table<Invoice, string>
  receipts!: Table<Receipt, string>
  quotations!: Table<Quotation, string>
  customers!: Table<CustomerRecord, string>
  products!: Table<ProductRecord, string>
  snapshots!: Table<LocalSnapshot, string>

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
    })
  }
}

export const db = new AppDatabase()
