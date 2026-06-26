import type { InvTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

const DB = '#476694'
const LB = '#D6E4F0'
const RD = '#E81818'
const GR = '#CCCCCC'

export function InvoiceBeirak(d: InvTemplateData) {
  const c = d.comp
  const itemsRows = d.items.map((item, i) => `
    <tr>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:center">${i + 1}</td>
      <td style="padding:6px 4px;border:1px solid ${GR}">${esc(item.desc)}</td>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:center">${item.qty}</td>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:right">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:right">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  return watermarkWrap(`
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;min-height:100vh;padding:0">
      <div style="text-align:center;padding-top:8mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:70px;max-height:70px;margin-bottom:4px" />` : ''}
        <div style="font-size:18px;font-weight:700;color:${DB}">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:13px;color:#000;margin-top:1px">${esc(c.sub)}</div>` : ''}
      </div>
      <div style="text-align:center;margin:4mm auto;background:${LB};border:1px solid ${DB};border-radius:6px;padding:2mm 6mm;display:inline-block;width:auto">
        <div style="font-size:13px;font-weight:700;color:${RD};letter-spacing:1px">TAX INVOICE</div>
      </div>
      <div style="border-bottom:2px solid ${DB};margin:0 12mm 4mm"></div>
      <div style="padding:0 12mm;display:flex;gap:4mm">
        <table style="width:48%;border-collapse:collapse;font-size:12px">
          ${[
            ['Invoice No.', esc(d.no)],
            ['Date', d.dt],
            ['Prepared By', esc(c.name)],
          ].map(([l, v]) => `
            <tr>
              <td style="padding:3px 6px;border:1px solid ${GR};background:${LB};font-weight:600;width:40%">${l}</td>
              <td style="padding:3px 6px;border:1px solid ${GR}">${v}</td>
            </tr>
          `).join('')}
        </table>
        <table style="width:48%;border-collapse:collapse;font-size:12px">
          ${[
            ['Party', esc(d.cust)],
            ['Address', esc(d.addr)],
            ...(d.cr ? [['CR', esc(d.cr)]] : []),
          ].map(([l, v]) => `
            <tr>
              <td style="padding:3px 6px;border:1px solid ${GR};background:${LB};font-weight:600;width:40%">${l}</td>
              <td style="padding:3px 6px;border:1px solid ${GR}">${v}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      <div style="padding:4mm 12mm">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:${DB};color:#fff">
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:center">#</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:left">Description</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:center">Qty</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:right">Price</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#999;border:1px solid #ccc">No items</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="padding:0 12mm;display:flex;justify-content:flex-end">
        <table style="width:220px;border-collapse:collapse;font-size:12px">
          <tr style="background:${LB}"><td style="padding:4px 8px;border:1px solid ${GR};font-weight:600">Subtotal</td><td style="padding:4px 8px;border:1px solid ${GR};text-align:right">${d.cur.symbol}${d.sv}</td></tr>
          ${d.disc > 0 ? `<tr><td style="padding:4px 8px;border:1px solid ${GR};font-weight:600;color:red">Discount</td><td style="padding:4px 8px;border:1px solid ${GR};text-align:right;color:red">-${d.cur.symbol}${d.dv}</td></tr>` : ''}
          ${d.vp > 0 ? `<tr style="background:${LB}"><td style="padding:4px 8px;border:1px solid ${GR};font-weight:600">VAT (${d.vp}%)</td><td style="padding:4px 8px;border:1px solid ${GR};text-align:right">${d.cur.symbol}${d.vv}</td></tr>` : ''}
          <tr style="background:${DB};color:#fff">
            <td style="padding:6px 8px;border:1px solid ${GR};font-weight:700;font-size:14px">Grand Total</td>
            <td style="padding:6px 8px;border:1px solid ${GR};text-align:right;font-weight:700;font-size:14px">${d.cur.symbol}${d.gv}</td>
          </tr>
        </table>
      </div>
      ${d.gw ? `<div style="padding:2mm 12mm;font-size:12px;color:#666;font-style:italic;text-align:right">${esc(d.gw)}</div>` : ''}
      <div style="padding:0 12mm;display:flex;gap:20px;margin-top:4mm;align-items:flex-end">
        <div style="flex:1">
          <div style="font-size:11px;color:#666">Prepared By</div>
          <div style="border-top:1px solid #333;width:100px;padding-top:2px;margin-top:2px;font-size:12px">Accounts Department</div>
        </div>
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:70px;max-height:70px" /></div>` : ''}
        ${c.signature ? `<div style="text-align:center"><img src="${esc(c.signature)}" style="max-width:90px;max-height:45px" /><div style="font-size:11px;color:#666;border-top:1px solid #999;padding-top:2px;margin-top:2px">Authorized Signature</div></div>` : ''}
        <div style="flex:1;text-align:right">
          <div style="font-size:11px;color:#666">Authorized By</div>
          <div style="border-top:1px solid #333;width:100px;padding-top:2px;margin-top:2px;margin-left:auto;font-size:12px">${esc(c.name)}</div>
        </div>
      </div>
      <div style="border-top:1px solid ${DB};margin:6mm 12mm 0;padding-top:3mm;font-size:11px;color:#666;text-align:center">
        TAX INVOICE | ${esc(c.name)}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
      </div>
      ${c.loc ? `<div style="font-size:11px;color:#666;text-align:center">${esc(c.loc)}</div>` : ''}
    </div>
  `, d.comp.watermark)
}
