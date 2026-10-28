(()=>{
'use strict';

const KEYS=Object.freeze({
  products:'courses-missing-products-v1',
  dishes:'courses-missing-dishes-v1',
  addedDishes:'courses-missing-dishes-added-v1',
  productImageHints:'courses-missing-product-image-hints-v1'
});
const PRODUCT_CATEGORIES=Object.freeze(['','Boissons','Épicerie','Frais','Fruits & Légumes','Hygiène & enfant','Maison','Petit-déj & snacks','Viandes & poissons']);
// Rayons fusionnés : les demandes déjà enregistrées gardent leur catégorie sous le nouveau nom.
const LEGACY_PRODUCT_CATEGORIES=Object.freeze({'Apéritif & snacks':'Petit-déj & snacks','Petit-déjeuner':'Petit-déj & snacks','Boulangerie':'Épicerie','Cuisine':'Épicerie','Enfant':'Hygiène & enfant','Hygiène & soins':'Hygiène & enfant'});
const EVENT_NAME='courses-missing-requests-change';
const PRODUCT_IMAGE_HINT_MAX=140;
// Liste Home Assistant distincte de la liste de courses utilisée par Ma liste.
const SHARED_ENTITY='todo.courses_demandes';
const SHARED_PREFIX='courses-missing-v1:';
const SHARED_MIGRATED='courses-missing-ha-migrated-v1';
const SHARED_QUEUE='courses-missing-ha-actions-v1';
const SHARED_RECOVERED='courses-missing-ha-recovered-v466';
const SHARED_STATUS_EVENT='courses:missing-ha-status';
let sharedConnecting=null,sharedSubscribed=false;
let sharedStatus={state:'waiting',message:'En attente de Home Assistant'};
function setSharedStatus(state,message){
  if(sharedStatus.state===state&&sharedStatus.message===message)return;
  sharedStatus={state,message};
  try{window.dispatchEvent(new CustomEvent(SHARED_STATUS_EVENT,{detail:{...sharedStatus}}))}catch(_){}
}
const getSharedStatus=()=>({...sharedStatus});
let sharedEnabled=false,sharedSyncing=null,sharedDirty=false,applyingShared=false;
const normalize=value=>String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const cleanText=(value,max=80)=>String(value||'').trim().replace(/\s+/g,' ').slice(0,max);
const createId=()=>{
  if(globalThis.crypto?.getRandomValues){
    const bytes=crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
  }
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
};
function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'');
    return value??fallback;
  }catch(_){return fallback}
}
function writeJson(key,value){
  try{localStorage.setItem(key,JSON.stringify(value));return true}catch(_){return false}
}
function sanitizeProduct(item,index=0){
  const name=cleanText(item?.name);
  if(!name)return null;
  const raw=Object.prototype.hasOwnProperty.call(LEGACY_PRODUCT_CATEGORIES,item?.category??'')?LEGACY_PRODUCT_CATEGORIES[item.category]:item?.category;
  const category=PRODUCT_CATEGORIES.includes(raw)?raw:'';
  return {id:String(item?.id||('legacy-'+index+'-'+normalize(name))),name,category};
}
function sanitizeDish(item,index=0){
  const name=cleanText(item?.name);
  if(!name)return null;
  return {id:String(item?.id||('dish-'+index+'-'+normalize(name))),name,category:cleanText(item?.category)};
}
function readList(key,limit,sanitizer){
  const saved=readJson(key,[]);
  return Array.isArray(saved)?saved.slice(-limit).map(sanitizer).filter(Boolean):[];
}
const readProducts=()=>readList(KEYS.products,100,sanitizeProduct);
const readDishes=()=>readList(KEYS.dishes,100,sanitizeDish);
const readAddedDishes=()=>readList(KEYS.addedDishes,50,sanitizeDish);
function counts(){
  const products=readProducts().length,dishes=readDishes().length;
  return {products,dishes,total:products+dishes};
}
function emit(){
  try{window.dispatchEvent(new CustomEvent(EVENT_NAME,{detail:{...counts(),remote:applyingShared}}))}catch(_){}
}
function writeList(key,items,limit,sanitizer){
  const previous=key===KEYS.products?readProducts():key===KEYS.dishes?readDishes():[];
  const next=(Array.isArray(items)?items:[]).slice(-limit).map(sanitizer).filter(Boolean);
  if(writeJson(key,next)){
    if(!applyingShared&&(key===KEYS.products||key===KEYS.dishes))recordSharedDiff(key===KEYS.products?'product':'dish',previous,next);
    emit();
  }
  return next;
}
const writeProducts=items=>writeList(KEYS.products,items,100,sanitizeProduct);
const writeDishes=items=>writeList(KEYS.dishes,items,100,sanitizeDish);
const writeAddedDishes=items=>writeList(KEYS.addedDishes,items,50,sanitizeDish);
function addProduct(value){
  const item=sanitizeProduct({...value,id:value?.id||createId()});
  if(!item)return {ok:false,reason:'empty',items:readProducts()};
  const items=readProducts();
  if(items.some(entry=>normalize(entry.name)===normalize(item.name)))return {ok:false,reason:'duplicate',items};
  const next=writeProducts([...items,item]);
  return {ok:true,item,items:next};
}
function removeProduct(id){
  const items=readProducts(),next=items.filter(item=>item.id!==String(id||''));
  if(next.length===items.length)return {ok:false,items};
  writeProducts(next);
  pruneProductImageHints(next);
  return {ok:true,items:next};
}
function addDish(value){
  const item=sanitizeDish({...value,id:value?.id||createId()});
  if(!item)return {ok:false,reason:'empty',items:readDishes()};
  const pending=readDishes(),added=readAddedDishes();
  if([...pending,...added].some(entry=>normalize(entry.name)===normalize(item.name)))return {ok:false,reason:'duplicate',items:pending};
  const next=writeDishes([...pending,item]);
  return {ok:true,item,items:next};
}
function removeDish(id){
  const value=String(id||''),pending=readDishes(),added=readAddedDishes();
  const nextPending=pending.filter(item=>item.id!==value),nextAdded=added.filter(item=>item.id!==value);
  const removed=nextPending.length!==pending.length||nextAdded.length!==added.length;
  if(!removed)return {ok:false,items:pending,added};
  if(nextPending.length!==pending.length)writeDishes(nextPending);
  if(nextAdded.length!==added.length)writeAddedDishes(nextAdded);
  return {ok:true,items:nextPending,added:nextAdded};
}
function rememberAddedDish(value){
  const item=sanitizeDish(value);
  if(!item)return readAddedDishes();
  const added=readAddedDishes().filter(entry=>entry.id!==item.id&&normalize(entry.name)!==normalize(item.name));
  return writeAddedDishes([...added,item]);
}
function sanitizeProductImageHint(value){return cleanText(value,PRODUCT_IMAGE_HINT_MAX)}
function readProductImageHints(){
  const saved=readJson(KEYS.productImageHints,{});
  return saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};
}
function productImageHint(name){
  const key=normalize(name);
  return key?sanitizeProductImageHint(readProductImageHints()[key]):'';
}
function setProductImageHint(name,value){
  const key=normalize(name);
  if(!key)return '';
  const hints=readProductImageHints(),hint=sanitizeProductImageHint(value);
  if(hint)hints[key]=hint;else delete hints[key];
  if(writeJson(KEYS.productImageHints,hints)&&readProducts().some(item=>normalize(item.name)===key)){
    recordSharedAction({action:'put',type:'product',name});
  }
  return hint;
}
function pruneProductImageHints(products=readProducts()){
  const keep=new Set((products||[]).map(item=>normalize(item?.name)).filter(Boolean));
  const hints=readProductImageHints();
  let changed=false;
  Object.keys(hints).forEach(key=>{if(!keep.has(key)){delete hints[key];changed=true}});
  if(changed)writeJson(KEYS.productImageHints,hints);
  return hints;
}

