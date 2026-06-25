import type { Company } from '@/types/company'
import type { Invoice, LineItem } from '@/types/invoice'
import type { Receipt } from '@/types/receipt'
import type { InvTemplateData, RecTemplateData } from '@/types/template'
import { num2words, dp, fmtAmount, esc } from '@/utils'

export function getInvDocData(savedInv: Invoice | null, comp?: Company | null): InvTemplateData | null {
  const c = comp || null
  if (!c) return null
  const cur = c.currency
  const d = dp(cur.subPer)
  const saved = savedInv

  const items: LineItem[] = saved
    ? saved.items
    : []

  const subtotal = saved ? saved.subtotal : items.reduce((s, i) => s + i.amount, 0)
  const vatPct = saved ? saved.vatPct : 0
  const vatAmt = saved ? saved.vatAmt : (vatPct > 0 ? subtotal * vatPct / 100 : 0)
  const discount = saved ? saved.discount : 0
  const grand = saved ? saved.grand : (subtotal - discount + vatAmt)

  return {
    comp: c,
    cur,
    no: saved?.invNo || '',
    dt: saved?.date || '',
    dueDt: saved?.dueDate || '',
    cust: saved?.customer?.name || '',
    addr: saved?.customer?.address || '',
    ph: saved?.customer?.phone || '',
    cr: saved?.customer?.cr || '',
    em: saved?.customer?.email || '',
    notes: saved?.notes || '',
    pm: saved?.payMethod || '',
    ch: saved?.payDetails || '',
    bk: saved?.bankName || '',
    disc: discount,
    sub: subtotal,
    vp: vatPct,
    va: vatAmt,
    grand,
    items,
    dp: d,
    sv: fmtAmount(subtotal, d),
    vv: fmtAmount(vatAmt, d),
    dv: fmtAmount(discount, d),
    gv: fmtAmount(grand, d),
    gw: grand > 0 ? num2words(grand, cur) + ' only' : '',
    pd: saved?.payMethod ? [saved.payMethod, saved.payDetails].filter(Boolean).join(' - ') : '',
  }
}

export function getRecDocData(savedRec: Receipt | null, comp?: Company | null): RecTemplateData | null {
  const c = comp || null
  if (!c) return null
  const cur = c.currency
  const d = dp(cur.subPer)
  const saved = savedRec

  const amount = saved?.amount || 0
  const whole = Math.floor(amount)
  const frac = Math.round((amount - whole) * cur.subPer)

  return {
    comp: c,
    cur,
    pc: c.pcolor,
    ac: c.acolor,
    no: saved?.recNo || '',
    dt: saved?.date || '',
    rf: saved?.receivedFrom || '',
    am: amount,
    ww: saved?.amountWords || (amount > 0 ? num2words(amount, cur) + ' only' : ''),
    pm: saved?.payMethod || '',
    ch: saved?.chequeNo || '',
    bk: saved?.bankName || '',
    td: saved?.transDate || '',
    bg: saved?.being || '',
    rv: saved?.receiver || '',
    sg: saved?.signatory || '',
    dp: d,
    wi: whole,
    fr: frac,
    amFmt: fmtAmount(amount, d),
    chqHtml: saved?.payMethod === 'Cheque' && saved?.chequeNo ? `Cheque: ${esc(saved.chequeNo)}` : '',
  }
}

export function applyWatermark(html: string, text: string): string {
  if (!text) return html
  const wm = `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(text)}</div>`
  return html.replace('</div>', wm + '</div>')
}
