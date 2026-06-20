/* ==========================================================
   INVOICE TEMPLATE: PROFESSIONAL — color-block, two-column
   ========================================================== */
window._INV_TEMPLATES.professional = function (d) {
  var pc = d.comp.pcolor || '#D97706';
  var ac = d.comp.acolor || '#78716C';
  var c = d.comp;

  var ir = '';
  d.items.forEach(function (it, i) {
    ir += '<tr>' +
      '<td style="padding:8px 10px;text-align:center;color:#666;font-size:12px;border-bottom:1px solid #e0e0e0">' + (i+1) + '</td>' +
      '<td style="padding:8px 10px;font-size:12px;color:#333;border-bottom:1px solid #e0e0e0">' + esc(it.desc) + '</td>' +
      '<td style="padding:8px 10px;text-align:center;font-size:12px;color:#666;border-bottom:1px solid #e0e0e0">' + it.qty + '</td>' +
      '<td style="padding:8px 10px;text-align:right;font-size:12px;color:#666;border-bottom:1px solid #e0e0e0">' + (parseFloat(it.price) || 0).toFixed(d.dp) + '</td>' +
      '<td style="padding:8px 10px;text-align:right;font-size:13px;font-weight:700;color:#111;border-bottom:1px solid #e0e0e0">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:24px;font-size:13px;font-style:italic">No items</td></tr>';

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;position:relative;background:#fff;line-height:1.6;min-height:100vh;padding:0;font-kerning:normal">' +
    /* color-block header */
    '<div style="background:' + pc + ';padding:12mm 14mm 8mm">' +
    '<div style="display:flex;align-items:center;gap:14px">' +
    (c.logo ? '<div style="flex-shrink:0;background:#fff;border-radius:6px;padding:6px"><img src="' + esc(c.logo) + '" style="max-width:50px;max-height:50px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-.2px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:2px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:3px">' +
    [c.loc, c.tel, c.email].filter(Boolean).join(' \u00b7 ') +
    '</div></div>' +
    '<div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:6px 14px;text-align:center">' +
    '<div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.7)">Invoice</div>' +
    '<div style="font-size:16px;font-weight:800;color:#fff">#' + esc(d.no) + '</div>' +
    '</div></div></div>' +

    /* white content area */
    '<div style="padding:6mm 14mm 0">' +

    /* two-column: customer + meta */
    '<div style="display:flex;gap:6mm;margin-bottom:5mm">' +
    '<div style="flex:1;border:1px solid #e8e8e8;border-radius:6px;padding:10px 14px">' +
    '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:' + ac + ';margin-bottom:4px">Bill To</div>' +
    '<div style="font-weight:700;font-size:15px;color:#111">' + esc(d.cust||'---') + '</div>' +
    '<div style="font-size:12px;color:#666;line-height:1.5;margin-top:2px">' +
    [d.addr, d.ph && 'Tel: ' + d.ph, d.cr && 'CR: ' + d.cr, d.em].filter(Boolean).join('<br>') +
    '</div></div>' +
    '<div style="flex:0 0 210px;border:1px solid #e8e8e8;border-radius:6px;padding:10px 14px;font-size:12px;line-height:2">' +
    '<div style="display:flex;justify-content:space-between"><span style="color:#888">Date:</span><strong>' + d.dt + '</strong></div>' +
    (d.dueDt ? '<div style="display:flex;justify-content:space-between"><span style="color:#888">Due:</span><strong>' + d.dueDt + '</strong></div>' : '') +
    (c.vatReg ? '<div style="display:flex;justify-content:space-between"><span style="color:#888">VAT:</span><strong>' + c.vatReg + '</strong></div>' : '') +
    '</div></div>' +

    /* items table */
    '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:4mm;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden">' +
    '<thead><tr style="background:' + ac + '">' +
    '<th style="padding:8px 10px;text-align:center;font-weight:600;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:.3px">#</th>' +
    '<th style="padding:8px 10px;text-align:left;font-weight:600;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:.3px">Description</th>' +
    '<th style="padding:8px 10px;text-align:center;font-weight:600;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:.3px">Qty</th>' +
    '<th style="padding:8px 10px;text-align:right;font-weight:600;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:.3px">Price</th>' +
    '<th style="padding:8px 10px;text-align:right;font-weight:600;font-size:10px;color:#fff;text-transform:uppercase;letter-spacing:.3px">Amount</th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +

    /* totals in bordered box */
    '<div style="display:flex;justify-content:flex-end;margin-bottom:4mm">' +
    '<div style="min-width:230px;border:2px solid ' + pc + ';border-radius:6px;padding:10px 14px">' +
    '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#555"><span>Subtotal</span><span style="font-weight:600">' + d.sv + ' ' + d.cur.symbol + '</span></div>' +
    (d.disc>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#d32f2f"><span>Discount</span><span style="font-weight:600">-' + d.dv + ' ' + d.cur.symbol + '</span></div>' : '') +
    (d.vp>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#555"><span>VAT (' + d.vp + '%)</span><span style="font-weight:600">' + d.vv + ' ' + d.cur.symbol + '</span></div>' : '') +
    '<div style="border-top:1px solid ' + pc + ';margin:4px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0 0;font-size:18px;font-weight:800;color:' + pc + '"><span>Total Due</span><span>' + d.gv + ' ' + d.cur.symbol + '</span></div>' +
    '<div style="font-size:11px;color:#888;font-style:italic;margin-top:2px;text-align:right;border-top:1px solid #eee;padding-top:3px">' + esc(d.gw) + '</div>' +
    '</div></div>' +

    /* payment info */
    '<div style="margin-bottom:4mm;font-size:11px;color:#777">' +
    '<strong style="color:#555">Payment:</strong> ' + esc(d.pd) +
    '</div>' +

    /* notes & terms */
    (d.notes || c.invTerms ? '<div style="margin-bottom:4mm;padding:3mm 0;border-top:1px solid #eee;border-bottom:1px solid #eee;font-size:12px;color:#666">' +
    (d.notes ? '<div><strong style="color:#555">Notes:</strong> ' + esc(d.notes) + '</div>' : '') +
    (c.invTerms ? '<div style="margin-top:2px"><strong style="color:#555">Terms:</strong> ' + esc(c.invTerms) + '</div>' : '') +
    '</div>' : '') +

    /* seal & signature */
    (c.seal || c.signature ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:120px;max-height:120px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + esc(c.signature) + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:10px;color:#999;margin-top:1px">Authorized Signature</div></div>' : '<div></div>') +
    '</div>' : '') +

    '</div>' + /* end padding */

    /* footer */
    '<div style="border-top:3px solid ' + pc + ';padding:3mm 14mm;display:flex;justify-content:space-between;font-size:10px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.invFooter ? '<div style="padding:0 14mm 2mm;text-align:center;font-size:9px;color:#bbb">' + esc(c.invFooter) + '</div>' : '') +
    '</div>';
};
