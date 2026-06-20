(function () {
  var P = (window.jspdf && (window.jspdf.jsPDF || window.jspdf.default)) || window.jsPDF || null;

  function _capturePDF(html, filename) {
    if (!P) { showToast('PDF library not loaded', 'err'); return; }
    var c = getCo();
    if (!c) { showToast('No active company', 'err'); return; }
    showPDFOverlay();

    var A4_W = 794;
    var A4_H = 1123;

    var fixedHtml = html.replace(/min-height\s*:\s*100vh\s*;/gi, 'min-height: ' + A4_H + 'px;');

    var container = document.createElement('div');
    container.innerHTML = fixedHtml;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = A4_W + 'px';
    container.style.background = '#fff';
    document.body.appendChild(container);

    var imgs = container.querySelectorAll('img');
    var pending = imgs.length;
    if (!pending) { _render(); return; }

    var done = function () { if (!--pending) _render(); };
    imgs.forEach(function (img) {
      if (img.complete) { done(); return; }
      img.onload = done;
      img.onerror = done;
    });

    function _render() {
      html2canvas(container, {
        scale: 2, useCORS: true, logging: false, allowTaint: true,
        width: container.scrollWidth,
        height: container.scrollHeight,
        windowWidth: A4_W,
        windowHeight: container.scrollHeight
      }).then(function (canvas) {
        var pdf = new P('p', 'mm', 'a4');
        var pw = pdf.internal.pageSize.getWidth();
        var ph = pdf.internal.pageSize.getHeight();

        var imgW = canvas.width;
        var imgH = canvas.height;

        var px2mm = pw / imgW;
        var pagePx = ph / px2mm;
        var pages = Math.ceil(imgH / pagePx);

        for (var i = 0; i < pages; i++) {
          var sy = Math.floor(i * pagePx);
          var sh = Math.ceil(Math.min(pagePx, imgH - sy));

          /* skip near-empty pages (rounding artifact that causes blank page) */
          if (sh < 20) break;

          if (i > 0) pdf.addPage();

          var pc = document.createElement('canvas');
          pc.width = imgW;
          pc.height = sh;
          pc.getContext('2d').drawImage(canvas, 0, sy, imgW, sh, 0, 0, imgW, sh);

          pdf.addImage(pc.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, sh * px2mm);
        }

        pdf.save((filename || 'document') + '.pdf');
        document.body.removeChild(container);
        hidePDFOverlay();
      }).catch(function (err) {
        document.body.removeChild(container);
        hidePDFOverlay();
        showToast('PDF error: ' + err.message, 'err');
      });
    }
  }

  function _downloadText(html, filename) {
    var temp = document.createElement('div');
    temp.innerHTML = html;
    var txt = (temp.textContent || temp.innerText || '')
      .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    var blob = new Blob([txt], { type: 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (filename || 'document') + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function _invData(saved, id) {
    var c = getCo();
    if (!c) { showToast('No active company', 'err'); return null; }
    var doc, html, name;
    if (saved) {
      doc = C.invoices.find(function (e) { return e.id === id; });
      if (!doc) return null;
      html = _buildInvHTML(doc, c);
      name = doc.invNo || 'invoice';
    } else {
      html = _buildInvHTML();
      if (!html) return null;
      name = document.getElementById('invNo').value || 'invoice';
    }
    return { html: html, name: name };
  }

  function _recData(saved, id) {
    var c = getCo();
    if (!c) { showToast('No active company', 'err'); return null; }
    var doc, html, name;
    if (saved) {
      doc = C.receipts.find(function (e) { return e.id === id; });
      if (!doc) return null;
      html = _buildRecHTML(doc, c);
      name = doc.recNo || 'receipt';
    } else {
      html = _buildRecHTML();
      if (!html) return null;
      name = document.getElementById('recNo').value || 'receipt';
    }
    return { html: html, name: name };
  }

  function _printHTML(html, type) {
    var area = document.getElementById(type === 'inv' ? 'invoicePrintArea' : 'receiptPrintArea');
    if (!area) return;
    area.innerHTML = html;
    void area.offsetHeight;

    var cleaned = false;
    function clean() {
      if (cleaned) return;
      cleaned = true;
      area.style.display = '';
      area.innerHTML = '';
      window.removeEventListener('afterprint', clean);
    }

    window.addEventListener('afterprint', clean);
    setTimeout(clean, 3000);
    window.print();
  }

  window.printInvoiceHTML = function (type) {
    var html = type === 'inv' ? _buildInvHTML() : _buildRecHTML();
    if (html) _printHTML(html, type);
  };
  window.printSavedHTML = function (type, id) {
    var c = getCo(); if (!c) return;
    var doc = type === 'inv'
      ? C.invoices.find(function (d) { return d.id === id; })
      : C.receipts.find(function (d) { return d.id === id; });
    if (!doc) return;
    var html = type === 'inv' ? _buildInvHTML(doc, c) : _buildRecHTML(doc, c);
    if (html) _printHTML(html, type);
  };

  window.downloadInvoicePDF = function () {
    var d = _invData(false); if (d) _capturePDF(d.html, d.name);
  };
  window.downloadInvoiceText = function () {
    var d = _invData(false); if (d) _downloadText(d.html, d.name);
  };
  window.downloadReceiptPDF = function () {
    var d = _recData(false); if (d) _capturePDF(d.html, d.name);
  };
  window.downloadReceiptText = function () {
    var d = _recData(false); if (d) _downloadText(d.html, d.name);
  };
  window.downloadSavedDocPDF = function (type, id) {
    var d = type === 'inv' ? _invData(true, id) : _recData(true, id);
    if (d) _capturePDF(d.html, d.name);
  };
  window.downloadSavedDocText = function (type, id) {
    var d = type === 'inv' ? _invData(true, id) : _recData(true, id);
    if (d) _downloadText(d.html, d.name);
  };
})();
