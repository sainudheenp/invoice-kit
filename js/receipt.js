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

  return '<div style="width:148mm;min-height:210mm;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#333;position:relative;background:#fff;line-height:1.5">' +

    /* ——— LETTERHEAD ——— */
    '<div style="background:' + pc + ';padding:6mm 8mm 5mm;color:#fff">' +
    '<div style="display:flex;align-items:flex-start;gap:8px">' +
    (c.logo ? '<div style="flex-shrink:0;background:#fff;border-radius:3px;padding:2px"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:42px;max-height:42px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:15px;font-weight:800;letter-spacing:-.2px;margin-bottom:1px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:8px;opacity:.85;margin-bottom:2px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:7px;opacity:.7;line-height:1.5">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' +
    (c.nameAr ? '<div style="flex-shrink:0;text-align:right;max-width:40%"><div style="font-size:15px;font-weight:800;letter-spacing:-.2px;margin-bottom:1px">' + esc(c.nameAr) + '</div>' +
    '<div style="font-size:7px;opacity:.7;line-height:1.5;direction:rtl">' +
    [c.loc, c.tel && 'هاتف: ' + c.tel, c.email && 'بريد: ' + c.email].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' : '') +
    '</div></div>' +

    /* ——— TITLE BAR ——— */
    '<div style="background:#fafafa;border-bottom:1px solid #eee;padding:3mm 8mm;display:flex;align-items:center;justify-content:space-between">' +
    '<div><div style="font-size:14px;font-weight:800;color:' + pc + ';letter-spacing:.2px">RECEIPT VOUCHER</div><div style="font-size:8px;color:#999;margin-top:1px">سند قبض</div></div>' +
    '<div style="text-align:right;font-size:9px;color:#555;line-height:1.7">' +
    '<div style="display:flex;gap:6px"><span style="color:#999;min-width:60px;text-align:left">Receipt No.</span><span style="font-weight:600;color:#333">' + no + '</span></div>' +
    '<div style="display:flex;gap:6px"><span style="color:#999;min-width:60px;text-align:left">Date / التاريخ</span><span style="font-weight:600;color:#333">' + dts + '</span></div>' +
    '</div></div>' +

    /* ——— FORM FIELDS ——— */
    '<div style="padding:4mm 8mm">' +
    '<table style="width:100%;border-collapse:collapse;font-size:9px">' +
    '<tr><td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;width:85px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px;vertical-align:top">Received from</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;color:#444;font-size:10px">' + esc(rf||'—') + '</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;text-align:right;direction:rtl;color:#aaa;font-size:8px;width:55px;vertical-align:top">استلمت من</td></tr>' +
    '<tr><td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;width:85px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px;vertical-align:top">Amount / ' + cur.symbol + '</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;color:#444;font-size:10px;font-weight:600">' + esc(ww) + '</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;text-align:right;direction:rtl;color:#aaa;font-size:8px;width:55px;vertical-align:top">بمبلغ قدره</td></tr>' +
    '<tr><td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;width:85px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px;vertical-align:top">Payment</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;color:#444;font-size:10px">' + esc(pm) + (pm==='Cheque'&&ch?' / '+esc(ch):'') + '</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;text-align:right;direction:rtl;color:#aaa;font-size:8px;width:55px;vertical-align:top">نقد / شيك</td></tr>' +
    ((bk||td) ? '<tr><td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;width:85px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px;vertical-align:top">Bank / Date</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;color:#444;font-size:10px">' + esc(bk) + (bk&&td?' / ':'') + esc(td) + '</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;text-align:right;direction:rtl;color:#aaa;font-size:8px;width:55px;vertical-align:top">البنك / تاريخه</td></tr>' : '') +
    '<tr><td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;width:85px;font-weight:600;color:#888;font-size:8px;text-transform:uppercase;letter-spacing:.3px;vertical-align:top">Being / بيان</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;color:#444;font-size:10px">' + esc(bg||'—') + '</td>' +
    '<td style="padding:3.5mm 4px;border-bottom:1px solid #f0f0f0;text-align:right;direction:rtl;color:#aaa;font-size:8px;width:55px;vertical-align:top">بيان</td></tr>' +
    '</table>' +

    /* ——— AMOUNT BOXES ——— */
    '<div style="display:flex;justify-content:flex-end;gap:8px;margin:4mm 0">' +
    '<div style="text-align:center"><div style="font-size:7px;color:#aaa;margin-bottom:2px">' + cur.symbol + ' ' + cur.name + ' / ' + cur.namePl + '</div><div style="background:' + pc + ';border-radius:4px;padding:4px 14px;font-size:16px;font-weight:800;color:#fff;text-align:center;min-width:55px">' + wi + '</div></div>' +
    '<div style="text-align:center"><div style="font-size:7px;color:#aaa;margin-bottom:2px">' + cur.sub + ' / ' + cur.subPl + '</div><div style="background:' + pc + ';border-radius:4px;padding:4px 14px;font-size:16px;font-weight:800;color:#fff;text-align:center;min-width:55px">' + String(fr).padStart(String(cur.subPer).length,'0') + '</div></div>' +
    '</div>' +

    /* ——— SIGNATURES ——— */
    '<div style="display:flex;gap:6mm;margin:3mm 0;padding-top:2mm;border-top:1px solid #eee">' +
    '<div style="flex:1;text-align:center"><div style="border-bottom:1px solid #ddd;height:24px;margin-bottom:3px"></div><div style="font-size:8px;color:#555;font-weight:600">' + esc(rv||'______________') + '</div><div style="font-size:7px;color:#aaa">Receiver\'s Sig / توقيع المستلم</div></div>' +
    '<div style="flex:1;text-align:center">' +
    (c.signature ? '<div style="margin:0 auto 3px;height:24px;display:flex;align-items:center;justify-content:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:80px;max-height:24px;object-fit:contain"></div>' : '<div style="border-bottom:1px solid #ddd;height:24px;margin-bottom:3px"></div>') +
    '<div style="font-size:8px;color:#555;font-weight:600">' + esc(sg||'______________') + '</div><div style="font-size:7px;color:#aaa">Authorized Sig / التوقيع المختص</div></div>' +
    '</div>' +
    '</div>' +

    (c.seal ? '<div style="text-align:center;margin-bottom:2mm;padding:0 8mm"><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:55px;max-height:55px;object-fit:contain"></div>' : '') +

    /* ——— FOOTER ——— */
    '<div style="position:absolute;bottom:0;left:0;right:0;background:#f5f5f5;padding:2.5mm 8mm;display:flex;justify-content:space-between;font-size:7px;color:#999">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.bankName ? '<div style="position:absolute;bottom:6mm;left:8mm;right:8mm;text-align:center;font-size:6.5px;color:#bbb">' + esc(c.bankName) + (c.bankAcc?' | A/c: '+c.bankAcc:'') + (c.bankIban?' | IBAN: '+c.bankIban:'') + '</div>' : '') +
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
