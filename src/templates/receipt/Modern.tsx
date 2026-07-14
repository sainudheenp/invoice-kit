import type { RecTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'

export function ReceiptModern(d: RecTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp
  const itemsRows = d.items.length > 0 ? d.items.map((item, i) => `<tr${i % 2 === 1 ? ' style="background:#f8fafc"' : ''}>
    <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;color:#374151">${i + 1}</td>
    <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;color:#1f2937">${esc(item.desc)}</td>
    <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;text-align:center;color:#374151">${item.qty}</td>
    <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;text-align:right;color:#374151">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
    <td style="padding:14px 18px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#111827">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
  </tr>`).join('') : ''

  return wrap(d, `
    <div style="position:relative;min-height:100vh;background:#fff;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151">
      <div style="position:absolute;top:0;left:0;width:8px;height:100%;background:linear-gradient(to bottom, ${pc}, ${pc}dd)"></div>
      <div style="padding:14mm 20mm 10mm 26mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;background:#f8fafc;border-radius:12px;padding:24px 28px;border:1px solid #f1f5f9">
          <div style="display:flex;align-items:center;gap:18px">
            ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:60px;max-height:60px;object-fit:contain" />` : ''}
            <div>
              <div style="font-size:26px;font-weight:700;color:#111827;letter-spacing:-0.5px">${esc(c.name)}</div>
              ${c.sub ? `<div style="font-size:14px;color:#6b7280;margin-top:4px">${esc(c.sub)}</div>` : ''}
              ${contactLine(c)}
            </div>
          </div>
          <div style="border-left:4px solid ${pc};padding-left:18px;text-align:right">
            <div style="font-size:14px;text-transform:uppercase;letter-spacing:2px;font-weight:600;color:${pc};margin-bottom:6px">RECEIPT</div>
            <div style="font-size:18px;font-weight:700;color:#111827">${esc(d.no)}</div>
          </div>
        </div>
        <div style="display:flex;gap:6mm;margin-top:8mm">
          <div style="flex:1;background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #f1f5f9">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#64748b;margin-bottom:8px">Received From</div>
            <div style="font-weight:700;color:#111827;font-size:16px">${esc(d.rf)}</div>
          </div>
          <div style="width:260px;text-align:right;font-size:14px;color:#374151;display:flex;flex-direction:column;justify-content:flex-end;background:#f8fafc;border-radius:10px;padding:20px 24px;border:1px solid #f1f5f9">
            <div style="margin-bottom:6px"><strong style="color:#111827">Date:</strong> ${d.dt}</div>
            ${c.vatReg ? `<div><strong style="color:#111827">VAT Reg.:</strong> ${esc(c.vatReg)}</div>` : ''}
          </div>
        </div>
        
        ${itemsRows ? `
        <table style="width:100%;border-collapse:separate;border-spacing:0;margin-top:8mm;font-size:14px;border:1px solid #f1f5f9;border-radius:10px;overflow:hidden">
          <thead><tr style="background:${pc};color:#fff">
            <th style="padding:14px 18px;text-align:left;font-weight:600;width:40px">#</th>
            <th style="padding:14px 18px;text-align:left;font-weight:600">Description</th>
            <th style="padding:14px 18px;text-align:center;width:60px;font-weight:600">Qty</th>
            <th style="padding:14px 18px;text-align:right;width:100px;font-weight:600">Price</th>
            <th style="padding:14px 18px;text-align:right;width:100px;font-weight:600">Amount</th>
          </tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>` : ''}
        
        <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:10px;padding:20px 24px;margin-top:8mm;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#64748b;margin-bottom:4px">Amount Received</div>
            <div style="font-size:14px;color:#6b7280;font-style:italic">${esc(d.ww)}</div>
          </div>
          <div style="font-size:28px;font-weight:700;color:${pc}">${d.cur.symbol}${d.amFmt}</div>
        </div>
        
        <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:10px;padding:20px 24px;margin-top:8mm;font-size:14px;color:#374151">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div><strong style="color:#111827">Payment Method:</strong> ${d.pm}</div>
            ${d.ch ? `<div><strong style="color:#111827">Cheque:</strong> ${esc(d.ch)}</div>` : ''}
            ${d.bk ? `<div><strong style="color:#111827">Bank:</strong> ${esc(d.bk)}</div>` : ''}
            ${d.td ? `<div><strong style="color:#111827">Transaction Date:</strong> ${d.td}</div>` : ''}
            <div style="grid-column:1/-1;margin-top:6px"><strong style="color:#111827">Purpose:</strong> ${esc(d.bg)}</div>
          </div>
        </div>

        <div style="border-top:1px solid #e5e7eb;margin-top:12mm;padding-top:6mm;display:flex;gap:20px;align-items:flex-end">
          ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:120px;max-height:120px;object-fit:contain" /></div>` : ''}
          ${c.signature ? `<div><img src="${esc(c.signature)}" style="max-width:140px;max-height:70px;object-fit:contain" /><div style="font-size:12px;color:#6b7280;border-top:1px solid #d1d5db;padding-top:6px;margin-top:6px;text-align:center">Authorized Signature</div></div>` : ''}
          ${d.rv ? `<div style="flex:1"><div style="border-top:1px solid #d1d5db;padding-top:6px;font-size:14px;text-align:center;font-weight:500;color:#111827;width:150px;margin-left:auto">${esc(d.rv)}</div><div style="font-size:12px;color:#6b7280;text-align:center;width:150px;margin-left:auto">Receiver</div></div>` : ''}
          ${d.sg ? `<div style="flex:1"><div style="border-top:1px solid #d1d5db;padding-top:6px;font-size:14px;text-align:center;font-weight:500;color:#111827;width:150px;margin-left:auto">${esc(d.sg)}</div><div style="font-size:12px;color:#6b7280;text-align:center;width:150px;margin-left:auto">Signatory</div></div>` : ''}
        </div>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:4mm 20mm 4mm 26mm;font-size:12px;color:#64748b;display:flex;justify-content:space-between;background:#f8fafc;position:absolute;bottom:0;left:0;right:0">
        <span style="color:#6b7280;font-weight:500">${esc(c.name)}${c.loc ? ` - ${esc(c.loc)}` : ''}</span>
        <span>${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</span>
      </div>
      ${c.bankName ? `<div style="text-align:center;font-size:12px;color:#64748b;position:absolute;bottom:13mm;left:20mm;right:20mm">${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).join(' | ')}</div>` : ''}
    </div>
  `)
}

const contactLine = (c: any) => {
  const parts = [c.loc, c.tel, c.mob, c.email].filter(Boolean)
  return parts.length ? `<div style="font-size:12px;color:#64748b;margin-top:6px">${parts.join(' \u00B7 ')}</div>` : ''
}

const wrap = (d: RecTemplateData, html: string) => d.comp.watermark ? html.replace(/<\/div>\s*$/, `${watermarkDiv(d.comp.watermark)}</div>`) : html
const watermarkDiv = (t: string) => `<div style="position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:9999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${esc(t)}</div>`
