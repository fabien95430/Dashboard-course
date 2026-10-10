const CACHE='courses-app-v396-r1';
const VISUAL_CACHE='courses-visuals-v2';
const ERROR_INBOX_CACHE='courses-error-inbox-v1';
const CORE_VISUALS=[
  './welcome-cart-transparent-v46.png',
  './welcome-background-v40.webp',
  './www/empty-list-premium-v4.webp?v=305'
];
const SHELL=[
  './',
  './index.html',
  './styles.css?v=348',
  './product-item-first-paint.css?v=1',
  './catalog.js?v=396',
  './app.js?v=392',
  './settings-tab-badge.js?v=388',
  './error-center.js?v=395',
  './error-feedback-bridge.js?v=394',
  './dishes.css?v=3',
  './catalog-liquid.css?v=3',
  './dish-detail.css?v=5',
  './catalog-liquid.js?v=297',
  './dishes-ui.js?v=391',
  './catalog-quantities.js?v=389',
  './repurchase-soon.js?v=363',
  './dish-local-images.js?v=396',
  './missing-products-fixes.js?v=20',
  './missing-products-popup-ui.js?v=18',
  './product-item-images.js?v=14',
  './catalog-product-admin.js?v=2',
  './purchase-intelligence.js?v=387',
  './missing-products-dishes.js?v=388',
  './missing-products-modern.js?v=6',
  './dish-added-marker.js?v=1',
  './manifest.webmanifest?v=43',
  './icon-premium-v40.svg',
  './icon.svg',
  './apple-touch-icon.png',
  './docs/guide-fonctionnement-courses.pdf?v=299'
];
const refreshedVisuals=new Set();

function isPersistentVisual(url){
  return url.pathname.includes('/www/Plats/')
    ||url.pathname.includes('/www/Items/')
    ||url.pathname.endsWith('/www/empty-list-premium-v4.webp')
    ||url.pathname.endsWith('/welcome-cart-transparent-v46.png')
    ||url.pathname.endsWith('/welcome-background-v40.webp');
}

function isStartupShellAsset(url){
  return url.pathname.endsWith('/styles.css')
    ||url.pathname.endsWith('/catalog.js')
    ||url.pathname.endsWith('/app.js')
    ||url.pathname.endsWith('/settings-tab-badge.js')
    ||url.pathname.endsWith('/error-center.js')
    ||url.pathname.endsWith('/error-feedback-bridge.js');
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

async function seedCoreVisuals(){
  const cache=await caches.open(VISUAL_CACHE);
  await Promise.all(CORE_VISUALS.map(async src=>{
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

function refreshShell(cache,request){
  return fetch(new Request(request,{cache:'reload'})).then(async response=>{
    if(response.ok)await cache.put(request,response.clone());
    return response;
  });
}

async function storeErrorSignal(payload){
  const status=String(payload?.status||'').toLowerCase();
  if(status!=='error'&&status!=='added')return;
  const id=String(payload?.requestId||payload?.request_id||payload?.tag||Date.now()).replace(/[^a-z0-9_-]+/gi,'-').slice(0,120)||String(Date.now());
  const url=new URL('./__courses_error_event__/'+id+'-'+Date.now(),self.location.href);
  const cache=await caches.open(ERROR_INBOX_CACHE);
  await cache.put(new Request(url.href),new Response(JSON.stringify({...payload,receivedAt:Date.now()}),{headers:{'Content-Type':'application/json'}}));
}

async function deliverErrorSignal(payload){
  const status=String(payload?.status||'').toLowerCase();
  if(status!=='error'&&status!=='added')return;
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const visible=clients.filter(client=>client.visibilityState==='visible');
  if(!visible.length){
    await storeErrorSignal(payload);
    return;
  }
  let delivered=false;
  for(const client of visible){
    try{client.postMessage({type:'courses-error-signal',payload});delivered=true}catch(_){}
  }
  if(!delivered)await storeErrorSignal(payload);
}

self.addEventListener('install',event=>event.waitUntil(
  Promise.all([
    caches.open(CACHE).then(cache=>cache.addAll(SHELL)),
    migrateExistingVisuals().then(seedCoreVisuals)
  ]).then(()=>self.skipWaiting())
));

self.addEventListener('activate',event=>event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key!==VISUAL_CACHE&&key!==ERROR_INBOX_CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||event.request.method!=='GET')return;

  if(event.request.mode==='navigate'){
    const cachePromise=caches.open(CACHE);
    const networkPromise=cachePromise.then(cache=>refreshShell(cache,event.request));
    event.waitUntil(networkPromise.catch(()=>{}));
    event.respondWith(cachePromise.then(async cache=>{
      const hit=await cache.match(event.request)||await cache.match('./index.html');
      if(hit)return hit;
      try{return await networkPromise}catch(_){return Response.error()}
    }));
    return;
  }

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

  if(isStartupShellAsset(url)){
    const cachePromise=caches.open(CACHE);
    const hitPromise=cachePromise.then(cache=>cache.match(event.request));
    const networkPromise=cachePromise.then(cache=>refreshShell(cache,event.request));
    event.waitUntil(networkPromise.catch(()=>{}));
    event.respondWith(hitPromise.then(async hit=>{
      if(hit)return hit;
      try{return await networkPromise}catch(_){return Response.error()}
    }));
    return;
  }

  const networkRequest=new Request(event.request,{cache:'reload'});
  event.respondWith(fetch(networkRequest).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>{
    if(hit)return hit;
    return Response.error();
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
  event.waitUntil(Promise.all([
    deliverErrorSignal(payload).catch(()=>{}),
    self.registration.showNotification(title,{
      body,
      tag,
      icon:'./apple-touch-icon.png',
      badge:'./apple-touch-icon.png',
      data:{url},
      renotify:true
    })
  ]));
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