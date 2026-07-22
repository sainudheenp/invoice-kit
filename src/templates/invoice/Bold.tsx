import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceBold(d: InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#dc2626'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:36px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + d.cur.symbol + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr${i % 2 === 1 ? ' style="background:#fef2f2;"' : ''}>
      <td style="padding:8px 12px;border-bottom:2px solid #000;font-size:11px;">${esc(item.desc)}</td>
      <td style="padding:8px 12px;border-bottom:2px solid #000;font-size:11px;text-align:right;">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:2px solid #000;font-size:11px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:8px 12px;border-bottom:2px solid #000;font-size:11px;text-align:right;color:#666;">${taxDisplay}</td>
      <td style="padding:8px 12px;border-bottom:2px solid #000;font-size:11px;text-align:right;font-weight:bold;">${d.cur.symbol}${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#000; background:#fff; width:794px; padding:0; }
  .top-black { background:#000; padding:24px 48px; display:flex; justify-content:space-between; align-items:center; }
  .top-black h1 { color:#fff; font-size:28px; font-weight:900; letter-spacing:2px; text-transform:uppercase; }
  .top-black .no { color:#aaa; font-size:12px; font-weight:bold; margin-top:2px; }
  .brand-area { padding:20px 48px 0; display:flex; gap:12px; align-items:center; }
  .brand-name { font-size:18px; font-weight:900; color:#000; text-transform:uppercase; }
  .brand-sub { font-size:10px; color:#666; font-weight:bold; text-transform:uppercase; }
  .body { padding:16px 48px 32px; }
  .info { display:flex; justify-content:space-between; margin-bottom:20px; padding:12px 0; border-top:3px solid #000; border-bottom:3px solid #000; }
  .info .lbl { font-size:8px; color:#666; text-transform:uppercase; letter-spacing:1px; font-weight:bold; }
  .info .val { font-size:12px; color:#000; font-weight:bold; margin-top:2px; }
  .info .sub { font-size:9px; color:#444; }
  table { width:100%; border-collapse:collapse; }
  th { background:#000; color:#fff; font-size:9px; padding:8px 12px; text-align:left; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; }
  th:nth-child(2), th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align:right; }
  .total { margin-top:16px; margin-left:auto; width:300px; }
  .t { display:flex; justify-content:space-between; padding:5px 0; font-size:11px; font-weight:bold; border-bottom:1px solid #ddd; }
  .t.gr { font-size:16px; color:${p}; border-bottom:3px solid #000; padding:8px 0; margin-top:4px; }
  .words { font-size:10px; color:#666; font-style:italic; text-align:right; margin-top:8px; }
  .notes { margin-top:16px; padding:12px 16px; background:#f9f9f9; border-left:4px solid ${p}; font-size:10px; color:#333; }
  .sig { margin-top:24px; display:flex; justify-content:space-between; align-items:flex-start; }
  .sig-b { text-align:center; flex:1; }
  .sig-line { width:140px; height:2px; background:#000; margin:4px auto; }
  .sig-label { font-size:9px; color:#666; font-weight:bold; text-transform:uppercase; }
  .footer { background:#000; color:#fff; padding:14px 48px; font-size:9px; text-align:center; }
  .footer a { color:#aaa; text-decoration:none; }
</style></head><body>
<div class="top-black">
  <div>
    <h1>Invoice</h1>
    <div class="no">${esc(d.no)}</div>
  </div>
  ${logoHtml}
</div>

<div class="brand-area">
  <div>
    <div class="brand-name">${esc(c.name)}</div>
    ${c.sub ? `<div class="brand-sub">${esc(c.sub)}</div>` : ''}
  </div>
</div>

<div class="body">
  <div class="info">
    <div>
      <div class="lbl">Bill To</div>
      <div class="val">${esc(d.cust)}</div>
      <div class="sub">${[d.addr, d.ph, d.cr, d.em].filter(Boolean).map(esc).join(' | ')}</div>
    </div>
    <div style="text-align:right;">
      <div class="lbl">Date</div>
      <div class="val">${esc(d.dt)}</div>
      ${c.vatReg ? `<div class="sub">VAT: ${esc(c.vatReg)}</div>` : ''}
    </div>
  </div>

  <table>
    <thead>
    <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Total</th></tr>
  </thead>
    ${rows}
  </table>

  <div class="total">
    <div class="t"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
    ${d.totalTax > 0 ? `<div class="t"><span>Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
    ${d.disc > 0 ? `<div class="t"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
    <div class="t gr"><span>Grand Total</span><span>${d.cur.symbol}${d.gv}</span></div>
  </div>

  ${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

  ${d.pd || d.notes || c.invTerms ? `<div class="notes">
    ${d.pd ? `<div style="margin-bottom:4px;"><strong>PAYMENT:</strong> ${esc(d.pd)}</div>` : ''}
    ${d.notes ? `<div>${esc(d.notes)}</div>` : ''}
    ${c.invTerms ? `<div style="margin-top:4px;">${esc(c.invTerms)}</div>` : ''}
  </div>` : ''}

  <div class="sig">
    <div></div>
    <div class="sig-b">
      ${c.signature ? `<img src="${esc(c.signature)}" style="height:30px;width:auto;" alt="sig"/>` : ''}
      <div class="sig-line"></div>
      <div class="sig-label">Authorized Signature</div>
    </div>
    <div class="sig-b" style="text-align:right;">
      <div class="sig-label">Authorized By</div>
      <div style="font-size:12px;font-weight:bold;color:#000;">${esc(c.name)}</div>
    </div>
  </div>
</div>

<div class="footer">
  <strong>${esc(c.name)}</strong>${c.loc ? ` &mdash; ${esc(c.loc)}` : ''}<br>
  ${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${esc(c.bankName)}${c.bankAcc ? ` &bullet; ${esc(c.bankAcc)}` : ''}` : ''}
</div>
</body></html>`
}
