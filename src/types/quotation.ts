import type { Customer, LineItem } from './invoice'

export interface Quotation {
  id: string
  companyId: string
  quotNo: string
  date: string
  validUntil: string
  customer: Customer
  items: LineItem[]
  subtotal: number
  vatPct: number
  vatAmt: number
  discount: number
  grand: number
  notes: string
  terms: string
  createdAt: number
}
