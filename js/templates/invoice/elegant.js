/* ==========================================================
   INVOICE TEMPLATE: ELEGANT — serif fonts, ornate accents
   ========================================================== */
window._INV_TEMPLATES.elegant = function (d) {
  var pc = d.comp.pcolor || '#D97706';
  var c = d.comp;

  var ir = '';
  d.items.forEach(function (it, i) {
    var bg = i % 2 === 0 ? '' : 'background:#faf8f5';
    ir += '<tr style="' + bg + '">' +
      '<td style="padding:8px 12px;text-align:center;color:#8b7355;font-size:12px;border-bottom:1px solid #e8ddd0">' + (i+1) + '</td>' +
      '<td style="padding:8px 12px;font-size:12px;color:#3d3229;border-bottom:1px solid #e8ddd0">' + esc(it.desc) + '</td>' +
      '<td style="padding:8px 12px;text-align:center;font-size:12px;color:#8b7355;border-bottom:1px solid #e8ddd0">' + it.qty + '</td>' +
      '<td style="padding:8px 12px;text-align:right;font-size:12px;color:#8b7355;border-bottom:1px solid #e8ddd0">' + (parseFloat(it.price) || 0).toFixed(d.dp) + '</td>' +
      '<td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:700;color:#3d3229;border-bottom:1px solid #e8ddd0">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr><td colspan="5" style="text-align:center;color:#c4b59a;padding:32px;font-size:13px;font-style:italic">No items</td></tr>';

  return '<div style="font-family:Georgia,\'Times New Roman\',Times,serif;font-size:13px;color:#3d3229;position:relative;background:#fff;line-height:1.7;min-height:100vh;padding:14mm 16mm 0;font-kerning:normal">' +
    /* ornate top border */
    '<div style="text-align:center;margin-bottom:4mm;color:' + pc + ';font-size:18px;letter-spacing:6px">\u2726 \u2014 \u2726 \u2014 \u2726</div>' +

    /* header */
    '<div style="text-align:center;margin-bottom:2mm">' +
    (c.logo ? '<img src="' + esc(c.logo) + '" style="max-width:60px;max-height:60px;object-fit:contain;margin-bottom:4px">' : '') +
    '<div style="font-size:28px;font-weight:400;color:#1a1510;letter-spacing:1px;font-variant:small-caps">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:13px;color:#8b7355;font-style:italic;margin-top:2px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    '<div style="text-align:center;font-size:11px;color:#a0907a;margin-bottom:3mm;font-style:italic">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div>' +
    '<div style="text-align:center;border-top:1px solid #e8ddd0;border-bottom:1px solid #e8ddd0;padding:3mm 0;margin-bottom:4mm">' +
    '<div style="font-size:18px;font-weight:700;color:' + pc + ';letter-spacing:2px;font-variant:small-caps">Tax Invoice</div>' +
    '<div style="font-size:12px;color:#a0907a;margin-top:2px">' + esc(d.no) + ' &nbsp;\u2022&nbsp; ' + d.dt + (d.dueDt ? ' &nbsp;\u2022&nbsp; Due ' + d.dueDt : '') + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:6mm;margin-bottom:5mm">' +
    '<div style="flex:1">' +
    '<div style="font-size:10px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Bill To</div>' +
    '<div style="font-size:15px;font-weight:600;color:#1a1510">' + esc(d.cust||'---') + '</div>' +
    '<div style="font-size:12px;color:#6b5d4d">' +
    [d.addr, d.ph && 'Tel: ' + d.ph, d.em].filter(Boolean).join('<br>') +
    '</div></div>' +
    (c.vatReg ? '<div style="text-align:right;font-size:11px;color:#8b7355"><div>VAT Reg: ' + c.vatReg + '</div></div>' : '') +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:5mm">' +
    '<thead><tr style="border-bottom:2px solid #e8ddd0">' +
    '<th style="padding:8px 12px;text-align:center;font-weight:700;font-size:10px;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">#</th>' +
    '<th style="padding:8px 12px;text-align:left;font-weight:700;font-size:10px;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Description</th>' +
    '<th style="padding:8px 12px;text-align:center;font-weight:700;font-size:10px;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Qty</th>' +
    '<th style="padding:8px 12px;text-align:right;font-weight:700;font-size:10px;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Price</th>' +
    '<th style="padding:8px 12px;text-align:right;font-weight:700;font-size:10px;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Amount</th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +
    '<div style="display:flex;justify-content:flex-end">' +
    '<div style="min-width:220px">' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#6b5d4d"><span>Subtotal</span><span style="font-weight:600">' + d.sv + ' ' + d.cur.symbol + '</span></div>' +
    (d.disc>0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#b8860b"><span>Discount</span><span style="font-weight:600">-' + d.dv + ' ' + d.cur.symbol + '</span></div>' : '') +
    (d.vp>0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#6b5d4d"><span>VAT (' + d.vp + '%)</span><span style="font-weight:600">' + d.vv + ' ' + d.cur.symbol + '</span></div>' : '') +
    '<div style="border-top:2px solid #e8ddd0;margin:6px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0 0;font-size:20px;font-weight:700;color:' + pc + '"><span>Total Due</span><span>' + d.gv + ' ' + d.cur.symbol + '</span></div>' +
    '<div style="font-size:11px;color:#a0907a;font-style:italic;margin-top:3px;text-align:right">' + esc(d.gw) + '</div>' +
    '</div></div>' +
    (d.notes || c.invTerms ? '<div style="margin-top:5mm;padding:3mm 0;border-top:1px solid #e8ddd0;font-size:12px;color:#6b5d4d;font-style:italic">' +
    (d.notes ? '<div>' + esc(d.notes) + '</div>' : '') +
    (c.invTerms ? '<div style="margin-top:2px">' + esc(c.invTerms) + '</div>' : '') +
    '</div>' : '') +
    (c.seal || c.signature ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-top:5mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:120px;max-height:120px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + esc(c.signature) + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:10px;color:#8b7355;margin-top:1px;font-style:italic">Authorized Signature</div></div>' : '<div></div>') +
    '</div>' : '') +
    '<div style="text-align:center;margin-top:6mm;padding-top:3mm;border-top:1px solid #e8ddd0;font-size:10px;color:#a0907a;font-style:italic">' +
    esc(c.name) + (c.loc ? ' &mdash; ' + esc(c.loc) : '') + (c.tel ? ' &mdash; Tel: ' + c.tel : '') +
    (c.invFooter ? '<div style="margin-top:2px">' + esc(c.invFooter) + '</div>' : '') +
    '</div></div>';
};
