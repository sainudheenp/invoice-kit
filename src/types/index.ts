export type { Currency } from './currency'
export type { Company } from './company'
export type { Invoice, LineItem, Customer } from './invoice'
export type { Receipt } from './receipt'
export type { InvTemplateData, RecTemplateData } from './template'

export interface EditingDoc {
  type: 'inv' | 'rec'
  id: string
}

export type ToastType = 'ok' | 'err' | 'info'

export interface Toast {
  id: string
  msg: string
  type: ToastType
}
