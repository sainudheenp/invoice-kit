import type { InvTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'

export function InvoiceModern(d: InvTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp
  const itemsRows = d.items.map((item, i) => `<tr${i % 2 === 1 ? ' style="background:#f8fafc"' : ''}>
    <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#4b5563">${i + 1}</td>
    <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#1f2937">${esc(item.desc)}</td>
    <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#4b5563">${item.qty}</td>
    <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;color:#4b5563">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
    <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#111827">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
  </tr>`).join('')

  return wrap(d, `
    <div style="position:relative;min-height:100vh;background:#fff;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151">
      <div style="position:absolute;top:0;left:0;width:8px;height:100%;background:linear-gradient(to bottom, ${pc}, ${pc}dd)"></div>
      <div style="padding:14mm 20mm 10mm 26mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;background:#f8fafc;border-radius:12px;padding:24px 28px;border:1px solid #f1f5f9">
          <div style="display:flex;align-items:center;gap:18px">
            ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:60px;max-height:60px;object-fit:contain" />` : ''}
            <div>
              <div style="font-size:26px;font-weight:700;color:#111827;letter-spacing:-0.5px">${esc(c.name)}</div>
              ${c.sub ? `<div style="font-size:14px;color:#6b7280;margin-top:4px">${esc(c.sub)}</div>` : ''}
              ${contactLine(c)}
            </div>
          </div>
          <div style="border-left:4px solid ${pc};padding-left:18px;text-align:right">
            <div style="font-size:14px;text-transform:uppercase;letter-spacing:2px;font-weight:600;color:${pc};margin-bottom:6px">INVOICE</div>
            <div style="font-size:18px;font-weight:700;color:#111827">${esc(d.no)}</div>
          </div>
        </div>
        <div style="display:flex;gap:6mm;margin-top:8mm">
          <div style="flex:1;background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #f1f5f9">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#94a3b8;margin-bottom:8px">Bill To</div>
            <div style="font-weight:700;color:#111827;font-size:16px">${esc(d.cust)}</div>
            <div style="font-size:14px;color:#4b5563;margin-top:6px">${[d.addr, d.ph, d.em].filter(Boolean).join('<br/>')}</div>
          </div>
          <div style="width:260px;text-align:right;font-size:13px;color:#4b5563;display:flex;flex-direction:column;justify-content:flex-end;background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #f1f5f9">
            <div style="margin-bottom:6px"><strong style="color:#111827">Date:</strong> ${d.dt}</div>
            ${c.vatReg ? `<div><strong style="color:#111827">VAT Reg.:</strong> ${esc(c.vatReg)}</div>` : ''}
          </div>
        </div>
        <table style="width:100%;border-collapse:separate;border-spacing:0;margin-top:8mm;font-size:13px;border:1px solid #f1f5f9;border-radius:10px;overflow:hidden">
          <thead><tr style="background:${pc};color:#fff">
            <th style="padding:12px 16px;text-align:left;font-weight:600;width:40px">#</th>
            <th style="padding:12px 16px;text-align:left;font-weight:600">Description</th>
            <th style="padding:12px 16px;text-align:center;width:60px;font-weight:600">Qty</th>
            <th style="padding:12px 16px;text-align:right;width:100px;font-weight:600">Price</th>
            <th style="padding:12px 16px;text-align:right;width:100px;font-weight:600">Amount</th>
          </tr></thead>
          <tbody>${itemsRows || '<tr><td colspan="5" style="padding:40px;text-align:center;color:#9ca3af">No items</td></tr>'}</tbody>
        </table>
        <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:10px;padding:20px 24px;margin-top:8mm;max-width:320px;margin-left:auto">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px"><span style="color:#6b7280">Subtotal</span><span style="font-weight:500;color:#1f2937">${d.cur.symbol}${d.sv}</span></div>
          ${d.disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#dc2626"><span>Discount</span><span style="font-weight:500">-${d.cur.symbol}${d.dv}</span></div>` : ''}
          ${d.vp > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px"><span style="color:#6b7280">VAT ${d.vp}%</span><span style="font-weight:500;color:#1f2937">${d.cur.symbol}${d.vv}</span></div>` : ''}
          <div style="border-top:1px dashed #d1d5db;margin:8px 0"></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:20px;font-weight:700;color:${pc}"><span>Total Due</span><span>${d.cur.symbol}${d.gv}</span></div>
          <div style="font-size:12px;color:#9ca3af;font-style:italic;padding-top:6px">${esc(d.gw)}</div>
        </div>
        ${d.notes || c.invTerms ? `<div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:10px;padding:20px 24px;margin-top:8mm;font-size:13px;color:#4b5563">${d.notes ? `<div style="margin-bottom:6px"><strong style="color:#111827">Notes:</strong> ${esc(d.notes)}</div>` : ''}${c.invTerms ? `<div><strong style="color:#111827">Terms:</strong> ${esc(c.invTerms)}</div>` : ''}</div>` : ''}
        ${sealSigBlock(c)}
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:4mm 20mm 4mm 26mm;font-size:12px;color:#9ca3af;display:flex;justify-content:space-between;background:#f8fafc">
        <span style="color:#6b7280;font-weight:500">${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}</span>
        <span>${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</span>
      </div>
      ${c.invFooter ? `<div style="text-align:center;font-size:12px;color:#9ca3af;padding:3mm 0">${esc(c.invFooter)}</div>` : ''}
    </div>
  `)
}

const contactLine = (c: any) => {
  const parts = [c.loc, c.tel, c.email].filter(Boolean)
  return parts.length ? `<div style="font-size:12px;color:#94a3b8;margin-top:6px">${parts.join(' \u00B7 ')}</div>` : ''
}

const sealSigBlock = (c: any) => {
  const items: string[] = []
  if (c.seal) items.push(`<div><img src="${esc(c.seal)}" style="max-width:90px;max-height:90px;object-fit:contain" /></div>`)
  if (c.signature) items.push(`<div style="text-align:center"><img src="${esc(c.signature)}" style="max-width:130px;max-height:65px;object-fit:contain;margin-bottom:6px" /><div style="font-size:12px;color:#6b7280;border-top:1px solid #d1d5db;padding-top:6px;width:150px;margin:0 auto">Authorized Signature</div></div>`)
  return items.length ? `<div style="display:flex;gap:28px;margin-top:8mm;align-items:flex-end">${items.join('')}</div>` : ''
}

const wrap = (d: InvTemplateData, html: string) => d.comp.watermark ? html.replace('</div>', watermarkDiv(d.comp.watermark)) : html
const watermarkDiv = (t: string) => `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(t)}</div></div>`
