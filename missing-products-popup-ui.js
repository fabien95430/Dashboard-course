(()=>{
'use strict';

const SVG_PRODUCT='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 20h17v31H12z" fill="#f7f2e8" stroke="#758575" stroke-width="2"/><path d="M15 16h11l3 4H12z" fill="#e8eee6" stroke="#758575" stroke-width="2"/><path d="M38 14h9v7h-9z" fill="#d7dfd4"/><path d="M35 20h15l2 6v25H33V26z" fill="#859583"/><path d="M38 28h9" stroke="#f4f1e9" stroke-width="2.5" stroke-linecap="round"/></svg>';
const SVG_DISH='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M11 45h42" stroke="#ad791d" stroke-width="3.5" stroke-linecap="round"/><path d="M16 42c0-13 7-22 16-22s16 9 16 22z" fill="#d6a33d"/><circle cx="32" cy="17" r="3.5" fill="#ad791d"/><path d="M15 42h34" stroke="#9f6c16" stroke-width="3" stroke-linecap="round"/></svg>';
const SVG_DESSERT='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M21 31h22l-2.5 20h-17z" fill="#c9714f"/><path d="M18.5 30h27" stroke="#9f5237" stroke-width="3" stroke-linecap="round"/><path d="M20 29c1-6.2 5.8-10 12-10s11 3.8 12 10z" fill="#dd9777"/><circle cx="32" cy="15" r="3" fill="#a9513c"/></svg>';
const SVG_MENU_OPENAI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7c.55 4.55 2.75 6.75 7.3 7.3-4.55.55-6.75 2.75-7.3 7.3-.55-4.55-2.75-6.75-7.3-7.3 4.55-.55 6.75-2.75 7.3-7.3Z" fill="currentColor"/><circle cx="18.4" cy="17.9" r="1.55" fill="currentColor" opacity=".75"/></svg>';
const SVG_MENU_CHATGPT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M9 6h9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_MENU_DELETE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6.5 7l.8 13h9.4l.8-13M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* Actions d'une demande : la ligne se déplie sur place (aucun menu flottant ni popup secondaire). */
let openRowKey='';
let confirmRowKey='';
let decorateFrame=0;

function normalize(value){
  return String(value||'').toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[̀-ͯ]/g,'');
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
function rowKey(row){
  if(row.hasAttribute('data-missing-product-row'))return 'product:'+String(row.dataset.missingProductRow||'');
  if(row.hasAttribute('data-missing-dish-row'))return 'dish:'+String(row.dataset.missingDishRow||'');
  return '';
}
function thumbSvg(type){
  if(type==='product')return SVG_PRODUCT;
  if(type==='dessert')return SVG_DESSERT;
  return SVG_DISH;
}
function escapeHtml(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function resetPopupInteraction(dialog){
  openRowKey='';
  confirmRowKey='';
  syncModeSelection(dialog);
  queueDecorate();
}
function closePopup(dialog){
  if(!dialog?.open)return;
  resetPopupInteraction(dialog);
  dialog.close();
}
/* Les boutons natifs (OpenAI, ChatGPT, suppression) restent la source des actions : le clic est relayé au centre de la ligne, donc dans la feuille. */
function relayClick(target,row){
  if(!target||target.disabled)return false;
  const rect=row.getBoundingClientRect();
  target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window,clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2}));
  return true;
}
function ensureCaret(row){
  if(row.querySelector(':scope>.missing-row-caret'))return;
  const caret=document.createElementNS('http://www.w3.org/2000/svg','svg');
  caret.setAttribute('class','missing-row-caret');
  caret.setAttribute('aria-hidden','true');
  caret.innerHTML='<use href="#i-chevron"></use>';
  row.appendChild(caret);
}
function ensureTools(row,key,type){
  let tools=row.querySelector(':scope>.missing-row-tools');
  if(!tools){
    tools=document.createElement('div');
    tools.className='missing-row-tools';
    row.appendChild(tools);
  }
  const open=key&&openRowKey===key;
  const confirming=open&&confirmRowKey===key;
  const name=row.querySelector('.missing-product-copy strong')?.textContent||'';
  const openai=row.querySelector('[data-openai-missing-product],[data-openai-missing-dish]');
  const chatgpt=row.querySelector('[data-integrate-missing-product],[data-integrate-missing-dish]');
  const added=row.dataset.missingDishAdded==='1'||row.classList.contains('is-added-request');
  const noun=type==='product'?'produit':'plat';
  const state=[open,confirming,added,Boolean(openai&&!openai.disabled),Boolean(chatgpt&&!chatgpt.disabled),name].join('|');
  row.classList.toggle('is-open',Boolean(open));
  row.setAttribute('aria-expanded',String(Boolean(open)));
  tools.hidden=!open;
  if(tools.dataset.toolsState===state)return;
  tools.dataset.toolsState=state;
  if(!open){tools.innerHTML='';return}
  if(confirming){
    tools.className='missing-row-tools is-confirm';
    tools.innerHTML='<p class="missing-row-confirm-text">Supprimer « '+escapeHtml(name)+' » de la liste ?</p>'+
      '<button class="missing-row-tool" type="button" data-row-tool="keep">Annuler</button>'+
      '<button class="missing-row-tool is-danger-solid" type="button" data-row-tool="delete">Supprimer</button>';
    return;
  }
  tools.className='missing-row-tools';
  tools.innerHTML=added
    ?'<button class="missing-row-tool is-danger is-wide" type="button" data-row-tool="ask-delete">'+SVG_MENU_DELETE+'<span>Retirer de la liste</span></button>'
    :'<button class="missing-row-tool" type="button" data-row-tool="openai" aria-label="Intégrer avec OpenAI"'+(openai&&!openai.disabled?'':' disabled')+'>'+SVG_MENU_OPENAI+'<span>OpenAI</span></button>'+
      '<button class="missing-row-tool" type="button" data-row-tool="chatgpt" aria-label="Intégrer avec ChatGPT"'+(chatgpt&&!chatgpt.disabled?'':' disabled')+'>'+SVG_MENU_CHATGPT+'<span>ChatGPT</span></button>'+
      '<button class="missing-row-tool is-danger is-icon" type="button" data-row-tool="ask-delete" aria-label="Supprimer ce '+noun+' : '+escapeHtml(name)+'">'+SVG_MENU_DELETE+'</button>';
}
function handleRowClick(event){
  const dialog=event.currentTarget;
  const row=event.target.closest?.('[data-missing-product-row],[data-missing-dish-row]');
  if(!row||!dialog.contains(row))return;
  const key=rowKey(row);
  if(!key)return;
  const tool=event.target.closest('[data-row-tool]');
  if(tool){
    event.preventDefault();
    event.stopPropagation();
    const action=tool.dataset.rowTool;
    if(action==='openai'){
      if(relayClick(row.querySelector('[data-openai-missing-product],[data-openai-missing-dish]'),row))openRowKey='';
    }else if(action==='chatgpt'){
      relayClick(row.querySelector('[data-integrate-missing-product],[data-integrate-missing-dish]'),row);
    }else if(action==='ask-delete'){
      confirmRowKey=key;
    }else if(action==='keep'){
      confirmRowKey='';
    }else if(action==='delete'){
      openRowKey='';
      confirmRowKey='';
      relayClick(row.querySelector('.missing-product-remove'),row);
    }
    queueDecorate();
    return;
  }
  if(event.target.closest('button,input,select,textarea,a'))return;
  openRowKey=openRowKey===key?'':key;
  confirmRowKey='';
  queueDecorate();
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
  const className='missing-request-thumb is-'+type;
  if(thumb.className!==className)thumb.className=className;
  if(thumb.dataset.requestThumbType!==type){
    thumb.dataset.requestThumbType=type;
    thumb.innerHTML=thumbSvg(type);
  }
}
function syncRunning(row){
  const integrate=row.querySelector('[data-integrate-missing-product],[data-integrate-missing-dish]');
  if(!integrate)return;
  const added=row.dataset.missingDishAdded==='1'||row.classList.contains('is-added-request');
  if(added){
    if(!integrate.disabled)integrate.disabled=true;
    if(integrate.textContent!=='Ajouté ✓')integrate.textContent='Ajouté ✓';
    integrate.classList.remove('is-running-label');
    integrate.classList.add('is-added-label');
    row.classList.remove('is-running-request');
    return;
  }
  integrate.classList.remove('is-added-label');
  const running=integrate.classList.contains('is-running')||integrate.disabled;
  const label=running?'En cours…':'Intégrer';
  if(integrate.textContent!==label)integrate.textContent=label;
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
function syncModeSelection(dialog){
  if(dialog.open)requestAnimationFrame(()=>window.COURSES_SEGMENTED_LIQUID?.syncMissing(false));
}
function decorateRow(row){
  if(!(row instanceof HTMLElement))return;
  const type=rowType(row);
  if(!row.classList.contains('missing-request-row'))row.classList.add('missing-request-row');
  ['product','dish','dessert'].forEach(kind=>{
    const className='is-request-'+kind;
    const active=kind===type;
    if(row.classList.contains(className)!==active)row.classList.toggle(className,active);
  });
  ensureThumb(row,type);
  ensureCaret(row);
  syncRunning(row);
  ensureTools(row,rowKey(row),type);
}
function decorate(){
  decorateFrame=0;
  const dialog=document.getElementById('missingProductsDialog');
  if(!dialog)return;
  const bound=bindModeSwitch(dialog);
  if(bound&&dialog.open)requestAnimationFrame(()=>syncModeSelection(dialog));
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
    #missingProductsDialog .missing-products-header{position:relative!important;padding-right:0!important}
    #missingProductsDialog .missing-products-list,#missingProductsDialog .missing-dishes-list{display:block!important;padding:0!important;border:1px solid var(--tile-line,rgba(33,55,40,.035))!important;border-radius:18px!important;background:var(--tile-bg,#fffefb)!important;box-shadow:var(--tile-shadow,none)!important;overflow:hidden!important}
    #missingProductsDialog .missing-products-empty{margin:0!important;padding:26px 16px!important;border:0!important;background:transparent!important;text-align:center;color:#617366!important;font-size:14px!important;line-height:1.45}
    #missingProductsDialog .missing-product-row.missing-request-row{position:relative!important;display:grid!important;grid-template-columns:44px minmax(0,1fr) 18px!important;gap:12px!important;min-height:64px!important;margin:0!important;padding:9px 14px 9px 16px!important;align-items:center!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;cursor:pointer;overflow:visible!important}
    #missingProductsDialog .missing-product-row.missing-request-row+.missing-product-row{border-top:1px solid rgba(39,66,47,.09)!important}
    #missingProductsDialog .missing-product-row.missing-request-row.is-open{background:rgba(237,247,234,.55)!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-mark{display:none!important}
    #missingProductsDialog .missing-request-thumb{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(54,75,60,.045)}
    #missingProductsDialog .missing-request-thumb svg{width:33px;height:33px;display:block}
    #missingProductsDialog .missing-request-thumb.is-product{background:linear-gradient(145deg,#eef7ed,#e5efe6)}
    #missingProductsDialog .missing-request-thumb.is-dish{background:linear-gradient(145deg,#fff6df,#f8e9c1)}
    #missingProductsDialog .missing-request-thumb.is-dessert{background:linear-gradient(145deg,#fff0e7,#f8d9c9)}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy{display:flex!important;flex-flow:row wrap!important;align-items:center!important;align-self:center!important;column-gap:8px!important;row-gap:3px!important;min-width:0!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy strong{display:block!important;flex:0 0 100%!important;min-width:0!important;color:#1b2d21!important;font-size:15.5px!important;font-weight:400!important;line-height:1.25!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
    #missingProductsDialog .missing-product-row.missing-request-row .missing-product-copy small:not(.missing-dish-error):not(.missing-dish-progress){display:inline!important;width:auto!important;padding:0!important;border-radius:0!important;background:transparent!important;color:#617366!important;font-size:12.5px!important;font-weight:400!important;line-height:1.2!important}
    #missingProductsDialog .missing-product-copy .missing-dish-progress,#missingProductsDialog .missing-product-copy small.missing-dish-progress{display:inline-flex!important;align-items:center!important;width:max-content!important;max-width:100%!important;margin:0!important;padding:3px 9px!important;font-size:12px!important;line-height:1.1!important;font-weight:500!important;white-space:nowrap!important}
    #missingProductsDialog .missing-product-remove,#missingProductsDialog .missing-row-more{display:none!important}
    #missingProductsDialog .missing-product-row.missing-request-row>.missing-product-integrate,#missingProductsDialog .missing-product-row.missing-request-row .missing-dish-actions{display:none!important}
    #missingProductsDialog .missing-row-caret{width:16px;height:16px;fill:none;stroke:#8e9990;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transform:rotate(90deg);transition:transform .18s ease}
    #missingProductsDialog .missing-product-row.is-open .missing-row-caret{transform:rotate(-90deg)}
    #missingProductsDialog .missing-row-tools{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr 44px;gap:8px;padding:2px 0 3px}
    #missingProductsDialog .missing-row-tools[hidden]{display:none!important}
    #missingProductsDialog .missing-row-tools.is-confirm{grid-template-columns:1fr 1fr}
    #missingProductsDialog .missing-row-confirm-text{grid-column:1/-1;margin:0 0 2px;color:#6c4a45;font-size:14px;line-height:1.35}
    #missingProductsDialog .missing-row-tool{min-width:0;height:42px;display:flex;align-items:center;justify-content:center;gap:7px;padding:0 8px;border:1px solid rgba(47,106,73,.18);border-radius:13px;background:rgba(255,255,255,.78);color:#1f5a3b;font:inherit;font-size:14.5px;white-space:nowrap;-webkit-appearance:none;appearance:none}
    #missingProductsDialog .missing-row-tool svg{flex:0 0 17px;width:17px;height:17px}
    #missingProductsDialog .missing-row-tool:disabled{opacity:.42}
    #missingProductsDialog .missing-row-tool.is-danger{border-color:rgba(178,58,48,.2);color:#b23a30}
    #missingProductsDialog .missing-row-tool.is-icon{padding:0}
    #missingProductsDialog .missing-row-tool.is-wide{grid-column:1/-1}
    #missingProductsDialog .missing-row-tool.is-danger-solid{border-color:transparent;background:#b8433a;color:#fff}
    #missingProductsDialog .missing-product-integrate.is-running-label,#missingProductsDialog .missing-dish-integrate.is-running-label{opacity:1!important}
    #missingProductsDialog .is-added-request .missing-product-copy strong{color:#748078!important}
    #missingProductsDialog .is-added-request .missing-request-thumb{filter:saturate(.45);opacity:.72}
    #missingProductsDialog .missing-dish-magic{display:none!important}
    @media(prefers-reduced-motion:reduce){#missingProductsDialog .missing-row-caret{transition:none}}
  `;
  document.head.appendChild(style);
}
function bind(){
  const dialog=document.getElementById('missingProductsDialog');
  if(!dialog)return false;
  if(dialog.dataset.missingPopupUiBound==='1'){queueDecorate();return true;}
  dialog.dataset.missingPopupUiBound='1';
  bindModeSwitch(dialog);
  dialog.addEventListener('click',handleRowClick);
  dialog.addEventListener('close',()=>resetPopupInteraction(dialog));
  dialog.addEventListener('cancel',event=>{
    event.preventDefault();
    closePopup(dialog);
  });
  queueDecorate();
  return true;
}

installStyle();
document.addEventListener('courses:missing-requests-rendered',queueDecorate);
document.addEventListener('courses:missing-integration-ui-updated',queueDecorate);
document.addEventListener('courses:dialog-opened',event=>{
  if(event.detail?.id!=='missingProductsDialog')return;
  const dialog=document.getElementById('missingProductsDialog');
  if(dialog)syncModeSelection(dialog);
  queueDecorate();
});
if(!bind()&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
})();