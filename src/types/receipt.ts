import type { LineItem } from './invoice'

export interface Receipt {
  id: string
  companyId: string
  recNo: string
  date: string
  receivedFrom: string
  items: LineItem[]
  amount: number
  vatPct: number
  vatAmt: number
  amountWords: string
  payMethod: string
  chequeNo: string
  bankName: string
  transDate: string
  being: string
  receiver: string
  signatory: string
  createdAt: number
}
