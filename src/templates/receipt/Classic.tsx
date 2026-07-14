import type { RecTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

export function ReceiptClassic(d: RecTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp

  const showAr = c.showArabic && c.nameAr
  const arabicBlock = showAr
    ? `<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:18px;font-weight:700;color:#111827">${esc(c.nameAr)}</div>${c.subAr ? `<div dir="rtl" unicode-bidi="embed" style="font-size:14px;color:#6b7280">${esc(c.subAr)}</div>` : ''}</div>`
    : ''

  const altRow = (idx: number) => idx % 2 === 1 ? ' style="background:#f8fafc"' : ''

  const itemsRows = d.items.length > 0 ? d.items.map((item, i) => `
    <tr${altRow(i)}>
      <td style="padding:12px 18px;color:#6b7280;border-bottom:1px solid #e5e7eb">${i + 1}</td>
      <td style="padding:12px 18px;border-bottom:1px solid #e5e7eb;color:#1f2937" colspan="2">${esc(item.desc)}</td>
      <td style="padding:12px 18px;text-align:right;direction:ltr;border-bottom:1px solid #e5e7eb;color:#374151">${item.qty} x ${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:12px 18px;text-align:right;font-weight:600;border-bottom:1px solid #e5e7eb;color:#111827">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('') : ''

  const detailRows = [
    ['Received from', esc(d.rf), showAr ? '\u0627\u0633\u062A\u0644\u0645\u062A \u0645\u0646' : ''],
    ['Amount', esc(d.ww), showAr ? '\u0628\u0645\u0628\u0644\u063A \u0642\u062F\u0631\u0647' : ''],
    ['Payment', d.pm + (d.ch ? ` - ${esc(d.ch)}` : ''), showAr ? '\u0646\u0642\u062F / \u0634\u064A\u0643' : ''],
  ]

  if (d.bk || d.td) {
    detailRows.push(['Bank / Date', [d.bk, d.td].filter(Boolean).join(' - '), showAr ? '\u0627\u0644\u0628\u0646\u0643 / \u062A\u0627\u0631\u064A\u062E\u0647' : ''])
  }
  detailRows.push([showAr ? 'Being / \u0628\u064A\u0627\u0646' : 'Being', esc(d.bg), showAr ? '\u0628\u064A\u0627\u0646' : ''])

  const contactParts = [c.loc, c.tel, c.email].filter(Boolean)
  const contactStr = contactParts.length > 0 ? `<div style="font-size:12px;color:#64748b;margin-top:6px">${contactParts.join(' \u00B7 ')}</div>` : ''

  return watermarkWrap(`
    <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#374151;position:relative;background:#fff;min-height:100vh;padding:0;display:flex;flex-direction:column">
      <div style="height:6px;background:${pc};width:100%"></div>
      <div style="padding:14mm 20mm 8mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:center;gap:18px">
            ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:65px;max-height:65px;object-fit:contain" />` : ''}
            <div>
              <div style="font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px">${esc(c.name)}</div>
              ${c.sub ? `<div style="font-size:14px;color:#6b7280;margin-top:2px">${esc(c.sub)}</div>` : ''}
              ${contactStr}
            </div>
          </div>
          ${arabicBlock}
        </div>
      </div>
      <div style="border-bottom:1px solid #e5e7eb;margin:0 20mm"></div>
      <div style="padding:8mm 20mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <div>
            <div style="font-size:20px;font-weight:700;letter-spacing:1px;color:${pc};text-transform:uppercase">RECEIPT VOUCHER</div>
            ${showAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:16px;color:#64748b;margin-top:4px">\u0633\u0646\u062F \u0642\u0628\u0636</div>' : ''}
          </div>
          <div style="text-align:right;font-size:14px;color:#374151;background:#f9fafb;padding:12px 20px;border-radius:6px">
            <div style="margin-bottom:4px"><strong style="color:#111827">No.:</strong> ${esc(d.no)}</div>
            <div><strong style="color:#111827">Date${showAr ? ' / \u0627\u0644\u062A\u0627\u0631\u064A\u062E' : ''}:</strong> ${d.dt}</div>
          </div>
        </div>
      </div>
      <div style="border-bottom:1px solid #e5e7eb;margin:0 20mm"></div>
      ${itemsRows ? `
      <div style="padding:4mm 20mm">
        <table style="width:100%;border-collapse:separate;border-spacing:0;font-size:14px">
          <thead>
            <tr>
              <th style="padding:12px 18px;text-align:left;border-bottom:2px solid #e5e7eb;color:#64748b;font-weight:600">#</th>
              <th style="padding:12px 18px;text-align:left;border-bottom:2px solid #e5e7eb;color:#64748b;font-weight:600" colspan="2">Description</th>
              <th style="padding:12px 18px;text-align:right;border-bottom:2px solid #e5e7eb;color:#64748b;font-weight:600">Rate</th>
              <th style="padding:12px 18px;text-align:right;border-bottom:2px solid #e5e7eb;color:#64748b;font-weight:600">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>
      ` : ''}
      <div style="padding:4mm 20mm">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${detailRows.map((row, i) => `
            <tr${altRow(i)}>
              <td style="padding:14px 18px;width:25%;font-weight:600;color:#111827;border-bottom:1px solid #f3f4f6">${row[0]}</td>
              <td style="padding:14px 18px;color:#374151;border-bottom:1px solid #f3f4f6">${row[1]}</td>
              ${showAr ? `<td style="padding:14px 18px;width:20%;direction:rtl;unicode-bidi:embed;text-align:right;font-size:15px;color:#64748b;border-bottom:1px solid #f3f4f6">${row[2]}</td>` : ''}
            </tr>
          `).join('')}
        </table>
      </div>
      <div style="padding:8mm 20mm;display:flex;justify-content:flex-end">
        <div style="display:flex;align-items:flex-end;gap:16px;background:#f8fafc;padding:16px 28px;border-radius:8px;border:1px solid #e5e7eb">
          <div style="text-align:center;padding:0 16px">
            <div style="font-size:12px;text-transform:uppercase;color:#6b7280;margin-bottom:6px;letter-spacing:1px">${d.cur.symbol} / ${d.cur.name}</div>
            <div style="font-size:28px;font-weight:700;color:#111827">${d.wi.toLocaleString()}</div>
          </div>
          <div style="width:1px;height:44px;background:#d1d5db"></div>
          <div style="text-align:center;padding:0 16px">
            <div style="font-size:12px;text-transform:uppercase;color:#6b7280;margin-bottom:6px;letter-spacing:1px">${d.cur.sub}</div>
            <div style="font-size:22px;font-weight:600;color:#374151">${String(d.fr).padStart(d.dp === 3 ? 3 : 2, '0')}</div>
          </div>
        </div>
      </div>
      <div style="padding:8mm 20mm;display:flex;gap:28px;align-items:flex-end">
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:100px;max-height:100px;object-fit:contain" /></div>` : ''}
        ${d.rv ? `<div style="text-align:center"><div style="font-size:16px;color:#111827;margin-bottom:6px">${esc(d.rv)}</div><div style="border-top:1px solid #d1d5db;width:150px;padding-top:6px;font-size:12px;color:#6b7280">Receiver${showAr ? ' / \u0627\u0644\u0645\u0633\u062A\u0644\u0645' : ''}</div></div>` : ''}
        ${c.signature ? `<div style="text-align:center"><img src="${esc(c.signature)}" style="max-width:130px;max-height:65px;object-fit:contain;margin-bottom:6px" /><div style="font-size:14px;color:#6b7280;border-top:1px solid #d1d5db;padding-top:6px;width:150px">Authorized Signature${showAr ? ' / \u0627\u0644\u062A\u0648\u0642\u064A\u0639' : ''}</div></div>` : ''}
        ${d.sg ? `<div style="text-align:center"><div style="font-size:16px;color:#111827;margin-bottom:6px">${esc(d.sg)}</div><div style="border-top:1px solid #d1d5db;width:150px;padding-top:6px;font-size:12px;color:#6b7280">Signatory</div></div>` : ''}
      </div>
      <div style="flex:1;min-height:4mm"></div>
      <div style="padding:5mm 20mm;border-top:1px solid #e5e7eb;font-size:12px;color:#64748b;display:flex;justify-content:space-between;background:#f8fafc">
        <span style="color:#6b7280;font-weight:500">${esc(c.name)}</span>
        <span>${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</span>
      </div>
      ${c.bankName ? `<div style="padding:3mm 20mm 5mm;font-size:12px;color:#64748b;text-align:center">${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).join(' | ')}</div>` : ''}
    </div>
  `, d.comp.watermark)
}
