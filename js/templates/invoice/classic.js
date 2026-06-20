/* ==========================================================
   INVOICE TEMPLATE: CLASSIC (current design)
   ========================================================== */
window._INV_TEMPLATES.classic = function (d) {
  var pc = d.comp.pcolor || '#D97706';
  var ac = d.comp.acolor || '#78716C';
  var c = d.comp;

  var ir = '';
  d.items.forEach(function (it, i) {
    var b = i % 2 === 0 ? '#fff' : '#FAFAFA';
    ir += '<tr style="background:' + b + '">' +
      '<td style="padding:10px 10px;text-align:center;color:#555;font-size:13px;border-bottom:1px solid #eee;width:32px">' + (i+1) + '</td>' +
      '<td style="padding:10px 10px;font-size:13px;color:#333;border-bottom:1px solid #eee">' + esc(it.desc) + '</td>' +
      '<td style="padding:10px 10px;text-align:center;font-size:13px;color:#555;border-bottom:1px solid #eee;width:50px">' + it.qty + '</td>' +
      '<td style="padding:10px 10px;text-align:right;font-size:13px;color:#555;border-bottom:1px solid #eee;width:85px">' + (parseFloat(it.price) || 0).toFixed(d.dp) + '</td>' +
      '<td style="padding:10px 10px;text-align:right;font-size:14px;font-weight:700;color:#111;border-bottom:1px solid #eee;width:90px">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr style="background:#fafafa"><td colspan="5" style="text-align:center;color:#bbb;padding:32px;font-size:14px;font-style:italic">No items</td></tr>';

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2d2d2d;position:relative;background:#fff;line-height:1.8;min-height:100vh;padding:14mm 15mm 0;-webkit-font-smoothing:antialiased;font-kerning:normal;word-spacing:normal">' +
    '<div style="position:absolute;top:0;left:0;right:0;height:4px;background:' + pc + '"></div>' +
    '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:4mm">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:55px;max-height:55px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1;min-width:0">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
    '<div>' +
    '<div style="font-size:26px;font-weight:800;letter-spacing:-.3px;color:#222;margin-bottom:1px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:15px;font-style:italic;color:#888;margin-bottom:2px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    (c.nameAr ? '<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:26px;font-weight:800;color:#222;margin-bottom:1px">' + esc(c.nameAr) + '</div>' +
    (c.subAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:13px;color:#888;margin-bottom:2px">' + esc(c.subAr) + '</div>' : '') +
    '</div>' : '') +
    '</div>' +
    '<div style="font-size:11px;color:' + ac + ';line-height:1.6">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div></div>' +
    '<div style="border-bottom:1px solid #ddd;margin-bottom:4mm"></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    '<div><div style="font-size:24px;font-weight:800;color:' + pc + ';letter-spacing:.3px">TAX INVOICE</div><div dir="rtl" unicode-bidi="embed" style="font-size:12px;color:#999;margin-top:1px">\u0641\u0627\u062a\u0648\u0631\u0629 \u0636\u0631\u064a\u0628\u064a\u0629</div></div>' +
    '<div style="text-align:right;font-size:13px;color:' + ac + ';line-height:1.9">' +
    '<span style="color:#777">Invoice No.</span> <strong style="color:#222">' + d.no + '</strong><br>' +
    '<span style="color:#777">Date</span> <strong style="color:#222">' + d.dt + '</strong>' +
    (d.dueDt ? '<br><span style="color:#777">Due Date</span> <strong style="color:#222">' + d.dueDt + '</strong>' : '') +
    (c.vatReg ? '<br><span style="color:#777">VAT Reg.</span> <strong style="color:#222">' + c.vatReg + '</strong>' : '') +
    '</div></div>' +
    '<div style="border-bottom:1px solid #eee;margin-bottom:4mm"></div>' +
    '<div style="margin-bottom:5mm">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1px;color:' + ac + ';margin-bottom:3px">Bill To / \u0625\u0644\u0649 \u0627\u0644\u0633\u064a\u062f</div>' +
    '<div style="font-weight:700;font-size:16px;color:#111;margin-bottom:3px">' + esc(d.cust||'---') + '</div>' +
    '<div style="font-size:13px;color:#666;line-height:1.7">' +
    [d.addr, d.ph && 'Tel: ' + d.ph, d.cr && 'C.R.: ' + d.cr, d.em].filter(Boolean).join('<br>') +
    '</div></div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:5mm">' +
    '<thead><tr style="background:' + pc + '">' +
    '<th style="padding:10px 10px;text-align:center;font-weight:700;font-size:12px;color:#fff;width:32px">#</th>' +
    '<th style="padding:10px 10px;text-align:left;font-weight:700;font-size:12px;color:#fff">Description / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u0628\u064a\u0627\u0646</span></th>' +
    '<th style="padding:10px 10px;text-align:center;font-weight:700;font-size:12px;color:#fff;width:50px">Qty / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u0643\u0645\u064a\u0629</span></th>' +
    '<th style="padding:10px 10px;text-align:right;font-weight:700;font-size:12px;color:#fff;width:85px">Price / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u0633\u0639\u0631</span></th>' +
    '<th style="padding:10px 10px;text-align:right;font-weight:700;font-size:12px;color:#fff;width:90px">Amount / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u0645\u0628\u0644\u063a</span></th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +
    '<div style="display:flex;justify-content:flex-end;margin-bottom:4mm">' +
    '<div style="min-width:220px">' +
    '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;color:#444"><span>Subtotal</span><span style="font-weight:600">' + d.sv + ' ' + d.cur.symbol + '</span></div>' +
    (d.disc>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;color:#d32f2f"><span>Discount</span><span style="font-weight:600">-' + d.dv + ' ' + d.cur.symbol + '</span></div>' : '') +
    (d.vp>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;color:#444"><span>VAT (' + d.vp + '%)</span><span style="font-weight:600">' + d.vv + ' ' + d.cur.symbol + '</span></div>' : '') +
    '<div style="border-top:2px solid ' + ac + ';margin:5px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:5px 0 0;font-size:22px;font-weight:800;color:#111"><span>Total</span><span>' + d.gv + ' ' + d.cur.symbol + '</span></div>' +
    '<div style="font-size:12px;color:#888;font-style:italic;margin-top:4px;text-align:right">' + esc(d.gw) + '</div>' +
    '</div></div>' +
    '<div style="margin-bottom:4mm;font-size:12px;color:#555">' +
    '<span style="font-weight:600;color:' + ac + '">Payment:</span> ' + esc(d.pd||'\u2014') +
    (d.notes ? ' &nbsp;|&nbsp; <span style="font-weight:600;color:' + ac + '">Notes:</span> ' + esc(d.notes) : '') +
    (c.invTerms ? ' &nbsp;|&nbsp; <span style="font-weight:600;color:' + ac + '">Terms:</span> ' + esc(c.invTerms) : '') +
    '</div>' +
    (c.seal || c.signature ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:6mm">' +
    (c.seal ? '<div><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:130px;max-height:130px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:11px;color:#999;margin-top:1px">Authorized Signature / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u062a\u0648\u0642\u064a\u0639</span></div></div>' : '<div></div>') +
    '</div>' : '') +
    '<div style="position:absolute;bottom:6mm;left:15mm;right:15mm;border-top:1px solid #ddd;padding-top:2mm;display:flex;justify-content:space-between;font-size:11px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.invFooter ? '<div style="position:absolute;bottom:0;left:15mm;right:15mm;text-align:center;font-size:9px;color:#bbb;padding-top:2mm">' + esc(c.invFooter) + '</div>' : '') +
    '</div>';
};
