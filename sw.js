/* Keeps a copy of the study guide on the device so it opens without a connection.
   The page itself is fetched network-first (updates show up when online);
   everything else is served from the cache once seen.                        */
var CACHE = "espanol-v1";
var CORE = ["./", "./index.html", "./icon.png", "./manifest.webmanifest"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if(url.origin !== location.origin) return;
  var isPage = e.request.mode === "navigate" || /\/$|index\.html$/.test(url.pathname);
  if(isPage){
    e.respondWith(fetch(e.request).then(function(r){
      var copy = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); return r;
    }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match("./index.html"); }); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(m){
    return m || fetch(e.request).then(function(r){
      var copy = r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); return r;
    });
  }));
});
