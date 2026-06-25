import { InvoiceClassic, InvoiceModern, InvoiceCompact, InvoiceMinimal, InvoiceElegant, InvoiceBold, InvoiceProfessional } from './invoice'
import { ReceiptClassic, ReceiptModern, ReceiptCompact, ReceiptMinimal, ReceiptElegant, ReceiptBold, ReceiptProfessional } from './receipt'
import { getInvDocData, getRecDocData, applyWatermark } from './registry'
import type { Company } from '@/types/company'
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'

export const INV_TEMPLATES: Record<string, (d: any) => string> = {
  classic: InvoiceClassic,
  modern: InvoiceModern,
  compact: InvoiceCompact,
  minimal: InvoiceMinimal,
  elegant: InvoiceElegant,
  bold: InvoiceBold,
  professional: InvoiceProfessional,
}

export const REC_TEMPLATES: Record<string, (d: any) => string> = {
  classic: ReceiptClassic,
  modern: ReceiptModern,
  compact: ReceiptCompact,
  minimal: ReceiptMinimal,
  elegant: ReceiptElegant,
  bold: ReceiptBold,
  professional: ReceiptProfessional,
}

export function buildInvoiceHTML(savedInv: Invoice | null, comp?: Company | null): string {
  const data = getInvDocData(savedInv, comp)
  if (!data) return ''
  const tplName = data.comp.invTemplate || 'classic'
  const fn = INV_TEMPLATES[tplName] || INV_TEMPLATES.classic
  const html = fn(data)
  return applyWatermark(html, data.comp.watermark)
}

export function buildReceiptHTML(savedRec: Receipt | null, comp?: Company | null): string {
  const data = getRecDocData(savedRec, comp)
  if (!data) return ''
  const tplName = data.comp.recTemplate || 'classic'
  const fn = REC_TEMPLATES[tplName] || REC_TEMPLATES.classic
  const html = fn(data)
  return applyWatermark(html, data.comp.watermark)
}

export function sampleInvData(comp: Company) {
  const data = getInvDocData(null, comp)
  if (!data) return null
  return {
    ...data,
    no: 'INV-1',
    dt: new Date().toISOString().slice(0, 10),
    dueDt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    cust: 'ABC Trading LLC',
    addr: 'Muscat, Sultanate of Oman',
    ph: '+968 1234 5678',
    cr: 'CR/123456',
    em: 'info@abctrading.com',
    items: [
      { desc: 'Consulting Services', qty: 40, price: 150, amount: 6000 },
      { desc: 'Software License', qty: 2, price: 1250, amount: 2500 },
      { desc: 'Training Session', qty: 1, price: 750, amount: 750 },
    ],
    sub: 9250, vp: 10, va: 925, disc: 250, grand: 9900,
    sv: '9250.00', vv: '925.00', dv: '250.00', gv: '9900.00',
    gw: 'Nine Thousand Nine Hundred US Dollars only',
  }
}

export function sampleRecData(comp: Company) {
  const data = getRecDocData(null, comp)
  if (!data) return null
  return {
    ...data,
    no: 'RV-1',
    dt: new Date().toISOString().slice(0, 10),
    rf: 'ABC Trading LLC',
    am: 5500, ww: 'Five Thousand Five Hundred US Dollars only',
    pm: 'Cheque', ch: 'CHQ-001', bk: 'Bank Muscat', td: new Date().toISOString().slice(0, 10),
    bg: 'Payment for consulting services',
    rv: 'John Doe', sg: 'Jane Smith',
    wi: 5500, fr: 0, amFmt: '5,500.00',
    chqHtml: 'Cheque: CHQ-001',
  }
}
