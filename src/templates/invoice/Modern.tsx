import type { InvTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'

export function InvoiceModern(d: InvTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp
  const itemsRows = d.items.map((item, i) => `<tr>
    <td style="padding:8px 10px;border-bottom:1px solid #eee">${i + 1}</td>
    <td style="padding:8px 10px;border-bottom:1px solid #eee">${esc(item.desc)}</td>
    <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
    <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
    <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
  </tr>`).join('')

  return wrap(d, `
    <div style="position:relative;min-height:100vh;background:#fff;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333">
      <div style="position:absolute;top:0;left:0;width:5px;height:100%;background:${pc}"></div>
      <div style="padding:18mm 18mm 10mm 20mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;background:#f9fafb;border-radius:8px;padding:14px">
          <div style="display:flex;align-items:center;gap:12px">
            ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:50px;max-height:50px" />` : ''}
            <div><div style="font-size:17px;font-weight:700">${esc(c.name)}</div>${c.sub ? `<div style="font-size:12px;color:#666">${esc(c.sub)}</div>` : ''}${contactLine(c)}</div>
          </div>
          <div style="border-left:3px solid ${pc};padding-left:12px;text-align:right">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${pc}">INVOICE</div>
            <div style="font-size:16px;font-weight:700">${esc(d.no)}</div>
          </div>
        </div>
        <div style="display:flex;gap:6mm;margin-top:6mm">
          <div style="flex:1;background:#f9fafb;border-radius:8px;padding:12px">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999">Bill To</div>
            <div style="font-weight:600">${esc(d.cust)}</div>
            <div style="font-size:12px;color:#555">${[d.addr, d.ph, d.em].filter(Boolean).join('<br/>')}</div>
          </div>
          <div style="width:200px;text-align:right;font-size:12px">
            <div><strong>Date:</strong> ${d.dt}</div>
            ${d.dueDt ? `<div><strong>Due:</strong> ${d.dueDt}</div>` : ''}
            ${c.vatReg ? `<div><strong>VAT:</strong> ${esc(c.vatReg)}</div>` : ''}
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:6mm;font-size:13px;border-radius:8px;overflow:hidden">
          <thead><tr style="background:${pc};color:#fff">
            <th style="padding:10px 8px;text-align:left">#</th><th style="padding:10px 8px;text-align:left">Description</th><th style="padding:10px 8px;text-align:center;width:60px">Qty</th><th style="padding:10px 8px;text-align:right;width:90px">Price</th><th style="padding:10px 8px;text-align:right;width:90px">Amount</th>
          </tr></thead>
          <tbody>${itemsRows || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#999">No items</td></tr>'}</tbody>
        </table>
        <div style="background:#f9fafb;border:1px solid #eee;border-radius:8px;padding:12px;margin-top:6mm;max-width:280px;margin-left:auto">
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
          ${d.disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 0;color:red"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
          ${d.vp > 0 ? `<div style="display:flex;justify-content:space-between;padding:3px 0"><span>VAT ${d.vp}%</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
          <div style="border-top:1px dashed #ccc;margin:3px 0"></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0;font-size:16px;font-weight:700;color:${pc}"><span>Total Due</span><span>${d.cur.symbol}${d.gv}</span></div>
          <div style="font-size:11px;color:#666;font-style:italic;padding-top:4px">${esc(d.gw)}</div>
        </div>
        ${d.notes || c.invTerms ? `<div style="background:#f9fafb;border-radius:8px;padding:12px;margin-top:4mm;font-size:12px">${d.notes ? `<div><strong>Notes:</strong> ${esc(d.notes)}</div>` : ''}${c.invTerms ? `<div><strong>Terms:</strong> ${esc(c.invTerms)}</div>` : ''}</div>` : ''}
        ${sealSigBlock(c)}
      </div>
      <div style="border-top:1px solid #eee;padding:3mm 16mm;font-size:11px;color:#666;display:flex;justify-content:space-between">
        <span>${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}</span><span>${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</span>
      </div>
      ${c.invFooter ? `<div style="text-align:center;font-size:11px;color:#666;padding:2mm 0">${esc(c.invFooter)}</div>` : ''}
    </div>
  `)
}

const contactLine = (c: any) => {
  const parts = [c.loc, c.tel, c.email].filter(Boolean)
  return parts.length ? `<div style="font-size:11px;color:#999;margin-top:2px">${parts.join(' \u00B7 ')}</div>` : ''
}
const sealSigBlock = (c: any) => {
  const items: string[] = []
  if (c.seal) items.push(`<div><img src="${esc(c.seal)}" style="max-width:70px;max-height:70px" /></div>`)
  if (c.signature) items.push(`<div><img src="${esc(c.signature)}" style="max-width:90px;max-height:45px" /><div style="font-size:11px;color:#666;border-top:1px solid #999;padding-top:2px;margin-top:2px">Authorized Signature</div></div>`)
  return items.length ? `<div style="display:flex;gap:20px;margin-top:6mm">${items.join('')}</div>` : ''
}
const wrap = (d: InvTemplateData, html: string) => d.comp.watermark ? html.replace('</div>', watermarkDiv(d.comp.watermark)) : html
const watermarkDiv = (t: string) => `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(t)}</div></div>`
