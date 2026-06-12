/* ==========================================================
   INVOICE ENGINE
   ========================================================== */
var _invRC = 0;

function addInvRow() {
  var tb = document.getElementById('invItems');
  var tr = document.createElement('tr');
  var i = _invRC++;
  tr.innerHTML =
    '<td style="text-align:center;padding-top:8px">' + (i + 1) + '</td>' +
    '<td><input class="_iDesc" placeholder="Description" oninput="calcInv()" style="min-width:80px"></td>' +
    '<td><input class="_iQty" type="number" min="1" value="1" style="width:55px" oninput="calcInv()"></td>' +
    '<td><input class="_iPrc" type="number" min="0" step="0.001" value="0" style="width:85px" oninput="calcInv()"></td>' +
    '<td class="amt-cell _iAmt" style="padding-top:8px">0.000</td>';
  tb.appendChild(tr);
  calcInv();
}

function removeInvRow() {
  var tb = document.getElementById('invItems');
  if (tb.children.length) { tb.removeChild(tb.lastChild); _invRC--; calcInv(); }
}

function calcInv() {
  var rows = document.querySelectorAll('#invItems tr');
  var sub = 0;
  rows.forEach(function (r) {
    var q = parseFloat(r.querySelector('._iQty').value) || 0;
    var p = parseFloat(r.querySelector('._iPrc').value) || 0;
    var a = q * p;
    r.querySelector('._iAmt').textContent = a.toFixed(3);
    sub += a;
  });
  var vp  = parseFloat(document.getElementById('invVatPct').value) || 0;
  var disc= parseFloat(document.getElementById('invDiscount').value) || 0;
  var ad  = sub - disc;
  var va  = ad * vp / 100;
  var grand = ad + va;
  document.getElementById('invSubtotal').value = sub.toFixed(3);
  document.getElementById('invVatAmt').value    = va.toFixed(3);
  document.getElementById('invGrand').value     = grand.toFixed(3);
  var c = getCo();
  if (c) document.getElementById('invWords').value = num2words(grand, c.currency) + ' only';

  document.getElementById('sumSubtotal').textContent = sub.toFixed(3);
  document.getElementById('sumVat').textContent = va.toFixed(3);
  document.getElementById('sumGrand').textContent = grand.toFixed(3);
  var discRow = document.getElementById('sumDiscRow');
  if (disc > 0) { discRow.style.display = 'flex'; document.getElementById('sumDiscount').textContent = '-' + disc.toFixed(3); }
  else discRow.style.display = 'none';
  if (c) document.getElementById('sumWords').textContent = num2words(grand, c.currency) + ' only';
}

function refreshInv() {
  var c = getCo(); if (!c) return;
  var d = document.getElementById('invDate');
  if (!d.value) {
    var t = new Date();
    d.value = t.getFullYear() + '-' + String(t.getMonth()+1).padStart(2,'0') + '-' + String(t.getDate()).padStart(2,'0');
  }
  document.getElementById('invNo').value    = c.invPref + c.invNext;
  document.getElementById('invVatPct').value = c.vatPct || 0;
  document.getElementById('invNotes').value  = c.invNotes || '';
  calcInv();
}

function toggleInvFields() {
  var pm = document.getElementById('invPayMethod').value;
  document.getElementById('invChequeField').classList.toggle('show', pm === 'Cheque');
  document.getElementById('invBankField').classList.toggle('show',  pm === 'Cheque' || pm === 'Bank Transfer');
}