// Home Assistant devient la source partagée après une fusion initiale non destructive.
// Les modifications hors ligne sont conservées dans une file locale durable.
const sharedKey=(type,name)=>type+':'+normalize(name);
const sharedClient=()=>window.COURSES_HA_CLIENT;
const sharedConnected=()=>sharedEnabled&&sharedClient()?.isConnected?.();
function sharedActions(){
  const actions=readJson(SHARED_QUEUE,[]);
  return Array.isArray(actions)?actions.slice(-500).filter(entry=>entry&&['product','dish'].includes(entry.type)&&['put','remove'].includes(entry.action)):[];
}
function recordSharedAction({action,type,name}){
  if(applyingShared||!readJson(SHARED_MIGRATED,false))return;
  const key=sharedKey(type,name);
  if(!normalize(name))return;
  const actions=sharedActions().filter(entry=>sharedKey(entry.type,entry.name)!==key);
  actions.push({id:createId(),action,type,name:cleanText(name)});
  if(writeJson(SHARED_QUEUE,actions)){
    setSharedStatus('waiting','Modifications en attente de synchronisation');
    void requestSharedSync()?.catch(()=>{});
  }
}
function recordSharedDiff(type,before,after){
  const old=new Map(before.map(item=>[normalize(item.name),item]));
  const current=new Map(after.map(item=>[normalize(item.name),item]));
  for(const [key,item] of old)if(!current.has(key))recordSharedAction({action:'remove',type,name:item.name});
  for(const [key,item] of current){
    if(!old.has(key)||JSON.stringify(old.get(key))!==JSON.stringify(item))recordSharedAction({action:'put',type,name:item.name});
  }
}
function decodeShared(row){
  if(row?.status==='completed'||typeof row?.description!=='string'||!row.description.startsWith(SHARED_PREFIX))return null;
  let saved;
  try{saved=JSON.parse(row.description.slice(SHARED_PREFIX.length))}catch(_){return null}
  if(saved?.v!==1||!['product','dish'].includes(saved?.type))return null;
  const item=saved.type==='product'?sanitizeProduct(saved):sanitizeDish(saved);
  if(!item)return null;
  return {type:saved.type,item,uid:String(row.uid||''),summary:String(row.summary||''),hint:sanitizeProductImageHint(saved.hint)};
}
async function getSharedRows(){
  const result=await sharedClient().request({type:'todo/item/list',entity_id:SHARED_ENTITY});
  if(!Array.isArray(result?.items))throw new Error('Liste de demandes Home Assistant illisible');
  return result.items.map(decodeShared).filter(Boolean);
}
function sharedDescription(type,item){
  return SHARED_PREFIX+JSON.stringify({v:1,type,id:item.id,name:item.name,category:item.category||'',
    ...(type==='product'?{hint:productImageHint(item.name)}:{})});
}
async function putShared(type,item,rows,{migration=false}={}){
  const key=sharedKey(type,item.name);
  const existing=rows.find(row=>sharedKey(row.type,row.item.name)===key);
  const description=sharedDescription(type,item);
  if(existing){
    if((!migration||!existing.item.category)&&existing.item.category!==item.category
      ||(type==='product'&&(!migration||!existing.hint)&&existing.hint!==productImageHint(item.name))){
      await sharedClient().callService('todo','update_item',{
        entity_id:SHARED_ENTITY,item:existing.uid||existing.summary,description
      });
    }
    return;
  }
  const label=(type==='product'?'Produit : ':'Plat : ')+item.name;
  await sharedClient().callService('todo','add_item',{entity_id:SHARED_ENTITY,item:label,description});
  rows.push({type,item,uid:'',summary:label,hint:type==='product'?productImageHint(item.name):''});
}
function applySharedRows(rows){
  if(!sharedConnected())return;
  const unique=new Set(),products=[],dishes=[],hints={};
  rows.forEach(row=>{
    const key=sharedKey(row.type,row.item.name);
    if(unique.has(key))return;
    unique.add(key);
    if(row.type==='product'){
      if(products.length<100){products.push(row.item);if(row.hint)hints[normalize(row.item.name)]=row.hint;}
    }else if(dishes.length<100)dishes.push(row.item);
  });
  applyingShared=true;
  try{
    writeProducts(products);
    writeDishes(dishes);
    writeJson(KEYS.productImageHints,hints);
  }finally{applyingShared=false}
}
async function recoverLocalRequests(){
  // La migration v465 a pu être marquée alors que le transfert était incomplet.
  const local=[...readProducts().map(item=>({type:'product',item})),
    ...readDishes().map(item=>({type:'dish',item}))];
  const rows=await getSharedRows();
  for(const {type,item} of local){
    if(!sharedConnected())throw new Error('Connexion interrompue pendant le transfert');
    await putShared(type,item,rows,{migration:true});
  }
  // Valider par une nouvelle lecture distante avant la fusion locale.
  const confirmed=await getSharedRows();
  const keys=new Set(confirmed.map(row=>sharedKey(row.type,row.item.name)));
  if(local.some(({type,item})=>!keys.has(sharedKey(type,item.name)))){
    throw new Error('Transfert non confirmé : demandes locales conservées');
  }
  if(!sharedConnected())throw new Error('Connexion interrompue pendant la vérification');
  if(!writeJson(SHARED_RECOVERED,true)||!writeJson(SHARED_MIGRATED,true)){
    throw new Error('Validation locale impossible : demandes conservées');
  }
  return confirmed;
}
async function performSharedSync(){
  if(!sharedConnected())return;
  setSharedStatus('syncing','Synchronisation des demandes…');
  let rows=await getSharedRows();
  if(!readJson(SHARED_RECOVERED,false))rows=await recoverLocalRequests();
  for(const operation of sharedActions()){
    if(!sharedConnected())return;
    const existing=rows.filter(row=>sharedKey(row.type,row.item.name)===sharedKey(operation.type,operation.name));
    if(operation.action==='remove'){
      for(const row of existing){
        await sharedClient().callService('todo','remove_item',{entity_id:SHARED_ENTITY,item:row.uid||row.summary});
      }
    }else{
      const item=(operation.type==='product'?readProducts():readDishes()).find(value=>normalize(value.name)===normalize(operation.name));
      if(item)await putShared(operation.type,item,rows);
    }
    // Une édition arrivée pendant la requête réseau ne doit pas être supprimée.
    writeJson(SHARED_QUEUE,sharedActions().filter(entry=>entry.id!==operation.id));
    rows=await getSharedRows();
  }
  if(!sharedConnected())return;
  if(!sharedActions().length){
    applySharedRows(rows);
    setSharedStatus('synced','Synchronisé avec Home Assistant');
  }
}
function requestSharedSync(){
  sharedDirty=true;
  if(!sharedConnected()||sharedSyncing)return sharedSyncing;
  const task=(async()=>{
    while(sharedDirty&&sharedConnected()){
      sharedDirty=false;
      await performSharedSync();
    }
  })();
  sharedSyncing=task;
  task.catch(error=>{
    console.warn('courses-app: demandes Home Assistant',error);
    setSharedStatus('error','Échec de synchronisation : '+String(error?.message||'Erreur Home Assistant').slice(0,150));
    try{window.dispatchEvent(new CustomEvent('courses:missing-sync-error',{detail:{message:error.message}}))}catch(_){}
  }).finally(()=>{
    if(sharedSyncing===task)sharedSyncing=null;
  });
  return task;
}
async function connectShared({newConnection=false}={}){
  if(sharedConnecting)return sharedConnecting;
  const job=(async()=>{
    const client=sharedClient();
    if(newConnection){sharedEnabled=false;sharedSubscribed=false;}
    if(!client?.isConnected?.()){
      setSharedStatus('waiting','En attente de connexion Home Assistant');
      return false;
    }
    if(!sharedEnabled){
      setSharedStatus('syncing','Recherche de la liste Home Assistant…');
      const states=await client.getStates();
      if(!states.some(row=>row.entity_id===SHARED_ENTITY&&row.state!=='unavailable')){
        setSharedStatus('missing','Liste Home Assistant introuvable : '+SHARED_ENTITY);
        return false;
      }
      if(!sharedSubscribed){
        if(typeof client.subscribeMissingTodo==='function'){
          await client.subscribeMissingTodo(SHARED_ENTITY,()=>{if(sharedConnected())void requestSharedSync().catch(()=>{})});
        }else{
          await client.request({type:'subscribe_trigger',trigger:{platform:'state',entity_id:SHARED_ENTITY}});
        }
        sharedSubscribed=true;
      }
      sharedEnabled=true;
    }
    await requestSharedSync();
    return true;
  })();
  sharedConnecting=job;
  try{return await job}
  catch(error){
    setSharedStatus('error','Échec de synchronisation : '+String(error?.message||'Erreur Home Assistant').slice(0,150));
    throw error;
  }finally{if(sharedConnecting===job)sharedConnecting=null}
}
window.addEventListener?.('courses:missing-ha-updated',()=>{if(sharedConnected())void requestSharedSync().catch(()=>{})});

const api=Object.freeze({
  eventName:EVENT_NAME,
  productCategories:PRODUCT_CATEGORIES,
  productImageHintMax:PRODUCT_IMAGE_HINT_MAX,
  normalize,createId,counts,connectShared,getSharedStatus,
  readProducts,writeProducts,addProduct,removeProduct,
  readDishes,writeDishes,addDish,removeDish,
  readAddedDishes,writeAddedDishes,rememberAddedDish,
  sanitizeProductImageHint,productImageHint,setProductImageHint,pruneProductImageHints
});
Object.defineProperty(window,'COURSES_MISSING_REQUESTS',{value:api,configurable:false,enumerable:false,writable:false});
})();
