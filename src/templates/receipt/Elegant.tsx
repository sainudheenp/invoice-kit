import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptElegant(d: RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#8b6914'

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Georgia','Times New Roman','Palatino Linotype',serif; color:#2c2416; background:#fdfbf7; width:794px; padding:36px 44px; }
  .vintage-border { position:absolute; top:10px; left:10px; right:10px; bottom:10px; border:2px solid ${p}55; pointer-events:none; }
  .vintage-border-inner { position:absolute; top:14px; left:14px; right:14px; bottom:14px; border:1px solid ${p}33; pointer-events:none; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:14px; border-bottom:2px solid ${p}; margin-bottom:16px; }
  .brand-name { font-size:18px; font-weight:bold; color:#1a150e; }
  .brand-sub { font-size:10px; color:#8b7d62; font-style:italic; margin-top:1px; }
  .right-panel { text-align:right; }
  .right-panel h1 { font-size:22px; font-weight:normal; color:${p}; font-style:italic; letter-spacing:1.5px; }
  .right-panel .no { font-size:10px; color:#8b7d62; margin-top:2px; font-style:italic; }
  .ornament { text-align:center; font-size:16px; color:${p}; letter-spacing:10px; margin-bottom:14px; opacity:0.7; }
  .info-row { display:flex; gap:16px; margin-bottom:16px; padding:10px 14px; background:#faf6ee; border:1px solid #d4c5a9; }
  .info-block { flex:1; }
  .info-block .lbl { font-size:8px; color:#8b7d62; text-transform:uppercase; letter-spacing:1px; font-weight:bold; }
  .info-block .val { font-size:12px; color:#2c2416; font-weight:bold; margin-top:2px; }
  .amount-box { border:1px solid ${p}; padding:14px 20px; background:#faf6ee; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; }
  .amount-box .lbl { font-size:8px; color:#8b7d62; text-transform:uppercase; letter-spacing:0.5px; font-weight:bold; }
  .amount-box .num { font-size:22px; font-weight:bold; color:${p}; }
  .amount-box .words { font-size:10px; color:#8b7d62; font-style:italic; margin-top:4px; }
  .details { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
  .det { flex:1; min-width:100px; padding:6px 10px; border:1px solid #d4c5a9; background:#faf6ee; }
  .det .lbl { font-size:7px; color:#8b7d62; text-transform:uppercase; letter-spacing:0.5px; }
  .det .v { font-size:10px; color:#2c2416; margin-top:2px; }
  .sig-area { margin-top:20px; display:flex; justify-content:flex-end; gap:32px; }
  .sig-box { text-align:center; }
  .sig-line { width:140px; height:1px; background:#c4b998; margin:4px auto; }
  .sig-lbl { font-size:8px; color:#8b7d62; font-style:italic; }
  .footer { margin-top:20px; padding-top:10px; border-top:1px solid #d4c5a9; font-size:8px; color:#8b7d62; text-align:center; font-style:italic; }
</style></head><body>
<div class="vintage-border"></div>
<div class="vintage-border-inner"></div>

<div class="header">
  <div>
    <div class="brand-name">${esc(c.name)}</div>
    ${c.sub ? `<div class="brand-sub">${esc(c.sub)}</div>` : ''}
  </div>
  <div class="right-panel">
    <h1>Receipt</h1>
    <div class="no">${esc(d.no)}</div>
  </div>
</div>

<div class="ornament">&loz; &loz; &loz;</div>

<div class="info-row">
  <div class="info-block">
    <div class="lbl">Received From</div>
    <div class="val">${esc(d.rf)}</div>
  </div>
  <div class="info-block">
    <div class="lbl">Date</div>
    <div class="val">${esc(d.dt)}</div>
  </div>
  <div class="info-block">
    <div class="lbl">Payment</div>
    <div class="val">${esc(d.pm)}</div>
  </div>
</div>

<div class="amount-box">
  <div>
    <div class="lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
    ${d.bg ? `<div style="font-size:9px;color:#6b5d4a;margin-top:4px;"><em>${esc(d.bg)}</em></div>` : ''}
  </div>
  <div style="text-align:right;">
    <div class="num">${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:10px;color:#8b7d62;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="details">
  ${d.ch ? `<div class="det"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
</div>

<div class="sig-area">
  <div class="sig-box">
    ${d.rv ? `<div style="font-size:9px;color:#6b5d4a;margin-bottom:2px;">${esc(d.rv)}</div>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Receiver</div>
  </div>
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:24px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-box"><div class="sig-line"></div><div class="sig-lbl">Signatory</div><div style="font-size:10px;font-weight:bold;color:#2c2416;">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)} &mdash; ${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
