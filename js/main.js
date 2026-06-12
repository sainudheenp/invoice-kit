/* ============================================================
   PAGE SWITCHING
   ============================================================ */
function switchPage(name) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.sidebar-nav button').forEach(function (b) { b.classList.remove('active'); });
  var page = document.getElementById(name + 'Page');
  if (page) page.classList.add('active');
  var btn = document.querySelector('.sidebar-nav button[data-page="' + name + '"]');
  if (btn) btn.classList.add('active');
  if (name === 'dashboard') refreshDashboard();
  if (name === 'invoice')   refreshInv();
  if (name === 'receipt')   refreshRec();
  if (name === 'history')   renderHistory();
}

/* ============================================================
   SETUP / ONBOARDING
   ============================================================ */
function completeSetup() {
  var name = document.getElementById('setupName').value.trim();
  if (!name) {
    document.getElementById('setupError').style.display = 'block';
    document.getElementById('setupName').focus();
    return;
  }
  document.getElementById('setupError').style.display = 'none';
  var curVal = document.getElementById('setupCurrency').value;
  var cur = CUR_PRESETS[curVal] || CUR_PRESETS.OMR;
  var c = defCo(name);
  c.nameAr   = document.getElementById('setupNameAr').value.trim();
  c.sub      = document.getElementById('setupSub').value.trim();
  c.subAr    = document.getElementById('setupSubAr').value.trim();
  c.tel      = document.getElementById('setupTel').value.trim();
  c.mob      = document.getElementById('setupMob').value.trim();
  c.email    = document.getElementById('setupEmail').value.trim();
  c.cr       = document.getElementById('setupCr').value.trim();
  c.loc      = document.getElementById('setupLoc').value.trim();
  c.currency = JSON.parse(JSON.stringify(cur));
  C.companies.push(c);
  C.activeId = c.id;
  persist('companies', c);
  sessionStorage.setItem('dg_activeId', c.id);
  enterApp();
}

function enterApp() {
  document.getElementById('welcomeOverlay').classList.add('hidden');
  document.getElementById('appRoot').style.display = 'flex';
  _refreshCoList();
  populateSettings();
  addInvRow();
  addInvRow();
  refreshInv();
  refreshRec();
  refreshDashboard();
  switchPage('dashboard');
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function refreshDashboard() {
  var c = getCo();

  var statsHtml =
    '<div class="stat-card"><div class="stat-icon indigo">🏢</div><div><div class="stat-num">' + C.companies.length + '</div><div class="stat-lbl">Companies</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon green">📄</div><div><div class="stat-num">' + C.invoices.filter(function (i) { return i.companyId === C.activeId; }).length + '</div><div class="stat-lbl">Invoices</div></div></div>' +
    '<div class="stat-card"><div class="stat-icon amber">🧾</div><div><div class="stat-num">' + C.receipts.filter(function (r) { return r.companyId === C.activeId; }).length + '</div><div class="stat-lbl">Receipts</div></div></div>';
  document.getElementById('dashStats').innerHTML = statsHtml;

  var badge = document.getElementById('dashCurrencyBadge');
  if (c && c.currency) badge.textContent = c.currency.code + ' ' + c.currency.symbol;

  var el = document.getElementById('dashCompany');
  if (c) {
    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
      (c.logo ? '<img src="' + c.logo.replace(/"/g,'&quot;') + '" style="max-width:56px;max-height:56px;object-fit:contain;border-radius:8px">' : '') +
      '<div><div style="font-weight:700;font-size:16px;color:var(--text)">' + esc(c.name) + '</div>' +
      '<div style="font-size:13px;color:var(--text2)">' + esc(c.sub) + '</div>' +
      '<div style="font-size:12px;color:var(--text2);margin-top:4px">' +
      (c.tel ? 'Tel: ' + c.tel : '') + (c.email ? ' | Email: ' + c.email : '') +
      '</div></div></div>';
    if (c.currency) {
      document.getElementById('invCurrencyLabel').textContent = c.currency.code + ' ' + c.currency.symbol;
      document.getElementById('recCurrencyLabel').textContent = c.currency.code + ' ' + c.currency.symbol;
    }
  } else {
    el.innerHTML = '<p style="color:var(--text2)">No company selected. Go to Settings to create one.</p>';
  }

  document.getElementById('sidebarCompany').textContent = c ? c.name : 'No company';
}

/* ============================================================
   EVENT BINDINGS
   ============================================================ */
document.getElementById('invPayMethod').addEventListener('change', function () {
  toggleInvFields(); calcInv();
});
document.getElementById('recPayMethod').addEventListener('change', toggleRecFields);
document.getElementById('recAmount').addEventListener('input', calcRecWords);
document.getElementById('setupName').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') completeSetup();
});

/* ============================================================
   WELCOME IMPORT
   ============================================================ */
function welcomeImportData() {
  document.getElementById('welcomeImportInput').value = '';
  document.getElementById('welcomeImportInput').click();
}

function handleWelcomeImport(ev) {
  var file = ev.target.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var d = JSON.parse(e.target.result);
      if (!d.companies && !d.invoices && !d.receipts) {
        var errEl = document.getElementById('setupError');
        errEl.textContent = 'Not a valid backup file.';
        errEl.style.display = 'block';
        return;
      }
      fullRestore(d).then(function () {
        sessionStorage.setItem('dg_activeId', C.activeId);
        enterApp();
      });
    } catch (err) {
      var errEl = document.getElementById('setupError');
      errEl.textContent = 'Import error: ' + err.message;
      errEl.style.display = 'block';
    }
  };
  reader.readAsText(file);
}

/* ============================================================
   INIT
   ============================================================ */
IDB.open().then(function () {
  return loadAllFromDB();
}).then(function () {
  document.getElementById('loader').style.display = 'none';
  if (C.companies.length > 0) {
    if (!C.activeId || !C.companies.some(function (c) { return c.id === C.activeId; })) {
      C.activeId = C.companies[0].id;
    }
    enterApp();
  }
}).catch(function (err) {
  document.getElementById('loader').innerHTML =
    '<div style="color:#DC2626;font-size:15px;font-weight:600;margin-bottom:8px">Database Error</div>' +
    '<p style="color:#6B7270;font-size:13px;max-width:400px">' + err.message + '</p>' +
    '<p style="margin-top:16px;font-size:12px;color:#9CA3A2">Try clearing site data or using a modern browser.</p>';
});
