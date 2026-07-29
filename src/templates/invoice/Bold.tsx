import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceBold(d:InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#dc2626'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:45px;width:auto;" alt="logo"/>` : ''
  const sealHtml = c.seal && c.seal !== c.logo ? `<img src="${esc(c.seal)}" style="height:120px;width:auto;" alt="seal"/>` : ''
  const qrHtml = d.qr || ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + d.cur.symbol + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr${i % 2 === 1 ? ' style="background:#fef2f2;"' : ''}>
      <td style="padding:10px 15px;border-bottom:2.5px solid #000;font-size:13.75px;">${esc(item.desc)}</td>
      <td style="padding:10px 15px;border-bottom:2.5px solid #000;font-size:13.75px;text-align:right;">${item.qty}</td>
      <td style="padding:10px 15px;border-bottom:2.5px solid #000;font-size:13.75px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:10px 15px;border-bottom:2.5px solid #000;font-size:13.75px;text-align:right;color:#666;">${taxDisplay}</td>
      <td style="padding:10px 15px;border-bottom:2.5px solid #000;font-size:13.75px;text-align:right;font-weight:bold;">${d.cur.symbol}${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#000; background:#fff; width:794px; padding:0 0 100px; }
  .top-black { background:#000; padding:30px 60px; display:flex; justify-content:space-between; align-items:center; }
  .top-black h1 { color:#fff; font-size:35px; font-weight:900; letter-spacing:2.5px; text-transform:uppercase; }
  .top-black .no { color:#aaa; font-size:15px; font-weight:bold; margin-top:2.5px; }
  .brand-area { padding:25px 60px 0; display:flex; gap:15px; align-items:center; }
  .brand-name { font-size:22.5px; font-weight:900; color:#000; text-transform:uppercase; }
  .brand-sub { font-size:12.5px; color:#666; font-weight:bold; text-transform:uppercase; }
  .body { padding:20px 60px 40px; }
  .info { display:flex; justify-content:space-between; margin-bottom:25px; padding:15px 0; border-top:3.75px solid #000; border-bottom:3.75px solid #000; }
  .info .lbl { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:1.25px; font-weight:bold; }
  .info .val { font-size:15px; color:#000; font-weight:bold; margin-top:2.5px; }
  .info .sub { font-size:11.25px; color:#444; }
  table { width:100%; border-collapse:collapse; }
  th { background:#000; color:#fff; font-size:11.25px; padding:10px 15px; text-align:left; font-weight:bold; text-transform:uppercase; letter-spacing:0.625px; }
  th:nth-child(2), th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align:right; }
  .total { margin-top:20px; margin-left:auto; width:375px; }
  .t { display:flex; justify-content:space-between; padding:6.25px 0; font-size:13.75px; font-weight:bold; border-bottom:1.25px solid #ddd; }
  .t.gr { font-size:20px; color:${p}; border-bottom:3.75px solid #000; padding:10px 0; margin-top:5px; }
  .words { font-size:12.5px; color:#666; font-style:italic; text-align:right; margin-top:10px; }
  .notes { margin-top:20px; padding:15px 20px; background:#f9f9f9; border-left:5px solid ${p}; font-size:12.5px; color:#333; }
  .sig { margin-top:30px; display:flex; justify-content:space-between; align-items:flex-start; }
  .sig-b { text-align:center; flex:1; }
  .sig-line { width:175px; height:2.5px; background:#000; margin:5px auto; }
  .sig-label { font-size:11.25px; color:#666; font-weight:bold; text-transform:uppercase; }
  .footer { position:fixed; bottom:0; left:0; right:0; background:#000; color:#fff; padding:17.5px 60px; font-size:11.25px; text-align:center; z-index:100; }
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
    <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Tax %</th><th>Total</th></tr>
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
    ${d.pd ? `<div style="margin-bottom:5px;"><strong>PAYMENT:</strong> ${esc(d.pd)}</div>` : ''}
    ${d.notes ? `<div>${esc(d.notes)}</div>` : ''}
    ${c.invTerms ? `<div style="margin-top:5px;">${esc(c.invTerms)}</div>` : ''}
  </div>` : ''}

  <div class="sig">
    <div style="display:flex;gap:15px;align-items:center;">
      ${sealHtml}
    </div>
    <div></div>
    <div class="sig-b">
      ${c.signature ? `<img src="${esc(c.signature)}" style="height:37.5px;width:auto;" alt="sig"/>` : ''}
      <div class="sig-line"></div>
      <div class="sig-label">Authorized Signature</div>
    </div>
    <div class="sig-b" style="text-align:right;">
      <div class="sig-label">Authorized By</div>
      <div style="font-size:15px;font-weight:bold;color:#000;">${esc(c.name)}</div>
    </div>
  </div>
</div>
${qrHtml ? `<div style="text-align:left;margin-top:10px;">${qrHtml}</div>` : ''}

<div class="footer">
  <strong>${esc(c.name)}</strong>${c.loc ? ` &mdash; ${esc(c.loc)}` : ''}<br>
  ${c.tel ? `Tel:${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}<br>
   Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${esc(c.bankName)}${c.bankAcc ? ` &bullet; ${esc(c.bankAcc)}` : ''}` : ''}
</div>
</body></html>`
}
