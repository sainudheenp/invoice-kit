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

  return '<div style="width:148mm;min-height:210mm;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#333;position:relative;background:#fff;line-height:1.5;padding:6mm 7mm 0">' +

    /* ——— TOP ACCENT BAR ——— */
    '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:' + pc + '"></div>' +

    /* ——— HEADER ——— */
    '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:3.5mm">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:42px;max-height:42px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:18px;font-weight:800;letter-spacing:-.2px;color:#222;margin-bottom:1px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:10px;color:#888;margin-bottom:1px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:8px;color:' + ac + ';line-height:1.6">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' +
    (c.nameAr ? '<div style="flex-shrink:0;text-align:right;max-width:40%"><div style="font-size:18px;font-weight:800;letter-spacing:-.2px;color:#222;margin-bottom:1px">' + esc(c.nameAr) + '</div>' +
    '<div style="font-size:8px;color:' + ac + ';line-height:1.6;direction:rtl">' +
    [c.loc, c.tel && 'هاتف: ' + c.tel, c.email && 'بريد: ' + c.email].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' : '') +
    '</div>' +

    '<div style="border-bottom:1px solid #ddd;margin-bottom:2.5mm"></div>' +

    /* ——— TITLE + METADATA ——— */
    '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:2.5mm">' +
    '<div><div style="font-size:17px;font-weight:800;color:' + pc + ';letter-spacing:.2px">RECEIPT VOUCHER</div><div style="font-size:10px;color:#999;margin-top:1px">سند قبض</div></div>' +
    '<div style="text-align:right;font-size:10px;color:' + ac + ';line-height:1.7">' +
    '<span style="color:#999">Receipt No.</span> <strong style="color:#333">' + no + '</strong><br>' +
    '<span style="color:#999">Date / التاريخ</span> <strong style="color:#333">' + dts + '</strong>' +
    '</div></div>' +

    '<div style="border-bottom:1px solid #eee;margin-bottom:2.5mm"></div>' +

    /* ——— FORM FIELDS ——— */
    '<div style="margin-bottom:3mm">' +
    '<div style="display:flex;padding:3px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:85px;font-weight:600;color:' + ac + ';font-size:10px;text-transform:uppercase;letter-spacing:.3px">Received from</span><span style="flex:1;color:#444;font-size:11px">' + esc(rf||'—') + '</span><span style="min-width:55px;text-align:right;direction:rtl;color:#aaa;font-size:10px">استلمت من</span></div>' +
    '<div style="display:flex;padding:3px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:85px;font-weight:600;color:' + ac + ';font-size:10px;text-transform:uppercase;letter-spacing:.3px">Amount / ' + cur.symbol + '</span><span style="flex:1;color:#444;font-size:11px;font-weight:600">' + esc(ww) + '</span><span style="min-width:55px;text-align:right;direction:rtl;color:#aaa;font-size:10px">بمبلغ قدره</span></div>' +
    '<div style="display:flex;padding:3px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:85px;font-weight:600;color:' + ac + ';font-size:10px;text-transform:uppercase;letter-spacing:.3px">Payment</span><span style="flex:1;color:#444;font-size:11px">' + esc(pm) + (pm==='Cheque'&&ch?' / '+esc(ch):'') + '</span><span style="min-width:55px;text-align:right;direction:rtl;color:#aaa;font-size:10px">نقد / شيك</span></div>' +
    ((bk||td) ? '<div style="display:flex;padding:3px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:85px;font-weight:600;color:' + ac + ';font-size:10px;text-transform:uppercase;letter-spacing:.3px">Bank / Date</span><span style="flex:1;color:#444;font-size:11px">' + esc(bk) + (bk&&td?' / ':'') + esc(td) + '</span><span style="min-width:55px;text-align:right;direction:rtl;color:#aaa;font-size:10px">البنك / تاريخه</span></div>' : '') +
    '<div style="display:flex;padding:3px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:85px;font-weight:600;color:' + ac + ';font-size:10px;text-transform:uppercase;letter-spacing:.3px">Being / بيان</span><span style="flex:1;color:#444;font-size:11px">' + esc(bg||'—') + '</span><span style="min-width:55px;text-align:right;direction:rtl;color:#aaa;font-size:10px">بيان</span></div>' +
    '</div>' +

    /* ——— AMOUNT BOXES ——— */
    '<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:2.5mm">' +
    '<div style="text-align:center"><div style="font-size:8px;color:#999;margin-bottom:1px">' + cur.symbol + ' ' + cur.name + ' / ' + cur.namePl + '</div><div style="border-bottom:2px solid ' + ac + ';padding:2px 12px;font-size:17px;font-weight:700;color:#222;min-width:50px">' + wi + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:8px;color:#999;margin-bottom:1px">' + cur.sub + ' / ' + cur.subPl + '</div><div style="border-bottom:2px solid ' + ac + ';padding:2px 12px;font-size:17px;font-weight:700;color:#222;min-width:50px">' + String(fr).padStart(String(cur.subPer).length,'0') + '</div></div>' +
    '</div>' +

    /* ——— SIGNATURES ——— */
    '<div style="display:flex;gap:6mm;margin-bottom:3mm;padding-top:2mm;border-top:1px solid #eee">' +
    '<div style="flex:1;text-align:center"><div style="border-bottom:1px solid #ddd;height:24px;margin-bottom:3px"></div><div style="font-size:10px;color:#555;font-weight:600">' + esc(rv||'______________') + '</div><div style="font-size:8px;color:#aaa">Receiver\'s Sig / توقيع المستلم</div></div>' +
    '<div style="flex:1;text-align:center">' +
    (c.signature ? '<div style="margin:0 auto 3px;height:24px;display:flex;align-items:center;justify-content:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:80px;max-height:24px;object-fit:contain"></div>' : '<div style="border-bottom:1px solid #ddd;height:24px;margin-bottom:3px"></div>') +
    '<div style="font-size:10px;color:#555;font-weight:600">' + esc(sg||'______________') + '</div><div style="font-size:8px;color:#aaa">Authorized Sig / التوقيع المختص</div></div>' +
    '</div>' +

    (c.seal ? '<div style="text-align:center;margin-bottom:2mm"><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:110px;max-height:110px;object-fit:contain"></div>' : '') +

    /* ——— FOOTER ——— */
    '<div style="position:absolute;bottom:4mm;left:7mm;right:7mm;border-top:1px solid #ddd;padding-top:1.5mm;display:flex;justify-content:space-between;font-size:8px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.bankName ? '<div style="position:absolute;bottom:1.5mm;left:7mm;right:7mm;text-align:center;font-size:8px;color:#bbb">' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') + '</div>' : '') +
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
