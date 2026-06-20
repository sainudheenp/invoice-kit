/* ==========================================================
   INVOICE TEMPLATE: BOLD — dark header, high contrast
   ========================================================== */
window._INV_TEMPLATES.bold = function (d) {
  var pc = d.comp.pcolor || '#D97706';
  var ac = d.comp.acolor || '#78716C';
  var c = d.comp;

  var ir = '';
  d.items.forEach(function (it, i) {
    var bg = i % 2 === 0 ? '' : 'background:#f5f5f5';
    ir += '<tr style="' + bg + '">' +
      '<td style="padding:10px 8px;text-align:center;color:#666;font-size:13px;border-bottom:1px solid #ddd">' + (i+1) + '</td>' +
      '<td style="padding:10px 8px;font-size:13px;color:#333;border-bottom:1px solid #ddd">' + esc(it.desc) + '</td>' +
      '<td style="padding:10px 8px;text-align:center;font-size:13px;color:#666;border-bottom:1px solid #ddd">' + it.qty + '</td>' +
      '<td style="padding:10px 8px;text-align:right;font-size:13px;color:#666;border-bottom:1px solid #ddd">' + (parseFloat(it.price) || 0).toFixed(d.dp) + '</td>' +
      '<td style="padding:10px 8px;text-align:right;font-size:14px;font-weight:700;color:#111;border-bottom:1px solid #ddd">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:32px;font-size:14px;font-style:italic">No items</td></tr>';

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;line-height:1.7;min-height:100vh;padding:0;font-kerning:normal">' +
    /* dark header */
    '<div style="background:#1a1a2e;padding:14mm 16mm 10mm;color:#fff">' +
    '<div style="display:flex;align-items:center;gap:14px">' +
    (c.logo ? '<div style="flex-shrink:0;background:#fff;border-radius:4px;padding:4px"><img src="' + esc(c.logo) + '" style="max-width:48px;max-height:48px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:26px;font-weight:800;letter-spacing:-.3px;color:#fff">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:14px;color:#aaa;margin-top:2px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    '<div style="text-align:right">' +
    '<div style="font-size:11px;color:' + pc + ';text-transform:uppercase;letter-spacing:2px;font-weight:700">TAX INVOICE</div>' +
    '<div style="font-size:20px;font-weight:800;color:#fff;margin-top:2px">#' + esc(d.no) + '</div>' +
    '</div></div>' +
    '<div style="display:flex;gap:20px;margin-top:6mm;font-size:11px;color:#aaa;border-top:1px solid rgba(255,255,255,0.1);padding-top:4mm">' +
    '<div>' + [c.loc, c.cr && 'CR: ' + c.cr].filter(Boolean).join(' | ') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    (c.vatReg ? '<div style="margin-left:auto;color:' + pc + '">VAT: ' + c.vatReg + '</div>' : '') +
    '</div></div>' +

    /* body */
    '<div style="padding:8mm 16mm 0">' +

    /* meta row */
    '<div style="display:flex;justify-content:space-between;margin-bottom:5mm;font-size:12px;color:#888">' +
    '<div><span style="color:#999">Date:</span> <strong style="color:#333">' + d.dt + '</strong></div>' +
    (d.dueDt ? '<div><span style="color:#999">Due:</span> <strong style="color:#333">' + d.dueDt + '</strong></div>' : '') +
    '</div>' +

    /* customer */
    '<div style="margin-bottom:5mm">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:3px">Bill To</div>' +
    '<div style="font-weight:700;font-size:16px;color:#1a1a2e">' + esc(d.cust||'---') + '</div>' +
    '<div style="font-size:12px;color:#666;line-height:1.6">' +
    [d.addr, d.ph && 'Tel: ' + d.ph, d.em].filter(Boolean).join('<br>') +
    '</div></div>' +

    /* table */
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:5mm">' +
    '<thead><tr style="background:#1a1a2e">' +
    '<th style="padding:10px 8px;text-align:center;font-weight:700;font-size:11px;color:' + pc + '">#</th>' +
    '<th style="padding:10px 8px;text-align:left;font-weight:700;font-size:11px;color:#fff">Description</th>' +
    '<th style="padding:10px 8px;text-align:center;font-weight:700;font-size:11px;color:#fff">Qty</th>' +
    '<th style="padding:10px 8px;text-align:right;font-weight:700;font-size:11px;color:#fff">Price</th>' +
    '<th style="padding:10px 8px;text-align:right;font-weight:700;font-size:11px;color:' + pc + '">Amount</th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +

    /* totals */
    '<div style="display:flex;justify-content:flex-end">' +
    '<div style="min-width:220px">' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#555"><span>Subtotal</span><span style="font-weight:600">' + d.sv + ' ' + d.cur.symbol + '</span></div>' +
    (d.disc>0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#d32f2f"><span>Discount</span><span style="font-weight:600">-' + d.dv + ' ' + d.cur.symbol + '</span></div>' : '') +
    (d.vp>0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#555"><span>VAT (' + d.vp + '%)</span><span style="font-weight:600">' + d.vv + ' ' + d.cur.symbol + '</span></div>' : '') +
    '<div style="border-top:2px solid #1a1a2e;margin:6px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0 0;font-size:22px;font-weight:800;color:#1a1a2e"><span>Total Due</span><span>' + d.gv + ' ' + d.cur.symbol + '</span></div>' +
    '<div style="font-size:12px;color:#888;font-style:italic;margin-top:4px;text-align:right">' + esc(d.gw) + '</div>' +
    '</div></div>' +

    /* notes */
    (d.notes || c.invTerms ? '<div style="margin-top:5mm;padding:3mm 0;font-size:12px;color:#666;border-top:1px solid #eee">' +
    (d.notes ? '<span style="font-weight:600;color:#333">Notes:</span> ' + esc(d.notes) + '<br>' : '') +
    (c.invTerms ? '<span style="font-weight:600;color:#333">Terms:</span> ' + esc(c.invTerms) : '') +
    '</div>' : '') +

    /* seal & signature */
    (c.seal || c.signature ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-top:6mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:130px;max-height:130px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + esc(c.signature) + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:10px;color:#999;margin-top:1px">Authorized Signature</div></div>' : '<div></div>') +
    '</div>' : '') +

    '</div>' + /* end body padding */

    /* footer */
    '<div style="margin-top:6mm;background:#1a1a2e;padding:3mm 16mm;display:flex;justify-content:space-between;font-size:10px;color:#888">' +
    '<div>' + esc(c.name) + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.invFooter ? '<div style="background:#1a1a2e;padding:0 16mm 2mm;text-align:center;font-size:9px;color:#666">' + esc(c.invFooter) + '</div>' : '') +
    '</div>';
};
