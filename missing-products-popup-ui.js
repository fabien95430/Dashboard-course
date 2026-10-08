(()=>{
'use strict';

const HOLD_MS=800;
const SVG_PRODUCT='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 20h17v31H12z" fill="#f7f2e8" stroke="#758575" stroke-width="2"/><path d="M15 16h11l3 4H12z" fill="#e8eee6" stroke="#758575" stroke-width="2"/><path d="M38 14h9v7h-9z" fill="#d7dfd4"/><path d="M35 20h15l2 6v25H33V26z" fill="#859583"/><path d="M38 28h9" stroke="#f4f1e9" stroke-width="2.5" stroke-linecap="round"/></svg>';
const SVG_DISH='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M11 45h42" stroke="#ad791d" stroke-width="3.5" stroke-linecap="round"/><path d="M16 42c0-13 7-22 16-22s16 9 16 22z" fill="#d6a33d"/><circle cx="32" cy="17" r="3.5" fill="#ad791d"/><path d="M15 42h34" stroke="#9f6c16" stroke-width="3" stroke-linecap="round"/></svg>';
const SVG_DESSERT='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M21 31h22l-2.5 20h-17z" fill="#c9714f"/><path d="M18.5 30h27" stroke="#9f5237" stroke-width="3" stroke-linecap="round"/><path d="M20 29c1-6.2 5.8-10 12-10s11 3.8 12 10z" fill="#dd9777"/><circle cx="32" cy="15" r="3" fill="#a9513c"/></svg>';
const SVG_MENU_OPENAI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7c.55 4.55 2.75 6.75 7.3 7.3-4.55.55-6.75 2.75-7.3 7.3-.55-4.55-2.75-6.75-7.3-7.3 4.55-.55 6.75-2.75 7.3-7.3Z" fill="currentColor"/><circle cx="18.4" cy="17.9" r="1.55" fill="currentColor" opacity=".75"/></svg>';
const SVG_MENU_CHATGPT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M9 6h9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_MENU_DELETE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6.5 7l.8 13h9.4l.8-13M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_MENU_MORE='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.65" fill="currentColor"/><circle cx="12" cy="12" r="1.65" fill="currentColor"/><circle cx="19" cy="12" r="1.65" fill="currentColor"/></svg>';

let openMenu=null;
let holdTimer=0;
let holdButton=null;
let decorateFrame=0;

function normalize(value){
  return String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
function isDessertRow(row){
  const label=normalize(row.querySelector('.missing-product-copy small')?.textContent||'');
  const name=normalize(row.querySelector('.missing-product-copy strong')?.textContent||'');
  if(label.includes('dessert'))return true;
  return /\b(riz au lait|salade de fruits|creme brulee|tiramisu|mousse|flan|gateau|tarte|glace|sorbet|panna cotta|brownie|cookie|dessert)\b/.test(name);
}
function rowType(row){
  if(row.hasAttribute('data-missing-product-row'))return 'product';
  return isDessertRow(row)?'dessert':'dish';
}
function thumbSvg(type){
  if(type==='product')return SVG_PRODUCT;
  if(type==='dessert')return SVG_DESSERT;
  return SVG_DISH;
}
function closeMenu(){
  stopHold();
  if(openMenu){openMenu.remove();openMenu=null;}
  document.querySelectorAll('#missingProductsDialog .missing-row-more[aria-expanded="true"]').forEach(button=>button.setAttribute('aria-expanded','false'));
}
function resetPopupInteraction(dialog){
  closeMenu();
  resetModeLens(dialog);
}
function stopHold(){
  if(holdTimer){clearTimeout(holdTimer);holdTimer=0;}
  if(holdButton){holdButton.classList.remove('is-holding');holdButton=null;}
}
function triggerOpenAi(row){
  const magic=row.querySelector('[data-openai-missing-product],[data-openai-missing-dish]');
  if(!magic||magic.disabled)return false;
  navigator.vibrate?.([12,35,18]);
  magic.click();
  return true;
}
function positionMenu(menu,anchor){
  const rect=anchor.getBoundingClientRect();
  const dialog=document.getElementById('missingProductsDialog');
  const dialogRect=dialog?.getBoundingClientRect?.();
  const margin=14;
  const leftBound=Math.max(margin,(dialogRect?.left||0)+margin);
  const rightBound=Math.min(window.innerWidth-margin,(dialogRect?.right||window.innerWidth)-margin);
  const topBound=Math.max(margin,(dialogRect?.top||0)+margin);
  const bottomBound=Math.min(window.innerHeight-margin,(dialogRect?.bottom||window.innerHeight)-margin);
  const width=Math.min(224,Math.max(204,rightBound-leftBound));
  menu.style.width=width+'px';
  const left=Math.max(leftBound,Math.min(rightBound-width,rect.right-width+2));
  menu.style.left=left+'px';
  const below=rect.bottom+6;
  const above=rect.top-menu.offsetHeight-6;
  const placeAbove=below+menu.offsetHeight>bottomBound&&above>=topBound;
  menu.classList.toggle('is-above',placeAbove);
  const top=placeAbove?above:Math.min(bottomBound-menu.offsetHeight,below);
  menu.style.top=Math.max(topBound,top)+'px';
}
function startHold(button,row){
  if(button.disabled||button.classList.contains('is-disabled'))return;
  stopHold();
  holdButton=button;
  button.classList.add('is-holding');
  holdTimer=setTimeout(()=>{
    holdTimer=0;
    button.classList.remove('is-holding');
    holdButton=null;
    if(triggerOpenAi(row))closeMenu();
  },HOLD_MS);
}
function bindHold(button,row){
  button.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button>0)return;
    event.preventDefault();
    startHold(button,row);
  });
  ['pointerup','pointercancel','pointerleave'].forEach(type=>button.addEventListener(type,stopHold));
  button.addEventListener('contextmenu',event=>event.preventDefault());
  button.addEventListener('click',event=>event.preventDefault());
  button.addEventListener('keydown',event=>{
    if(event.key!==' '&&event.key!=='Enter')return;
    if(event.repeat)return;
    event.preventDefault();
    startHold(button,row);
  });
  button.addEventListener('keyup',event=>{
    if(event.key===' '||event.key==='Enter'){event.preventDefault();stopHold();}
  });
}
function openRowMenu(row,anchor){
  closeMenu();
  const menu=document.createElement('div');
  menu.className='missing-row-menu';
  menu.setAttribute('role','menu');
  const appendAction=(label,icon,target)=>{
    const action=document.createElement('button');
    action.type='button';
    action.className='missing-row-menu-item';
    action.setAttribute('role','menuitem');
    action.innerHTML='<span class="missing-menu-icon" aria-hidden="true">'+icon+'</span><span><strong>'+label+'</strong></span>';
    const disabled=!target||target.disabled;
    action.disabled=disabled;
    action.classList.toggle('is-disabled',disabled);
    action.setAttribute('aria-disabled',String(disabled));
    if(!disabled){
      action.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        target.click();
      });
    }
    menu.appendChild(action);
  };
  appendAction('Intégrer avec OpenAI',SVG_MENU_OPENAI,row.querySelector('[data-openai-missing-product],[data-openai-missing-dish]'));
  appendAction('Intégrer avec ChatGPT',SVG_MENU_CHATGPT,row.querySelector('[data-integrate-missing-product],[data-integrate-missing-dish]'));
  const remove=document.createElement('button');
  remove.type='button';
  remove.className='missing-row-menu-item is-danger';
  remove.setAttribute('role','menuitem');
  remove.innerHTML='<span class="missing-menu-icon" aria-hidden="true">'+SVG_MENU_DELETE+'</span><span><strong>Supprimer</strong></span>';
  remove.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    const native=row.querySelector('.missing-product-remove');
    if(native){
      const nativeClick=new MouseEvent('click',{bubbles:true,cancelable:true,view:window,clientX:native.getBoundingClientRect().left+1,clientY:native.getBoundingClientRect().top+1});
      native.dispatchEvent(nativeClick);
    }
    closeMenu();
  });
  menu.appendChild(remove);
  (document.getElementById('missingProductsDialog')||document.body).appendChild(menu);
  openMenu=menu;
  anchor.setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>positionMenu(menu,anchor));
}
function ensureMore(row){
  let button=row.querySelector('.missing-row-more');
  if(button)return button;
  button=document.createElement('button');
  button.type='button';
  button.className='missing-row-more';
  button.setAttribute('aria-label','Plus d’actions');
  button.setAttribute('aria-haspopup','menu');
  button.setAttribute('aria-expanded','false');
  button.innerHTML=SVG_MENU_MORE;
  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    if(openMenu&&button.getAttribute('aria-expanded')==='true'){closeMenu();return;}
    openRowMenu(row,button);
  });
  row.appendChild(button);
  return button;
}
function ensureThumb(row,type){
  let thumb=row.querySelector('.missing-request-thumb');
  if(!thumb){
    thumb=document.createElement('span');
    thumb.className='missing-request-thumb';
    thumb.setAttribute('aria-hidden','true');
    const copy=row.querySelector('.missing-product-copy');
    if(copy)row.insertBefore(thumb,copy);
    else row.prepend(thumb);
  }
  thumb.className='missing-request-thumb is-'+type;
  thumb.innerHTML=thumbSvg(type);
}
function syncRunning(row){
  const integrate=row.querySelector('[data-integrate-missing-product],[data-integrate-missing-dish]');
  if(!integrate)return;
  const added=row.dataset.missingDishAdded==='1'||row.classList.contains('is-added-request');
  if(added){
    integrate.disabled=true;
    integrate.textContent='Ajouté ✓';
    integrate.classList.remove('is-running-label');
    integrate.classList.add('is-added-label');
    row.classList.remove('is-running-request');
    return;
  }
  integrate.classList.remove('is-added-label');
  const running=integrate.classList.contains('is-running')||integrate.disabled;
  integrate.textContent=running?'En cours…':'Intégrer';
  integrate.classList.toggle('is-running-label',running);
  row.classList.toggle('is-running-request',running);
}
function bindModeSwitch(dialog){
  const modeSwitch=dialog.querySelector('.missing-mode-switch');
  if(!modeSwitch||modeSwitch.dataset.popupModeGuard==='1')return false;
  modeSwitch.dataset.popupModeGuard='1';
  modeSwitch.addEventListener('click',event=>event.stopPropagation());
  return true;
}
function resetModeLens(dialog){
  const modeSwitch=dialog.querySelector('.missing-mode-switch');
  if(!modeSwitch)return;
  modeSwitch.classList.remove('is-liquid-moving');
  modeSwitch.style.setProperty('--sx','1');
  modeSwitch.style.setProperty('--sy','1');
  modeSwitch.style.setProperty('--missing-lens-content-scale','1');
  modeSwitch.style.setProperty('--missing-lens-content-shift','0px');
  modeSwitch.querySelectorAll('.missing-mode-button').forEach(button=>{
    button.classList.remove('is-liquid-under');
    const label=[...button.children].find(node=>node.tagName==='SPAN');
    if(label){
      label.style.webkitMaskImage='';
      label.style.maskImage='';
    }
    const copy=button.querySelector('.missing-mode-lens-copy');
    if(copy){
      copy.style.opacity='0';
      copy.style.clipPath='inset(0 100% 0 0)';
      copy.style.webkitClipPath='inset(0 100% 0 0)';
    }
  });
  if(dialog.open)requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
}
function decorateRow(row){
  if(!(row instanceof HTMLElement))return;
  const type=rowType(row);
  row.classList.remove('is-request-product','is-request-dish','is-request-dessert');
  row.classList.add('missing-request-row','is-request-'+type);
  ensureThumb(row,type);
  ensureMore(row);
  syncRunning(row);
}
function decorate(){
  decorateFrame=0;
  const dialog=document.getElementById('missingProductsDialog');
  if(!dialog)return;
  const bound=bindModeSwitch(dialog);
  if(bound&&dialog.open)requestAnimationFrame(()=>resetModeLens(dialog));
  dialog.querySelectorAll('[data-missing-product-row],[data-missing-dish-row]').forEach(decorateRow);
}
function queueDecorate(){
  if(decorateFrame)return;
  decorateFrame=requestAnimationFrame(decorate);
}
function installStyle(){
  if(document.getElementById('missing-products-popup-ui-style'))return;
  const style=document.createElement('style');
  style.id='missing-products-popup-ui-style';
  style.textContent=`
    #missingProductsDialog #missingProductsList[hidden],#missingProductsDialog #missingDishesList[hidden]{display:none!important}
    #missingProductsDialog .missing-products-header h3{font-size:22px!important;line-height:1.08!important;letter-spacing:-.35px!important;margin-bottom:0!important}
    #missingProductsDialog .dialog-intro{font-size:13px!important;line-height:1.38!important;margin-top:7px!important}
    #missingProductsDialog .missing-products-add{gap:8px!important;margin-bottom:10px!important}
    #missingProductsDialog .missing-products-add #missingProductName{height:46px!important;border-radius:15px!important;padding:0 14px!important;font-size:15px!important}
    #missingProductsDialog .missing-products-add #addMissingProduct.primary{height:46px!important;min-width:92px!important;border-radius:15px!important;padding:0 15px!important;font-size:14px!important}
    #missingProductsDialog .missing-category-panel{margin-bottom:16px!important;padding:10px!important;border-radius:18px!important}
    #missingProductsDialog .missing-category-panel .missing-category-heading{margin-bottom:7px!important}
    #missingProductsDialog .missing-category-panel .missing-category-select{height:44px!important;border-radius:14px!important;font-size:13px!important}
    #missingProductsDialog .missing-product-row.missing-request-row{position:relative!important;display:grid!important;grid-template-columns:48px minmax(0,1fr) 36px!important;gap:8px!important;min-height:68px!important;padding:8px!important;align-items:center!important;overflow:visible!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-mark{display:none!important}
    #missingProductsDialog .missing-request-thumb{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(54,75,60,.045)}
    #missingProductsDialog .missing-request-thumb svg{width:36px;height:36px;display:block}
    #missingProductsDialog .missing-request-thumb.is-product{background:linear-gradient(145deg,#eef7ed,#e5efe6)}
    #missingProductsDialog .missing-request-thumb.is-dish{background:linear-gradient(145deg,#fff6df,#f8e9c1)}
    #missingProductsDialog .missing-request-thumb.is-dessert{background:linear-gradient(145deg,#fff0e7,#f8d9c9)}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy{display:flex!important;flex-flow:row wrap!important;align-items:center!important;align-self:center!important;column-gap:5px!important;row-gap:3px!important;min-width:0!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy strong{display:block!important;flex:0 0 100%!important;min-width:0!important;font-size:14.5px!important;line-height:1.22!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:break-word!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){padding:4px 8px!important;font-size:9.5px!important;line-height:1.15!important}
    #missingProductsDialog .is-request-product .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){background:#edf7f0!important;color:#19804a!important}
    #missingProductsDialog .is-request-dish .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){background:#fff4d9!important;color:#9b6811!important}
    #missingProductsDialog .is-request-dessert .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){background:#fff0e8!important;color:#ad5b39!important}
    #missingProductsDialog .missing-product-copy .missing-dish-progress,#missingProductsDialog .missing-product-copy small.missing-dish-progress{display:inline-flex!important;align-items:center!important;width:max-content!important;max-width:100%!important;margin:0!important;padding:3px 7px!important;font-size:9.5px!important;line-height:1!important;white-space:nowrap!important}
    #missingProductsDialog .missing-product-remove{display:none!important}
    #missingProductsDialog .missing-product-row.missing-request-row>.missing-product-integrate,#missingProductsDialog .missing-product-row.missing-request-row .missing-dish-actions{display:none!important}
    #missingProductsDialog .missing-row-more{width:32px;height:32px;min-width:32px;padding:0;border:0;border-radius:50%;background:rgba(118,118,128,.08);color:#59645f;display:grid;place-items:center;box-shadow:none;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
    #missingProductsDialog .missing-row-more svg{width:18px;height:18px;display:block}
    #missingProductsDialog .missing-row-more:active{transform:scale(.94);background:rgba(118,118,128,.14)}
    #missingProductsDialog .missing-product-integrate,#missingProductsDialog .missing-dish-integrate{min-width:78px!important;min-height:36px!important;padding:0 10px!important;font-size:11px!important}
    #missingProductsDialog .missing-product-integrate.is-running-label,#missingProductsDialog .missing-dish-integrate.is-running-label{background:#eef3ef!important;color:#7b8d82!important;opacity:1!important}
    #missingProductsDialog .missing-dish-integrate.is-added-label{background:#edf0ee!important;color:#65736b!important;opacity:1!important}
    #missingProductsDialog .is-added-request .missing-product-copy strong{color:#748078!important}
    #missingProductsDialog .is-added-request .missing-request-thumb{filter:saturate(.45);opacity:.72}
    #missingProductsDialog .is-added-request .missing-row-more{color:#7f8983!important}
    #missingProductsDialog .missing-dish-magic{display:none!important}
    .missing-row-menu{position:fixed;z-index:2147483647;padding:4px 0;border:.5px solid rgba(255,255,255,.58);border-radius:14px;background:rgba(242,242,247,.82);box-shadow:0 8px 22px rgba(0,0,0,.14),inset 0 .5px 0 rgba(255,255,255,.72);-webkit-backdrop-filter:saturate(180%) blur(24px);backdrop-filter:saturate(180%) blur(24px);transform-origin:calc(100% - 16px) top;animation:missingMenuIn .12s cubic-bezier(.2,.8,.2,1) both;overflow:hidden}
    .missing-row-menu.is-above{transform-origin:calc(100% - 16px) bottom;animation-name:missingMenuInAbove}
    .missing-row-menu-item{position:relative;width:100%;min-height:44px;padding:0 12px;border:0;border-radius:0;background:transparent;color:#1c1c1e;display:grid;grid-template-columns:20px 1fr;gap:9px;align-items:center;text-align:left;overflow:hidden;touch-action:manipulation;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}
    .missing-row-menu-item+.missing-row-menu-item{border-top:.5px solid rgba(60,60,67,.18)}
    .missing-row-menu-item:active{background:rgba(118,118,128,.12)}
    .missing-row-menu-item strong{display:block;font-size:13.5px;font-weight:600;line-height:1.2;letter-spacing:-.01em}
    .missing-row-menu-item small{display:block;margin-top:3px;color:#8a938d;font-size:10.5px;font-weight:650;line-height:1.2}
    .missing-menu-icon{position:relative;z-index:1;width:20px;height:20px;display:grid;place-items:center;color:#15935a}
    .missing-menu-icon svg{width:18.5px;height:18.5px;display:block}
    .missing-row-menu-item>span:last-child{position:relative;z-index:1}
    .missing-row-menu-item.is-danger,.missing-row-menu-item.is-danger .missing-menu-icon{color:#ff3b30}
    .missing-row-menu-item.is-disabled,.missing-row-menu-item:disabled{opacity:.38;pointer-events:none}
    .missing-row-openai:before{content:"";position:absolute;inset:0;transform:scaleX(0);transform-origin:left center;background:rgba(35,144,90,.10);pointer-events:none}
    .missing-row-openai.is-holding:before{animation:missingOpenAiHold ${HOLD_MS}ms linear forwards}
    @keyframes missingOpenAiHold{to{transform:scaleX(1)}}
    @keyframes missingMenuIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes missingMenuInAbove{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @media(max-width:390px){#missingProductsDialog .missing-products-add #missingProductName{height:44px!important;font-size:14px!important}#missingProductsDialog .missing-products-add #addMissingProduct.primary{height:44px!important;min-width:84px!important;padding:0 12px!important;font-size:13px!important}#missingProductsDialog .missing-product-row.missing-request-row{grid-template-columns:44px minmax(0,1fr) 32px!important;gap:6px!important;padding:7px!important;min-height:62px!important}#missingProductsDialog .missing-request-thumb{width:44px;height:44px;border-radius:13px}#missingProductsDialog .missing-request-thumb svg{width:33px;height:33px}#missingProductsDialog .missing-row-more{width:32px;height:32px;min-width:32px}#missingProductsDialog .missing-product-integrate,#missingProductsDialog .missing-dish-integrate{min-width:70px!important;min-height:34px!important;padding-left:8px!important;padding-right:8px!important;font-size:10.5px!important}}
    @media(prefers-reduced-motion:reduce){.missing-row-openai.is-holding:before{animation-duration:1ms}.missing-row-menu{animation:none}}
  `;
  document.head.appendChild(style);
}
function bind(){
  const dialog=document.getElementById('missingProductsDialog');
  if(!dialog)return false;
  if(dialog.dataset.missingPopupUiBound==='1'){queueDecorate();return true;}
  dialog.dataset.missingPopupUiBound='1';
  bindModeSwitch(dialog);
  new MutationObserver(mutations=>{
    queueDecorate();
    if(mutations.some(mutation=>mutation.target===dialog&&mutation.attributeName==='open'))resetModeLens(dialog);
  }).observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled','hidden','open']});
  dialog.addEventListener('close',()=>resetPopupInteraction(dialog));
  dialog.addEventListener('cancel',()=>resetPopupInteraction(dialog));
  dialog.addEventListener('scroll',closeMenu,{passive:true});
  queueDecorate();
  return true;
}

installStyle();
document.addEventListener('pointerdown',event=>{
  if(!openMenu)return;
  if(event.target.closest?.('.missing-row-menu,.missing-row-more'))return;
  closeMenu();
},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();},true);
window.addEventListener('resize',closeMenu,{passive:true});
if(!bind()){
  const observer=new MutationObserver(()=>{if(bind())observer.disconnect()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}
})();