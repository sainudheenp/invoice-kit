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
      '<td style="text-align:center;padding:5px 4px;color:#777">' + (i+1) + '</td>' +
      '<td style="padding:5px 4px">' + esc(it.desc) + '</td>' +
      '<td style="text-align:center;padding:5px 4px;color:#555">' + it.qty + '</td>' +
      '<td style="text-align:right;padding:5px 4px">' + parseFloat(it.price).toFixed(3) + '</td>' +
      '<td style="text-align:right;padding:5px 4px;font-weight:600">' + it.amount + '</td></tr>';
  });
  if (!ih) ih = '<tr><td colspan="5" style="text-align:center;color:#bbb;padding:20px;font-size:11px">No items</td></tr>';

  var pd = pm;
  if (pm === 'Cheque' && ch) pd += ' No.' + ch;
  if (bk) pd += ' - ' + bk;

  var pc = c.pcolor || '#D97706';

  var contactInfo = [c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email && 'Email: ' + c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' | ');

  return '<div style="width:210mm;min-height:297mm;padding:10mm 12mm;font-family:Arial,sans-serif;font-size:10px;color:#333;position:relative;background:#fff;line-height:1.5">' +

    /* top accent bar */
    '<div style="height:4px;background:' + pc + ';margin:-10mm -12mm 8mm -12mm"></div>' +

    /* header: logo + company info side by side */
    '<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:6mm">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:80px;max-height:80px;object-fit:contain"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:18px;font-weight:800;color:' + pc + ';letter-spacing:-.3px;margin-bottom:2px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:10px;color:#777;margin-bottom:4px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:8.5px;color:#999;line-height:1.6">' + [c.loc, contactInfo].filter(Boolean).join('<br>') + '</div></div>' +
    '<div style="flex-shrink:0;text-align:right;max-width:50%">' +
    '<div style="font-size:18px;font-weight:800;color:' + pc + ';letter-spacing:-.3px;margin-bottom:2px">' + esc(c.nameAr) + '</div>' +
    (c.subAr ? '<div style="font-size:10px;color:#777;margin-bottom:4px">' + esc(c.subAr) + '</div>' : '') +
    '<div style="font-size:8.5px;color:#999;line-height:1.6;direction:rtl">' + [c.loc, 'هاتف : ' + c.tel, 'جوال : ' + c.mob, 'البريد : ' + c.email].filter(function(s){return s.replace(/^[^:]+:\s*/,'') !== '' && s !== c.loc}).join('<br>') + '</div></div></div>' +

    /* thin separator */
    '<div style="height:1px;background:#eee;margin:0 0 5mm 0"></div>' +

    /* title row: TAX INVOICE + invoice details */
    '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4mm">' +
    '<div><div style="font-size:20px;font-weight:800;color:' + pc + ';letter-spacing:1px">TAX INVOICE</div>' +
    '<div style="font-size:12px;color:' + pc + ';margin-top:1px">فاتورة ضريبية</div></div>' +
    '<div style="text-align:right;font-size:10px;color:#666;line-height:1.8">' +
    '<div><strong style="color:#333">Invoice No:</strong> ' + no + '</div>' +
    '<div><strong style="color:#333">Date:</strong> ' + dts + '</div>' +
    (c.vatReg ? '<div><strong style="color:#333">VAT Reg:</strong> ' + c.vatReg + '</div>' : '') +
    '</div></div>' +

    /* bill-to card */
    '<div style="border:1px solid #eee;border-left:3px solid ' + pc + ';border-radius:3px;padding:3mm 4mm;margin-bottom:4mm">' +
    '<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:3px">Bill To / إلى السيد</div>' +
    '<div style="font-weight:700;font-size:12px;color:#222;margin-bottom:2px">' + (cust||'---') + '</div>' +
    '<div style="font-size:9px;color:#666">' + [addr, ph && 'Tel: ' + ph, cr_ && 'C.R.: ' + cr_, em].filter(Boolean).join(' | ') + '</div></div>' +

    /* items table */
    '<table style="width:100%;border-collapse:collapse;margin-bottom:4mm;font-size:9.5px">' +
    '<thead><tr style="border-bottom:2px solid ' + pc + '">' +
    '<th style="padding:4px 4px;text-align:center;color:#888;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:.3px;width:28px">#</th>' +
    '<th style="padding:4px 4px;text-align:left;color:#888;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:.3px">Description / البيان</th>' +
    '<th style="padding:4px 4px;text-align:center;color:#888;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:.3px;width:40px">Qty / الكمية</th>' +
    '<th style="padding:4px 4px;text-align:right;color:#888;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:.3px;width:65px">Price / السعر</th>' +
    '<th style="padding:4px 4px;text-align:right;color:#888;font-weight:600;font-size:8px;text-transform:uppercase;letter-spacing:.3px;width:70px">Amount / المبلغ</th>' +
    '</tr></thead><tbody>' + ih +
    '<tr style="border-top:1px solid #eee"><td colspan="4" style="padding:5px 4px;text-align:right;font-weight:600;font-size:9px;color:#555">Subtotal</td>' +
    '<td style="padding:5px 4px;text-align:right;font-weight:600;font-size:9px">' + sub.toFixed(3) + '</td></tr>' +
    (disc>0 ? '<tr><td colspan="4" style="padding:3px 4px;text-align:right;font-weight:500;font-size:9px;color:#e53e3e">Discount</td>' +
    '<td style="padding:3px 4px;text-align:right;font-weight:500;font-size:9px;color:#e53e3e">-' + disc.toFixed(3) + '</td></tr>' : '') +
    (vp>0 ? '<tr><td colspan="4" style="padding:3px 4px;text-align:right;font-weight:500;font-size:9px;color:#555">VAT (' + vp + '%)</td>' +
    '<td style="padding:3px 4px;text-align:right;font-weight:500;font-size:9px">' + va.toFixed(3) + '</td></tr>' : '') +
    '<tr style="border-top:2px solid ' + pc + '"><td colspan="4" style="padding:5px 4px;text-align:right;font-weight:800;font-size:11px;color:' + pc + '">Grand Total / الإجمالي</td>' +
    '<td style="padding:5px 4px;text-align:right;font-weight:800;font-size:11px;color:' + pc + '">' + grand.toFixed(3) + ' ' + cur.symbol + '</td></tr>' +
    '</tbody></table>' +

    /* amount in words */
    '<div style="font-size:9px;color:#888;font-style:italic;margin-bottom:4mm;text-align:right">' + esc(gw) + '</div>' +

    /* details row: payment + notes */
    '<div style="display:flex;gap:4mm;margin-bottom:4mm">' +
    '<div style="flex:1;border:1px solid #eee;border-radius:3px;padding:2.5mm 3mm">' +
    '<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:2px">Payment / طريقة الدفع</div>' +
    '<div style="font-size:9.5px;color:#444">' + esc(pd) + '</div></div>' +
    (notes ? '<div style="flex:1;border:1px solid #eee;border-radius:3px;padding:2.5mm 3mm">' +
    '<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:2px">Notes / ملاحظات</div>' +
    '<div style="font-size:9.5px;color:#444">' + esc(notes) + '</div></div>' : '') +
    (c.invTerms && !notes ? '<div style="flex:1;border:1px solid #eee;border-radius:3px;padding:2.5mm 3mm">' +
    '<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:2px">Terms / الشروط</div>' +
    '<div style="font-size:9.5px;color:#444">' + esc(c.invTerms) + '</div></div>' : '') +
    '</div>' +

    /* terms standalone if notes already took the spot */
    (c.invTerms && notes ? '<div style="border:1px solid #eee;border-radius:3px;padding:2.5mm 3mm;margin-bottom:4mm">' +
    '<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:2px">Terms / الشروط</div>' +
    '<div style="font-size:9.5px;color:#444">' + esc(c.invTerms) + '</div></div>' : '') +

    /* seal + signature */
    (c.seal || c.signature ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-top:6mm;margin-bottom:6mm">' +
    (c.seal ? '<div><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:85px;max-height:85px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:110px;max-height:45px;object-fit:contain"><div style="font-size:8px;color:#999;margin-top:2px">Authorized Signature / التوقيع</div></div>' : '<div></div>') +
    '</div>' : '') +

    /* footer */
    '<div style="position:absolute;bottom:6mm;left:12mm;right:12mm;border-top:1px solid #ddd;padding-top:2.5mm;display:flex;justify-content:space-between;font-size:7.5px;color:#aaa">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email && 'Email: ' + c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.invFooter ? '<div style="position:absolute;bottom:2.5mm;left:12mm;right:12mm;text-align:center;font-size:7.5px;color:#bbb">' + esc(c.invFooter) + '</div>' : '') +
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
