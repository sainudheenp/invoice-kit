export { InvoiceClassic } from './Classic'
export { InvoiceModern } from './Modern'

import type { InvTemplateData } from '@/types/template'

export function InvoiceCompact(d: InvTemplateData) { return genericInvoice('Compact', d) }
export function InvoiceMinimal(d: InvTemplateData) { return genericInvoice('Minimal', d) }
export function InvoiceElegant(d: InvTemplateData) { return genericInvoice('Elegant', d) }
export function InvoiceBold(d: InvTemplateData) { return genericInvoice('Bold', d) }
export function InvoiceProfessional(d: InvTemplateData) { return genericInvoice('Professional', d) }

function genericInvoice(name: string, d: InvTemplateData): string {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp
  const itemsRows = d.items.map((item, i) => `<tr>
    <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i + 1}</td>
    <td style="padding:8px;border-bottom:1px solid #eee">${esc(item.desc)}</td>
    <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
    <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
    <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
  </tr>`).join('')

  return wrapHtml(`
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;min-height:100vh;padding:14mm 16mm">
      <div style="text-align:center;margin-bottom:6mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:80px;max-height:80px;margin-bottom:4px;display:block;margin-left:auto;margin-right:auto" /><br/>` : ''}
        <div style="font-size:18px;font-weight:700">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:12px;color:#666">${esc(c.sub)}</div>` : ''}
        <div style="font-size:11px;color:#999;margin-top:2px">${[c.loc, c.tel, c.email].filter(Boolean).join(' \u00B7 ')}</div>
      </div>
      <div style="text-align:center;margin-bottom:4mm">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:${pc}">Invoice</div>
        <div style="font-size:12px;color:#666">${esc(d.no)} | ${d.dt}${d.dueDt ? ' | Due: ' + d.dueDt : ''}</div>
      </div>
      <div style="margin-bottom:4mm">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999">Bill To</div>
        <div style="font-weight:600">${esc(d.cust)}</div>
        <div style="font-size:12px;color:#555">${[d.addr, d.ph, d.em].filter(Boolean).join(' | ')}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:${pc};color:#fff">
          <th style="padding:8px;text-align:center;width:30px">#</th>
          <th style="padding:8px;text-align:left">Description</th>
          <th style="padding:8px;text-align:center;width:60px">Qty</th>
          <th style="padding:8px;text-align:right;width:90px">Price</th>
          <th style="padding:8px;text-align:right;width:90px">Amount</th>
        </tr></thead>
        <tbody>${itemsRows || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#999">No items</td></tr>'}</tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:6mm">
        <div>
          ${c.seal ? `<img src="${esc(c.seal)}" style="max-width:120px;max-height:120px;object-fit:contain" />` : ''}
        </div>
        <div style="text-align:right">
          <div style="display:inline-block;min-width:200px;text-align:right">
            <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
            ${d.disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 0;color:red"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
            ${d.vp > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 0"><span>VAT ${d.vp}%</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
            <div style="border-top:2px solid #333;margin:3px 0"></div>
            <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:16px;font-weight:700"><span>Total</span><span>${d.cur.symbol}${d.gv}</span></div>
            <div style="font-size:11px;color:#666;font-style:italic;padding-top:4px">${esc(d.gw)}</div>
          </div>
        </div>
      </div>
      ${c.signature ? `
      <div style="margin-top:6mm;text-align:left">
        <img src="${esc(c.signature)}" style="max-width:140px;max-height:70px;object-fit:contain" />
        <div style="font-size:11px;color:#666;border-top:1px solid #999;padding-top:2px;margin-top:2px;text-align:center;width:140px">Authorized Signature</div>
      </div>
      ` : ''}
      ${d.notes ? `<div style="margin-top:4mm;font-size:12px"><strong>Notes:</strong> ${esc(d.notes)}</div>` : ''}
      ${c.invTerms ? `<div style="font-size:12px"><strong>Terms:</strong> ${esc(c.invTerms)}</div>` : ''}
      <div style="border-top:1px solid #ddd;margin-top:6mm;padding-top:3mm;font-size:11px;color:#666;text-align:center">${esc(c.name)}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</div>
      ${c.invFooter ? `<div style="font-size:11px;color:#666;text-align:center">${esc(c.invFooter)}</div>` : ''}
    </div>
  `, d.comp.watermark)
}

const esc = (s: string) => {
  const m: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return s.replace(/[&<>"']/g, (c) => m[c])
}
const wrapHtml = (html: string, wm: string) => wm ? html.replace('</div>', `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(wm)}</div></div>`) : html
