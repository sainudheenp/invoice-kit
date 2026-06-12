/* ==========================================================
   INDEXEDDB WRAPPER — handles versioning & recovery
   ========================================================== */
var DB_NAME = 'DocGenDB';
var DB_VER  = 3;

var IDB = {
  _db: null,
  ready: null,

  /* open the database, auto-recover on version conflicts */
  open: function () {
    var self = this;
    self.ready = new Promise(function (resolve, reject) {

      function attempt(version) {
        var req = indexedDB.open(DB_NAME, version);

        req.onupgradeneeded = function (e) {
          var d = e.target.result;
          try {
            /* --- create stores (safe: only if missing) --- */
            if (!d.objectStoreNames.contains('companies')) {
              d.createObjectStore('companies', { keyPath: 'id' });
            }
            if (!d.objectStoreNames.contains('invoices')) {
              d.createObjectStore('invoices', { keyPath: 'id' });
            }
            if (!d.objectStoreNames.contains('receipts')) {
              d.createObjectStore('receipts', { keyPath: 'id' });
            }

            /* --- create indexes (safe-guarded) --- */
            try {
              var map = [
                { store: 'companies', idx: 'byName',   key: 'name' },
                { store: 'invoices',  idx: 'byCompany', key: 'companyId' },
                { store: 'receipts',  idx: 'byCompany', key: 'companyId' }
              ];
              map.forEach(function (cfg) {
                try {
                  var s = d.objectStore(cfg.store);
                  if (s && !s.indexNames.contains(cfg.idx)) {
                    s.createIndex(cfg.idx, cfg.key, { unique: false });
                  }
                } catch (_) { /* index may already exist */ }
              });
            } catch (_) { /* stores may not exist yet */ }
          } catch (err) {
            /* If the upgrade itself throws, the transaction will abort.
               We catch here to at least log, but the onerror below will fire. */
            console.warn('IDB upgrade warning:', err);
          }
        };

        req.onsuccess = function (e) {
          self._db = e.target.result;
          resolve();
        };

        req.onerror = function (e) {
          var err = e.target.error;
          /* If version conflict or corrupted schema → delete & retry fresh */
          if (err && (
            err.name === 'VersionError' ||
            /version/i.test(err.message) ||
            /aborted/i.test(err.message)
          )) {
            console.warn('IDB version conflict — resetting database');
            var del = indexedDB.deleteDatabase(DB_NAME);
            del.onsuccess = function () { attempt(1); };   /* start from v1 */
            del.onerror   = function () {
              reject(new Error('Cannot reset IndexedDB. Clear site data manually.'));
            };
            del.onblocked = function () {
              reject(new Error('Close other tabs using this site first.'));
            };
          } else {
            reject(err || new Error('IndexedDB open failed'));
          }
        };

        req.onblocked = function () {
          reject(new Error('Database blocked — close other tabs.'));
        };
      }

      attempt(DB_VER);
    });
    return self.ready;
  },

  /* -- CRUD helpers -- */
  _all: function (store) {
    var self = this;
    return self.ready.then(function () {
      return new Promise(function (res, rej) {
        var tx = self._db.transaction(store, 'readonly');
        var req = tx.objectStore(store).getAll();
        req.onsuccess = function (e) { res(e.target.result || []); };
        req.onerror   = function (e) { rej(e.target.error); };
      });
    });
  },

  _get: function (store, id) {
    var self = this;
    return self.ready.then(function () {
      return new Promise(function (res, rej) {
        var tx = self._db.transaction(store, 'readonly');
        var req = tx.objectStore(store).get(id);
        req.onsuccess = function (e) { res(e.target.result); };
        req.onerror   = function (e) { rej(e.target.error); };
      });
    });
  },

  _put: function (store, data) {
    var self = this;
    return self.ready.then(function () {
      return new Promise(function (res, rej) {
        var tx = self._db.transaction(store, 'readwrite');
        var req = tx.objectStore(store).put(data);
        req.onsuccess = function (e) { res(e.target.result); };
        req.onerror   = function (e) { rej(e.target.error); };
      });
    });
  },

  _del: function (store, id) {
    var self = this;
    return self.ready.then(function () {
      return new Promise(function (res, rej) {
        var tx = self._db.transaction(store, 'readwrite');
        var req = tx.objectStore(store).delete(id);
        req.onsuccess = function () { res(); };
        req.onerror   = function (e) { rej(e.target.error); };
      });
    });
  },

  /* wipe all stores and reset database */
  wipeAll: function () {
    var self = this;
    return self.ready.then(function () {
      return new Promise(function (res, rej) {
        var del = indexedDB.deleteDatabase(DB_NAME);
        del.onsuccess = function () { self._db = null; self.ready = null; res(); };
        del.onerror   = function (e) { rej(e.target.error); };
      });
    });
  }
};
