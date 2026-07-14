import { esc } from '@/utils/esc'

export function watermarkWrap(html: string, text: string): string {
  if (!text) return html
  return html.replace(/<\/div>\s*$/, `<div style="position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:9999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(text)}</div></div>`)
}

export function genericDoc(
  d: any,
  title: string,
  dateHtml: string,
  extraBeforeFooter: string,
): string {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp
  const itemsRows = d.items.map((item: any, i: number) => `<tr>
    <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151">${i + 1}</td>
    <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;color:#1f2937">${esc(item.desc)}</td>
    <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151">${item.qty}</td>
    <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
    <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
  </tr>`).join('')

  return watermarkWrap(`
    <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151;position:relative;background:#fff;min-height:100vh;padding:15mm 20mm;display:flex;flex-direction:column">
      <div style="text-align:center;margin-bottom:10mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:80px;max-height:80px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto" /><br/>` : ''}
        <div style="font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:14px;color:#6b7280;margin-top:4px">${esc(c.sub)}</div>` : ''}
        <div style="font-size:12px;color:#64748b;margin-top:6px">${[c.loc, c.tel, c.mob, c.email].filter(Boolean).join(' \u00B7 ')}</div>
      </div>
      <div style="text-align:center;margin-bottom:10mm">
        <div style="font-size:14px;text-transform:uppercase;letter-spacing:3px;font-weight:600;color:${pc};margin-bottom:6px">${title}</div>
        <div style="font-size:14px;color:#6b7280">${dateHtml}</div>
      </div>
      <div style="margin-bottom:10mm;background:#f9fafb;padding:20px 24px;border-radius:8px">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#64748b;margin-bottom:6px">Bill To</div>
        <div style="font-weight:700;color:#111827;font-size:16px">${esc(d.cust)}</div>
        <div style="font-size:14px;color:#374151;margin-top:4px">${[d.addr, d.ph, d.em].filter(Boolean).join(' | ')}</div>
      </div>
      <table style="width:100%;border-collapse:separate;border-spacing:0;font-size:14px">
        <thead>
          <tr>
            <th style="padding:14px 18px;text-align:center;width:40px;background:${pc};color:#fff;border-top-left-radius:6px;border-bottom-left-radius:6px;font-weight:600">#</th>
            <th style="padding:14px 18px;text-align:left;background:${pc};color:#fff;font-weight:600">Description</th>
            <th style="padding:14px 18px;text-align:center;width:60px;background:${pc};color:#fff;font-weight:600">Qty</th>
            <th style="padding:14px 18px;text-align:right;width:100px;background:${pc};color:#fff;font-weight:600">Price</th>
            <th style="padding:14px 18px;text-align:right;width:100px;background:${pc};color:#fff;border-top-right-radius:6px;border-bottom-right-radius:6px;font-weight:600">Amount</th>
          </tr>
        </thead>
        <tbody>${itemsRows || '<tr><td colspan="5" style="padding:40px;text-align:center;color:#64748b;border-bottom:1px solid #e5e7eb">No items</td></tr>'}</tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10mm">
        <div>
          ${c.seal ? `<img src="${esc(c.seal)}" style="max-width:120px;max-height:120px;object-fit:contain" />` : ''}
        </div>
        <div style="text-align:right">
          <div style="display:inline-block;min-width:260px;text-align:right">
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6"><span style="color:#6b7280">Subtotal</span><span style="font-weight:500;color:#1f2937">${d.cur.symbol}${d.sv}</span></div>
            ${d.disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;color:#dc2626"><span>Discount</span><span style="font-weight:500">-${d.cur.symbol}${d.dv}</span></div>` : ''}
            ${d.vp > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6"><span style="color:#6b7280">VAT ${d.vp}%</span><span style="font-weight:500;color:#1f2937">${d.cur.symbol}${d.vv}</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:12px 0 8px;font-size:20px;font-weight:700;color:#111827"><span>Total</span><span>${d.cur.symbol}${d.gv}</span></div>
            <div style="font-size:12px;color:#64748b;font-style:italic;padding-top:6px">${esc(d.gw)}</div>
          </div>
        </div>
      </div>
      ${c.signature ? `
      <div style="margin-top:10mm;text-align:left">
        <img src="${esc(c.signature)}" style="max-width:140px;max-height:70px;object-fit:contain" />
        <div style="font-size:14px;color:#6b7280;border-top:1px solid #d1d5db;padding-top:6px;margin-top:6px;text-align:center;width:140px">Authorized Signature</div>
      </div>
      ` : ''}
      ${d.notes ? `<div style="margin-top:10mm;background:#f9fafb;padding:16px 20px;border-radius:6px;font-size:14px;color:#374151"><strong style="color:#111827">Notes:</strong> ${esc(d.notes)}</div>` : ''}
      ${extraBeforeFooter}
      <div style="flex:1;min-height:8mm"></div>
      <div style="border-top:1px solid #e5e7eb;padding-top:5mm;font-size:12px;color:#64748b;text-align:center">
        <span style="color:#6b7280;font-weight:500">${esc(c.name)}</span>${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
        ${c.invFooter ? `<div style="margin-top:6px">${esc(c.invFooter)}</div>` : ''}
      </div>
    </div>
  `, d.comp.watermark)
}
