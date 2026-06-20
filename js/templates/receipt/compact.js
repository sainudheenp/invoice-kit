/* ==========================================================
   RECEIPT TEMPLATE: COMPACT — tight spacing, condensed
   ========================================================== */
window._REC_TEMPLATES.compact = function (d) {
  var pc = d.pc;
  var c = d.comp;

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333;position:relative;background:#fff;line-height:1.4;min-height:100vh;padding:5mm 7mm 0;font-kerning:normal">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2mm">' +
    '<div style="display:flex;align-items:center;gap:6px">' +
    (c.logo ? '<img src="' + esc(c.logo) + '" style="max-width:28px;max-height:28px;object-fit:contain">' : '') +
    '<div><div style="font-size:15px;font-weight:700;color:#222">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:9px;color:#888">' + esc(c.sub) + '</div>' : '') +
    '</div></div>' +
    '<div style="text-align:right"><div style="font-size:13px;font-weight:700;color:' + pc + '">RECEIPT #' + esc(d.no) + '</div>' +
    '<div style="font-size:9px;color:#888">' + d.dt + '</div></div>' +
    '</div>' +
    '<div style="font-size:9px;color:#888;margin-bottom:2mm;padding:2px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:3mm">' +
    '<tr><td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;width:25%">From</td>' +
    '<td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:13px;font-weight:600;color:#111">' + esc(d.rf||'\u2014') + '</td></tr>' +
    '<tr><td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:10px;font-weight:700;color:#888;text-transform:uppercase">Amount</td>' +
    '<td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:13px;font-weight:700">' + d.amFmt + ' ' + d.cur.symbol + '</td></tr>' +
    '<tr><td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:10px;font-weight:700;color:#888;text-transform:uppercase">Payment</td>' +
    '<td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:13px">' + esc(d.pm) + d.chqHtml + '</td></tr>' +
    ((d.bk||d.td) ? '<tr><td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:10px;font-weight:700;color:#888;text-transform:uppercase">Bank</td>' +
    '<td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:13px">' + esc(d.bk) + (d.bk&&d.td?' / ':'') + esc(d.td) + '</td></tr>' : '') +
    '<tr><td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:10px;font-weight:700;color:#888;text-transform:uppercase">Purpose</td>' +
    '<td style="padding:2mm;border-bottom:1px solid #e8e8e8;font-size:13px">' + esc(d.bg||'\u2014') + '</td></tr>' +
    '</table>' +
    '<div style="font-size:10px;color:#888;font-style:italic;margin-bottom:3mm;text-align:center">' + esc(d.ww) + '</div>' +
    (c.seal || d.rv || d.sg ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:90px;max-height:90px;object-fit:contain"></div>' : '<div></div>') +
    '<div style="text-align:center;font-size:11px">' +
    '<div style="border-bottom:1px solid #999;height:20px;margin-bottom:2px;max-width:120px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-weight:600;color:#222">' + esc(d.rv||'______________') + '</div>' +
    '<div style="font-size:8px;color:#888">Receiver / Signature</div>' +
    '</div></div>' : '') +
    '<div style="position:absolute;bottom:3mm;left:7mm;right:7mm;border-top:1px solid #ddd;padding-top:1mm;display:flex;justify-content:space-between;font-size:8px;color:#888">' +
    '<div>' + esc(c.name) + '</div><div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    '</div>';
};
