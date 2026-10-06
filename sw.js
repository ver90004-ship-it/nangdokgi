/* 낭독기 서비스워커 — 온라인이면 항상 최신, 끊기면 캐시로 연다.
   호스팅에서 이 파일을 /sw.js 로 서빙해야 동작한다. */
var CACHE = 'nangdok-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(['./', './index.html']); })
      ['catch'](function(){})
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k===CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); })['catch'](function(){});
      return res;
    })['catch'](function(){
      return caches.match(e.request).then(function(hit){
        return hit || caches.match('./') || caches.match('./index.html');
      });
    })
  );
});
