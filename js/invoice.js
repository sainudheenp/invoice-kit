/* ==========================================================
   INVOICE ENGINE
   ========================================================== */
var _invRC = 0;

/* decimal places from currency subPer */
function _dp(sp) { return Math.log10(sp || 1000); }

/* saved customers autocomplete */
function loadSavedCustomers() {
  var list = document.getElementById('custNameList');
  if (!list) return;
  try { var names = JSON.parse(localStorage.getItem('_savedCust') || '[]'); } catch(e){ var names = []; }
  list.innerHTML = names.map(function (n) { return '<option value="' + esc(n) + '">'; }).join('');
}
function _saveCustomer(name) {
  if (!name) return;
  try { var names = JSON.parse(localStorage.getItem('_savedCust') || '[]'); } catch(e){ var names = []; }
  if (names.indexOf(name) === -1) { names.push(name); localStorage.setItem('_savedCust', JSON.stringify(names)); }
  loadSavedCustomers();
}

function addInvRow() {
  var tb = document.getElementById('invItems');
  var tr = document.createElement('tr');
  var i = _invRC++;
  tr.innerHTML =
    '<td style="text-align:center;padding-top:8px">' + (i + 1) + '</td>' +
    '<td><input class="_iDesc" placeholder="Description" oninput="calcInv()" style="min-width:80px"></td>' +
    '<td><input class="_iQty" type="number" min="1" value="1" style="width:55px" oninput="calcInv()"></td>' +
    '<td><input class="_iPrc" type="number" min="0" step="0.001" value="0" style="width:85px" oninput="calcInv()"></td>' +
    '<td class="amt-cell _iAmt" style="padding-top:8px">0</td>';
  tb.appendChild(tr);
  markFormDirty();
  calcInv();
}

function removeInvRow() {
  var tb = document.getElementById('invItems');
  if (tb.children.length) { tb.removeChild(tb.lastChild); _invRC--; markFormDirty(); calcInv(); }
}

function calcInv() {
  var rows = document.querySelectorAll('#invItems tr');
  var sub = 0;
  var c = getCo();
  var dp = _dp(c && c.currency && c.currency.subPer);
  rows.forEach(function (r) {
    var q = parseFloat((r.querySelector('._iQty') || {}).value) || 0;
    var p = parseFloat((r.querySelector('._iPrc') || {}).value) || 0;
    var a = q * p;
    var amtEl = r.querySelector('._iAmt');
    if (amtEl) amtEl.textContent = a.toFixed(dp);
    sub += a;
  });
  var vp  = parseFloat(document.getElementById('invVatPct').value) || 0;
  var disc= parseFloat(document.getElementById('invDiscount').value) || 0;
  var ad  = sub - disc;
  var va  = ad * vp / 100;
  var grand = ad + va;
  document.getElementById('invSubtotal').value = sub.toFixed(dp);
  document.getElementById('invVatAmt').value    = va.toFixed(dp);
  document.getElementById('invGrand').value     = grand.toFixed(dp);
  if (c) document.getElementById('invWords').value = num2words(grand, c.currency) + ' only';

  document.getElementById('sumSubtotal').textContent = sub.toFixed(dp);
  document.getElementById('sumVat').textContent = va.toFixed(dp);
  document.getElementById('sumGrand').textContent = grand.toFixed(dp);
  var discRow = document.getElementById('sumDiscRow');
  if (disc > 0) { discRow.style.display = 'flex'; document.getElementById('sumDiscount').textContent = '-' + disc.toFixed(dp); }
  else discRow.style.display = 'none';
  if (c) document.getElementById('sumWords').textContent = num2words(grand, c.currency) + ' only';
}

function refreshInv() {
  var c = getCo(); if (!c) return;
  loadSavedCustomers();
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
  markFormClean();
}

function toggleInvFields() {
  var pm = document.getElementById('invPayMethod').value;
  document.getElementById('invChequeField').classList.toggle('show', pm === 'Cheque');
  document.getElementById('invBankField').classList.toggle('show',  pm === 'Cheque' || pm === 'Bank Transfer');
}

function _buildInvHTML(savedInv, comp) {
  return window._buildInvFromTemplate(savedInv, comp);
}

function printInvoice() {
  window.printInvoiceHTML('inv');
}

function saveInvoice() {
  var c = getCo(); if (!c) { showToast('No active company', 'err'); return; }
  var no = document.getElementById('invNo').value;

  /* duplicate check — exclude the doc being edited */
  var editing = _editingDoc && _editingDoc.type === 'inv';
  var dup = C.invoices.some(function (i) { return i.invNo === no && i.companyId === c.id && (!editing || i.id !== _editingDoc.id); });
  if (dup) { showToast('Invoice #' + no + ' already exists', 'err'); return; }

  var oldDoc = editing ? C.invoices.find(function (i) { return i.id === _editingDoc.id; }) : null;
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
    id: oldDoc ? oldDoc.id : uid(),
    companyId: c.id, invNo: no,
    date: document.getElementById('invDate').value,
    dueDate: document.getElementById('invDueDate').value,
    paid: oldDoc ? oldDoc.paid : false,
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
    createdAt: oldDoc ? oldDoc.createdAt : Date.now()
  };

  if (editing) {
    /* remove old doc, insert updated in its place */
    C.invoices = C.invoices.filter(function (i) { return i.id !== oldDoc.id; });
    C.invoices.push(inv);
    removePersist('invoices', oldDoc.id);
    persist('invoices', inv);
    clearEditing();
    refreshInv();
    markFormClean();
    showToast('Invoice #' + no + ' updated');
  } else {
    C.invoices.push(inv);
    c.invNext = (parseInt(c.invNext) || 1) + 1;
    persist('invoices', inv);
    persist('companies', c);
    _saveCustomer(document.getElementById('custName').value);
    refreshInv();
    markFormClean();
    showToast('Invoice #' + no + ' saved. Next: ' + c.invPref + c.invNext);
  }
}
