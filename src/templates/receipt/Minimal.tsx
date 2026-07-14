import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptMinimal(d: RecTemplateData): string {
  const c = d.comp

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica Neue','Helvetica','Arial',sans-serif; color:#1e293b; background:#fff; width:794px; padding:52px 60px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
  .co-name { font-size:12px; font-weight:600; color:#0f172a; letter-spacing:-0.2px; }
  .co-sub { font-size:8px; color:#94a3b8; margin-top:1px; }
  .doc-type { font-size:9px; color:#94a3b8; font-weight:500; letter-spacing:2px; text-transform:uppercase; }
  .doc-no { font-size:9px; color:#94a3b8; margin-top:2px; }
  .info-line { display:flex; gap:32px; padding-bottom:10px; border-bottom:1px solid #e2e8f0; margin-bottom:20px; }
  .info-line .lbl { font-size:7px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:2px; }
  .info-line .val { font-size:10px; color:#0f172a; font-weight:600; }
  .amount { display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-bottom:1px solid #e2e8f0; margin-bottom:16px; }
  .amount .lbl { font-size:7px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; }
  .amount .num { font-size:18px; font-weight:600; color:#0f172a; }
  .amount .words { font-size:8px; color:#94a3b8; font-style:italic; margin-top:2px; }
  .det { display:flex; flex-wrap:wrap; gap:4px 24px; margin-bottom:16px; }
  .det-item .lbl { font-size:7px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; }
  .det-item .v { font-size:9px; color:#334155; margin-top:1px; }
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
  <div>
    <div class="lbl">Payment</div>
    <div class="val">${esc(d.pm)}</div>
  </div>
</div>

<div class="amount">
  <div>
    <div class="lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    <div class="num">${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:8px;color:#94a3b8;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="det">
  ${d.ch ? `<div class="det-item"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det-item"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det-item"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
  ${d.bg ? `<div class="det-item"><div class="lbl">Purpose</div><div class="v">${esc(d.bg)}</div></div>` : ''}
</div>

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
