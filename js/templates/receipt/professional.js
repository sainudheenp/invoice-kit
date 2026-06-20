/* ==========================================================
   RECEIPT TEMPLATE: PROFESSIONAL — color-block, structured
   ========================================================== */
window._REC_TEMPLATES.professional = function (d) {
  var pc = d.pc;
  var ac = d.ac;
  var c = d.comp;

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;line-height:1.7;min-height:100vh;padding:0;font-kerning:normal">' +
    '<div style="background:' + pc + ';padding:10mm 14mm 7mm">' +
    '<div style="display:flex;align-items:center;gap:12px">' +
    (c.logo ? '<div style="flex-shrink:0;background:#fff;border-radius:6px;padding:4px"><img src="' + esc(c.logo) + '" style="max-width:42px;max-height:42px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:22px;font-weight:800;color:#fff">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:1px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px">' +
    [c.loc, c.tel, c.email].filter(Boolean).join(' \u00b7 ') +
    '</div></div>' +
    '<div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:5px 12px;text-align:center">' +
    '<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.7)">Receipt</div>' +
    '<div style="font-size:15px;font-weight:800;color:#fff">#' + esc(d.no) + '</div>' +
    '</div></div></div>' +
    '<div style="padding:5mm 14mm 0">' +
    '<div style="display:flex;gap:4mm;margin-bottom:3mm">' +
    '<div style="flex:1;border:1px solid #e8e8e8;border-radius:6px;padding:8px 12px">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + ac + ';margin-bottom:2px">Received From</div>' +
    '<div style="font-size:15px;font-weight:600;color:#111">' + esc(d.rf||'\u2014') + '</div>' +
    '</div>' +
    '<div style="flex:0 0 150px;border:1px solid #e8e8e8;border-radius:6px;padding:8px 12px;text-align:right">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + ac + ';margin-bottom:2px">Date</div>' +
    '<div style="font-size:14px;font-weight:600;color:#111">' + d.dt + '</div>' +
    '</div></div>' +
    '<div style="border:2px solid ' + pc + ';border-radius:8px;padding:10px 14px;margin-bottom:3mm">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:' + ac + ';margin-bottom:3px">Amount</div>' +
    '<div style="font-size:13px;color:#666;font-style:italic">' + esc(d.ww) + '</div>' +
    '<div style="font-size:26px;font-weight:800;color:' + pc + ';margin-top:3px">' + d.amFmt + ' ' + d.cur.symbol + '</div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;margin-bottom:3mm;border:1px solid #e8e8e8;border-radius:6px;overflow:hidden">' +
    '<tr style="background:#fafafa"><td style="padding:2.5mm 10px;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px;width:25%;border-bottom:1px solid #eee">Payment</td>' +
    '<td style="padding:2.5mm 10px;font-size:14px;color:#222;border-bottom:1px solid #eee">' + esc(d.pm) + d.chqHtml + '</td></tr>' +
    ((d.bk||d.td) ? '<tr><td style="padding:2.5mm 10px;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px;border-bottom:1px solid #eee">Bank / Date</td>' +
    '<td style="padding:2.5mm 10px;font-size:14px;color:#222;border-bottom:1px solid #eee">' + esc(d.bk) + (d.bk&&d.td?' / ':'') + esc(d.td) + '</td></tr>' : '') +
    '<tr style="background:#fafafa"><td style="padding:2.5mm 10px;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px">Purpose</td>' +
    '<td style="padding:2.5mm 10px;font-size:13px;color:#222">' + esc(d.bg||'\u2014') + '</td></tr>' +
    '</table>' +
    (c.seal || d.rv || d.sg ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:110px;max-height:110px;object-fit:contain"></div>' : '<div></div>') +
    '<div style="text-align:center">' +
    '<div style="border-bottom:2px solid ' + ac + ';height:22px;margin-bottom:2px;max-width:140px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-size:12px;font-weight:600;color:#111">' + esc(d.rv||'______________') + '</div>' +
    '<div style="font-size:10px;color:' + ac + ';margin-top:1px">Receiver</div>' +
    (c.signature ? '<div style="margin-top:4px"><img src="' + esc(c.signature) + '" style="max-width:80px;max-height:30px;object-fit:contain"><div style="font-size:10px;color:' + ac + '">Authorized Signature</div></div>' : '') +
    '</div></div>' : '') +
    '</div>' +
    '<div style="border-top:3px solid ' + pc + ';padding:2.5mm 14mm;display:flex;justify-content:space-between;font-size:10px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.bankName ? '<div style="padding:0 14mm 1.5mm;text-align:center;font-size:9px;color:#bbb">' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') + '</div>' : '') +
    '</div>';
};
