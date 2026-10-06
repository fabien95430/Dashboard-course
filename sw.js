const CACHE='courses-app-v224-r1';
const VISUAL_CACHE='courses-visuals-v1';
const PRODUCT_VISUALS=[
  './bring-photo-v5-frais.webp.png?v=15',
  './bring-photo-v5-fruits-legumes.webp.png?v=15',
  './bring-photo-v5-epicerie.webp.png?v=15',
  './bring-photo-v5-boissons.webp.png?v=15',
  './bring-photo-v5-maison.webp.png?v=15'
];
const SHELL=['./welcome-cart-transparent-v46.png','./welcome-background-v40.webp','./','./index.html','./styles.css?v=169','./styles.css?v=170','./catalog.js','./catalog.js?v=170','./catalog.js?v=174','./app.js?v=169','./app.js?v=170','./settings-tab-badge.js?v=1','./missing-products-dishes.js?v=1','./missing-products-modern.js?v=1','./missing-products-fixes.js?v=4','./dishes.css?v=3','./dishes-ui.js?v=2','./dish-local-images.js?v=1','./dish-added-marker.js?v=1','./catalog-liquid.css?v=3','./catalog-liquid.js?v=2','./dish-detail.css?v=5','./manifest.webmanifest?v=43','./icon-premium-v40.svg','./icon.svg'];
const refreshedVisuals=new Set();

function isPersistentVisual(url){
  return url.pathname.includes('/www/Plats/')
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
