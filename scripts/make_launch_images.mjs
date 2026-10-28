// Génère les images de lancement iOS à partir du VRAI écran de connexion
// (même fond cover, même cadrage, logo + carte), pour que le passage
// image de lancement -> page ne montre aucun décalage ni fondu de fond.
// Usage : node scripts/make_launch_images.mjs   (Playwright requis)
import {createRequire} from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const SIZES=[[440,956,3],[430,932,3],[428,926,3],[420,912,3],[414,896,3],[414,896,2],[402,874,3],[393,852,3],[390,844,3],[375,812,3],[375,667,2]];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer((q,r)=>{
  let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,p);
  fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d)});
});
await new Promise(ok=>server.listen(0,ok));
const port=server.address().port;
const browser=await chromium.launch();
for(const [w,h,dpr] of SIZES){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:dpr,serviceWorkers:'block'});
  await ctx.addInitScript(()=>{try{localStorage.setItem('courses-secure-vault-v1',JSON.stringify({v:1,fake:true}))}catch{}});
  const pg=await ctx.newPage();
  await pg.goto(`http://localhost:${port}/`);
  await pg.waitForSelector('#securityOverlay.is-visible',{timeout:10000});
  await pg.evaluate(async()=>{
    document.body.classList.remove('is-launching');
    await document.fonts.ready;
    const ps=document.querySelector('#securityPassword');ps?.blur();
    const st=document.createElement('style');
    st.textContent='*{caret-color:transparent!important;animation:none!important;transition:none!important}#securityError,#updateBanner,.update-banner{display:none!important}';
    document.head.appendChild(st);
    for(const im of document.images)if(!im.complete)await new Promise(r=>{im.onload=im.onerror=r});
  });
  await pg.waitForTimeout(600);
  const out=path.join(root,'www/startup',`launch-${w*dpr}x${h*dpr}.jpg`);
  await pg.screenshot({path:out,type:'jpeg',quality:86});
  console.log('ok',path.relative(root,out));
  await ctx.close();
}
await browser.close();server.close();
