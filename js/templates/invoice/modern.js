/* ==========================================================
   INVOICE TEMPLATE: MODERN — card-based, side accent
   ========================================================== */
window._INV_TEMPLATES.modern = function (d) {
  var pc = d.comp.pcolor || '#D97706';
  var ac = d.comp.acolor || '#78716C';
  var c = d.comp;

  var ir = '';
  d.items.forEach(function (it, i) {
    ir += '<tr>' +
      '<td style="padding:8px 12px;text-align:center;color:#888;font-size:13px;border-bottom:1px solid #eee">' + (i+1) + '</td>' +
      '<td style="padding:8px 12px;font-size:13px;color:#333;border-bottom:1px solid #eee">' + esc(it.desc) + '</td>' +
      '<td style="padding:8px 12px;text-align:center;font-size:13px;color:#666;border-bottom:1px solid #eee">' + it.qty + '</td>' +
      '<td style="padding:8px 12px;text-align:right;font-size:13px;color:#666;border-bottom:1px solid #eee">' + (parseFloat(it.price) || 0).toFixed(d.dp) + '</td>' +
      '<td style="padding:8px 12px;text-align:right;font-size:14px;font-weight:700;color:#111;border-bottom:1px solid #eee">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:32px;font-size:14px;font-style:italic">No items</td></tr>';

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;line-height:1.7;min-height:100vh;padding:0;font-kerning:normal">' +
    /* left accent bar */
    '<div style="position:absolute;top:0;left:0;bottom:0;width:5px;background:' + pc + '"></div>' +

    '<div style="padding:18mm 18mm 0 20mm">' +

    /* ——— HEADER CARD ——— */
    '<div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:6mm;display:flex;align-items:center;gap:14px">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:48px;max-height:48px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:24px;font-weight:700;color:#111">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:13px;color:#888;margin-top:1px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:11px;color:' + ac + ';margin-top:3px">' +
    [c.loc, c.tel && c.tel, c.email].filter(Boolean).join(' \u00b7 ') +
    '</div></div>' +
    '<div style="text-align:right;border-left:2px solid ' + pc + ';padding-left:16px">' +
    '<div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px">INVOICE</div>' +
    '<div style="font-size:18px;font-weight:800;color:' + pc + '">#' + esc(d.no) + '</div>' +
    '</div></div>' +

    /* ——— CUSTOMER + METADATA ROW ——— */
    '<div style="display:flex;gap:6mm;margin-bottom:6mm">' +
    '<div style="flex:1;background:#f9fafb;border-radius:8px;padding:12px 16px">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + ac + ';margin-bottom:4px">Bill To</div>' +
    '<div style="font-weight:600;font-size:15px;color:#111;margin-bottom:2px">' + esc(d.cust||'---') + '</div>' +
    '<div style="font-size:12px;color:#666;line-height:1.5">' +
    [d.addr, d.ph && 'Tel: ' + d.ph, d.em].filter(Boolean).join('<br>') +
    '</div></div>' +
    '<div style="flex:0 0 200px;background:#f9fafb;border-radius:8px;padding:12px 16px;text-align:right;font-size:12px;line-height:1.8">' +
    '<div><span style="color:#999">Date:</span> <strong style="color:#333">' + d.dt + '</strong></div>' +
    (d.dueDt ? '<div><span style="color:#999">Due:</span> <strong style="color:#333">' + d.dueDt + '</strong></div>' : '') +
    (c.vatReg ? '<div><span style="color:#999">VAT:</span> <strong style="color:#333">' + c.vatReg + '</strong></div>' : '') +
    '</div></div>' +

    /* ——— ITEMS TABLE ——— */
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:5mm;border-radius:8px;overflow:hidden">' +
    '<thead><tr style="background:' + pc + '">' +
    '<th style="padding:10px 12px;text-align:center;font-weight:600;font-size:11px;color:#fff;width:32px">#</th>' +
    '<th style="padding:10px 12px;text-align:left;font-weight:600;font-size:11px;color:#fff">Description</th>' +
    '<th style="padding:10px 12px;text-align:center;font-weight:600;font-size:11px;color:#fff;width:55px">Qty</th>' +
    '<th style="padding:10px 12px;text-align:right;font-weight:600;font-size:11px;color:#fff;width:85px">Price</th>' +
    '<th style="padding:10px 12px;text-align:right;font-weight:600;font-size:11px;color:#fff;width:90px">Amount</th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +

    /* ——— TOTALS CARD ——— */
    '<div style="display:flex;justify-content:flex-end;margin-bottom:5mm">' +
    '<div style="min-width:240px;background:#f9fafb;border-radius:8px;border:1px solid #eee;padding:14px 18px">' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#555"><span>Subtotal</span><span style="font-weight:600">' + d.sv + ' ' + d.cur.symbol + '</span></div>' +
    (d.disc>0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#d32f2f"><span>Discount</span><span style="font-weight:600">-' + d.dv + ' ' + d.cur.symbol + '</span></div>' : '') +
    (d.vp>0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#555"><span>VAT (' + d.vp + '%)</span><span style="font-weight:600">' + d.vv + ' ' + d.cur.symbol + '</span></div>' : '') +
    '<div style="border-top:1px dashed ' + ac + ';margin:6px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:5px 0 0;font-size:20px;font-weight:800;color:' + pc + '"><span>Total Due</span><span>' + d.gv + ' ' + d.cur.symbol + '</span></div>' +
    '<div style="font-size:11px;color:#888;font-style:italic;margin-top:3px;text-align:right">' + esc(d.gw) + '</div>' +
    '</div></div>' +

    /* ——— NOTES / TERMS ——— */
    (d.notes || c.invTerms ? '<div style="margin-bottom:4mm;font-size:12px;color:#555;background:#f9fafb;border-radius:8px;padding:10px 16px">' +
    (d.notes ? '<div><span style="font-weight:600;color:' + ac + '">Notes:</span> ' + esc(d.notes) + '</div>' : '') +
    (c.invTerms ? '<div style="margin-top:4px"><span style="font-weight:600;color:' + ac + '">Terms:</span> ' + esc(c.invTerms) + '</div>' : '') +
    '</div>' : '') +

    /* ——— SEAL & SIGNATURE ——— */
    (c.seal || c.signature ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:6mm">' +
    (c.seal ? '<div><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:130px;max-height:130px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:11px;color:#999;margin-top:1px">Authorized Signature</div></div>' : '<div></div>') +
    '</div>' : '') +

    '</div>' + /* end padding */

    /* ——— FOOTER ——— */
    '<div style="padding:3mm 18mm;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:11px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.invFooter ? '<div style="padding:0 18mm 2mm;text-align:center;font-size:9px;color:#bbb">' + esc(c.invFooter) + '</div>' : '') +
    '</div>';
};
