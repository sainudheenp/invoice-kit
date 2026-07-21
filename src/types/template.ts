import type { Company } from './company'
import type { Currency } from './currency'
import type { LineItem } from './invoice'

export interface InvTemplateData {
  comp: Company
  cur: Currency
  no: string
  dt: string
  cust: string
  addr: string
  ph: string
  cr: string
  em: string
  notes: string
  pm: string
  ch: string
  bk: string
  disc: number
  sub: number
  totalTax: number
  grand: number
  items: LineItem[]
  dp: number
  sv: string
  tv: string
  dv: string
  gv: string
  gw: string
  pd: string
  hasTax: boolean
}

export interface RecTemplateData {
  comp: Company
  cur: Currency
  pc: string
  ac: string
  no: string
  dt: string
  rf: string
  items: LineItem[]
  am: number
  totalTax: number
  ww: string
  pm: string
  ch: string
  bk: string
  td: string
  bg: string
  rv: string
  sg: string
  dp: number
  wi: number
  fr: number
  amFmt: string
  tv: string
  chqHtml: string
}

export interface QuotTemplateData {
  comp: Company
  cur: Currency
  no: string
  dt: string
  validDt: string
  cust: string
  addr: string
  ph: string
  cr: string
  em: string
  notes: string
  terms: string
  disc: number
  sub: number
  totalTax: number
  grand: number
  items: LineItem[]
  dp: number
  sv: string
  tv: string
  dv: string
  gv: string
  gw: string
}
