import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { Company } from '@/types/company'
import type { InvTemplateData, RecTemplateData, QuotTemplateData } from '@/types/template'
import type { LineItem } from '@/types/invoice'
import { dp, fmtAmount } from '@/utils/format'
import { num2words } from '@/utils/num2words'
import { esc } from '@/utils/esc'
import {
  InvoiceClassic, InvoiceModern, InvoiceProfessional,
  InvoiceMinimal, InvoiceElegant, InvoiceBold, InvoiceBeirak,
} from './invoice'
import {
  ReceiptClassic, ReceiptModern, ReceiptProfessional,
  ReceiptMinimal, ReceiptElegant, ReceiptBold, ReceiptBeirak,
} from './receipt'
import {
  QuotationClassic, QuotationModern, QuotationProfessional,
  QuotationMinimal, QuotationElegant, QuotationBold, QuotationBeirak,
} from './quotation'

const SCALE = 1.1

function scaleTemplate(html: string): string {
  let out = html.replace(/font-size:\s*([\d.]+)px/g, (_m, px) => {
    const v = Math.round(parseFloat(px) * SCALE * 10) / 10
    return `font-size:${v}px`
  })
  out = out.replace(
    /(<img\b[^>]*?)height:\s*([\d.]+)px([^>]*?alt="(?:logo|seal|signature)")/g,
    (_m, pre, px, post) => {
      const v = Math.round(parseFloat(px) * SCALE)
      return `${pre}height:${v}px${post}`
    },
  )
  return out
}

function watermarkHTML(html: string, text: string): string {
  if (!text) return html
  const s = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;display:flex;align-items:center;justify-content:center;z-index:9999;'
  const w = `<div style="${s}"><div style="font-size:48px;color:rgba(0,0,0,0.06);transform:rotate(-30deg);font-weight:bold;white-space:pre-wrap;text-align:center;">${text}</div></div>`
  return html + w
}

const TEMPLATE_LIST = ['classic', 'modern', 'professional', 'minimal', 'elegant', 'bold', 'beirak']

export const INV_TEMPLATES: Record<string, (d: InvTemplateData) => string> = {
  classic: InvoiceClassic, modern: InvoiceModern, professional: InvoiceProfessional,
  minimal: InvoiceMinimal, elegant: InvoiceElegant, bold: InvoiceBold, beirak: InvoiceBeirak,
}

export const REC_TEMPLATES: Record<string, (d: RecTemplateData) => string> = {
  classic: ReceiptClassic, modern: ReceiptModern, professional: ReceiptProfessional,
  minimal: ReceiptMinimal, elegant: ReceiptElegant, bold: ReceiptBold, beirak: ReceiptBeirak,
}

export const QUOT_TEMPLATES: Record<string, (d: QuotTemplateData) => string> = {
  classic: QuotationClassic, modern: QuotationModern, professional: QuotationProfessional,
  minimal: QuotationMinimal, elegant: QuotationElegant, bold: QuotationBold, beirak: QuotationBeirak,
}

export { TEMPLATE_LIST as TEMPLATE_OPTIONS }

function transformInvData(savedInv: Invoice | null, comp?: Company | null): InvTemplateData | null {
  if (!comp) return null
  const d = savedInv || {} as Invoice
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items: LineItem[] = d.items && d.items.length > 0 ? d.items : []
  const sub = d.subtotal || items.reduce((s, i) => s + i.amount, 0)
  const totalTax = items.reduce((s, i) => s + i.amount * ((i.taxRate || 0) / 100), 0)
  const disc = d.discount || 0
  const grand = d.grand || sub + totalTax - disc
  return {
    comp, cur, no: d.invNo || '', dt: d.date || '',
    cust: d.customer?.name || '', addr: d.customer?.address || '',
    ph: d.customer?.phone || '', cr: d.customer?.cr || '', em: d.customer?.email || '',
    notes: d.notes || '', pm: d.payMethod || '', ch: d.payDetails || '',
    bk: d.bankName || '',     disc, sub, totalTax, grand,
    items, dp: dec, hasTax: items.some(i => (i.taxRate || 0) > 0),
    sv: fmtAmount(sub, dec), tv: fmtAmount(totalTax, dec),
    dv: fmtAmount(disc, dec), gv: fmtAmount(grand, dec),
    gw: grand > 0 ? num2words(grand, cur) + ' only' : '',
    pd: [d.payMethod, d.payDetails].filter(Boolean).join(' - '),
  }
}

