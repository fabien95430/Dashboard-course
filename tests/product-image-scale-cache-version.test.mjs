import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const source=readFileSync(new URL('../product-item-images.js',import.meta.url),'utf8');
const cacheReader=source.match(/function loadVisualScaleCache\(\)\{[\s\S]*?\n\}\nfunction saveVisualScaleCacheSoon/);
const updated=source.match(/const UPDATED_IMAGE_SOURCES_V722=new Set\([\s\S]*?\]\.map\(slug=>'\.\/www\/Items\/'\+slug\+'\.webp'\)\);/);
assert.ok(cacheReader,'lecteur de cadrage introuvable');
assert.ok(updated,'les visuels changés doivent être identifiés');

function restore(stored,currentVersion){
  const visualScaleCache=new Map();
  const localStorage={getItem:()=>JSON.stringify(stored)};
  const code=updated[0]+'\n'+cacheReader[0].replace(/\nfunction saveVisualScaleCacheSoon$/,'')+'\nloadVisualScaleCache();';
  new Function('localStorage','visualScaleCache','VISUAL_SCALE_KEY','currentAppVersion',code)(
    localStorage,visualScaleCache,'courses-product-visual-scale-v1',()=>currentVersion
  );
  return visualScaleCache;
}
test('les nouveaux WebP sont remesurés sans effacer les cadrages inchangés',()=>{
  const old={version:'v721',items:{
    './www/Items/quinoa.webp':[1.45,0,18],
    './www/Items/riz-basmati.webp':[1.12,0,-2]
  }};
  const actual=restore(old,'v723');
  assert.equal(actual.has('./www/Items/quinoa.webp'),false);
  assert.deepEqual(actual.get('./www/Items/riz-basmati.webp'),{scale:1.12,shiftX:0,shiftY:-2});
});
test('les cadrages créés depuis la v722 restent valables en v723',()=>{
  const current={version:'v722',items:{'./www/Items/quinoa.webp':[1.09,2,-1]}};
  assert.deepEqual(restore(current,'v723').get('./www/Items/quinoa.webp'),{scale:1.09,shiftX:2,shiftY:-1});
});
test('les anciens caches sans version invalident seulement les images modifiées',()=>{
  const legacy={items:{
    './www/Items/quinoa.webp':[1.45,0,18],
    './www/Items/spaghetti.webp':[1,0,0]
  }};
  const restored=restore(legacy,'v723');
  assert.equal(restored.has('./www/Items/quinoa.webp'),false);
  assert.ok(restored.has('./www/Items/spaghetti.webp'));
});

test('v780 remesure les neuf boissons alcoolisées remplacées et conserve les autres cadrages',()=>{
  const beers=["biere-ambree","biere-aux-fruits","biere-blanche","biere-blonde","biere-brune","biere-ipa","biere-triple","panache","whisky"];
  const beerItems=Object.fromEntries(beers.map(slug=>['./www/Items/'+slug+'.webp',[1.1,0,0]]));
  const items={...beerItems,'./www/Items/coca.webp':[1.08,1,-1]};
  const migrated=restore({version:'v779',items},'v780');
  beers.forEach(slug=>assert.equal(migrated.has('./www/Items/'+slug+'.webp'),false));
  assert.deepEqual(migrated.get('./www/Items/coca.webp'),{scale:1.08,shiftX:1,shiftY:-1});
  const current=restore({version:'v780',items},'v780');
  beers.forEach(slug=>assert.ok(current.has('./www/Items/'+slug+'.webp')));
});

test('v781 remesure uniquement les onze visuels validés et conserve les cadrages récents',()=>{
  const juices=["jus-d-orange","jus-de-pomme","jus-d-ananas","jus-de-raisin","jus-de-tomate","jus-multifruits","jus-de-poire","biere-sans-alcool","rhum","ricard","tonic"];
  const items={...Object.fromEntries(juices.map(slug=>['./www/Items/'+slug+'.webp',[1.1,0,0]])),'./www/Items/vin-rouge.webp':[1.05,0,-1]};
  const migrated=restore({version:'v780',items},'v781');
  juices.forEach(slug=>assert.equal(migrated.has('./www/Items/'+slug+'.webp'),false));
  assert.deepEqual(migrated.get('./www/Items/vin-rouge.webp'),{scale:1.05,shiftX:0,shiftY:-1});
  const current=restore({version:'v781',items},'v781');
  juices.forEach(slug=>assert.ok(current.has('./www/Items/'+slug+'.webp')));
});
