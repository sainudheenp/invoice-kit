import type { InvTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

const DB = '#476694'
const LB = '#f1f5f9'
const RD = '#dc2626'
const GR = '#e5e7eb'

export function InvoiceBeirak(d: InvTemplateData) {
  const c = d.comp
  const itemsRows = d.items.map((item, i) => `
    <tr${i % 2 === 1 ? ` style="background:${LB}"` : ''}>
      <td style="padding:12px 16px;border-bottom:1px solid ${GR};border-right:1px solid ${GR};border-left:1px solid ${GR};text-align:center;color:#374151">${i + 1}</td>
      <td style="padding:12px 16px;border-bottom:1px solid ${GR};border-right:1px solid ${GR};color:#1f2937">${esc(item.desc)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid ${GR};border-right:1px solid ${GR};text-align:center;color:#374151">${item.qty}</td>
      <td style="padding:12px 16px;border-bottom:1px solid ${GR};border-right:1px solid ${GR};text-align:right;color:#374151">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid ${GR};border-right:1px solid ${GR};text-align:right;font-weight:600;color:#111827">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  return watermarkWrap(`
    <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151;position:relative;background:#fff;min-height:100vh;padding:0;display:flex;flex-direction:column">
      <div style="text-align:center;padding:10mm 16mm 6mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:80px;max-height:80px;margin-bottom:10px" />` : ''}
        <div style="font-size:24px;font-weight:700;color:${DB};letter-spacing:-0.5px">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:14px;color:#374151;margin-top:4px">${esc(c.sub)}</div>` : ''}
      </div>
      <div style="text-align:center;margin:4mm 0 6mm">
        <div style="display:inline-block;background:${LB};border:2px solid ${DB};border-radius:8px;padding:8px 24px">
          <div style="font-size:15px;font-weight:700;color:${RD};letter-spacing:2px">TAX INVOICE</div>
        </div>
      </div>
      <div style="border-bottom:2px solid ${DB};margin:0 16mm 6mm"></div>
      <div style="padding:0 16mm;display:flex;gap:6mm">
        <table style="width:50%;border-collapse:collapse;font-size:14px">
          ${[
            ['Invoice No.', esc(d.no)],
            ['Date', d.dt],
            ['Prepared By', esc(c.name)],
          ].map(([l, v]) => `
            <tr>
              <td style="padding:8px 14px;border:1px solid ${GR};background:${LB};font-weight:600;color:${DB};width:35%">${l}</td>
              <td style="padding:8px 14px;border:1px solid ${GR};color:#1f2937">${v}</td>
            </tr>
          `).join('')}
        </table>
        <table style="width:50%;border-collapse:collapse;font-size:14px">
          ${[
            ['Party', esc(d.cust)],
            ['Address', esc(d.addr)],
            ...(d.cr ? [['CR', esc(d.cr)]] : []),
          ].map(([l, v]) => `
            <tr>
              <td style="padding:8px 14px;border:1px solid ${GR};background:${LB};font-weight:600;color:${DB};width:35%">${l}</td>
              <td style="padding:8px 14px;border:1px solid ${GR};color:#1f2937">${v}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      <div style="padding:6mm 16mm">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:${DB};color:#fff">
              <th style="padding:12px 14px;border:1px solid ${DB};text-align:center;font-weight:600">#</th>
              <th style="padding:12px 14px;border:1px solid ${DB};text-align:left;font-weight:600">Description</th>
              <th style="padding:12px 14px;border:1px solid ${DB};text-align:center;font-weight:600">Qty</th>
              <th style="padding:12px 14px;border:1px solid ${DB};text-align:right;font-weight:600">Price</th>
              <th style="padding:12px 14px;border:1px solid ${DB};text-align:right;font-weight:600">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="5" style="padding:40px;text-align:center;color:#64748b;border:1px solid #e5e7eb">No items</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="padding:0 16mm;display:flex;justify-content:flex-end">
        <table style="width:280px;border-collapse:collapse;font-size:14px">
          <tr style="background:${LB}"><td style="padding:12px 16px;border:1px solid ${GR};font-weight:600;color:${DB}">Subtotal</td><td style="padding:12px 16px;border:1px solid ${GR};text-align:right;color:#1f2937">${d.cur.symbol}${d.sv}</td></tr>
          ${d.disc > 0 ? `<tr><td style="padding:12px 16px;border:1px solid ${GR};font-weight:600;color:${RD}">Discount</td><td style="padding:12px 16px;border:1px solid ${GR};text-align:right;color:${RD}">-${d.cur.symbol}${d.dv}</td></tr>` : ''}
          ${d.vp > 0 ? `<tr style="background:${LB}"><td style="padding:12px 16px;border:1px solid ${GR};font-weight:600;color:${DB}">VAT (${d.vp}%)</td><td style="padding:12px 16px;border:1px solid ${GR};text-align:right;color:#1f2937">${d.cur.symbol}${d.vv}</td></tr>` : ''}
          <tr style="background:${DB};color:#fff">
            <td style="padding:12px 14px;border:1px solid ${DB};font-weight:700;font-size:16px">Grand Total</td>
            <td style="padding:12px 14px;border:1px solid ${DB};text-align:right;font-weight:700;font-size:16px">${d.cur.symbol}${d.gv}</td>
          </tr>
        </table>
      </div>
      ${d.gw ? `<div style="padding:4mm 16mm 0;font-size:12px;color:#6b7280;font-style:italic;text-align:right">${esc(d.gw)}</div>` : ''}
      <div style="padding:0 16mm;display:flex;gap:24px;margin-top:8mm;align-items:flex-end">
        <div style="flex:1">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Prepared By</div>
          <div style="border-top:2px solid ${DB};width:160px;padding-top:6px;font-size:14px;color:#374151">Accounts Department</div>
        </div>
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:90px;max-height:90px;object-fit:contain" /></div>` : ''}
        ${c.signature ? `<div style="text-align:center"><img src="${esc(c.signature)}" style="max-width:120px;max-height:60px;object-fit:contain;margin-bottom:6px" /><div style="font-size:12px;color:#6b7280;border-top:2px solid ${DB};padding-top:6px;width:160px">Authorized Signature</div></div>` : ''}
        <div style="flex:1;text-align:right">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Authorized By</div>
          <div style="border-top:2px solid ${DB};width:160px;padding-top:6px;margin-left:auto;font-size:14px;color:#374151">${esc(c.name)}</div>
        </div>
      </div>
      <div style="flex:1;min-height:4mm"></div>
      <div style="border-top:2px solid ${DB};padding:5mm 16mm;font-size:12px;color:#6b7280;text-align:center;background:#f8fafc">
        <span style="font-weight:600;color:${DB}">TAX INVOICE</span> | ${esc(c.name)}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
        ${c.loc ? `<div style="margin-top:4px">${esc(c.loc)}</div>` : ''}
      </div>
    </div>
  `, d.comp.watermark)
}
