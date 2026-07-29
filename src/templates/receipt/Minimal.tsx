import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptMinimal(d:RecTemplateData): string {
  const c = d.comp

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica Neue','Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:65px 75px 100px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
  .co-name { font-size:15px; font-weight:600; color:#0f172a; letter-spacing:-0.2px; }
  .co-sub { font-size:10px; color:#94a3b8; margin-top:1.25px; }
  .doc-type { font-size:11.25px; color:#94a3b8; font-weight:500; letter-spacing:2.5px; text-transform:uppercase; }
  .doc-no { font-size:11.25px; color:#94a3b8; margin-top:2.5px; }
  .info-line { display:flex; gap:40px; padding-bottom:12.5px; border-bottom:1.25px solid #e2e8f0; margin-bottom:25px; }
  .info-line .lbl { font-size:8.75px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:2.5px; }
  .info-line .val { font-size:12.5px; color:#0f172a; font-weight:600; }
  .amount { display:flex; justify-content:space-between; align-items:center; padding:17.5px 0; border-bottom:1.25px solid #e2e8f0; margin-bottom:20px; }
  .amount .lbl { font-size:8.75px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; }
  .amount .num { font-size:22.5px; font-weight:600; color:#0f172a; }
  .amount .words { font-size:10px; color:#94a3b8; font-style:italic; margin-top:2.5px; }
  .det { display:flex; flex-wrap:wrap; gap:5px 30px; margin-bottom:20px; }
  .det-item .lbl { font-size:8.75px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.625px; }
  .det-item .v { font-size:11.25px; color:#334155; margin-top:1.25px; }
  .sig { margin-top:35px; display:flex; justify-content:flex-end; }
  .sig-box { text-align:center; }
  .sig-line { width:150px; height:1.25px; background:#cbd5e1; margin:3.75px auto; }
  .sig-lbl { font-size:8.75px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.625px; }
  .footer { position:fixed; bottom:0; left:75px; right:75px; padding-top:15px; border-top:1.25px solid #e2e8f0; font-size:8.75px; color:#94a3b8; text-align:center; letter-spacing:0.375px; z-index:100; }
</style></head><body>
<div class="header">
  <div>
    <div class="co-name">${esc(c.name)}</div>
    ${c.sub ? `<div class="co-sub">${esc(c.sub)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    <div class="doc-type">Receipt</div>
    <div class="doc-no">${esc(d.no)}</div>
  </div>
</div>

<div class="info-line">
  <div>
    <div class="lbl">Received From</div>
    <div class="val">${esc(d.rf)}</div>
  </div>
  <div>
    <div class="lbl">Date</div>
    <div class="val">${esc(d.dt)}</div>
  </div>
  ${d.pm ? `<div>
    <div class="lbl">Payment</div>
    <div class="val">${esc(d.pm)}</div>
  </div>` : ''}
</div>

<div class="amount">
  <div>
    <div class="lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    ${d.totalTax > 0 ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:2.5px;">Subtotal:${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:10px;color:#94a3b8;margin-bottom:2.5px;">Total Tax:${d.cur.symbol}${d.tv}</div>` : ''}
    <div class="num">${d.cur.symbol}${d.totalTax > 0 ? (d.am + d.totalTax).toFixed(d.dp) : d.amFmt}</div>
    <div style="font-size:10px;color:#94a3b8;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="det">
  ${d.ch ? `<div class="det-item"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det-item"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det-item"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
  <div class="det-item"><div class="lbl">Purpose</div><div class="v">${d.bg ? esc(d.bg) : '—'}</div></div>
</div>

<div class="sig">
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:25px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}<br>
   Thank you for choosing ${esc(c.name)}
</div>
</body></html>`
}
