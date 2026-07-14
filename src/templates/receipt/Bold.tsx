import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptBold(d: RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#dc2626'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:34px;width:auto;" alt="logo"/>` : ''

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
  .info-strip { display:flex; gap:0; margin-bottom:20px; border:2px solid #000; }
  .info-cell { flex:1; padding:10px 16px; border-right:1px solid #000; }
  .info-cell:last-child { border-right:none; }
  .info-cell .lbl { font-size:8px; color:#666; text-transform:uppercase; font-weight:bold; letter-spacing:0.5px; }
  .info-cell .val { font-size:13px; font-weight:bold; color:#000; margin-top:2px; }
  .amount-block { border:3px solid #000; padding:20px 24px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; }
  .amount-block .lbl { font-size:9px; color:#666; text-transform:uppercase; font-weight:bold; }
  .amount-block .num { font-size:28px; font-weight:900; color:${p}; }
  .amount-block .words { font-size:10px; color:#666; font-style:italic; margin-top:4px; }
  .details { display:flex; flex-wrap:wrap; gap:2px; margin-bottom:16px; }
  .det { flex:1; min-width:100px; padding:8px 12px; border:1px solid #000; background:#f9f9f9; }
  .det .lbl { font-size:7px; color:#666; text-transform:uppercase; font-weight:bold; }
  .det .v { font-size:10px; color:#000; font-weight:bold; margin-top:2px; }
  .sig { margin-top:20px; display:flex; justify-content:space-between; align-items:flex-start; }
  .sig-b { text-align:center; flex:1; }
  .sig-line { width:140px; height:2px; background:#000; margin:4px auto; }
  .sig-label { font-size:9px; color:#666; font-weight:bold; text-transform:uppercase; }
  .footer { background:#000; color:#fff; padding:14px 48px; font-size:9px; text-align:center; }
</style></head><body>
<div class="top-black">
  <div>
    <h1>Receipt</h1>
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
  <div class="info-strip">
    <div class="info-cell">
      <div class="lbl">Received From</div>
      <div class="val">${esc(d.rf)}</div>
    </div>
    <div class="info-cell">
      <div class="lbl">Date</div>
      <div class="val">${esc(d.dt)}</div>
    </div>
    <div class="info-cell">
      <div class="lbl">Payment</div>
      <div class="val">${esc(d.pm)}</div>
    </div>
  </div>

  <div class="amount-block">
    <div>
      <div class="lbl">Amount Received</div>
      ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
      ${d.bg ? `<div style="font-size:9px;color:#666;margin-top:4px;"><strong>PURPOSE:</strong> ${esc(d.bg)}</div>` : ''}
    </div>
    <div style="text-align:right;">
      <div class="num">${d.cur.symbol}${d.amFmt}</div>
      <div style="font-size:10px;color:#666;text-align:right;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
    </div>
  </div>

  <div class="details">
    ${d.ch ? `<div class="det"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
    ${d.bk ? `<div class="det"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
    ${d.td ? `<div class="det"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
  </div>

  <div class="sig">
    <div></div>
    <div class="sig-b">
      ${c.signature ? `<img src="${esc(c.signature)}" style="height:28px;width:auto;" alt="sig"/>` : ''}
      <div class="sig-line"></div>
      <div class="sig-label">Authorized Signature</div>
    </div>
    ${d.sg ? `<div class="sig-b" style="text-align:right;"><div class="sig-line" style="margin:4px 0 4px auto;"></div><div class="sig-label">Signatory</div><div style="font-size:11px;font-weight:bold;color:#000;">${esc(d.sg)}</div></div>` : ''}
  </div>
</div>

<div class="footer">
  <strong>${esc(c.name)}</strong>${c.loc ? ` &mdash; ${esc(c.loc)}` : ''}<br>
  ${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
