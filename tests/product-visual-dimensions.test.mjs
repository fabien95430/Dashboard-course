import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const catalog=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');
const asset=slug=>'./www/Items/'+slug+'.webp';
const slugify=name=>name.toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const profiles=source.slice(source.indexOf('const PRODUCT_VISUAL_FACTORS='),source.indexOf('let visualScaleSaveTimer='));
const adjusted=new Function(profiles+';return {factors:PRODUCT_VISUAL_FACTORS,adjust:visualScaleForView};')();
function model(items={},storedVersion='v786'){
  const window={COURSES_CATALOG:{groups:{}},COURSES_APP_VERSION:'v786'};
  vm.runInNewContext(source,{
    window,document:{readyState:'loading',addEventListener(){}},
    localStorage:{getItem:key=>key==='courses-product-visual-scale-v1'?JSON.stringify({version:storedVersion,items}):null}
  });
  return window.COURSES_PRODUCT_IMAGES;
}
function value(style,key='scale'){
  return Number(style.match(new RegExp('--single-product-'+key+':([^;]+)'))?.[1].replace('%',''));
}

test('31 produits validés ont un profil, les 491 autres gardent leur cadrage',()=>{
  const groups=JSON.parse(catalog.match(/groups:\s*(\{.*?\}),\s*\n\s*favorites:/s)[1]);
  const sources=Object.values(groups).flatMap(g=>Object.values(g).flat()).map(n=>asset(slugify(n)));
  assert.equal(sources.length,522);
  assert.equal(adjusted.factors.size,31);
  for(const key of adjusted.factors.keys())assert.ok(sources.includes(key),key);
  const raw={scale:1.1,shiftX:2,shiftY:-3};
  let unchanged=0;
  for(const key of sources){
    if(adjusted.factors.has(key))continue;
    assert.equal(adjusted.adjust(key,raw),raw,key);
    unchanged++;
  }
  assert.equal(unchanged,491);
});
test('les capsules ont un rendu distinct par vue, dès le premier affichage et avec ancien cache',()=>{
  const cold=model();
  assert.equal(value(cold.visualScaleStyle(asset('capsules-cafe'))),.75);
  assert.equal(value(cold.visualScaleStyle(asset('capsules-cafe'),true)),.9);
  const cached=model({[asset('capsules-cafe')]:[1.2,2,-3]},'v785');
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe'))),.9);
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe'),true)),1.08);
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe')),'shift-x'),2);
  assert.equal(value(cached.visualScaleStyle(asset('capsules-cafe')),'shift-y'),-3);
});
test('le saucisson peut dépasser le plafond automatique sans agrandir toute la charcuterie',()=>{
  const images=model({[asset('saucisson')]:[1.45,0,0],[asset('rosette')]:[1.1,0,0]});
  assert.equal(value(images.visualScaleStyle(asset('saucisson'))),1.813);
  assert.equal(value(images.visualScaleStyle(asset('saucisson'),true)),1.711);
  assert.equal(value(images.visualScaleStyle(asset('rosette'))),1.1);
});
test('les mesures brutes ne changent pas et les ouvertures ne cumulent pas les facteurs',()=>{
  const raw={scale:1.2,shiftX:2,shiftY:-3};
  for(let i=0;i<5;i++){
    assert.equal(adjusted.adjust(asset('capsules-cafe'),raw).scale,.9);
    assert.equal(adjusted.adjust(asset('capsules-cafe'),raw,true).scale,1.08);
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
test('les deux thés sont agrandis avec leur fil entier, sans modifier le thé vert',()=>{
  const images=model({[asset('the-earl-grey')]:[1.45,0,0],[asset('the-fruits-rouges')]:[1.45,0,0],[asset('the-vert')]:[1,0,0]});
  for(const slug of ['the-earl-grey','the-fruits-rouges']){
    assert.equal(value(images.visualScaleStyle(asset(slug))),1.566);
    assert.equal(value(images.visualScaleStyle(asset(slug),true)),1.537);
  }
  assert.equal(value(images.visualScaleStyle(asset('the-vert'))),1);
});
test('la liste transmet son contexte compact et les images de fallback le conservent avant insertion',()=>{
  assert.ok(app.includes('visualScaleStyle?.(source,compact)'));
  assert.ok(source.includes("image.dataset.singleProductCompact=compact?'1':'0'"));
  assert.ok(source.includes('items[source]=[metrics.scale,metrics.shiftX,metrics.shiftY]'));
  assert.equal(model().visualScaleStyle(asset('riz-basmati')),'');
});
