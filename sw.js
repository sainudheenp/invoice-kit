/* invoicekit service worker — caches app shell for offline install */
var CACHE = 'invoicekit-v1';
var URLS = [
  'app.html',
  'index.html',
  'manifest.json',
  'css/style.css',
  'js/db.js',
  'js/data.js',
  'js/icons.js',
  'js/settings.js',
  'js/invoice.js',
  'js/receipt.js',
  'js/history.js',
  'js/main.js',
  'js/pdf.js',
  'lib/jspdf.umd.min.js',
  'lib/html2canvas.min.js',
  'icons/icon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return r || fetch(e.request).then(function (res) {
        return caches.open(CACHE).then(function (c) {
          c.put(e.request, res.clone());
          return res;
        });
      });
    })
  );
});
