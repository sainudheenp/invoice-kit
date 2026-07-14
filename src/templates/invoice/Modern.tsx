import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceModern(d: InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#D97706'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:32px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => `
    <tr${i % 2 === 1 ? ' style="background:#f1f5f9;"' : ''}>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;">${i + 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;">${esc(item.desc)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:right;">${item.qty}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;font-size:10px;text-align:right;">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  const contactLine = [c.tel, c.email].filter(Boolean).join(' | ')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:32px 40px; }
  .sidebar { position:absolute; top:0; left:0; width:4px; height:1123px; background:linear-gradient(to bottom, ${p}, ${p}88); }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding:16px 20px; background:#f8fafc; border-radius:8px; margin-bottom:20px; }
  .brand { display:flex; gap:10px; align-items:center; }
  .doc-label { font-size:10px; color:${p}; font-weight:bold; letter-spacing:2px; border-left:3px solid ${p}; padding-left:8px; }
  .title { font-size:13px; color:#1f2937; font-weight:bold; margin-top:2px; }
  .info-grid { display:flex; gap:24px; margin-bottom:20px; }
  .card { padding:12px 16px; background:#f8fafc; border-radius:8px; flex:1; }
  .card-label { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
  .card-value { font-size:11px; font-weight:bold; color:#1f2937; }
  .card-sub { font-size:9px; color:#4b5563; margin-top:2px; }
  table { width:100%; border-collapse:separate; border-spacing:0 2px; margin-top:8px; }
  th { background:${p}; color:#fff; font-size:9px; padding:6px 8px; text-align:left; font-weight:600; }
  th:not(:first-child) { text-align:right; }
  th:nth-child(2) { text-align:left; }
  th:first-child { border-radius:4px 0 0 4px; }
  th:last-child { border-radius:0 4px 4px 0; }
  .summary { margin-top:12px; margin-left:auto; width:300px; }
  .sum-row { display:flex; justify-content:space-between; padding:4px 12px; font-size:10px; }
  .sum-row.total { font-weight:bold; font-size:14px; color:${p}; border-top:2px dashed #cbd5e1; margin-top:4px; padding-top:8px; }
  .words { font-size:10px; color:#64748b; font-style:italic; text-align:right; margin-top:8px; }
  .notes { margin-top:16px; padding:12px 16px; background:#f8fafc; border-radius:8px; font-size:10px; color:#4b5563; }
  .footer { position:absolute; bottom:24px; left:40px; right:40px; padding-top:12px; border-top:1px solid #e2e8f0; font-size:9px; color:#64748b; text-align:center; }
  .sig { display:flex; justify-content:flex-end; align-items:center; gap:24px; margin-top:16px; padding-right:20px; }
  .sig-block { text-align:center; }
  .sig-line { width:100px; height:1px; background:#94a3b8; margin:4px auto; }
  .sig-label { font-size:9px; color:#64748b; }
</style></head><body>
<div class="sidebar"></div>

<div class="header">
  <div class="brand">
    ${logoHtml}
    <div>
      <div style="font-size:13px;font-weight:bold;">${esc(c.name)}</div>
      ${c.sub ? `<div style="font-size:9px;color:#4b5563;">${esc(c.sub)}</div>` : ''}
    </div>
  </div>
  <div style="text-align:right;">
    <div class="doc-label">INVOICE</div>
    <div style="font-size:10px;color:#4b5563;margin-top:2px;">${esc(d.no)}</div>
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
  <tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
  ${rows}
</table>

<div class="summary">
  <div class="sum-row"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.vp > 0 ? `<div class="sum-row"><span>VAT (${d.vp}%)</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="sum-row"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="sum-row total"><span>Total</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.pd || d.notes || c.invTerms ? `<div class="notes">
  ${d.pd ? `<div style="margin-bottom:4px;"><strong>Payment:</strong> ${esc(d.pd)}</div>` : ''}
  ${d.notes ? `<div>${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:4px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig">
  ${c.signature ? `<div class="sig-block">${c.signature ? `<img src="${esc(c.signature)}" style="height:28px;width:auto;" alt="sig"/>` : ''}<div class="sig-line"></div><div class="sig-label">Authorized Signature</div></div>` : ''}
  <div class="sig-block" style="text-align:right;">
    <div class="sig-label">${esc(c.name)}</div>
    ${contactLine ? `<div class="sig-label">${esc(contactLine)}</div>` : ''}
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}${contactLine ? ` | ${esc(contactLine)}` : ''}
  ${c.bankName ? `<br>${c.bankName}${c.bankAcc ? ` - ${c.bankAcc}` : ''}${c.bankIban ? ` (${c.bankIban})` : ''}` : ''}
</div>
</body></html>`
}
