/* repurchase-soon.js — propriétaire des suggestions « À racheter » (fusionnées dans Favoris du Catalogue).
   Moteur seul : app.js affiche les produits en tête de Favoris avec la mention « À racheter » et la
   pastille du chip Favoris. Aucun ajout automatique à Ma liste. */
(() => {
'use strict';

const CATALOG=window.COURSES_CATALOG;
if(!CATALOG?.groups)return;

const DAY=86400000;
const NAMES=[...new Set(Object.values(CATALOG.groups).flatMap(subs=>Object.values(subs||{}).flatMap(names=>Array.isArray(names)?names:[])))];
const META=new Map();
Object.entries(CATALOG.groups).forEach(([category,subs])=>Object.entries(subs||{}).forEach(([sub,names])=>{
  (Array.isArray(names)?names:[]).forEach(name=>META.set(name,{category,sub}));
}));

// Habitude prouvée : au moins 3 achats faits lors de courses différentes (2 intervalles).
const MIN_INTERVALS=2;
// Rythme régulier : écart médian des intervalles au plus à 50 % de l'intervalle typique.
const MAX_SPREAD=.5;
// Habitude arrêtée : pas racheté depuis plus de 3 fois son rythme.
const STALE_CYCLES=3;

let refreshFrame=0;
let booted=false;
let lastSignature=null;

function intelligence(){return window.COURSES_PURCHASE_INTELLIGENCE||null}
function listService(){return window.COURSES_LIST||null}

// Les courses se font le week-end : la « prochaine course » est le week-end à venir
// (celui en cours le samedi et le dimanche), la suivante a lieu une semaine plus tard.
function nextTripStart(now=Date.now()){
  const date=new Date(now);
  date.setHours(0,0,0,0);
  const day=date.getDay();
  date.setDate(date.getDate()+(day===0?-1:(6-day)));
  return date.getTime();
}

/* À racheter : habitude prouvée et régulière, encore active, dont le rythme réel (durée typique entre
   deux achats, sans durée par défaut ni raccourci) est atteint à la prochaine course. */
function suggestionFor(name,now=Date.now()){
  const api=intelligence(),list=listService();
  if(!api?.isEnabled?.()||!list)return null;
  const p=api.profileFor?.(name);
  if(!p?.lastAt||Number(p.intervalSamples||0)<MIN_INTERVALS)return null;
  if(Number(list.getQuantity?.(name)||0)>0)return null;
  const cycle=Number(p.medianDays||0);
  if(!(cycle>=1)||Number(p.intervalSpread)>MAX_SPREAD)return null;
  if((now-p.lastAt)/DAY>cycle*STALE_CYCLES)return null;
  const ageAtTrip=(Math.max(now,nextTripStart(now))-p.lastAt)/DAY;
  // Tolérance d'un jour (ou 10 % du rythme) : un produit acheté chaque samedi ressort le samedi suivant.
  if(ageAtTrip<cycle-Math.max(1,cycle*.1))return null;
  const meta=META.get(name)||{};
  return {
    name,
    category:meta.category||p.category||'',
    sub:meta.sub||p.sub||'',
    cadence:Math.round(cycle),
    dueIn:Math.round(cycle-ageAtTrip),
    evidence:Number(p.intervalSamples||0)
  };
}

function suggestions(now=Date.now()){
  return NAMES.map(name=>suggestionFor(name,now)).filter(Boolean).sort((a,b)=>
    a.dueIn-b.dueIn||b.evidence-a.evidence||a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
}

// Prévient app.js (Favoris et sa pastille) seulement quand la liste des suggestions change.
function refresh(){
  if(refreshFrame)return;
  refreshFrame=requestAnimationFrame(()=>{
    refreshFrame=0;
    const items=suggestions();
    const signature=items.map(item=>item.name).join('\u0001');
    if(signature===lastSignature)return;
    lastSignature=signature;
    document.dispatchEvent(new CustomEvent('courses:repurchase-changed',{detail:{count:items.length,names:items.map(item=>item.name)}}));
  });
}

function bindEvents(){
  document.addEventListener('courses:list-changed',()=>refresh(true));
  document.addEventListener('courses:purchase-history-changed',()=>refresh(true));
  document.addEventListener('courses:lock-changed',event=>{
    if(event.detail?.locked)return;
    refresh(true);
  });
  window.addEventListener('storage',event=>{
    if(event.key==='courses-purchase-intelligence-v1'||event.key==='courses-purchase-intelligence-enabled-v1')refresh(true);
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh(true)});
}

function init(){
  if(booted)return;
  if(!intelligence()||!listService())return;
  booted=true;
  window.COURSES_REPURCHASE_SOON=Object.freeze({suggestions:()=>suggestions(),refresh:()=>refresh(true)});
  bindEvents();refresh();
}

function bootstrap(){
  if(intelligence()&&listService()){init();return}
  const owner=document.querySelector('script[data-purchase-intelligence]');
  if(owner){owner.addEventListener('load',init,{once:true});return}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
}

bootstrap();
})();
