/* ==========================================================
   TEMPLATE REGISTRY — shared data extraction + dispatcher
   ========================================================== */

/* --- invoice data extraction --- */
window._getInvDocData = function (savedInv, compArg) {
  var comp = compArg || getCo();
  if (!comp) return null;
  var cur = comp.currency;
  var no, dt, dueDt, cust, addr, ph, cr_, em, notes, pm, ch, bk, disc, dts;
  var items, sub, vp, va, grand;

  if (savedInv) {
    no    = savedInv.invNo;
    dt    = savedInv.date;
    dueDt = savedInv.dueDate || '';
    cust  = (savedInv.customer && savedInv.customer.name) || '';
    addr  = (savedInv.customer && savedInv.customer.address) || '';
    ph    = (savedInv.customer && savedInv.customer.phone) || '';
    cr_   = (savedInv.customer && savedInv.customer.cr) || '';
    em    = (savedInv.customer && savedInv.customer.email) || '';
    notes = savedInv.notes || '';
    pm    = savedInv.payMethod || 'Cash';
    ch    = savedInv.payDetails || '';
    bk    = savedInv.bankName || '';
    disc  = savedInv.discount || 0;
    sub   = savedInv.subtotal || 0;
    vp    = savedInv.vatPct || 0;
    va    = savedInv.vatAmt || 0;
    grand = savedInv.grand || 0;
    items = savedInv.items || [];
    dts   = dt || new Date().toISOString().slice(0,10);
  } else {
    var $ = function (id) { return document.getElementById(id); };
    no    = $('invNo').value;
    dt    = $('invDate').value;
    dueDt = $('invDueDate').value;
    cust  = $('custName').value;
    addr  = $('custAddr').value;
    ph    = $('custPhone').value;
    cr_   = $('custCr').value;
    em    = $('custEmail').value;
    notes = $('invNotes').value;
    pm    = $('invPayMethod').value;
    ch    = ($('invChequeNo')  || {}).value || '';
    bk    = ($('invBankName')  || {}).value || '';
    disc  = parseFloat($('invDiscount').value) || 0;
    sub   = parseFloat($('invSubtotal').value) || 0;
    vp    = parseFloat($('invVatPct').value)   || 0;
    va    = parseFloat($('invVatAmt').value)   || 0;
    grand = parseFloat($('invGrand').value)    || 0;
    dts   = dt || new Date().toISOString().slice(0,10);
    items = [];
    document.querySelectorAll('#invItems tr').forEach(function (r) {
      items.push({
        desc: (r.querySelector('._iDesc') || {}).value || '',
        qty:  (r.querySelector('._iQty')  || {}).value || '0',
        price:(r.querySelector('._iPrc')  || {}).value || '0',
        amount:(r.querySelector('._iAmt') || {}).textContent || '0'
      });
    });
  }

  var dp = _dp(cur.subPer);
  return {
    comp: comp, cur: cur,
    no: no, dt: dts, dueDt: dueDt,
    cust: cust, addr: addr, ph: ph, cr: cr_, em: em,
    notes: notes, pm: pm, ch: ch, bk: bk,
    disc: disc, sub: sub, vp: vp, va: va, grand: grand,
    items: items, dp: dp,
    sv: sub.toFixed(dp), vv: va.toFixed(dp),
    dv: disc.toFixed(dp), gv: grand.toFixed(dp),
    gw: num2words(grand, cur) + ' only',
    pd: (pm || 'Cash') + (pm === 'Cheque' && ch ? ' / ' + ch : '') + (bk ? ' \u2014 ' + bk : '')
  };
};

/* --- receipt data extraction --- */
window._getRecDocData = function (savedRec, compArg) {
  var comp = compArg || getCo();
  if (!comp) return null;
  var cur = comp.currency;
  var no, dt, rf, am, ww, pm, ch, bk, td, bg, rv, sg, dts;
  if (savedRec) {
    no = savedRec.recNo;
    dt = savedRec.date;
    rf = savedRec.receivedFrom;
    am = savedRec.amount || 0;
    ww = savedRec.amountWords || (num2words(am, cur) + ' only');
    pm = savedRec.payMethod || 'Cash';
    ch = savedRec.chequeNo || '';
    bk = savedRec.bankName || '';
    td = savedRec.transDate || '';
    bg = savedRec.being || '';
    rv = savedRec.receiver || '';
    sg = savedRec.signatory || '';
    dts = dt || new Date().toISOString().slice(0,10);
  } else {
    var $ = function (id) { return document.getElementById(id); };
    no = $('recNo').value; dt = $('recDate').value;
    rf = $('recFrom').value; am = parseFloat($('recAmount').value) || 0;
    ww = num2words(am, comp.currency) + ' only';
    pm = $('recPayMethod').value; ch = ($('recChequeNo') || {}).value || '';
    bk = ($('recBankName') || {}).value || ''; td = ($('recTransDate') || {}).value || '';
    bg = $('recBeing').value; rv = $('recReceiver').value; sg = $('recSignatory').value;
    dts = dt || new Date().toISOString().slice(0, 10);
  }
  var pc = comp.pcolor || '#D97706';
  var ac = comp.acolor || '#78716C';
  var dp = _dp(cur.subPer);
  var wi = Math.floor(am);
  var fr = Math.round((am - wi) * cur.subPer);
  return {
    comp: comp, cur: cur, pc: pc, ac: ac,
    no: no, dt: dts,
    rf: rf, am: am, ww: ww, pm: pm,
    ch: ch, bk: bk, td: td,
    bg: bg, rv: rv, sg: sg,
    dp: dp, wi: wi, fr: fr,
    amFmt: am.toFixed(dp),
    chqHtml: (pm === 'Cheque' && ch ? ' / ' + esc(ch) : '')
  };
};

