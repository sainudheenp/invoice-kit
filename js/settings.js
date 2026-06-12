/* ==========================================================
   SETTINGS PANEL
   ========================================================== */
function populateSettings() {
  var c = getCo(); if (!c) return;
  var $ = function (id) { return document.getElementById(id); };
  document.getElementById('sidebarCompany').textContent = c.name;

  $('s_name').value     = c.name    || '';
  $('s_nameAr').value   = c.nameAr  || '';
  $('s_sub').value      = c.sub     || '';
  $('s_subAr').value    = c.subAr   || '';
  $('s_tel').value      = c.tel     || '';
  $('s_fax').value      = c.fax     || '';
  $('s_mob').value      = c.mob     || '';
  $('s_email').value    = c.email   || '';
  $('s_cr').value       = c.cr      || '';
  $('s_pobox').value    = c.pobox   || '';
  $('s_loc').value      = c.loc     || '';
  $('s_website').value  = c.website || '';
  $('s_pcolor').value   = c.pcolor  || '#1b4d3d';
  $('s_acolor').value   = c.acolor  || '#f5c842';

  $('s_curCode').value   = c.currency.code   || '';
  $('s_curSym').value    = c.currency.symbol  || '';
  $('s_curName').value   = c.currency.name    || '';
  $('s_curNamePl').value = c.currency.namePl  || '';
  $('s_curSub').value    = c.currency.sub     || '';
  $('s_curSubPl').value  = c.currency.subPl   || '';
  $('s_curSubPer').value = c.currency.subPer  || 100;

  $('s_vatReg').value  = c.vatReg  || '';
  $('s_vatPct').value  = c.vatPct  || 0;

  $('s_bankName').value    = c.bankName    || '';
  $('s_bankAccName').value = c.bankAccName || '';
  $('s_bankAcc').value     = c.bankAcc     || '';
  $('s_bankIban').value    = c.bankIban    || '';
  $('s_bankSwift').value   = c.bankSwift   || '';
  $('s_bankBranch').value  = c.bankBranch  || '';

  $('s_invPref').value  = c.invPref  || 'INV-';
  $('s_invNext').value  = c.invNext  || 1;
  $('s_recPref').value  = c.recPref  || 'RV-';
  $('s_recNext').value  = c.recNext  || 1;

  $('s_invNotes').value  = c.invNotes  || '';
  $('s_invTerms').value  = c.invTerms  || '';
  $('s_invFooter').value = c.invFooter || '';
  $('s_recBeing').value  = c.recBeing  || '';

  _previewImg('logoPrev', c.logo, 'No logo');
  _previewImg('sealPrev', c.seal, 'No seal');
  _previewImg('sigPrev',  c.signature, 'No signature');
}

