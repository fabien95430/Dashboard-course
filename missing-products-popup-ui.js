(()=>{
'use strict';

const HOLD_MS=800;
const SVG_PRODUCT='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 20h17v31H12z" fill="#f7f2e8" stroke="#758575" stroke-width="2"/><path d="M15 16h11l3 4H12z" fill="#e8eee6" stroke="#758575" stroke-width="2"/><path d="M38 14h9v7h-9z" fill="#d7dfd4"/><path d="M35 20h15l2 6v25H33V26z" fill="#859583"/><path d="M38 28h9" stroke="#f4f1e9" stroke-width="2.5" stroke-linecap="round"/></svg>';
const SVG_DISH='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M11 45h42" stroke="#ad791d" stroke-width="3.5" stroke-linecap="round"/><path d="M16 42c0-13 7-22 16-22s16 9 16 22z" fill="#d6a33d"/><circle cx="32" cy="17" r="3.5" fill="#ad791d"/><path d="M15 42h34" stroke="#9f6c16" stroke-width="3" stroke-linecap="round"/></svg>';
const SVG_DESSERT='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 29h24l-3 22H23z" fill="#c9714f"/><path d="M19 29h26" stroke="#9f5237" stroke-width="3" stroke-linecap="round"/><path d="M23 27c0-4 3-7 7-7 1-5 8-6 11-2 5 0 8 4 7 9z" fill="#dd9777"/><circle cx="34" cy="14" r="3" fill="#a9513c"/></svg>';

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
function stopHold(){
  if(holdTimer){clearTimeout(holdTimer);holdTimer=0;}
  if(holdButton){holdButton.classList.remove('is-holding');holdButton=null;}
}
function triggerOpenAi(row){
  const magic=row.querySelector('[data-openai-missing-dish]');
  if(!magic||magic.disabled)return false;
  navigator.vibrate?.([12,35,18]);
  magic.click();
  return true;
}
function positionMenu(menu,anchor){
  const rect=anchor.getBoundingClientRect();
  const width=Math.min(250,Math.max(214,window.innerWidth-28));
  menu.style.width=width+'px';
  menu.style.left=Math.max(14,Math.min(window.innerWidth-width-14,rect.right-width))+'px';
  menu.style.top=Math.min(window.innerHeight-menu.offsetHeight-14,rect.bottom+8)+'px';
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
  const type=row.hasAttribute('data-missing-dish-row')?'dish':'product';
  const menu=document.createElement('div');
  menu.className='missing-row-menu';
  menu.setAttribute('role','menu');
  if(type==='dish'){
    const magic=row.querySelector('[data-openai-missing-dish]');
    const openAi=document.createElement('button');
    openAi.type='button';
    openAi.className='missing-row-menu-item missing-row-openai';
    openAi.setAttribute('role','menuitem');
    openAi.innerHTML='<span class="missing-menu-icon" aria-hidden="true">✦</span><span><strong>Intégrer via OpenAI</strong><small>Maintenir 0,8 s pour confirmer</small></span>';
    if(!magic||magic.disabled){openAi.disabled=true;openAi.classList.add('is-disabled');}
    bindHold(openAi,row);
    menu.appendChild(openAi);
  }
  const remove=document.createElement('button');
  remove.type='button';
  remove.className='missing-row-menu-item is-danger';
  remove.setAttribute('role','menuitem');
  remove.innerHTML='<span class="missing-menu-icon" aria-hidden="true">⌫</span><span><strong>Supprimer</strong></span>';
  remove.addEventListener('click',()=>{
    const native=row.querySelector('.missing-product-remove');
    closeMenu();
    native?.click();
  });
  menu.appendChild(remove);
  document.body.appendChild(menu);
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
  button.innerHTML='<span aria-hidden="true">•••</span>';
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
  const running=integrate.classList.contains('is-running')||integrate.disabled;
  integrate.textContent=running?'En cours…':'Intégrer';
  integrate.classList.toggle('is-running-label',running);
  row.classList.toggle('is-running-request',running);
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
    #missingProductsDialog .missing-products-header h3{font-size:22px!important;line-height:1.08!important;letter-spacing:-.35px!important;margin-bottom:0!important}
    #missingProductsDialog .dialog-intro{font-size:13px!important;line-height:1.38!important;margin-top:7px!important}
    #missingProductsDialog .missing-products-add{gap:8px!important;margin-bottom:10px!important}
    #missingProductsDialog .missing-products-add #missingProductName{height:46px!important;border-radius:15px!important;padding:0 14px!important;font-size:15px!important}
    #missingProductsDialog .missing-products-add #addMissingProduct.primary{height:46px!important;min-width:92px!important;border-radius:15px!important;padding:0 15px!important;font-size:14px!important}
    #missingProductsDialog .missing-category-panel{margin-bottom:16px!important;padding:10px!important;border-radius:18px!important}
    #missingProductsDialog .missing-category-panel .missing-category-heading{margin-bottom:7px!important}
    #missingProductsDialog .missing-category-panel .missing-category-select{height:44px!important;border-radius:14px!important;font-size:13px!important}
    #missingProductsDialog .missing-product-row.missing-request-row{position:relative!important;display:grid!important;grid-template-columns:48px minmax(0,1fr) auto 36px!important;gap:8px!important;min-height:68px!important;padding:8px!important;align-items:center!important;overflow:visible!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-mark{display:none!important}
    #missingProductsDialog .missing-request-thumb{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(54,75,60,.045)}
    #missingProductsDialog .missing-request-thumb svg{width:36px;height:36px;display:block}
    #missingProductsDialog .missing-request-thumb.is-product{background:linear-gradient(145deg,#eef7ed,#e5efe6)}
    #missingProductsDialog .missing-request-thumb.is-dish{background:linear-gradient(145deg,#fff6df,#f8e9c1)}
    #missingProductsDialog .missing-request-thumb.is-dessert{background:linear-gradient(145deg,#fff0e7,#f8d9c9)}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy{align-self:center!important;gap:4px!important;min-width:0!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy strong{font-size:14.5px!important;line-height:1.22!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){padding:4px 8px!important;font-size:9.5px!important;line-height:1.15!important}
    #missingProductsDialog .is-request-product .missing-product-copy small:not(.missing-dish-error){background:#edf7f0!important;color:#19804a!important}
    #missingProductsDialog .is-request-dish .missing-product-copy small:not(.missing-dish-error){background:#fff4d9!important;color:#9b6811!important}
    #missingProductsDialog .is-request-dessert .missing-product-copy small:not(.missing-dish-error){background:#fff0e8!important;color:#ad5b39!important}
    #missingProductsDialog .missing-product-copy .missing-dish-progress{display:none!important}
    #missingProductsDialog .missing-product-remove{display:none!important}
    #missingProductsDialog .missing-row-more{width:36px;height:36px;min-width:36px;padding:0;border:1px solid #e5e9e5;border-radius:12px;background:#f8faf8;color:#4b5650;display:grid;place-items:center;font-size:13px;font-weight:900;letter-spacing:1px;box-shadow:none}
    #missingProductsDialog .missing-row-more:active{transform:scale(.96);background:#f1f5f2}
    #missingProductsDialog .missing-product-integrate,#missingProductsDialog .missing-dish-integrate{min-width:78px!important;min-height:36px!important;padding:0 10px!important;font-size:11px!important}
    #missingProductsDialog .missing-product-integrate.is-running-label,#missingProductsDialog .missing-dish-integrate.is-running-label{background:#eef3ef!important;color:#7b8d82!important;opacity:1!important}
    #missingProductsDialog .missing-dish-magic{display:none!important}
    .missing-row-menu{position:fixed;z-index:3000;padding:7px;border:1px solid rgba(47,68,54,.09);border-radius:18px;background:rgba(255,255,255,.98);box-shadow:0 18px 48px rgba(30,42,34,.20);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
    .missing-row-menu-item{position:relative;width:100%;min-height:50px;padding:8px 10px;border:0;border-radius:13px;background:transparent;color:#172019;display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:center;text-align:left;overflow:hidden;touch-action:manipulation;-webkit-touch-callout:none;user-select:none;-webkit-user-select:none}
    .missing-row-menu-item+.missing-row-menu-item{border-top:1px solid #eef1ee;border-top-left-radius:0;border-top-right-radius:0}
    .missing-row-menu-item:active{background:#f4f7f4}
    .missing-row-menu-item strong{display:block;font-size:13px;font-weight:820;line-height:1.2}
    .missing-row-menu-item small{display:block;margin-top:3px;color:#8a938d;font-size:10.5px;font-weight:650;line-height:1.2}
    .missing-menu-icon{position:relative;z-index:1;width:28px;height:28px;display:grid;place-items:center;color:#1b9557;font-size:18px}
    .missing-row-menu-item>span:last-child{position:relative;z-index:1}
    .missing-row-menu-item.is-danger,.missing-row-menu-item.is-danger .missing-menu-icon{color:#df4c47}
    .missing-row-menu-item.is-disabled{opacity:.42}
    .missing-row-openai:before{content:"";position:absolute;inset:0;transform:scaleX(0);transform-origin:left center;background:rgba(35,144,90,.10);pointer-events:none}
    .missing-row-openai.is-holding:before{animation:missingOpenAiHold ${HOLD_MS}ms linear forwards}
    @keyframes missingOpenAiHold{to{transform:scaleX(1)}}
    @media(max-width:390px){#missingProductsDialog .missing-products-add #missingProductName{height:44px!important;font-size:14px!important}#missingProductsDialog .missing-products-add #addMissingProduct.primary{height:44px!important;min-width:84px!important;padding:0 12px!important;font-size:13px!important}#missingProductsDialog .missing-product-row.missing-request-row{grid-template-columns:44px minmax(0,1fr) auto 34px!important;gap:6px!important;padding:7px!important;min-height:62px!important}#missingProductsDialog .missing-request-thumb{width:44px;height:44px;border-radius:13px}#missingProductsDialog .missing-request-thumb svg{width:33px;height:33px}#missingProductsDialog .missing-row-more{width:34px;height:34px;min-width:34px;border-radius:11px}#missingProductsDialog .missing-product-integrate,#missingProductsDialog .missing-dish-integrate{min-width:70px!important;min-height:34px!important;padding-left:8px!important;padding-right:8px!important;font-size:10.5px!important}}
    @media(prefers-reduced-motion:reduce){.missing-row-openai.is-holding:before{animation-duration:1ms}}
  `;
  document.head.appendChild(style);
}
function bind(){
  const dialog=document.getElementById('missingProductsDialog');
  if(!dialog)return false;
  if(dialog.dataset.missingPopupUiBound==='1'){queueDecorate();return true;}
  dialog.dataset.missingPopupUiBound='1';
  new MutationObserver(queueDecorate).observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled','hidden']});
  dialog.addEventListener('close',closeMenu);
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
