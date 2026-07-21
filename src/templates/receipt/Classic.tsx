import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptClassic(d: RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#1f2937'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:36px;width:auto;" alt="logo"/>` : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:36px 44px; }
  .top-border { height:3px; background:${p}; margin:-36px -44px 0 -44px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-top:20px; margin-bottom:20px; }
  .left-col { display:flex; gap:12px; align-items:center; }
  .right-col { text-align:right; }
  .doc-title { font-size:20px; font-weight:bold; color:${p}; letter-spacing:0.5px; }
  .doc-no { font-size:10px; color:#6b7280; margin-top:2px; }
  .rules { border-top:2px solid ${p}; border-bottom:2px solid ${p}; padding:10px 0; margin-bottom:16px; display:flex; gap:16px; }
  .rules .lbl { font-size:8px; color:#6b7280; text-transform:uppercase; letter-spacing:0.8px; }
  .rules .val { font-size:11px; font-weight:bold; color:#111827; margin-top:1px; }
  .amount-box { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; background:#f3f4f6; border:2px solid ${p}; margin-bottom:16px; }
  .amount-lbl { font-size:9px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; }
  .amount-num { font-size:24px; font-weight:bold; color:${p}; }
  .amount-wi { font-size:10px; color:#6b7280; margin-top:2px; }
  .words { font-size:10px; color:#6b7280; font-style:italic; margin-top:4px; }
  .det-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
  .det-cell { flex:1; min-width:120px; padding:8px 12px; border:1px solid #e5e7eb; }
  .det-cell .lbl { font-size:7px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; }
  .det-cell .val { font-size:10px; color:#111827; font-weight:bold; margin-top:2px; }
  .sig-area { display:flex; justify-content:space-between; align-items:flex-end; margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; }
  .sig-box { text-align:center; }
  .sig-line { width:140px; height:1px; background:#9ca3af; margin:4px auto; }
  .sig-lbl { font-size:8px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; }
  .footer { margin-top:20px; padding-top:10px; border-top:1px solid #e5e7eb; font-size:8px; color:#6b7280; text-align:center; }
</style></head><body>
<div class="top-border"></div>

<div class="header">
  <div class="left-col">
    ${logoHtml}
    <div>
      <div style="font-size:16px;font-weight:bold;color:#111827;">${esc(c.name)}</div>
      ${c.sub ? `<div style="font-size:10px;color:#6b7280;">${esc(c.sub)}</div>` : ''}
      <div style="font-size:9px;color:#6b7280;margin-top:2px;">${[c.loc, c.tel, c.email].filter(Boolean).map(esc).join(' | ')}</div>
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
  <div>
    <div class="lbl">Payment</div>
    <div class="val">${esc(d.pm)}</div>
  </div>
</div>

<div class="amount-box">
  <div>
    <div class="amount-lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
    ${d.bg ? `<div style="font-size:9px;color:#4b5563;margin-top:4px;"><strong>Purpose:</strong> ${esc(d.bg)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    ${d.totalTax > 0 ? `<div style="font-size:10px;color:#6b7280;margin-bottom:2px;">Subtotal: ${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:10px;color:#6b7280;margin-bottom:2px;">Total Tax: ${d.cur.symbol}${d.tv}</div>` : ''}
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
    ${d.rv ? `<div class="sig-box" style="text-align:left;"><div class="sig-line" style="margin:4px 0;"></div><div class="sig-lbl">Receiver: ${esc(d.rv)}</div></div>` : ''}
  </div>
  <div class="sig-box">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:26px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-box" style="text-align:right;"><div class="sig-line" style="margin:4px 0 4px auto;"></div><div class="sig-lbl">Signatory</div><div style="font-size:10px;font-weight:bold;color:#111827;">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
