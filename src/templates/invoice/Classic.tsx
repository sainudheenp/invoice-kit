import type { InvTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'

export function InvoiceClassic(d: InvTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp
  const itemsRows = d.items.map((item, i) => (
    `<tr${i % 2 === 1 ? ' style="background:#fafafa"' : ''}>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center">${i + 1}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee">${esc(item.desc)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>`
  )).join('')

  const showAr = c.showArabic && c.nameAr
  const arabicBlock = showAr
    ? `<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:18px;font-weight:700">${esc(c.nameAr)}</div>${c.subAr ? `<div dir="rtl" unicode-bidi="embed" style="font-size:12px;color:#666">${esc(c.subAr)}</div>` : ''}</div>`
    : ''

  const contactParts = [c.loc, c.tel, c.mob, c.email].filter(Boolean)
  const contactStr = contactParts.length > 0 ? `<div style="font-size:11px;color:#666">${contactParts.join(' | ')}</div>` : ''

  return applyWrap(`
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2d2d2d;position:relative;background:#fff;min-height:100vh;padding:0">
      <div style="height:4px;background:${pc};width:100%"></div>
      <div style="padding:14mm 16mm 10mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:center;gap:12px">
            ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:55px;max-height:55px;object-fit:contain" />` : ''}
            <div>
              <div style="font-size:18px;font-weight:700">${esc(c.name)}</div>
              ${c.sub ? `<div style="font-size:12px;color:#666">${esc(c.sub)}</div>` : ''}
            </div>
          </div>
          ${arabicBlock}
        </div>
        ${contactStr}
      </div>
      <div style="border-bottom:1px solid #ddd;margin:0 16mm"></div>
      <div style="padding:6mm 16mm">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:16px;font-weight:700;color:${pc}">TAX INVOICE</div>
            ${showAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:12px;color:#999">\u0641\u0627\u062A\u0648\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629</div>' : ''}
          </div>
          <div style="text-align:right;font-size:12px">
            <div><strong>Invoice No.:</strong> ${esc(d.no)}</div>
            <div><strong>Date:</strong> ${d.dt}</div>
            <div><strong>Due Date:</strong> ${d.dueDt}</div>
            ${c.vatReg ? `<div><strong>VAT Reg.:</strong> ${esc(c.vatReg)}</div>` : ''}
          </div>
        </div>
      </div>
      <div style="border-bottom:1px solid #eee;margin:0 16mm"></div>
      <div style="padding:6mm 16mm">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px">Bill To${showAr ? ' / \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u062F' : ''}</div>
        <div style="font-weight:600">${esc(d.cust)}</div>
        ${d.addr ? `<div style="font-size:12px;color:#555">${esc(d.addr)}</div>` : ''}
        <div style="font-size:12px;color:#555">${[d.ph, d.cr, d.em].filter(Boolean).join(' | ')}</div>
      </div>
      <div style="padding:0 16mm">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:${pc};color:#fff">
              <th style="padding:10px 8px;text-align:center;width:30px">#</th>
              <th style="padding:10px 8px;text-align:left">Description${showAr ? ' / \u0627\u0644\u0628\u064A\u0627\u0646' : ''}</th>
              <th style="padding:10px 8px;text-align:center;width:60px">Qty${showAr ? ' / \u0627\u0644\u0643\u0645\u064A\u0629' : ''}</th>
              <th style="padding:10px 8px;text-align:right;width:100px">Price${showAr ? ' / \u0627\u0644\u0633\u0639\u0631' : ''}</th>
              <th style="padding:10px 8px;text-align:right;width:100px">Amount${showAr ? ' / \u0627\u0644\u0645\u0628\u0644\u063A' : ''}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="5" style="padding:20px;text-align:center;color:#999">No items</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="padding:6mm 16mm;display:flex;justify-content:flex-end">
        <div style="min-width:240px;text-align:right">
          <div style="display:flex;justify-content:space-between;padding:4px 0"><span>Subtotal:</span><span>${d.cur.symbol}${d.sv}</span></div>
          ${d.disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;color:red"><span>Discount:</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
          ${d.vp > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0"><span>VAT (${d.vp}%):</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
          <div style="border-top:2px solid #333;margin:4px 0"></div>
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:16px;font-weight:700"><span>Total Due:</span><span>${d.cur.symbol}${d.gv}</span></div>
          <div style="font-size:11px;color:#666;font-style:italic;padding-top:4px">${esc(d.gw)}</div>
        </div>
      </div>
      <div style="padding:0 16mm">
        ${d.pd ? `<div style="font-size:12px;margin-bottom:4px"><strong>Payment:</strong> ${esc(d.pd)}</div>` : ''}
        ${d.notes ? `<div style="font-size:12px;margin-bottom:4px"><strong>Notes:</strong> ${esc(d.notes)}</div>` : ''}
        ${c.invTerms ? `<div style="font-size:12px;margin-bottom:4px"><strong>Terms:</strong> ${esc(c.invTerms)}</div>` : ''}
      </div>
      <div style="padding:6mm 16mm;display:flex;gap:20px;align-items:flex-end">
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:80px;max-height:80px;object-fit:contain" /></div>` : ''}
        ${c.signature ? `<div><img src="${esc(c.signature)}" style="max-width:100px;max-height:50px;object-fit:contain" /><div style="font-size:11px;color:#666;border-top:1px solid #999;padding-top:2px;margin-top:2px">Authorized Signature${showAr ? ' / \u0627\u0644\u062A\u0648\u0642\u064A\u0639' : ''}</div></div>` : ''}
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:4mm 16mm;border-top:1px solid #ddd;font-size:11px;color:#666;display:flex;justify-content:space-between">
        <span>${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}</span>
        <span>${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</span>
      </div>
      ${c.invFooter ? `<div style="position:absolute;bottom:10mm;left:16mm;right:16mm;font-size:11px;color:#666;text-align:center">${esc(c.invFooter)}</div>` : ''}
    </div>
  `, d.comp.watermark)
}

function applyWrap(html: string, watermark: string): string {
  if (!watermark) return html
  return html.replace('</div>', `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(watermark)}</div></div>`)
}
