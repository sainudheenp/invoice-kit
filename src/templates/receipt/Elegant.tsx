import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptElegant(d:RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#8b6914'

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Georgia','Times New Roman','Palatino Linotype',serif; color:#2c2416; background:#fdfbf7; width:794px; padding:45px 55px; }
  .vintage-border { position:absolute; top:12.5px; left:12.5px; right:12.5px; bottom:12.5px; border:2.5px solid ${p}55; pointer-events:none; }
  .vintage-border-inner { position:absolute; top:17.5px; left:17.5px; right:17.5px; bottom:17.5px; border:1.25px solid ${p}33; pointer-events:none; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:17.5px; border-bottom:2.5px solid ${p}; margin-bottom:20px; }
  .brand-name { font-size:22.5px; font-weight:bold; color:#1a150e; }
  .brand-sub { font-size:12.5px; color:#8b7d62; font-style:italic; margin-top:1.25px; }
  .right-panel { text-align:right; }
  .right-panel h1 { font-size:27.5px; font-weight:normal; color:${p}; font-style:italic; letter-spacing:1.875px; }
  .right-panel .no { font-size:12.5px; color:#8b7d62; margin-top:2.5px; font-style:italic; }
  .ornament { text-align:center; font-size:20px; color:${p}; letter-spacing:12.5px; margin-bottom:17.5px; opacity:0.7; }
  .info-row { display:flex; gap:20px; margin-bottom:20px; padding:12.5px 17.5px; background:#faf6ee; border:1.25px solid #d4c5a9; }
  .info-block { flex:1; }
  .info-block .lbl { font-size:10px; color:#8b7d62; text-transform:uppercase; letter-spacing:1.25px; font-weight:bold; }
  .info-block .val { font-size:15px; color:#2c2416; font-weight:bold; margin-top:2.5px; }
  .amount-box { border:1.25px solid ${p}; padding:17.5px 25px; background:#faf6ee; margin-bottom:17.5px; display:flex; justify-content:space-between; align-items:center; }
  .amount-box .lbl { font-size:10px; color:#8b7d62; text-transform:uppercase; letter-spacing:0.625px; font-weight:bold; }
  .amount-box .num { font-size:27.5px; font-weight:bold; color:${p}; }
  .amount-box .words { font-size:12.5px; color:#8b7d62; font-style:italic; margin-top:5px; }
  .details { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:15px; }
  .det { flex:1; min-width:125px; padding:7.5px 12.5px; border:1.25px solid #d4c5a9; background:#faf6ee; }
  .det .lbl { font-size:8.75px; color:#8b7d62; text-transform:uppercase; letter-spacing:0.625px; }
  .det .v { font-size:12.5px; color:#2c2416; margin-top:2.5px; }
  .sig-area { margin-top:25px; display:flex; justify-content:flex-end; gap:40px; }
  .sig-box { text-align:center; }
  .sig-line { width:175px; height:1.25px; background:#c4b998; margin:5px auto; }
  .sig-lbl { font-size:10px; color:#8b7d62; font-style:italic; }
  .footer { margin-top:25px; padding-top:12.5px; border-top:1.25px solid #d4c5a9; font-size:10px; color:#8b7d62; text-align:center; font-style:italic; }
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
    ${d.bg ? `<div style="font-size:11.25px;color:#6b5d4a;margin-top:5px;"><em>${esc(d.bg)}</em></div>` : ''}
  </div>
  <div style="text-align:right;">
    ${d.totalTax > 0 ? `<div style="font-size:11.25px;color:#8b7d62;margin-bottom:2.5px;">Subtotal:${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:11.25px;color:#8b7d62;margin-bottom:2.5px;">Total Tax:${d.cur.symbol}${d.tv}</div>` : ''}
    <div class="num">${d.cur.symbol}${d.totalTax > 0 ? (d.am + d.totalTax).toFixed(d.dp) : d.amFmt}</div>
    <div style="font-size:12.5px;color:#8b7d62;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="details">
  ${d.ch ? `<div class="det"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
</div>

<div class="sig-area">
  <div class="sig-box">
    ${d.rv ? `<div style="font-size:11.25px;color:#6b5d4a;margin-bottom:2.5px;">${esc(d.rv)}</div>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Receiver</div>
  </div>
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:30px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-box"><div class="sig-line"></div><div class="sig-lbl">Signatory</div><div style="font-size:12.5px;font-weight:bold;color:#2c2416;">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)} &mdash; ${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
