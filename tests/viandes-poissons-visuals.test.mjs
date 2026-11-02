import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const catalog=JSON.parse(readFileSync(resolve(root,'catalog.js'),'utf8').match(/groups:\s*(\{.*?\}),\s*favorites:/s)[1]);
const products=Object.values(catalog).flatMap(sub=>Object.values(sub).flat());
const filenames={"Blanc de poulet":"blanc-de-poulet","Saucisson":"saucisson","Maquereaux":"maquereaux","Sardines":"sardines","Poisson surgelé":"poisson-surgele","Dinde":"dinde","Escalopes de poulet":"escalopes-de-poulet"};

test('sept visuels Viandes & poissons sont des WebP RGBA 384px de taille maîtrisée',()=>{
  for(const [name,slug] of Object.entries(filenames)){
    assert.ok(products.includes(name),name+' doit rester dans catalog.js');
    const bytes=readFileSync(resolve(root,'www/Items',slug+'.webp'));
    assert.ok(bytes.length>1000&&bytes.length<=153600,slug+' poids');
    assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF',slug+' RIFF');
    assert.equal(bytes.subarray(8,16).toString('ascii'),'WEBPVP8X',slug+' WebP étendu');
    assert.ok((bytes[20]&0x10)!==0,slug+' transparence');
    const width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);
    const height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16);
    assert.equal(width,384,slug+' largeur');
    assert.equal(height,384,slug+' hauteur');
  }
});

test('les illustrations distinctes ne réutilisent plus les anciens visuels',()=>{
  for(const [replaced,reference] of [['saucisson','rosette'],['poisson-surgele','cabillaud'],['escalopes-de-poulet','filets-de-poulet'],['blanc-de-poulet','filets-de-poulet']]){
    const changed=readFileSync(resolve(root,'www/Items',replaced+'.webp'));
    const existing=readFileSync(resolve(root,'www/Items',reference+'.webp'));
    assert.notDeepEqual(changed,existing,replaced+' doit être distinct de '+reference);
  }
});

test('le service worker invalide exactement les nouveaux visuels de Viandes & poissons',()=>{
  const sw=readFileSync(resolve(root,'sw.js'),'utf8');
  const match=sw.match(/const UPDATED_ITEM_VISUALS=(\[[^\n]+\]);/);
  assert.ok(match,'liste des visuels mis à jour');
  const items=JSON.parse(match[1]);
  for(const slug of Object.values(filenames)){
    assert.equal(items.filter(item=>item==='./www/Items/'+slug+'.webp').length,1,slug+' invalidé une fois');
  }
});
