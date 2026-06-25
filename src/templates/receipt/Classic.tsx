import type { RecTemplateData } from '@/types/template'

const _esc = (s: string) => {
  const m: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return s.replace(/[&<>"']/g, (c) => m[c])
}

export function ReceiptClassic(d: RecTemplateData) {
  const pc = d.comp.pcolor || '#D97706'
  const c = d.comp

  const showAr = c.showArabic && c.nameAr
  const arabicBlock = showAr
    ? `<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:18px;font-weight:700">${_esc(c.nameAr)}</div>${c.subAr ? `<div dir="rtl" unicode-bidi="embed" style="font-size:12px;color:#666">${_esc(c.subAr)}</div>` : ''}</div>`
    : ''

  const altRow = (idx: number) => idx % 2 === 1 ? ' style="background:#fafafa"' : ''

  const itemsRows = d.items.length > 0 ? d.items.map((item, i) => `
    <tr${altRow(i)}>
      <td style="padding:6px 10px;color:#888">${i + 1}</td>
      <td style="padding:6px 10px" colspan="2">${_esc(item.desc)}</td>
      <td style="padding:6px 10px;text-align:right;direction:ltr">${item.qty} x ${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:6px 10px;text-align:right;font-weight:600">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('') : ''

  const detailRows = [
    ['Received from', _esc(d.rf), showAr ? '\u0627\u0633\u062A\u0644\u0645\u062A \u0645\u0646' : ''],
    ['Amount', _esc(d.ww), showAr ? '\u0628\u0645\u0628\u0644\u063A \u0642\u062F\u0631\u0647' : ''],
    ['Payment', d.pm + (d.ch ? ` - ${_esc(d.ch)}` : ''), showAr ? '\u0646\u0642\u062F / \u0634\u064A\u0643' : ''],
  ]

  if (d.bk || d.td) {
    detailRows.push(['Bank / Date', [d.bk, d.td].filter(Boolean).join(' - '), showAr ? '\u0627\u0644\u0628\u0646\u0643 / \u062A\u0627\u0631\u064A\u062E\u0647' : ''])
  }
  detailRows.push([showAr ? 'Being / \u0628\u064A\u0627\u0646' : 'Being', _esc(d.bg), showAr ? '\u0628\u064A\u0627\u0646' : ''])

  return wrap(`
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2d2d2d;position:relative;background:#fff;min-height:100vh">
      <div style="height:4px;background:${pc};width:100%"></div>
      <div style="padding:10mm 14mm">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:center;gap:10px">
            ${c.logo ? `<img src="${_esc(c.logo)}" style="max-width:50px;max-height:50px;object-fit:contain" />` : ''}
            <div>
              <div style="font-size:16px;font-weight:700">${_esc(c.name)}</div>
              ${c.sub ? `<div style="font-size:12px;color:#666">${_esc(c.sub)}</div>` : ''}
              <div style="font-size:11px;color:#666">${[c.loc, c.tel, c.email].filter(Boolean).join(' | ')}</div>
            </div>
          </div>
          ${arabicBlock}
        </div>
      </div>
      <div style="border-bottom:1px solid #ddd;margin:0 14mm"></div>
      <div style="padding:4mm 14mm">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:15px;font-weight:700;color:${pc}">RECEIPT VOUCHER</div>
            ${showAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:12px;color:#999">\u0633\u0646\u062F \u0642\u0628\u0636</div>' : ''}
          </div>
          <div style="text-align:right;font-size:12px">
            <div><strong>No.:</strong> ${_esc(d.no)}</div>
            <div><strong>Date${showAr ? ' / \u0627\u0644\u062A\u0627\u0631\u064A\u062E' : ''}:</strong> ${d.dt}</div>
          </div>
        </div>
      </div>
      <div style="border-bottom:1px solid #eee;margin:0 14mm"></div>
      ${itemsRows ? `
      <div style="padding:2mm 14mm">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="border-bottom:2px solid #ddd;font-size:11px;color:#999">
              <th style="padding:6px 10px;text-align:left">#</th><th style="padding:6px 10px;text-align:left" colspan="2">Description</th><th style="padding:6px 10px;text-align:right">Rate</th><th style="padding:6px 10px;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>
      <div style="border-bottom:1px solid #eee;margin:0 14mm"></div>
      ` : ''}
      <div style="padding:4mm 14mm">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          ${detailRows.map((row, i) => `
            <tr${altRow(i)}>
              <td style="padding:8px 10px;width:35%;font-weight:600">${row[0]}</td>
              <td style="padding:8px 10px">${row[1]}</td>
              ${showAr ? `<td style="padding:8px 10px;width:20%;direction:rtl;unicode-bidi:embed;text-align:right;font-size:12px;color:#888">${row[2]}</td>` : ''}
            </tr>
          `).join('')}
        </table>
      </div>
      <div style="padding:4mm 14mm;display:flex;justify-content:flex-end">
        <div style="display:flex;align-items:flex-end;gap:6px">
          <div style="text-align:center;border-bottom:2px solid #333;padding:0 10px 4px">
            <div style="font-size:11px;color:#666">${d.cur.symbol} / ${d.cur.name}</div>
            <div style="font-size:22px;font-weight:700">${d.wi.toLocaleString()}</div>
          </div>
          <div style="text-align:center;border-bottom:2px solid #333;padding:0 10px 4px">
            <div style="font-size:11px;color:#666">${d.cur.sub}</div>
            <div style="font-size:18px;font-weight:600">${String(d.fr).padStart(d.dp === 3 ? 3 : 2, '0')}</div>
          </div>
        </div>
      </div>
      <div style="padding:4mm 14mm;display:flex;gap:20px;align-items:flex-end">
        ${c.seal ? `<div><img src="${_esc(c.seal)}" style="max-width:70px;max-height:70px" /></div>` : ''}
        ${d.rv ? `<div><div style="border-top:1px solid #999;width:120px;padding-top:2px;font-size:12px;text-align:center">${_esc(d.rv)}</div><div style="font-size:11px;color:#666;text-align:center">Receiver${showAr ? ' / \u0627\u0644\u0645\u0633\u062A\u0644\u0645' : ''}</div></div>` : ''}
        ${c.signature ? `<div><img src="${_esc(c.signature)}" style="max-width:90px;max-height:40px" /><div style="font-size:11px;color:#666;text-align:center">Authorized Signature${showAr ? ' / \u0627\u0644\u062A\u0648\u0642\u064A\u0639' : ''}</div></div>` : ''}
        ${d.sg ? `<div><div style="border-top:1px solid #999;width:120px;padding-top:2px;font-size:12px;text-align:center">${_esc(d.sg)}</div><div style="font-size:11px;color:#666;text-align:center">Signatory</div></div>` : ''}
      </div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:3mm 14mm;border-top:1px solid #ddd;font-size:11px;color:#666;display:flex;justify-content:space-between">
        <span>${_esc(c.name)}</span><span>${c.tel ? `Tel: ${_esc(c.tel)}` : ''}${c.email ? ` | ${_esc(c.email)}` : ''}</span>
      </div>
      ${c.bankName ? `<div style="position:absolute;bottom:7mm;left:14mm;right:14mm;font-size:11px;color:#666">${[c.bankName, c.bankAcc, c.bankIban].filter(Boolean).join(' | ')}</div>` : ''}
    </div>
  `, d.comp.watermark)
}

const wrap = (html: string, wm: string) => wm ? html.replace('</div>', `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none;z-index:999;font-size:80px;font-weight:900;color:rgba(128,128,128,0.15);transform:rotate(-30deg);text-transform:uppercase">${_esc(wm)}</div></div>`) : html