function _previewImg(id, data, placeholder) {
  var el = document.getElementById(id);
  if (data && data.length > 10) {
    el.innerHTML = '<img src="' + data.replace(/"/g, '&quot;') + '" alt="">';
  } else {
    el.textContent = placeholder;
    el.style.cssText = 'width:70px;height:70px;border:2px dashed #ccc;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#999;text-align:center;padding:2px;overflow:hidden;flex-shrink:0';
  }
}

function saveCompany() {
  var c = getCo(); if (!c) return;
  var $ = function (id) { return document.getElementById(id).value; };

  c.name     = $('s_name');     c.nameAr  = $('s_nameAr');
  c.sub      = $('s_sub');     c.subAr   = $('s_subAr');
  c.tel      = $('s_tel');     c.fax     = $('s_fax');
  c.mob      = $('s_mob');     c.email   = $('s_email');
  c.cr       = $('s_cr');      c.pobox   = $('s_pobox');
  c.loc      = $('s_loc');     c.website = $('s_website');
  c.pcolor   = document.getElementById('s_pcolor').value || '#1b4d3d';
  c.acolor   = document.getElementById('s_acolor').value || '#f5c842';

  c.currency.code   = $('s_curCode');
  c.currency.symbol = $('s_curSym');
  c.currency.name   = $('s_curName');
  c.currency.namePl = $('s_curNamePl');
  c.currency.sub    = $('s_curSub');
  c.currency.subPl  = $('s_curSubPl');
  c.currency.subPer = parseInt($('s_curSubPer')) || 100;

  c.vatReg = $('s_vatReg'); c.vatPct = parseFloat($('s_vatPct')) || 0;

  c.bankName    = $('s_bankName');
  c.bankAccName = $('s_bankAccName');
  c.bankAcc     = $('s_bankAcc');
  c.bankIban    = $('s_bankIban');
  c.bankSwift   = $('s_bankSwift');
  c.bankBranch  = $('s_bankBranch');

  c.invPref = $('s_invPref'); c.invNext = parseInt($('s_invNext')) || 1;
  c.recPref = $('s_recPref'); c.recNext = parseInt($('s_recNext')) || 1;

  c.invNotes  = $('s_invNotes');
  c.invTerms  = $('s_invTerms');
  c.invFooter = $('s_invFooter');
  c.recBeing  = $('s_recBeing');

  c.updatedAt = Date.now();

  var idx = C.companies.findIndex(function (x) { return x.id === c.id; });
  if (idx >= 0) C.companies[idx] = c;
  persist('companies', c);
  _refreshCoList();
  setStatus('Settings saved');
}

function applyCurrencyPreset() {
  var v = document.getElementById('s_currencyPreset').value;
  if (v === 'CUSTOM' || !CUR_PRESETS[v]) return;
  var p = CUR_PRESETS[v];
  document.getElementById('s_curCode').value   = p.code;
  document.getElementById('s_curSym').value    = p.symbol;
  document.getElementById('s_curName').value   = p.name;
  document.getElementById('s_curNamePl').value = p.namePl;
  document.getElementById('s_curSub').value    = p.sub;
  document.getElementById('s_curSubPl').value  = p.subPl;
  document.getElementById('s_curSubPer').value = p.subPer;
}

/* --- file uploads --- */
function uploadFile(field, el) {
  var file = el.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    var c = getCo(); if (!c) return;
    c[field] = e.target.result;
    _previewImg(field + 'Prev', c[field], '');
    persist('companies', c);
    setStatus(field + ' uploaded');
  };
  reader.readAsDataURL(file);
}

function uploadSvgLogo() {
  var svg = prompt('Paste SVG code:');
  if (!svg) return;
  var c = getCo(); if (!c) return;
  c.logo = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  _previewImg('logoPrev', c.logo, '');
  persist('companies', c);
  setStatus('SVG logo saved');
}

function clearLogo() {
  var c = getCo(); if (!c) return;
  c.logo = '';
  _previewImg('logoPrev', '', 'No logo');
  persist('companies', c);
}
function clearSeal() {
  var c = getCo(); if (!c) return;
  c.seal = '';
  _previewImg('sealPrev', '', 'No seal');
  persist('companies', c);
}
function clearSig() {
  var c = getCo(); if (!c) return;
  c.signature = '';
  _previewImg('sigPrev', '', 'No signature');
  persist('companies', c);
}

/* --- company bar --- */
function _refreshCoList() {
  var sel = document.getElementById('companySelect');
  sel.innerHTML = '';
  C.companies.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c.id;
    o.textContent = c.name;
    sel.appendChild(o);
  });
  if (C.companies.some(function (c) { return c.id === C.activeId; }))
    sel.value = C.activeId;
}

function switchCompany(id) {
  C.activeId = id;
  sessionStorage.setItem('dg_activeId', id);
  populateSettings();
}

function newCompany() {
  var c = defCo();
  c.name = 'New Company ' + (C.companies.length + 1);
  c.nameAr = 'شركة ' + (C.companies.length + 1);
  C.companies.push(c);
  C.activeId = c.id;
  persist('companies', c);
  _refreshCoList();
  populateSettings();
  setStatus('Company created');
}

