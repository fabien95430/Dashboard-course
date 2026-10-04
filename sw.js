const CACHE='courses-app-v201-r1';
const SHELL=['./welcome-cart-transparent-v46.png','./welcome-background-v40.webp','./','./index.html','./styles.css?v=169','./styles.css?v=170','./catalog.js','./catalog.js?v=170','./catalog.js?v=174','./app.js?v=169','./app.js?v=170','./settings-tab-badge.js?v=1','./missing-products-dishes.js?v=1','./dishes.css?v=3','./dishes-ui.js?v=2','./dish-local-images.js?v=1','./list-swipe.js?v=1','./dish-added-marker.js?v=1','./catalog-liquid.css?v=3','./catalog-liquid.js?v=2','./dish-detail.css?v=5','./manifest.webmanifest?v=43','./icon-premium-v40.svg','./icon.svg','./bring-photo-v5-frais.webp.png?v=15','./bring-photo-v5-fruits-legumes.webp.png?v=15','./bring-photo-v5-epicerie.webp.png?v=15','./bring-photo-v5-boissons.webp.png?v=15','./bring-photo-v5-maison.webp.png?v=15'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET')return;
  const networkRequest=new Request(event.request,{cache:'reload'});
  event.respondWith(fetch(networkRequest).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>{
    if(hit)return hit;
    return event.request.mode==='navigate'?caches.match('./index.html'):Response.error();
  })));
});