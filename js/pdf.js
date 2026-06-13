(function () {
  var _S = 1.07;

  function _scaleStyles(html) {
    return html
      .replace(/(padding|margin)(?:-[a-zA-Z]+)?:([^;]+)/g, function (m, prop, vals) {
        return prop + ':' + vals.replace(/([\d.]+)(px|mm|pt)/g, function (_, n, u) {
          var v = parseFloat(n) * _S;
          return (u === 'mm' ? Math.round(v * 10) / 10 : Math.round(v)) + u;
        });
      })
      .replace(/font-size:([\d.]+)(px|pt|mm)/g, function (_, n, u) {
        return 'font-size:' + Math.round(parseFloat(n) * _S) + u;
      })
      .replace(/width:([\d.]+)(px|mm)/g, function (_, n, u) {
        return 'width:' + (u === 'mm' ? Math.round(parseFloat(n) * _S * 10) / 10 : Math.round(parseFloat(n) * _S)) + u;
      })
      .replace(/height:([\d.]+)(px|mm)/g, function (_, n, u) {
        return 'height:' + (u === 'mm' ? Math.round(parseFloat(n) * _S * 10) / 10 : Math.round(parseFloat(n) * _S)) + u;
      })
      .replace(/(max-(?:width|height)|min-width):([\d.]+)(px|mm)/g, function (_, prop, n, u) {
        return prop + ':' + (u === 'mm' ? Math.round(parseFloat(n) * _S * 10) / 10 : Math.round(parseFloat(n) * _S)) + u;
      })
      .replace(/gap:([\d.]+)(px|mm)/g, function (_, n, u) {
        return 'gap:' + (u === 'mm' ? Math.round(parseFloat(n) * _S * 10) / 10 : Math.round(parseFloat(n) * _S)) + u;
      })
      .replace(/border-bottom:([\d.]+)(px)/g, function (_, n, u) {
        return 'border-bottom:' + Math.round(parseFloat(n) * _S) + u;
      });
  }

  function _fixFooterLayout(html) {
    var d = document.createElement('div');
    d.innerHTML = html;

    var absBtm = [];
    var all = d.querySelectorAll('div');
    for (var i = 0; i < all.length; i++) {
      var s = all[i].getAttribute('style') || '';
      if (s.indexOf('position:absolute') !== -1 && s.indexOf('bottom:') !== -1) {
        absBtm.push(all[i]);
      }
    }

    if (!absBtm.length) return html;

    var wrapper = document.createElement('div');
    wrapper.setAttribute('style', 'margin-top:auto');

    absBtm.forEach(function (el) {
      var s = el.getAttribute('style') || '';
      s = s.replace(/position:absolute;/g, '');
      s = s.replace(/bottom:[\d.]+(mm|px|pt);?/g, '');
      s = s.replace(/left:[\d.]+(mm|px|pt);?/g, '');
      s = s.replace(/right:[\d.]+(mm|px|pt);?/g, '');
      s = s.replace(/;+/g, ';').replace(/^;|;$/g, '');
      el.setAttribute('style', s);
      wrapper.appendChild(el.cloneNode(true));
    });

    var parent = absBtm[0].parentNode;
    absBtm.forEach(function (el) { el.parentNode.removeChild(el); });

    var outer = d.children[0];
    if (outer) {
      var os = outer.getAttribute('style') || '';
      os = os.replace('position:relative', 'position:relative;display:flex;flex-direction:column');
      os += ';padding-bottom:5mm';
      outer.setAttribute('style', os);
    }

    parent.appendChild(wrapper);
    return d.innerHTML;
  }

  function _download(htmlBuilder, type) {
    try {
      var html = htmlBuilder();
      if (!html) { alert('Failed to build HTML'); return; }

      html = html.replace('min-height:100vh', 'min-height:1123px');
      html = _scaleStyles(html);
      html = _fixFooterLayout(html);

      var areaId = type === 'inv' ? 'invoicePrintArea' : 'receiptPrintArea';
      var area = document.getElementById(areaId);
      if (!area) return;

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
      previewer.preview(contentDiv, [pagedCss], area).then(function () {
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
        }, 1000);
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