/* --- watermark overlay --- */
window._applyWatermark = function (html, text) {
  if (!text) return html;
  var wm = esc(text);
  var wmHtml = '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;z-index:999">' +
    '<div style="font-size:80px;font-weight:900;color:rgba(180,180,180,0.15);transform:rotate(-30deg);white-space:nowrap;letter-spacing:8px;text-transform:uppercase;user-select:none">' + wm + '</div></div>';
  var idx = html.lastIndexOf('</div>');
  if (idx === -1) return html;
  return html.slice(0, idx) + wmHtml + html.slice(idx);
};

/* --- sample data for preview --- */
window._sampleInvData = function (comp) {
  var cur = comp.currency;
  var dp = _dp(cur.subPer);
  var items = [
    { desc: 'Consulting Services — Q1 2026', qty: '40', price: '150', amount: (6000).toFixed(dp) },
    { desc: 'Software License — Annual Renewal', qty: '2', price: '1200', amount: (2400).toFixed(dp) },
    { desc: 'Professional Training Workshop', qty: '1', price: '850', amount: (850).toFixed(dp) }
  ];
  var sub = 9250, disc = 250, vp = 10, va = 900, grand = 9900;
  return {
    comp: comp, cur: cur,
    no: comp.invPref + '001', dt: '2026-06-15', dueDt: '2026-07-15',
    cust: 'ABC Trading LLC', addr: 'Building 42, Way 2501, Block 325', ph: '+968 2450 1234',
    cr: 'CR-1234567', em: 'info@abctrading.com',
    notes: 'Payment due within 30 days', pm: 'Bank Transfer', ch: '', bk: '',
    disc: disc, sub: sub, vp: vp, va: va, grand: grand,
    items: items, dp: dp,
    sv: sub.toFixed(dp), vv: va.toFixed(dp), dv: disc.toFixed(dp), gv: grand.toFixed(dp),
    gw: num2words(grand, cur) + ' only',
    pd: 'Bank Transfer'
  };
};

window._sampleRecData = function (comp) {
  var cur = comp.currency;
  var dp = _dp(cur.subPer);
  var am = 5500;
  var pc = comp.pcolor || '#D97706';
  var ac = comp.acolor || '#78716C';
  var wi = Math.floor(am);
  var fr = Math.round((am - wi) * cur.subPer);
  return {
    comp: comp, cur: cur, pc: pc, ac: ac,
    no: comp.recPref + '001', dt: '2026-06-15',
    rf: 'ABC Trading LLC', am: am,
    ww: num2words(am, cur) + ' only',
    pm: 'Cheque', ch: '123456', bk: 'Bank Muscat', td: '2026-06-15',
    bg: 'Payment for consulting services',
    rv: 'Ahmed Al Balushi', sg: '',
    dp: dp, wi: wi, fr: fr,
    amFmt: am.toFixed(dp),
    chqHtml: ' / 123456'
  };
};

/* --- preview renderer --- */
window._renderPreview = function (type, tplName) {
  var c = getCo(); if (!c) { showToast('No active company', 'err'); return; }
  var data = type === 'inv' ? window._sampleInvData(c) : window._sampleRecData(c);
  data.comp = JSON.parse(JSON.stringify(c));
  data.comp.watermark = '';
  var templates = type === 'inv' ? window._INV_TEMPLATES : window._REC_TEMPLATES;
  var fn = templates[tplName] || templates.classic;
  var html = fn(data);
  var modal = document.getElementById('previewModal');
  var area = document.getElementById('previewContent');
  if (!modal || !area) return;
  area.innerHTML = html;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window._closePreview = function () {
  var modal = document.getElementById('previewModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
};

/* --- dispatcher --- */
window._buildInvFromTemplate = function (savedInv, comp) {
  var data = window._getInvDocData(savedInv, comp);
  if (!data) return '';
  var tpl = data.comp.invTemplate || 'classic';
  var fn = window._INV_TEMPLATES[tpl];
  if (!fn) { fn = window._INV_TEMPLATES.classic; }
  var html = fn(data);
  return window._applyWatermark(html, data.comp.watermark);
};

window._buildRecFromTemplate = function (savedRec, comp) {
  var data = window._getRecDocData(savedRec, comp);
  if (!data) return '';
  var tpl = data.comp.recTemplate || 'classic';
  var fn = window._REC_TEMPLATES[tpl];
  if (!fn) { fn = window._REC_TEMPLATES.classic; }
  var html = fn(data);
  return window._applyWatermark(html, data.comp.watermark);
};
