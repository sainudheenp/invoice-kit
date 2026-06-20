/* ==========================================================
   RECEIPT TEMPLATE: ELEGANT — serif fonts, refined
   ========================================================== */
window._REC_TEMPLATES.elegant = function (d) {
  var pc = d.pc;
  var c = d.comp;

  return '<div style="font-family:Georgia,\'Times New Roman\',Times,serif;font-size:13px;color:#3d3229;position:relative;background:#fff;line-height:1.7;min-height:100vh;padding:12mm 14mm 0;font-kerning:normal">' +
    '<div style="text-align:center;margin-bottom:3mm;color:' + pc + ';font-size:16px;letter-spacing:6px">\u2726 \u2014 \u2726 \u2014 \u2726</div>' +
    '<div style="text-align:center;margin-bottom:2mm">' +
    (c.logo ? '<img src="' + esc(c.logo) + '" style="max-width:55px;max-height:55px;object-fit:contain;margin-bottom:4px">' : '') +
    '<div style="font-size:24px;font-weight:400;color:#1a1510;letter-spacing:1px;font-variant:small-caps">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:12px;color:#8b7355;font-style:italic;margin-top:1px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    '<div style="text-align:center;font-size:10px;color:#a0907a;margin-bottom:2mm;font-style:italic">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div>' +
    '<div style="text-align:center;border-top:1px solid #e8ddd0;border-bottom:1px solid #e8ddd0;padding:2.5mm 0;margin-bottom:4mm">' +
    '<div style="font-size:16px;font-weight:700;color:' + pc + ';letter-spacing:2px;font-variant:small-caps">Receipt Voucher</div>' +
    '<div style="font-size:11px;color:#a0907a;margin-top:1px">' + esc(d.no) + ' &nbsp;\u2022&nbsp; ' + d.dt + '</div>' +
    '</div>' +
    '<div style="margin-bottom:3mm;padding:5mm 0;border-top:1px solid #e8ddd0;border-bottom:1px solid #e8ddd0">' +
    '<div style="display:flex;padding:3mm 0"><div style="width:100px;font-size:10px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Received from</div>' +
    '<div style="flex:1;font-size:15px;font-weight:600;color:#1a1510">' + esc(d.rf||'\u2014') + '</div></div>' +
    '<div style="display:flex;padding:3mm 0;border-top:1px dashed #e8ddd0"><div style="width:100px;font-size:10px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Amount</div>' +
    '<div style="flex:1;font-size:14px;color:#3d3229"><em>' + esc(d.ww) + '</em><br><strong style="font-size:18px;color:' + pc + '">' + d.amFmt + ' ' + d.cur.symbol + '</strong></div></div>' +
    '<div style="display:flex;padding:3mm 0;border-top:1px dashed #e8ddd0"><div style="width:100px;font-size:10px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Payment</div>' +
    '<div style="flex:1;font-size:13px;color:#3d3229">' + esc(d.pm) + d.chqHtml + '</div></div>' +
    ((d.bk||d.td) ? '<div style="display:flex;padding:3mm 0;border-top:1px dashed #e8ddd0"><div style="width:100px;font-size:10px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Bank</div>' +
    '<div style="flex:1;font-size:13px;color:#3d3229">' + esc(d.bk) + (d.bk&&d.td?' / ':'') + esc(d.td) + '</div></div>' : '') +
    '<div style="display:flex;padding:3mm 0;border-top:1px dashed #e8ddd0"><div style="width:100px;font-size:10px;font-weight:700;color:#8b7355;text-transform:uppercase;letter-spacing:.5px">Purpose</div>' +
    '<div style="flex:1;font-size:13px;color:#3d3229">' + esc(d.bg||'\u2014') + '</div></div>' +
    '</div>' +
    (c.seal || d.rv || d.sg ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:5mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:110px;max-height:110px;object-fit:contain"></div>' : '<div></div>') +
    '<div style="text-align:center">' +
    '<div style="border-bottom:1px solid #8b7355;height:22px;margin-bottom:2px;max-width:140px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-size:12px;font-weight:600;color:#1a1510;font-style:italic">' + esc(d.rv||'______________') + '</div>' +
    '<div style="font-size:9px;color:#8b7355;margin-top:1px;font-style:italic">Receiver</div>' +
    (c.signature ? '<div style="margin-top:5px"><img src="' + esc(c.signature) + '" style="max-width:80px;max-height:30px;object-fit:contain"><div style="font-size:9px;color:#8b7355;font-style:italic">Authorized Signature</div></div>' : '') +
    '</div></div>' : '') +
    '<div style="text-align:center;margin-top:5mm;padding-top:3mm;border-top:1px solid #e8ddd0;font-size:9px;color:#a0907a;font-style:italic">' +
    esc(c.name) + (c.loc ? ' &mdash; ' + esc(c.loc) : '') +
    '</div></div>';
};
