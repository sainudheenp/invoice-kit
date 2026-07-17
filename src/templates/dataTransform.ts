/**
 * Exported data transform functions for use by the jsPDF engine.
 * These mirror the private transforms in templates/index.ts but are exported.
 */
import type { Invoice } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { Quotation } from '@/types/quotation'
import type { Company } from '@/types/company'
import type { InvTemplateData, RecTemplateData, QuotTemplateData } from '@/types/template'
import type { LineItem } from '@/types/invoice'
import { dp, fmtAmount } from '@/utils/format'
import { num2words } from '@/utils/num2words'
import { esc } from '@/utils/esc'

export function transformInvDataExport(savedInv: Invoice | null, comp?: Company | null): InvTemplateData | null {
  if (!comp) return null
  const d = savedInv || {} as Invoice
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items: LineItem[] = d.items && d.items.length > 0 ? d.items : []
  const sub = d.subtotal || items.reduce((s, i) => s + i.amount, 0)
  const vp = d.vatPct || 0
  const va = d.vatAmt || (vp > 0 ? sub * vp / 100 : 0)
  const disc = d.discount || 0
  const grand = d.grand || sub + va - disc
  return {
    comp, cur, no: d.invNo || '', dt: d.date || '',
    cust: d.customer?.name || '', addr: d.customer?.address || '',
    ph: d.customer?.phone || '', cr: d.customer?.cr || '', em: d.customer?.email || '',
    notes: d.notes || '', pm: d.payMethod || '', ch: d.payDetails || '',
    bk: d.bankName || '', disc, sub, vp, va, grand,
    items, dp: dec,
    sv: fmtAmount(sub, dec), vv: fmtAmount(va, dec),
    dv: fmtAmount(disc, dec), gv: fmtAmount(grand, dec),
    gw: grand > 0 ? num2words(grand, cur) + ' only' : '',
    pd: [d.payMethod, d.payDetails].filter(Boolean).join(' - '),
  }
}

export function transformRecDataExport(savedRec: Receipt | null, comp?: Company | null): RecTemplateData | null {
  if (!comp) return null
  const d = savedRec || {} as Receipt
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items: LineItem[] = d.items && d.items.length > 0 ? d.items : []
  const amount = d.amount || items.reduce((s, i) => s + i.amount, 0)
  const wi = Math.floor(amount)
  const fr = Math.round((amount - wi) * Math.pow(10, dec))
  return {
    comp, cur, pc: comp.pcolor || '#D97706', ac: comp.acolor || '#1e293b',
    no: d.recNo || '', dt: d.date || '', rf: d.receivedFrom || '',
    items, am: amount, ww: d.amountWords || (amount > 0 ? num2words(amount, cur) + ' only' : ''),
    pm: d.payMethod || '', ch: d.chequeNo || '', bk: d.bankName || '',
    td: d.transDate || '', bg: d.being || '', rv: d.receiver || '', sg: d.signatory || '',
    dp: dec, wi, fr, amFmt: fmtAmount(amount, dec),
    chqHtml: d.chequeNo ? `<strong>Cheque:</strong> ${esc(d.chequeNo)}` : '',
  }
}

export function transformQuotDataExport(savedQuot: Quotation | null, comp?: Company | null): QuotTemplateData | null {
  if (!comp) return null
  const d = savedQuot || {} as Quotation
  const cur = comp.currency
  const dec = dp(cur.subPer)
  const items: LineItem[] = d.items && d.items.length > 0 ? d.items : []
  const sub = d.subtotal || items.reduce((s, i) => s + i.amount, 0)
  const vp = d.vatPct || 0
  const va = d.vatAmt || (vp > 0 ? sub * vp / 100 : 0)
  const disc = d.discount || 0
  const grand = d.grand || sub + va - disc
  return {
    comp, cur, no: d.quotNo || '', dt: d.date || '', validDt: d.validUntil || '',
    cust: d.customer?.name || '', addr: d.customer?.address || '',
    ph: d.customer?.phone || '', cr: d.customer?.cr || '', em: d.customer?.email || '',
    notes: d.notes || '', terms: d.terms || '', disc, sub, vp, va, grand,
    items, dp: dec,
    sv: fmtAmount(sub, dec), vv: fmtAmount(va, dec),
    dv: fmtAmount(disc, dec), gv: fmtAmount(grand, dec),
    gw: grand > 0 ? num2words(grand, cur) + ' only' : '',
  }
}
