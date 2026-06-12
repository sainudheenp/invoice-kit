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
  var pc  = c.pcolor || '#D97706';
  var wi  = Math.floor(am);
  var fr  = Math.round((am - wi) * cur.subPer);

  var pl = pm;
  if (pm === 'Cheque' && ch) pl += ' / ' + ch;
  if (bk) pl += ' / ' + bk;
  if (td && (pm === 'Cheque' || pm === 'Bank Transfer')) pl += ' / ' + td;

  return '<div style="width:210mm;min-height:297mm;padding:14mm 16mm;font-family:Arial,sans-serif;font-size:11px;color:#222;position:relative;background:#F5F0EB">' +
    /* header */
    '<div style="display:flex;align-items:flex-start;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:6px">' +
    '<div style="flex:1">' +
    '<div style="font-size:18px;font-weight:700;color:' + pc + '">' + esc(c.name) + '</div>' +
    '<div style="font-size:10px;color:#333;margin:2px 0">' + esc(c.sub) + '</div>' +
    '<div style="font-size:9px;color:#555;line-height:1.6">Tel : ' + c.tel + (c.fax?' , Fax : '+c.fax:'') + ' , Mob: ' + c.mob + '</div>' +
    '<div style="font-size:9px;color:#555">C.R. : ' + c.cr + ', P.O.Box: ' + c.pobox + ', ' + esc(c.loc) + '</div></div>' +
    (c.logo ? '<div style="flex-shrink:0;padding:0 10px"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:65px;max-height:65px;object-fit:contain"></div>' : '') +
    '<div style="flex:1;text-align:right">' +
    '<div style="font-size:18px;font-weight:700;color:' + pc + '">' + esc(c.nameAr) + '</div>' +
    '<div style="font-size:10px;color:#333;margin:2px 0">' + esc(c.subAr) + '</div>' +
    '<div style="font-size:9px;color:#555;line-height:1.6;direction:rtl">هاتف : ' + c.tel + (c.fax?' , فاكس : '+c.fax:'') + ' , جوال: ' + c.mob + '</div>' +
    '<div style="font-size:9px;color:#555;direction:rtl">س.ت : ' + c.cr + ' , ص.ب: ' + c.pobox + ', ' + esc(c.loc) + '</div></div></div>' +

    /* email row */
    '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:9px;color:#555">' +
    '<div>Email: ' + c.email + (c.website?' | Web: '+c.website:'') + '</div>' +
    '<div style="direction:rtl">البريد : ' + c.email + '</div></div>' +

    /* title */
    '<div style="display:flex;align-items:center;justify-content:space-between;margin:10px 0 14px">' +
    '<div style="font-size:17px;font-weight:700;color:#333;text-decoration:underline;text-underline-offset:4px">RECEIPT VOUCHER</div>' +
    '<div style="font-size:17px;font-weight:700;color:#333;direction:rtl;text-decoration:underline;text-underline-offset:4px">سند قبض</div></div>' +

    /* no + date */
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;font-size:13px;font-weight:700;color:#222">' +
    '<div style="display:flex;align-items:center;gap:10px"><span style="border:2px solid #222;padding:3px 12px;font-size:14px">No. ' + no + '</span></div>' +
    '<div style="display:flex;align-items:center;gap:8px"><span>Date / التاريخ</span><span style="border-bottom:1px dotted #555;min-width:130px;display:inline-block;padding:0 6px 2px;text-align:center">' + dts + '</span></div></div>' +

    /* fields */
    '<div style="margin:7px 0;display:flex;align-items:baseline"><span style="font-weight:700;min-width:220px;font-size:12px">Received from</span><span style="flex:1;border-bottom:1px dotted #555;min-height:20px;padding:0 8px;font-size:12px">' + esc(rf) + '</span><span style="font-weight:700;min-width:100px;font-size:12px;text-align:right;direction:rtl">استلمت من</span></div>' +

    '<div style="margin:8px 0;display:flex;align-items:baseline"><span style="font-weight:700;min-width:220px;font-size:12px">The sum of ' + cur.symbol + '</span><span style="flex:1;border-bottom:1px dotted #555;min-height:20px;padding:0 8px;font-weight:700;font-size:11px">' + esc(ww) + '</span><span style="font-weight:700;min-width:100px;font-size:12px;text-align:right;direction:rtl">بمبلغ قدره</span></div>' +

    '<div style="margin:8px 0;display:flex;align-items:baseline"><span style="font-weight:700;min-width:220px;font-size:12px">By Cash/Cheque No.</span><span style="flex:1;border-bottom:1px dotted #555;min-height:20px;padding:0 8px">' + esc(pl) + '</span><span style="font-weight:700;min-width:100px;font-size:12px;text-align:right;direction:rtl">نقد / شيك رقم</span></div>' +

    '<div style="margin:8px 0;display:flex;align-items:baseline"><span style="font-weight:700;min-width:220px;font-size:12px">Dated / Bank</span><span style="flex:1;border-bottom:1px dotted #555;min-height:20px;padding:0 8px">' + esc(td||'') + (td&&bk?' - ':'') + esc(bk) + '</span><span style="font-weight:700;min-width:100px;font-size:12px;text-align:right;direction:rtl">البنك / تاريخه</span></div>' +

    '<div style="margin:8px 0;display:flex;align-items:baseline"><span style="font-weight:700;min-width:220px;font-size:12px">Being</span><span style="flex:1;border-bottom:1px dotted #555;min-height:20px;padding:0 8px">' + esc(bg) + '</span><span style="font-weight:700;min-width:100px;font-size:12px;text-align:right;direction:rtl">بيان</span></div>' +

    /* amount boxes */
    '<div style="display:flex;justify-content:flex-end;margin:16px 0;gap:16px;align-items:center">' +
    '<div style="text-align:center"><div style="font-size:10px;color:#555">رقم / Number</div><div style="border:2px solid #222;padding:6px 16px;font-size:18px;font-weight:700;min-width:70px;text-align:center">' + wi + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:10px;color:#555">عشر / ' + cur.sub + '</div><div style="border:2px solid #222;padding:6px 16px;font-size:18px;font-weight:700;min-width:70px;text-align:center">' + String(fr).padStart(String(cur.subPer).length,'0') + '</div></div></div>' +

    /* signatures */
    '<div style="display:flex;justify-content:space-between;margin-top:36px;padding-top:8px;border-top:1px solid #333">' +
    '<div style="text-align:center;min-width:180px">' +
    '<div style="border-bottom:1px solid #333;width:170px;margin:30px auto 4px"></div>' +
    '<div style="font-size:11px;color:#333;font-weight:700">' + esc(rv||'______________') + '</div>' +
    '<div style="font-size:10px;color:#555">Receiver\'s Sig / توقيع المستلم</div></div>' +
    '<div style="text-align:center;min-width:180px">' +
    (c.signature ? '<div style="margin:10px auto 4px"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:120px;max-height:40px;object-fit:contain"></div>' : '<div style="border-bottom:1px solid #333;width:170px;margin:30px auto 4px"></div>') +
    '<div style="font-size:11px;color:#333;font-weight:700">' + esc(sg||'______________') + '</div>' +
    '<div style="font-size:10px;color:#555">Authorized Sig / التوقيع المختص</div></div></div>' +

    (c.seal ? '<div style="text-align:center;margin-top:10px"><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:80px;max-height:80px;object-fit:contain"></div>' : '') +

    /* footer */
    '<div style="margin-top:12px;font-size:9px;color:#555;text-align:center;border-top:1px solid #999;padding-top:6px">' +
    esc(c.name) + ' | Tel: ' + c.tel + ' | Email: ' + c.email + ' | ' + esc(c.loc) +
    (c.bankName ? '<br>Bank: ' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') : '') +
    '</div></div>';
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
