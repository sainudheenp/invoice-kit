import type { InvTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

export function InvoiceClassic(d: InvTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp

  const itemsRows = d.items.map((item, i) => (
    `<tr${i % 2 === 1 ? ' style="background:#f8fafc"' : ''}>
      <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151">${i + 1}</td>
      <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;color:#1f2937">${esc(item.desc)}</td>
      <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151">${item.qty}</td>
      <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>`
  )).join('')

  const showAr = c.showArabic && c.nameAr
  const arabicBlock = showAr
    ? `<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:18px;font-weight:700;color:#111827">${esc(c.nameAr)}</div>${c.subAr ? `<div dir="rtl" unicode-bidi="embed" style="font-size:14px;color:#6b7280">${esc(c.subAr)}</div>` : ''}</div>`
    : ''

  const contactParts = [c.loc, c.tel, c.mob, c.email].filter(Boolean)
  const contactStr = contactParts.length > 0 ? `<div style="font-size:12px;color:#64748b;margin-top:6px">${contactParts.join(' \u00B7 ')}</div>` : ''

  return watermarkWrap(`
    <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151;position:relative;background:#fff;min-height:100vh;padding:0;display:flex;flex-direction:column">
      <div style="height:6px;background:${pc};width:100%"></div>
      <div style="padding:14mm 20mm 8mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:center;gap:18px">
            ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:65px;max-height:65px;object-fit:contain" />` : ''}
            <div>
              <div style="font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px">${esc(c.name)}</div>
              ${c.sub ? `<div style="font-size:14px;color:#6b7280;margin-top:2px">${esc(c.sub)}</div>` : ''}
              ${contactStr}
            </div>
          </div>
          ${arabicBlock}
        </div>
      </div>
      <div style="border-bottom:1px solid #e5e7eb;margin:0 20mm"></div>
      <div style="padding:8mm 20mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <div>
            <div style="font-size:20px;font-weight:700;letter-spacing:1px;color:${pc};text-transform:uppercase">TAX INVOICE</div>
            ${showAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:16px;color:#64748b;margin-top:4px">\u0641\u0627\u062A\u0648\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629</div>' : ''}
          </div>
          <div style="text-align:right;font-size:14px;color:#374151;background:#f9fafb;padding:12px 20px;border-radius:6px">
            <div style="margin-bottom:4px"><strong style="color:#111827">Invoice No.:</strong> ${esc(d.no)}</div>
            <div style="margin-bottom:4px"><strong style="color:#111827">Date:</strong> ${d.dt}</div>
            ${c.vatReg ? `<div><strong style="color:#111827">VAT Reg.:</strong> ${esc(c.vatReg)}</div>` : ''}
          </div>
        </div>
      </div>
      <div style="padding:0 20mm 8mm">
        <div style="background:#f8fafc;padding:20px 24px;border-radius:8px;border:1px solid #f1f5f9">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#64748b;margin-bottom:6px">Bill To${showAr ? ' / \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u062F' : ''}</div>
          <div style="font-weight:700;color:#111827;font-size:16px">${esc(d.cust)}</div>
          ${d.addr ? `<div style="font-size:14px;color:#374151;margin-top:4px">${esc(d.addr)}</div>` : ''}
          <div style="font-size:14px;color:#6b7280;margin-top:4px">${[d.ph, d.cr, d.em].filter(Boolean).join(' | ')}</div>
        </div>
      </div>
      <div style="padding:0 20mm">
        <table style="width:100%;border-collapse:separate;border-spacing:0;font-size:14px">
          <thead>
            <tr>
              <th style="padding:14px 18px;text-align:center;width:40px;background:${pc};color:#fff;border-top-left-radius:6px;border-bottom-left-radius:6px;font-weight:600">#</th>
              <th style="padding:14px 18px;text-align:left;background:${pc};color:#fff;font-weight:600">Description${showAr ? ' / \u0627\u0644\u0628\u064A\u0627\u0646' : ''}</th>
              <th style="padding:14px 18px;text-align:center;width:60px;background:${pc};color:#fff;font-weight:600">Qty${showAr ? ' / \u0627\u0644\u0643\u0645\u064A\u0629' : ''}</th>
              <th style="padding:14px 18px;text-align:right;width:100px;background:${pc};color:#fff;font-weight:600">Price${showAr ? ' / \u0627\u0644\u0633\u0639\u0631' : ''}</th>
              <th style="padding:14px 18px;text-align:right;width:100px;background:${pc};color:#fff;border-top-right-radius:6px;border-bottom-right-radius:6px;font-weight:600">Amount${showAr ? ' / \u0627\u0644\u0645\u0628\u0644\u063A' : ''}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="5" style="padding:40px;text-align:center;color:#64748b;border-bottom:1px solid #e5e7eb">No items</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="padding:8mm 20mm 6mm;display:flex;justify-content:flex-end">
        <div style="min-width:280px;text-align:right;font-size:14px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6"><span style="color:#6b7280">Subtotal:</span><span style="font-weight:500;color:#1f2937">${d.cur.symbol}${d.sv}</span></div>
          ${d.disc > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;color:#dc2626"><span>Discount:</span><span style="font-weight:500">-${d.cur.symbol}${d.dv}</span></div>` : ''}
          ${d.vp > 0 ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6"><span style="color:#6b7280">VAT (${d.vp}%):</span><span style="font-weight:500;color:#1f2937">${d.cur.symbol}${d.vv}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:12px 0 8px;font-size:20px;font-weight:700;color:#111827"><span>Total:</span><span>${d.cur.symbol}${d.gv}</span></div>
          <div style="font-size:12px;color:#64748b;font-style:italic;padding-top:6px">${esc(d.gw)}</div>
        </div>
      </div>
      <div style="padding:0 20mm">
        <div style="background:#f8fafc;border-radius:6px;padding:16px 20px;font-size:14px;color:#374151;display:grid;gap:6px">
          ${d.pd ? `<div><strong style="color:#111827">Payment:</strong> ${esc(d.pd)}</div>` : ''}
          ${d.notes ? `<div><strong style="color:#111827">Notes:</strong> ${esc(d.notes)}</div>` : ''}
          ${c.invTerms ? `<div><strong style="color:#111827">Terms:</strong> ${esc(c.invTerms)}</div>` : ''}
        </div>
      </div>
      <div style="padding:8mm 20mm;display:flex;gap:28px;align-items:flex-end">
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:100px;max-height:100px;object-fit:contain" /></div>` : ''}
        ${c.signature ? `<div style="text-align:center"><img src="${esc(c.signature)}" style="max-width:130px;max-height:65px;object-fit:contain;margin-bottom:6px" /><div style="font-size:14px;color:#6b7280;border-top:1px solid #d1d5db;padding-top:6px;width:150px">Authorized Signature${showAr ? ' / \u0627\u0644\u062A\u0648\u0642\u064A\u0639' : ''}</div></div>` : ''}
      </div>
      <div style="flex:1;min-height:4mm"></div>
      <div style="padding:5mm 20mm;border-top:1px solid #e5e7eb;font-size:12px;color:#64748b;display:flex;justify-content:space-between;background:#f8fafc">
        <span style="color:#6b7280;font-weight:500">${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}</span>
        <span>${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</span>
      </div>
      ${c.invFooter ? `<div style="padding:3mm 20mm 5mm;font-size:12px;color:#64748b;text-align:center">${esc(c.invFooter)}</div>` : ''}
    </div>
  `, d.comp.watermark)
}
