const CACHE='courses-app-v27-ios-cache-bust';
const SHELL=['./','./index.html','./styles.css?v=27','./catalog.js','./app.js?v=27','./manifest.webmanifest?v=27','./courses-apple-touch-v27.png','./courses-icon-192-v27.png','./bring-photo-v4-frais.webp.png?v=14','./bring-photo-v4-fruits-legumes.webp.png?v=14','./bring-photo-v4-epicerie.webp.png?v=14','./bring-photo-v4-boissons.webp.png?v=14','./bring-photo-v4-maison.webp.png?v=14'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>{
    if(hit)return hit;
    return event.request.mode==='navigate'?caches.match('./index.html'):Response.error();
  })));
});