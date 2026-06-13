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
  var dd = document.getElementById('invDueDate');
  if (!dd.value) {
    var t2 = new Date();
    t2.setDate(t2.getDate() + 30);
    dd.value = t2.getFullYear() + '-' + String(t2.getMonth()+1).padStart(2,'0') + '-' + String(t2.getDate()).padStart(2,'0');
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

  var dueDt;
  if (savedInv) {
    no    = savedInv.invNo;
    dt    = savedInv.date;
    dueDt = savedInv.dueDate || '';
    cust  = (savedInv.customer && savedInv.customer.name) || '';
    addr  = (savedInv.customer && savedInv.customer.address) || '';
    ph    = (savedInv.customer && savedInv.customer.phone) || '';
    cr_   = (savedInv.customer && savedInv.customer.cr) || '';
    em    = (savedInv.customer && savedInv.customer.email) || '';
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
    dueDt = $('invDueDate').value;
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
  var ac = c.acolor || '#78716C';
  var sv = sub.toFixed(3);
  var vv = va.toFixed(3);
  var dv = disc.toFixed(3);
  var gv = grand.toFixed(3);

  var ir = '';
  items.forEach(function (it, i) {
    var bg = i % 2 === 0 ? '#fff' : '#f8f8f8';
    ir += '<tr style="background:' + bg + '">' +
      '<td style="padding:9px 10px;text-align:center;color:#999;font-size:13px;border-bottom:1px solid #e8e8e8;width:32px">' + (i+1) + '</td>' +
      '<td style="padding:9px 10px;font-size:13px;color:#222;border-bottom:1px solid #e8e8e8">' + esc(it.desc) + '</td>' +
      '<td style="padding:9px 10px;text-align:center;font-size:13px;color:#444;border-bottom:1px solid #e8e8e8;width:50px">' + it.qty + '</td>' +
      '<td style="padding:9px 10px;text-align:right;font-size:13px;color:#444;border-bottom:1px solid #e8e8e8;width:85px">' + (parseFloat(it.price) || 0).toFixed(3) + '</td>' +
      '<td style="padding:9px 10px;text-align:right;font-size:14px;font-weight:700;color:#111;border-bottom:1px solid #e8e8e8;width:90px">' + it.amount + '</td></tr>';
  });
  if (!ir) ir = '<tr style="background:#fafafa"><td colspan="5" style="text-align:center;color:#bbb;padding:32px;font-size:14px;font-style:italic">No items</td></tr>';

  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2d2d2d;position:relative;background:#fff;line-height:1.8;min-height:100vh;padding:14mm 15mm 0;-webkit-font-smoothing:antialiased;font-kerning:normal;word-spacing:normal">' +

    /* ——— TOP ACCENT BAR ——— */
    '<div style="position:absolute;top:0;left:0;right:0;height:4px;background:' + pc + '"></div>' +

    /* ——— HEADER ——— */
    '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:4mm">' +
    (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:55px;max-height:55px;object-fit:contain;display:block"></div>' : '') +
    '<div style="flex:1;min-width:0">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
    '<div>' +
    '<div style="font-size:26px;font-weight:800;letter-spacing:-.3px;color:#222;margin-bottom:1px">' + esc(c.name) + '</div>' +
    (c.sub ? '<div style="font-size:15px;font-style:italic;color:#888;margin-bottom:2px">' + esc(c.sub) + '</div>' : '') +
    '</div>' +
    (c.nameAr ? '<div style="text-align:right"><div dir="rtl" unicode-bidi="embed" style="font-size:26px;font-weight:800;color:#222;margin-bottom:1px">' + esc(c.nameAr) + '</div>' +
    (c.subAr ? '<div dir="rtl" unicode-bidi="embed" style="font-size:13px;color:#888;margin-bottom:2px">' + esc(c.subAr) + '</div>' : '') +
    '</div>' : '') +
    '</div>' +
    '<div style="font-size:11px;color:' + ac + ';line-height:1.6">' +
    [c.loc, c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join(' &nbsp;|&nbsp; ') +
    '</div></div>' +
    '</div>' +

    '<div style="border-bottom:1px solid #ddd;margin-bottom:4mm"></div>' +

    /* ——— INVOICE TITLE + METADATA ——— */
    '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:4mm">' +
    '<div><div style="font-size:24px;font-weight:800;color:' + pc + ';letter-spacing:.3px">TAX INVOICE</div><div dir="rtl" unicode-bidi="embed" style="font-size:12px;color:#999;margin-top:1px">فاتورة ضريبية</div></div>' +
    '<div style="text-align:right;font-size:13px;color:' + ac + ';line-height:1.9">' +
    '<span style="color:#777">Invoice No.</span> <strong style="color:#222">' + no + '</strong><br>' +
    '<span style="color:#777">Date</span> <strong style="color:#222">' + dts + '</strong>' +
    (dueDt ? '<br><span style="color:#777">Due Date</span> <strong style="color:#222">' + dueDt + '</strong>' : '') +
    (c.vatReg ? '<br><span style="color:#777">VAT Reg.</span> <strong style="color:#222">' + c.vatReg + '</strong>' : '') +
    '</div></div>' +

    '<div style="border-bottom:1px solid #eee;margin-bottom:4mm"></div>' +

    /* ——— BILL TO ——— */
    '<div style="margin-bottom:5mm">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1px;color:' + ac + ';margin-bottom:3px">Bill To / إلى السيد</div>' +
    '<div style="font-weight:700;font-size:16px;color:#111;margin-bottom:3px">' + esc(cust||'---') + '</div>' +
    '<div style="font-size:13px;color:#666;line-height:1.7">' +
    [addr, ph && 'Tel: ' + ph, cr_ && 'C.R.: ' + cr_, em].filter(Boolean).join('<br>') +
    '</div></div>' +

    /* ——— ITEMS TABLE ——— */
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:5mm">' +
    '<thead><tr style="background:#eaeaea;border-bottom:3px solid #333">' +
    '<th style="padding:10px 10px;text-align:center;font-weight:700;font-size:12.5px;color:#333;width:32px">#</th>' +
    '<th style="padding:10px 10px;text-align:left;font-weight:700;font-size:12.5px;color:#333">Description / <span dir="rtl" unicode-bidi="embed">البيان</span></th>' +
    '<th style="padding:10px 10px;text-align:center;font-weight:700;font-size:12.5px;color:#333;width:50px">Qty / <span dir="rtl" unicode-bidi="embed">الكمية</span></th>' +
    '<th style="padding:10px 10px;text-align:right;font-weight:700;font-size:12.5px;color:#333;width:85px">Price / <span dir="rtl" unicode-bidi="embed">السعر</span></th>' +
    '<th style="padding:10px 10px;text-align:right;font-weight:700;font-size:12.5px;color:#333;width:90px">Amount / <span dir="rtl" unicode-bidi="embed">المبلغ</span></th>' +
    '</tr></thead><tbody>' + ir +
    '</tbody></table>' +

    /* ——— TOTALS ——— */
    '<div style="display:flex;justify-content:flex-end;margin-bottom:4mm">' +
    '<div style="min-width:220px">' +
    '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;color:#444"><span>Subtotal</span><span style="font-weight:600">' + sv + ' ' + cur.symbol + '</span></div>' +
    (disc>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;color:#d32f2f"><span>Discount</span><span style="font-weight:600">-' + dv + ' ' + cur.symbol + '</span></div>' : '') +
    (vp>0 ? '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:14px;color:#444"><span>VAT (' + vp + '%)</span><span style="font-weight:600">' + vv + ' ' + cur.symbol + '</span></div>' : '') +
    '<div style="border-top:2px solid ' + ac + ';margin:5px 0"></div>' +
    '<div style="display:flex;justify-content:space-between;padding:5px 0 0;font-size:22px;font-weight:800;color:#111"><span>Total</span><span>' + gv + ' ' + cur.symbol + '</span></div>' +
    '<div style="font-size:12px;color:#888;font-style:italic;margin-top:4px;text-align:right">' + esc(gw) + '</div>' +
    '</div></div>' +

    /* ——— PAYMENT / NOTES / TERMS ——— */
    '<div style="margin-bottom:4mm;font-size:12px;color:#555">' +
    '<span style="font-weight:600;color:' + ac + '">Payment:</span> ' + esc(pd||'—') +
    (notes ? ' &nbsp;|&nbsp; <span style="font-weight:600;color:' + ac + '">Notes:</span> ' + esc(notes) : '') +
    (c.invTerms ? ' &nbsp;|&nbsp; <span style="font-weight:600;color:' + ac + '">Terms:</span> ' + esc(c.invTerms) : '') +
    '</div>' +

    /* ——— SEAL & SIGNATURE ——— */
    (c.seal || c.signature ? '<div style="display:flex;justify-content:space-between;align-items:end;margin-bottom:6mm">' +
    (c.seal ? '<div><img src="' + c.seal.replace(/"/g,'&quot;') + '" style="max-width:130px;max-height:130px;object-fit:contain"></div>' : '<div></div>') +
    (c.signature ? '<div style="text-align:center"><img src="' + c.signature.replace(/"/g,'&quot;') + '" style="max-width:100px;max-height:36px;object-fit:contain"><div style="font-size:11px;color:#999;margin-top:1px">Authorized Signature / <span dir="rtl" unicode-bidi="embed">التوقيع</span></div></div>' : '<div></div>') +
    '</div>' : '') +

    /* ——— FOOTER ——— */
    '<div style="position:absolute;bottom:6mm;left:14mm;right:14mm;border-top:1px solid #ddd;padding-top:2mm;display:flex;justify-content:space-between;font-size:11px;color:' + ac + '">' +
    '<div>' + esc(c.name) + (c.loc ? ' | ' + esc(c.loc) : '') + '</div>' +
    '<div>' + [c.tel && 'Tel: ' + c.tel, c.email].filter(Boolean).join(' | ') + '</div>' +
    '</div>' +
    (c.invFooter ? '<div style="position:absolute;bottom:0;left:14mm;right:14mm;text-align:center;font-size:9px;color:#bbb;padding-top:2mm">' + esc(c.invFooter) + '</div>' : '') +
    '</div>';
}

function printInvoice() {
  window.printInvoiceHTML('inv');
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
    dueDate: document.getElementById('invDueDate').value,
    paid: false,
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
