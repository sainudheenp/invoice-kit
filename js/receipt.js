/* ==========================================================
   RECEIPT VOUCHER ENGINE
   ========================================================== */
function calcRecWords() {
  var c = getCo(); if (!c) return;
  var a = parseFloat(document.getElementById('recAmount').value) || 0;
  document.getElementById('recWords').value = num2words(a, c.currency) + ' only';
  document.getElementById('sumRecAmt').textContent = a.toFixed(3);
  document.getElementById('sumRecTotal').textContent = a.toFixed(3);
  if (c) document.getElementById('sumRecWords').textContent = num2words(a, c.currency) + ' only';
}

function toggleRecFields() {
  var pm = document.getElementById('recPayMethod').value;
  document.getElementById('recChequeField').classList.toggle('show', pm === 'Cheque');
  document.getElementById('recBankField').classList.toggle('show',  pm === 'Cheque' || pm === 'Bank Transfer');
  document.getElementById('recTransDateField').classList.toggle('show', pm === 'Cheque' || pm === 'Bank Transfer');
}

function refreshRec() {
  var c = getCo(); if (!c) return;
  var d = document.getElementById('recDate');
  if (!d.value) {
    var t = new Date();
    d.value = t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + '-' + String(t.getDate()).padStart(2,'0');
  }
  document.getElementById('recNo').value   = c.recPref + c.recNext;
  document.getElementById('recBeing').value = c.recBeing || '';
  calcRecWords();
}

function _buildRecHTML(savedRec, comp) {
  var c = comp || getCo(); if (!c) return '';
  var cur = c.currency;
  var no, dt, rf, am, ww, pm, ch, bk, td, bg, rv, sg, dts;
  if (savedRec) {
    no = savedRec.recNo;
    dt = savedRec.date;
    rf = savedRec.receivedFrom;
    am = savedRec.amount || 0;
    ww = savedRec.amountWords || (num2words(am, cur) + ' only');
    pm = savedRec.payMethod || 'Cash';
    ch = savedRec.chequeNo || '';
    bk = savedRec.bankName || '';
    td = savedRec.transDate || '';
    bg = savedRec.being || '';
    rv = savedRec.receiver || '';
    sg = savedRec.signatory || '';
    dts = dt || new Date().toISOString().slice(0,10);
  } else {
    var $ = function (id) { return document.getElementById(id); };
    no = $('recNo').value; dt = $('recDate').value;
    rf = $('recFrom').value; am = parseFloat($('recAmount').value) || 0;
    ww = num2words(am, c.currency) + ' only';
    pm = $('recPayMethod').value; ch = ($('recChequeNo') || {}).value || '';
    bk = ($('recBankName') || {}).value || ''; td = ($('recTransDate') || {}).value || '';
    bg = $('recBeing').value; rv = $('recReceiver').value; sg = $('recSignatory').value;
    dts = dt || new Date().toISOString().slice(0, 10);
  }
  var pc = c.pcolor || '#D97706';
  var ac = c.acolor || '#78716C';
  var wi = Math.floor(am);
  var fr = Math.round((am - wi) * cur.subPer);

  var chqHtml = '';
  if (pm === 'Cheque' && ch) chqHtml = ' / ' + esc(ch);

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;position:relative;background:#fff;line-height:1.5;min-height:100vh;padding:7mm 8mm 0">' +

    /* ——— TOP ACCENT BAR ——— */
    '<div style="position:absolute;top:0;left:0;right:0;height:4px;background:' + pc + '"></div>' +

    /* ——— HEADER ——— */
    '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:4mm">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:55px;max-height:55px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1;min-width:0">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
    '<div>' +
    '<div style="font-size:22px;font-weight:800;letter-spacing:-.3px;color:#222;margin-bottom:1px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:13px;font-style:italic;color:#888;margin-bottom:1.5px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    (c.nameAr ? '<div style="text-align:right"><div style="font-size:22px;font-weight:800;letter-spacing:-.3px;color:#222;margin-bottom:1px">' + esc(c.nameAr) + '</div>' +
    (c.subAr ? '<div style="font-size:11px;color:#888;margin-bottom:1.5px;direction:rtl">' + esc(c.subAr) + '</div>' : '') +
    '</div>' : '') +
    '</div>' +
    '<div style="font-size:10px;color:' + ac + ';line-height:1.6">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' +
    '</div>' +

    '<div style="border-bottom:1px solid #ddd;margin-bottom:3mm"></div>' +

    /* ——— TITLE + METADATA ——— */
    '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:3mm">' +
    '<div><div style="font-size:20px;font-weight:800;color:' + pc + ';letter-spacing:.3px">RECEIPT VOUCHER</div><div style="font-size:11px;color:#999;margin-top:1px">سند قبض</div></div>' +
    '<div style="text-align:right;font-size:11px;color:' + ac + ';line-height:1.8">' +
    '<span style="color:#999">Receipt No.</span> <strong style="color:#333">' + no + '</strong><br>' +
    '<span style="color:#999">Date / التاريخ</span> <strong style="color:#333">' + dts + '</strong>' +
    '</div></div>' +

    '<div style="border-bottom:1px solid #eee;margin-bottom:3mm"></div>' +

    /* ——— FORM FIELDS ——— */
    '<table style="width:100%;border-collapse:collapse">' +
    '<tr><td style="width:30%;padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px">Received from</td>' +
    '<td style="width:40%;padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:600">' + esc(rf||'—') + '</td>' +
    '<td style="width:30%;padding:2.5mm 2mm;border-bottom:1px solid #eee;text-align:right;direction:rtl;font-size:11px;color:#999">استلمت من</td></tr>' +
    '<tr><td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px">Amount</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:13px;color:#333;font-weight:700">' + esc(ww) + '</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;text-align:right;direction:rtl;font-size:11px;color:#999">بمبلغ قدره</td></tr>' +
    '<tr><td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px">Payment</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:13px;color:#333">' + esc(pm) + chqHtml + '</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;text-align:right;direction:rtl;font-size:11px;color:#999">نقد / شيك</td></tr>' +
    ((bk||td) ? '<tr><td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px">Bank / Date</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:13px;color:#333">' + esc(bk) + (bk&&td?' / ':'') + esc(td) + '</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;text-align:right;direction:rtl;font-size:11px;color:#999">البنك / تاريخه</td></tr>' : '') +
    '<tr><td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:11px;font-weight:700;color:' + ac + ';text-transform:uppercase;letter-spacing:.3px">Being / بيان</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;font-size:13px;color:#333">' + esc(bg||'—') + '</td>' +
    '<td style="padding:2.5mm 2mm;border-bottom:1px solid #eee;text-align:right;direction:rtl;font-size:11px;color:#999">بيان</td></tr>' +
    '</table>' +

    /* ——— AMOUNT BOXES ——— */
    '<div style="display:flex;justify-content:flex-end;gap:10px;margin:3mm 0">' +
    '<div style="text-align:center"><div style="font-size:9px;color:#999;margin-bottom:1px;text-transform:uppercase">' + cur.symbol + ' ' + cur.name + '</div><div style="border-bottom:2.5px solid ' + pc + ';padding:3px 14px;font-size:20px;font-weight:700;color:#222;min-width:55px;text-align:center">' + wi + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:9px;color:#999;margin-bottom:1px;text-transform:uppercase">' + cur.sub + '</div><div style="border-bottom:2.5px solid ' + pc + ';padding:3px 14px;font-size:20px;font-weight:700;color:#222;min-width:55px;text-align:center">' + String(fr).padStart(String(cur.subPer).length,'0') + '</div></div>' +
    '</div>' +

    /* ——— SEAL & SIGNATURE ——— */
    (c.seal || rv || sg ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    (c.seal ? '<div><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:130px;max-height:130px;object-fit:contain"></div>' : '<div></div>') +
    '<div style="text-align:center">' +
    '<div style="border-bottom:1px solid #bbb;height:26px;margin-bottom:2px;max-width:160px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-size:12px;font-weight:700;color:#222">' + esc(rv||'______________') + '</div>' +
    '<div style="font-size:9px;color:#999;margin-top:1px">Receiver / المستلم</div>' +
    (c.signature ? '<div style="margin-top:4px"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:10px;color:#999;margin-top:1px">Authorized Signature / التوقيع</div></div>' : '') +
    '</div></div>' : '') +

    /* ——— FOOTER ——— */
    '<div style="position:absolute;bottom:5mm;left:8mm;right:8mm;border-top:1px solid #ddd;padding-top:2mm;display:flex;justify-content:space-between;font-size:10px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.bankName ? '<div style="position:absolute;bottom:1.5mm;left:8mm;right:8mm;text-align:center;font-size:9px;color:#bbb">' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') + '</div>' : '') +
    '</div>';
}

