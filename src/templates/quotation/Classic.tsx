import { esc } from '@/utils/esc'
import type { QuotTemplateData } from '@/types/template'

export function QuotationClassic(d:QuotTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#1f2937'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:45px;width:auto;" alt="logo"/>` : ''
  const sigHtml = c.signature ? `<img src="${esc(c.signature)}" style="height:37.5px;width:auto;" alt="signature"/>` : ''

  const rows = d.items.map((item, i) => `
    <tr${i % 2 === 1 ? ' style="background:#f3f4f6;"' : ''}>
      <td style="padding:6.25px 10px;border-bottom:1.25px solid #d1d5db;font-size:12.5px;text-align:center;">${i + 1}</td>
      <td style="padding:6.25px 10px;border-bottom:1.25px solid #d1d5db;font-size:12.5px;">${esc(item.desc)}</td>
      <td style="padding:6.25px 10px;border-bottom:1.25px solid #d1d5db;font-size:12.5px;text-align:right;">${item.qty}</td>
      <td style="padding:6.25px 10px;border-bottom:1.25px solid #d1d5db;font-size:12.5px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:6.25px 10px;border-bottom:1.25px solid #d1d5db;font-size:12.5px;text-align:right;">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:45px 55px 100px; }
  .top-border { height:3.75px; background:${p}; margin:-36px -44px 0 -44px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-top:25px; margin-bottom:25px; }
  .left-col { display:flex; gap:15px; align-items:center; }
  .right-col { text-align:right; }
  .doc-title { font-size:25px; font-weight:bold; color:${p}; letter-spacing:0.625px; }
  .doc-no { font-size:12.5px; color:#6b7280; margin-top:2.5px; }
  .rules { border-top:2.5px solid ${p}; border-bottom:2.5px solid ${p}; padding:12.5px 0; margin-bottom:20px; display:flex; justify-content:space-between; }
  .rules .lbl { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; }
  .rules .val { font-size:13.75px; font-weight:bold; color:#111827; margin-top:1.25px; }
  .rules .sub { font-size:11.25px; color:#4b5563; margin-top:1.25px; }
  table { width:100%; border-collapse:collapse; }
  th { background:${p}; color:#fff; font-size:11.25px; padding:7.5px 10px; text-align:left; font-weight:600; text-transform:uppercase; letter-spacing:0.625px; }
  th:nth-child(1){ text-align:center; width:37.5px; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5){ text-align:right; }
  .totals { margin-top:20px; margin-left:auto; width:350px; }
  .t { display:flex; justify-content:space-between; padding:3.75px 0; font-size:12.5px; color:#4b5563; }
  .t.b { border-top:2.5px solid ${p}; padding-top:6.25px; margin-top:3.75px; font-weight:bold; font-size:16.25px; color:#111827; }
  .t.b span:last-child { color:${p}; }
  .words { font-size:12.5px; color:#6b7280; font-style:italic; text-align:right; margin-top:10px; }
  .notes { margin-top:20px; padding:12.5px 15px; background:#f9fafb; border:1.25px solid #e5e7eb; font-size:12.5px; color:#4b5563; }
  .terms { margin-top:10px; padding:12.5px 15px; background:#f9fafb; border:1.25px solid #e5e7eb; font-size:12.5px; color:#4b5563; }
  .sig-area { display:flex; justify-content:flex-end; margin-top:25px; padding-top:15px; border-top:1.25px solid #e5e7eb; }
  .sig-box { text-align:center; }
  .sig-line { width:175px; height:1.25px; background:#9ca3af; margin:5px auto; }
  .sig-lbl { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.625px; }
  .footer { position:fixed; bottom:0; left:55px; right:55px; padding-top:12.5px; border-top:1.25px solid #e5e7eb; font-size:10px; color:#6b7280; text-align:center; z-index:100; }
</style></head><body>
<div class="top-border"></div>

<div class="header">
  <div class="left-col">
    ${logoHtml}
    <div>
      <div style="font-size:20px;font-weight:bold;color:#111827;">${esc(c.name)}</div>
      ${c.sub ? `<div style="font-size:12.5px;color:#6b7280;">${esc(c.sub)}</div>` : ''}
      <div style="font-size:11.25px;color:#6b7280;margin-top:2.5px;">${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}</div>
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
  <thead>
    <tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
  </thead>
  ${rows}
</table>

<div class="totals">
  <div class="t"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.totalTax > 0 ? `<div class="t"><span>Total Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
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
    <div style="font-size:12.5px;font-weight:bold;color:#111827;margin-top:2.5px;">${esc(c.name)}</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | Tel:${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}<br>
   Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
