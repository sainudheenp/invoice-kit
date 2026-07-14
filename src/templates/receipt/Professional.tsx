import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptProfessional(d: RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#1e3a5f'

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family: 'Courier New','Courier',monospace; color:#1e293b; background:#fff; width:794px; padding:32px 40px; }
  .top-db { border-top:8px solid ${p}; margin:-32px -40px 0 -40px; padding-top:24px; padding-left:40px; padding-right:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
  .brand-name { font-size:13px; font-weight:bold; color:#0f172a; text-transform:uppercase; letter-spacing:1px; }
  .brand-sub { font-size:8px; color:#475569; text-transform:uppercase; margin-top:1px; }
  .right { text-align:right; }
  .doc-box { border:1px solid ${p}; padding:4px 14px; display:inline-block; }
  .doc-box .lbl { font-size:7px; color:#64748b; text-transform:uppercase; }
  .doc-box .no { font-size:11px; font-weight:bold; color:#0f172a; }
  .ledger-hdr { background:${p}; color:#fff; padding:5px 12px; font-size:9px; font-weight:bold; text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; }
  .info-grid { display:flex; border:1px solid #cbd5e1; margin-bottom:16px; }
  .info-cell { flex:1; padding:6px 10px; border-right:1px solid #cbd5e1; }
  .info-cell:last-child { border-right:none; }
  .info-cell .lbl { font-size:7px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
  .info-cell .val { font-size:10px; color:#0f172a; font-weight:bold; margin-top:1px; }
  .amount-block { border:2px solid ${p}; padding:14px 20px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; }
  .amount-block .lbl { font-size:8px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
  .amount-block .num { font-size:22px; font-weight:bold; color:${p}; }
  .amount-block .words { font-size:9px; color:#475569; font-style:italic; margin-top:4px; }
  .det-grid { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
  .det { flex:1; min-width:100px; padding:5px 8px; border:1px solid #cbd5e1; }
  .det .lbl { font-size:7px; color:#64748b; text-transform:uppercase; }
  .det .v { font-size:9px; color:#0f172a; font-weight:bold; margin-top:2px; }
  .sig-row { display:flex; justify-content:space-between; margin-top:20px; padding-top:10px; border-top:2px solid ${p}; }
  .sig-item { text-align:center; }
  .sig-line { width:130px; height:1px; background:#94a3b8; margin:4px auto; }
  .sig-lbl { font-size:7px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
  .footer { margin-top:16px; padding-top:8px; border-top:1px solid #cbd5e1; font-size:7px; color:#64748b; text-align:center; text-transform:uppercase; }
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
  <div class="info-cell">
    <div class="lbl">Method</div>
    <div class="val">${esc(d.pm)}</div>
  </div>
</div>

<div class="amount-block">
  <div>
    <div class="lbl">Amount Received</div>
    ${d.ww ? `<div class="words">${esc(d.ww)}</div>` : ''}
    ${d.bg ? `<div style="font-size:8px;color:#475569;margin-top:4px;"><strong>Purpose:</strong> ${esc(d.bg)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    <div class="num">${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:9px;color:#64748b;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
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
    <div class="sig-line" style="margin:4px 0;"></div>
    ${d.rv ? `<div style="font-size:9px;font-weight:bold;">${esc(d.rv)}</div>` : ''}
  </div>
  <div class="sig-item">
    ${c.signature ? `<img src="${esc(c.signature)}" style="height:24px;width:auto;" alt="sig"/>` : ''}
    <div class="sig-line"></div>
    <div class="sig-lbl">Authorized Signature</div>
  </div>
  ${d.sg ? `<div class="sig-item" style="text-align:right;"><div class="sig-line" style="margin:4px 0 4px auto;"></div><div class="sig-lbl">Signatory</div><div style="font-size:9px;font-weight:bold;">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` | ${esc(c.loc)}` : ''}${c.tel ? ` | T:${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
