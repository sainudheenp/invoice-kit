import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceModern(d:InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#D97706'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:40px;width:auto;" alt="logo"/>` : ''
  const sealHtml = c.seal && c.seal !== c.logo ? `<img src="${esc(c.seal)}" style="height:120px;width:auto;" alt="seal"/>` : ''
  const qrHtml = d.qr || ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr${i % 2 === 1 ? ' style="background:#f8fafc;"' : ''}>
      <td style="padding:12.5px 15px;border-bottom:1.25px solid #e2e8f0;font-size:13.75px;text-align:center;width:30px;">${i + 1}</td>
      <td style="padding:12.5px 15px;border-bottom:1.25px solid #e2e8f0;font-size:13.75px;">${esc(item.desc)}</td>
      <td style="padding:12.5px 15px;border-bottom:1.25px solid #e2e8f0;font-size:13.75px;text-align:right;">${item.qty}</td>
      <td style="padding:12.5px 15px;border-bottom:1.25px solid #e2e8f0;font-size:13.75px;text-align:right;">${item.price.toFixed(d.dp)}</td>
      <td style="padding:12.5px 15px;border-bottom:1.25px solid #e2e8f0;font-size:13.75px;text-align:right;color:#64748b;">${taxDisplay}</td>
      <td style="padding:12.5px 15px;border-bottom:1.25px solid #e2e8f0;font-size:13.75px;text-align:right;font-weight:500;">${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  const contactLine = [c.tel, c.email].filter(Boolean).join(' | ')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:40px 50px 100px; }
  .sidebar { position:absolute; top:0; left:0; width:5px; height:100%; background:linear-gradient(to bottom, ${p}, ${p}88); }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding:20px 25px; background:#f8fafc; border-radius:10px; margin-bottom:25px; }
  .brand { display:flex; gap:12.5px; align-items:center; }
  .doc-label { font-size:12.5px; color:${p}; font-weight:bold; letter-spacing:2.5px; border-left:3.75px solid ${p}; padding-left:10px; }
  .info-grid { display:flex; gap:30px; margin-bottom:25px; }
  .card { padding:15px 20px; background:#f8fafc; border-radius:10px; flex:1; }
  .card-label { font-size:11.25px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; margin-bottom:5px; }
  .card-value { font-size:13.75px; font-weight:bold; color:#1f2937; }
  .card-sub { font-size:11.25px; color:#4b5563; margin-top:2.5px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#f1f5f9; color:#64748b; font-size:11.25px; padding:10px 15px; text-align:left; font-weight:600; text-transform:uppercase; letter-spacing:0.625px; }
  th:first-child { text-align:center;width:30px; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5), th:nth-child(6) { text-align:right; }
  .summary { margin-top:15px; margin-left:auto; width:375px; }
  .sum-row { display:flex; justify-content:space-between; padding:5px 15px; font-size:12.5px; }
  .sum-row.total { font-weight:bold; font-size:17.5px; color:${p}; border-top:2.5px solid #cbd5e1; margin-top:5px; padding-top:10px; }
  .words { font-size:12.5px; color:#64748b; font-style:italic; text-align:right; margin-top:10px;width:350px;margin-left:auto; }
  .notes { margin-top:20px; padding:15px 20px; background:#f8fafc; border-radius:10px; font-size:12.5px; color:#4b5563; }
  .footer { position:fixed; bottom:0; left:50px; right:50px; padding-top:15px; border-top:1.25px solid #e2e8f0; font-size:11.25px; color:#64748b; text-align:center; z-index:100; }
  .sig { display:flex; justify-content:flex-end; align-items:center; gap:30px; margin-top:20px; padding-right:25px; }
  .sig-block { text-align:center; }
  .sig-line { width:125px; height:1.25px; background:#94a3b8; margin:5px auto; }
  .sig-label { font-size:11.25px; color:#64748b; }
</style></head><body>
<div class="sidebar"></div>

<div class="header">
  <div class="brand">
    ${logoHtml}
    <div>
      <div style="font-size:16.25px;font-weight:bold;">${esc(c.name)}</div>
      ${c.sub ? `<div style="font-size:11.25px;color:#4b5563;">${esc(c.sub)}</div>` : ''}
    </div>
  </div>
  <div style="text-align:right;">
    <div class="doc-label">INVOICE</div>
    <div style="font-size:12.5px;color:#4b5563;margin-top:2.5px;">${esc(d.no)}</div>
  </div>
</div>

<div class="info-grid">
  <div class="card">
    <div class="card-label">Bill To</div>
    <div class="card-value">${esc(d.cust)}</div>
    <div class="card-sub">${[d.addr, d.ph, d.cr, d.em].filter(Boolean).map(esc).join(' | ')}</div>
  </div>
  <div class="card" style="text-align:right;">
    <div class="card-label">Date</div>
    <div class="card-value">${esc(d.dt)}</div>
    ${c.vatReg ? `<div class="card-sub">VAT: ${esc(c.vatReg)}</div>` : ''}
  </div>
</div>

<table>
  <thead>
    <tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Tax %</th><th>Total</th></tr>
  </thead>
  ${rows}
</table>

<div class="summary">
  <div class="sum-row"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.totalTax > 0 ? `<div class="sum-row"><span>Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="sum-row"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="sum-row total"><span>Total</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.pd || d.notes || c.invTerms ? `<div class="notes">
  ${d.pd ? `<div style="margin-bottom:5px;"><strong>Payment:</strong> ${esc(d.pd)}</div>` : ''}
  ${d.notes ? `<div>${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:5px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig">
  <div style="display:flex;gap:15px;align-items:center;">
    ${sealHtml}
  </div>
  ${c.signature ? `<div class="sig-block">${c.signature ? `<img src="${esc(c.signature)}" style="height:35px;width:auto;" alt="sig"/>` : ''}<div class="sig-line"></div><div class="sig-label">Authorized Signature</div></div>` : ''}
  <div class="sig-block" style="text-align:right;">
    <div class="sig-label">${esc(c.name)}</div>
    ${contactLine ? `<div class="sig-label">${esc(contactLine)}</div>` : ''}
  </div>
</div>
${qrHtml ? `<div style="margin-top:15px;">${qrHtml}</div>` : ''}

<div class="footer">
  ${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}${contactLine ? ` | ${esc(contactLine)}` : ''}<br>
   Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${c.bankName}${c.bankAcc ? ` - ${c.bankAcc}` : ''}${c.bankIban ? ` (${c.bankIban})` : ''}` : ''}
</div>
</body></html>`
}
