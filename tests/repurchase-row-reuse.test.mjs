import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// v903 : « À prévoir » n'a plus d'écran à part ; ses suggestions « À racheter » sont fusionnées dans
// Favoris (app.js). Ce fichier vérifie désormais les règles du moteur (repurchase-soon.js) et la fusion.
const source=fs.readFileSync(new URL('../repurchase-soon.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function extract(startMarker,endMarker){
  const start=source.indexOf(startMarker);
  const end=source.indexOf(endMarker,start);
  assert.ok(start>=0&&end>start,`section introuvable: ${startMarker}`);
  return source.slice(start,end);
}

const DAY=86400000;
const at=(y,m,d,h=12)=>new Date(y,m-1,d,h).getTime();
const tripCode=extract('function nextTripStart(now=Date.now()){','/* À racheter');
const trips=new Function(tripCode+';return {nextTripStart};')();
const rules=extract('const DAY=86400000;','let refreshFrame=0;');
const make=new Function('intelligence','listService','CATALOG',rules+tripCode+extract('function suggestionFor(name,now=Date.now()){','function suggestions(')+';return suggestionFor;');

function engine(profiles,inList=new Set()){
  const api={isEnabled:()=>true,profileFor:name=>profiles[name]||null};
  return make(()=>api,()=>({getQuantity:name=>inList.has(name)?1:0}),{groups:{}});
}

test('À racheter cale la prochaine course sur le week-end',()=>{
  // 7 novembre 2026 = samedi.
  assert.equal(trips.nextTripStart(at(2026,11,4)),at(2026,11,7,0),'mercredi → samedi qui vient');
  assert.equal(trips.nextTripStart(at(2026,11,7,18)),at(2026,11,7,0),'samedi → ce week-end');
  assert.equal(trips.nextTripStart(at(2026,11,8,10)),at(2026,11,7,0),'dimanche → ce week-end');
});

test('À racheter : une habitude prouvée (au moins 3 achats sur des courses différentes)',()=>{
  const now=at(2026,11,4);
  const lastAt=at(2026,10,31,11);
  const suggest=engine({
    Lait:{lastAt,intervalSamples:2,medianDays:7,intervalSpread:0},
    Brie:{lastAt,intervalSamples:1,medianDays:7,intervalSpread:0},
    Pain:{lastAt,intervalSamples:0,medianDays:0,intervalSpread:0}
  });
  assert.ok(suggest('Lait',now),'3 achats hebdomadaires : à racheter samedi');
  assert.equal(suggest('Brie',now),null,'2 achats seulement : pas encore une habitude');
  assert.equal(suggest('Pain',now),null,'un seul achat : rien');
});

test('À racheter : rythme régulier et réel, sans durée par défaut ni raccourci',()=>{
  const now=at(2026,11,4);
  const suggest=engine({
    Riz:{lastAt:at(2026,10,31,11),intervalSamples:4,medianDays:28,intervalSpread:.1},
    Chips:{lastAt:at(2026,10,17,11),intervalSamples:4,medianDays:14,intervalSpread:.8},
    Lessive:{lastAt:at(2026,10,10,11),intervalSamples:3,medianDays:28,intervalSpread:.1}
  });
  assert.equal(suggest('Riz',now),null,'acheté il y a une semaine, rythme de 4 semaines : pas encore');
  assert.equal(suggest('Chips',now),null,'achats irréguliers : jamais proposé');
  assert.ok(suggest('Lessive',now),'4 semaines atteintes samedi (10/10 → 07/11)');
  assert.equal(suggest('Lessive',now).cadence,28);
});

test('À racheter : habitude arrêtée et produit déjà dans Ma liste exclus',()=>{
  const now=at(2026,11,4);
  const profiles={
    Yaourts:{lastAt:at(2026,9,1,11),intervalSamples:5,medianDays:7,intervalSpread:0},
    Oeufs:{lastAt:at(2026,10,31,11),intervalSamples:5,medianDays:7,intervalSpread:0}
  };
  assert.equal(engine(profiles)('Yaourts',now),null,'pas racheté depuis plus de 3 fois son rythme');
  assert.equal(engine(profiles,new Set(['Oeufs']))('Oeufs',now),null,'déjà dans Ma liste');
  assert.ok(engine(profiles)('Oeufs',now));
});

test('À racheter : un produit acheté chaque samedi ressort le samedi suivant, pas avant',()=>{
  const suggest=engine({Saumon:{lastAt:at(2026,11,7,11),intervalSamples:3,medianDays:7,intervalSpread:0}});
  assert.equal(suggest('Saumon',at(2026,11,7,18)),null,'acheté aujourd hui : rien');
  assert.ok(suggest('Saumon',at(2026,11,11)),'mercredi : prévu pour samedi 14');
});

test('À racheter fusionné dans Favoris : en tête, mention et pastille ; plus d écran à part',()=>{
  assert.match(app,/function favorites\(\)\{\s*const due=dueProducts\(\);[\s\S]*?return \[\.\.\.due,\.\.\.out\];/);
  assert.match(app,/productCardCache\.forEach\(\(card,key\)=>card\.classList\.toggle\('is-due',active&&repurchaseDue\.has\(key\)\)\);/);
  const quantities=fs.readFileSync(new URL('../catalog-quantities.js',import.meta.url),'utf8');
  assert.match(quantities,/const subcategory=card\.classList\.contains\('is-due'\)\?'À racheter':String\(meta\?\.sub\|\|meta\?\.category\|\|''\);/);
  assert.match(app,/const chip=\$\('#categories \.cat\[data-category="Favoris"\]'\);/);
  assert.match(app,/document\.addEventListener\('courses:repurchase-changed',\(\)=>\{/);
  assert.match(source,/new CustomEvent\('courses:repurchase-changed',\{detail:\{count:items\.length/);
  assert.doesNotMatch(index,/repurchaseSoonBtn/);
  assert.doesNotMatch(source,/showModal|repurchaseSoonDialog|createElement\('dialog'\)/);
});

test('les marques À racheter suivent le thème global',()=>{
  const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/--due:#c4621c;/);
  assert.match(css,/\.product\.is-due \.pcat\{color:var\(--due\);font-weight:700\}/);
  assert.match(css,/\.cat \.cat-count\{[^}]*background:var\(--danger\);[^}]*text-box:trim-both cap alphabetic/);
});
