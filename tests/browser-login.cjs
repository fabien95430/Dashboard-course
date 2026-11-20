const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const artifacts=process.env.COURSES_LOGIN_ARTIFACT_DIR||path.join(require('node:os').tmpdir(),'courses-login-preview');
fs.mkdirSync(artifacts,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
  const results=[];
  try{
    for(const [width,height] of [[402,874],[393,852],[375,812],[375,667],[320,568]]){
      const context=await browser.newContext({viewport:{width,height},screen:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block'});
      await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.hostname!=='courses.test')return route.abort();
        const file=path.join(root,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
        if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
        return route.fulfill({body:fs.readFileSync(file),contentType:mime[path.extname(file)]||'application/octet-stream'});
      });
      await context.addInitScript(()=>{
        const viewport=new EventTarget();
        Object.assign(viewport,{height:innerHeight,width:innerWidth,offsetTop:0,offsetLeft:0,scale:1});
        Object.defineProperty(window,'visualViewport',{value:viewport,configurable:true});
        window.testKeyboard=(height,offset=0)=>{viewport.height=height;viewport.offsetTop=offset;viewport.dispatchEvent(new Event('resize'));viewport.dispatchEvent(new Event('scroll'))};
      });
      const page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto('https://courses.test/',{waitUntil:'load'});
      await page.locator('#securityIdentifier').waitFor({state:'visible'});
      await page.locator('#securityIdentifier').fill('jeje');
      await page.locator('#securityPassword').fill('exemple');
      await page.locator('#securityPassword').blur();
      const boxes=()=>page.evaluate(()=>Object.fromEntries(['#securityTitle','.security-card-copy','#securityIdentifier','#securityPassword','#securitySubmit'].map(selector=>{
        const el=document.querySelector(selector),r=el.getBoundingClientRect();
        return [selector,{x:r.x,y:r.y,width:r.width,height:r.height,display:getComputedStyle(el).display}];
      })));
      const before=await boxes();
      await page.getByRole('textbox',{name:'Identifiant',exact:true}).waitFor({state:'visible'});
      assert.equal(await page.locator('#securitySubmit').textContent(),'Se connecter');
      assert.equal(await page.getByText('Mot de passe oublié ?',{exact:true}).count(),0);
      for(const selector of ['#securityIdentifier','#securityPassword']){
        const style=await page.locator(selector).evaluate(el=>{
          const css=getComputedStyle(el);
          return {borders:[css.borderTopWidth,css.borderRightWidth,css.borderBottomWidth,css.borderLeftWidth],radius:css.borderRadius};
        });
        // v883 : champs soulignés.
        assert.deepEqual(style.borders,['0px','0px','1px','0px']);
        assert.equal(style.radius,'0px');
      }
      const backgroundBefore=await page.locator('#securityOverlay').evaluate(el=>({h:el.getBoundingClientRect().height,size:getComputedStyle(el).backgroundSize}));
      const available=height-(height<=667?291:346);
      await page.locator('#securityIdentifier').focus();
      await page.evaluate(h=>testKeyboard(h),available);
      assert.deepEqual(await boxes(),before,'identifier focus layout '+width+'x'+height);
      await page.locator('#securityPassword').focus();
      assert.deepEqual(await boxes(),before,'password focus layout '+width+'x'+height);
      await page.locator('#securityPasswordToggle').click();
      assert.equal(await page.locator('#securityPassword').getAttribute('type'),'text');
      assert.equal(await page.locator('#securityPassword').inputValue(),'exemple');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'securityPassword');
      assert.deepEqual(await boxes(),before,'eye button layout '+width+'x'+height);
      await page.locator('#securityPasswordToggle').click();
      assert.equal(await page.locator('#securityPassword').getAttribute('type'),'password');
      const scrollable=await page.locator('.security-shell').evaluate(el=>el.classList.contains('is-scrollable'));
      if(height>=667)assert.ok(before['#securitySubmit'].y+before['#securitySubmit'].height<=available,'button above keyboard '+height);
      else assert.ok(scrollable||before['#securitySubmit'].y+before['#securitySubmit'].height<=available,'short screen: button visible or scrollable');
      // Même avec un formulaire plus compact, une erreur longue doit rester accessible.
      await page.locator('#securityError').evaluate(el=>{el.textContent='Erreur de connexion. '.repeat(30)});
      await page.evaluate(h=>testKeyboard(h),available);
      assert.equal(await page.locator('.security-shell').evaluate(el=>el.classList.contains('is-scrollable')),true,'long error scroll fallback');
      await page.locator('#securityError').evaluate(el=>{el.textContent=''});
      await page.evaluate(h=>testKeyboard(h),available);
      await page.evaluate(h=>testKeyboard(h,40),available);
      const compensated=await boxes();
      for(const key of Object.keys(before))assert.ok(Math.abs(compensated[key].y-before[key].y-40)<.1,'iOS offset compensation');
      await page.evaluate(h=>testKeyboard(h),height);
      await page.locator('#securityPassword').blur();
      assert.deepEqual(await boxes(),before,'closed keyboard layout');
      const backgroundAfter=await page.locator('#securityOverlay').evaluate(el=>({h:el.getBoundingClientRect().height,size:getComputedStyle(el).backgroundSize}));
      assert.deepEqual(backgroundAfter,backgroundBefore,'background sizing');
      if(width===402){
        await page.screenshot({path:path.join(artifacts,'login-402.png')});
        await page.locator('#securityPassword').focus();
        await page.evaluate(h=>testKeyboard(h),available);
        await page.screenshot({path:path.join(artifacts,'login-focus-402.png')});
        await page.locator('#securityIdentifier').fill('');
        await page.locator('#securitySubmit').click();
        await page.locator('#securityError').getByText('Entre ton identifiant.').waitFor();
        assert.equal((await boxes())['#securitySubmit'].y,before['#securitySubmit'].y,'error moves button');
      }
      assert.deepEqual(errors,[],'page runtime errors');
      results.push({width,height,buttonBottom:before['#securitySubmit'].y+before['#securitySubmit'].height,keyboardTop:available,scrollable,errors});
      await context.close();
    }
    fs.writeFileSync(path.join(artifacts,'browser-results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
