import { esc } from '@/utils/esc'
import type { QuotTemplateData } from '@/types/template'

export function QuotationClassic(d: QuotTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#1f2937'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:36px;width:auto;" alt="logo"/>` : ''
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

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:36px 44px; }
  .top-border { height:3px; background:${p}; margin:-36px -44px 0 -44px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-top:20px; margin-bottom:20px; }
  .left-col { display:flex; gap:12px; align-items:center; }
  .right-col { text-align:right; }
  .doc-title { font-size:20px; font-weight:bold; color:${p}; letter-spacing:0.5px; }
  .doc-no { font-size:10px; color:#6b7280; margin-top:2px; }
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
  .terms { margin-top:8px; padding:10px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-size:10px; color:#4b5563; }
  .sig-area { display:flex; justify-content:flex-end; margin-top:20px; padding-top:12px; border-top:1px solid #e5e7eb; }
  .sig-box { text-align:center; }
  .sig-line { width:140px; height:1px; background:#9ca3af; margin:4px auto; }
  .sig-lbl { font-size:8px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; }
  .footer { margin-top:20px; padding-top:10px; border-top:1px solid #e5e7eb; font-size:8px; color:#6b7280; text-align:center; }
</style></head><body>
<div class="top-border"></div>

<div class="header">
  <div class="left-col">
    ${logoHtml}
    <div>
      <div style="font-size:16px;font-weight:bold;color:#111827;">${esc(c.name)}</div>
      ${c.sub ? `<div style="font-size:10px;color:#6b7280;">${esc(c.sub)}</div>` : ''}
      <div style="font-size:9px;color:#6b7280;margin-top:2px;">${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}</div>
    </div>
  </div>
  <div class="right-col">
    <div class="doc-title">QUOTATION</div>
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
    <div class="lbl">Date / Valid</div>
    <div class="val">${esc(d.dt)} &ndash; ${esc(d.validDt)}</div>
    ${c.vatReg ? `<div class="sub">VAT: ${esc(c.vatReg)}</div>` : ''}
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

${d.notes ? `<div class="notes"><strong>Notes:</strong> ${esc(d.notes)}</div>` : ''}
${d.terms ? `<div class="terms"><strong>Terms:</strong> ${esc(d.terms)}</div>` : ''}

<div class="sig-area">
  <div class="sig-box">
    ${sigHtml}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
    <div style="font-size:10px;font-weight:bold;color:#111827;margin-top:2px;">${esc(c.name)}</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
