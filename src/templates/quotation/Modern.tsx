import { esc } from '@/utils/esc'
import type { QuotTemplateData } from '@/types/template'

export function QuotationModern(d:QuotTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#D97706'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:35px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => `
    <tr${i % 2 === 1 ? ' style="background:#f1f5f9;"' : ''}>
      <td style="padding:7.5px 10px;border-bottom:1.25px solid #e2e8f0;font-size:12.5px;">${i + 1}</td>
      <td style="padding:7.5px 10px;border-bottom:1.25px solid #e2e8f0;font-size:12.5px;">${esc(item.desc)}</td>
      <td style="padding:7.5px 10px;border-bottom:1.25px solid #e2e8f0;font-size:12.5px;text-align:right;">${item.qty}</td>
      <td style="padding:7.5px 10px;border-bottom:1.25px solid #e2e8f0;font-size:12.5px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:7.5px 10px;border-bottom:1.25px solid #e2e8f0;font-size:12.5px;text-align:right;">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:40px 50px; }
  .sidebar { position:absolute; top:0; left:0; width:5px; height:1403.75px; background:linear-gradient(to bottom, ${p}, ${p}88); }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding:20px 25px; background:#f8fafc; border-radius:10px; margin-bottom:25px; }
  .brand { display:flex; gap:12.5px; align-items:center; }
  .doc-label { font-size:12.5px; color:${p}; font-weight:bold; letter-spacing:2.5px; border-left:3.75px solid ${p}; padding-left:10px; }
  .title { font-size:16.25px; font-weight:bold; margin-top:2.5px; }
  .info-grid { display:flex; gap:30px; margin-bottom:25px; }
  .card { padding:15px 20px; background:#f8fafc; border-radius:10px; flex:1; }
  .card-label { font-size:11.25px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; margin-bottom:5px; }
  .card-value { font-size:13.75px; font-weight:bold; color:#1f2937; }
  .card-sub { font-size:11.25px; color:#4b5563; margin-top:2.5px; }
  table { width:100%; border-collapse:separate; border-spacing:0 2.5px; margin-top:10px; }
  th { background:${p}; color:#fff; font-size:11.25px; padding:7.5px 10px; text-align:left; font-weight:600; }
  th:not(:first-child) { text-align:right; }
  th:nth-child(2) { text-align:left; }
  th:first-child { border-radius:4px 0 0 5px; }
  th:last-child { border-radius:0 5px 5px 0; }
  .summary { margin-top:15px; margin-left:auto; width:375px; }
  .sum-row { display:flex; justify-content:space-between; padding:5px 15px; font-size:12.5px; }
  .sum-row.total { font-weight:bold; font-size:17.5px; color:${p}; border-top:2.5px dashed #cbd5e1; margin-top:5px; padding-top:10px; }
  .words { font-size:12.5px; color:#64748b; font-style:italic; text-align:right; margin-top:10px; }
  .notes { margin-top:20px; padding:15px 20px; background:#f8fafc; border-radius:10px; border-left:3.75px solid ${p}; font-size:12.5px; color:#4b5563; }
  .terms { margin-top:10px; padding:15px 20px; background:#f8fafc; border-radius:10px; border-left:3.75px solid #94a3b8; font-size:12.5px; color:#4b5563; }
  .sig { display:flex; justify-content:flex-end; align-items:center; gap:30px; margin-top:25px; }
  .sig-block { text-align:center; }
  .sig-line { width:150px; height:1.25px; background:#94a3b8; margin:5px auto; }
  .sig-label { font-size:11.25px; color:#64748b; }
  .footer { position:absolute; bottom:30px; left:50px; right:50px; padding-top:15px; border-top:1.25px solid #e2e8f0; font-size:11.25px; color:#64748b; text-align:center; }
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
    <div class="doc-label">QUOTATION</div>
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
    <div class="card-label" style="margin-top:5px;">Valid Until</div>
    <div class="card-value">${esc(d.validDt)}</div>
    ${c.vatReg ? `<div class="card-sub">VAT: ${esc(c.vatReg)}</div>` : ''}
  </div>
</div>

<table>
  <thead>
    <tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
  </thead>
  ${rows}
</table>

<div class="summary">
  <div class="sum-row"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.totalTax > 0 ? `<div class="sum-row"><span>Total Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="sum-row"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="sum-row total"><span>Total</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.notes ? `<div class="notes"><strong>Notes:</strong> ${esc(d.notes)}</div>` : ''}
${d.terms ? `<div class="terms"><strong>Terms:</strong> ${esc(d.terms)}</div>` : ''}

<div class="sig">
  <div class="sig-block">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:32.5px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-label">Authorized Signature</div>
  </div>
  <div class="sig-block" style="text-align:right;">
    <div class="sig-label">${esc(c.name)}</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
