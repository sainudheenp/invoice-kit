import Dexie, { type Table } from 'dexie'
import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { CustomerRecord } from '@/types/customer'
import type { ProductRecord } from '@/types/product'

export class AppDatabase extends Dexie {
  companies!: Table<Company, string>
  invoices!: Table<Invoice, string>
  receipts!: Table<Receipt, string>
  quotations!: Table<Quotation, string>
  customers!: Table<CustomerRecord, string>
  products!: Table<ProductRecord, string>

  constructor() {
    super('DocGenDB')
    this.version(5).stores({
      companies: 'id, name',
      invoices: 'id, companyId',
      receipts: 'id, companyId',
      quotations: 'id, companyId',
      customers: 'id, companyId, name',
      products: 'id, companyId, name',
    })
  }
}

export const db = new AppDatabase()
