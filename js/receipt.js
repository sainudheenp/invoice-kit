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

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#333;position:relative;background:#fff;line-height:1.5;min-height:100vh;padding:5mm 5mm 0">' +

    /* ——— BORDER FRAME ——— */
    '<div style="position:absolute;top:2mm;left:2mm;right:2mm;bottom:8mm;border:1.5px solid #333;border-radius:2px"></div>' +

    /* ——— HEADER ——— */
    '<div style="text-align:center;margin-bottom:2mm;padding:0 5mm">' +
    (c.logo ? '<div style="margin-bottom:1mm"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:45px;max-height:45px;object-fit:contain;display:inline-block"></div>' : '') +
    '<div style="font-size:16px;font-weight:800;color:#222;letter-spacing:.5px">' + esc(c.name) + '</div>' +
    (c.nameAr ? '<div style="font-size:13px;font-weight:700;color:#555;direction:rtl;margin-top:1px">' + esc(c.nameAr) + '</div>' : '') +
    (c.sub ? '<div style="font-size:9px;color:#888;margin-top:1px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:8px;color:' + ac + ';margin-top:2px">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' +

    /* ——— TITLE ——— */
    '<div style="text-align:center;margin:1mm 0 2mm">' +
    '<div style="font-size:15px;font-weight:800;color:' + pc + ';letter-spacing:2px;text-transform:uppercase">RECEIPT VOUCHER</div>' +
    '<div style="font-size:9px;color:#999;margin-top:1px">سند قبض</div>' +
    '</div>' +

    /* ——— METADATA ROW ——— */
    '<div style="display:flex;justify-content:space-between;border-top:1px solid #333;border-bottom:1px solid #333;padding:1.5mm 3mm;margin-bottom:3mm;font-size:10px">' +
    '<div><span style="color:' + ac + '">Receipt No.</span> <strong>' + no + '</strong></div>' +
    '<div><span style="color:' + ac + '">Date / التاريخ</span> <strong>' + dts + '</strong></div>' +
    '</div>' +

    /* ——— FORM FIELDS ——— */
    '<table style="width:100%;border-collapse:collapse;margin-bottom:3mm">' +
    '<tr><td style="width:30%;padding:2mm 3mm;font-size:10px;color:' + ac + ';font-weight:600;vertical-align:top;border-bottom:1px solid #e5e5e5">Received from</td><td style="width:70%;padding:2mm 3mm;font-size:11px;color:#222;border-bottom:1px solid #e5e5e5">' + esc(rf||'—') + '</td></tr>' +
    '<tr><td style="width:30%;padding:2mm 3mm;font-size:10px;color:' + ac + ';font-weight:600;vertical-align:top;border-bottom:1px solid #e5e5e5">Amount in Words</td><td style="width:70%;padding:2mm 3mm;font-size:11px;color:#222;font-weight:600;border-bottom:1px solid #e5e5e5">' + esc(ww) + '</td></tr>' +
    '<tr><td style="width:30%;padding:2mm 3mm;font-size:10px;color:' + ac + ';font-weight:600;vertical-align:top;border-bottom:1px solid #e5e5e5">Payment Method</td><td style="width:70%;padding:2mm 3mm;font-size:11px;color:#222;border-bottom:1px solid #e5e5e5">' + esc(pm) + (pm==='Cheque'&&ch?' / '+esc(ch):'') + '</td></tr>' +
    ((bk||td) ? '<tr><td style="width:30%;padding:2mm 3mm;font-size:10px;color:' + ac + ';font-weight:600;vertical-align:top;border-bottom:1px solid #e5e5e5">Bank / Date</td><td style="width:70%;padding:2mm 3mm;font-size:11px;color:#222;border-bottom:1px solid #e5e5e5">' + esc(bk) + (bk&&td?' / ':'') + esc(td) + '</td></tr>' : '') +
    '<tr><td style="width:30%;padding:2mm 3mm;font-size:10px;color:' + ac + ';font-weight:600;vertical-align:top;border-bottom:1px solid #e5e5e5">Being / بيان</td><td style="width:70%;padding:2mm 3mm;font-size:11px;color:#222;border-bottom:1px solid #e5e5e5">' + esc(bg||'—') + '</td></tr>' +
    '</table>' +

    /* ——— AMOUNT BOXES ——— */
    '<div style="display:flex;justify-content:flex-end;gap:10px;margin-bottom:3mm;padding-right:3mm">' +
    '<div style="text-align:center"><div style="font-size:8px;color:#888;margin-bottom:1px">' + cur.symbol + ' ' + cur.name + ' / ' + cur.namePl + '</div><div style="border:1.5px solid ' + pc + ';padding:4px 16px;font-size:18px;font-weight:700;color:#222;min-width:55px;text-align:center">' + wi + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:8px;color:#888;margin-bottom:1px">' + cur.sub + ' / ' + cur.subPl + '</div><div style="border:1.5px solid ' + pc + ';padding:4px 16px;font-size:18px;font-weight:700;color:#222;min-width:55px;text-align:center">' + String(fr).padStart(String(cur.subPer).length,'0') + '</div></div>' +
    '</div>' +

    /* ——— SIGNATURES ——— */
    '<div style="display:flex;gap:8mm;padding:2.5mm 3mm 0;border-top:1px solid #333">' +
    '<div style="flex:1;text-align:center">' +
    '<div style="border-bottom:1px solid #999;height:22px;margin-bottom:2px;max-width:150px;margin-left:auto;margin-right:auto"></div>' +
    '<div style="font-size:10px;color:#333;font-weight:600">' + esc(rv||'______________') + '</div>' +
    '<div style="font-size:8px;color:#999;margin-top:1px">Receiver\'s Sig / توقيع المستلم</div>' +
    '</div>' +
    '<div style="flex:1;text-align:center">' +
    (c.signature ? '<div style="margin:0 auto 2px;height:22px;display:flex;align-items:center;justify-content:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:80px;max-height:22px;object-fit:contain"></div>' : '<div style="border-bottom:1px solid #999;height:22px;margin-bottom:2px;max-width:150px;margin-left:auto;margin-right:auto"></div>') +
    '<div style="font-size:10px;color:#333;font-weight:600">' + esc(sg||'______________') + '</div>' +
    '<div style="font-size:8px;color:#999;margin-top:1px">Authorized Sig / التوقيع المختص</div>' +
    '</div></div>' +

    (c.seal ? '<div style="text-align:center;margin-top:2.5mm"><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:100px;max-height:100px;object-fit:contain"></div>' : '') +

    /* ——— FOOTER ——— */
    '<div style="position:absolute;bottom:3mm;left:5mm;right:5mm;text-align:center;font-size:7px;color:' + ac + '">' +
    esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + (c.tel ? ' | Tel: ' + c.tel : '') + (c.email ? ' | ' + c.email : '') +
    (c.bankName ? '<br>' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') : '') +
    '</div>' +
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