function _buildInvHTML(savedInv, comp) {
  var c = comp || getCo(); if (!c) return '';
  var cur = c.currency;
  var no, dt, cust, addr, ph, cr_, em, notes, pm, ch, bk, disc, dts;
  var items, sub, vp, va, grand;

  if (savedInv) {
    no    = savedInv.invNo;
    dt    = savedInv.date;
    cust  = savedInv.customer.name;
    addr  = savedInv.customer.address;
    ph    = savedInv.customer.phone;
    cr_   = savedInv.customer.cr;
    em    = savedInv.customer.email;
    notes = savedInv.notes || '';
    pm    = savedInv.payMethod || 'Cash';
    ch    = savedInv.payDetails || '';
    bk    = savedInv.bankName || '';
    disc  = savedInv.discount || 0;
    sub   = savedInv.subtotal || 0;
    vp    = savedInv.vatPct || 0;
    va    = savedInv.vatAmt || 0;
    grand = savedInv.grand || 0;
    items = savedInv.items || [];
    dts   = dt || new Date().toISOString().slice(0,10);
  } else {
    var $ = function (id) { return document.getElementById(id); };
    no    = $('invNo').value;
    dt    = $('invDate').value;
    cust  = $('custName').value;
    addr  = $('custAddr').value;
    ph    = $('custPhone').value;
    cr_   = $('custCr').value;
    em    = $('custEmail').value;
    notes = $('invNotes').value;
    pm    = $('invPayMethod').value;
    ch    = ($('invChequeNo')  || {}).value || '';
    bk    = ($('invBankName')  || {}).value || '';
    disc  = parseFloat($('invDiscount').value) || 0;
    sub   = parseFloat($('invSubtotal').value) || 0;
    vp    = parseFloat($('invVatPct').value)   || 0;
    va    = parseFloat($('invVatAmt').value)   || 0;
    grand = parseFloat($('invGrand').value)    || 0;
    dts   = dt || new Date().toISOString().slice(0,10);
    items = [];
    document.querySelectorAll('#invItems tr').forEach(function (r) {
      items.push({
        desc: (r.querySelector('._iDesc') || {}).value || '',
        qty:  (r.querySelector('._iQty')  || {}).value || '0',
        price:(r.querySelector('._iPrc')  || {}).value || '0',
        amount:(r.querySelector('._iAmt') || {}).textContent || '0.000'
      });
    });
  }

  var gw = num2words(grand, cur) + ' only';
  var ih = '';
  items.forEach(function (it, i) {
    ih += '<tr>' +
      '<td style="text-align:center;padding:6px 4px">' + (i+1) + '</td>' +
      '<td style="padding:6px 4px">' + esc(it.desc) + '</td>' +
      '<td style="text-align:center;padding:6px 4px">' + it.qty + '</td>' +
      '<td style="text-align:right;padding:6px 4px">' + parseFloat(it.price).toFixed(3) + '</td>' +
      '<td style="text-align:right;padding:6px 4px;font-weight:700">' + it.amount + '</td></tr>';
  });
  if (!ih) ih = '<tr><td colspan="5" style="text-align:center;color:#999;padding:16px">No items</td></tr>';

  var pd = pm;
  if (pm === 'Cheque' && ch) pd += ' No.' + ch;
  if (bk) pd += ' - ' + bk;

  var pc = c.pcolor || '#1b4d3d';
  var ac = c.acolor || '#f5c842';

  return '<div style="width:210mm;min-height:297mm;padding:12mm 14mm;font-family:Arial,sans-serif;font-size:11px;color:#222;position:relative;background:#fff">' +
    /* header */
    '<div style="display:flex;align-items:flex-start;border-bottom:3px solid ' + pc + ';padding-bottom:10px;margin-bottom:8px">' +
    (c.logo ? '<div style="flex-shrink:0;margin-right:12px"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:70px;max-height:70px;object-fit:contain"></div>' : '') +
    '<div style="flex:1"><div style="font-size:20px;font-weight:700;color:' + pc + '">' + esc(c.name) + '</div>' +
    '<div style="font-size:10px;color:#444;margin:2px 0">' + esc(c.sub) + '</div>' +
    '<div style="font-size:9px;color:#666;line-height:1.5">Tel: ' + c.tel + (c.fax?' | Fax: '+c.fax:'') + ' | Mob: ' + c.mob + '<br>C.R.: ' + c.cr + ' | P.O.Box: ' + c.pobox + ' | ' + esc(c.loc) + '<br>Email: ' + c.email + (c.website?' | Web: '+c.website:'') + '</div></div>' +
    '<div style="flex:1;text-align:right"><div style="font-size:19px;font-weight:700;color:' + pc + '">' + esc(c.nameAr) + '</div>' +
    '<div style="font-size:10px;color:#444;margin:2px 0">' + esc(c.subAr) + '</div>' +
    '<div style="font-size:9px;color:#666;line-height:1.5;direction:rtl">هاتف : ' + c.tel + (c.fax?' | فاكس : '+c.fax:'') + ' | جوال : ' + c.mob + '<br>س.ت : ' + c.cr + ' | ص.ب : ' + c.pobox + ' | ' + esc(c.loc) + '<br>البريد : ' + c.email + '</div></div>' +
    '</div>' +

    /* title */
    '<div style="text-align:center;margin:14px 0"><div style="font-size:22px;font-weight:700;color:' + pc + ';letter-spacing:2px">TAX INVOICE</div><div style="font-size:15px;color:' + pc + ';margin-top:3px">فاتورة ضريبية</div></div>' +

    /* info boxes */
    '<div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">' +
    '<div style="border:2px solid ' + pc + ';padding:5px 10px;border-radius:4px;font-size:11px"><strong style="color:' + pc + '">Invoice No:</strong> ' + no + '</div>' +
    '<div style="border:2px solid ' + pc + ';padding:5px 10px;border-radius:4px;font-size:11px"><strong style="color:' + pc + '">Date:</strong> ' + dts + '</div>' +
    (c.vatReg ? '<div style="border:2px solid ' + pc + ';padding:5px 10px;border-radius:4px;font-size:11px"><strong style="color:' + pc + '">VAT Reg:</strong> ' + c.vatReg + '</div>' : '') +
    '</div>' +

    /* bill-to */
    '<div style="margin:10px 0;padding:8px 10px;background:#f5faf5;border-left:4px solid ' + pc + ';border-radius:3px">' +
    '<div style="font-size:11px;font-weight:700;color:' + pc + ';margin-bottom:3px">Bill To / إلى السيد</div>' +
    '<div style="font-weight:700;font-size:13px">' + (cust||'---') + '</div>' +
    '<div style="font-size:10px;color:#555">' + (addr||'') + (addr&&ph?' | ':'') + (ph?'Tel: '+ph:'') + (cr_?((addr||ph)?' | ':'')+'C.R.: '+cr_:'') + (em?((addr||ph||cr_)?' | ':'')+em:'') + '</div></div>' +

    /* items table */
    '<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:10px"><thead><tr>' +
    '<th style="background:' + pc + ';color:#fff;padding:7px 5px;border:1px solid ' + pc + '">#</th>' +
    '<th style="background:' + pc + ';color:#fff;padding:7px 5px;border:1px solid ' + pc + '">Description / البيان</th>' +
    '<th style="background:' + pc + ';color:#fff;padding:7px 5px;border:1px solid ' + pc + '">Qty / الكمية</th>' +
    '<th style="background:' + pc + ';color:#fff;padding:7px 5px;border:1px solid ' + pc + ';text-align:right">Price / السعر</th>' +
    '<th style="background:' + pc + ';color:#fff;padding:7px 5px;border:1px solid ' + pc + ';text-align:right">Amount / المبلغ</th>' +
    '</tr></thead><tbody>' + ih + '</tbody></table>' +

    /* totals */
    '<div style="text-align:right;margin:10px 0;padding:8px 12px;background:#f5faf5;border-radius:4px">' +
    '<div style="font-size:12px;margin:3px 0">Subtotal: <strong>' + sub.toFixed(3) + '</strong> ' + cur.symbol + '</div>' +
    (disc>0 ? '<div style="font-size:12px;margin:3px 0">Discount: <strong>-' + disc.toFixed(3) + '</strong> ' + cur.symbol + '</div>' : '') +
    '<div style="font-size:12px;margin:3px 0">VAT (' + vp + '%): <strong>' + va.toFixed(3) + '</strong> ' + cur.symbol + '</div>' +
    '<div style="font-size:16px;font-weight:700;color:' + pc + ';border-top:2px solid ' + pc + ';padding-top:4px;margin-top:4px">Grand Total: <strong>' + grand.toFixed(3) + '</strong> ' + cur.symbol + '</div>' +
    '<div style="font-size:10px;color:#555;margin-top:4px;font-style:italic">' + esc(gw) + '</div></div>' +

    /* notes + payment */
    '<div style="margin:8px 0;padding:8px;background:#fff8e1;border-left:4px solid ' + ac + ';border-radius:3px;font-size:10px">' +
    '<strong style="color:' + pc + '">Notes / ملاحظات:</strong> ' + esc(notes||'---') + '<br>' +
    '<strong style="color:' + pc + '">Payment / طريقة الدفع:</strong> ' + pd + '</div>' +

    (c.invTerms ? '<div style="margin:6px 0;padding:6px 8px;font-size:9px;color:#555;border:1px solid #ddd;border-radius:3px"><strong>Terms / الشروط:</strong> ' + esc(c.invTerms) + '</div>' : '') +

    /* seal + signature */
    '<div style="display:flex;justify-content:space-between;align-items:end;margin-top:20px">' +
    (c.seal ? '<div><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:90px;max-height:90px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:120px;max-height:50px;object-fit:contain"><div style="font-size:9px;color:#555;margin-top:2px">Authorized Signature / التوقيع</div></div>' : '<div></div>') +
    '</div>' +

    /* footer */
    '<div style="position:absolute;bottom:12mm;left:14mm;right:14mm;border-top:2px solid ' + pc + ';padding-top:5px;display:flex;justify-content:space-between;font-size:8px;color:#666">' +
    '<div>' + esc(c.name) + ' | ' + esc(c.loc) + '</div>' +
    '<div>Tel: ' + c.tel + ' | Mob: ' + c.mob + ' | Email: ' + c.email + '</div>' +
    '<div style="text-align:right">' + esc(c.nameAr) + '</div></div>' +
    (c.invFooter ? '<div style="position:absolute;bottom:6mm;left:14mm;right:14mm;text-align:center;font-size:8px;color:#888">' + esc(c.invFooter) + '</div>' : '') +
    '</div>';
}