function transformRecData(savedRec: Receipt | null, comp?: Company | null): RecTemplateData | null {
  if (!comp) return null
  const d = savedRec || {} as Receipt
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items: LineItem[] = d.items && d.items.length > 0 ? d.items : []
  const amount = d.amount || items.reduce((s, i) => s + i.amount, 0)
  const totalTax = items.reduce((s, i) => s + i.amount * ((i.taxRate || 0) / 100), 0)
  const wi = Math.floor(amount)
  const fr = Math.round((amount - wi) * Math.pow(10, dec))
  return {
    comp, cur, pc: comp.pcolor || '#D97706', ac: comp.acolor || '#1e293b',
    no: d.recNo || '', dt: d.date || '', rf: d.receivedFrom || '',
    items, am: amount, totalTax, ww: d.amountWords || (amount > 0 ? num2words(amount, cur) + ' only' : ''),
    pm: d.payMethod || '', ch: d.chequeNo || '', bk: d.bankName || '',
    td: d.transDate || '', bg: d.being || '', rv: d.receiver || '', sg: d.signatory || '',
    dp: dec, wi, fr, amFmt: fmtAmount(amount, dec),
    tv: fmtAmount(totalTax, dec),
    chqHtml: d.chequeNo ? `<strong>Cheque:</strong> ${esc(d.chequeNo)}` : '',
  }
}

function transformQuotData(savedQuot: Quotation | null, comp?: Company | null): QuotTemplateData | null {
  if (!comp) return null
  const d = savedQuot || {} as Quotation
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items: LineItem[] = d.items && d.items.length > 0 ? d.items : []
  const sub = d.subtotal || items.reduce((s, i) => s + i.amount, 0)
  const totalTax = items.reduce((s, i) => s + i.amount * ((i.taxRate || 0) / 100), 0)
  const disc = d.discount || 0
  const grand = d.grand || sub + totalTax - disc
  return {
    comp, cur, no: d.quotNo || '', dt: d.date || '', validDt: d.validUntil || '',
    cust: d.customer?.name || '', addr: d.customer?.address || '',
    ph: d.customer?.phone || '', cr: d.customer?.cr || '', em: d.customer?.email || '',
    notes: d.notes || '', terms: d.terms || '', disc, sub, totalTax, grand,
    items, dp: dec,
    sv: fmtAmount(sub, dec), tv: fmtAmount(totalTax, dec),
    dv: fmtAmount(disc, dec), gv: fmtAmount(grand, dec),
    gw: grand > 0 ? num2words(grand, cur) + ' only' : '',
  }
}

export function buildInvoiceHTML(savedInv: Invoice | null, comp?: Company | null): string {
  const data = transformInvData(savedInv, comp)
  if (!data) return ''
  const tplName = data.comp.invTemplate || 'classic'
  const fn = INV_TEMPLATES[tplName] || INV_TEMPLATES.classic
  return watermarkHTML(scaleTemplate(fn(data)), data.comp.watermark)
}

export function buildReceiptHTML(savedRec: Receipt | null, comp?: Company | null): string {
  const data = transformRecData(savedRec, comp)
  if (!data) return ''
  const tplName = data.comp.recTemplate || 'classic'
  const fn = REC_TEMPLATES[tplName] || REC_TEMPLATES.classic
  return watermarkHTML(scaleTemplate(fn(data)), data.comp.watermark)
}