function printReceipt() {
  var d = document.getElementById('receiptPrintArea');
  d.innerHTML = _buildRecHTML();
  d.style.display = 'block';
  document.body.classList.add('print-receipt');
  document.body.classList.remove('print-invoice');
  setTimeout(function () {
    window.print();
    document.body.classList.remove('print-receipt');
    d.style.display = 'none'; d.innerHTML = '';
  }, 300);
}

function saveReceipt() {
  var c = getCo(); if (!c) { alert('No active company'); return; }
  var rec = {
    id: uid(), companyId: c.id,
    recNo:        document.getElementById('recNo').value,
    date:         document.getElementById('recDate').value,
    receivedFrom: document.getElementById('recFrom').value,
    amount:       parseFloat(document.getElementById('recAmount').value) || 0,
    amountWords:  document.getElementById('recWords').value,
    payMethod:    document.getElementById('recPayMethod').value,
    chequeNo:     (document.getElementById('recChequeNo')  || {}).value || '',
    bankName:     (document.getElementById('recBankName')  || {}).value || '',
    transDate:    (document.getElementById('recTransDate') || {}).value || '',
    being:        document.getElementById('recBeing').value,
    receiver:     document.getElementById('recReceiver').value,
    signatory:    document.getElementById('recSignatory').value,
    createdAt:    Date.now()
  };
  C.receipts.push(rec);
  c.recNext = (parseInt(c.recNext) || 1) + 1;
  persist('receipts', rec);
  persist('companies', c);
  refreshRec();
  alert('Receipt #' + rec.recNo + ' saved. Next: ' + c.recPref + c.recNext);
}