function printInvoice() {
  var d = document.getElementById('invoicePrintArea');
  d.innerHTML = _buildInvHTML();
  d.style.display = 'block';
  document.body.classList.add('print-invoice');
  document.body.classList.remove('print-receipt');
  setTimeout(function () {
    window.print();
    document.body.classList.remove('print-invoice');
    d.style.display = 'none'; d.innerHTML = '';
  }, 300);
}

function saveInvoice() {
  var c = getCo(); if (!c) { alert('No active company'); return; }
  var no = document.getElementById('invNo').value;
  var rows = document.querySelectorAll('#invItems tr');
  var items = [];
  rows.forEach(function (r) {
    items.push({
      desc:   (r.querySelector('._iDesc') || {}).value || '',
      qty:    parseFloat((r.querySelector('._iQty') || {}).value) || 0,
      price:  parseFloat((r.querySelector('._iPrc') || {}).value) || 0,
      amount: parseFloat((r.querySelector('._iAmt') || {}).textContent) || 0
    });
  });
  var inv = {
    id: uid(), companyId: c.id, invNo: no,
    date: document.getElementById('invDate').value,
    customer: {
      name:    document.getElementById('custName').value,
      address: document.getElementById('custAddr').value,
      phone:   document.getElementById('custPhone').value,
      cr:      document.getElementById('custCr').value,
      email:   document.getElementById('custEmail').value
    },
    items: items,
    subtotal:  parseFloat(document.getElementById('invSubtotal').value) || 0,
    vatPct:    parseFloat(document.getElementById('invVatPct').value)   || 0,
    vatAmt:    parseFloat(document.getElementById('invVatAmt').value)  || 0,
    discount:  parseFloat(document.getElementById('invDiscount').value) || 0,
    grand:     parseFloat(document.getElementById('invGrand').value)    || 0,
    notes:     document.getElementById('invNotes').value,
    payMethod: document.getElementById('invPayMethod').value,
    payDetails:(document.getElementById('invChequeNo') || {}).value || '',
    bankName:  (document.getElementById('invBankName') || {}).value || '',
    createdAt: Date.now()
  };
  C.invoices.push(inv);
  c.invNext = (parseInt(c.invNext) || 1) + 1;
  persist('invoices', inv);
  persist('companies', c);
  refreshInv();
  alert('Invoice #' + no + ' saved. Next: ' + c.invPref + c.invNext);
}
