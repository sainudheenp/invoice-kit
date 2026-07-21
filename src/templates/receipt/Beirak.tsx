import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptBeirak(d: RecTemplateData): string {
  const c = d.comp; const DB = '#1e3a5f'; const LB = '#e8edf3'; const p = d.pc || DB
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:30px;width:auto;" alt="logo"/>` : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:40px; }
  .border-frame { position:absolute; top:8px; left:8px; right:8px; bottom:8px; border:3px solid ${DB}; pointer-events:none; }
  .header { text-align:center; padding-bottom:14px; border-bottom:2px solid ${DB}; margin-bottom:16px; }
  .header .brand { display:flex; align-items:center; justify-content:center; gap:10px; }
  .header .name { font-size:15px; font-weight:bold; color:${DB}; }
  .header .sub { font-size:9px; color:#4b5563; margin-top:2px; }
  .title-badge { display:inline-block; border:2px solid ${DB}; color:${DB}; font-size:14px; font-weight:bold; padding:4px 24px; margin-top:6px; letter-spacing:2px; }
  .info-table { width:100%; border-collapse:collapse; margin-bottom:16px; }
  .info-table td { padding:4px 8px; font-size:10px; border:1px solid #c5ced9; vertical-align:top; }
  .info-table td:first-child { background:${DB}; color:#fff; font-weight:bold; width:100px; text-align:center; }
  .amount-box { border:2px solid ${DB}; padding:16px 20px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; background:${LB}; }
  .amount-box .lbl { font-size:9px; color:#64748b; font-weight:bold; text-transform:uppercase; }
  .amount-box .num { font-size:22px; font-weight:bold; color:${p}; }
  .amount-box .words { font-size:10px; color:#4b5563; font-style:italic; margin-top:4px; }
  .details { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
  .det { flex:1; min-width:100px; padding:6px 10px; border:1px solid #c5ced9; }
  .det .lbl { font-size:8px; color:#64748b; text-transform:uppercase; font-weight:bold; }
  .det .v { font-size:10px; color:#1e293b; margin-top:2px; }
  .sig-section { display:flex; justify-content:space-between; margin-top:20px; padding-top:12px; border-top:2px solid ${DB}; }
  .sig-block { text-align:center; flex:1; }
  .sig-line { width:130px; height:2px; background:${DB}; margin:4px auto; }
  .sig-label { font-size:9px; color:#64748b; }
  .sig-name { font-size:10px; font-weight:bold; color:${DB}; }
  .footer { margin-top:16px; padding-top:10px; border-top:1px solid ${DB}; text-align:center; font-size:9px; color:#64748b; }
</style></head><body>
<div class="border-frame"></div>

<div class="header">
  <div class="brand">
    ${logoHtml}
    <div>
      <div class="name">${esc(c.name)}</div>
      ${c.sub ? `<div class="sub">${esc(c.sub)}</div>` : ''}
      <div style="font-size:9px;color:#64748b;">${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}</div>
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
    ${d.totalTax > 0 ? `<div style="font-size:9px;color:#64748b;margin-bottom:2px;">Subtotal: ${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:9px;color:#64748b;margin-bottom:2px;">Total Tax: ${d.cur.symbol}${d.tv}</div>` : ''}
    <div class="num">${d.cur.symbol}${d.totalTax > 0 ? (d.am + d.totalTax).toFixed(d.dp) : d.amFmt}</div>
    <div style="font-size:10px;color:#64748b;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="details">
  <div class="det">
    <div class="lbl">Payment</div>
    <div class="v">${esc(d.pm)}</div>
  </div>
  ${d.ch ? `<div class="det"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
  ${d.bg ? `<div class="det"><div class="lbl">Purpose</div><div class="v">${esc(d.bg)}</div></div>` : ''}
</div>

<div class="sig-section">
  <div class="sig-block" style="text-align:left;">
    <div class="sig-label">Receiver</div>
    <div class="sig-line" style="margin:4px 0;"></div>
    ${d.rv ? `<div class="sig-name">${esc(d.rv)}</div>` : ''}
  </div>
  <div class="sig-block">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:26px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-label">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-block" style="text-align:right;"><div class="sig-line" style="margin:4px 0 4px auto;"></div><div class="sig-label">Signatory</div><div class="sig-name">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)} &mdash; ${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
