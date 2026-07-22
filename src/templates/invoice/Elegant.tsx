import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceElegant(d: InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#8b6914'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:32px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + d.cur.symbol + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr${i % 2 === 1 ? ' style="background:#faf6ee;"' : ''}>
      <td style="padding:8px 12px;border-bottom:1px solid #d4c5a9;font-size:10px;">${esc(item.desc)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #d4c5a9;font-size:10px;text-align:right;">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #d4c5a9;font-size:10px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #d4c5a9;font-size:10px;text-align:right;color:#8b7d62;">${taxDisplay}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #d4c5a9;font-size:10px;text-align:right;font-weight:500;">${d.cur.symbol}${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Georgia','Times New Roman','Palatino Linotype',serif; color:#2c2416; background:#fdfbf7; width:794px; padding:36px 44px; }
  .vintage-border { position:absolute; top:10px; left:10px; right:10px; bottom:10px; border:2px solid ${p}55; pointer-events:none; }
  .vintage-border-inner { position:absolute; top:14px; left:14px; right:14px; bottom:14px; border:1px solid ${p}33; pointer-events:none; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:14px; border-bottom:2px solid ${p}; margin-bottom:16px; }
  .brand-name { font-size:20px; font-weight:bold; color:#1a150e; letter-spacing:0.3px; }
  .brand-sub { font-size:10px; color:#8b7d62; font-style:italic; margin-top:1px; }
  .brand-contact { font-size:8px; color:#8b7d62; margin-top:4px; font-style:italic; }
  .right-panel { text-align:right; }
  .right-panel h1 { font-size:24px; font-weight:normal; color:${p}; font-style:italic; letter-spacing:1.5px; }
  .right-panel .no { font-size:10px; color:#8b7d62; margin-top:2px; font-style:italic; }
  .ornament { text-align:center; font-size:18px; color:${p}; letter-spacing:10px; margin-bottom:14px; opacity:0.7; }
  .info-row { display:flex; gap:24px; margin-bottom:16px; padding:10px 14px; background:#faf6ee; border:1px solid #d4c5a9; }
  .info-block { flex:1; }
  .info-block .lbl { font-size:8px; color:#8b7d62; text-transform:uppercase; letter-spacing:1px; font-weight:bold; }
  .info-block .val { font-size:12px; color:#2c2416; font-weight:bold; margin-top:2px; }
  .info-block .sub { font-size:9px; color:#6b5d4a; margin-top:2px; }
  table { width:100%; border-collapse:collapse; }
  th { font-family:'Helvetica','Arial',sans-serif; font-size:8px; color:#8b7d62; font-weight:bold; padding:6px 12px; border-bottom:2px solid ${p}; text-align:left; text-transform:uppercase; letter-spacing:0.8px; }
  th:nth-child(2), th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align:right; }
  .total-box { margin-top:14px; margin-left:auto; width:280px; border:1px solid #d4c5a9; background:#faf6ee; padding:10px 14px; }
  .total-box .r { display:flex; justify-content:space-between; padding:2px 0; font-size:10px; color:#4a3f30; }
  .total-box .r.gr { font-weight:bold; font-size:13px; color:${p}; border-top:1px solid ${p}66; padding-top:5px; margin-top:3px; }
  .words { font-size:10px; color:#8b7d62; font-style:italic; text-align:right; margin-top:8px; }
  .notes { margin-top:14px; padding:10px 14px; border:1px solid #d4c5a9; background:#faf6ee; font-size:9px; color:#4a3f30; }
  .terms { margin-top:8px; padding:10px 14px; border:1px solid #d4c5a9; background:#faf6ee; font-size:9px; color:#4a3f30; }
  .sig-area { margin-top:20px; display:flex; justify-content:flex-end; }
  .sig-box { text-align:center; }
  .sig-line { width:150px; height:1px; background:#c4b998; margin:4px auto; }
  .sig-lbl { font-size:8px; color:#8b7d62; font-style:italic; }
  .sig-name { font-size:11px; font-weight:bold; color:#2c2416; margin-top:2px; }
  .footer { margin-top:20px; padding-top:10px; border-top:1px solid #d4c5a9; font-size:8px; color:#8b7d62; text-align:center; font-style:italic; }
</style></head><body>
<div class="vintage-border"></div>
<div class="vintage-border-inner"></div>

<div class="header">
  <div style="display:flex;gap:10px;align-items:flex-start;">
    ${logoHtml}
    <div>
      <div class="brand-name">${esc(c.name)}</div>
      ${c.sub ? `<div class="brand-sub">${esc(c.sub)}</div>` : ''}
      <div class="brand-contact">${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' &bull; ')}</div>
    </div>
  </div>
  <div class="right-panel">
    <h1>Invoice</h1>
    <div class="no">${esc(d.no)}</div>
  </div>
</div>

<div class="ornament">&loz; &loz; &loz;</div>

<div class="info-row">
  <div class="info-block">
    <div class="lbl">Bill To</div>
    <div class="val">${esc(d.cust)}</div>
    <div class="sub">${[d.addr, d.ph, d.cr, d.em].filter(Boolean).map(esc).join(' &bull; ')}</div>
  </div>
  <div class="info-block" style="text-align:right;">
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

<div class="total-box">
  <div class="r"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
  ${d.totalTax > 0 ? `<div class="r"><span>Tax</span><span>${d.cur.symbol}${d.tv}</span></div>` : ''}
  ${d.disc > 0 ? `<div class="r"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
  <div class="r gr"><span>Grand Total</span><span>${d.cur.symbol}${d.gv}</span></div>
</div>

${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

${d.notes ? `<div class="notes"><strong>Notes:</strong> ${esc(d.notes)}</div>` : ''}
${c.invTerms ? `<div class="terms"><strong>Terms:</strong> ${esc(c.invTerms)}</div>` : ''}

<div class="sig-area">
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:26px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
    <div class="sig-name">${esc(c.name)}</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)} &mdash; ${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
