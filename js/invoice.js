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
  var pd = pm;
  if (pm === 'Cheque' && ch) pd += ' / ' + ch;
  if (bk) pd += ' — ' + bk;

  var pc = c.pcolor || '#D97706';
  var sv = sub.toFixed(3);
  var vv = va.toFixed(3);
  var dv = disc.toFixed(3);
  var gv = grand.toFixed(3);

  var ir = '';
  items.forEach(function (it, i) {
    ir += '<tr>' +
      '<td style="padding:6px 6px;text-align:center;color:#999;font-size:10px;border-bottom:1px solid #f0f0f0;width:30px">' + (i+1) + '</td>' +
      '<td style="padding:6px 6px;font-size:10px;color:#333;border-bottom:1px solid #f0f0f0">' + esc(it.desc) + '</td>' +
      '<td style="padding:6px 6px;text-align:center;font-size:10px;color:#555;border-bottom:1px solid #f0f0f0;width:45px">' + it.qty + '</td>' +
      '<td style="padding:6px 6px;text-align:right;font-size:10px;color:#555;border-bottom:1px solid #f0f0f0;width:75px">' + parseFloat(it.price).toFixed(3) + '</td>' +
      '<td style="padding:6px 6px;text-align:right;font-size:10px;font-weight:600;color:#222;border-bottom:1px solid #f0f0f0;width:80px">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr><td colspan="5" style="text-align:center;color:#ddd;padding:30px;font-size:11px;font-style:italic">No items</td></tr>';

  return '<div style="width:210mm;min-height:297mm;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#333;position:relative;background:#fff;line-height:1.5">' +

    /* ——— LETTERHEAD ——— */
    '<div style="background:' + pc + ';padding:14mm 14mm 10mm;color:#fff">' +
    '<div style="display:flex;align-items:flex-start;gap:14px">' +
    (c.logo ? '<div style="flex-shrink:0;background:#fff;border-radius:4px;padding:4px"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:65px;max-height:65px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1">' +
    '<div style="font-size:22px;font-weight:800;letter-spacing:-.3px;margin-bottom:2px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:11px;opacity:.85;margin-bottom:3px">' + esc(c.sub) + '</div>' : '') +
    '<div style="font-size:9px;opacity:.7;line-height:1.6">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' +
    (c.nameAr ? '<div style="flex-shrink:0;text-align:right;max-width:45%"><div style="font-size:22px;font-weight:800;letter-spacing:-.3px;margin-bottom:2px">' + esc(c.nameAr) + '</div>' +
    (c.subAr ? '<div style="font-size:11px;opacity:.85;margin-bottom:3px">' + esc(c.subAr) + '</div>' : '') +
    '<div style="font-size:9px;opacity:.7;line-height:1.6;direction:rtl">' +
    [c.loc, c.tel && 'هاتف: ' + c.tel, c.mob && 'جوال: ' + c.mob, c.email && 'بريد: ' + c.email].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' : '') +
    '</div></div>' +

    /* ——— INVOICE TITLE + METADATA BAR ——— */
    '<div style="background:#fafafa;border-bottom:1px solid #eee;padding:5mm 14mm;display:flex;align-items:center;justify-content:space-between">' +
    '<div><div style="font-size:20px;font-weight:800;color:' + pc + ';letter-spacing:.3px">TAX INVOICE</div><div style="font-size:10px;color:#999;margin-top:1px">فاتورة ضريبية</div></div>' +
    '<div style="text-align:right;font-size:10px;color:#555;line-height:1.8">' +
    '<div style="display:flex;gap:10px"><span style="color:#999;min-width:72px;text-align:left">Invoice No.</span><span style="font-weight:600;color:#333">' + no + '</span></div>' +
    '<div style="display:flex;gap:10px"><span style="color:#999;min-width:72px;text-align:left">Date</span><span style="font-weight:600;color:#333">' + dts + '</span></div>' +
    (c.vatReg ? '<div style="display:flex;gap:10px"><span style="color:#999;min-width:72px;text-align:left">VAT Reg.</span><span style="font-weight:600;color:#333">' + c.vatReg + '</span></div>' : '') +
    '</div></div>' +

    /* ——— BILL TO ——— */
    '<div style="padding:5mm 14mm 4mm">' +
    '<div style="display:flex;gap:6mm;margin-bottom:4mm">' +
    '<div style="flex:1">' +
    '<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#aaa;margin-bottom:2px">Bill To / إلى السيد</div>' +
    '<div style="font-weight:700;font-size:12px;color:#222;margin-bottom:2px">' + esc(cust||'---') + '</div>' +
    '<div style="font-size:10px;color:#777;line-height:1.6">' +
    [addr, ph && 'Tel: ' + ph, cr_ && 'C.R.: ' + cr_, em].filter(Boolean).join('<br>') +
    '</div></div>' +
    '</div>' +

    /* ——— ITEMS TABLE ——— */
    '<table style="width:100%;border-collapse:collapse;font-size:10px">' +
    '<thead><tr style="background:' + pc + ';color:#fff">' +
    '<th style="padding:7px 6px;text-align:center;font-weight:600;font-size:9px;width:30px">#</th>' +
    '<th style="padding:7px 6px;text-align:left;font-weight:600;font-size:9px">Description / البيان</th>' +
    '<th style="padding:7px 6px;text-align:center;font-weight:600;font-size:9px;width:45px">Qty / الكمية</th>' +
    '<th style="padding:7px 6px;text-align:right;font-weight:600;font-size:9px;width:75px">Price / السعر</th>' +
    '<th style="padding:7px 6px;text-align:right;font-weight:600;font-size:9px;width:80px">Amount / المبلغ</th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +

    /* ——— TOTALS ——— */
    '<div style="display:flex;justify-content:flex-end;margin:3mm 0">' +
    '<div style="min-width:160px;background:#fafafa;border-radius:4px;padding:4mm 5mm">' +
    '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:10px;color:#555"><span>Subtotal</span><span>' + sv + ' ' + cur.symbol + '</span></div>' +
    (disc>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:10px;color:#e53e3e"><span>Discount</span><span>-' + dv + ' ' + cur.symbol + '</span></div>' : '') +
    (vp>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:10px;color:#555"><span>VAT (' + vp + '%)</span><span>' + vv + ' ' + cur.symbol + '</span></div>' : '') +
    '<div style="border-top:2px solid ' + pc + ';margin:4px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:4px 0 0;font-size:14px;font-weight:800;color:' + pc + '"><span>Total</span><span>' + gv + ' ' + cur.symbol + '</span></div>' +
    '<div style="font-size:9px;color:#999;font-style:italic;margin-top:4px;text-align:right">' + esc(gw) + '</div>' +
    '</div></div>' +

    /* ——— PAYMENT / NOTES / TERMS ——— */
    '<div style="display:flex;gap:4mm;margin:2mm 0 4mm;font-size:9.5px;color:#555">' +
    '<div style="flex:1;border:1px solid #eee;border-radius:4px;padding:3mm 3.5mm"><div style="font-weight:700;color:#aaa;font-size:8px;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px">Payment / طريقة الدفع</div><div>' + esc(pd||'—') + '</div></div>' +
    (notes ? '<div style="flex:1;border:1px solid #eee;border-radius:4px;padding:3mm 3.5mm"><div style="font-weight:700;color:#aaa;font-size:8px;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px">Notes / ملاحظات</div><div>' + esc(notes) + '</div></div>' : '') +
    (c.invTerms ? '<div style="flex:1;border:1px solid #eee;border-radius:4px;padding:3mm 3.5mm"><div style="font-weight:700;color:#aaa;font-size:8px;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px">Terms / الشروط</div><div>' + esc(c.invTerms) + '</div></div>' : '') +
    '</div>' +
    '</div>' +

    /* ——— SEAL & SIGNATURE ——— */
    (c.seal || c.signature ? '<div style="padding:0 14mm;display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    (c.seal ? '<div><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:80px;max-height:80px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:110px;max-height:40px;object-fit:contain"><div style="font-size:8px;color:#aaa;margin-top:1px">Authorized Signature / التوقيع</div></div>' : '<div></div>') +
    '</div>' : '') +

    /* ——— FOOTER ——— */
    '<div style="position:absolute;bottom:0;left:0;right:0;background:#f5f5f5;padding:3mm 14mm;display:flex;justify-content:space-between;font-size:8px;color:#999">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.invFooter ? '<div style="position:absolute;bottom:8mm;left:14mm;right:14mm;text-align:center;font-size:7px;color:#bbb">' + esc(c.invFooter) + '</div>' : '') +
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
