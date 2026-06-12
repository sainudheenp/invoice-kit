/* ============================================================
   PDF Download — triggers native browser print dialog.
   Browser's native "Save as PDF" produces pixel-perfect
   output matching the print HTML exactly.
   ============================================================ */
(function () {
  var _el = null;
  function _show(m) {
    if (!_el) {
      _el = document.createElement('div');
      _el.id = 'pdfProgress';
      _el.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.5);align-items:center;justify-content:center';
      _el.innerHTML =
        '<div style="background:#fff;border-radius:16px;padding:32px 40px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);max-width:280px">' +
        '<div class="spinner" style="margin:0 auto 14px"></div>' +
        '<p id="pdfPt" style="font-size:14px;font-weight:600;color:#1C1917;margin:0;line-height:1.4">' + m + '</p></div>';
      document.body.appendChild(_el);
    }
    _el.style.display = 'flex';
    document.getElementById('pdfPt').textContent = m;
  }
  function _hide() { if (_el) _el.style.display = 'none'; }

  /* ── Native-print PDF ── */

  function _triggerPrint(html, type) {
    return new Promise(function (resolve) {
      var areaId = type === 'inv' ? 'invoicePrintArea' : 'receiptPrintArea';
      var area = document.getElementById(areaId);
      if (!area) { resolve(); return; }

      area.innerHTML = html;
      area.style.display = 'block';
      document.body.classList.add(type === 'inv' ? 'print-invoice' : 'print-receipt');

      setTimeout(function () {
        window.print();

        document.body.classList.remove('print-invoice', 'print-receipt');
        area.style.display = 'none';
        area.innerHTML = '';
        resolve();
      }, 300);
    });
  }

  /* ── Public API ── */

  function _dl(html, type) {
    _show('Preparing PDF\u2026');
    setTimeout(function () {
      _triggerPrint(html, type)
        .then(function () { _hide(); })
        .catch(function (e) { _hide(); alert('PDF error: ' + e.message); });
    }, 50);
  }

  function _gen(htmlBuilder, type) {
    _show('Generating PDF\u2026');
    setTimeout(function () {
      try {
        var html = htmlBuilder();
        if (!html) { _hide(); alert('Failed to build HTML'); return; }
        _dl(html, type);
      } catch (e) { _hide(); alert('Error: ' + e.message); }
    }, 50);
  }

  window.downloadInvoicePDF = function () {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    _gen(_buildInvHTML, 'inv');
  };

  window.downloadReceiptPDF = function () {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    _gen(_buildRecHTML, 'rec');
  };

  window.downloadSavedDocPDF = function (type, id) {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    var doc;
    if (type === 'inv') {
      doc = C.invoices.find(function (d) { return d.id === id; });
      if (!doc) return;
    } else {
      doc = C.receipts.find(function (d) { return d.id === id; });
      if (!doc) return;
    }
    _gen(function () { return type === 'inv' ? _buildInvHTML(doc, c) : _buildRecHTML(doc, c); }, type);
  };
})();
