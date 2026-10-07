const CACHE='courses-app-v326-r1';
const VISUAL_CACHE='courses-visuals-v1';
const PRODUCT_VISUALS=[
  './bring-photo-v5-frais.webp.png?v=15',
  './bring-photo-v5-fruits-legumes.webp.png?v=15',
  './bring-photo-v5-epicerie.webp.png?v=15',
  './bring-photo-v5-boissons.webp.png?v=15',
  './bring-photo-v5-maison.webp.png?v=15'
];
const SHELL=['./welcome-cart-transparent-v46.png','./welcome-background-v40.webp','./','./index.html','./styles.css?v=169','./styles.css?v=170','./catalog.js?v=297','./catalog.js?v=313','./catalog.js?v=315','./catalog.js?v=316','./catalog.js?v=318','./catalog.js?v=321','./catalog.js?v=322','./app.js?v=297','./settings-tab-badge.js?v=297','./settings-tab-badge.js?v=299','./settings-tab-badge.js?v=300','./settings-tab-badge.js?v=322','./missing-products-dishes.js?v=1','./missing-products-dishes.js?v=2','./missing-products-dishes.js?v=3','./missing-products-dishes.js?v=4','./missing-products-modern.js?v=5','./missing-products-fixes.js?v=13','./missing-products-fixes.js?v=14','./missing-products-fixes.js?v=15','./missing-products-fixes-core.js?v=6','./missing-products-popup-ui.js?v=9','./missing-products-popup-ui.js?v=11','./missing-products-popup-ui.js?v=12','./missing-products-popup-ui.js?v=13','./missing-products-popup-ui.js?v=14','./missing-products-popup-ui.js?v=15','./dishes.css?v=3','./dishes-ui.js?v=297','./dishes-ui.js?v=301','./dishes-ui.js?v=313','./dishes-ui.js?v=316','./dishes-ui.js?v=321','./dish-local-images.js?v=297','./dish-local-images.js?v=298','./dish-local-images.js?v=299','./dish-local-images.js?v=300','./dish-local-images.js?v=301','./dish-local-images.js?v=302','./dish-local-images.js?v=303','./dish-local-images.js?v=304','./dish-local-images.js?v=305','./dish-local-images.js?v=306','./dish-local-images.js?v=307','./dish-local-images.js?v=308','./dish-local-images.js?v=309','./dish-local-images.js?v=310','./dish-local-images.js?v=311','./dish-local-images.js?v=312','./dish-local-images.js?v=313','./dish-local-images.js?v=314','./dish-local-images.js?v=315','./dish-local-images.js?v=316','./dish-local-images.js?v=317','./dish-local-images.js?v=318','./dish-local-images.js?v=319','./dish-local-images.js?v=320','./dish-local-images.js?v=321','./dish-local-images.js?v=322','./dish-added-marker.js?v=1','./catalog-liquid.css?v=3','./catalog-liquid.js?v=297','./catalog-quantities.js?v=297','./catalog-quantities.js?v=302','./catalog-quantities.js?v=310','./catalog-quantities.js?v=316','./product-item-images.js?v=9','./product-item-images.js?v=10','./purchase-intelligence.js?v=4','./repurchase-soon.js?v=1','./repurchase-soon.js?v=2','./repurchase-soon.js?v=3','./dish-detail.css?v=5','./docs/guide-fonctionnement-courses.pdf?v=299','./manifest.webmanifest?v=43','./icon-premium-v40.svg','./icon.svg','./styles.css?v=323','./catalog.js?v=323','./dish-local-images.js?v=323','./dishes-ui.js?v=324','./dish-local-images.js?v=324','./catalog.js?v=325','./dish-local-images.js?v=325','./catalog.js?v=326','./dishes-ui.js?v=326','./dish-local-images.js?v=326'];
const refreshedVisuals=new Set();

function isPersistentVisual(url){
  return url.pathname.includes('/www/Plats/')
    ||url.pathname.includes('/www/Items/')
    ||url.pathname.endsWith('/www/empty-list-premium-v4.webp')
    ||/\/bring-photo-v5-(?:frais|fruits-legumes|epicerie|boissons|maison)\.webp\.png$/.test(url.pathname);
}

async function migrateExistingVisuals(){
  const target=await caches.open(VISUAL_CACHE);
  const cacheNames=await caches.keys();
  for(const cacheName of cacheNames){
    if(cacheName===VISUAL_CACHE)continue;
    const source=await caches.open(cacheName);
    const requests=await source.keys();
    await Promise.all(requests.filter(request=>isPersistentVisual(new URL(request.url))).map(async request=>{
      if(await target.match(request))return;
      const response=await source.match(request);
      if(response)await target.put(request,response.clone());
    }));
  }
}

async function seedProductVisuals(){
  const cache=await caches.open(VISUAL_CACHE);
  await Promise.all(PRODUCT_VISUALS.map(async src=>{
    if(await cache.match(src))return;
    const existing=await caches.match(src);
    if(existing){
      await cache.put(src,existing.clone());
      return;
    }
    try{
      const response=await fetch(new Request(src,{cache:'reload'}));
      if(response.ok)await cache.put(src,response.clone());
    }catch(_){}
  }));
}

function refreshVisual(cache,request){
  const key=request.url;
  if(refreshedVisuals.has(key))return Promise.resolve();
  refreshedVisuals.add(key);
  return fetch(new Request(request,{cache:'reload'})).then(response=>{
    if(!response.ok){
      refreshedVisuals.delete(key);
      return;
    }
    return cache.put(request,response.clone());
  }).catch(()=>{
    refreshedVisuals.delete(key);
  });
}

self.addEventListener('install',event=>event.waitUntil(
  Promise.all([
    caches.open(CACHE).then(cache=>cache.addAll(SHELL)),
    migrateExistingVisuals().then(seedProductVisuals)
  ]).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key!==VISUAL_CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET')return;

  if(isPersistentVisual(url)){
    const cachePromise=caches.open(VISUAL_CACHE);
    const hitPromise=cachePromise.then(cache=>cache.match(event.request));
    event.waitUntil(
      hitPromise.then(hit=>{
        if(!hit)return;
        return cachePromise.then(cache=>refreshVisual(cache,event.request));
      }).catch(()=>{})
    );
    event.respondWith(
      Promise.all([cachePromise,hitPromise]).then(async([cache,hit])=>{
        if(hit)return hit;
        try{
          const response=await fetch(new Request(event.request,{cache:'reload'}));
          if(response.ok)await cache.put(event.request,response.clone());
          return response;
        }catch(_){
          return Response.error();
        }
      })
    );
    return;
  }

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

self.addEventListener('push',event=>{
  let payload={};
  try{payload=event.data?.json?.()||{}}catch(_){
    try{payload={body:event.data?.text?.()||''}}catch(__){payload={}}
  }
  const title=String(payload.title||'Courses');
  const body=String(payload.body||'Le catalogue a été mis à jour.');
  const tag=String(payload.tag||'courses-catalog-update');
  const url=String(payload.url||'./');
  event.waitUntil(self.registration.showNotification(title,{
    body,
    tag,
    icon:'./apple-touch-icon.png',
    badge:'./apple-touch-icon.png',
    data:{url},
    renotify:true
  }));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(String(event.notification.data?.url||'./'),self.location.href).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
    for(const client of clients){
      try{
        if(new URL(client.url).origin!==self.location.origin)continue;
        if('navigate' in client)await client.navigate(target);
        if('focus' in client)return client.focus();
      }catch(_){}
    }
    return self.clients.openWindow?self.clients.openWindow(target):undefined;
  }));
});