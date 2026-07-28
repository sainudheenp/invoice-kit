import { esc } from '@/utils/esc'
import type { RecTemplateData } from '@/types/template'

export function ReceiptModern(d:RecTemplateData): string {
  const c = d.comp; const p = d.pc || '#D97706'
  const logoHtml = c.logo ? `<img src="${esc(c.logo)}" style="height:35px;width:auto;" alt="logo"/>` : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  @page { margin:0;size:A4; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:'Helvetica','Arial',sans-serif; color:#1f2937; background:#fff; width:794px; padding:40px 50px; }
  .sidebar { position:absolute; top:0; left:0; width:5px; height:1403.75px; background:linear-gradient(to bottom, ${p}, ${p}88); }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding:20px 25px; background:#f8fafc; border-radius:10px; margin-bottom:25px; }
  .brand { display:flex; gap:12.5px; align-items:center; }
  .doc-label { font-size:12.5px; color:${p}; font-weight:bold; letter-spacing:2.5px; border-left:3.75px solid ${p}; padding-left:10px; }
  .doc-no { font-size:12.5px; color:#4b5563; margin-top:2.5px; }
  .cards { display:flex; gap:20px; margin-bottom:20px; }
  .card { flex:1; padding:15px 20px; background:#f8fafc; border-radius:10px; }
  .card-lbl { font-size:11.25px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; margin-bottom:5px; }
  .card-val { font-size:13.75px; font-weight:bold; }
  .amount-card { padding:25px 30px; background:${p}0d; border:2.5px solid ${p}; border-radius:15px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
  .amount-label { font-size:11.25px; color:#64748b; text-transform:uppercase; }
  .amount-number { font-size:32.5px; font-weight:bold; color:${p}; }
  .amount-words { font-size:12.5px; color:#4b5563; font-style:italic; margin-top:7.5px; }
  .details-grid { display:flex; gap:20px; margin-bottom:25px; }
  .detail-card { flex:1; padding:15px 20px; background:#f8fafc; border-radius:10px; }
  .detail-lbl { font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.625px; }
  .detail-val { font-size:12.5px; color:#1f2937; margin-top:2.5px; }
  .sig-section { display:flex; justify-content:flex-end; gap:40px; margin-top:25px; }
  .sig-block { text-align:center; }
  .sig-line { width:150px; height:1.25px; background:#94a3b8; margin:5px auto; }
  .sig-label { font-size:11.25px; color:#64748b; }
  .footer { position:absolute; bottom:30px; left:50px; right:50px; padding-top:15px; border-top:1.25px solid #e2e8f0; font-size:11.25px; color:#64748b; text-align:center; }
</style></head><body>
<div class="sidebar"></div>

<div class="header">
  <div class="brand">
    ${logoHtml}
    <div>
      <div style="font-size:16.25px;font-weight:bold;">${esc(c.name)}</div>
      ${c.sub ? `<div style="font-size:11.25px;color:#4b5563;">${esc(c.sub)}</div>` : ''}
    </div>
  </div>
  <div style="text-align:right;">
    <div class="doc-label">RECEIPT</div>
    <div class="doc-no">${esc(d.no)}</div>
  </div>
</div>

<div class="cards">
  <div class="card">
    <div class="card-lbl">Received From</div>
    <div class="card-val">${esc(d.rf)}</div>
  </div>
  <div class="card">
    <div class="card-lbl">Date</div>
    <div class="card-val">${esc(d.dt)}</div>
  </div>
</div>

<div class="amount-card">
  <div>
    <div class="amount-label">Amount Received</div>
    ${d.ww ? `<div class="amount-words">${esc(d.ww)}</div>` : ''}
  </div>
  <div style="text-align:right;">
    ${d.totalTax > 0 ? `<div style="font-size:12.5px;color:#64748b;margin-bottom:2.5px;">Subtotal:${d.cur.symbol}${d.amFmt}</div>
    <div style="font-size:12.5px;color:#64748b;margin-bottom:2.5px;">Total Tax:${d.cur.symbol}${d.tv}</div>` : ''}
    <div class="amount-number">${d.cur.symbol}${d.totalTax > 0 ? (d.am + d.totalTax).toFixed(d.dp) : d.amFmt}</div>
    <div style="font-size:13.75px;color:#64748b;text-align:right;">${d.wi}.${String(d.fr).padStart(d.dp, '0')}</div>
  </div>
</div>

<div class="details-grid">
  ${d.pm ? `<div class="detail-card">
    <div class="detail-lbl">Payment Method</div>
    <div class="detail-val">${esc(d.pm)}</div>
  </div>` : ''}
  ${d.ch ? `<div class="detail-card"><div class="detail-lbl">Cheque No</div><div class="detail-val">${esc(d.ch)}</div></div>` : ''}
  ${d.bk ? `<div class="detail-card"><div class="detail-lbl">Bank</div><div class="detail-val">${esc(d.bk)}</div></div>` : ''}
  ${d.td ? `<div class="detail-card"><div class="detail-lbl">Date</div><div class="detail-val">${esc(d.td)}</div></div>` : ''}
  <div class="detail-card"><div class="detail-lbl">Purpose</div><div class="detail-val">${d.bg ? esc(d.bg) : '—'}</div></div>
</div>

<div class="sig-section">
  ${c.signature ? `<div class="sig-block"><img src="${esc(c.signature)}" style="height:32.5px;width:auto;" alt="sig"/><div class="sig-line"></div><div class="sig-label">Authorized Signature</div></div>` : ''}
  ${d.sg ? `<div class="sig-block"><div class="sig-line"></div><div class="sig-label">Signatory</div><div style="font-size:12.5px;font-weight:bold;">${esc(d.sg)}</div></div>` : ''}
</div>

<div class="footer">
  ${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
  ${c.bankName ? `<br>${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).map(esc).join(' | ')}` : ''}
</div>
</body></html>`
}
