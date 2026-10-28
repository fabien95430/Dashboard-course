import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const gen=fs.readFileSync(new URL('../scripts/make_launch_images.mjs',import.meta.url),'utf8');

function jpegSize(buf){
  let i=2;
  while(i<buf.length){
    if(buf[i]!==0xff){i++;continue}
    const m=buf[i+1];
    if(m>=0xc0&&m<=0xc3)return{h:buf.readUInt16BE(i+5),w:buf.readUInt16BE(i+7)};
    i+=2+buf.readUInt16BE(i+2);
  }
  return null;
}

test('chaque image de lancement iOS existe à la taille exacte de son écran',()=>{
  const links=[...index.matchAll(/apple-touch-startup-image"\s+media="\(device-width: (\d+)px\) and \(device-height: (\d+)px\) and \(-webkit-device-pixel-ratio: (\d)\)[^"]*"\s+href="\.\/(www\/startup\/[^"]+)"/g)];
  assert.equal(links.length,11);
  for(const [,w,h,dpr,href] of links){
    const size=jpegSize(fs.readFileSync(new URL('../'+href,import.meta.url)));
    assert.deepEqual(size,{w:w*dpr,h:h*dpr},href);
  }
});

test('le générateur photographie la vraie page avec le même fond cover que l\'écran de connexion',()=>{
  assert.match(styles,/\.security-overlay\{[^}]*background-image:url\("\.\/welcome-background-v40\.webp"\)!important;[^}]*background-position:center center!important;[^}]*background-size:cover!important/s);
  assert.match(gen,/securityOverlay\.is-visible/);
  assert.match(gen,/is-launching/);
  for(const [w,h,dpr] of [[402,874,3],[393,852,3],[375,667,2]])assert.ok(gen.includes(`[${w},${h},${dpr}]`));
});
