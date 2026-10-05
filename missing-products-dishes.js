(() => {
'use strict';

const STORAGE_DISHES='courses-missing-dishes-v1';
const DISH_CATEGORIES=Object.freeze(['','Pâtes','Viandes','Poulet','Poissons','Rapides','Enfants','Végé']);
const DISH_STATUSES=Object.freeze(['draft','running','added','error']);
const VAPID_ENTITY='input_text.courses_vapid_public_key';
const HA_REQUEST_TIMEOUT_MS=12000;
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

function sanitizeDish(item,index=0){
  const name=String(item?.name||'').trim().replace(/\s+/g,' ').slice(0,80);
  if(!name)return null;
  const category=DISH_CATEGORIES.includes(item?.category)?item.category:'';
  const id=String(item?.id||('dish-'+index+'-'+normalize(name)));
  let status=DISH_STATUSES.includes(item?.status)?item.status:'draft';
  const requestId=String(item?.requestId||'').slice(0,80);
  let error=String(item?.error||'').trim().slice(0,180);
  const submittedAt=Number(item?.submittedAt)||0;
  if(status==='running'&&submittedAt&&Date.now()-submittedAt>60*60*1000){
    status='error';
    error='Le traitement n’a pas confirmé sa fin. Réessaie l’intégration.';
  }
  return {id,name,category,status,requestId,error,submittedAt};
}
function readDishes(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_DISHES)||'[]');
    if(!Array.isArray(saved))return [];
    return saved.slice(-100).map(sanitizeDish).filter(Boolean);
  }catch(_){
    return [];
  }
}
function saveDishes(items){
  try{localStorage.setItem(STORAGE_DISHES,JSON.stringify(items.slice(-100).map(sanitizeDish).filter(Boolean)))}catch(_){}
  syncCombinedCount();
}
function randomId(){
  if(globalThis.crypto?.getRandomValues){
    const bytes=crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}
function productCount(){
  try{
    const saved=JSON.parse(localStorage.getItem('courses-missing-products-v1')||'[]');
    return Array.isArray(saved)?saved.length:0;
  }catch(_){return 0}
}
function pendingDishCount(){return readDishes().filter(item=>item.status!=='added').length}
function syncCombinedCount(){
  const source=document.getElementById('settingsMissingProductsCount');
  if(!source)return;
  const total=productCount()+pendingDishCount();
  if(source.textContent!==String(total))source.textContent=String(total);
  if(source.hidden!==(total===0))source.hidden=total===0;
}

let haSocket=null;
let haSeq=900000000;
const haPending=new Map();

function rejectHaPending(message='Connexion Home Assistant interrompue'){
  haPending.forEach(pending=>{
    clearTimeout(pending.timer);
    pending.reject(new Error(message));
  });
  haPending.clear();
}
function bindHaSocket(socket){
  if(!socket||socket===haSocket)return;
  haSocket=socket;
  socket.addEventListener('message',event=>{
    let message;
    try{message=JSON.parse(event.data)}catch(_){return}
    if(message.type!=='result'||!haPending.has(message.id))return;
    const pending=haPending.get(message.id);
    haPending.delete(message.id);
    clearTimeout(pending.timer);
    if(message.success)pending.resolve(message.result);
    else pending.reject(new Error(message.error?.message||'Erreur Home Assistant'));
  });
  socket.addEventListener('close',()=>{
    if(haSocket!==socket)return;
    haSocket=null;
    rejectHaPending();
  });
}
function installHaBridge(){
  if(!('WebSocket' in window)||window.__coursesDishIntegrationBridge)return;
  window.__coursesDishIntegrationBridge=true;
  const nativeSend=WebSocket.prototype.send;
  WebSocket.prototype.send=function(data){
    try{
      const url=String(this.url||'');
      if(url.includes('/api/websocket'))bindHaSocket(this);
    }catch(_){}
    return nativeSend.call(this,data);
  };
}
async function waitForHaSocket(){
  if(haSocket?.readyState===WebSocket.OPEN)return haSocket;
  document.getElementById('refreshBtn')?.click();
  const started=Date.now();
  while(Date.now()-started<1200){
    if(haSocket?.readyState===WebSocket.OPEN)return haSocket;
    await new Promise(resolve=>setTimeout(resolve,60));
  }
  throw new Error('Déverrouille et connecte Home Assistant avant de lancer l’intégration.');
}
async function haRequest(payload){
  const socket=await waitForHaSocket();
  return new Promise((resolve,reject)=>{
    const id=haSeq++;
    const timer=setTimeout(()=>{
      haPending.delete(id);
      reject(new Error('Home Assistant ne répond pas.'));
    },HA_REQUEST_TIMEOUT_MS);
    haPending.set(id,{resolve,reject,timer});
    try{socket.send(JSON.stringify({id,...payload}))}
    catch(error){
      clearTimeout(timer);
      haPending.delete(id);
      reject(error);
    }
  });
}
async function haCallService(domain,service,serviceData={}){
  return haRequest({type:'call_service',domain,service,service_data:serviceData});
}

function base64UrlToBytes(value){
  const padding='='.repeat((4-value.length%4)%4);
  const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=atob(base64);
  return Uint8Array.from(raw,char=>char.charCodeAt(0));
}
async function readVapidPublicKey(){
  try{
    const states=await haRequest({type:'get_states'});
    const entity=Array.isArray(states)?states.find(item=>item?.entity_id===VAPID_ENTITY):null;
    const key=String(entity?.state||'').trim();
    return key.length>=80?key:'';
  }catch(_){
    return '';
  }
}
async function pushSubscriptionData(){
  const empty={push_endpoint:'',push_p256dh:'',push_auth:'',push_public_key:''};
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))return empty;
  let permission=Notification.permission;
  if(permission==='default'){
    try{permission=await Notification.requestPermission()}catch(_){return empty}
  }
  if(permission!=='granted')return empty;
  const publicKey=await readVapidPublicKey();
  if(!publicKey)return empty;
  try{
    const registration=await navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription){
      subscription=await registration.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:base64UrlToBytes(publicKey)
      });
    }
    const json=subscription.toJSON();
    return {
      push_endpoint:String(subscription.endpoint||''),
      push_p256dh:String(json.keys?.p256dh||''),
      push_auth:String(json.keys?.auth||''),
      push_public_key:publicKey
    };
  }catch(_){
    return empty;
  }
}

