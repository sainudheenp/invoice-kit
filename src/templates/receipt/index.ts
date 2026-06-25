export { ReceiptClassic } from './Classic'

import type { RecTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'

export function ReceiptModern(d: RecTemplateData) { return genericReceipt('Modern', d) }
export function ReceiptCompact(d: RecTemplateData) { return genericReceipt('Compact', d) }
export function ReceiptMinimal(d: RecTemplateData) { return genericReceipt('Minimal', d) }
export function ReceiptElegant(d: RecTemplateData) { return genericReceipt('Elegant', d) }
export function ReceiptBold(d: RecTemplateData) { return genericReceipt('Bold', d) }
export function ReceiptProfessional(d: RecTemplateData) { return genericReceipt('Professional', d) }

function genericReceipt(name: string, d: RecTemplateData): string {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp
  const wrap = (html: string) => d.comp.watermark
    ? html.replace('</div>', `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(d.comp.watermark)}</div></div>`)
    : html

  return wrap(`
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;min-height:100vh;padding:12mm 14mm">
      <div style="text-align:center;margin-bottom:6mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:50px;max-height:50px;margin-bottom:4px" /><br/>` : ''}
        <div style="font-size:17px;font-weight:700">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:12px;color:#666">${esc(c.sub)}</div>` : ''}
        <div style="font-size:11px;color:#999;margin-top:2px">${[c.loc, c.tel, c.email].filter(Boolean).join(' \u00B7 ')}</div>
      </div>
      <div style="text-align:center;margin-bottom:4mm">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:${pc}">${name} Receipt</div>
        <div style="font-size:12px;color:#666">${esc(d.no)} | ${d.dt}</div>
      </div>
      <div style="margin-bottom:4mm">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999">Received From</div>
        <div style="font-weight:600">${esc(d.rf)}</div>
      </div>
      <div style="background:#f9fafb;border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:4mm">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">Amount</div>
        <div style="font-size:12px;color:#666;font-style:italic">${esc(d.ww)}</div>
        <div style="font-size:24px;font-weight:700;color:${pc};margin-top:4px">${d.cur.symbol}${d.amFmt}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
        <div><strong>Payment:</strong> ${d.pm}</div>
        ${d.ch ? `<div><strong>Cheque:</strong> ${esc(d.ch)}</div>` : ''}
        ${d.bk ? `<div><strong>Bank:</strong> ${esc(d.bk)}</div>` : ''}
        ${d.td ? `<div><strong>Date:</strong> ${d.td}</div>` : ''}
        <div style="grid-column:1/-1"><strong>Purpose:</strong> ${esc(d.bg)}</div>
      </div>
      <div style="border-top:1px solid #ddd;margin-top:6mm;padding-top:3mm;display:flex;gap:20px">
        ${d.rv ? `<div><div style="border-top:1px solid #999;width:100px;padding-top:2px;font-size:12px;text-align:center">${esc(d.rv)}</div><div style="font-size:11px;color:#666;text-align:center">Receiver</div></div>` : ''}
        ${d.sg ? `<div><div style="border-top:1px solid #999;width:100px;padding-top:2px;font-size:12px;text-align:center">${esc(d.sg)}</div><div style="font-size:11px;color:#666;text-align:center">Signatory</div></div>` : ''}
      </div>
      <div style="border-top:1px solid #ddd;margin-top:6mm;padding-top:3mm;font-size:11px;color:#666;text-align:center">${esc(c.name)}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</div>
      ${c.bankName ? `<div style="font-size:11px;color:#666;text-align:center">${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).join(' | ')}</div>` : ''}
    </div>
  `)
}
