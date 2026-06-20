/* ==========================================================
   RECEIPT VOUCHER ENGINE
   ========================================================== */
function calcRecWords() {
  var c = getCo(); if (!c) return;
  var a = parseFloat(document.getElementById('recAmount').value) || 0;
  var dp = _dp(c.currency && c.currency.subPer);
  document.getElementById('recWords').value = num2words(a, c.currency) + ' only';
  document.getElementById('sumRecAmt').textContent = a.toFixed(dp);
  document.getElementById('sumRecTotal').textContent = a.toFixed(dp);
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
  markFormClean();
}

function _buildRecHTML(savedRec, comp) {
  return window._buildRecFromTemplate(savedRec, comp);
}

function printReceipt() {
  window.printInvoiceHTML('rec');
}

function saveReceipt() {
  var c = getCo(); if (!c) { showToast('No active company', 'err'); return; }
  var recNo = document.getElementById('recNo').value;

  var editing = _editingDoc && _editingDoc.type === 'rec';
  var dup = C.receipts.some(function (r) { return r.recNo === recNo && r.companyId === c.id && (!editing || r.id !== _editingDoc.id); });
  if (dup) { showToast('Receipt #' + recNo + ' already exists', 'err'); return; }

  var oldDoc = editing ? C.receipts.find(function (r) { return r.id === _editingDoc.id; }) : null;
  var rec = {
    id: oldDoc ? oldDoc.id : uid(),
    companyId: c.id,
    recNo:        recNo,
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
    createdAt:    oldDoc ? oldDoc.createdAt : Date.now()
  };

  if (editing) {
    C.receipts = C.receipts.filter(function (r) { return r.id !== oldDoc.id; });
    C.receipts.push(rec);
    removePersist('receipts', oldDoc.id);
    persist('receipts', rec);
    clearEditing();
    refreshRec();
    markFormClean();
    showToast('Receipt #' + recNo + ' updated');
  } else {
    C.receipts.push(rec);
    c.recNext = (parseInt(c.recNext) || 1) + 1;
    persist('receipts', rec);
    persist('companies', c);
    refreshRec();
    markFormClean();
    showToast('Receipt #' + rec.recNo + ' saved. Next: ' + c.recPref + c.recNext);
  }
}
