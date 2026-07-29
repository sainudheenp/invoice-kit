import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptClassic(d:RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#1f2937'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:45px;width:auto;" alt="logo"/>` : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:45px 55px 100px; }
  .top-border { height:3.75px; background:${p}; margin:-36px -44px 0 -44px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-top:25px; margin-bottom:25px; }
  .left-col { display:flex; gap:15px; align-items:center; }
  .right-col { text-align:right; }
  .doc-title { font-size:25px; font-weight:bold; color:${p}; letter-spacing:0.625px; }
  .doc-no { font-size:12.5px; color:#6b7280; margin-top:2.5px; }
  .rules { border-top:2.5px solid ${p}; border-bottom:2.5px solid ${p}; padding:12.5px 0; margin-bottom:20px; display:flex; gap:20px; }
  .rules .lbl { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:1px; }
  .rules .val { font-size:13.75px; font-weight:bold; color:#111827; margin-top:1.25px; }
  .amount-box { display:flex; justify-content:space-between; align-items:center; padding:20px 25px; background:#f3f4f6; border:2.5px solid ${p}; margin-bottom:20px; }
  .amount-lbl { font-size:11.25px; color:#6b7280; text-transform:uppercase; letter-spacing:0.625px; }
  .amount-num { font-size:30px; font-weight:bold; color:${p}; }
  .amount-wi { font-size:12.5px; color:#6b7280; margin-top:2.5px; }
  .words { font-size:12.5px; color:#6b7280; font-style:italic; margin-top:5px; }
  .det-grid { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:17.5px; }
  .det-cell { flex:1; min-width:150px; padding:10px 15px; border:1.25px solid #e5e7eb; }
  .det-cell .lbl { font-size:8.75px; color:#6b7280; text-transform:uppercase; letter-spacing:0.625px; }
  .det-cell .val { font-size:12.5px; color:#111827; font-weight:bold; margin-top:2.5px; }
  .sig-area { display:flex; justify-content:space-between; align-items:flex-end; margin-top:30px; padding-top:15px; border-top:1.25px solid #e5e7eb; }
  .sig-box { text-align:center; }
  .sig-line { width:175px; height:1.25px; background:#9ca3af; margin:5px auto; }
  .sig-lbl { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.625px; }
  .footer { position:fixed; bottom:0; left:55px; right:55px; padding-top:12.5px; border-top:1.25px solid #e5e7eb; font-size:10px; color:#6b7280; text-align:center; z-index:100; }
</style></head><body>
<div class="top-border"></div>

<div class="header">
  <div class="left-col">
    ${logoHtml}
    <div>
      <div style="font-size:20px;font-weight:bold;color:#111827;">${esc(c.name)}</div>
      ${c.sub ? `<div style="font-size:12.5px;color:#6b7280;">${esc(c.sub)}</div>` : ''}
      <div style="font-size:11.25px;color:#6b7280;margin-top:2.5px;">${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}</div>
    </div>
  </div>
  <div class="right-col">
    <div class="doc-title">RECEIPT</div>
    <div class="doc-no">${esc(d.no)}</div>
  </div>
</div>

<div class="rules">
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

<div class="amount-box">
  <div>
    <div class="amount-lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
    <div style="font-size:11.25px;color:#4b5563;margin-top:5px;"><strong>Purpose:</strong> ${d.bg ? esc(d.bg) : '—'}</div>
  </div>
  <div style="text-align:right;">
    ${d.totalTax > 0 ? `<div style="font-size:12.5px;color:#6b7280;margin-bottom:2.5px;">Subtotal:${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:12.5px;color:#6b7280;margin-bottom:2.5px;">Total Tax:${d.cur.symbol}${d.tv}</div>` : ''}
    <div class="amount-num">${d.cur.symbol}${d.totalTax > 0 ? (d.am + d.totalTax).toFixed(d.dp) : d.amFmt}</div>
    <div class="amount-wi">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="det-grid">
  ${d.ch ? `<div class="det-cell"><div class="lbl">Cheque No</div><div class="val">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det-cell"><div class="lbl">Bank</div><div class="val">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det-cell"><div class="lbl">Date</div><div class="val">${esc(d.td)}</div></div>` : ''}
</div>

<div class="sig-area">
  <div>
    ${d.rv ? `<div class="sig-box" style="text-align:left;"><div class="sig-line" style="margin:5px 0;"></div><div class="sig-lbl">Receiver:${esc(d.rv)}</div></div>` : ''}
  </div>
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:32.5px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-box" style="text-align:right;"><div class="sig-line" style="margin:5px 0 5px auto;"></div><div class="sig-lbl">Signatory</div><div style="font-size:12.5px;font-weight:bold;color:#111827;">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | Tel:${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}<br>
   Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
