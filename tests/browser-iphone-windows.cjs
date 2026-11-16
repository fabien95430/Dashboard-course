// Supplemental real-button flows in demo mode; no Home Assistant request.
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const out=process.argv[2]||'/tmp/courses-iphone-windows';
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{}),args:['--no-sandbox']});
  const results=[];
  try{
    for(const [width,height] of [[375,667],[375,812],[390,844],[393,852],[402,874],[420,912],[428,926],[430,932],[440,956],[466,678],[626,890]]){
      const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block'});
      try{
        const page=await context.newPage();
        await page.goto(process.env.AUDIT_ORIGIN||'http://127.0.0.1:8765');
        await page.locator('#demoBtn').click();
        await page.locator('.tab[data-view="catalog"]').click();
        await page.waitForFunction(()=>window.COURSES_DISH_NAMES&&document.querySelector('.dish-filters'));
        await page.locator('.tab[data-view="settings"]').click();
        for(const [selector,name] of [['#settingsRecipeCustomizationBtn','recipes'],['#settingsApplicationManagementBtn','management']]){
          await page.locator(selector).click();
          await page.waitForTimeout(600);
          const dialog=page.locator('dialog[open]');
          assert.equal(await dialog.count(),1);
          await dialog.evaluate(e=>e.scrollTop=e.scrollHeight);
          const metrics=await dialog.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,bottom:r.bottom,horizontalOverflow:e.scrollWidth-e.clientWidth,documentOverflow:document.documentElement.scrollWidth-innerWidth}});
          // Record internal overflow for visual review; only document overflow is necessarily unintended.
          assert.equal(metrics.documentOverflow,0);
          assert.ok(metrics.x>=0&&metrics.bottom<=height+1);
          results.push({width,height,name,...metrics});
          await page.screenshot({path:`${out}/${width}x${height}-${name}.png`,scale:'css',animations:'disabled'});
          await dialog.evaluate(e=>e.close());
        }
      }finally{await context.close();}
    }
  }finally{await browser.close();}
  fs.writeFileSync(out+'/measurements.json',JSON.stringify(results,null,2));
  console.log('PASS',results.length,'configuration windows');
})().catch(error=>{console.error(error);process.exitCode=1;});
