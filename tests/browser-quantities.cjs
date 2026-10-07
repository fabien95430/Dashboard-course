// Optional integration check: requires Playwright and its Chromium browser.
// BROWSER_CHANNEL=msedge uses an installed Edge instead.
// Missing image files are replaced with placeholders: this is not visual QA.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const name=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).slice(1);
  const file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isFile()){
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    res.end(fs.readFileSync(file));return;
  }
  if(/\.(png|jpg|webp|svg)$/.test(name)){
    res.setHeader('Content-Type','image/svg+xml');
    res.end('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#ddd"/></svg>');return;
  }
  res.writeHead(404);res.end();
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
    const cases=[
      {dish:'Pâtes tomate mozzarella',ingredient:'Mozzarella',servings:4,expected:2},
      {dish:'Penne poulet crème',ingredient:'Poulet',servings:8,expected:10},
      {dish:'Crème brûlée',ingredient:'Crème liquide',servings:4,expected:3},
      {dish:'Spaghetti carbonara',ingredient:'Œufs',servings:4,expected:1},
      {dish:'Spaghetti carbonara',ingredient:'Spaghetti',servings:4,expected:1},
      {dish:'Crème brûlée',ingredient:'Crème liquide',servings:4,expected:3,initial:1,hideAdded:true},
      {dish:'Crème brûlée',ingredient:'Crème liquide',servings:4,expected:3,partial:true}
    ];
    for(const scenario of cases){
      const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
      try{
        await context.route('**/*',route=>route.request().url().startsWith(origin)||route.request().url().startsWith('data:')?route.continue():route.abort());
        await context.addInitScript(({ingredient,initial,hideAdded})=>{
          localStorage.setItem('courses-preferences-v1',JSON.stringify({hideAdded:Boolean(hideAdded)}));
          localStorage.setItem('courses-purchase-intelligence-enabled-v1','0');
          localStorage.setItem('courses-external-demo-items-v2',JSON.stringify(Array.from({length:initial||0},(_,i)=>({uid:'seed-'+i,summary:ingredient,status:'needs_action'}))));
        },scenario);
        const page=await context.newPage();page.setDefaultTimeout(12000);
        const errors=[];page.on('pageerror',error=>errors.push(error.message));
        await page.goto(origin);
        await page.locator('#demoBtn').click();
        await page.locator('.tab[data-view="catalog"]').click();
        await page.locator('.catalog-mode[data-mode="dishes"]').click();
        await page.locator('.dish-card[data-dish='+JSON.stringify(scenario.dish)+']').click();
        const input=page.locator('.dish-servings-value');
        await input.fill(String(scenario.servings));
        const row=page.locator('.dish-ingredient[data-ingredient='+JSON.stringify(scenario.ingredient)+']');
        await page.waitForFunction(({ingredient,expected})=>document.querySelector('.dish-ingredient[data-ingredient="'+ingredient+'"]')?.dataset.recipeQuantity===String(expected),scenario);
        await page.locator('.dish-sheet-head h2').click();
        await page.waitForTimeout(150);
        assert.equal(await row.getAttribute('data-recipe-quantity'),String(scenario.expected),'quantity after blur');
        assert.equal(await row.locator('.dish-ingredient-check').textContent(),'×'+scenario.expected);
        const names=await page.locator('.dish-ingredient[aria-pressed="true"]').evaluateAll(rows=>rows.map(row=>row.dataset.ingredient));
        for(const name of names){
          if(name===scenario.ingredient||(scenario.partial&&name==='Sucre'))continue;
          await page.locator('.dish-ingredient[data-ingredient='+JSON.stringify(name)+']').click();
        }
        if(scenario.partial)await page.evaluate(()=>{
          const original=window.COURSES_LIST;
          window.COURSES_LIST={...original,ensureQuantity:(name,target)=>name==='Sucre'?Promise.resolve({added:0,failed:1,present:0}):original.ensureQuantity(name,target)};
        });
        await page.waitForTimeout(150);
        await page.locator('.dish-sheet-add').evaluate(button=>{button.click();button.click();});
        await page.waitForFunction(()=>!document.getElementById('dishDialog').open);
        const result=await page.evaluate(()=>({items:JSON.parse(localStorage.getItem('courses-external-demo-items-v2')||'[]'),toast:document.getElementById('toast').textContent,appVersion:window.COURSES_APP_VERSION,versions:[...document.querySelectorAll('.page-version')].map(el=>el.textContent)}));
        assert.equal(result.items.filter(item=>item.summary===scenario.ingredient).length,scenario.expected,'added quantity after double click');
        assert.match(result.appVersion,/^v\d+$/);
        assert.deepEqual(result.versions,Array(3).fill(result.appVersion));
        if(scenario.partial){assert.match(result.toast,/Ajout partiel.*1 erreur/);assert.equal(result.items.filter(item=>item.summary==='Sucre').length,0);}
        else assert.match(result.toast,/unité/);
        assert.deepEqual(errors,[],'browser errors');
        console.log('PASS '+JSON.stringify(scenario));
      }finally{await context.close();}
    }
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