function statusLabel(item){
  if(item.status==='running')return 'En cours…';
  if(item.status==='added')return 'Ajouté';
  if(item.status==='error')return 'Erreur';
  return 'En attente';
}
function updateDish(id,patch){
  const dishes=readDishes();
  const index=dishes.findIndex(item=>item.id===id);
  if(index<0)return null;
  dishes[index]=sanitizeDish({...dishes[index],...patch},index);
  saveDishes(dishes);
  return dishes[index];
}
function findDishByLaunch(name,requestId){
  const dishes=readDishes();
  const normalized=normalize(name);
  return dishes.find(item=>requestId&&item.requestId===requestId)
    ||dishes.find(item=>normalize(item.name)===normalized)
    ||null;
}
function markRenderedDishesAdded(){
  const cards=[...document.querySelectorAll('#dishes .dish-card[data-dish]')];
  if(!cards.length)return false;
  const rendered=new Set(cards.map(card=>normalize(card.dataset.dish)));
  const dishes=readDishes();
  let changed=false;
  dishes.forEach(item=>{
    if(item.status==='added'||!rendered.has(normalize(item.name)))return;
    item.status='added';
    item.error='';
    changed=true;
  });
  if(changed)saveDishes(dishes);
  return changed;
}

function revealDishInCatalog(name){
  const run=()=>{
    if(document.getElementById('app')?.classList.contains('is-locked'))return false;
    document.querySelector('.tab[data-view="catalog"]')?.click();
    const dishMode=document.querySelector('.catalog-mode[data-mode="dishes"]');
    if(dishMode&&!dishMode.classList.contains('is-active'))dishMode.click();
    const search=document.getElementById('productSearch');
    if(search){
      search.value=name;
      search.dispatchEvent(new Event('input',{bubbles:true}));
    }
    const match=[...document.querySelectorAll('#dishes .dish-card[data-dish]')].find(card=>normalize(card.dataset.dish)===normalize(name));
    if(match){
      match.scrollIntoView({block:'center',behavior:'smooth'});
      return true;
    }
    return false;
  };
  if(run())return;
  const observer=new MutationObserver(()=>{
    if(!run())return;
    observer.disconnect();
  });
  observer.observe(document.documentElement,{attributes:true,childList:true,subtree:true,attributeFilter:['class']});
  setTimeout(()=>observer.disconnect(),8000);
}
function consumeNotificationLaunch(){
  const url=new URL(location.href);
  const name=String(url.searchParams.get('courses_dish')||'').trim();
  const status=String(url.searchParams.get('courses_status')||'');
  const requestId=String(url.searchParams.get('courses_request')||'');
  if(!name||!['added','error'].includes(status))return;
  const item=findDishByLaunch(name,requestId);
  if(item){
    updateDish(item.id,{
      status,
      error:status==='error'?'L’intégration automatique a échoué. Réessaie depuis cette liste.':''
    });
  }
  url.searchParams.delete('courses_dish');
  url.searchParams.delete('courses_status');
  url.searchParams.delete('courses_request');
  history.replaceState({},'',url.pathname+url.search+url.hash);
  if(status==='added')revealDishInCatalog(name);
}

