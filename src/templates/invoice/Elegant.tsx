import { esc } from '@/utils/esc'
import type { InvTemplateData } from '@/types/template'

export function InvoiceElegant(d:InvTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#8b6914'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:40px;width:auto;" alt="logo"/>` : ''
  const sealHtml = c.seal && c.seal !== c.logo ? `<img src="${esc(c.seal)}" style="height:120px;width:auto;" alt="seal"/>` : ''
  const qrHtml = d.qr || ''

  const rows = d.items.map((item, i) => {
    const taxAmt = item.amount * ((item.taxRate || 0) / 100)
    const total = item.amount + taxAmt
    const taxDisplay = (item.taxRate || 0) > 0 ? item.taxRate + '% (' + d.cur.symbol + taxAmt.toFixed(d.dp) + ')' : '-'
    return `
    <tr${i % 2 === 1 ? ' style="background:#faf6ee;"' : ''}>
      <td style="padding:10px 15px;border-bottom:1.25px solid #d4c5a9;font-size:12.5px;">${esc(item.desc)}</td>
      <td style="padding:10px 15px;border-bottom:1.25px solid #d4c5a9;font-size:12.5px;text-align:right;">${item.qty}</td>
      <td style="padding:10px 15px;border-bottom:1.25px solid #d4c5a9;font-size:12.5px;text-align:right;">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:10px 15px;border-bottom:1.25px solid #d4c5a9;font-size:12.5px;text-align:right;color:#8b7d62;">${taxDisplay}</td>
      <td style="padding:10px 15px;border-bottom:1.25px solid #d4c5a9;font-size:12.5px;text-align:right;font-weight:500;">${d.cur.symbol}${total.toFixed(d.dp)}</td>
    </tr>`}
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Georgia','Times New Roman','Palatino Linotype',serif; color:#2c2416; background:#fdfbf7; width:794px; padding:45px 55px 100px; }
  .vintage-border { position:absolute; top:12.5px; left:12.5px; right:12.5px; bottom:12.5px; border:2.5px solid ${p}55; pointer-events:none; }
  .vintage-border-inner { position:absolute; top:17.5px; left:17.5px; right:17.5px; bottom:17.5px; border:1.25px solid ${p}33; pointer-events:none; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:17.5px; border-bottom:2.5px solid ${p}; margin-bottom:20px; }
  .brand-name { font-size:25px; font-weight:bold; color:#1a150e; letter-spacing:0.375px; }
  .brand-sub { font-size:12.5px; color:#8b7d62; font-style:italic; margin-top:1.25px; }
  .brand-contact { font-size:10px; color:#8b7d62; margin-top:5px; font-style:italic; }
  .right-panel { text-align:right; }
  .right-panel h1 { font-size:30px; font-weight:normal; color:${p}; font-style:italic; letter-spacing:1.875px; }
  .right-panel .no { font-size:12.5px; color:#8b7d62; margin-top:2.5px; font-style:italic; }
  .ornament { text-align:center; font-size:22.5px; color:${p}; letter-spacing:12.5px; margin-bottom:17.5px; opacity:0.7; }
  .info-row { display:flex; gap:30px; margin-bottom:20px; padding:12.5px 17.5px; background:#faf6ee; border:1.25px solid #d4c5a9; }
  .info-block { flex:1; }
  .info-block .lbl { font-size:10px; color:#8b7d62; text-transform:uppercase; letter-spacing:1.25px; font-weight:bold; }
  .info-block .val { font-size:15px; color:#2c2416; font-weight:bold; margin-top:2.5px; }
  .info-block .sub { font-size:11.25px; color:#6b5d4a; margin-top:2.5px; }
  table { width:100%; border-collapse:collapse; }
  th { font-family:'Helvetica','Arial',sans-serif; font-size:10px; color:#8b7d62; font-weight:bold; padding:7.5px 15px; border-bottom:2.5px solid ${p}; text-align:left; text-transform:uppercase; letter-spacing:1px; }
  th:nth-child(2), th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align:right; }
  .total-box { margin-top:17.5px; margin-left:auto; width:350px; border:1.25px solid #d4c5a9; background:#faf6ee; padding:12.5px 17.5px; }
  .total-box .r { display:flex; justify-content:space-between; padding:2.5px 0; font-size:12.5px; color:#4a3f30; }
  .total-box .r.gr { font-weight:bold; font-size:16.25px; color:${p}; border-top:1.25px solid ${p}66; padding-top:6.25px; margin-top:3.75px; }
  .words { font-size:12.5px; color:#8b7d62; font-style:italic; text-align:right; margin-top:10px; }
  .notes { margin-top:17.5px; padding:12.5px 17.5px; border:1.25px solid #d4c5a9; background:#faf6ee; font-size:11.25px; color:#4a3f30; }
  .terms { margin-top:10px; padding:12.5px 17.5px; border:1.25px solid #d4c5a9; background:#faf6ee; font-size:11.25px; color:#4a3f30; }
  .sig-area { margin-top:25px; display:flex; justify-content:flex-end; }
  .sig-box { text-align:center; }
  .sig-line { width:187.5px; height:1.25px; background:#c4b998; margin:5px auto; }
  .sig-lbl { font-size:10px; color:#8b7d62; font-style:italic; }
  .sig-name { font-size:13.75px; font-weight:bold; color:#2c2416; margin-top:2.5px; }
  .footer { position:fixed; bottom:0; left:55px; right:55px; padding-top:12.5px; border-top:1.25px solid #d4c5a9; font-size:10px; color:#8b7d62; text-align:center; font-style:italic; z-index:100; }
</style></head><body>
<div class="vintage-border"></div>
<div class="vintage-border-inner"></div>

<div class="header">
  <div style="display:flex;gap:12.5px;align-items:flex-start;">
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
    <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Tax %</th><th>Total</th></tr>
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
  <div style="display:flex;gap:15px;align-items:center;">
    ${sealHtml}
  </div>
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:32.5px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
    <div class="sig-name">${esc(c.name)}</div>
  </div>
</div>
${qrHtml ? `<div style="text-align:left;margin-top:10px;">${qrHtml}</div>` : ''}

<div class="footer">
  ${esc(c.name)} &mdash; ${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}<br>
   Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
