import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceBeirak(d:InvTemplateData): string {
  const c = d.comp; const DB = '#1e3a5f'; const LB = '#e8edf3'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:40px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + d.cur.symbol + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr${i % 2 === 1 ? ` style="background:${LB};"` : ''}>
      <td style="padding:10px 15px;border:1.25px solid #c5ced9;font-size:12.5px;">${esc(item.desc)}</td>
      <td style="padding:10px 15px;border:1.25px solid #c5ced9;font-size:12.5px;text-align:right;">${item.qty}</td>
      <td style="padding:10px 15px;border:1.25px solid #c5ced9;font-size:12.5px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:10px 15px;border:1.25px solid #c5ced9;font-size:12.5px;text-align:right;color:#4b5563;">${taxDisplay}</td>
      <td style="padding:10px 15px;border:1.25px solid #c5ced9;font-size:12.5px;text-align:right;font-weight:500;">${d.cur.symbol}${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  const contact = [c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:50px; }
  .border-frame { position:absolute; top:10px; left:10px; right:10px; bottom:10px; border:3.75px solid ${DB}; pointer-events:none; }
  .header { text-align:center; padding-bottom:20px; border-bottom:2.5px solid ${DB}; margin-bottom:20px; }
  .header .brand { display:flex; align-items:center; justify-content:center; gap:12.5px; }
  .header .name { font-size:20px; font-weight:bold; color:${DB}; }
  .header .sub { font-size:12.5px; color:#4b5563; margin-top:2.5px; }
  .header .contact { font-size:11.25px; color:#64748b; margin-top:5px; }
  .title-badge { display:inline-block; border:2.5px solid ${DB}; color:${DB}; font-size:17.5px; font-weight:bold; padding:5px 30px; margin-top:10px; letter-spacing:2.5px; }
  .info-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  .info-table td { padding:5px 10px; font-size:12.5px; border:1.25px solid #c5ced9; vertical-align:top; }
  .info-table td:first-child { background:${DB}; color:#fff; font-weight:bold; width:112.5px; text-align:center; }
  table.items { width:100%; border-collapse:collapse; margin-top:10px; }
  table.items th { background:${DB}; color:#fff; font-size:11.25px; padding:10px 15px; text-align:left; font-weight:bold; border:1.25px solid ${DB}; }
  table.items th:nth-child(2), table.items th:nth-child(3), table.items th:nth-child(4), table.items th:nth-child(5) { text-align:right; }
  .sum-box { margin-top:15px; border:2.5px solid ${DB}; }
  .sum-row { display:flex; justify-content:space-between; padding:6.25px 15px; font-size:12.5px; border-bottom:1.25px solid #c5ced9; }
  .sum-row:last-child { border-bottom:none; background:${DB}; color:#fff; font-weight:bold; font-size:17.5px; padding:10px 15px; }
  .words { font-size:12.5px; color:#4b5563; font-style:italic; text-align:right; margin-top:10px; }
  .notes { margin-top:15px; padding:10px 15px; border:1.25px solid #c5ced9; font-size:12.5px; color:#4b5563; }
  .sig-section { display:flex; justify-content:space-between; margin-top:25px; padding-top:15px; border-top:2.5px solid ${DB}; }
  .sig-block { text-align:center; flex:1; }
  .sig-line { width:150px; height:2.5px; background:${DB}; margin:5px auto; }
  .sig-label { font-size:11.25px; color:#64748b; }
  .sig-name { font-size:12.5px; font-weight:bold; color:${DB}; }
  .footer { margin-top:20px; padding-top:12.5px; border-top:1.25px solid ${DB}; text-align:center; font-size:11.25px; color:#64748b; }
</style></head><body>
<div class="border-frame"></div>

<div class="header">
  <div class="brand">
    ${logoHtml}
    <div>
      <div class="name">${esc(c.name)}</div>
      ${c.sub ? `<div class="sub">${esc(c.sub)}</div>` : ''}
      ${contact ? `<div class="contact">${contact}</div>` : ''}
    </div>
  </div>
  <div class="title-badge">INVOICE</div>
</div>

<table class="info-table">
  <tr>
    <td>Invoice No.</td>
    <td>${esc(d.no)}</td>
    <td>Date</td>
    <td>${esc(d.dt)}</td>
  </tr>
  <tr>
    <td>Party</td>
    <td colspan="3">${esc(d.cust)}${d.addr ? ` - ${esc(d.addr)}` : ''}${d.cr ? ` (CR: ${esc(d.cr)})` : ''}</td>
  </tr>
</table>

<table class="items">
  <thead>
    <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Tax %</th><th>Total</th></tr>
  </thead>
  ${rows}
</table>

<div class="sum-box">
  <div class="sum-row"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.totalTax > 0 ? `<div class="sum-row"><span>Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="sum-row"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="sum-row"><span>Grand Total</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.pd || d.notes || c.invTerms ? `<div class="notes">
  ${d.pd ? `<div><strong>Payment:</strong> ${esc(d.pd)}</div>` : ''}
  ${d.notes ? `<div style="margin-top:5px;">${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:5px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig-section">
  <div class="sig-block" style="text-align:left;">
    <div class="sig-label">Prepared By</div>
    <div class="sig-line" style="margin:5px 0;"></div>
    <div class="sig-name">${esc(c.name)}</div>
  </div>
  <div class="sig-block">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:35px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-label">Authorized Signature</div>
  </div>
  <div class="sig-block" style="text-align:right;">
    <div class="sig-label">Authorized By</div>
    <div class="sig-line" style="margin:5px 0 5px auto;"></div>
    <div class="sig-name">${esc(c.name)}</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)} &mdash; ${contact}
  ${c.bankName ? `<br>${esc(c.bankName)}${c.bankAcc ? ` - ${esc(c.bankAcc)}` : ''}` : ''}
</div>
</body></html>`
}
