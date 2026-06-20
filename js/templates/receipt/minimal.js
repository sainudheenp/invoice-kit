/* ==========================================================
   RECEIPT TEMPLATE: MINIMAL — no borders, pure content
   ========================================================== */
window._REC_TEMPLATES.minimal = function (d) {
  var c = d.comp;

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;position:relative;background:#fff;line-height:1.6;min-height:100vh;padding:14mm 18mm;max-width:600px;margin:0 auto;font-kerning:normal">' +
    '<div style="text-align:center;margin-bottom:5mm">' +
    (c.logo ? '<img src="' + esc(c.logo) + '" style="max-width:45px;max-height:45px;object-fit:contain;margin-bottom:4px">' : '') +
    '<div style="font-size:18px;font-weight:700;color:#000">' + esc(c.name) + '</div>' +
    '<div style="font-size:10px;color:#aaa;margin-top:3px">' +
    [c.loc, c.tel, c.email].filter(Boolean).join(' \u00b7 ') +
    '</div></div>' +
    '<div style="text-align:center;margin-bottom:5mm">' +
    '<div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999">Receipt Voucher</div>' +
    '<div style="font-size:12px;color:#555;margin-top:2px">' + esc(d.no) + ' \u00b7 ' + d.dt + '</div>' +
    '</div>' +
    '<div style="margin-bottom:3mm">' +
    '<div style="font-size:11px;color:#999;margin-bottom:1px;text-transform:uppercase;letter-spacing:.5px">Received From</div>' +
    '<div style="font-size:15px;font-weight:600;color:#111">' + esc(d.rf||'\u2014') + '</div>' +
    '</div>' +
    '<div style="margin-bottom:3mm">' +
    '<div style="font-size:11px;color:#999;margin-bottom:1px;text-transform:uppercase;letter-spacing:.5px">Amount</div>' +
    '<div style="font-size:14px;color:#555;font-style:italic">' + esc(d.ww) + '</div>' +
    '<div style="font-size:20px;font-weight:700;color:#000;margin-top:2px">' + d.amFmt + ' ' + d.cur.symbol + '</div>' +
    '</div>' +
    '<div style="margin-bottom:2mm">' +
    '<div style="display:flex;padding:3px 0"><span style="width:90px;font-size:11px;color:#999">Payment:</span><span style="font-size:13px">' + esc(d.pm) + d.chqHtml + '</span></div>' +
    ((d.bk||d.td) ? '<div style="display:flex;padding:3px 0"><span style="width:90px;font-size:11px;color:#999">Bank:</span><span style="font-size:13px">' + esc(d.bk) + (d.bk&&d.td?' / ':'') + esc(d.td) + '</span></div>' : '') +
    '<div style="display:flex;padding:3px 0"><span style="width:90px;font-size:11px;color:#999">Purpose:</span><span style="font-size:13px">' + esc(d.bg||'\u2014') + '</span></div>' +
    '</div>' +
    (d.rv ? '<div style="margin-top:5mm;padding-top:3mm;border-top:1px solid #eee;text-align:center">' +
    '<div style="font-size:13px;font-weight:600">' + esc(d.rv) + '</div>' +
    '<div style="font-size:10px;color:#999">Receiver</div>' +
    '</div>' : '') +
    '<div style="margin-top:6mm;padding-top:3mm;border-top:1px solid #eee;font-size:9px;color:#aaa;text-align:center">' +
    esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + (c.tel ? ' | Tel: ' + c.tel : '') +
    '</div></div>';
};
