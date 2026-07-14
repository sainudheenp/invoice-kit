import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceClassic(d: InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#1f2937'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:36px;width:auto;" alt="logo"/>` : ''
  const sealHtml = c.seal && c.seal !== c.logo ? `<img src="${esc(c.seal)}" style="height:48px;width:auto;" alt="seal"/>` : ''
  const sigHtml = c.signature ? `<img src="${esc(c.signature)}" style="height:30px;width:auto;" alt="signature"/>` : ''

  const rows = d.items.map((item, i) => `
    <tr${i % 2 === 1 ? ' style="background:#f3f4f6;"' : ''}>
      <td style="padding:5px 8px;border-bottom:1px solid #d1d5db;font-size:10px;text-align:center;">${i + 1}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #d1d5db;font-size:10px;">${esc(item.desc)}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #d1d5db;font-size:10px;text-align:right;">${item.qty}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #d1d5db;font-size:10px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #d1d5db;font-size:10px;text-align:right;">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  const contactLine = [c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:36px 44px; }
  .top-border { height:3px; background:${p}; margin:-36px -44px 0 -44px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-top:20px; margin-bottom:20px; }
  .left-col { display:flex; gap:12px; align-items:center; }
  .co-name { font-size:16px; font-weight:bold; color:#111827; }
  .co-sub { font-size:10px; color:#6b7280; margin-top:1px; }
  .co-contact { font-size:9px; color:#6b7280; margin-top:2px; }
  .right-col { text-align:right; }
  .doc-title { font-size:20px; font-weight:bold; color:${p}; letter-spacing:0.5px; }
  .doc-no { font-size:10px; color:#6b7280; margin-top:2px; letter-spacing:0.3px; }
  .rules { border-top:2px solid ${p}; border-bottom:2px solid ${p}; padding:10px 0; margin-bottom:16px; display:flex; justify-content:space-between; }
  .rules .lbl { font-size:8px; color:#6b7280; text-transform:uppercase; letter-spacing:0.8px; }
  .rules .val { font-size:11px; font-weight:bold; color:#111827; margin-top:1px; }
  .rules .sub { font-size:9px; color:#4b5563; margin-top:1px; }
  table { width:100%; border-collapse:collapse; }
  th { background:${p}; color:#fff; font-size:9px; padding:6px 8px; text-align:left; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
  th:nth-child(1){ text-align:center; width:30px; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5){ text-align:right; }
  .totals { margin-top:16px; margin-left:auto; width:280px; }
  .t { display:flex; justify-content:space-between; padding:3px 0; font-size:10px; color:#4b5563; }
  .t.b { border-top:2px solid ${p}; padding-top:5px; margin-top:3px; font-weight:bold; font-size:13px; color:#111827; }
  .t.b span:last-child { color:${p}; }
  .words { font-size:10px; color:#6b7280; font-style:italic; text-align:right; margin-top:8px; }
  .notes { margin-top:16px; padding:10px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-size:10px; color:#4b5563; }
  .sig-area { display:flex; justify-content:space-between; align-items:flex-end; margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; }
  .sig-box { text-align:center; }
  .sig-line { width:140px; height:1px; background:#9ca3af; margin:4px auto; }
  .sig-lbl { font-size:8px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; }
  .footer { margin-top:20px; padding-top:10px; border-top:1px solid #e5e7eb; font-size:8px; color:#6b7280; text-align:center; }
  .bank { font-size:8px; color:#6b7280; margin-top:2px; }
</style></head><body>
<div class="top-border"></div>

<div class="header">
  <div class="left-col">
    ${logoHtml}
    <div>
      <div class="co-name">${esc(c.name)}</div>
      ${c.sub ? `<div class="co-sub">${esc(c.sub)}</div>` : ''}
      ${contactLine ? `<div class="co-contact">${contactLine}</div>` : ''}
    </div>
  </div>
  <div class="right-col">
    <div class="doc-title">TAX INVOICE</div>
    <div class="doc-no">${esc(d.no)}</div>
  </div>
</div>

<div class="rules">
  <div>
    <div class="lbl">Bill To</div>
    <div class="val">${esc(d.cust)}</div>
    <div class="sub">${[d.addr, d.ph, d.cr, d.em].filter(Boolean).map(esc).join(' | ')}</div>
  </div>
  <div style="text-align:right;">
    <div class="lbl">Date</div>
    <div class="val">${esc(d.dt)}</div>
    ${c.vatReg ? `<div class="sub">VAT Reg: ${esc(c.vatReg)}</div>` : ''}
  </div>
</div>

<table>
  <tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
  ${rows}
</table>

<div class="totals">
  <div class="t"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.vp > 0 ? `<div class="t"><span>VAT (${d.vp}%)</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="t"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="t b"><span>Grand Total</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.pd || d.notes || c.invTerms ? `<div class="notes">
  ${d.pd ? `<div style="margin-bottom:4px;"><strong>Payment:</strong> ${esc(d.pd)}</div>` : ''}
  ${d.notes ? `<div>${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:4px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig-area">
  <div>${sealHtml}</div>
  <div class="sig-box">
    ${sigHtml}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
  <div class="sig-box" style="text-align:right;">
    <div class="sig-lbl">Authorized By</div>
    <div style="font-size:10px;font-weight:bold;color:#111827;">${esc(c.name)}</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<div class="bank">${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}</div>` : ''}
</div>
</body></html>`
}
