import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptBeirak(d:RecTemplateData): string {
  const c = d.comp; const DB = '#1e3a5f'; const LB = '#e8edf3'; const p = d.pc || DB
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:37.5px;width:auto;" alt="logo"/>` : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:50px 50px 100px; }
  .border-frame { position:absolute; top:10px; left:10px; right:10px; bottom:10px; border:3.75px solid ${DB}; pointer-events:none; }
  .header { text-align:center; padding-bottom:17.5px; border-bottom:2.5px solid ${DB}; margin-bottom:20px; }
  .header .brand { display:flex; align-items:center; justify-content:center; gap:12.5px; }
  .header .name { font-size:18.75px; font-weight:bold; color:${DB}; }
  .header .sub { font-size:11.25px; color:#4b5563; margin-top:2.5px; }
  .title-badge { display:inline-block; border:2.5px solid ${DB}; color:${DB}; font-size:17.5px; font-weight:bold; padding:5px 30px; margin-top:7.5px; letter-spacing:2.5px; }
  .info-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  .info-table td { padding:5px 10px; font-size:12.5px; border:1.25px solid #c5ced9; vertical-align:top; }
  .info-table td:first-child { background:${DB}; color:#fff; font-weight:bold; width:125px; text-align:center; }
  .amount-box { border:2.5px solid ${DB}; padding:20px 25px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; background:${LB}; }
  .amount-box .lbl { font-size:11.25px; color:#64748b; font-weight:bold; text-transform:uppercase; }
  .amount-box .num { font-size:27.5px; font-weight:bold; color:${p}; }
  .amount-box .words { font-size:12.5px; color:#4b5563; font-style:italic; margin-top:5px; }
  .details { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:15px; }
  .det { flex:1; min-width:125px; padding:7.5px 12.5px; border:1.25px solid #c5ced9; }
  .det .lbl { font-size:10px; color:#64748b; text-transform:uppercase; font-weight:bold; }
  .det .v { font-size:12.5px; color:#1e293b; margin-top:2.5px; }
  .sig-section { display:flex; justify-content:space-between; margin-top:25px; padding-top:15px; border-top:2.5px solid ${DB}; }
  .sig-block { text-align:center; flex:1; }
  .sig-line { width:162.5px; height:2.5px; background:${DB}; margin:5px auto; }
  .sig-label { font-size:11.25px; color:#64748b; }
  .sig-name { font-size:12.5px; font-weight:bold; color:${DB}; }
  .footer { position:fixed; bottom:0; left:50px; right:50px; padding-top:12.5px; border-top:1.25px solid ${DB}; text-align:center; font-size:11.25px; color:#64748b; z-index:100; }
</style></head><body>
<div class="border-frame"></div>

<div class="header">
  <div class="brand">
    ${logoHtml}
    <div>
      <div class="name">${esc(c.name)}</div>
      ${c.sub ? `<div class="sub">${esc(c.sub)}</div>` : ''}
      <div style="font-size:11.25px;color:#64748b;">${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}</div>
    </div>
  </div>
  <div class="title-badge">RECEIPT VOUCHER</div>
</div>

<table class="info-table">
  <tr>
    <td>Receipt No.</td>
    <td>${esc(d.no)}</td>
    <td>Date</td>
    <td>${esc(d.dt)}</td>
  </tr>
  <tr>
    <td>Received From</td>
    <td colspan="3">${esc(d.rf)}</td>
  </tr>
</table>

<div class="amount-box">
  <div>
    <div class="lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    ${d.totalTax > 0 ? `<div style="font-size:11.25px;color:#64748b;margin-bottom:2.5px;">Subtotal:${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:11.25px;color:#64748b;margin-bottom:2.5px;">Total Tax:${d.cur.symbol}${d.tv}</div>` : ''}
    <div class="num">${d.cur.symbol}${d.totalTax > 0 ? (d.am + d.totalTax).toFixed(d.dp) : d.amFmt}</div>
    <div style="font-size:12.5px;color:#64748b;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="details">
  ${d.pm ? `<div class="det">
    <div class="lbl">Payment</div>
    <div class="v">${esc(d.pm)}</div>
  </div>` : ''}
  ${d.ch ? `<div class="det"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
  <div class="det"><div class="lbl">Purpose</div><div class="v">${d.bg ? esc(d.bg) : '—'}</div></div>
</div>

<div class="sig-section">
  <div class="sig-block" style="text-align:left;">
    <div class="sig-label">Receiver</div>
    <div class="sig-line" style="margin:5px 0;"></div>
    ${d.rv ? `<div class="sig-name">${esc(d.rv)}</div>` : ''}
  </div>
  <div class="sig-block">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:32.5px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-label">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-block" style="text-align:right;"><div class="sig-line" style="margin:5px 0 5px auto;"></div><div class="sig-label">Signatory</div><div class="sig-name">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)} &mdash; ${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}<br>
  ${esc(d.no)} &middot; Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
