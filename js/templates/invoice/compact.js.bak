/* ==========================================================
   INVOICE TEMPLATE: COMPACT — tight spacing, condensed
   ========================================================== */
window._INV_TEMPLATES.compact = function (d) {
  var pc = d.comp.pcolor || '#D97706';
  var ac = d.comp.acolor || '#78716C';
  var c = d.comp;

  var ir = '';
  d.items.forEach(function (it, i) {
    ir += '<tr>' +
      '<td style="padding:4px 6px;text-align:center;font-size:11px;color:#666;border-bottom:1px solid #e8e8e8">' + (i+1) + '</td>' +
      '<td style="padding:4px 6px;font-size:11px;color:#333;border-bottom:1px solid #e8e8e8">' + esc(it.desc) + '</td>' +
      '<td style="padding:4px 6px;text-align:center;font-size:11px;color:#666;border-bottom:1px solid #e8e8e8">' + it.qty + '</td>' +
      '<td style="padding:4px 6px;text-align:right;font-size:11px;color:#666;border-bottom:1px solid #e8e8e8">' + (parseFloat(it.price) || 0).toFixed(d.dp) + '</td>' +
      '<td style="padding:4px 6px;text-align:right;font-size:12px;font-weight:600;color:#111;border-bottom:1px solid #e8e8e8">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:16px;font-size:12px;font-style:italic">No items</td></tr>';

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;position:relative;background:#fff;line-height:1.4;min-height:100vh;padding:6mm 8mm 0;font-kerning:normal">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2mm">' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    (c.logo ? '<img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:32px;max-height:32px;object-fit:contain">' : '') +
    '<div><div style="font-size:16px;font-weight:700;color:#222">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:10px;color:#888">' + esc(c.sub) + '</div>' : '') +
    '</div></div>' +
    '<div style="text-align:right"><div style="font-size:14px;font-weight:700;color:' + pc + '">INVOICE #' + esc(d.no) + '</div>' +
    '<div style="font-size:10px;color:#888">' + d.dt + (d.dueDt ? ' | Due: ' + d.dueDt : '') + '</div></div>' +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-bottom:2mm;padding:3px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd">' +
    '<div>' + [c.loc, c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    (c.vatReg ? '<div>VAT: ' + c.vatReg + '</div>' : '') +
    '</div>' +
    '<div style="font-size:11px;margin-bottom:2mm"><strong>' + esc(d.cust||'---') + '</strong>' +
    (d.addr ? ' &mdash; ' + esc(d.addr) : '') +
    (d.ph ? ' &mdash; Tel: ' + esc(d.ph) : '') +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:3mm">' +
    '<thead><tr style="background:' + pc + '">' +
    '<th style="padding:5px 6px;text-align:center;font-weight:600;font-size:10px;color:#fff">#</th>' +
    '<th style="padding:5px 6px;text-align:left;font-weight:600;font-size:10px;color:#fff">Description</th>' +
    '<th style="padding:5px 6px;text-align:center;font-weight:600;font-size:10px;color:#fff">Qty</th>' +
    '<th style="padding:5px 6px;text-align:right;font-weight:600;font-size:10px;color:#fff">Price</th>' +
    '<th style="padding:5px 6px;text-align:right;font-weight:600;font-size:10px;color:#fff">Amount</th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +
    '<div style="display:flex;justify-content:flex-end">' +
    '<div style="min-width:180px;font-size:12px">' +
    '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#666">Subtotal</span><span style="font-weight:600">' + d.sv + ' ' + d.cur.symbol + '</span></div>' +
    (d.disc>0 ? '<div style="display:flex;justify-content:space-between;padding:2px 0;color:#d32f2f"><span>Discount</span><span style="font-weight:600">-' + d.dv + ' ' + d.cur.symbol + '</span></div>' : '') +
    (d.vp>0 ? '<div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:#666">VAT (' + d.vp + '%)</span><span style="font-weight:600">' + d.vv + ' ' + d.cur.symbol + '</span></div>' : '') +
    '<div style="border-top:1px solid ' + ac + ';margin:3px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:16px;font-weight:700;color:#111"><span>Total</span><span>' + d.gv + ' ' + d.cur.symbol + '</span></div>' +
    '</div></div>' +
    '<div style="margin-top:3mm;font-size:10px;color:#888;border-top:1px solid #eee;padding-top:2mm">' +
    '<div>Payment: ' + esc(d.pd) + '</div>' +
    (d.notes ? '<div>Notes: ' + esc(d.notes) + '</div>' : '') +
    (c.invTerms ? '<div>Terms: ' + esc(c.invTerms) + '</div>' : '') +
    '</div>' +
    '<div style="position:absolute;bottom:4mm;left:8mm;right:8mm;border-top:1px solid #ddd;padding-top:1mm;display:flex;justify-content:space-between;font-size:9px;color:' + ac + '">' +
    '<div>' + esc(c.name) + '</div><div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    '</div>';
};