function deleteCompany() {
  if (C.companies.length <= 1) { setStatus('Cannot delete the only company', 'err'); return; }
  if (!confirm('Delete this company and all its documents?')) return;
  var id = C.activeId;
  C.companies = C.companies.filter(function (c) { return c.id !== id; });
  C.invoices  = C.invoices.filter(function (i) { return i.companyId !== id; });
  C.receipts  = C.receipts.filter(function (r) { return r.companyId !== id; });
  removePersist('companies', id);
  C.activeId = C.companies[0].id;
  persist('companies', C.companies[0]);
  _refreshCoList();
  populateSettings();
  setStatus('Company deleted');
}

/* --- export / import --- */
function exportData() {
  var blob = new Blob([JSON.stringify(C, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'company_data_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  setStatus('Exported');
}

function importData(ev) {
  var file = ev.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var d = JSON.parse(e.target.result);
      if (!d.companies || !Array.isArray(d.companies)) { setStatus('Invalid file', 'err'); return; }
      C.companies = d.companies || [];
      C.invoices  = d.invoices  || [];
      C.receipts  = d.receipts  || [];
      C.activeId  = d.activeId  || (C.companies.length ? C.companies[0].id : null);
      var all = C.companies.map(function (c)  { return persist('companies', c); })
        .concat(C.invoices.map(function (i)   { return persist('invoices', i); }))
        .concat(C.receipts.map(function (r)   { return persist('receipts', r); }));
      Promise.all(all).then(function () {
        _refreshCoList(); populateSettings(); setStatus('Imported!');
      });
    } catch (err) { setStatus('Import error: ' + err.message, 'err'); }
  };
  reader.readAsText(file);
}

function setStatus(msg, type) {
  var el = document.getElementById('settingsStatus');
  el.textContent = msg;
  el.className = 'status-bar ' + (type === 'err' ? 'err' : 'ok');
  if (msg) setTimeout(function () { el.className = 'status-bar'; el.textContent = ''; }, 3000);
}

/* ===========================================================
   RESET / DANGER ZONE
   =========================================================== */
function showResetConfirm() {
  var c = getCo();
  document.getElementById('resetConfirmName').textContent = c ? c.name : '(no company)';
  document.getElementById('resetConfirmInput').value = '';
  document.getElementById('resetError').style.display = 'none';
  document.getElementById('resetConfirmBtn').disabled = true;
  document.getElementById('resetModal').style.display = 'flex';
  document.getElementById('resetConfirmInput').focus();
}

function hideResetConfirm() {
  document.getElementById('resetModal').style.display = 'none';
}

/* listen for matching input */
(function () {
  var inp = document.getElementById('resetConfirmInput');
  if (inp) inp.addEventListener('input', function () {
    var c = getCo();
    var match = c && this.value.trim() === c.name;
    document.getElementById('resetConfirmBtn').disabled = !match;
    document.getElementById('resetError').style.display = match ? 'none' : 'block';
  });
})();

function executeReset() {
  var c = getCo();
  var entered = document.getElementById('resetConfirmInput').value.trim();
  if (!c || entered !== c.name) {
    document.getElementById('resetError').style.display = 'block';
    return;
  }
  hideResetConfirm();

  IDB.wipeAll().then(function () {
    /* reset in-memory cache */
    C.companies = [];
    C.invoices  = [];
    C.receipts  = [];
    C.activeId  = null;
    sessionStorage.removeItem('dg_activeId');

    /* hide app, show welcome */
    document.getElementById('appRoot').style.display = 'none';
    document.getElementById('welcomeOverlay').classList.remove('hidden');

    /* reopen DB fresh for next use */
    IDB._db = null;
    IDB.ready = null;
    return IDB.open();
  }).then(function () {
    /* clear any stale form state */
    document.getElementById('setupName').value = '';
    document.getElementById('setupName').focus();
    document.getElementById('setupError').style.display = 'none';
    document.getElementById('loader').style.display = 'none';
  }).catch(function (err) {
    alert('Reset error: ' + err.message + ' — try clearing site data manually.');
  });
}