export function buildQuotationHTML(savedQuot: Quotation | null, comp?: Company | null): string {
  const data = transformQuotData(savedQuot, comp)
  if (!data) return ''
  const tplName = data.comp.quotTemplate || 'classic'
  const fn = QUOT_TEMPLATES[tplName] || QUOT_TEMPLATES.classic
  return watermarkHTML(scaleTemplate(fn(data)), data.comp.watermark)
}

export function applyWatermark(html: string, text: string): string {
  return watermarkHTML(html, text)
}

export function sampleInvData(comp: Company): InvTemplateData | null {
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items = [
    { desc: 'Consulting Services', qty: 10, price: 150, amount: 1500, taxRate: 5 },
    { desc: 'Software License', qty: 2, price: 500, amount: 1000, taxRate: 0 },
  ]
  const sub = items.reduce((s, i) => s + i.amount, 0)
  const totalTax = items.reduce((s, i) => s + i.amount * ((i.taxRate || 0) / 100), 0)
  const grand = sub + totalTax
  return {
    comp, cur, no: 'INV-001', dt: new Date().toISOString().slice(0, 10),
    cust: 'Sample Customer', addr: '123 Main St', ph: '+968 1234 5678',
    cr: 'CR-12345', em: 'customer@example.com',
    notes: 'Payment due within 30 days.', pm: 'Bank Transfer', ch: '', bk: '',
    disc: 0, sub, totalTax, grand, items, dp: dec, hasTax: items.some(i => (i.taxRate || 0) > 0),
    sv: fmtAmount(sub, dec), tv: fmtAmount(totalTax, dec),
    dv: fmtAmount(0, dec), gv: fmtAmount(grand, dec),
    gw: num2words(grand, cur) + ' only',
    pd: 'Bank Transfer',
  }
}

export function sampleRecData(comp: Company): RecTemplateData | null {
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const amount = 2500
  const wi = Math.floor(amount)
  const fr = Math.round((amount - wi) * Math.pow(10, dec))
  return {
    comp, cur, pc: comp.pcolor || '#D97706', ac: comp.acolor || '#1e293b',
    no: 'REC-001', dt: new Date().toISOString().slice(0, 10),
    rf: 'Sample Payer', items: [], am: amount,
    ww: num2words(amount, cur) + ' only',
    pm: 'Cash', ch: '', bk: 'Bank Muscat', td: new Date().toISOString().slice(0, 10),
    bg: 'Invoice payment', rv: 'John Doe', sg: 'Jane Smith',
    dp: dec, wi, fr, amFmt: fmtAmount(amount, dec), totalTax: 0, tv: fmtAmount(0, dec), chqHtml: '',
  }
}

export function sampleQuotData(comp: Company): QuotTemplateData | null {
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items = [
    { desc: 'Web Development', qty: 1, price: 3000, amount: 3000, taxRate: 0 },
    { desc: 'Hosting Setup', qty: 1, price: 500, amount: 500, taxRate: 0 },
  ]
  const sub = items.reduce((s, i) => s + i.amount, 0)
  const totalTax = 0
  const grand = sub
  const dt = new Date()
  const valid = new Date(dt); valid.setDate(valid.getDate() + 30)
  return {
    comp, cur, no: 'QOT-001', dt: dt.toISOString().slice(0, 10),
    validDt: valid.toISOString().slice(0, 10),
    cust: 'Sample Prospect', addr: '456 Business Ave', ph: '+968 9876 5432',
    cr: 'CR-67890', em: 'prospect@example.com', notes: 'Valid for 30 days.',
    terms: '50% upfront, 50% on completion.',
    disc: 0, sub, totalTax, grand, items, dp: dec,
    sv: fmtAmount(sub, dec), tv: fmtAmount(0, dec),
    dv: fmtAmount(0, dec), gv: fmtAmount(grand, dec),
    gw: num2words(grand, cur) + ' only',
  }
}
