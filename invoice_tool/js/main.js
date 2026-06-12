/* ==========================================================
   TAB SWITCHING
   ========================================================== */
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav button').forEach(function (b) { b.classList.remove('active'); });
  document.getElementById(name + 'Panel').classList.add('active');
  var btnId = 'tab' + name.charAt(0).toUpperCase() + name.slice(1) + 'Btn';
  document.getElementById(btnId).classList.add('active');
  if (name === 'invoice') refreshInv();
  if (name === 'receipt')  refreshRec();
}

/* ==========================================================
   EVENT BINDINGS
   ========================================================== */
document.getElementById('invPayMethod').addEventListener('change', function () {
  toggleInvFields(); calcInv();
});
document.getElementById('recPayMethod').addEventListener('change', toggleRecFields);
document.getElementById('recAmount').addEventListener('input', calcRecWords);

/* ==========================================================
   INIT
   ========================================================== */
IDB.open().then(function () {
  return loadAllFromDB();
}).then(function () {
  /* ensure at least one company */
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
}).catch(function (err) {
  document.getElementById('loader').innerHTML =
    '<p style="color:#c62828;font-size:14px">Error: ' + err.message +
    '</p><p style="margin-top:12px;font-size:12px;color:#666">Try clearing site data or use a modern browser.</p>';
});
