import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {COURSES_TEXT} from './courses-text.mjs';

const source=readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');
const asset=slug=>'./www/Items/'+slug+'.webp';
const slugify=name=>name.toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const profiles=source.slice(source.indexOf('const PRODUCT_VISUAL_FACTORS='),source.indexOf('let visualScaleSaveTimer='));
const adjusted=new Function(profiles+';return {factors:PRODUCT_VISUAL_FACTORS,adjust:visualScaleForView};')();
function model(items={},storedVersion='v786'){
  const window={COURSES_TEXT,COURSES_CATALOG:{groups:{}},COURSES_APP_VERSION:'v786'};
  vm.runInNewContext(source,{
    window,document:{readyState:'loading',addEventListener(){}},
    localStorage:{getItem:key=>key==='courses-product-visual-scale-v1'?JSON.stringify({version:storedVersion,items}):null}
  });
  return window.COURSES_PRODUCT_IMAGES;
}
function value(style,key='scale'){
  return Number(style.match(new RegExp('--single-product-'+key+':([^;]+)'))?.[1].replace('%',''));
}

test('profils intermédiaires validés, les autres produits gardent leur cadrage',()=>{
  const groups=JSON.parse(catalog.match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s)[1]);
  const sources=Object.values(groups).flatMap(g=>Object.values(g).flat()).map(n=>asset(slugify(n)));
  assert.ok(sources.length>0);
  assert.equal(new Set(sources).size,sources.length,'un fichier visuel distinct par produit');
  assert.equal(adjusted.factors.size,347);
  for(const key of adjusted.factors.keys())assert.ok(sources.includes(key),key);
  const raw={scale:1.1,shiftX:2,shiftY:-3};
  let unchanged=0;
  for(const key of sources){
    if(adjusted.factors.has(key))continue;
    assert.equal(adjusted.adjust(key,raw),raw,key);
    unchanged++;
  }
  assert.equal(unchanged,sources.length-adjusted.factors.size);
});
test('les capsules ont un rendu distinct par vue, dès le premier affichage et avec ancien cache',()=>{
  const cold=model();
  assert.equal(value(cold.visualScaleStyle(asset('capsules-cafe'))),0.688);
  assert.equal(value(cold.visualScaleStyle(asset('capsules-cafe'),true)),0.792);
  const cached=model({[asset('capsules-cafe')]:[1.2,2,-3]},'v785');
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe'))),0.826);
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe'),true)),0.95);
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe')),'shift-x'),2);
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe')),'shift-y'),-3);
});
test('saucisson et rosette gardent les profils distincts de l’audit révisé',()=>{
  const images=model({[asset('saucisson')]:[1.45,0,0],[asset('rosette')]:[1.1,0,0]});
  assert.equal(value(images.visualScaleStyle(asset('saucisson'))),1.7);
  assert.equal(value(images.visualScaleStyle(asset('saucisson'),true)),1.711);
  assert.equal(value(images.visualScaleStyle(asset('rosette'))),1.036);
});
test('les mesures brutes ne changent pas et les ouvertures ne cumulent pas les facteurs',()=>{
  const raw={scale:1.2,shiftX:2,shiftY:-3};
  for(let i=0;i<5;i++){
    assert.equal(adjusted.adjust(asset('capsules-cafe'),raw).scale,0.826);
    assert.equal(adjusted.adjust(asset('capsules-cafe'),raw,true).scale,0.95);
  }
  assert.deepEqual(raw,{scale:1.2,shiftX:2,shiftY:-3});
  const items={[asset('capsules-cafe')]:[1.2,2,-3]};
  assert.equal(model(items,'v785').visualScaleStyle(asset('capsules-cafe')),model(items).visualScaleStyle(asset('capsules-cafe')));
  assert.deepEqual(items,{[asset('capsules-cafe')]:[1.2,2,-3]});
});
test('le dessin après chargement et le style initial appliquent exactement le même profil',()=>{
  const setter=source.match(/function setVisualScale\(image,metrics\)\{[\s\S]*?\n\}/)[0];
  const apply=new Function('image','metrics',profiles+'\n'+setter+'\nsetVisualScale(image,metrics);');
  const raw={scale:1.2,shiftX:2,shiftY:-3};
  for(const [compact,detached] of [[false,false],[true,false],[true,true]]){
    const style={};
    const image={
      dataset:{singleProductSource:asset('capsules-cafe'),singleProductCompact:detached?'1':'0'},
      closest:()=>compact&&!detached?{}:null,
      style:{setProperty:(key,v)=>{style[key]=v}}
    };
    apply(image,raw);
    assert.equal(Number(style['--single-product-scale']),value(model({[asset('capsules-cafe')]:[1.2,2,-3]}).visualScaleStyle(asset('capsules-cafe'),compact)));
    assert.equal(style['--single-product-shift-x'],'2%');
    assert.equal(style['--single-product-shift-y'],'-3%');
  }
});
test('les thés gardent leur fil entier avec les profils réduits validés',()=>{
  const images=model({[asset('the-earl-grey')]:[1.45,0,0],[asset('the-fruits-rouges')]:[1.45,0,0],[asset('the-vert')]:[1,0,0]});
  for(const slug of ['the-earl-grey','the-fruits-rouges']){
    assert.equal(value(images.visualScaleStyle(asset(slug))),1.356);
    assert.equal(value(images.visualScaleStyle(asset(slug),true)),1.384);
  }
  assert.equal(value(images.visualScaleStyle(asset('the-vert'))),0.885);
});
test('la liste transmet son contexte compact et les images de fallback le conservent avant insertion',()=>{
  assert.ok(app.includes('visualScaleStyle?.(source,compact)'));
  assert.ok(source.includes("image.dataset.singleProductCompact=compact?'1':'0'"));
  assert.ok(source.includes('items[source]=[metrics.scale,metrics.shiftX,metrics.shiftY]'));
  assert.equal(model().visualScaleStyle(asset('riz-basmati')),'');
});

