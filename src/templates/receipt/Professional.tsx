import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptProfessional(d:RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#1e3a5f'

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Courier New','Courier',monospace; color:#1e293b; background:#fff; width:794px; padding:40px 50px 100px; }
  .top-db { border-top:10px solid ${p}; margin:-32px -40px 0 -40px; padding-top:30px; padding-left:50px; padding-right:50px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
  .brand-name { font-size:16.25px; font-weight:bold; color:#0f172a; text-transform:uppercase; letter-spacing:1.25px; }
  .brand-sub { font-size:10px; color:#475569; text-transform:uppercase; margin-top:1.25px; }
  .right { text-align:right; }
  .doc-box { border:1.25px solid ${p}; padding:5px 17.5px; display:inline-block; }
  .doc-box .lbl { font-size:8.75px; color:#64748b; text-transform:uppercase; }
  .doc-box .no { font-size:13.75px; font-weight:bold; color:#0f172a; }
  .ledger-hdr { background:${p}; color:#fff; padding:6.25px 15px; font-size:11.25px; font-weight:bold; text-transform:uppercase; letter-spacing:1.25px; margin-bottom:2.5px; }
  .info-grid { display:flex; border:1.25px solid #cbd5e1; margin-bottom:20px; }
  .info-cell { flex:1; padding:7.5px 12.5px; border-right:1.25px solid #cbd5e1; }
  .info-cell:last-child { border-right:none; }
  .info-cell .lbl { font-size:8.75px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; }
  .info-cell .val { font-size:12.5px; color:#0f172a; font-weight:bold; margin-top:1.25px; }
  .amount-block { border:2.5px solid ${p}; padding:17.5px 25px; margin-bottom:17.5px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; }
  .amount-block .lbl { font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; }
  .amount-block .num { font-size:27.5px; font-weight:bold; color:${p}; }
  .amount-block .words { font-size:11.25px; color:#475569; font-style:italic; margin-top:5px; }
  .det-grid { display:flex; flex-wrap:wrap; gap:7.5px; margin-bottom:15px; }
  .det { flex:1; min-width:125px; padding:6.25px 10px; border:1.25px solid #cbd5e1; }
  .det .lbl { font-size:8.75px; color:#64748b; text-transform:uppercase; }
  .det .v { font-size:11.25px; color:#0f172a; font-weight:bold; margin-top:2.5px; }
  .sig-row { display:flex; justify-content:space-between; margin-top:25px; padding-top:12.5px; border-top:2.5px solid ${p}; }
  .sig-item { text-align:center; }
  .sig-line { width:162.5px; height:1.25px; background:#94a3b8; margin:5px auto; }
  .sig-lbl { font-size:8.75px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; }
  .footer { position:fixed; bottom:0; left:50px; right:50px; padding-top:10px; border-top:1.25px solid #e2e8f0; font-size:8.75px; color:#64748b; text-align:center; text-transform:uppercase; letter-spacing:0.375px; z-index:100; }
</style></head><body>
<div class="top-db"></div>

<div class="header">
  <div>
    <div class="brand-name">${esc(c.name)}</div>
    ${c.sub ? `<div class="brand-sub">${esc(c.sub)}</div>` : ''}
  </div>
  <div class="right">
    <div class="doc-box">
      <div class="lbl">Receipt No.</div>
      <div class="no">${esc(d.no)}</div>
    </div>
  </div>
</div>

<div class="ledger-hdr">PAYMENT RECEIPT VOUCHER</div>

<div class="info-grid">
  <div class="info-cell">
    <div class="lbl">Received From</div>
    <div class="val">${esc(d.rf)}</div>
  </div>
  <div class="info-cell">
    <div class="lbl">Date</div>
    <div class="val">${esc(d.dt)}</div>
  </div>
  ${d.pm ? `<div class="info-cell">
    <div class="lbl">Method</div>
    <div class="val">${esc(d.pm)}</div>
  </div>` : ''}
</div>

<div class="amount-block">
  <div>
    <div class="lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
    <div style="font-size:10px;color:#475569;margin-top:5px;"><strong>Purpose:</strong> ${d.bg ? esc(d.bg) : '—'}</div>
  </div>
  <div style="text-align:right;">
    ${d.totalTax > 0 ? `<div style="font-size:11.25px;color:#64748b;margin-bottom:2.5px;">Subtotal:${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:11.25px;color:#64748b;margin-bottom:2.5px;">Total Tax:${d.cur.symbol}${d.tv}</div>` : ''}
    <div class="num">${d.cur.symbol}${d.totalTax > 0 ? (d.am + d.totalTax).toFixed(d.dp) : d.amFmt}</div>
    <div style="font-size:11.25px;color:#64748b;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="det-grid">
  ${d.ch ? `<div class="det"><div class="lbl">Cheque</div><div class="v">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="det"><div class="lbl">Bank</div><div class="v">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="det"><div class="lbl">Date</div><div class="v">${esc(d.td)}</div></div>` : ''}
</div>

<div class="sig-row">
  <div class="sig-item" style="text-align:left;">
    <div class="sig-lbl">Receiver</div>
    <div class="sig-line" style="margin:5px 0;"></div>
    ${d.rv ? `<div style="font-size:11.25px;font-weight:bold;">${esc(d.rv)}</div>` : ''}
  </div>
  <div class="sig-item">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:30px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-item" style="text-align:right;"><div class="sig-line" style="margin:5px 0 5px auto;"></div><div class="sig-lbl">Signatory</div><div style="font-size:11.25px;font-weight:bold;">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | T:${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}<br>
  ${esc(d.no)} &middot; Thank you for choosing ${esc(c.name)}${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
