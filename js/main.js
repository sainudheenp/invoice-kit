/* ============================================================
   SIDEBAR TOGGLE (mobile)
   ============================================================ */
function toggleSidebar() {
  var s = document.querySelector('.sidebar');
  var b = document.getElementById('sidebarBackdrop');
  var h = document.getElementById('hamburgerBtn');
  s.classList.toggle('open');
  b.classList.toggle('show');
  h.classList.toggle('open');
  h.innerHTML = s.classList.contains('open') ? icon('close') : icon('menu');
}
function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('show');
  document.getElementById('hamburgerBtn').classList.remove('open');
  document.getElementById('hamburgerBtn').innerHTML = icon('menu');
}

/* ============================================================
   PAGE SWITCHING
   ============================================================ */
function switchPage(name) {
  closeSidebar();
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
  /* update URL hash */
  if (location.hash !== '#/' + name) history.pushState(null, '', '#/' + name);
}

/* restore page from URL hash on back/forward */
window.addEventListener('popstate', function () {
  var page = location.hash.replace('#/', '') || 'dashboard';
  if (document.getElementById(page + 'Page')) switchPage(page);
});

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
  /* restore page from URL hash, default to dashboard */
  var initPage = location.hash.replace('#/', '') || 'dashboard';
  if (!document.getElementById(initPage + 'Page')) initPage = 'dashboard';
  switchPage(initPage);
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function refreshDashboard() {
  var c = getCo();

  var statsHtml =
    '<div class="stat-card"><div class="stat-inner"><div class="stat-icon indigo">' + icon('building') + '</div><div class="stat-info"><div class="stat-num">' + C.companies.length + '</div><div class="stat-lbl">Companies</div></div></div><span class="stat-bar indigo"></span></div>' +
    '<div class="stat-card"><div class="stat-inner"><div class="stat-icon green">' + icon('file') + '</div><div class="stat-info"><div class="stat-num">' + C.invoices.filter(function (i) { return i.companyId === C.activeId; }).length + '</div><div class="stat-lbl">Invoices</div></div></div><span class="stat-bar green"></span></div>' +
    '<div class="stat-card"><div class="stat-inner"><div class="stat-icon amber">' + icon('receipt') + '</div><div class="stat-info"><div class="stat-num">' + C.receipts.filter(function (r) { return r.companyId === C.activeId; }).length + '</div><div class="stat-lbl">Receipts</div></div></div><span class="stat-bar amber"></span></div>';
  document.getElementById('dashStats').innerHTML = statsHtml;

  var badge = document.getElementById('dashCurrencyBadge');
  if (c && c.currency) badge.textContent = c.currency.code + ' ' + c.currency.symbol;

  var el = document.getElementById('dashCompany');
  if (c) {
    el.innerHTML =
      '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">' +
      (c.logo ? '<div style="flex-shrink:0"><img src="' + c.logo.replace(/"/g,'&quot;') + '" style="width:60px;height:60px;object-fit:contain;border-radius:12px;border:1px solid var(--border);padding:4px;background:var(--bg)"></div>' : '<div style="width:60px;height:60px;border-radius:12px;border:1px solid var(--border);background:var(--primary-bg);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:24px;font-weight:800;color:var(--primary)">' + (c.name ? c.name.charAt(0).toUpperCase() : '?') + '</span></div>') +
      '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:17px;color:var(--text)">' + esc(c.name) + '</div>' +
      (c.sub ? '<div style="font-size:13px;color:var(--text2);margin-top:1px">' + esc(c.sub) + '</div>' : '') +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:6px;font-size:12px;color:var(--text3)">' +
      (c.tel ? '<span style="display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' + esc(c.tel) + '</span>' : '') +
      (c.email ? '<span style="display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' + esc(c.email) + '</span>' : '') +
      (c.loc ? '<span style="display:flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' + esc(c.loc) + '</span>' : '') +
      '</div></div></div>';
    if (c.currency) {
      document.getElementById('invCurrencyLabel').textContent = c.currency.code + ' ' + c.currency.symbol;
      document.getElementById('recCurrencyLabel').textContent = c.currency.code + ' ' + c.currency.symbol;
    }
  } else {
    el.innerHTML = '<div style="text-align:center;padding:16px 0"><div style="font-size:40px;margin-bottom:10px;opacity:.3">' + icon('building') + '</div><p style="color:var(--text2);font-size:14px">No company selected.</p><p style="color:var(--text3);font-size:12px;margin-top:4px">Go to Settings to create one.</p></div>';
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
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', function (e) {
  var ctrl = e.ctrlKey || e.metaKey;
  if (!ctrl) return;
  var tag = (e.target || {}).tagName || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  var activePage = document.querySelector('.page.active');
  if (!activePage) return;
  var id = activePage.id;
  if ((e.key === 'Enter' || e.key === 's') && id === 'invoicePage') {
    e.preventDefault(); saveInvoice();
  } else if ((e.key === 'Enter' || e.key === 's') && id === 'receiptPage') {
    e.preventDefault(); saveReceipt();
  } else if (e.key === 'n') {
    e.preventDefault(); switchPage('invoice');
  } else if (e.key === 'r') {
    e.preventDefault(); switchPage('receipt');
  } else if (e.key === 'd') {
    e.preventDefault(); switchPage('dashboard');
  } else if (e.key === 'h') {
    e.preventDefault(); switchPage('history');
  }
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
   DIRTY FORM TRACKING — mark dirty on any input/change
   ============================================================ */
document.getElementById('appRoot').addEventListener('change', function (e) {
  var tag = (e.target || {}).tagName || '';
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') markFormDirty();
});
document.getElementById('appRoot').addEventListener('input', function (e) {
  var tag = (e.target || {}).tagName || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA') markFormDirty();
});

/* ============================================================
   BEFOREUNLOAD — warn when form is dirty
   ============================================================ */
window.addEventListener('beforeunload', function (e) {
  if (!_formDirty) return;
  e.preventDefault();
  e.returnValue = '';
});

/* ============================================================
   INIT
   ============================================================ */
IDB.open().then(function () {
  return loadAllFromDB();
}).then(function () {
  document.getElementById('loader').style.display = 'none';
  try { localStorage.setItem('_visited', '1'); } catch(e) {} /* mark visited for SEO landing redirect */
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
