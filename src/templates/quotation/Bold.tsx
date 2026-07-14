import { esc } from '@/utils/esc'
import type { QuotTemplateData } from '@/types/template'

export function QuotationBold(d: QuotTemplateData): string {
  const c = d.comp; const p = c.pcolor || '#dc2626'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:34px;width:auto;" alt="logo"/>` : ''

  const rows = d.items.map((item, i) => `
    <tr${i % 2 === 1 ? ' style="background:#fef2f2;"' : ''}>
      <td style="padding:6px 8px;border-bottom:2px solid #000;font-size:11px;font-weight:${i % 2 === 1 ? 'normal' : 'bold'};">${i + 1}</td>
      <td style="padding:6px 8px;border-bottom:2px solid #000;font-size:11px;font-weight:${i % 2 === 1 ? 'normal' : 'bold'};">${esc(item.desc)}</td>
      <td style="padding:6px 8px;border-bottom:2px solid #000;font-size:11px;text-align:right;font-weight:${i % 2 === 1 ? 'normal' : 'bold'};">${item.qty}</td>
      <td style="padding:6px 8px;border-bottom:2px solid #000;font-size:11px;text-align:right;font-weight:${i % 2 === 1 ? 'normal' : 'bold'};">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:6px 8px;border-bottom:2px solid #000;font-size:11px;text-align:right;font-weight:${i % 2 === 1 ? 'normal' : 'bold'};">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#000; background:#fff; width:794px; padding:0; }
  .top-black { background:#000; padding:24px 48px; display:flex; justify-content:space-between; align-items:center; }
  .top-black h1 { color:#fff; font-size:26px; font-weight:900; letter-spacing:2px; text-transform:uppercase; }
  .top-black .no { color:#aaa; font-size:11px; font-weight:bold; margin-top:2px; }
  .brand-area { padding:16px 48px 0; display:flex; gap:10px; align-items:center; }
  .brand-name { font-size:16px; font-weight:900; color:#000; text-transform:uppercase; }
  .brand-sub { font-size:9px; color:#666; font-weight:bold; text-transform:uppercase; }
  .body { padding:16px 48px 32px; }
  .info { display:flex; justify-content:space-between; margin-bottom:20px; padding:12px 0; border-top:3px solid #000; border-bottom:3px solid #000; }
  .info .lbl { font-size:8px; color:#666; text-transform:uppercase; letter-spacing:1px; font-weight:bold; }
  .info .val { font-size:12px; color:#000; font-weight:bold; margin-top:2px; }
  .info .sub { font-size:9px; color:#444; }
  table { width:100%; border-collapse:collapse; }
  th { background:#000; color:#fff; font-size:9px; padding:8px; text-align:left; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px; }
  th:not(:first-child){ text-align:right; }
  th:nth-child(2){ text-align:left; }
  .total { margin-top:16px; margin-left:auto; width:300px; }
  .t { display:flex; justify-content:space-between; padding:5px 0; font-size:11px; font-weight:bold; border-bottom:1px solid #ddd; }
  .t.gr { font-size:16px; color:${p}; border-bottom:3px solid #000; padding:8px 0; margin-top:4px; }
  .words { font-size:10px; color:#666; font-style:italic; text-align:right; margin-top:8px; }
  .notes { margin-top:16px; padding:12px 16px; background:#f9f9f9; border-left:4px solid ${p}; font-size:10px; color:#333; }
  .terms { margin-top:8px; padding:12px 16px; background:#f9f9f9; border-left:4px solid #94a3b8; font-size:10px; color:#333; }
  .sig { margin-top:24px; display:flex; justify-content:flex-end; }
  .sig-b { text-align:center; }
  .sig-line { width:140px; height:2px; background:#000; margin:4px auto; }
  .sig-label { font-size:9px; color:#666; font-weight:bold; text-transform:uppercase; }
  .footer { background:#000; color:#fff; padding:14px 48px; font-size:9px; text-align:center; }
</style></head><body>
<div class="top-black">
  <div>
    <h1>Quotation</h1>
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
      <div class="lbl" style="margin-top:4px;">Valid Until</div>
      <div class="val">${esc(d.validDt)}</div>
      ${c.vatReg ? `<div class="sub">VAT: ${esc(c.vatReg)}</div>` : ''}
    </div>
  </div>

  <table>
    <tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
    ${rows}
  </table>

  <div class="total">
    <div class="t"><span>Subtotal</span><span>${d.cur.symbol}${d.sv}</span></div>
    ${d.vp > 0 ? `<div class="t"><span>VAT (${d.vp}%)</span><span>${d.cur.symbol}${d.vv}</span></div>` : ''}
    ${d.disc > 0 ? `<div class="t"><span>Discount</span><span>-${d.cur.symbol}${d.dv}</span></div>` : ''}
    <div class="t gr"><span>Grand Total</span><span>${d.cur.symbol}${d.gv}</span></div>
  </div>

  ${d.gw ? `<div class="words">${esc(d.gw)}</div>` : ''}

  ${d.notes ? `<div class="notes"><strong>NOTES:</strong> ${esc(d.notes)}</div>` : ''}
  ${d.terms ? `<div class="terms"><strong>TERMS:</strong> ${esc(d.terms)}</div>` : ''}

  <div class="sig">
    <div class="sig-b">
      ${c.signature ? `<img src="${esc(c.signature)}" style="height:28px;width:auto;" alt="sig"/>` : ''}
      <div class="sig-line"></div>
      <div class="sig-label">Authorized Signature</div>
    </div>
  </div>
</div>

<div class="footer">
  <strong>${esc(c.name)}</strong>${c.loc ? ` &mdash; ${esc(c.loc)}` : ''}<br>
  ${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
