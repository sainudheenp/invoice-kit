(function () {
  function _pdf(type) {
    var c = getCo();
    if (!c) { alert('No active company'); return; }

    var html = type === 'inv' ? _buildInvHTML() : _buildRecHTML();
    if (!html) return;

    var area = document.getElementById(type === 'inv' ? 'invoicePrintArea' : 'receiptPrintArea');
    if (!area) return;

    area.innerHTML = html;
    area.style.display = 'block';
    document.body.classList.add('print-' + (type === 'inv' ? 'invoice' : 'receipt'));
    document.body.classList.remove(type === 'inv' ? 'print-receipt' : 'print-invoice');

    setTimeout(function () {
      window.print();
      document.body.classList.remove('print-' + (type === 'inv' ? 'invoice' : 'receipt'));
      area.style.display = 'none';
      area.innerHTML = '';
    }, 300);
  }

  window.downloadInvoicePDF = function () { _pdf('inv'); };
  window.downloadReceiptPDF = function () { _pdf('rec'); };

  window.downloadSavedDocPDF = function (type, id) {
    var c = getCo();
    if (!c) { alert('No active company'); return; }

    var d;
    if (type === 'inv') {
      d = C.invoices.find(function (e) { return e.id === id; });
      if (!d) return;
    } else {
      d = C.receipts.find(function (e) { return e.id === id; });
      if (!d) return;
    }

    var html = type === 'inv' ? _buildInvHTML(d, c) : _buildRecHTML(d, c);
    if (!html) return;

    var area = document.getElementById(type === 'inv' ? 'invoicePrintArea' : 'receiptPrintArea');
    if (!area) return;

    area.innerHTML = html;
    area.style.display = 'block';
    document.body.classList.add('print-' + (type === 'inv' ? 'invoice' : 'receipt'));
    document.body.classList.remove(type === 'inv' ? 'print-receipt' : 'print-invoice');

    setTimeout(function () {
      window.print();
      document.body.classList.remove('print-' + (type === 'inv' ? 'invoice' : 'receipt'));
      area.style.display = 'none';
      area.innerHTML = '';
    }, 300);
  };
})();
