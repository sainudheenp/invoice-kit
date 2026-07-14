var CACHE = 'invoicekit-v3'
var SHELL = [
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL)
    }).then(function () {
      return self.skipWaiting()
    }).catch(function () {})
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE }).map(function (k) { return caches.delete(k) })
      )
    }).then(function () {
      return self.clients.claim()
    })
  )
})

self.addEventListener('fetch', function (e) {
  var req = e.request
  if (req.method !== 'GET') return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone()
        caches.open(CACHE).then(function (c) { c.put(req, copy) })
        return res
      }).catch(function () {
        return caches.match('/index.html')
      })
    )
    return
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) {
        fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone()
            caches.open(CACHE).then(function (c) { c.put(req, copy) })
          }
        }).catch(function () {})
        return hit
      }
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone()
          caches.open(CACHE).then(function (c) { c.put(req, copy) })
        }
        return res
      }).catch(function () {
        return caches.match('/index.html')
      })
    })
  )
})
