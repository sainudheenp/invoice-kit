/* ==========================================================
   DOCUMENTS HISTORY — view, reprint, delete saved docs
   ========================================================== */
var _docTab = 'inv';

function switchDocTab(tab) {
  _docTab = tab;
  document.querySelectorAll('#historyPage .btn[data-tab]').forEach(function (b) {
    b.className = 'btn btn-sm ' + (b.getAttribute('data-tab') === tab ? 'btn-primary' : 'btn-outline');
  });
  renderHistory();
}

function renderHistory() {
  document.querySelectorAll('#historyPage .btn[data-tab]').forEach(function (b) {
    b.className = 'btn btn-sm ' + (b.getAttribute('data-tab') === _docTab ? 'btn-primary' : 'btn-outline');
  });
  var list = document.getElementById('historyList');
  var c = getCo();
  if (!c) { list.innerHTML = '<p style="color:var(--text2);text-align:center;padding:24px">No active company.</p>'; return; }

  var docs = _docTab === 'inv'
    ? C.invoices.filter(function (i) { return i.companyId === c.id; })
    : C.receipts.filter(function (r) { return r.companyId === c.id; });

  document.getElementById('historyCount').textContent = docs.length;

  if (!docs.length) {
    list.innerHTML = '<p style="color:var(--text2);text-align:center;padding:24px">No ' + (_docTab === 'inv' ? 'invoices' : 'receipts') + ' saved yet.</p>';
    return;
  }

  docs.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

  var h = '<div class="table-wrap"><table><thead><tr>' +
    '<th>#</th><th>Date</th>' +
    (_docTab === 'inv' ? '<th>Customer</th><th style="text-align:right">Amount</th>' : '<th>Received From</th><th style="text-align:right">Amount</th>') +
    '<th style="text-align:right">Actions</th></tr></thead><tbody>';

  docs.forEach(function (d, i) {
    var label = _docTab === 'inv' ? d.invNo : d.recNo;
    var date = (d.date || '').slice(0, 10);
    var party = _docTab === 'inv' ? (d.customer ? d.customer.name : '') : d.receivedFrom;
    var amt = _docTab === 'inv' ? (d.grand || 0) : (d.amount || 0);
    var cur = c.currency;
    h += '<tr>' +
      '<td style="font-weight:600">' + esc(label) + '</td>' +
      '<td>' + esc(date) + '</td>' +
      '<td>' + esc(party) + '</td>' +
      '<td style="text-align:right;font-weight:700">' + amt.toFixed(3) + ' ' + esc(cur.symbol) + '</td>' +
      '<td style="text-align:right;white-space:nowrap">' +
      '<button class="btn btn-sm btn-primary" onclick="printSavedDoc(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')" style="margin-right:4px">Print</button>' +
      '<button class="btn btn-sm btn-info" onclick="editSavedDoc(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')" style="margin-right:4px">Edit</button>' +
      '<button class="btn btn-sm btn-ghost" onclick="deleteSavedDoc(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')">Delete</button>' +
      '</td></tr>';
  });

  h += '</tbody></table></div>';
  list.innerHTML = h;
}

function printSavedDoc(type, id) {
  var c = getCo(); if (!c) return;
  var doc, html;
  if (type === 'inv') {
    doc = C.invoices.find(function (d) { return d.id === id; });
    if (!doc) return;
    html = _buildInvHTML(doc, c);
  } else {
    doc = C.receipts.find(function (d) { return d.id === id; });
    if (!doc) return;
    html = _buildRecHTML(doc, c);
  }
  var area = document.getElementById(type === 'inv' ? 'invoicePrintArea' : 'receiptPrintArea');
  area.innerHTML = html;
  area.style.display = 'block';
  document.body.classList.add(type === 'inv' ? 'print-invoice' : 'print-receipt');
  document.body.classList.remove(type === 'inv' ? 'print-receipt' : 'print-invoice');
  setTimeout(function () {
    window.print();
    document.body.classList.remove('print-invoice', 'print-receipt');
    area.style.display = 'none'; area.innerHTML = '';
  }, 300);
}

function deleteSavedDoc(type, id) {
  if (!confirm('Delete this ' + (type === 'inv' ? 'invoice' : 'receipt') + '?')) return;
  if (type === 'inv') {
    C.invoices = C.invoices.filter(function (d) { return d.id !== id; });
    removePersist('invoices', id);
  } else {
    C.receipts = C.receipts.filter(function (d) { return d.id !== id; });
    removePersist('receipts', id);
  }
  renderHistory();
}

function editSavedDoc(type, id) {
  var c = getCo(); if (!c) return;
  if (type === 'inv') {
    var doc = C.invoices.find(function (d) { return d.id === id; });
    if (!doc) return;
    switchPage('invoice');
    document.getElementById('invNo').value = doc.invNo || '';
    document.getElementById('invDate').value = doc.date || '';
    document.getElementById('custName').value = (doc.customer && doc.customer.name) || '';
    document.getElementById('custAddr').value = (doc.customer && doc.customer.address) || '';
    document.getElementById('custPhone').value = (doc.customer && doc.customer.phone) || '';
    document.getElementById('custCr').value = (doc.customer && doc.customer.cr) || '';
    document.getElementById('custEmail').value = (doc.customer && doc.customer.email) || '';
    var tb = document.getElementById('invItems');
    tb.innerHTML = '';
    _invRC = 0;
    if (doc.items && doc.items.length) {
      doc.items.forEach(function (it) {
        addInvRow();
        var row = tb.lastElementChild;
        if (row) {
          var desc = row.querySelector('._iDesc');
          var qty = row.querySelector('._iQty');
          var prc = row.querySelector('._iPrc');
          if (desc) desc.value = it.desc || '';
          if (qty) qty.value = it.qty || '1';
          if (prc) prc.value = it.price || '0';
        }
      });
    } else {
      addInvRow();
    }
    document.getElementById('invVatPct').value = doc.vatPct || 0;
    document.getElementById('invDiscount').value = doc.discount || 0;
    document.getElementById('invPayMethod').value = doc.payMethod || 'Cash';
    document.getElementById('invChequeNo').value = doc.payDetails || '';
    document.getElementById('invBankName').value = doc.bankName || '';
    document.getElementById('invNotes').value = doc.notes || '';
    calcInv();
  } else {
    var doc = C.receipts.find(function (d) { return d.id === id; });
    if (!doc) return;
    switchPage('receipt');
    document.getElementById('recNo').value = doc.recNo || '';
    document.getElementById('recDate').value = doc.date || '';
    document.getElementById('recFrom').value = doc.receivedFrom || '';
    document.getElementById('recAmount').value = doc.amount || 0;
    document.getElementById('recPayMethod').value = doc.payMethod || 'Cash';
    document.getElementById('recChequeNo').value = doc.chequeNo || '';
    document.getElementById('recBankName').value = doc.bankName || '';
    document.getElementById('recTransDate').value = doc.transDate || '';
    document.getElementById('recBeing').value = doc.being || '';
    document.getElementById('recReceiver').value = doc.receiver || '';
    document.getElementById('recSignatory').value = doc.signatory || '';
    calcRecWords();
  }
}

/* --- backup / export all data --- */
function backupData() {
  var blob = new Blob([JSON.stringify(C, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'open_invoice_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  var btn = document.getElementById('backupBtn');
  if (btn) { btn.textContent = '✅ Saved!'; setTimeout(function () { btn.textContent = '💾 Backup'; }, 2000); }
}
