const CACHE='courses-app-v112-selected-tile-visibility';
const SHELL=['./welcome-cart-transparent-v46.png','./welcome-background-v40.webp','./','./index.html','./styles.css?v=112','./catalog.js','./app.js?v=112','./manifest.webmanifest?v=43','./icon-premium-v40.svg','./icon.svg','./bring-photo-v5-frais.webp.png?v=15','./bring-photo-v5-fruits-legumes.webp.png?v=15','./bring-photo-v5-epicerie.webp.png?v=15','./bring-photo-v5-boissons.webp.png?v=15','./bring-photo-v5-maison.webp.png?v=15'];
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