test('les petits formats restent inférieurs aux paquets dans les deux vues',()=>{
  for(const compact of [false,true]){
    const base={scale:1,shiftX:0,shiftY:0};
    const factor=slug=>adjusted.adjust(asset(slug),base,compact).scale;
    assert.ok(70.2*factor('desserts-lactes-bebe')<50.6*factor('gateaux-bebe'),'largeur du pot enfant inférieure au paquet');
    assert.ok(66*factor('desserts-lactes-bebe')<70.2*factor('gateaux-bebe'),'hauteur du pot enfant inférieure au paquet');
    assert.ok(factor('paprika')<factor('mayonnaise'),'épices inférieures aux sauces');
    assert.ok(factor('mayonnaise')<factor('riz-basmati'),'sauce inférieure au paquet de riz');
  }
});


test('les légumes fins retrouvent de la présence sans agrandir les gros légumes',()=>{
  const base={scale:1,shiftX:0,shiftY:0};
  for(const compact of [false,true]){
    for(const slug of ['carottes','courgettes','haricots-verts','poireaux','asperges'])assert.equal(adjusted.adjust(asset(slug),base,compact).scale,1.04,slug);
    for(const slug of ['basilic','ciboulette','coriandre','menthe','persil','romarin-frais','thym-frais','ail','echalotes','gingembre','pommes-de-terre','patates-douces'])assert.equal(adjusted.adjust(asset(slug),base,compact),base,slug);
    for(const slug of ['chou-blanc','chou-rouge','chou-fleur','potiron','courge','butternut'])assert.equal(adjusted.adjust(asset(slug),base,compact),base,slug);
    assert.equal(adjusted.adjust(asset('desserts-lactes-bebe'),base,compact).scale,.7);
  }
});
