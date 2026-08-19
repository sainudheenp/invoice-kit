import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceProfessional(d:InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#1e3a5f'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:40px;width:auto;" alt="logo"/>` : ''
  const sealHtml = d.showSeal !== false && c.seal && c.seal !== c.logo ? `<img src="${esc(c.seal)}" style="height:120px;width:auto;" alt="seal"/>` : ''
  const qrHtml = d.qr || ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr>
      <td style="padding:7.5px 12.5px;border:1.25px solid #e2e8f0;font-size:12.5px;text-align:center;width:30px;">${i + 1}</td>
      <td style="padding:7.5px 12.5px;border:1.25px solid #e2e8f0;font-size:12.5px;">${esc(item.desc)}</td>
      <td style="padding:7.5px 12.5px;border:1.25px solid #e2e8f0;font-size:12.5px;text-align:right;">${item.qty}</td>
      <td style="padding:7.5px 12.5px;border:1.25px solid #e2e8f0;font-size:12.5px;text-align:right;">${item.price.toFixed(d.dp)}</td>
      <td style="padding:7.5px 12.5px;border:1.25px solid #e2e8f0;font-size:12.5px;text-align:right;color:#64748b;">${taxDisplay}</td>
      <td style="padding:7.5px 12.5px;border:1.25px solid #e2e8f0;font-size:12.5px;text-align:right;font-weight:500;">${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica Neue','Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:40px 50px 100px; }
  .top-db { border-top:10px solid ${p}; margin:-32px -40px 0 -40px; padding-top:30px; padding-left:50px; padding-right:50px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22.5px; }
  .brand { display:flex; gap:12.5px; align-items:center; }
  .brand-name { font-size:17.5px; font-weight:bold; color:#0f172a; text-transform:uppercase; letter-spacing:1.25px; }
  .brand-sub { font-size:11.25px; color:#475569; margin-top:1.25px; text-transform:uppercase; }
  .right { text-align:right; }
  .doc-no-box { border:1.25px solid ${p}; padding:5px 20px; display:inline-block; }
  .doc-no-box .lbl { font-size:8.75px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; }
  .doc-no-box .no { font-size:13.75px; font-weight:bold; color:#0f172a; }
  .ledger-header { background:${p}; color:#fff; padding:7.5px 15px; font-size:11.25px; font-weight:bold; text-transform:uppercase; letter-spacing:1.25px; margin-bottom:2.5px; }
  .info-grid { display:flex; gap:0; border:1.25px solid #e2e8f0; margin-bottom:20px; }
  .info-cell { flex:1; padding:7.5px 12.5px; border-right:1.25px solid #e2e8f0; }
  .info-cell:last-child { border-right:none; }
  .info-cell .lbl { font-size:8.75px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; }
  .info-cell .val { font-size:12.5px; color:#0f172a; font-weight:bold; margin-top:1.25px; }
  .info-cell .sub { font-size:10px; color:#475569; margin-top:1.25px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#f1f5f9; color:#475569; font-size:10px; padding:7.5px 12.5px; text-align:left; font-weight:bold; text-transform:uppercase; letter-spacing:0.625px; border:1.25px solid #e2e8f0; }
  th:first-child { text-align:center;width:30px; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5), th:nth-child(6) { text-align:right; }
  .total-section { margin-top:15px; border:1.25px solid ${p}; }
  .total-section .tr { display:flex; justify-content:space-between; padding:5px 15px; font-size:11.25px; border-bottom:1.25px solid #e2e8f0; }
  .total-section .tr:last-child { border-bottom:none; background:${p}; color:#fff; font-weight:bold; font-size:15px; padding:8.75px 15px; }
  .words { font-size:11.25px; color:#475569; font-style:italic; text-align:right; margin-top:10px;width:350px;margin-left:auto; }
  .notes-box { margin-top:15px; padding:10px 12.5px; border:1.25px solid #e2e8f0; font-size:11.25px; color:#475569; }
  .sig-row { display:flex; justify-content:space-between; margin-top:25px; padding-top:12.5px; border-top:2.5px solid ${p}; }
  .sig-item { text-align:center; }
  .sig-line { width:162.5px; height:1.25px; background:#94a3b8; margin:5px auto; }
  .sig-lbl { font-size:8.75px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; }
  .footer { position:fixed; bottom:0; left:50px; right:50px; padding-top:10px; border-top:1.25px solid #e2e8f0; font-size:8.75px; color:#64748b; text-align:center; text-transform:uppercase; letter-spacing:0.375px; z-index:100; }
</style></head><body>
<div class="top-db"></div>

<div class="header">
  <div class="brand">
    ${logoHtml}
    <div>
      <div class="brand-name">${esc(c.name)}</div>
      ${c.sub ? `<div class="brand-sub">${esc(c.sub)}</div>` : ''}
    </div>
  </div>
  <div class="right">
    <div class="doc-no-box">
      <div class="lbl">Invoice No.</div>
      <div class="no">${esc(d.no)}</div>
    </div>
  </div>
</div>

<div class="ledger-header">INVOICE STATEMENT</div>

<div class="info-grid">
  <div class="info-cell">
    <div class="lbl">Bill To</div>
    <div class="val">${esc(d.cust)}</div>
    <div class="sub">${[d.addr, d.ph, d.cr, d.em].filter(Boolean).map(esc).join(' | ')}</div>
  </div>
  <div class="info-cell">
    <div class="lbl">Date</div>
    <div class="val">${esc(d.dt)}</div>
  </div>
  <div class="info-cell">
    <div class="lbl">VAT</div>
    <div class="val">${c.vatReg ? esc(c.vatReg) : 'N/A'}</div>
  </div>
</div>

<table>
  <thead>
    <tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Tax %</th><th>Total</th></tr>
  </thead>
  ${rows}
</table>

<div class="total-section">
  <div class="tr"><span>SUBTOTAL</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.totalTax > 0 ? `<div class="tr"><span>Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="tr"><span>DISCOUNT</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="tr"><span>GRAND TOTAL</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.pd || d.notes || c.invTerms ? `<div class="notes-box">
  ${d.pd ? `<div style="margin-bottom:2.5px;"><strong>Payment:</strong> ${esc(d.pd)}</div>` : ''}
  ${d.notes ? `<div>${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:2.5px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig-row">
  <div style="display:flex;gap:15px;align-items:center;">
    ${sealHtml}
  </div>
  <div class="sig-item" style="text-align:left;">
    <div class="sig-lbl">Prepared By</div>
    <div style="font-size:11.25px;font-weight:bold;color:#0f172a;">${esc(c.name)}</div>
  </div>
  <div class="sig-item">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:30px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
</div>
${qrHtml ? `<div style="margin-top:15px;">${qrHtml}</div>` : ''}

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | T:${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}<br>
   Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
