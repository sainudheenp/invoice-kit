export { ReceiptClassic } from './Classic'
export { ReceiptBeirak } from './Beirak'

import type { RecTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

export { ReceiptModern } from './Modern'
export function ReceiptCompact(d: RecTemplateData) { return genericReceipt('Compact', d) }
export function ReceiptMinimal(d: RecTemplateData) { return genericReceipt('Minimal', d) }
export function ReceiptElegant(d: RecTemplateData) { return genericReceipt('Elegant', d) }
export function ReceiptBold(d: RecTemplateData) { return genericReceipt('Bold', d) }
export function ReceiptProfessional(d: RecTemplateData) { return genericReceipt('Professional', d) }

function genericReceipt(_name: string, d: RecTemplateData): string {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp

  const itemsHtml = d.items.length > 0 ? `
    <table style="width:100%;border-collapse:separate;border-spacing:0;font-size:14px;margin-bottom:4mm">
      <thead>
        <tr style="border-bottom:2px solid #e5e7eb;font-size:11px;color:#64748b;text-transform:uppercase">
          <th style="padding:14px 18px;text-align:left;border-bottom:2px solid #e5e7eb">#</th>
          <th style="padding:14px 18px;text-align:left;border-bottom:2px solid #e5e7eb">Description</th>
          <th style="padding:14px 18px;text-align:center;width:60px;border-bottom:2px solid #e5e7eb">Qty</th>
          <th style="padding:14px 18px;text-align:right;width:100px;border-bottom:2px solid #e5e7eb">Price</th>
          <th style="padding:14px 18px;text-align:right;width:100px;border-bottom:2px solid #e5e7eb">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${d.items.map((item, i) => `
          <tr style="${i % 2 === 1 ? 'background:#f8fafc;' : ''}border-bottom:1px solid #e5e7eb">
            <td style="padding:12px 18px;color:#64748b">${i + 1}</td>
            <td style="padding:12px 18px;color:#1f2937">${esc(item.desc)}</td>
            <td style="padding:12px 18px;text-align:center;color:#374151">${item.qty}</td>
            <td style="padding:12px 18px;text-align:right;color:#374151">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
            <td style="padding:12px 18px;text-align:right;font-weight:600;color:#111827">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : ''

  return watermarkWrap(`
    <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151;position:relative;background:#fff;min-height:100vh;padding:15mm 20mm;display:flex;flex-direction:column">
      <div style="text-align:center;margin-bottom:10mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:80px;max-height:80px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto" /><br/>` : ''}
        <div style="font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:14px;color:#6b7280;margin-top:4px">${esc(c.sub)}</div>` : ''}
        <div style="font-size:12px;color:#64748b;margin-top:6px">${[c.loc, c.tel, c.mob, c.email].filter(Boolean).join(' \u00B7 ')}</div>
      </div>
      <div style="text-align:center;margin-bottom:10mm">
        <div style="font-size:14px;text-transform:uppercase;letter-spacing:3px;font-weight:600;color:${pc};margin-bottom:6px">Receipt</div>
        <div style="font-size:14px;color:#6b7280">${esc(d.no)} | ${d.dt}</div>
      </div>
      <div style="margin-bottom:10mm;background:#f9fafb;padding:20px 24px;border-radius:8px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#64748b;margin-bottom:6px">Received From</div>
        <div style="font-weight:700;color:#111827;font-size:16px">${esc(d.rf)}</div>
      </div>
      ${itemsHtml}
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:4mm">
        <div>
          ${c.seal ? `<img src="${esc(c.seal)}" style="max-width:120px;max-height:120px;object-fit:contain" />` : ''}
        </div>
        <div style="text-align:right">
          <div style="display:inline-block;min-width:260px;text-align:right">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6"><span style="color:#6b7280">Amount</span><span style="font-weight:500;color:#1f2937">${d.cur.symbol}${d.amFmt}</span></div>
            <div style="font-size:12px;color:#64748b;font-style:italic;padding-top:6px">${esc(d.ww)}</div>
          </div>
        </div>
      </div>
      <div style="margin-top:6mm;background:#f9fafb;padding:16px 20px;border-radius:6px;font-size:14px;color:#374151;display:grid;gap:6px">
        <div><strong style="color:#111827">Payment:</strong> ${esc(d.pm)}</div>
        ${d.ch ? `<div><strong style="color:#111827">Cheque:</strong> ${esc(d.ch)}</div>` : ''}
        ${d.bk ? `<div><strong style="color:#111827">Bank:</strong> ${esc(d.bk)}</div>` : ''}
        ${d.td ? `<div><strong style="color:#111827">Date:</strong> ${esc(d.td)}</div>` : ''}
        <div><strong style="color:#111827">Purpose:</strong> ${esc(d.bg)}</div>
      </div>
      ${c.signature ? `
      <div style="margin-top:6mm;text-align:left">
        <img src="${esc(c.signature)}" style="max-width:140px;max-height:70px;object-fit:contain" />
        <div style="font-size:14px;color:#6b7280;border-top:1px solid #d1d5db;padding-top:6px;margin-top:6px;text-align:center;width:140px">Authorized Signature</div>
      </div>
      ` : ''}
      <div style="flex:1;min-height:8mm"></div>
      <div style="border-top:1px solid #e5e7eb;padding-top:5mm;font-size:12px;color:#64748b;text-align:center">
        <span style="color:#6b7280;font-weight:500">${esc(c.name)}</span>${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
      </div>
    </div>
  `, d.comp.watermark)
}
