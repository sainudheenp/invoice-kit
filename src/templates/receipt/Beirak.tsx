import type { RecTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

const DB = '#476694'
const LB = '#f1f5f9'
const GR = '#e5e7eb'

export function ReceiptBeirak(d: RecTemplateData) {
  const c = d.comp

  const itemsRows = d.items.length > 0 ? d.items.map((item, i) => `
    <tr${i % 2 === 1 ? ` style="background:${LB}"` : ''}>
      <td style="padding:8px 12px;border:1px solid ${GR};text-align:center;color:#374151">${i + 1}</td>
      <td style="padding:8px 12px;border:1px solid ${GR};color:#1f2937">${esc(item.desc)}</td>
      <td style="padding:8px 12px;border:1px solid ${GR};text-align:center;color:#374151">${item.qty}</td>
      <td style="padding:8px 12px;border:1px solid ${GR};text-align:right;color:#374151">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:8px 12px;border:1px solid ${GR};text-align:right;color:#111827;font-weight:600">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('') : ''

  return watermarkWrap(`
    <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151;position:relative;background:#fff;min-height:100vh;padding:0">
      <div style="text-align:center;padding:10mm 16mm 6mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:80px;max-height:80px;margin-bottom:10px" />` : ''}
        <div style="font-size:24px;font-weight:700;color:${DB};letter-spacing:-0.5px">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:14px;color:#374151;margin-top:4px">${esc(c.sub)}</div>` : ''}
      </div>
      <div style="border-bottom:2px solid ${DB};margin:0 16mm 4mm"></div>
      <div style="text-align:center;margin:4mm auto 6mm">
        <div style="display:inline-block;background:${LB};border:2px solid ${DB};border-radius:8px;padding:8px 24px">
          <div style="font-size:15px;font-weight:700;color:${DB};letter-spacing:2px">RECEIPT VOUCHER</div>
        </div>
      </div>
      <div style="border-bottom:1px solid ${GR};margin:0 16mm 6mm"></div>
      <div style="padding:0 16mm;display:flex;gap:6mm">
        <table style="width:50%;border-collapse:collapse;font-size:14px">
          ${[
            ['Receipt No.', esc(d.no)],
            ['Date', d.dt],
          ].map(([l, v]) => `
            <tr>
              <td style="padding:8px 14px;border:1px solid ${GR};background:${LB};font-weight:600;color:${DB};width:40%">${l}</td>
              <td style="padding:8px 14px;border:1px solid ${GR};color:#1f2937">${v}</td>
            </tr>
          `).join('')}
        </table>
        <table style="width:50%;border-collapse:collapse;font-size:14px">
          ${[
            ['Received From', esc(d.rf)],
            ...(d.bk ? [['Bank', esc(d.bk)]] : []),
            ['Payment', [d.pm, d.ch].filter(Boolean).join(' - ')],
          ].map(([l, v]) => `
            <tr>
              <td style="padding:8px 14px;border:1px solid ${GR};background:${LB};font-weight:600;color:${DB};width:40%">${l}</td>
              <td style="padding:8px 14px;border:1px solid ${GR};color:#1f2937">${v}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      ${itemsRows ? `
      <div style="padding:6mm 16mm">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:${DB};color:#fff">
              <th style="padding:10px 12px;border:1px solid ${DB};text-align:center;font-weight:600">#</th>
              <th style="padding:10px 12px;border:1px solid ${DB};text-align:left;font-weight:600">Description</th>
              <th style="padding:10px 12px;border:1px solid ${DB};text-align:center;font-weight:600">Qty</th>
              <th style="padding:10px 12px;border:1px solid ${DB};text-align:right;font-weight:600">Price</th>
              <th style="padding:10px 12px;border:1px solid ${DB};text-align:right;font-weight:600">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>
      ` : ''}
      <div style="padding:0 16mm;display:flex;justify-content:flex-end">
        <table style="width:240px;border-collapse:collapse;font-size:14px">
          <tr style="background:${DB};color:#fff">
            <td style="padding:12px 16px;border:1px solid ${DB};font-weight:600">Amount</td>
            <td style="padding:12px 16px;border:1px solid ${DB};text-align:right;font-weight:700;font-size:18px">${d.cur.symbol}${d.amFmt}</td>
          </tr>
        </table>
      </div>
      ${d.ww ? `<div style="padding:4mm 16mm 0;font-size:12px;color:#6b7280;font-style:italic;text-align:right">${esc(d.ww)}</div>` : ''}
      ${d.bg ? `<div style="padding:2mm 16mm;font-size:14px;color:#374151"><strong style="color:#111827">Purpose:</strong> ${esc(d.bg)}</div>` : ''}
      <div style="padding:0 16mm;display:flex;gap:24px;margin-top:8mm;align-items:flex-end">
        <div style="flex:1">
          ${d.rv ? `<div style="border-top:2px solid ${DB};width:160px;padding-top:6px;font-size:14px;color:#374151;text-align:center">${esc(d.rv)}</div><div style="font-size:12px;color:#6b7280;text-align:center;margin-top:4px">Receiver</div>` : ''}
        </div>
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:90px;max-height:90px;object-fit:contain" /></div>` : ''}
        ${c.signature ? `<div style="text-align:center"><img src="${esc(c.signature)}" style="max-width:120px;max-height:60px;object-fit:contain;margin-bottom:6px" /><div style="font-size:12px;color:#6b7280;border-top:2px solid ${DB};padding-top:6px;width:160px">Authorized Signature</div></div>` : ''}
        <div style="flex:1;text-align:right">
          ${d.sg ? `<div style="border-top:2px solid ${DB};width:160px;padding-top:6px;margin-left:auto;font-size:14px;color:#374151;text-align:center">${esc(d.sg)}</div><div style="font-size:12px;color:#6b7280;text-align:center;margin-top:4px">Signatory</div>` : ''}
        </div>
      </div>
      <div style="border-top:2px solid ${DB};margin:6mm 16mm 0;padding-top:4mm;font-size:12px;color:#6b7280;text-align:center">
        ${esc(c.name)}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
      </div>
      ${c.loc ? `<div style="font-size:12px;color:#6b7280;text-align:center">${esc(c.loc)}</div>` : ''}
    </div>
  `, d.comp.watermark)
}
