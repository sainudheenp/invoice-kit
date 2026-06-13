/* ============================================================
   PDF Download — Paged.js paginates, then html2canvas + jsPDF
   generates the PDF directly — no print dialog.
   ============================================================ */
(function () {

  function _download(htmlBuilder, type) {
    try {
      var html = htmlBuilder();
      if (!html) { alert('Failed to build HTML'); return; }

      var areaId = type === 'inv' ? 'invoicePrintArea' : 'receiptPrintArea';
      var area = document.getElementById(areaId);
      if (!area) return;

      html = html.replace('min-height:100vh', '');
      area.style.cssText = 'display:block;position:fixed;top:0;left:0;width:794px;z-index:-1';

      if (!window.Paged || !window.Paged.Previewer) {
        alert('Paged.js not loaded');
        return;
      }

      if (typeof html2canvas !== 'function') {
        alert('html2canvas not loaded');
        return;
      }

      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('jsPDF not loaded');
        return;
      }

      var contentDiv = document.createElement('div');
      contentDiv.style.cssText = 'position:fixed;top:0;left:0;width:794px;z-index:-2';
      contentDiv.innerHTML = html;
      document.body.appendChild(contentDiv);

      var pagedCss = {};
      pagedCss[window.location.href] = '@page{margin:0;size:A4 portrait}';

      var previewer = new window.Paged.Previewer();
      previewer.preview(contentDiv, [pagedCss], area).then(function (flow) {
        if (contentDiv.parentNode) contentDiv.parentNode.removeChild(contentDiv);
        setTimeout(function () {
          var pages = area.querySelectorAll('.pagedjs_page');
          if (!pages.length) {
            area.style.cssText = '';
            alert('No pages rendered');
            return;
          }

          var doc = new window.jspdf.jsPDF('p', 'mm', 'a4');
          var pageW = doc.internal.pageSize.getWidth();
          var pageH = doc.internal.pageSize.getHeight();
          var idx = 0;

          function captureNext() {
            if (idx >= pages.length) {
              var fn = (type === 'inv' ? 'invoice' : 'receipt') + '_' + Date.now() + '.pdf';
              doc.save(fn);
              area.style.cssText = '';
              area.innerHTML = '';
              return;
            }

            var page = pages[idx];
            var temp = document.createElement('div');
            temp.style.cssText = 'position:fixed;top:0;left:0;width:794px;background:#fff;z-index:9999';
            temp.appendChild(page.cloneNode(true));
            document.body.appendChild(temp);

            html2canvas(temp, { scale: 2, useCORS: true, allowTaint: true })
              .then(function (canvas) {
                var img = canvas.toDataURL('image/jpeg', 0.95);
                if (idx > 0) doc.addPage();
                doc.addImage(img, 'JPEG', 0, 0, pageW, pageH);
                document.body.removeChild(temp);
                idx++;
                captureNext();
              })
              .catch(function (e) {
                document.body.removeChild(temp);
                area.style.cssText = '';
                alert('Capture error: ' + e.message);
              });
          }

          captureNext();
        }, 300);
      }).catch(function (e) {
        area.style.cssText = '';
        alert('Paged.js error: ' + e.message);
      });
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  window.downloadInvoicePDF = function () {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    _download(_buildInvHTML, 'inv');
  };

  window.downloadReceiptPDF = function () {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    _download(_buildRecHTML, 'rec');
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
    _download(function () { return type === 'inv' ? _buildInvHTML(doc, c) : _buildRecHTML(doc, c); }, type);
  };
})();
