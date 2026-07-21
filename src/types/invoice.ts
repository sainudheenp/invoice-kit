export interface LineItem {
  desc: string
  qty: number
  price: number
  amount: number
  taxRate: number
}

export interface Customer {
  name: string
  address: string
  phone: string
  cr: string
  email: string
}

export interface Invoice {
  id: string
  companyId: string
  invNo: string
  date: string
  paid: boolean
  customer: Customer
  items: LineItem[]
  subtotal: number
  vatPct: number
  vatAmt: number
  discount: number
  grand: number
  notes: string
  payMethod: string
  payDetails: string
  bankName: string
  createdAt: number
}
