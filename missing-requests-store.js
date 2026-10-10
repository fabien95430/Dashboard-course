(()=>{
'use strict';

const KEYS=Object.freeze({
  products:'courses-missing-products-v1',
  dishes:'courses-missing-dishes-v1',
  addedDishes:'courses-missing-dishes-added-v1',
  productImageHints:'courses-missing-product-image-hints-v1'
});
const PRODUCT_CATEGORIES=Object.freeze(['','Apéritif & snacks','Boissons','Boulangerie','Cuisine','Enfant','Frais','Fruits & Légumes','Hygiène & soins','Maison','Petit-déjeuner','Viandes & poissons']);
const EVENT_NAME='courses-missing-requests-change';
const PRODUCT_IMAGE_HINT_MAX=140;
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
  const category=PRODUCT_CATEGORIES.includes(item?.category)?item.category:'';
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
  try{window.dispatchEvent(new CustomEvent(EVENT_NAME,{detail:counts()}))}catch(_){}
}
function writeList(key,items,limit,sanitizer){
  const next=(Array.isArray(items)?items:[]).slice(-limit).map(sanitizer).filter(Boolean);
  if(writeJson(key,next))emit();
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
  if(nextPending.length!==pending.length)writeJson(KEYS.dishes,nextPending);
  if(nextAdded.length!==added.length)writeJson(KEYS.addedDishes,nextAdded);
  emit();
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
  writeJson(KEYS.productImageHints,hints);
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
const api=Object.freeze({
  eventName:EVENT_NAME,
  productCategories:PRODUCT_CATEGORIES,
  productImageHintMax:PRODUCT_IMAGE_HINT_MAX,
  normalize,createId,counts,
  readProducts,writeProducts,addProduct,removeProduct,
  readDishes,writeDishes,addDish,removeDish,
  readAddedDishes,writeAddedDishes,rememberAddedDish,
  sanitizeProductImageHint,productImageHint,setProductImageHint,pruneProductImageHints
});
Object.defineProperty(window,'COURSES_MISSING_REQUESTS',{value:api,configurable:false,enumerable:false,writable:false});
})();
