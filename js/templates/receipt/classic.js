/* ==========================================================
   RECEIPT TEMPLATE: CLASSIC (current design)
   ========================================================== */
window._REC_TEMPLATES.classic = function (d) {
  var pc = d.pc;
  var ac = d.ac;
  var c = d.comp;

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2d2d2d;position:relative;background:#fff;line-height:1.8;min-height:100vh;padding:8mm 10mm 0;-webkit-font-smoothing:antialiased;font-kerning:normal;word-spacing:normal">' +
    '<div style="position:absolute;top:0;left:0;right:0;height:4px;background:' + pc + '"></div>' +
    '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:4mm">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + esc(c.logo) + '" style="max-width:55px;max-height:55px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1;min-width:0">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
    '<div>' +
    '<div style="font-size:22px;font-weight:800;letter-spacing:-.3px;color:#222;margin-bottom:1px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:13px;font-style:italic;color:#888;margin-bottom:1.5px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    (c.nameAr ? '<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:22px;font-weight:800;color:#222;margin-bottom:1px">' + esc(c.nameAr) + '</div>' +
    (c.subAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:11px;color:#888;margin-bottom:1.5px">' + esc(c.subAr) + '</div>' : '') +
    '</div>' : '') +
    '</div>' +
    '<div style="font-size:10px;color:' + ac + ';line-height:1.6">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div></div>' +
    '<div style="border-bottom:1px solid #ddd;margin-bottom:3mm"></div>' +
    '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:3mm">' +
    '<div><div style="font-size:20px;font-weight:800;color:' + pc + ';letter-spacing:.3px">RECEIPT VOUCHER</div><div dir="rtl" unicode-bidi="embed" style="font-size:11px;color:#999;margin-top:1px">\u0633\u0646\u062f \u0642\u0628\u0636</div></div>' +
    '<div style="text-align:right;font-size:12px;color:' + ac + ';line-height:2">' +
    '<span style="color:#777">Receipt No.</span> <strong style="color:#222">' + d.no + '</strong><br>' +
    '<span style="color:#777">Date / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u062a\u0627\u0631\u064a\u062e</span></span> <strong style="color:#222">' + d.dt + '</strong>' +
    '</div></div>' +
    '<div style="border-bottom:1px solid #eee;margin-bottom:3mm"></div>' +
    '<table style="width:100%;border-collapse:collapse">' +
    '<tr style="background:#fafafa"><td style="width:30%;padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px">Received from</td>' +
    '<td style="width:40%;padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:14px;color:#222;font-weight:600">' + esc(d.rf||'\u2014') + '</td>' +
    '<td style="width:30%;padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;text-align:right;direction:rtl;unicode-bidi:embed;font-size:12px;color:#888">\u0627\u0633\u062a\u0644\u0645\u062a \u0645\u0646</td></tr>' +
    '<tr><td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px">Amount</td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:14px;color:#222;font-weight:700">' + esc(d.ww) + '</td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;text-align:right;direction:rtl;unicode-bidi:embed;font-size:12px;color:#888">\u0628\u0645\u0628\u0644\u063a \u0642\u062f\u0631\u0647</td></tr>' +
    '<tr style="background:#fafafa"><td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px">Payment</td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:14px;color:#222">' + esc(d.pm) + d.chqHtml + '</td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;text-align:right;direction:rtl;unicode-bidi:embed;font-size:12px;color:#888">\u0646\u0642\u062f / \u0634\u064a\u0643</td></tr>' +
    ((d.bk||d.td) ? '<tr><td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px">Bank / Date</td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:14px;color:#222">' + esc(d.bk) + (d.bk&&d.td?' / ':'') + esc(d.td) + '</td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;text-align:right;direction:rtl;unicode-bidi:embed;font-size:12px;color:#888">\u0627\u0644\u0628\u0646\u0643 / \u062a\u0627\u0631\u064a\u062e\u0647</td></tr>' : '') +
    '<tr style="background:#fafafa"><td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.1px">Being / <span dir="rtl" unicode-bidi="embed">\u0628\u064a\u0627\u0646</span></td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;font-size:14px;color:#222">' + esc(d.bg||'\u2014') + '</td>' +
    '<td style="padding:3mm 2.5mm;border-bottom:1px solid #e8e8e8;text-align:right;direction:rtl;unicode-bidi:embed;font-size:12px;color:#888">\u0628\u064a\u0627\u0646</td></tr>' +
    '</table>' +
    '<div style="display:flex;justify-content:flex-end;gap:14px;margin:4mm 0">' +
    '<div style="text-align:center"><div style="font-size:9px;color:#888;margin-bottom:2px;text-transform:uppercase;letter-spacing:.3px">' + d.cur.symbol + ' ' + d.cur.name + '</div><div style="border-bottom:3px solid ' + pc + ';padding:4px 18px;font-size:22px;font-weight:800;color:#111;min-width:60px;text-align:center">' + d.wi + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:9px;color:#888;margin-bottom:2px;text-transform:uppercase;letter-spacing:.3px">' + d.cur.sub + '</div><div style="border-bottom:3px solid ' + pc + ';padding:4px 18px;font-size:22px;font-weight:800;color:#111;min-width:60px;text-align:center">' + String(d.fr).padStart(String(d.cur.subPer).length,'0') + '</div></div>' +
    '</div>' +
    (c.seal || d.rv || d.sg ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:5mm">' +
    (c.seal ? '<div><img src="' + esc(c.seal) + '" style="max-width:130px;max-height:130px;object-fit:contain"></div>' : '<div></div>') +
    '<div style="text-align:center">' +
    '<div style="border-bottom:2px solid #999;height:28px;margin-bottom:3px;max-width:160px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-size:12px;font-weight:700;color:#222">' + esc(d.rv||'______________') + '</div>' +
    '<div style="font-size:10px;color:#888;margin-top:1px">Receiver / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u0645\u0633\u062a\u0644\u0645</span></div>' +
    (c.signature ? '<div style="margin-top:6px"><img src="' + esc(c.signature) + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:10px;color:#888;margin-top:1px">Authorized Signature / <span dir="rtl" unicode-bidi="embed">\u0627\u0644\u062a\u0648\u0642\u064a\u0639</span></div></div>' : '') +
    '</div></div>' : '') +
    '<div style="position:absolute;bottom:5mm;left:10mm;right:10mm;border-top:1.5px solid #ddd;padding-top:3mm;display:flex;justify-content:space-between;font-size:10px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.bankName ? '<div style="position:absolute;bottom:1.5mm;left:8mm;right:8mm;text-align:center;font-size:9px;color:#bbb">' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') + '</div>' : '') +
    '</div>';
};
