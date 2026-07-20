import { esc } from '@/utils/esc'
import type { QuotTemplateData } from '@/types/template'

export function QuotationProfessional(d: QuotTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#1e3a5f'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:32px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => `
    <tr>
      <td style="padding:4px 6px;border:1px solid #cbd5e1;font-size:9px;text-align:center;">${i + 1}</td>
      <td style="padding:4px 6px;border:1px solid #cbd5e1;font-size:9px;">${esc(item.desc)}</td>
      <td style="padding:4px 6px;border:1px solid #cbd5e1;font-size:9px;text-align:right;">${item.qty}</td>
      <td style="padding:4px 6px;border:1px solid #cbd5e1;font-size:9px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:4px 6px;border:1px solid #cbd5e1;font-size:9px;text-align:right;">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Courier New','Courier','Lucida Sans Typewriter',monospace; color:#1e293b; background:#fff; width:794px; padding:32px 40px; }
  .top-db { border-top:8px solid ${p}; margin:-32px -40px 0 -40px; padding-top:24px; padding-left:40px; padding-right:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
  .brand { display:flex; gap:10px; align-items:center; }
  .brand-name { font-size:13px; font-weight:bold; color:#0f172a; text-transform:uppercase; letter-spacing:1px; }
  .brand-sub { font-size:8px; color:#475569; text-transform:uppercase; margin-top:1px; }
  .right { text-align:right; }
  .doc-box { border:1px solid ${p}; padding:4px 14px; display:inline-block; }
  .doc-box .lbl { font-size:7px; color:#64748b; text-transform:uppercase; }
  .doc-box .no { font-size:11px; font-weight:bold; color:#0f172a; }
  .ledger-hdr { background:${p}; color:#fff; padding:5px 12px; font-size:9px; font-weight:bold; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; }
  .info-grid { display:flex; border:1px solid #cbd5e1; margin-bottom:16px; }
  .info-cell { flex:1; padding:6px 10px; border-right:1px solid #cbd5e1; }
  .info-cell:last-child { border-right:none; }
  .info-cell .lbl { font-size:7px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
  .info-cell .val { font-size:10px; color:#0f172a; font-weight:bold; margin-top:1px; }
  .info-cell .sub { font-size:8px; color:#475569; margin-top:1px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#f1f5f9; color:#475569; font-size:8px; padding:4px 6px; text-align:left; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #cbd5e1; }
  th:nth-child(1){ width:24px; text-align:center; }
  th:nth-child(3), th:nth-child(4), th:nth-child(5){ text-align:right; }
  .total-section { margin-top:12px; border:1px solid ${p}; }
  .total-section .tr { display:flex; justify-content:space-between; padding:4px 12px; font-size:9px; border-bottom:1px solid #e2e8f0; }
  .total-section .tr:last-child { border-bottom:none; background:${p}; color:#fff; font-weight:bold; font-size:12px; padding:7px 12px; }
  .words { font-size:9px; color:#475569; font-style:italic; text-align:right; margin-top:8px; }
  .notes-box { margin-top:12px; padding:8px 10px; border:1px solid #cbd5e1; font-size:9px; color:#475569; }
  .sig-row { display:flex; justify-content:space-between; margin-top:20px; padding-top:10px; border-top:2px solid ${p}; }
  .sig-item { text-align:center; }
  .sig-line { width:130px; height:1px; background:#94a3b8; margin:4px auto; }
  .sig-lbl { font-size:7px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
  .footer { margin-top:16px; padding-top:8px; border-top:1px solid #cbd5e1; font-size:7px; color:#64748b; text-align:center; text-transform:uppercase; }
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
    <div class="doc-box">
      <div class="lbl">Quotation No.</div>
      <div class="no">${esc(d.no)}</div>
    </div>
  </div>
</div>

<div class="ledger-hdr">QUOTATION STATEMENT</div>

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
    <div class="lbl">Valid Until</div>
    <div class="val">${esc(d.validDt)}</div>
  </div>
</div>

<table>
  <thead>
    <tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
  </thead>
  ${rows}
</table>

<div class="total-section">
  <div class="tr"><span>SUBTOTAL</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.vp > 0 ? `<div class="tr"><span>VAT (${d.vp}%)</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="tr"><span>DISCOUNT</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="tr"><span>GRAND TOTAL</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.notes || d.terms ? `<div class="notes-box">
  ${d.notes ? `<div style="margin-bottom:2px;"><strong>Notes:</strong> ${esc(d.notes)}</div>` : ''}
  ${d.terms ? `<div><strong>Terms:</strong> ${esc(d.terms)}</div>` : ''}
</div>` : ''}

<div class="sig-row">
  <div class="sig-item" style="text-align:left;">
    <div class="sig-lbl">Prepared By</div>
    <div style="font-size:9px;font-weight:bold;color:#0f172a;">${esc(c.name)}</div>
  </div>
  <div class="sig-item">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:24px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | T:${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
