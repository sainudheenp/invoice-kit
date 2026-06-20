/* ==========================================================
   RECEIPT TEMPLATE: BOLD — dark header, high contrast
   ========================================================== */
window._REC_TEMPLATES.bold = function (d) {
  var pc = d.pc;
  var c = d.comp;

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;position:relative;background:#fff;line-height:1.7;min-height:100vh;padding:0;font-kerning:normal">' +
    '<div style="background:#1a1a2e;padding:10mm 14mm 8mm;color:#fff">' +
    '<div style="display:flex;align-items:center;gap:12px">' +
    (c.logo ? '<div style="flex-shrink:0;background:#fff;border-radius:4px;padding:3px"><img src="' + esc(c.logo) + '" style="max-width:40px;max-height:40px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:22px;font-weight:800;color:#fff">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:12px;color:#aaa;margin-top:1px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    '<div style="text-align:right">' +
    '<div style="font-size:10px;color:' + pc + ';text-transform:uppercase;letter-spacing:2px;font-weight:700">RECEIPT</div>' +
    '<div style="font-size:18px;font-weight:800;color:#fff;margin-top:1px">#' + esc(d.no) + '</div>' +
    '</div></div>' +
    '<div style="display:flex;gap:16px;margin-top:4mm;font-size:10px;color:#aaa;border-top:1px solid rgba(255,255,255,0.1);padding-top:3mm">' +
    '<div>' + [c.loc, c.tel && 'Tel: ' + c.tel].filter(Boolean).join(' | ') + '</div>' +
    '<div style="margin-left:auto">' + d.dt + '</div>' +
    '</div></div>' +
    '<div style="padding:6mm 14mm 0">' +
    '<div style="margin-bottom:3mm;border-bottom:2px solid #1a1a2e;padding-bottom:3mm">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999">Received From</div>' +
    '<div style="font-size:18px;font-weight:700;color:#1a1a2e;margin-top:2px">' + esc(d.rf||'\u2014') + '</div>' +
    '</div>' +
    '<div style="background:#f5f5f5;padding:10px 14px;border-radius:6px;margin-bottom:3mm">' +
    '<div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">Amount</div>' +
    '<div style="font-size:15px;color:#555;font-style:italic">' + esc(d.ww) + '</div>' +
    '<div style="font-size:28px;font-weight:800;color:#1a1a2e;margin-top:4px">' + d.amFmt + ' ' + d.cur.symbol + '</div>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:3mm">' +
    '<tr><td style="padding:3mm 0;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:#999;text-transform:uppercase;width:25%">Payment</td>' +
    '<td style="padding:3mm 0;border-bottom:1px solid #eee;font-size:14px;color:#222">' + esc(d.pm) + d.chqHtml + '</td></tr>' +
    ((d.bk||d.td) ? '<tr><td style="padding:3mm 0;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:#999;text-transform:uppercase">Bank / Date</td>' +
    '<td style="padding:3mm 0;border-bottom:1px solid #eee;font-size:14px;color:#222">' + esc(d.bk) + (d.bk&&d.td?' / ':'') + esc(d.td) + '</td></tr>' : '') +
    '<tr><td style="padding:3mm 0;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:#999;text-transform:uppercase">Purpose</td>' +
    '<td style="padding:3mm 0;border-bottom:1px solid #eee;font-size:14px;color:#222">' + esc(d.bg||'\u2014') + '</td></tr>' +
    '</table>' +
    (c.seal || d.rv || d.sg ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:120px;max-height:120px;object-fit:contain"></div>' : '<div></div>') +
    '<div style="text-align:center">' +
    '<div style="border-bottom:2px solid #1a1a2e;height:24px;margin-bottom:3px;max-width:140px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-size:12px;font-weight:700;color:#1a1a2e">' + esc(d.rv||'______________') + '</div>' +
    '<div style="font-size:9px;color:#888">Receiver</div>' +
    (c.signature ? '<div style="margin-top:5px"><img src="' + esc(c.signature) + '" style="max-width:80px;max-height:30px;object-fit:contain"><div style="font-size:9px;color:#888">Authorized Signature</div></div>' : '') +
    '</div></div>' : '') +
    '</div>' +
    '<div style="margin-top:4mm;background:#1a1a2e;padding:2.5mm 14mm;display:flex;justify-content:space-between;font-size:9px;color:#888">' +
    '<div>' + esc(c.name) + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    '</div>';
};
