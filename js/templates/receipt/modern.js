/* ==========================================================
   RECEIPT TEMPLATE: MODERN — card-based, side accent
   ========================================================== */
window._REC_TEMPLATES.modern = function (d) {
  var pc = d.pc;
  var ac = d.ac;
  var c = d.comp;

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;line-height:1.7;min-height:100vh;padding:0;font-kerning:normal">' +
    '<div style="position:absolute;top:0;left:0;bottom:0;width:5px;background:' + pc + '"></div>' +
    '<div style="padding:12mm 16mm 0 18mm">' +
    '<div style="background:#f9fafb;border-radius:8px;padding:14px 18px;margin-bottom:4mm;display:flex;align-items:center;gap:12px">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + esc(c.logo) + '" style="max-width:45px;max-height:45px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:20px;font-weight:700;color:#111">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:12px;color:#888">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    '<div style="text-align:right;border-left:2px solid ' + pc + ';padding-left:14px">' +
    '<div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px">RECEIPT</div>' +
    '<div style="font-size:16px;font-weight:800;color:' + pc + '">#' + esc(d.no) + '</div>' +
    '</div></div>' +
    '<div style="display:flex;gap:4mm;margin-bottom:4mm">' +
    '<div style="flex:1;background:#f9fafb;border-radius:8px;padding:10px 14px">' +
    '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + ac + ';margin-bottom:3px">Received From</div>' +
    '<div style="font-size:15px;font-weight:600;color:#111">' + esc(d.rf||'\u2014') + '</div>' +
    '</div>' +
    '<div style="flex:0 0 160px;background:#f9fafb;border-radius:8px;padding:10px 14px;text-align:right;font-size:12px">' +
    '<div><span style="color:#999">Date:</span> <strong>' + d.dt + '</strong></div>' +
    '</div></div>' +
    '<div style="background:#f9fafb;border-radius:8px;padding:10px 14px;margin-bottom:4mm">' +
    '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + ac + ';margin-bottom:3px">Amount</div>' +
    '<div style="font-size:14px;color:#555;font-style:italic">' + esc(d.ww) + '</div>' +
    '<div style="font-size:24px;font-weight:800;color:' + pc + ';margin-top:4px">' + d.amFmt + ' ' + d.cur.symbol + '</div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:4mm">' +
    '<tr><td style="padding:2.5mm 10px;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px;width:30%">Payment</td>' +
    '<td style="padding:2.5mm 10px;border-bottom:1px solid #eee;font-size:14px;color:#222">' + esc(d.pm) + d.chqHtml + '</td></tr>' +
    ((d.bk||d.td) ? '<tr><td style="padding:2.5mm 10px;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px">Bank / Date</td>' +
    '<td style="padding:2.5mm 10px;border-bottom:1px solid #eee;font-size:14px;color:#222">' + esc(d.bk) + (d.bk&&d.td?' / ':'') + esc(d.td) + '</td></tr>' : '') +
    '<tr><td style="padding:2.5mm 10px;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px">Purpose</td>' +
    '<td style="padding:2.5mm 10px;border-bottom:1px solid #eee;font-size:14px;color:#222">' + esc(d.bg||'\u2014') + '</td></tr>' +
    '</table>' +
    (c.seal || d.rv || d.sg ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:5mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:120px;max-height:120px;object-fit:contain"></div>' : '<div></div>') +
    '<div style="text-align:center">' +
    '<div style="border-bottom:2px solid #ccc;height:26px;margin-bottom:3px;max-width:150px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-size:12px;font-weight:600;color:#222">' + esc(d.rv||'______________') + '</div>' +
    '<div style="font-size:9px;color:#888;margin-top:1px">Receiver</div>' +
    (c.signature ? '<div style="margin-top:5px"><img src="' + esc(c.signature) + '" style="max-width:90px;max-height:32px;object-fit:contain"><div style="font-size:9px;color:#888;margin-top:1px">Authorized Signature</div></div>' : '') +
    '</div></div>' : '') +
    '</div>' +
    '<div style="padding:2.5mm 16mm;border-top:1px solid #eee;display:flex;justify-content:space-between;font-size:10px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.bankName ? '<div style="padding:0 16mm 1.5mm;text-align:center;font-size:8px;color:#bbb">' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') + '</div>' : '') +
    '</div>';
};
