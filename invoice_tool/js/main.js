/* ============================================================
   PAGE SWITCHING
   ============================================================ */
function switchPage(name) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-bar button').forEach(function (b) { b.classList.remove('active'); });
  var page = document.getElementById(name + 'Page');
  if (page) page.classList.add('active');
  var btn = document.querySelector('.tab-bar button[data-page="' + name + '"]');
  if (btn) btn.classList.add('active');
  if (name === 'dashboard') refreshDashboard();
  if (name === 'invoice')   refreshInv();
  if (name === 'receipt')   refreshRec();
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function refreshDashboard() {
  var c = getCo();
  document.getElementById('dashCompanies').textContent = C.companies.length;
  document.getElementById('dashInvoices').textContent  = C.invoices.filter(function (i) { return i.companyId === C.activeId; }).length;
  document.getElementById('dashReceipts').textContent   = C.receipts.filter(function (r) { return r.companyId === C.activeId; }).length;

  var el = document.getElementById('dashCompany');
  if (c) {
    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
      (c.logo ? '<img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:56px;max-height:56px;object-fit:contain;border-radius:8px">' : '') +
      '<div><div style="font-weight:700;font-size:16px;color:var(--primary)">' + esc(c.name) + '</div>' +
      '<div style="font-size:13px;color:var(--muted)">' + esc(c.sub) + '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:4px">' +
      (c.tel ? 'Tel: ' + c.tel : '') + (c.email ? ' | Email: ' + c.email : '') +
      '</div></div></div>';

    if (c.currency) {
      document.getElementById('invCurrencyLabel').textContent = c.currency.code + ' ' + c.currency.symbol;
      document.getElementById('recCurrencyLabel').textContent = c.currency.code + ' ' + c.currency.symbol;
    }
  } else {
    el.innerHTML = '<p style="color:var(--muted)">No company selected. Go to Settings to create one.</p>';
  }

  var hdr = document.getElementById('headerCompany');
  hdr.textContent = c ? c.name : 'No company';
}

/* ============================================================
   EVENT BINDINGS
   ============================================================ */
document.getElementById('invPayMethod').addEventListener('change', function () {
  toggleInvFields(); calcInv();
});
document.getElementById('recPayMethod').addEventListener('change', toggleRecFields);
document.getElementById('recAmount').addEventListener('input', calcRecWords);

/* ============================================================
   INIT
   ============================================================ */
IDB.open().then(function () {
  return loadAllFromDB();
}).then(function () {
  if (C.companies.length === 0) {
    var d = defCo();
    C.companies.push(d);
    C.activeId = d.id;
    persist('companies', d);
  }

  _refreshCoList();
  document.getElementById('loader').style.display = 'none';
  document.getElementById('appContent').style.display = 'block';
  populateSettings();
  addInvRow();
  addInvRow();
  refreshInv();
  refreshRec();
  refreshDashboard();
}).catch(function (err) {
  document.getElementById('loader').innerHTML =
    '<div style="color:#c62828;font-size:15px;font-weight:600;margin-bottom:8px">Database Error</div>' +
    '<p style="color:#666;font-size:13px;max-width:400px">' + err.message + '</p>' +
    '<p style="margin-top:16px;font-size:12px;color:#888">Try clearing site data or using a modern browser.</p>';
});
