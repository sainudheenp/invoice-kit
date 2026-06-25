import type { Currency } from './currency'

export interface Company {
  id: string
  name: string
  nameAr: string
  sub: string
  subAr: string
  tel: string
  fax: string
  mob: string
  cr: string
  pobox: string
  loc: string
  email: string
  website: string
  logo: string
  seal: string
  signature: string
  pcolor: string
  acolor: string
  currency: Currency
  vatReg: string
  vatPct: number
  bankName: string
  bankAccName: string
  bankAcc: string
  bankIban: string
  bankSwift: string
  bankBranch: string
  invPref: string
  invNext: number
  recPref: string
  recNext: number
  quotPref: string
  quotNext: number
  invNotes: string
  invTerms: string
  invFooter: string
  recBeing: string
  invTemplate: string
  recTemplate: string
  quotTemplate: string
  watermark: string
  createdAt: number
  updatedAt: number
}
