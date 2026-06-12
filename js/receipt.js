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
  var wi = Math.floor(am);
  var fr = Math.round((am - wi) * cur.subPer);

  return '<div style="width:148mm;min-height:210mm;padding:6mm 7mm;font-family:Arial,sans-serif;font-size:9px;color:#333;position:relative;background:#fff;line-height:1.5">' +

    /* top accent bar */
    '<div style="height:3px;background:' + pc + ';margin:-6mm -7mm 4mm -7mm"></div>' +

    /* ——— HEADER ——— */
    '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:3.5mm">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:50px;max-height:50px;object-fit:contain"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:13px;font-weight:800;color:' + pc + ';letter-spacing:-.2px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:8px;color:#888;margin:1px 0 2px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:7px;color:#aaa;line-height:1.6">' +
    (c.loc ? esc(c.loc) + (c.tel||c.email||c.cr?' | ':'') : '') +
    [c.tel && 'Tel: ' + c.tel, c.email && 'Email: ' + c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' | ') +
    '</div></div>' +
    (c.nameAr ? '<div style="flex-shrink:0;text-align:right"><div style="font-size:13px;font-weight:800;color:' + pc + ';letter-spacing:-.2px">' + esc(c.nameAr) + '</div>' +
    '<div style="font-size:7px;color:#aaa;line-height:1.6;direction:rtl">' +
    [c.loc, c.tel && 'هاتف: ' + c.tel, c.email && 'بريد: ' + c.email].filter(Boolean).join('<br>') +
    '</div></div>' : '') +
    '</div>' +

    /* ——— TITLE ——— */
    '<div style="border-top:1px solid #eee;border-bottom:1px solid #eee;padding:2mm 0;margin-bottom:3mm;display:flex;align-items:baseline;justify-content:space-between">' +
    '<div style="font-size:14px;font-weight:800;color:' + pc + ';letter-spacing:.3px">RECEIPT VOUCHER</div>' +
    '<div style="font-size:9px;color:#999;direction:rtl">سند قبض</div>' +
    '</div>' +

    /* ——— NO + DATE ——— */
    '<div style="display:flex;justify-content:space-between;margin-bottom:3mm;font-size:8.5px;color:#555">' +
    '<div><span style="color:#aaa;font-weight:600">Receipt No</span> <span style="font-weight:600;color:#333">' + no + '</span></div>' +
    '<div><span style="color:#aaa;font-weight:600">Date / التاريخ</span> <span style="font-weight:600;color:#333">' + dts + '</span></div>' +
    '</div>' +

    /* ——— FIELDS ——— */
    '<div style="margin-bottom:3mm">' +
    '<div style="display:flex;padding:2.5px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:90px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px">Received from</span><span style="flex:1;color:#444;font-size:9px">' + esc(rf||'—') + '</span><span style="min-width:60px;text-align:right;direction:rtl;color:#aaa;font-size:8px">استلمت من</span></div>' +
    '<div style="display:flex;padding:2.5px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:90px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px">Amount / ' + cur.symbol + '</span><span style="flex:1;color:#444;font-size:9px;font-weight:600">' + esc(ww) + '</span><span style="min-width:60px;text-align:right;direction:rtl;color:#aaa;font-size:8px">بمبلغ قدره</span></div>' +
    '<div style="display:flex;padding:2.5px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:90px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px">Payment</span><span style="flex:1;color:#444;font-size:9px">' + esc(pm) + (pm==='Cheque'&&ch?' / '+esc(ch):'') + '</span><span style="min-width:60px;text-align:right;direction:rtl;color:#aaa;font-size:8px">نقد / شيك</span></div>' +
    ((bk||td) ? '<div style="display:flex;padding:2.5px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:90px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px">Bank / Date</span><span style="flex:1;color:#444;font-size:9px">' + esc(bk) + (bk&&td?' / ':'') + esc(td) + '</span><span style="min-width:60px;text-align:right;direction:rtl;color:#aaa;font-size:8px">البنك / تاريخه</span></div>' : '') +
    '<div style="display:flex;padding:2.5px 0;border-bottom:1px solid #f0f0f0"><span style="min-width:90px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px">Being / بيان</span><span style="flex:1;color:#444;font-size:9px">' + esc(bg||'—') + '</span><span style="min-width:60px;text-align:right;direction:rtl;color:#aaa;font-size:8px">بيان</span></div>' +
    '</div>' +

    /* ——— AMOUNT BOXES ——— */
    '<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:3mm">' +
    '<div style="text-align:center"><div style="font-size:7px;color:#aaa;text-transform:uppercase;letter-spacing:.3px;margin-bottom:2px">' + cur.symbol + ' ' + cur.name + ' / ' + cur.namePl + '</div><div style="border:1.5px solid ' + pc + ';border-radius:3px;padding:4px 12px;font-size:15px;font-weight:800;color:' + pc + ';text-align:center;min-width:55px">' + wi + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:7px;color:#aaa;text-transform:uppercase;letter-spacing:.3px;margin-bottom:2px">' + cur.sub + ' / ' + cur.subPl + '</div><div style="border:1.5px solid ' + pc + ';border-radius:3px;padding:4px 12px;font-size:15px;font-weight:800;color:' + pc + ';text-align:center;min-width:55px">' + String(fr).padStart(String(cur.subPer).length,'0') + '</div></div>' +
    '</div>' +

    /* ——— SIGNATURES ——— */
    '<div style="display:flex;gap:6mm;margin-bottom:3mm;padding-top:2mm;border-top:1px solid #eee">' +
    '<div style="flex:1;text-align:center"><div style="border-bottom:1px solid #ddd;height:28px;margin-bottom:3px"></div><div style="font-size:8px;color:#555;font-weight:600">' + esc(rv||'______________') + '</div><div style="font-size:7px;color:#aaa">Receiver\'s Sig / توقيع المستلم</div></div>' +
    '<div style="flex:1;text-align:center">' +
    (c.signature ? '<div style="margin:0 auto 3px;height:28px;display:flex;align-items:center;justify-content:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:90px;max-height:28px;object-fit:contain"></div>' : '<div style="border-bottom:1px solid #ddd;height:28px;margin-bottom:3px"></div>') +
    '<div style="font-size:8px;color:#555;font-weight:600">' + esc(sg||'______________') + '</div><div style="font-size:7px;color:#aaa">Authorized Sig / التوقيع المختص</div></div>' +
    '</div>' +

    (c.seal ? '<div style="text-align:center;margin-bottom:2mm"><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:55px;max-height:55px;object-fit:contain"></div>' : '') +

    /* ——— FOOTER ——— */
    '<div style="position:absolute;bottom:4mm;left:7mm;right:7mm;border-top:1px solid #ddd;padding-top:1.5mm;display:flex;justify-content:space-between;font-size:6.5px;color:#bbb">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email && 'Email: ' + c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.bankName ? '<div style="position:absolute;bottom:1.5mm;left:7mm;right:7mm;text-align:center;font-size:6.5px;color:#bbb">' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') + '</div>' : '') +
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
