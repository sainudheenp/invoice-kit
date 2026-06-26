import type { RecTemplateData } from '@/types/template'
import { esc } from '@/utils/esc'
import { watermarkWrap } from '../shared'

const DB = '#476694'
const LB = '#D6E4F0'
const GR = '#CCCCCC'

export function ReceiptBeirak(d: RecTemplateData) {
  const c = d.comp

  const itemsRows = d.items.length > 0 ? d.items.map((item, i) => `
    <tr>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:center">${i + 1}</td>
      <td style="padding:6px 4px;border:1px solid ${GR}">${esc(item.desc)}</td>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:center">${item.qty}</td>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:right">${d.cur.symbol}${item.price.toFixed(d.dp)}</td>
      <td style="padding:6px 4px;border:1px solid ${GR};text-align:right">${d.cur.symbol}${item.amount.toFixed(d.dp)}</td>
    </tr>
  `).join('') : ''

  return watermarkWrap(`
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;min-height:100vh;padding:0">
      <div style="text-align:center;padding-top:8mm">
        ${c.logo ? `<img src="${esc(c.logo)}" style="max-width:70px;max-height:70px;margin-bottom:4px" />` : ''}
        <div style="font-size:18px;font-weight:700;color:${DB}">${esc(c.name)}</div>
        ${c.sub ? `<div style="font-size:13px;color:#000;margin-top:1px">${esc(c.sub)}</div>` : ''}
      </div>
      <div style="border-bottom:2px solid ${DB};margin:0 12mm 4mm"></div>
      <div style="text-align:center;margin:4mm auto">
        <div style="font-size:14px;font-weight:700;color:#333;letter-spacing:1px">RECEIPT VOUCHER</div>
      </div>
      <div style="border-bottom:1px solid ${GR};margin:0 12mm 4mm"></div>
      <div style="padding:0 12mm;display:flex;gap:4mm">
        <table style="width:48%;border-collapse:collapse;font-size:12px">
          ${[
            ['Receipt No.', esc(d.no)],
            ['Date', d.dt],
          ].map(([l, v]) => `
            <tr>
              <td style="padding:3px 6px;border:1px solid ${GR};background:${LB};font-weight:600;width:40%">${l}</td>
              <td style="padding:3px 6px;border:1px solid ${GR}">${v}</td>
            </tr>
          `).join('')}
        </table>
        <table style="width:48%;border-collapse:collapse;font-size:12px">
          ${[
            ['Received From', esc(d.rf)],
            ...(d.bk ? [['Bank', esc(d.bk)]] : []),
            ['Payment', [d.pm, d.ch].filter(Boolean).join(' - ')],
          ].map(([l, v]) => `
            <tr>
              <td style="padding:3px 6px;border:1px solid ${GR};background:${LB};font-weight:600;width:40%">${l}</td>
              <td style="padding:3px 6px;border:1px solid ${GR}">${v}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      ${itemsRows ? `
      <div style="padding:4mm 12mm">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:${DB};color:#fff">
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:center">#</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:left">Description</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:center">Qty</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:right">Price</th>
              <th style="padding:6px 4px;border:1px solid ${GR};text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>
      ` : ''}
      <div style="padding:4mm 12mm;display:flex;justify-content:flex-end">
        <table style="width:220px;border-collapse:collapse;font-size:12px">
          <tr style="background:${LB}"><td style="padding:4px 8px;border:1px solid ${GR};font-weight:600">Amount</td><td style="padding:4px 8px;border:1px solid ${GR};text-align:right;font-weight:700;font-size:16px">${d.cur.symbol}${d.amFmt}</td></tr>
        </table>
      </div>
      ${d.ww ? `<div style="padding:0 12mm;font-size:12px;color:#666;font-style:italic;text-align:right">${esc(d.ww)}</div>` : ''}
      ${d.bg ? `<div style="padding:2mm 12mm;font-size:12px"><strong>Purpose:</strong> ${esc(d.bg)}</div>` : ''}
      <div style="padding:0 12mm;display:flex;gap:20px;margin-top:4mm;align-items:flex-end">
        <div style="flex:1">
          ${d.rv ? `<div style="border-top:1px solid #333;width:100px;padding-top:2px;margin-top:2px;font-size:12px;text-align:center">${esc(d.rv)}</div><div style="font-size:11px;color:#666;text-align:center">Receiver</div>` : ''}
        </div>
        ${c.seal ? `<div><img src="${esc(c.seal)}" style="max-width:70px;max-height:70px" /></div>` : ''}
        ${c.signature ? `<div style="text-align:center"><img src="${esc(c.signature)}" style="max-width:90px;max-height:45px" /><div style="font-size:11px;color:#666;border-top:1px solid #999;padding-top:2px;margin-top:2px">Authorized Signature</div></div>` : ''}
        <div style="flex:1;text-align:right">
          ${d.sg ? `<div style="border-top:1px solid #333;width:100px;padding-top:2px;margin-top:2px;margin-left:auto;font-size:12px;text-align:center">${esc(d.sg)}</div><div style="font-size:11px;color:#666;text-align:center;margin-left:auto">Signatory</div>` : ''}
        </div>
      </div>
      <div style="border-top:1px solid ${DB};margin:6mm 12mm 0;padding-top:3mm;font-size:11px;color:#666;text-align:center">
        ${esc(c.name)}${c.tel ? ` | ${esc(c.tel)}` : ''}${c.email ? ` | ${esc(c.email)}` : ''}
      </div>
      ${c.loc ? `<div style="font-size:11px;color:#666;text-align:center">${esc(c.loc)}</div>` : ''}
    </div>
  `, d.comp.watermark)
}
