/* ============================================================
   PDF Download — pure-text PDF using content stream operators
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

  /* ── PDF coordinate constants ── */
  var PW = 595.28, PH = 841.89;
  var LM = 40, RM = 40, TM = 30, BM = 30;
  var PCW = PW - LM - RM;  /* PDF content width */
  var PCH = PH - TM - BM;  /* PDF content height */

  /* Canvas coordinate system  */
  var CW = 1240, CH = 1754, CL = 70, CR = 70, CT = 60;
  var CCW = CW - CL - CR;  /* canvas content width */

  /* Convert canvas coords → PDF points */
  function pX(cx) { return LM + ((cx - CL) / CCW) * PCW; }
  function pY(cy) { return PH - TM - ((cy - CT) / (CH - CT)) * PCH; }
  function pPt(px) { return (px / CCW) * PCW; }
  /* Convert canvas px (same as print HTML px at 96 DPI) → PDF points */
  function pSz(px) { return px * 72 / 96; }

  /* RB = canvas right-edge x for content */
  var RB = CW - CR;

  /* Has Arabic chars? */
  function isAr(s) { return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(s); }

  /* Escape for PDF text strings */
  function escPDF(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
      .replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  }

  /* Approximate Helvetica char widths (fraction of em) */
  var _w = { a:0.5,b:0.56,c:0.5,d:0.56,e:0.5,f:0.28,g:0.5,h:0.56,i:0.22,j:0.22,
    k:0.5,l:0.22,m:0.83,n:0.56,o:0.5,p:0.56,q:0.56,r:0.33,s:0.44,t:0.28,u:0.56,
    v:0.5,w:0.72,x:0.5,y:0.5,z:0.5,A:0.61,B:0.61,C:0.67,D:0.72,E:0.56,F:0.5,
    G:0.72,H:0.72,I:0.28,J:0.5,K:0.61,L:0.5,M:0.83,N:0.72,O:0.72,P:0.56,Q:0.72,
    R:0.61,S:0.56,T:0.56,U:0.72,V:0.61,W:0.83,X:0.61,Y:0.61,Z:0.56,
    0:0.5,1:0.5,2:0.5,3:0.5,4:0.5,5:0.5,6:0.5,7:0.5,8:0.5,9:0.5,
    '.':0.28,',':0.28,'-':0.33,'/':0.28,':':0.28,';':0.28,'(':0.33,')':0.33,
    '!':0.28,'@':0.78,'#':0.5,'$':0.5,'%':0.83,'^':0.5,'&':0.67,'*':0.5,
    '+':0.56,'=':0.56,'[':0.33,']':0.33,'{':0.33,'}':0.33,'|':0.22,'\\':0.28,
    '<':0.56,'>':0.56,'?':0.44,'~':0.5,'_':0.5,'`':0.28,' ':0.28 };
  function tw(s, pt) {
    var w = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s[i].toLowerCase();
      w += _w[c] !== undefined ? _w[c] : 0.6;
    }
    return w * pt;
  }

  /* Extract base64 from data URI */
  function b64(src) {
    if (!src) return '';
    var m = src.match(/^data:image\/\w+;base64,(.+)$/);
    return m ? m[1] : src;
  }

  /* ── PDF writer ── */
  function PDF() {
    var s = '';
    var imgs = [];
    var imgN = 0;
    var self = this;
    var cr = 0, cg = 0, cb = 0;

    function hexRgb(h) {
      if (!h) { cr = cg = cb = 0; return; }
      cr = parseInt(h.slice(1, 3), 16) / 255;
      cg = parseInt(h.slice(3, 5), 16) / 255;
      cb = parseInt(h.slice(5, 7), 16) / 255;
    }

    this.txt = function (str, cx, cy, sz, hex, bold, align) {
      if (!str) return;
      hexRgb(hex || '#333');
      var pt = pSz(sz || 10);
      var x = pX(cx), y = pY(cy);
      if (align === 'right') x -= tw(str, pt);
      else if (align === 'center') x -= tw(str, pt) / 2;

      if (isAr(str)) {
        /* Arabic — render on tiny canvas, embed as JPEG */
        var cv = document.createElement('canvas');
        var pad = 10;
        var cw = Math.ceil(tw(str, pt) / pPt(1)) + pad * 2;
        var ch = Math.ceil(sz * 1.7);
        cv.width = cw; cv.height = ch;
        var ctx = cv.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, cw, ch);
        ctx.font = (bold ? 'bold ' : '') + sz + 'px Arial,Helvetica,sans-serif';
        ctx.fillStyle = hex || '#333';
        ctx.textAlign = 'left';
        ctx.fillText(str, pad, ch - Math.ceil(ch * 0.12));
        var du = cv.toDataURL('image/jpeg', 0.85);
        if (du && du.length > 200) {
          var b = du.split(',')[1];
          var raw = Uint8Array.from(atob(b), function (c) { return c.charCodeAt(0); });
          imgN++; imgs.push({ n: imgN, raw: raw, w: cw, h: ch });
          var pw = pPt(cw), ph = pPt(ch);
          s += 'q ' + pw.toFixed(2) + ' 0 0 ' + ph.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (y - ph).toFixed(2) + ' cm /Im' + imgN + ' Do Q\n';
        }
        /* invisible text for copy/paste */
        s += 'BT /F1 ' + pt.toFixed(1) + ' Tf ' + cr.toFixed(2) + ' ' + cg.toFixed(2) + ' ' + cb.toFixed(2) + ' rg 3 Tr 1 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Tm (' + escPDF(str) + ') Tj 0 Tr ET\n';
      } else {
        s += 'BT /' + (bold ? 'F2' : 'F1') + ' ' + pt.toFixed(1) + ' Tf ';
        s += cr.toFixed(2) + ' ' + cg.toFixed(2) + ' ' + cb.toFixed(2) + ' rg ';
        s += '1 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Tm (';
        s += escPDF(str) + ') Tj ET\n';
      }
    };

    this.tL = function (str, x, y, sz, h, b) { self.txt(str, x, y, sz, h, b, 'left'); };
    this.tR = function (str, x, y, sz, h, b) { self.txt(str, x, y, sz, h, b, 'right'); };
    this.tC = function (str, x, y, sz, h, b) { self.txt(str, x, y, sz, h, b, 'center'); };

    this.line = function (cx1, cy1, cx2, cy2, hex, lw) {
      hexRgb(hex || '#000');
      s += cr.toFixed(2) + ' ' + cg.toFixed(2) + ' ' + cb.toFixed(2) + ' RG ';
      s += (lw || 1).toFixed(1) + ' w ';
      s += pX(cx1).toFixed(2) + ' ' + pY(cy1).toFixed(2) + ' m ';
      s += pX(cx2).toFixed(2) + ' ' + pY(cy2).toFixed(2) + ' l S\n';
    };

    this.hLine = function (cx, cy, len, hex, lw) {
      self.line(cx, cy, cx + len, cy, hex, lw);
    };

    this.fillRect = function (cx, cy, w, h, hex) {
      hexRgb(hex || '#fff');
      s += cr.toFixed(2) + ' ' + cg.toFixed(2) + ' ' + cb.toFixed(2) + ' rg ';
      s += pX(cx).toFixed(2) + ' ' + (pY(cy) - pPt(h)).toFixed(2) + ' ' + pPt(w).toFixed(2) + ' ' + pPt(h).toFixed(2) + ' re f\n';
    };

    this.strokeRect = function (cx, cy, w, h, hex, lw) {
      hexRgb(hex || '#333');
      s += cr.toFixed(2) + ' ' + cg.toFixed(2) + ' ' + cb.toFixed(2) + ' RG ';
      s += (lw || 1).toFixed(1) + ' w ';
      s += pX(cx).toFixed(2) + ' ' + (pY(cy) - pPt(h)).toFixed(2) + ' ' + pPt(w).toFixed(2) + ' ' + pPt(h).toFixed(2) + ' re S\n';
    };

    this.img = function (src, cx, cy, dw, dh) {
      var b = b64(src);
      if (!b) return;
      try {
        var raw = Uint8Array.from(atob(b), function (c) { return c.charCodeAt(0); });
        imgN++; imgs.push({ n: imgN, raw: raw, w: dw, h: dh });
        var x = pX(cx), y = pY(cy);
        var pw = pPt(dw), ph = pPt(dh);
        s += 'q ' + pw.toFixed(2) + ' 0 0 ' + ph.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (y - ph).toFixed(2) + ' cm /Im' + imgN + ' Do Q\n';
      } catch (e) {}
    };

    this.build = function () {
      var enc = new TextEncoder();
      var parts = [], xref = [0], off = 0;
      function add(v) {
        var b = typeof v === 'string' ? enc.encode(v) : v;
        parts.push(b); off += b.length;
      }
      function obj(n, c) { xref[n] = off; add(n + ' 0 obj\n' + c + '\nendobj\n'); }

      add('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');
      obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
      obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

      var xo = '';
      if (imgs.length) {
        xo = '/XObject << ';
        imgs.forEach(function (im) { xo += '/Im' + im.n + ' ' + (5 + im.n) + ' 0 R '; });
        xo += '>>';
      }
      var fontRes = '/F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

      obj(4, '<< /Length ' + s.length + ' >>\nstream\n' + s + '\nendstream');

      imgs.forEach(function (im) {
        var num = 5 + im.n;
        xref[num] = off;
        add(num + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.raw.length + ' >>\nstream\n');
        add(im.raw);
        add('\nendstream\nendobj\n');
      });

      obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Contents 4 0 R /Resources << /Font ' + fontRes + ' ' + xo + ' >> >>');

      var xo_off = off;
      add('xref\n0 ' + xref.length + '\n0000000000 65535 f \n');
      for (var i = 1; i < xref.length; i++) add(String(xref[i] || 0).padStart(10, '0') + ' 00000 n \n');
      add('trailer\n<< /Size ' + xref.length + ' /Root 1 0 R >>\nstartxref\n' + xo_off + '\n%%EOF');

      var total = parts.reduce(function (a, b) { return a + b.length; }, 0);
      var r = new Uint8Array(total), pos = 0;
      parts.forEach(function (p) { r.set(p, pos); pos += p.length; });
      return r;
    };
  }

  /* ── Invoice renderer ── */
  function _renderInv(data) {
    var c = data.company;
    var cur = c.currency || { code: 'OMR', symbol: '\u0631.\u0639.', name: 'Rial', sub: 'Baisa', subPer: 1000 };
    var pc = c.pcolor || '#D97706', ac = c.acolor || '#78716C';
    var pdf = new PDF();
    var y = CT;

    /* Invoice background + accent */
    pdf.fillRect(-CW, -CH, CW * 3, CH * 3, '#fff');
    pdf.fillRect(-CW, 0, CW * 3, 5, pc);
    y += 20;

    if (c.logo) pdf.img(c.logo, CL, 30, 55, 55);

    pdf.tL(c.name || '', CL, y + 26, 26, '#222', true);
    var lh = 30;
    if (c.sub) { pdf.tL(c.sub, CL, y + lh + 14, 14, '#888'); lh += 20; }
    if (c.nameAr) {
      pdf.tR(c.nameAr, RB, y + 26, 26, '#222', true);
      if (c.subAr) { pdf.tR(c.subAr, RB, y + lh + 14, 12, '#888'); lh += 20; }
    }
    y += lh + 6;

    var contacts = [c.loc, c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join('  |  ');
    if (contacts) {
      var ls = contacts.split('  |  '), line = '';
      ls.forEach(function (w) {
        var test = line ? line + '  |  ' + w : w;
        if (tw(test, 10) > PCW && line) { pdf.tL(line, CL, y + 11, 10, ac); y += 15; line = w; }
        else line = test;
      });
      if (line) { pdf.tL(line, CL, y + 11, 10, ac); y += 15; }
    }

    y += 6;
    pdf.hLine(CL, y, CCW, '#ddd', 1);
    y += 14;

    pdf.tL('TAX INVOICE', CL, y + 22, 24, pc, true);
    pdf.tL('\u0641\u0627\u062A\u0648\u0631\u0629 \u0636\u0631\u064A\u0628\u064A\u0629', CL, y + 38, 11, '#999');
    pdf.tR('Invoice No.', RB, CT + 20, 11, '#999');
    pdf.tR(data.invNo || '---', RB, CT + 20, 11, '#333', true);
    pdf.tR('Date', RB, CT + 36, 11, '#999');
    pdf.tR(data.date || '---', RB, CT + 36, 11, '#333', true);
    if (c.vatReg) {
      pdf.tR('VAT Reg.', RB, CT + 52, 11, '#999');
      pdf.tR(c.vatReg, RB, CT + 52, 11, '#333', true);
    }
    y += 55;

    pdf.hLine(CL, y, CCW, '#eee', 1);
    y += 12;

    pdf.tL('Bill To / \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u062F', CL, y + 11, 11, ac);
    y += 18;
    var cust = data.customer || {};
    pdf.tL(cust.name || '\u2014', CL, y + 15, 15, '#222', true);
    y += 22;
    [cust.address, cust.phone && 'Tel: ' + cust.phone, cust.cr && 'C.R.: ' + cust.cr, cust.email].filter(Boolean).forEach(function (cl) {
      pdf.tL(cl, CL, y + 13, 13, '#777');
      y += 18;
    });
    y += 6;

    /* items table */
    var items = data.items || [];
    var colWs = [40, CCW - 40 - 55 - 85 - 90, 55, 85, 90];
    var hx = CL;

    pdf.fillRect(CL, y, CCW, 26, '#f7f7f7');
    pdf.hLine(CL, y, CCW, '#333', 1);
    pdf.hLine(CL, y + 26, CCW, '#333', 1);
    ['#', 'Description / \u0627\u0644\u0628\u064A\u0627\u0646', 'Qty', 'Price', 'Amount'].forEach(function (h, i) {
      var a = i === 1 ? 'left' : (i === 4 ? 'right' : 'center');
      var px = i === 1 ? hx + 6 : (i === 4 ? hx + colWs[i] - 6 : hx + colWs[i] / 2);
      pdf.txt(h, px, y + 17, 10, '#555', false, a);
      hx += colWs[i];
    });
    y += 26;

    items.forEach(function (it, i) {
      pdf.fillRect(CL, y, CCW, 26, '#fff');
      pdf.hLine(CL, y + 26, CCW, '#f3f4f6', 1);
      pdf.tC(String(i + 1), CL + colWs[0] / 2, y + 17, 12, '#333');
      pdf.tL(it.desc || '', CL + colWs[0] + 6, y + 17, 12, '#333');
      pdf.tC(it.qty || '0', CL + colWs[0] + colWs[1] + colWs[2] / 2, y + 17, 12, '#555');
      pdf.tC((parseFloat(it.price) || 0).toFixed(3), CL + colWs[0] + colWs[1] + colWs[2] + colWs[3] / 2, y + 17, 12, '#555');
      pdf.tR(it.amount || '0.000', RB, y + 17, 12, '#222', true);
      y += 26;
    });
    y += 10;

    /* totals */
    var tx = CL + Math.min(CCW * 0.4, 200);
    function tLine(lbl, val, color, big) {
      pdf.tL(lbl, tx, y + (big ? 17 : 11), big ? 20 : 13, color || '#555', big);
      pdf.tR(val + ' ' + cur.symbol, RB, y + (big ? 17 : 11), big ? 20 : 13, color || '#555', big);
      y += big ? 28 : 18;
    }
    tLine('Subtotal', (data.subtotal || 0).toFixed(3));
    if (data.discount > 0) tLine('Discount', '-' + (data.discount || 0).toFixed(3), '#e53e3e');
    if (data.vatPct > 0) tLine('VAT (' + data.vatPct + '%)', (data.vatAmt || 0).toFixed(3));
    pdf.hLine(tx, y, RB - tx, ac, 2);
    y += 6;
    tLine('Total', (data.grand || 0).toFixed(3), pc, true);

    var words = data.words;
    if (!words) { try { words = num2words(data.grand || 0, cur) + ' only'; } catch (e) {} }
    pdf.tR(words, RB, y + 10, 11, '#999');
    y += 20;

    var pay = data.payMethod || '';
    if (data.payDetails) pay += ' / ' + data.payDetails;
    if (data.bankName) pay += ' \u2014 ' + data.bankName;
    if (pay) { pdf.tL('Payment: ' + pay, CL, y + 11, 12, '#555'); y += 18; }
    if (data.notes) {
      var wds = String(data.notes).split(' '), line = '';
      for (var i = 0; i < wds.length; i++) {
        var test = line ? line + ' ' + wds[i] : wds[i];
        if (tw(test, 12) > PCW && line) { pdf.tL(line, CL, y + 10, 12, '#555'); y += 18; line = wds[i]; }
        else line = test;
      }
      if (line) { pdf.tL(line, CL, y + 10, 12, '#555'); y += 18; }
      y += 6;
    }

    /* seal + signature */
    y = Math.max(y, CH - 170);
    if (c.seal) pdf.img(c.seal, CL, y, 130, 130);
    if (c.signature) {
      pdf.img(c.signature, RB - 100, y, 100, 36);
      pdf.tR('Authorized Signature / \u0627\u0644\u062A\u0648\u0642\u064A\u0639', RB, y + 50, 9, '#999');
    }

    /* footer */
    y = CH - 45;
    pdf.hLine(CL, y, CCW, '#ddd', 1);
    y += 10;
    pdf.tL(c.name + (c.loc ? ' | ' + c.loc : ''), CL, y + 9, 10, ac);
    pdf.tR([c.tel ? 'Tel: ' + c.tel : '', c.email].filter(Boolean).join(' | '), RB, y + 9, 10, ac);

    return pdf;
  }

  /* ── Receipt renderer ── */
  function _renderRec(data) {
    var c = data.company;
    var cur = c.currency || { code: 'OMR', symbol: '\u0631.\u0639.', name: 'Rial', sub: 'Baisa', subPer: 1000 };
    var pc = c.pcolor || '#D97706', ac = c.acolor || '#78716C';
    var pdf = new PDF();
    var y = CT;

    /* Receipt background + accent */
    pdf.fillRect(-CW, -CH, CW * 3, CH * 3, '#fff');
    pdf.fillRect(-CW, 0, CW * 3, 5, pc);
    y += 15;

    if (c.logo) pdf.img(c.logo, CL, 25, 50, 50);

    pdf.tL(c.name || '', CL, y + 22, 22, '#222', true);
    var lh = 26;
    if (c.sub) { pdf.tL(c.sub, CL, y + lh + 12, 13, '#888'); lh += 18; }
    if (c.nameAr) {
      pdf.tR(c.nameAr, RB, y + 22, 22, '#222', true);
      if (c.subAr) { pdf.tR(c.subAr, RB, y + lh + 12, 11, '#888'); lh += 18; }
    }
    y += lh + 4;

    var contacts = [c.loc, c.tel && 'Tel: ' + c.tel, c.mob && 'Mob: ' + c.mob, c.email, c.cr && 'C.R.: ' + c.cr].filter(Boolean).join('  |  ');
    if (contacts) {
      var ls = contacts.split('  |  '), line = '';
      ls.forEach(function (w) {
        var test = line ? line + '  |  ' + w : w;
        if (tw(test, 10) > PCW && line) { pdf.tL(line, CL, y + 10, 10, ac); y += 14; line = w; }
        else line = test;
      });
      if (line) { pdf.tL(line, CL, y + 10, 10, ac); y += 14; }
    }

    y += 4;
    pdf.hLine(CL, y, CCW, '#ddd', 1);
    y += 12;

    pdf.tL('RECEIPT VOUCHER', CL, y + 18, 20, pc, true);
    pdf.tL('\u0633\u0646\u062F \u0642\u0628\u0636', CL, y + 32, 11, '#999');
    pdf.tR('Receipt No.', RB, CT + 20, 10, '#999');
    pdf.tR(data.recNo || '---', RB, CT + 20, 10, '#333', true);
    pdf.tR('Date', RB, CT + 36, 10, '#999');
    pdf.tR(data.date || '---', RB, CT + 36, 10, '#333', true);
    y += 50;

    pdf.hLine(CL, y, CCW, '#eee', 1);
    y += 10;

    function fieldRow(lbl, val, ar) {
      pdf.tL(lbl, CL, y + 9, 11, ac, true);
      pdf.tL(val || '\u2014', CL + 110, y + 9, 12, '#333');
      pdf.tR(ar || '', RB, y + 9, 10, '#999');
      pdf.hLine(CL, y + 15, CCW, '#eee', 1);
      y += 22;
    }

    fieldRow('Received from', data.receivedFrom, '\u0627\u0633\u062A\u0644\u0645\u062A \u0645\u0646');
    var amtStr = data.amount ? (data.amount.toFixed(3) + ' ' + cur.symbol) : '\u2014';
    fieldRow('Amount', amtStr, '\u0628\u0645\u0628\u0644\u063A \u0642\u062F\u0631\u0647');
    fieldRow('Payment', data.payMethod || '\u2014', '\u0646\u0642\u062F / \u0634\u064A\u0643');
    if (data.bankName || data.transDate) fieldRow('Bank / Date', [data.bankName, data.transDate].filter(Boolean).join(' / '), '\u0627\u0644\u0628\u0646\u0643 / \u062A\u0627\u0631\u064A\u062E\u0647');
    fieldRow('Being', data.being || '\u2014', '\u0628\u064A\u0627\u0646');

    y += 10;

    /* amount boxes */
    var amt = data.amount || 0;
    var wi = Math.floor(amt);
    var frStr = String(Math.round((amt - wi) * cur.subPer)).padStart(String(cur.subPer).length, '0');
    var bw = 75, bh = 32, bGap = 14;
    var bx1 = RB - 2 * bw - bGap, bx2 = RB - bw, by = y;
    pdf.tC(cur.symbol + ' ' + cur.name, bx1 + bw / 2, by + 8, 9, '#999');
    pdf.tC(cur.sub, bx2 + bw / 2, by + 8, 9, '#999');
    pdf.strokeRect(bx1, by + 12, bw, bh, pc, 2.5);
    pdf.strokeRect(bx2, by + 12, bw, bh, pc, 2.5);
    pdf.tC(String(wi), bx1 + bw / 2, by + 34, 18, '#222', true);
    pdf.tC(frStr, bx2 + bw / 2, by + 34, 18, '#222', true);
    y = by + 56;

    var ww = data.amountWords;
    if (!ww) { try { ww = num2words(amt, cur) + ' only'; } catch (e) {} }
    pdf.tR(ww, RB, y + 10, 11, '#999');
    y += 20;

    /* seal + signature */
    y = Math.max(y, CH - 160);
    if (c.seal) pdf.img(c.seal, CL, y, 130, 130);
    if (data.receiver || c.signature) {
      var sxc = RB - 90;
      pdf.hLine(sxc - 70, y + 26, 140, '#bbb', 1);
      pdf.tC(data.receiver || '______________', sxc, y + 23, 12, '#222', true);
      pdf.tC('Receiver / \u0627\u0644\u0645\u0633\u062A\u0644\u0645', sxc, y + 37, 9, '#999');
      if (c.signature) {
        pdf.img(c.signature, sxc - 50, y + 42, 100, 36);
        pdf.tC('Authorized Signature / \u0627\u0644\u062A\u0648\u0642\u064A\u0639', sxc, y + 84, 9, '#999');
      }
    }

    /* footer */
    y = CH - 45;
    pdf.hLine(CL, y, CCW, '#ddd', 1);
    y += 8;
    pdf.tL(c.name + (c.loc ? ' | ' + c.loc : ''), CL, y + 9, 10, ac);
    pdf.tR([c.tel ? 'Tel: ' + c.tel : '', c.email].filter(Boolean).join(' | '), RB, y + 9, 10, ac);
    if (c.bankName) {
      y += 14;
      var bStr = c.bankName;
      if (c.bankAcc) bStr += ' | A/c: ' + c.bankAcc;
      if (c.bankIban) bStr += ' | IBAN: ' + c.bankIban;
      pdf.tC(bStr, CW / 2, y + 9, 9, '#bbb');
    }

    return pdf;
  }

  /* ── Data readers ── */
  function _readInvData() {
    var c = getCo();
    var $ = function (id) { return document.getElementById(id); };
    var items = [];
    document.querySelectorAll('#invItems tr').forEach(function (r) {
      items.push({
        desc: (r.querySelector('._iDesc') || {}).value || '',
        qty: (r.querySelector('._iQty') || {}).value || '0',
        price: (r.querySelector('._iPrc') || {}).value || '0',
        amount: (r.querySelector('._iAmt') || {}).textContent || '0.000'
      });
    });
    return {
      company: c, invNo: $('invNo').value, date: $('invDate').value,
      customer: { name: $('custName').value, address: $('custAddr').value, phone: $('custPhone').value, cr: $('custCr').value, email: $('custEmail').value },
      items: items, subtotal: parseFloat($('invSubtotal').value) || 0,
      vatPct: parseFloat($('invVatPct').value) || 0, vatAmt: parseFloat($('invVatAmt').value) || 0,
      discount: parseFloat($('invDiscount').value) || 0, grand: parseFloat($('invGrand').value) || 0,
      notes: $('invNotes').value, payMethod: $('invPayMethod').value,
      payDetails: ($('invChequeNo') || {}).value || '', bankName: ($('invBankName') || {}).value || '',
      words: $('invWords').value
    };
  }

  function _readRecData() {
    var c = getCo();
    var $ = function (id) { return document.getElementById(id); };
    var amt = parseFloat($('recAmount').value) || 0;
    return {
      company: c, recNo: $('recNo').value, date: $('recDate').value,
      receivedFrom: $('recFrom').value, amount: amt,
      amountWords: $('recWords').value || (num2words(amt, c.currency) + ' only'),
      payMethod: $('recPayMethod').value, chequeNo: ($('recChequeNo') || {}).value || '',
      bankName: ($('recBankName') || {}).value || '', transDate: ($('recTransDate') || {}).value || '',
      being: $('recBeing').value, receiver: $('recReceiver').value, signatory: $('recSignatory').value
    };
  }

  function _mapInvDoc(doc, comp) {
    var c = comp || getCo();
    return {
      company: c, invNo: doc.invNo, date: doc.date, customer: doc.customer || {},
      items: doc.items || [], subtotal: doc.subtotal || 0, vatPct: doc.vatPct || 0,
      vatAmt: doc.vatAmt || 0, discount: doc.discount || 0, grand: doc.grand || 0,
      notes: doc.notes || '', payMethod: doc.payMethod || 'Cash',
      payDetails: doc.payDetails || '', bankName: doc.bankName || '', words: ''
    };
  }

  function _mapRecDoc(doc, comp) {
    var c = comp || getCo();
    var cur = c.currency;
    return {
      company: c, recNo: doc.recNo, date: doc.date, receivedFrom: doc.receivedFrom || '',
      amount: doc.amount || 0, amountWords: doc.amountWords || (num2words(doc.amount || 0, cur) + ' only'),
      payMethod: doc.payMethod || 'Cash', chequeNo: doc.chequeNo || '', bankName: doc.bankName || '',
      transDate: doc.transDate || '', being: doc.being || '', receiver: doc.receiver || '', signatory: doc.signatory || ''
    };
  }

  /* ── public API ── */
  function _dl(pdf, name) {
    _show('Preparing download\u2026');
    setTimeout(function () {
      try {
        var bytes = pdf.build();
        var blob = new Blob([bytes], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        _hide();
      } catch (e) { _hide(); alert('PDF error: ' + e.message); }
    }, 50);
  }

  window.downloadInvoicePDF = function () {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    _show('Generating PDF\u2026');
    setTimeout(function () {
      try {
        _dl(_renderInv(_readInvData()), 'invoice.pdf');
      } catch (e) { _hide(); alert('Error: ' + e.message); }
    }, 50);
  };

  window.downloadReceiptPDF = function () {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    _show('Generating PDF\u2026');
    setTimeout(function () {
      try {
        _dl(_renderRec(_readRecData()), 'receipt.pdf');
      } catch (e) { _hide(); alert('Error: ' + e.message); }
    }, 50);
  };

  window.downloadSavedDocPDF = function (type, id) {
    var c = getCo(); if (!c) { alert('No active company'); return; }
    var doc, data, name;
    if (type === 'inv') {
      doc = C.invoices.find(function (d) { return d.id === id; }); if (!doc) return;
      data = _mapInvDoc(doc, c); name = 'invoice-' + (doc.invNo || id) + '.pdf';
    } else {
      doc = C.receipts.find(function (d) { return d.id === id; }); if (!doc) return;
      data = _mapRecDoc(doc, c); name = 'receipt-' + (doc.recNo || id) + '.pdf';
    }
    _show('Generating PDF\u2026');
    setTimeout(function () {
      try {
        _dl(type === 'inv' ? _renderInv(data) : _renderRec(data), name);
      } catch (e) { _hide(); alert('Error: ' + e.message); }
    }, 50);
  };
})();