function initMissingProductsAndDishes(){
  const dialog=document.getElementById('missingProductsDialog');
  const settingsButton=document.getElementById('settingsMissingProductsBtn');
  const input=document.getElementById('missingProductName');
  const addButton=document.getElementById('addMissingProduct');
  const addRow=dialog?.querySelector('.missing-products-add');
  const categoryPanel=dialog?.querySelector('.missing-category-panel');
  const categoryHeading=categoryPanel?.querySelector('.missing-category-heading');
  const categoryGrid=document.getElementById('missingCategoryGrid');
  const productList=document.getElementById('missingProductsList');
  const listHeading=dialog?.querySelector('.missing-products-list-heading strong');
  const listCount=document.getElementById('missingProductsListCount');
  if(!dialog||!settingsButton||!input||!addButton||!addRow||!categoryPanel||!categoryHeading||!categoryGrid||!productList||!listHeading||!listCount)return;

  const countSource=document.getElementById('settingsMissingProductsCount');
  if(countSource)new MutationObserver(()=>queueMicrotask(syncCombinedCount)).observe(countSource,{attributes:true,childList:true,characterData:true,subtree:true});

  const settingsCopy=settingsButton.querySelector('.settings-copy');
  if(settingsCopy){
    const title=settingsCopy.querySelector('strong');
    const subtitle=settingsCopy.querySelector('small');
    if(title)title.textContent='Produits & plats manquants';
    if(subtitle)subtitle.textContent='Noter les produits et plats absents du catalogue';
  }
  const dialogTitle=dialog.querySelector('.missing-products-header h3');
  const dialogIntro=dialog.querySelector('.missing-products-header .dialog-intro');
  if(dialogTitle)dialogTitle.textContent='Produits & plats manquants';
  if(dialogIntro)dialogIntro.textContent='Ajoutez ici les produits ou plats absents du catalogue. Les plats peuvent ensuite être intégrés automatiquement.';

  const style=document.createElement('style');
  style.id='missing-products-dishes-ui';
  style.textContent=`
    #missingProductsDialog .missing-mode-switch{position:relative;display:grid;grid-template-columns:1fr 1fr;height:44px;margin:14px 0 12px;padding:4px;border-radius:22px;background:rgba(228,234,230,.78);overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}
    #missingProductsDialog .missing-mode-lens{position:absolute;z-index:0;left:4px;top:4px;width:calc(50% - 4px);height:36px;border-radius:19px;background:rgba(255,255,255,.98);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 6px 16px rgba(42,49,45,.13);transform:translate3d(0,0,0);transition:transform .34s cubic-bezier(.22,.9,.28,1),border-radius .18s ease,box-shadow .18s ease;will-change:transform}
    #missingProductsDialog .missing-mode-switch.is-dishes .missing-mode-lens{transform:translate3d(100%,0,0)}
    #missingProductsDialog .missing-mode-switch.is-swapping .missing-mode-lens{border-radius:16px;box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 8px 20px rgba(42,49,45,.17)}
    #missingProductsDialog .missing-mode-button{position:relative;z-index:1;border:0;background:transparent;color:#758078;font-size:13px;font-weight:780;border-radius:18px;padding:0 12px;transition:color .2s ease,transform .2s cubic-bezier(.3,1.4,.5,1)}
    #missingProductsDialog .missing-mode-button.is-active{color:#0b6f3e}
    #missingProductsDialog .missing-mode-switch.is-swapping .missing-mode-button.is-active{transform:scale(1.035)}
    #missingProductsDialog .missing-category-grid{display:none!important}
    #missingProductsDialog .missing-category-heading{margin-bottom:8px!important}
    #missingProductsDialog .missing-category-select{width:100%;height:46px;border:1px solid #e3e8e2;border-radius:14px;background:#fff;color:#27342d;padding:0 13px;font-size:13px;font-weight:720;outline:none}
    #missingProductsDialog .missing-category-select:focus{border-color:#cbd8cf;box-shadow:0 0 0 3px rgba(38,144,82,.08)}
    #missingProductsDialog .missing-dishes-list[hidden]{display:none!important}
    #missingProductsDialog .missing-product-row.is-dish{gap:10px;align-items:center}
    #missingProductsDialog .missing-product-row.is-dish .missing-product-mark{font-size:17px;line-height:1;flex:0 0 auto}
    #missingProductsDialog .missing-product-row.is-dish .missing-product-copy{min-width:0;flex:1 1 auto}
    #missingProductsDialog .missing-dish-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex:0 0 auto}
    #missingProductsDialog .missing-dish-status{display:inline-flex;align-items:center;min-height:28px;padding:0 9px;border-radius:999px;background:#eef2ef;color:#6f7a73;font-size:10px;font-weight:800;white-space:nowrap}
    #missingProductsDialog .missing-dish-status.is-running{background:#edf3ff;color:#41669b}
    #missingProductsDialog .missing-dish-status.is-added{background:#e8f5ed;color:#117442}
    #missingProductsDialog .missing-dish-status.is-error{background:#fff0ef;color:#b33d35}
    #missingProductsDialog .missing-dish-integrate{border:0;border-radius:999px;min-height:30px;padding:0 11px;background:#e5f2e9;color:#0b7040;font-size:10px;font-weight:850;white-space:nowrap}
    #missingProductsDialog .missing-dish-integrate:disabled{opacity:.52}
    #missingProductsDialog .missing-dish-error{display:block;margin-top:3px;color:#ad4941;font-size:10px;line-height:1.25;font-weight:600}
    #missingProductsDialog .missing-product-remove:disabled{opacity:.3}
    @media(max-width:430px){#missingProductsDialog .missing-product-row.is-dish{align-items:flex-start;flex-wrap:wrap}#missingProductsDialog .missing-dish-actions{width:100%;padding-left:27px;justify-content:flex-start}}
    @media(prefers-reduced-motion:reduce){#missingProductsDialog .missing-mode-lens,#missingProductsDialog .missing-mode-button{transition:none!important}}
  `;
  document.head.appendChild(style);

  const modeSwitch=document.createElement('div');
  modeSwitch.className='missing-mode-switch';
  modeSwitch.setAttribute('role','tablist');
  modeSwitch.setAttribute('aria-label','Type d’élément manquant');
  modeSwitch.innerHTML='<span class="missing-mode-lens" aria-hidden="true"></span><button class="missing-mode-button is-active" type="button" data-missing-mode="products" role="tab" aria-selected="true">Produits</button><button class="missing-mode-button" type="button" data-missing-mode="dishes" role="tab" aria-selected="false">Plats</button>';
  addRow.before(modeSwitch);

  const categorySelect=document.createElement('select');
  categorySelect.className='missing-category-select';
  categorySelect.setAttribute('aria-label','Choisir une catégorie');
  categoryPanel.appendChild(categorySelect);

  const dishesList=document.createElement('div');
  dishesList.id='missingDishesList';
  dishesList.className='missing-products-list missing-dishes-list';
  dishesList.hidden=true;
  productList.after(dishesList);

  let dishes=readDishes();
  let mode='products';
  let dishCategory='';
  let swapTimer=0;
  let pointerStart=null;
  const integrationBusy=new Set();

  function selectedProductCategory(){
    return categoryGrid.querySelector('.missing-category-choice.is-active')?.dataset?.missingCategory||'';
  }
  function categoryLabel(category){return category||'Aucune'}
  function renderCategorySelect(){
    const selected=mode==='dishes'?dishCategory:selectedProductCategory();
    const options=mode==='dishes'
      ?DISH_CATEGORIES.map(value=>({value,label:categoryLabel(value)}))
      :[...categoryGrid.querySelectorAll('[data-missing-category]')].map(button=>({value:button.dataset.missingCategory||'',label:button.textContent.trim()}));
    categorySelect.innerHTML=options.map(option=>'<option value="'+escapeHtml(option.value)+'">'+escapeHtml(option.label)+'</option>').join('');
    categorySelect.value=selected;
  }
  function renderDishes(){
    markRenderedDishesAdded();
    dishes=readDishes();
    if(!dishes.length){
      dishesList.innerHTML='<div class="missing-products-empty">Aucun plat noté pour le moment.</div>';
      return;
    }
    dishesList.innerHTML=dishes.map(item=>{
      const category=item.category?'<small>'+escapeHtml(item.category)+'</small>':'';
      const error=item.error?'<small class="missing-dish-error">'+escapeHtml(item.error)+'</small>':'';
      const busy=integrationBusy.has(item.id)||item.status==='running';
      const statusClass=item.status==='running'?' is-running':item.status==='added'?' is-added':item.status==='error'?' is-error':'';
      const action=item.status==='added'
        ?'<span class="missing-dish-status is-added">Ajouté</span>'
        :item.status==='running'
          ?'<span class="missing-dish-status is-running">En cours…</span>'
          :'<button class="missing-dish-integrate" type="button" data-integrate-missing-dish="'+escapeHtml(item.id)+'" '+(busy?'disabled':'')+'>'+(item.status==='error'?'Réessayer':'Intégrer')+'</button><span class="missing-dish-status'+statusClass+'">'+escapeHtml(statusLabel(item))+'</span>';
      return '<div class="missing-product-row is-dish" data-missing-dish-row="'+escapeHtml(item.id)+'">'+
        '<span class="missing-product-mark" aria-hidden="true">•</span>'+
        '<span class="missing-product-copy"><strong>'+escapeHtml(item.name)+'</strong>'+category+error+'</span>'+
        '<span class="missing-dish-actions">'+action+'</span>'+
        '<button class="missing-product-remove" type="button" data-remove-missing-dish="'+escapeHtml(item.id)+'" aria-label="Supprimer '+escapeHtml(item.name)+'" '+(item.status==='running'?'disabled':'')+'><svg><use href="#i-trash"></use></svg></button>'+
      '</div>';
    }).join('');
  }
  function renderMode(){
    const dishesMode=mode==='dishes';
    modeSwitch.classList.toggle('is-dishes',dishesMode);
    modeSwitch.querySelectorAll('[data-missing-mode]').forEach(button=>{
      const active=button.dataset.missingMode===mode;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
    });
    input.placeholder=dishesMode?'Nom du plat':'Nom du produit';
    input.setAttribute('aria-label',dishesMode?'Nom du plat':'Nom du produit');
    listHeading.textContent=dishesMode?'Plats manquants':'Produits manquants';
    productList.hidden=dishesMode;
    dishesList.hidden=!dishesMode;
    if(dishesMode){
      renderDishes();
      listCount.textContent=String(dishes.length);
    }else{
      listCount.textContent=String(productCount());
    }
    renderCategorySelect();
  }
  function setMode(next,{animate=true,clearInput=true}={}){
    if(next!=='products'&&next!=='dishes')return;
    if(mode===next){renderMode();return}
    mode=next;
    if(clearInput)input.value='';
    if(animate&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
      modeSwitch.classList.add('is-swapping');
      clearTimeout(swapTimer);
      swapTimer=setTimeout(()=>modeSwitch.classList.remove('is-swapping'),330);
      navigator.vibrate?.(4);
    }
    renderMode();
  }
  function addDish(){
    const name=String(input.value||'').trim().replace(/\s+/g,' ').slice(0,80);
    if(!name){
      input.focus();
      return;
    }
    dishes=readDishes();
    if(dishes.some(item=>normalize(item.name)===normalize(name)))return;
    dishes.push({id:randomId(),name,category:dishCategory,status:'draft',requestId:'',error:'',submittedAt:0});
    saveDishes(dishes);
    input.value='';
    dishCategory='';
    renderMode();
    navigator.vibrate?.(8);
  }
  function removeDish(id){
    dishes=readDishes();
    const item=dishes.find(entry=>entry.id===id);
    if(item?.status==='running')return;
    const next=dishes.filter(entry=>entry.id!==id);
    if(next.length===dishes.length)return;
    dishes=next;
    saveDishes(dishes);
    renderMode();
    navigator.vibrate?.(6);
  }
  async function integrateDish(id){
    if(integrationBusy.has(id))return;
    const item=readDishes().find(entry=>entry.id===id);
    if(!item||item.status==='added'||item.status==='running')return;
    integrationBusy.add(id);
    renderDishes();
    const requestId=randomId();
    try{
      const push=await pushSubscriptionData();
      await haCallService('rest_command','courses_integrate_dish',{
        dish_name:item.name,
        dish_category:item.category,
        request_id:requestId,
        ...push
      });
      updateDish(id,{status:'running',requestId,error:'',submittedAt:Date.now()});
      navigator.vibrate?.(10);
    }catch(error){
      updateDish(id,{
        status:'error',
        requestId:'',
        error:String(error?.message||'Intégration impossible.').slice(0,180),
        submittedAt:0
      });
      navigator.vibrate?.(6);
    }finally{
      integrationBusy.delete(id);
      renderDishes();
    }
  }

  modeSwitch.addEventListener('click',event=>{
    const button=event.target.closest('[data-missing-mode]');
    if(button)setMode(button.dataset.missingMode||'products');
  });
  modeSwitch.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0)return;
    pointerStart={id:event.pointerId,x:event.clientX};
  });
  modeSwitch.addEventListener('pointerup',event=>{
    if(!pointerStart||pointerStart.id!==event.pointerId)return;
    const dx=event.clientX-pointerStart.x;
    pointerStart=null;
    if(Math.abs(dx)<28)return;
    setMode(dx<0?'dishes':'products');
  });
  modeSwitch.addEventListener('pointercancel',()=>{pointerStart=null});

  categorySelect.addEventListener('change',()=>{
    const category=categorySelect.value||'';
    if(mode==='dishes'){
      dishCategory=DISH_CATEGORIES.includes(category)?category:'';
    }else{
      const original=[...categoryGrid.querySelectorAll('[data-missing-category]')].find(button=>(button.dataset.missingCategory||'')===category);
      original?.click();
    }
    renderCategorySelect();
    navigator.vibrate?.(4);
  });

  addButton.addEventListener('click',event=>{
    if(mode!=='dishes')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addDish();
  },true);
  input.addEventListener('keydown',event=>{
    if(mode!=='dishes'||event.key!=='Enter')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    addDish();
  },true);
  dishesList.addEventListener('click',event=>{
    const integrate=event.target.closest('[data-integrate-missing-dish]');
    if(integrate){
      void integrateDish(integrate.dataset.integrateMissingDish||'');
      return;
    }
    const remove=event.target.closest('[data-remove-missing-dish]');
    if(remove)removeDish(remove.dataset.removeMissingDish||'');
  });

  new MutationObserver(()=>{
    if(mode==='products'){
      renderCategorySelect();
      listCount.textContent=String(productCount());
    }
  }).observe(categoryGrid,{attributes:true,subtree:true,attributeFilter:['class','aria-pressed']});

  const renderedDishObserver=new MutationObserver(()=>{
    if(!markRenderedDishesAdded())return;
    if(mode==='dishes')renderDishes();
  });
  renderedDishObserver.observe(document.documentElement,{childList:true,subtree:true});

  settingsButton.addEventListener('click',()=>{
    setMode('products',{animate:false,clearInput:false});
    requestAnimationFrame(()=>{
      renderCategorySelect();
      listCount.textContent=String(productCount());
    });
  });
  dialog.addEventListener('close',()=>{
    setMode('products',{animate:false,clearInput:false});
  });

  renderMode();
  syncCombinedCount();
  consumeNotificationLaunch();
}

installHaBridge();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMissingProductsAndDishes,{once:true});
else initMissingProductsAndDishes();
})();
