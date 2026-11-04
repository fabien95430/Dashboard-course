import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';

const hashes={"bouillon-cubes":"47794df706e83e199118ae18bba7190fe9f350d8","couscous":"f4bfd2b2cf4f20a9d75cc615e2704714bb16dd46","gelatine":"0b6d483baa62daf8d26354bd970fcc1745105a48","haricots-rouges":"c7dfd41703f2f5c4e3ef2ab9371bed287940999e","lentilles":"4de236fc6ba1efabf08b5d71a7eb565e0b68265b","levure-chimique":"d6b1795a0b8c84c70493278c1b6e445042123ffb","noix-de-coco-rapee":"d53e7dbd335229056a5f0f136256db352f2abbf2","nouilles-chinoises":"26121f23ece73bda79df3f947476900014e60714","nouilles-instantanees":"515e27c4bbc460c00481ca67187f68993b4e315f","pepites-chocolat":"56dc37203b368cbd8f25a2997913a23abfc381b2","pois-chiches":"6c93eadcae9233e268194ed8e73e76a264808af9","polenta":"0ad4ea4679ed26cf49aa6733f1d08f320268ff52","quinoa":"1bc93a5ac3dc2db08123a0d47c7dafa650ead885"};
const names={"noix-de-coco-rapee":"Noix de coco râpée","haricots-rouges":"Haricots rouges","levure-chimique":"Levure chimique","pepites-chocolat":"Pépites chocolat","bouillon-cubes":"Bouillon cubes","nouilles-chinoises":"Nouilles chinoises","nouilles-instantanees":"Nouilles instantanées","pois-chiches":"Pois chiches","gelatine":"Gélatine"};
const catalog=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');

test('les treize images Épicerie sont des WebP alpha 384 px et restent versionnées',()=>{
 for(const [slug,expected] of Object.entries(hashes)){
  const buf=readFileSync(new URL('../www/Items/'+slug+'.webp',import.meta.url));
  assert.equal(buf.toString('ascii',0,4),'RIFF',slug);
  assert.equal(buf.toString('ascii',8,12),'WEBP',slug);
  assert.equal(buf.toString('ascii',12,16),'VP8X',slug);
  assert.equal(buf[20]&0x10,0x10,slug+' manque de transparence');
  assert.equal(buf.readUIntLE(24,3)+1,384,slug);
  assert.equal(buf.readUIntLE(27,3)+1,384,slug);
  assert.ok(buf.length<=153600,slug+' trop lourd');
  assert.equal(createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex'),expected,slug);
  assert.ok(catalog.includes('"'+(names[slug]||slug.charAt(0).toUpperCase()+slug.slice(1))+'"'),slug+' absent du catalogue');
 }
});
