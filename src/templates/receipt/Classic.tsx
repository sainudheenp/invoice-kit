import type { RecTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

export function ReceiptClassic(d: RecTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp

  const showAr = c.showArabic && c.nameAr
  const arabicBlock = showAr
    ? `<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:20px;font-weight:700">${esc(c.nameAr)}</div>${c.subAr ? `<div dir="rtl" unicode-bidi="embed" style="font-size:20px;color:#666">${esc(c.subAr)}</div>` : ''}</div>`
    : ''

  const altRow = (idx: number) => idx % 2 === 1 ? ' style="background:#fafafa"' : ''

  const itemsRows = d.items.length > 0 ? d.items.map((item, i) => `
    <tr${altRow(i)}>
      <td style="padding:10px 8px;color:#888">${i + 1}</td>
      <td style="padding:10px 8px" colspan="2">${esc(item.desc)}</td>
      <td style="padding:10px 8px;text-align:right;direction:ltr">${item.qty} x ${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:10px 8px;text-align:right;font-weight:600">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
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

  return watermarkWrap(`
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;color:#2d2d2d;position:relative;background:#fff;min-height:100vh">
      <div style="height:4px;background:${pc};width:100%"></div>
      <div style="padding:14mm 16mm 10mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:center;gap:12px">
            ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:55px;max-height:55px;object-fit:contain" />` : ''}
            <div>
              <div style="font-size:20px;font-weight:700">${esc(c.name)}</div>
              ${c.sub ? `<div style="font-size:20px;color:#666">${esc(c.sub)}</div>` : ''}
              <div style="font-size:15px;color:#666">${[c.loc, c.tel, c.email].filter(Boolean).join(' | ')}</div>
            </div>
          </div>
          ${arabicBlock}
        </div>
      </div>
      <div style="border-bottom:1px solid #ddd;margin:0 16mm"></div>
      <div style="padding:6mm 16mm">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:20px;font-weight:700;color:${pc}">RECEIPT VOUCHER</div>
            ${showAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:20px;color:#999">\u0633\u0646\u062F \u0642\u0628\u0636</div>' : ''}
          </div>
          <div style="text-align:right;font-size:20px">
            <div><strong>No.:</strong> ${esc(d.no)}</div>
            <div><strong>Date${showAr ? ' / \u0627\u0644\u062A\u0627\u0631\u064A\u062E' : ''}:</strong> ${d.dt}</div>
          </div>
        </div>
      </div>
      <div style="border-bottom:1px solid #eee;margin:0 16mm"></div>
      ${itemsRows ? `
      <div style="padding:0 16mm">
        <table style="width:100%;border-collapse:collapse;font-size:15px">
          <thead>
            <tr style="border-bottom:2px solid #ddd;font-size:15px;color:#999">
              <th style="padding:10px 8px;text-align:left">#</th><th style="padding:10px 8px;text-align:left" colspan="2">Description</th><th style="padding:10px 8px;text-align:right">Rate</th><th style="padding:10px 8px;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>
      <div style="border-bottom:1px solid #eee;margin:0 16mm"></div>
      ` : ''}
      <div style="padding:6mm 16mm">
        <table style="width:100%;border-collapse:collapse;font-size:15px">
          ${detailRows.map((row, i) => `
            <tr${altRow(i)}>
              <td style="padding:8px 10px;width:35%;font-weight:600">${row[0]}</td>
              <td style="padding:8px 10px">${row[1]}</td>
              ${showAr ? `<td style="padding:8px 10px;width:20%;direction:rtl;unicode-bidi:embed;text-align:right;font-size:20px;color:#888">${row[2]}</td>` : ''}
            </tr>
          `).join('')}
        </table>
      </div>
      <div style="padding:6mm 16mm;display:flex;justify-content:flex-end">
        <div style="display:flex;align-items:flex-end;gap:6px">
          <div style="text-align:center;border-bottom:2px solid #333;padding:0 10px 4px">
            <div style="font-size:15px;color:#666">${d.cur.symbol} / ${d.cur.name}</div>
            <div style="font-size:24px;font-weight:700">${d.wi.toLocaleString()}</div>
          </div>
          <div style="text-align:center;border-bottom:2px solid #333;padding:0 10px 4px">
            <div style="font-size:15px;color:#666">${d.cur.sub}</div>
            <div style="font-size:20px;font-weight:600">${String(d.fr).padStart(d.dp === 3 ? 3 : 2, '0')}</div>
          </div>
        </div>
      </div>
      <div style="padding:6mm 16mm;display:flex;gap:20px;align-items:flex-end">
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:80px;max-height:80px" /></div>` : ''}
        ${d.rv ? `<div><div style="border-top:1px solid #999;width:120px;padding-top:2px;font-size:20px;text-align:center">${esc(d.rv)}</div><div style="font-size:15px;color:#666;text-align:center">Receiver${showAr ? ' / \u0627\u0644\u0645\u0633\u062A\u0644\u0645' : ''}</div></div>` : ''}
        ${c.signature ? `<div><img src="${esc(c.signature)}" style="max-width:100px;max-height:50px" /><div style="font-size:15px;color:#666;text-align:center">Authorized Signature${showAr ? ' / \u0627\u0644\u062A\u0648\u0642\u064A\u0639' : ''}</div></div>` : ''}
        ${d.sg ? `<div><div style="border-top:1px solid #999;width:120px;padding-top:2px;font-size:20px;text-align:center">${esc(d.sg)}</div><div style="font-size:15px;color:#666;text-align:center">Signatory</div></div>` : ''}
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:4mm 16mm;border-top:1px solid #ddd;font-size:15px;color:#666;display:flex;justify-content:space-between">
        <span>${esc(c.name)}</span><span>${c.tel ? `Tel: ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}</span>
      </div>
      ${c.bankName ? `<div style="position:absolute;bottom:7mm;left:16mm;right:16mm;font-size:15px;color:#666">${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).join(' | ')}</div>` : ''}
    </div>
  `, d.comp.watermark)
}
