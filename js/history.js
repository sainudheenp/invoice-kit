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
