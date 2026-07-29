import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceMinimal(d:InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#94a3b8'
  const sealHtml = c.seal && c.seal !== c.logo ? `<img src="${esc(c.seal)}" style="height:120px;width:auto;" alt="seal"/>` : ''
  const qrHtml = d.qr ? `<img src="${esc(d.qr)}" style="width:100px;height:100px;" alt="qr"/>` : ''

  const rows = d.items.map((item) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + d.cur.symbol + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr>
      <td style="padding:7.5px 0;font-size:12.5px;color:#334155;">${esc(item.desc)}</td>
      <td style="padding:7.5px 0;font-size:12.5px;color:#475569;text-align:right;">${item.qty}</td>
      <td style="padding:7.5px 0;font-size:12.5px;color:#475569;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:7.5px 0;font-size:12.5px;color:#94a3b8;text-align:right;">${taxDisplay}</td>
      <td style="padding:7.5px 0;font-size:12.5px;color:#334155;text-align:right;font-weight:500;">${d.cur.symbol}${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica Neue','Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:65px 75px 100px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:45px; }
  .co-name { font-size:16.25px; font-weight:600; color:#0f172a; letter-spacing:-0.2px; }
  .co-sub { font-size:10px; color:#94a3b8; margin-top:1.25px; }
  .doc-type { font-size:11.25px; color:#94a3b8; font-weight:500; letter-spacing:2.5px; text-transform:uppercase; }
  .doc-no { font-size:11.25px; color:#94a3b8; margin-top:2.5px; }
  .rules { margin-bottom:35px; }
  .rules .top { display:flex; justify-content:space-between; padding-bottom:10px; border-bottom:1.25px solid #e2e8f0; }
  .rules .lbl { font-size:8.75px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:2.5px; }
  .rules .val { font-size:12.5px; color:#0f172a; font-weight:600; }
  .rules .sub { font-size:10px; color:#64748b; margin-top:1.25px; }
  table { width:100%; border-collapse:collapse; }
  th { font-size:8.75px; color:#94a3b8; font-weight:500; padding:5px 0; border-bottom:1.25px solid #e2e8f0; text-align:left; text-transform:uppercase; letter-spacing:1px; }
  th:nth-child(2), th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align:right; }
  .spacer { height:10px; }
  .total-line { display:flex; justify-content:space-between; padding:2.5px 0; font-size:11.25px; color:#64748b; }
  .total-line.final { font-size:15px; font-weight:600; color:#0f172a; border-top:1.25px solid #e2e8f0; padding-top:6.25px; margin-top:2.5px; }
  .total-line.final span:last-child { color:${p}; }
  .words { font-size:10px; color:#94a3b8; font-style:italic; text-align:right; margin-top:7.5px; }
  .section { margin-top:25px; padding-top:15px; border-top:1.25px solid #e2e8f0; font-size:10px; color:#64748b; }
  .section-title { font-size:8.75px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; }
  .sig { margin-top:35px; display:flex; justify-content:flex-end; }
  .sig-box { text-align:center; }
  .sig-line { width:150px; height:1.25px; background:#cbd5e1; margin:3.75px auto; }
  .sig-lbl { font-size:8.75px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.625px; }
  .footer { position:fixed; bottom:0; left:75px; right:75px; padding-top:15px; border-top:1.25px solid #e2e8f0; font-size:8.75px; color:#94a3b8; text-align:center; letter-spacing:0.375px; z-index:100; }
</style></head><body>
<div class="header">
  <div>
    <div class="co-name">${esc(c.name)}</div>
    ${c.sub ? `<div class="co-sub">${esc(c.sub)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    <div class="doc-type">Invoice</div>
    <div class="doc-no">${esc(d.no)}</div>
  </div>
</div>

<div class="rules">
  <div class="top">
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
</div>

<table>
  <thead>
    <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Tax %</th><th>Total</th></tr>
  </thead>
  ${rows}
</table>

<div class="spacer"></div>
<div class="total-line"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
${d.totalTax > 0 ? `<div class="total-line"><span>Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
${d.disc > 0 ? `<div class="total-line"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
<div class="total-line final"><span>Grand Total</span><span>${d.cur.symbol}${d.gv}</span></div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.pd || d.notes || c.invTerms ? `<div class="section">
  ${d.pd ? `<div class="section-title">Payment</div><div>${esc(d.pd)}</div>` : ''}
  ${d.notes ? `<div style="margin-top:5px;">${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:5px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig">
  <div style="display:flex;gap:15px;align-items:center;">
    ${sealHtml}
  </div>
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:25px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
</div>
${qrHtml ? `<div style="position:fixed;bottom:10%;left:75px;z-index:9998;">${qrHtml}</div>` : ''}

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}<br>
   Thank you for choosing ${esc(c.name)}
</div>
</body></html>`
}
