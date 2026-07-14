import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceMinimal(d: InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#94a3b8'

  const rows = d.items.map((item, i) => `
    <tr>
      <td style="padding:3px 0;font-size:9px;color:#475569;text-align:center;">${i + 1}</td>
      <td style="padding:3px 0;font-size:9px;color:#334155;">${esc(item.desc)}</td>
      <td style="padding:3px 0;font-size:9px;color:#475569;text-align:right;">${item.qty}</td>
      <td style="padding:3px 0;font-size:9px;color:#475569;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:3px 0;font-size:9px;color:#334155;text-align:right;font-weight:500;">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica Neue','Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:52px 60px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; }
  .co-name { font-size:13px; font-weight:600; color:#0f172a; letter-spacing:-0.2px; }
  .co-sub { font-size:8px; color:#94a3b8; margin-top:1px; }
  .doc-type { font-size:9px; color:#94a3b8; font-weight:500; letter-spacing:2px; text-transform:uppercase; }
  .doc-no { font-size:9px; color:#94a3b8; margin-top:2px; }
  .rules { margin-bottom:28px; }
  .rules .top { display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid #e2e8f0; }
  .rules .lbl { font-size:7px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:2px; }
  .rules .val { font-size:10px; color:#0f172a; font-weight:600; }
  .rules .sub { font-size:8px; color:#64748b; margin-top:1px; }
  table { width:100%; border-collapse:collapse; }
  th { font-size:7px; color:#94a3b8; font-weight:500; padding:3px 0; border-bottom:1px solid #e2e8f0; text-align:left; text-transform:uppercase; letter-spacing:0.8px; }
  th:nth-child(1){ width:20px; text-align:center; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5){ text-align:right; }
  .spacer { height:8px; }
  .total-line { display:flex; justify-content:space-between; padding:2px 0; font-size:9px; color:#64748b; }
  .total-line.final { font-size:12px; font-weight:600; color:#0f172a; border-top:1px solid #e2e8f0; padding-top:5px; margin-top:2px; }
  .total-line.final span:last-child { color:${p}; }
  .words { font-size:8px; color:#94a3b8; font-style:italic; text-align:right; margin-top:6px; }
  .section { margin-top:20px; padding-top:12px; border-top:1px solid #e2e8f0; font-size:8px; color:#64748b; }
  .section-title { font-size:7px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px; }
  .sig { margin-top:28px; display:flex; justify-content:flex-end; }
  .sig-box { text-align:center; }
  .sig-line { width:120px; height:1px; background:#cbd5e1; margin:3px auto; }
  .sig-lbl { font-size:7px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; }
  .footer { margin-top:32px; padding-top:12px; border-top:1px solid #e2e8f0; font-size:7px; color:#94a3b8; text-align:center; letter-spacing:0.3px; }
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
  <tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
  ${rows}
</table>

<div class="spacer"></div>
<div class="total-line"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
${d.vp > 0 ? `<div class="total-line"><span>VAT (${d.vp}%)</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
${d.disc > 0 ? `<div class="total-line"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
<div class="total-line final"><span>Grand Total</span><span>${d.cur.symbol}${d.gv}</span></div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.pd || d.notes || c.invTerms ? `<div class="section">
  ${d.pd ? `<div class="section-title">Payment</div><div>${esc(d.pd)}</div>` : ''}
  ${d.notes ? `<div style="margin-top:4px;">${esc(d.notes)}</div>` : ''}
  ${c.invTerms ? `<div style="margin-top:4px;">${esc(c.invTerms)}</div>` : ''}
</div>` : ''}

<div class="sig">
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:20px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
</div>
</body></html>`
}
