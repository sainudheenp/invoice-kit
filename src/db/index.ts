import Dexie, { type Table } from 'dexie'
import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'

export class AppDatabase extends Dexie {
  companies!: Table<Company, string>
  invoices!: Table<Invoice, string>
  receipts!: Table<Receipt, string>

  constructor() {
    super('DocGenDB')
    this.version(3).stores({
      companies: 'id, name',
      invoices: 'id, companyId',
      receipts: 'id, companyId',
    })
  }
}

export const db = new AppDatabase()
