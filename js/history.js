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

function _invStatus(d) {
  if (d.paid) return { lbl: 'Paid', cls: 'green' };
  if (d.dueDate && d.dueDate < new Date().toISOString().slice(0,10)) return { lbl: 'Overdue', cls: 'red' };
  return { lbl: 'Unpaid', cls: 'amber' };
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

  /* search filter */
  var q = (document.getElementById('historySearch').value || '').toLowerCase().trim();
  if (q) {
    docs = docs.filter(function (d) {
      var label = (_docTab === 'inv' ? (d.invNo||'') : (d.recNo||'')).toLowerCase();
      var party = _docTab === 'inv' ? ((d.customer && d.customer.name)||'') : (d.receivedFrom||'');
      return label.indexOf(q) !== -1 || party.toLowerCase().indexOf(q) !== -1;
    });
  }

  document.getElementById('historyCount').textContent = docs.length;

  if (!docs.length) {
    list.innerHTML = '<p style="color:var(--text2);text-align:center;padding:24px">No ' + (_docTab === 'inv' ? 'invoices' : 'receipts') + ' saved yet.</p>';
    return;
  }

  docs.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

  var h = '<div class="table-wrap"><table><thead><tr>' +
    '<th>#</th><th>Date</th>' +
    (_docTab === 'inv' ? '<th>Customer</th><th style="text-align:right">Amount</th><th>Status</th>' : '<th>Received From</th><th style="text-align:right">Amount</th>') +
    '<th style="text-align:right">Actions</th></tr></thead><tbody>';

  docs.forEach(function (d) {
    var label = _docTab === 'inv' ? d.invNo : d.recNo;
    var date = (d.date || '').slice(0, 10);
    var party = _docTab === 'inv' ? (d.customer ? d.customer.name : '') : d.receivedFrom;
    var amt = _docTab === 'inv' ? Number(d.grand || 0) : Number(d.amount || 0);
    var cur = c.currency;
    var statusHtml = '';
    var markBtn = '';
    if (_docTab === 'inv') {
      var st = _invStatus(d);
      var stColors = { green: 'style="background:#ECFDF5;color:#047857"', red: 'style="background:#FEF2F2;color:#DC2626"', amber: 'style="background:#FFFBEB;color:#D97706"' };
      statusHtml = '<td><span class="status-badge" ' + (stColors[st.cls] || stColors.amber) + '>' + st.lbl + '</span></td>';
      if (!d.paid) markBtn = '<button class="btn btn-sm btn-success" onclick="markInvoicePaid(\'' + d.id + '\')" style="margin-right:4px">Paid</button>';
    }
    h += '<tr>' +
      '<td style="font-weight:600">' + esc(label) + '</td>' +
      '<td>' + esc(date) + '</td>' +
      '<td>' + esc(party) + '</td>' +
      '<td style="text-align:right;font-weight:700">' + amt.toFixed(3) + ' ' + esc(cur.symbol) + '</td>' +
      (_docTab === 'inv' ? statusHtml : '') +
      '<td style="text-align:right;white-space:nowrap">' +
      markBtn +
      '<button class="btn btn-sm btn-primary" onclick="printSavedDoc(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')" style="margin-right:4px">Print</button>' +
      '<button class="btn btn-sm btn-info" onclick="downloadSavedDocPDF(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')" style="margin-right:4px">PDF</button>' +
'<button class="btn btn-sm btn-info" onclick="downloadSavedDocText(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')" style="margin-right:4px">Text</button>' +
      '<button class="btn btn-sm btn-info" onclick="editSavedDoc(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')" style="margin-right:4px">Edit</button>' +
      '<button class="btn btn-sm btn-ghost" onclick="deleteSavedDoc(\'' + (_docTab === 'inv' ? 'inv' : 'rec') + '\',\'' + d.id + '\')">Delete</button>' +
      '</td></tr>';
  });

  h += '</tbody></table></div>';
  list.innerHTML = h;
}

function markInvoicePaid(id) {
  var inv = C.invoices.find(function (d) { return d.id === id; });
  if (!inv) return;
  inv.paid = true;
  persist('invoices', inv);
  renderHistory();
}

function printSavedDoc(type, id) {
  window.printSavedHTML(type, id);
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
    document.getElementById('invDueDate').value = doc.dueDate || '';
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
    toggleInvFields();
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
  fullBackup();
  var btn = document.getElementById('backupBtn');
  if (btn) { btn.innerHTML = icon('check') + ' Saved!'; setTimeout(function () { btn.innerHTML = icon('save') + ' Backup'; }, 2000); }
}
