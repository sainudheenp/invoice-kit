/* ==========================================================
   DATA LAYER — in-memory cache + persist helpers
   ========================================================== */
var C = {
  companies: [],
  invoices:  [],
  receipts:  [],
  activeId:  null
};

/* unique id */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* persist one record to IndexedDB (fire & forget) */
function persist(store, data) {
  IDB._put(store, data).catch(function (e) {
    console.warn('IDB write error:', e);
  });
}

/* remove one record */
function removePersist(store, id) {
  IDB._del(store, id).catch(function (e) {
    console.warn('IDB delete error:', e);
  });
}

/* load everything from IndexedDB into C */
function loadAllFromDB() {
  return IDB._all('companies').then(function (list) {
    C.companies = list;
    return IDB._all('invoices');
  }).then(function (list) {
    C.invoices = list;
    return IDB._all('receipts');
  }).then(function (list) {
    C.receipts = list;
    /* restore active company from sessionStorage */
    var saved = sessionStorage.getItem('dg_activeId');
    if (saved && C.companies.some(function (c) { return c.id === saved; })) {
      C.activeId = saved;
    } else if (C.companies.length) {
      C.activeId = C.companies[0].id;
    } else {
      C.activeId = null;
    }
  });
}

/* get active company object */
function getCo() {
  if (!C.activeId && C.companies.length) C.activeId = C.companies[0].id;
  if (!C.activeId) return null;
  var co = C.companies.find(function (c) { return c.id === C.activeId; });
  if (!co && C.companies.length) {
    C.activeId = C.companies[0].id;
    return C.companies[0];
  }
  return co || null;
}

/* ==========================================================
   CURRENCY PRESETS
   ========================================================== */
var CUR_PRESETS = {
  OMR: { code:'OMR', symbol:'ر.ع.', name:'Omani Rial', namePl:'Omani Rials', sub:'Baisa', subPl:'Baisa', subPer:1000 },
  USD: { code:'USD', symbol:'$',    name:'US Dollar',  namePl:'US Dollars',  sub:'Cent',  subPl:'Cents', subPer:100 },
  EUR: { code:'EUR', symbol:'€',    name:'Euro',       namePl:'Euros',       sub:'Cent',  subPl:'Cents', subPer:100 },
  GBP: { code:'GBP', symbol:'£',    name:'Pound Sterling', namePl:'Pounds Sterling', sub:'Pence', subPl:'Pence', subPer:100 },
  SAR: { code:'SAR', symbol:'﷼',    name:'Saudi Riyal',namePl:'Saudi Riyals', sub:'Halala',subPl:'Halalas', subPer:100 },
  AED: { code:'AED', symbol:'د.إ',  name:'UAE Dirham', namePl:'UAE Dirhams', sub:'Fils',  subPl:'Fils', subPer:100 },
  KWD: { code:'KWD', symbol:'د.ك',  name:'Kuwaiti Dinar', namePl:'Kuwaiti Dinars', sub:'Fils', subPl:'Fils', subPer:1000 },
  QAR: { code:'QAR', symbol:'﷼',    name:'Qatari Riyal', namePl:'Qatari Riyals', sub:'Dirham', subPl:'Dirhams', subPer:100 },
  BHD: { code:'BHD', symbol:'د.ب',  name:'Bahraini Dinar', namePl:'Bahraini Dinars', sub:'Fils', subPl:'Fils', subPer:1000 },
  EGP: { code:'EGP', symbol:'ج.م',  name:'Egyptian Pound', namePl:'Egyptian Pounds', sub:'Piastre', subPl:'Piastres', subPer:100 }
};

/* ==========================================================
   NUMBER → WORDS (multi-currency)
   ========================================================== */
var _ONES = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
             'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
var _TENS = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

function _h(n) {
  if (n === 0) return '';
  var s = '';
  if (n >= 100) { s += _ONES[Math.floor(n/100)] + ' Hundred '; n %= 100; }
  if (n >= 20)  { s += _TENS[Math.floor(n/10)] + ' '; n %= 10; if (n) s += _ONES[n] + ' '; }
  else if (n)   { s += _ONES[n] + ' '; }
  return s;
}

function _t(n) {
  if (n === 0) return 'Zero';
  var s = '';
  if (n >= 1000) { s += _h(Math.floor(n/1000)) + 'Thousand '; n %= 1000; }
  s += _h(n);
  return s.trim();
}

function num2words(num, cur) {
  if (isNaN(num) || num < 0) return 'Zero ' + cur.name;
  var w = Math.floor(num);
  var f = Math.round((num - w) * cur.subPer);
  if (f >= cur.subPer) { w += 1; f = 0; }
  var ww = _t(w).trim() || 'Zero';
  var ff = f > 0 ? (_t(f).trim() || 'Zero') : '';
  var r = ww + ' ' + (w === 1 ? cur.name : cur.namePl);
  if (f > 0) r += ' and ' + ff + ' ' + (f === 1 ? cur.sub : cur.subPl);
  return r;
}

/* ==========================================================
   DEFAULT COMPANY
   ========================================================== */
function defCo(name) {
  var now = Date.now();
  return {
    id: uid(),
    name: name || 'My Company', nameAr:'',
    sub:'', subAr:'',
    tel:'', fax:'', mob:'',
    cr:'', pobox:'', loc:'',
    email:'', website:'',
    logo:'', seal:'', signature:'',
    pcolor:'#D97706', acolor:'#78716C',
    currency: JSON.parse(JSON.stringify(CUR_PRESETS.OMR)),
    vatReg:'', vatPct:0,
    bankName:'', bankAccName:'', bankAcc:'', bankIban:'', bankSwift:'', bankBranch:'',
    invPref:'INV-', invNext:1, recPref:'RV-', recNext:1,
    invNotes:'', invTerms:'', invFooter:'', recBeing:'',
    createdAt: now, updatedAt: now
  };
}

/* ==========================================================
   ESCAPE HTML
   ========================================================== */
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
