/* ==========================================================
   INVOICE TEMPLATE: MINIMAL — no borders, pure content
   ========================================================== */
window._INV_TEMPLATES.minimal = function (d) {
  var c = d.comp;

  var ir = '';
  d.items.forEach(function (it, i) {
    ir += '<div style="display:flex;padding:3px 0;font-size:12px">' +
      '<div style="width:24px;text-align:center;color:#999">' + (i+1) + '</div>' +
      '<div style="flex:2;color:#333">' + esc(it.desc) + '</div>' +
      '<div style="width:50px;text-align:center;color:#666">' + it.qty + '</div>' +
      '<div style="width:80px;text-align:right;color:#666">' + (parseFloat(it.price) || 0).toFixed(d.dp) + '</div>' +
      '<div style="width:90px;text-align:right;font-weight:600;color:#111">' + it.amount + '</div></div>';
  });
  if (!ir) ir = '<div style="text-align:center;color:#bbb;padding:24px;font-style:italic">No items</div>';

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;position:relative;background:#fff;line-height:1.6;min-height:100vh;padding:16mm 18mm;max-width:700px;margin:0 auto;font-kerning:normal">' +
    '<div style="margin-bottom:6mm;text-align:center">' +
    (c.logo ? '<img src="' + esc(c.logo) + '" style="max-width:50px;max-height:50px;object-fit:contain;margin-bottom:4px">' : '') +
    '<div style="font-size:20px;font-weight:700;color:#000;letter-spacing:-.2px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:12px;color:#888;margin-top:1px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:10px;color:#aaa;margin-top:4px">' +
    [c.loc, c.tel, c.email].filter(Boolean).join(' \u00b7 ') +
    '</div></div>' +
    '<div style="text-align:center;margin-bottom:5mm">' +
    '<div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999">INVOICE</div>' +
    '<div style="font-size:13px;color:#555;margin-top:2px">' + esc(d.no) + ' \u00b7 ' + d.dt + (d.dueDt ? ' \u00b7 Due ' + d.dueDt : '') + '</div>' +
    '</div>' +
    '<div style="margin-bottom:5mm">' +
    '<div style="font-size:11px;color:#999;margin-bottom:2px;text-transform:uppercase;letter-spacing:.5px">Bill To</div>' +
    '<div style="font-size:14px;font-weight:600;color:#111">' + esc(d.cust||'---') + '</div>' +
    '<div style="font-size:12px;color:#666">' +
    [d.addr, d.ph && 'Tel: ' + d.ph, d.em].filter(Boolean).join('<br>') +
    '</div></div>' +
    '<div style="margin-bottom:4mm">' +
    '<div style="display:flex;padding:4px 0;font-size:11px;font-weight:600;color:#888;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:.3px">' +
    '<div style="width:24px">#</div><div style="flex:2">Description</div><div style="width:50px;text-align:center">Qty</div><div style="width:80px;text-align:right">Price</div><div style="width:90px;text-align:right">Amount</div></div>' +
    ir +
    '</div>' +
    '<div style="display:flex;justify-content:flex-end;margin-bottom:4mm">' +
    '<div style="min-width:200px;font-size:13px">' +
    '<div style="display:flex;justify-content:space-between;padding:2px 0;color:#666"><span>Subtotal</span><span>' + d.sv + ' ' + d.cur.symbol + '</span></div>' +
    (d.disc>0 ? '<div style="display:flex;justify-content:space-between;padding:2px 0;color:#d32f2f"><span>Discount</span><span>-' + d.dv + ' ' + d.cur.symbol + '</span></div>' : '') +
    (d.vp>0 ? '<div style="display:flex;justify-content:space-between;padding:2px 0;color:#666"><span>VAT (' + d.vp + '%)</span><span>' + d.vv + ' ' + d.cur.symbol + '</span></div>' : '') +
    '<div style="border-top:1px solid #333;margin:4px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:16px;font-weight:700;color:#000"><span>Total</span><span>' + d.gv + ' ' + d.cur.symbol + '</span></div>' +
    '</div></div>' +
    (d.notes || c.invTerms ? '<div style="margin-bottom:4mm;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:3mm">' +
    (d.notes ? '<div>Note: ' + esc(d.notes) + '</div>' : '') +
    (c.invTerms ? '<div>Terms: ' + esc(c.invTerms) + '</div>' : '') +
    '</div>' : '') +
    '<div style="margin-top:6mm;padding-top:3mm;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center">' +
    esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + (c.tel ? ' | Tel: ' + c.tel : '') + (c.email ? ' | ' + c.email : '') +
    (c.invFooter ? '<div style="margin-top:2px">' + esc(c.invFooter) + '</div>' : '') +
    '</div></div>';
};
