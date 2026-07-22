import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceBeirak(d: InvTemplateData): string {
  const c = d.comp; const DB = '#1e3a5f'; const LB = '#e8edf3'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:32px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + d.cur.symbol + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr${i % 2 === 1 ? ` style="background:${LB};"` : ''}>
      <td style="padding:8px 12px;border:1px solid #c5ced9;font-size:10px;">${esc(item.desc)}</td>
      <td style="padding:8px 12px;border:1px solid #c5ced9;font-size:10px;text-align:right;">${item.qty}</td>
      <td style="padding:8px 12px;border:1px solid #c5ced9;font-size:10px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:8px 12px;border:1px solid #c5ced9;font-size:10px;text-align:right;color:#4b5563;">${taxDisplay}</td>
      <td style="padding:8px 12px;border:1px solid #c5ced9;font-size:10px;text-align:right;font-weight:500;">${d.cur.symbol}${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  const contact = [c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:40px; }
  .border-frame { position:absolute; top:8px; left:8px; right:8px; bottom:8px; border:3px solid ${DB}; pointer-events:none; }
  .header { text-align:center; padding-bottom:16px; border-bottom:2px solid ${DB}; margin-bottom:16px; }
  .header .brand { display:flex; align-items:center; justify-content:center; gap:10px; }
  .header .name { font-size:16px; font-weight:bold; color:${DB}; }
  .header .sub { font-size:10px; color:#4b5563; margin-top:2px; }
  .header .contact { font-size:9px; color:#64748b; margin-top:4px; }
  .title-badge { display:inline-block; border:2px solid ${DB}; color:${DB}; font-size:14px; font-weight:bold; padding:4px 24px; margin-top:8px; letter-spacing:2px; }
  .info-table { width:100%; border-collapse:collapse; margin-bottom:16px; }
  .info-table td { padding:4px 8px; font-size:10px; border:1px solid #c5ced9; vertical-align:top; }
  .info-table td:first-child { background:${DB}; color:#fff; font-weight:bold; width:90px; text-align:center; }
  table.items { width:100%; border-collapse:collapse; margin-top:8px; }
  table.items th { background:${DB}; color:#fff; font-size:9px; padding:8px 12px; text-align:left; font-weight:bold; border:1px solid ${DB}; }
  table.items th:nth-child(2), table.items th:nth-child(3), table.items th:nth-child(4), table.items th:nth-child(5) { text-align:right; }
  .sum-box { margin-top:12px; border:2px solid ${DB}; }
  .sum-row { display:flex; justify-content:space-between; padding:5px 12px; font-size:10px; border-bottom:1px solid #c5ced9; }
  .sum-row:last-child { border-bottom:none; background:${DB}; color:#fff; font-weight:bold; font-size:14px; padding:8px 12px; }
  .words { font-size:10px; color:#4b5563; font-style:italic; text-align:right; margin-top:8px; }
  .notes { margin-top:12px; padding:8px 12px; border:1px solid #c5ced9; font-size:10px; color:#4b5563; }
  .sig-section { display:flex; justify-content:space-between; margin-top:20px; padding-top:12px; border-top:2px solid ${DB}; }
  .sig-block { text-align:center; flex:1; }
  .sig-line { width:120px; height:2px; background:${DB}; margin:4px auto; }
  .sig-label { font-size:9px; color:#64748b; }
  .sig-name { font-size:10px; font-weight:bold; color:${DB}; }
  .footer { margin-top:16px; padding-top:10px; border-top:1px solid ${DB}; text-align:center; font-size:9px; color:#64748b; }
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
  <div class="title-badge">TAX INVOICE</div>
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
  ${d.notes ? `<div style="margin-top:4px;">${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:4px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig-section">
  <div class="sig-block" style="text-align:left;">
    <div class="sig-label">Prepared By</div>
    <div class="sig-line" style="margin:4px 0;"></div>
    <div class="sig-name">${esc(c.name)}</div>
  </div>
  <div class="sig-block">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:28px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-label">Authorized Signature</div>
  </div>
  <div class="sig-block" style="text-align:right;">
    <div class="sig-label">Authorized By</div>
    <div class="sig-line" style="margin:4px 0 4px auto;"></div>
    <div class="sig-name">${esc(c.name)}</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)} &mdash; ${contact}
  ${c.bankName ? `<br>${esc(c.bankName)}${c.bankAcc ? ` - ${esc(c.bankAcc)}` : ''}` : ''}
</div>
</body></html>`
}
