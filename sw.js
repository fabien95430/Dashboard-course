const CACHE='courses-app-v391-r1';
const VISUAL_CACHE='courses-visuals-v2';
const ERROR_INBOX_CACHE='courses-error-inbox-v1';
const CORE_VISUALS=[
  './welcome-cart-transparent-v46.png',
  './welcome-background-v40.webp',
  './www/empty-list-premium-v4.webp?v=305'
];
const SHELL=['./welcome-cart-transparent-v46.png','./welcome-background-v40.webp','./error-center.js?v=1','./error-feedback-bridge.js?v=1','./','./index.html','./styles.css?v=169','./styles.css?v=170','./catalog.js?v=297','./catalog.js?v=313','./catalog.js?v=315','./catalog.js?v=316','./catalog.js?v=318','./catalog.js?v=321','./catalog.js?v=322','./app.js?v=297','./settings-tab-badge.js?v=297','./settings-tab-badge.js?v=299','./settings-tab-badge.js?v=300','./settings-tab-badge.js?v=322','./missing-products-dishes.js?v=1','./missing-products-dishes.js?v=2','./missing-products-dishes.js?v=3','./missing-products-dishes.js?v=4','./missing-products-modern.js?v=5','./missing-products-fixes.js?v=13','./missing-products-fixes.js?v=14','./missing-products-fixes.js?v=15','./missing-products-fixes.js?v=16','./missing-products-fixes-core.js?v=6','./missing-products-popup-ui.js?v=9','./missing-products-popup-ui.js?v=11','./missing-products-popup-ui.js?v=12','./missing-products-popup-ui.js?v=13','./missing-products-popup-ui.js?v=14','./missing-products-popup-ui.js?v=15','./dishes.css?v=3','./dishes-ui.js?v=297','./dishes-ui.js?v=301','./dishes-ui.js?v=313','./dishes-ui.js?v=316','./dishes-ui.js?v=321','./dish-local-images.js?v=297','./dish-local-images.js?v=298','./dish-local-images.js?v=299','./dish-local-images.js?v=300','./dish-local-images.js?v=301','./dish-local-images.js?v=302','./dish-local-images.js?v=303','./dish-local-images.js?v=304','./dish-local-images.js?v=305','./dish-local-images.js?v=306','./dish-local-images.js?v=307','./dish-local-images.js?v=308','./dish-local-images.js?v=309','./dish-local-images.js?v=310','./dish-local-images.js?v=311','./dish-local-images.js?v=312','./dish-local-images.js?v=313','./dish-local-images.js?v=314','./dish-local-images.js?v=315','./dish-local-images.js?v=316','./dish-local-images.js?v=317','./dish-local-images.js?v=318','./dish-local-images.js?v=319','./dish-local-images.js?v=320','./dish-local-images.js?v=321','./dish-local-images.js?v=322','./dish-added-marker.js?v=1','./catalog-liquid.css?v=3','./catalog-liquid.js?v=297','./catalog-quantities.js?v=297','./catalog-quantities.js?v=302','./catalog-quantities.js?v=310','./catalog-quantities.js?v=316','./product-item-images.js?v=9','./product-item-images.js?v=10','./purchase-intelligence.js?v=4','./repurchase-soon.js?v=1','./repurchase-soon.js?v=2','./repurchase-soon.js?v=3','./dish-detail.css?v=5','./docs/guide-fonctionnement-courses.pdf?v=299','./manifest.webmanifest?v=43','./icon-premium-v40.svg','./icon.svg','./styles.css?v=323','./catalog.js?v=323','./dish-local-images.js?v=323','./dishes-ui.js?v=324','./dish-local-images.js?v=324','./catalog.js?v=325','./dish-local-images.js?v=325','./catalog.js?v=326','./dishes-ui.js?v=326','./dish-local-images.js?v=326','./catalog.js?v=327','./settings-tab-badge.js?v=327','./dish-local-images.js?v=327','./dish-local-images.js?v=329','./styles.css?v=330','./catalog.js?v=330','./dish-local-images.js?v=330','./styles.css?v=332','./catalog.js?v=332','./app.js?v=332','./dish-local-images.js?v=332','./catalog.js?v=335','./settings-tab-badge.js?v=335','./dish-local-images.js?v=335','./styles.css?v=336','./catalog.js?v=336','./app.js?v=336','./dish-local-images.js?v=336','./catalog.js?v=337','./settings-tab-badge.js?v=337','./dish-local-images.js?v=337','./missing-products-modern.js?v=6','./catalog.js?v=338','./dishes-ui.js?v=338','./dish-local-images.js?v=338','./styles.css?v=339','./catalog.js?v=339','./app.js?v=339','./dish-local-images.js?v=339','./catalog.js?v=340','./dishes-ui.js?v=340','./dish-local-images.js?v=340','./catalog.js?v=341','./settings-tab-badge.js?v=341','./missing-products-dishes.js?v=5','./dish-local-images.js?v=341','./styles.css?v=342','./catalog.js?v=342','./app.js?v=342','./dish-local-images.js?v=342','./catalog.js?v=343','./dishes-ui.js?v=343','./dish-local-images.js?v=343','./styles.css?v=344','./catalog.js?v=344','./app.js?v=344','./settings-tab-badge.js?v=344','./missing-products-dishes.js?v=6','./dishes-ui.js?v=344','./dish-local-images.js?v=344','./catalog.js?v=345','./app.js?v=345','./dish-local-images.js?v=345','./styles.css?v=346','./styles.css?v=348','./catalog.js?v=348','./app.js?v=348','./dish-local-images.js?v=348','./catalog.js?v=349','./app.js?v=349','./dish-local-images.js?v=349','./app.js?v=350','./dish-local-images.js?v=350','./catalog.js?v=351','./app.js?v=351','./settings-tab-badge.js?v=351','./missing-products-dishes.js?v=7','./dish-local-images.js?v=351','./catalog.js?v=352','./app.js?v=352','./settings-tab-badge.js?v=352','./missing-products-dishes.js?v=8','./missing-products-fixes.js?v=17','./missing-products-popup-ui.js?v=16','./dish-local-images.js?v=352','./catalog.js?v=353','./missing-products-fixes.js?v=18','./dish-local-images.js?v=353','./catalog.js?v=354','./dish-local-images.js?v=354','./catalog.js?v=355','./missing-products-popup-ui.js?v=17','./dish-local-images.js?v=355','./catalog.js?v=356','./app.js?v=356','./settings-tab-badge.js?v=356','./catalog.js?v=357','./missing-products-fixes.js?v=19','./missing-products-popup-ui.js?v=18','./dish-local-images.js?v=357','./catalog.js?v=363','./settings-tab-badge.js?v=363','./missing-products-dishes.js?v=363','./dishes-ui.js?v=363','./repurchase-soon.js?v=363','./dish-local-images.js?v=363','./catalog.js?v=364','./settings-tab-badge.js?v=370','./dishes-ui.js?v=364','./catalog-quantities.js?v=364','./dish-local-images.js?v=364','./dish-local-images.js?v=370','./product-item-images.js?v=11','./catalog-quantities.js?v=370','./app.js?v=370','./catalog.js?v=370','./missing-products-fixes.js?v=20','./settings-tab-badge.js?v=364','./catalog.js?v=372','./catalog-quantities.js?v=372','./dish-local-images.js?v=372','./catalog.js?v=373','./app.js?v=373','./catalog-quantities.js?v=373','./dish-local-images.js?v=373','./product-item-images.js?v=12','./purchase-intelligence.js?v=5','./catalog.js?v=374','./catalog-quantities.js?v=374','./dish-local-images.js?v=374','./catalog.js?v=375','./dish-local-images.js?v=375','./product-item-images.js?v=13','./catalog.js?v=376','./dish-local-images.js?v=376','./catalog.js?v=377','./app.js?v=377','./catalog-quantities.js?v=377','./dish-local-images.js?v=377','./purchase-intelligence.js?v=377','./catalog.js?v=378','./app.js?v=378','./catalog-quantities.js?v=378','./dish-local-images.js?v=378','./purchase-intelligence.js?v=378','./catalog.js?v=379','./app.js?v=379','./dish-local-images.js?v=379','./catalog.js?v=380','./dish-local-images.js?v=380',"./catalog.js?v=381","./catalog-quantities.js?v=381","./dish-local-images.js?v=381","./catalog.js?v=382","./catalog-quantities.js?v=382","./dish-local-images.js?v=382",'./catalog.js?v=383','./app.js?v=383','./dish-local-images.js?v=383','./product-item-images.js?v=14','./missing-products-dishes.js?v=383','./settings-tab-badge.js?v=383','./catalog-product-admin.js?v=2',"./catalog.js?v=384","./app.js?v=384","./catalog-quantities.js?v=384","./dish-local-images.js?v=384","./purchase-intelligence.js?v=384","./catalog.js?v=385","./catalog-quantities.js?v=385","./dish-local-images.js?v=385","./catalog.js?v=386","./app.js?v=386","./catalog-quantities.js?v=386","./dish-local-images.js?v=386","./purchase-intelligence.js?v=386","./catalog.js?v=387","./app.js?v=387","./catalog-quantities.js?v=387","./dish-local-images.js?v=387","./purchase-intelligence.js?v=387",'./settings-tab-badge.js?v=388','./missing-products-dishes.js?v=388','./dish-local-images.js?v=388',"./catalog.js?v=389","./catalog-quantities.js?v=389","./dish-local-images.js?v=389","./catalog.js?v=390","./dish-local-images.js?v=390","./error-center.js?v=390","./error-feedback-bridge.js?v=390",'./catalog.js?v=391','./app.js?v=391','./dishes-ui.js?v=391','./dish-local-images.js?v=391','./error-feedback-bridge.js?v=391'];
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