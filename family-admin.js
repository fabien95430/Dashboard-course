(() => {
'use strict';
/* Écran « Familles » (Réglages › Administrateur) — propriétaire unique.
   Foyers → fiche du foyer avec onglets Demandes / Stats / Modifs / Appareils.
   Rien des familles n'entre dans les onglets de l'administrateur : tout reste ici. */

const DAY=864e5;
const TABS=Object.freeze([['demandes','Demandes'],['stats','Stats'],['modifs','Modifs'],['appareils','Appareils']]);
const SVG_OPENAI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7c.55 4.55 2.75 6.75 7.3 7.3-4.55.55-6.75 2.75-7.3 7.3-.55-4.55-2.75-6.75-7.3-7.3 4.55-.55 6.75-2.75 7.3-7.3Z" fill="currentColor"/><circle cx="18.4" cy="17.9" r="1.55" fill="currentColor" opacity=".75"/></svg>';
const SVG_CHATGPT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M9 6h9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_DELETE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6.5 7l.8 13h9.4l.8-13M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_PRODUCT='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 20h17v31H12z" fill="#f7f2e8" stroke="#758575" stroke-width="2"/><path d="M15 16h11l3 4H12z" fill="#e8eee6" stroke="#758575" stroke-width="2"/><path d="M38 14h9v7h-9z" fill="#d7dfd4"/><path d="M35 20h15l2 6v25H33V26z" fill="#859583"/><path d="M38 28h9" stroke="#f4f1e9" stroke-width="2.5" stroke-linecap="round"/></svg>';
const SVG_DISH='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M11 45h42" stroke="#ad791d" stroke-width="3.5" stroke-linecap="round"/><path d="M16 42c0-13 7-22 16-22s16 9 16 22z" fill="#d6a33d"/><circle cx="32" cy="17" r="3.5" fill="#ad791d"/><path d="M15 42h34" stroke="#9f6c16" stroke-width="3" stroke-linecap="round"/></svg>';

const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const plural=(n,word)=>n+' '+word+(n>1?'s':'');
function familyTitle(email){
  const raw=String(email||'').split('@')[0].replace(/[._-]+/g,' ').trim();
  if(!raw)return 'Famille';
  const name=raw.split(/\s+/).map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
  return /^famille\b/i.test(name)?name:'Famille '+name;
}
function relativeDays(iso,now=Date.now()){
  const time=Date.parse(iso||'');
  if(!Number.isFinite(time))return '';
  const days=Math.floor(Math.max(0,now-time)/DAY);
  if(days<1)return 'aujourd’hui';
  if(days===1)return 'hier';
  return 'il y a '+days+' j';
}
function activityLabel(iso,now=Date.now()){
  const time=Date.parse(iso||'');
  if(!Number.isFinite(time))return '—';
  const minutes=Math.floor(Math.max(0,now-time)/6e4);
  if(minutes<5)return 'Actif';
  if(minutes<60)return 'Il y a '+minutes+' min';
  const hours=Math.floor(minutes/60);
  if(hours<24)return 'Il y a '+hours+' h';
  return 'Il y a '+Math.floor(hours/24)+' j';
}

/* ---------- Données (fonctions pures, testées) ---------- */
function catalogCategory(name){
  const groups=window.COURSES_CATALOG?.groups||{};
  const key=window.COURSES_TEXT?.key||(v=>String(v||'').toLowerCase());
  const wanted=key(name);
  for(const [group,subgroups] of Object.entries(groups)){
    for(const items of Object.values(subgroups||{})){
      if((items||[]).some(item=>key(item)===wanted))return group;
    }
  }
  return 'Autres';
}
function statsFor(purchases,now=Date.now()){
  const month=new Date(now);month.setDate(1);month.setHours(0,0,0,0);
  const recent=(purchases||[]).filter(row=>Date.parse(row.coche_le||'')>=month.getTime());
  const days=new Set(recent.map(row=>String(row.coche_le||'').slice(0,10)));
  const byName=new Map();
  (purchases||[]).forEach(row=>{
    const name=String(row.nom||'').trim();if(!name)return;
    const entry=byName.get(name)||{name,count:0,times:[]};
    entry.count++;entry.times.push(Date.parse(row.coche_le||''));
    byName.set(name,entry);
  });
  const top=[...byName.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'fr')).slice(0,5).map(entry=>{
    const times=entry.times.filter(Number.isFinite).sort((a,b)=>a-b);
    let rhythm='—';
    if(times.length>1){
      const gap=Math.round((times[times.length-1]-times[0])/(times.length-1)/DAY);
      rhythm=gap<=1?'chaque jour':gap>=6&&gap<=8?'chaque semaine':'tous les '+gap+' j';
    }
    return {name:entry.name,count:entry.count,rhythm};
  });
  const cats=new Map();
  (purchases||[]).forEach(row=>{const cat=String(row.categorie||'')||catalogCategory(row.nom);cats.set(cat,(cats.get(cat)||0)+1)});
  const total=(purchases||[]).length||1;
  const categories=[...cats.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([name,count])=>({name,share:Math.round(count*100/total)+' %'}));
  return {courses:days.size,checked:recent.length,top,categories};
}
function modifsFor(customizations,base=window.COURSES_DISH_BASE||{}){
  return (customizations||[]).map(row=>{
    const dish=String(row.recette_id||'');
    const original=base[dish];
    const chosen=Array.isArray(row.donnees)?row.donnees.map(String):[];
    if(!original||!chosen.length)return null;
    const removed=original.filter(name=>!chosen.includes(name));
    const added=chosen.filter(name=>!original.includes(name));
    if(!removed.length&&!added.length)return null;
    const parts=[];
    if(removed.length&&added.length&&removed.length===added.length&&removed.length<=2){
      removed.forEach((name,index)=>parts.push(name+' → '+added[index]));
    }else{
      if(added.length)parts.push('+ '+added.join(', '));
      if(removed.length)parts.push('− '+removed.join(', '));
    }
    return {dish,detail:parts.join(' · ')};
  }).filter(Boolean).sort((a,b)=>a.dish.localeCompare(b.dish,'fr'));
}
function buildFamilies(overview){
  const map=new Map();
  const ensure=(id,email)=>{
    const key=String(id||'');if(!key)return null;
    if(!map.has(key))map.set(key,{id:key,email:'',name:'',devices:[],requests:[],purchases:[],customizations:[]});
    const family=map.get(key);
    if(email&&!family.email)family.email=String(email);
    return family;
  };
  (overview?.families||[]).forEach(row=>ensure(row.id,row.email));
  (overview?.devices||[]).forEach(row=>ensure(row.famille)?.devices.push(row));
  (overview?.requests||[]).forEach(row=>ensure(row.famille)?.requests.push(row));
  (overview?.purchases||[]).forEach(row=>ensure(row.famille)?.purchases.push(row));
  (overview?.customizations||[]).forEach(row=>ensure(row.famille)?.customizations.push(row));
  const list=[...map.values()];
  list.forEach((family,index)=>{family.name=family.email?familyTitle(family.email):'Famille '+(index+1)});
  return list.sort((a,b)=>a.name.localeCompare(b.name,'fr'));
}

/* ---------- Interface ---------- */
let families=[];
let loading=null;
let lastError='';
const requestState=new Map(); // id → {label, done}

function access(){return window.COURSES_ADMIN_ACCESS||null}
function service(){return window.COURSES_FAMILY||null}
function totalRequests(){return families.reduce((sum,family)=>sum+family.requests.filter(row=>!requestState.get(row.id)?.done).length,0)}

function ensureRow(){
  const card=document.querySelector('#settingsAdministratorSection .settings-card');
  if(!card)return null;
  let row=document.getElementById('settingsFamiliesBtn');
  if(!row){
    row=document.createElement('button');
    row.id='settingsFamiliesBtn';
    row.className='settings-row';
    row.type='button';
    row.innerHTML='<span class="settings-icon"><svg><use href="#i-home"></use></svg></span><span class="settings-copy"><strong>Familles</strong><small id="settingsFamiliesSummary">Service famille</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
    row.addEventListener('click',openFamilies);
  }
  // Juste sous « Gestion de l'application ».
  const management=document.getElementById('settingsApplicationManagementBtn');
  if(management&&management.parentElement===card)management.after(row);
  else if(row.parentElement!==card)card.appendChild(row);
  return row;
}
function renderSummary(){
  const summary=document.getElementById('settingsFamiliesSummary');
  if(!summary)return;
  if(!access()?.credentials())summary.textContent='Accès à configurer';
  else if(lastError&&!families.length)summary.textContent='Service famille indisponible';
  else summary.textContent=plural(families.length,'foyer')+' · '+plural(totalRequests(),'demande');
}
async function refresh(){
  const credentials=access()?.credentials();
  if(!credentials||!service()){renderSummary();return families}
  if(loading)return loading;
  loading=service().adminOverview(credentials).then(overview=>{
    families=buildFamilies(overview);
    lastError='';
    return families;
  }).catch(error=>{
    lastError=String(error?.message||'Service famille indisponible');
    throw error;
  }).finally(()=>{loading=null;renderSummary()});
  return loading;
}

function dialog(){
  let node=document.getElementById('familyAdminDialog');
  if(node)return node;
  node=document.createElement('dialog');
  node.id='familyAdminDialog';
  node.className='dialog connection-dialog settings-sheet family-admin-sheet';
  node.tabIndex=-1;
  node.addEventListener('click',onDialogClick);
  node.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target.classList?.contains('family-request-row')){event.preventDefault();toggleRequest(event.target)}
  });
  document.body.appendChild(node);
  return node;
}
function show(node){
  if(!node.open){
    node.showModal();
    document.dispatchEvent(new CustomEvent('courses:dialog-opened',{detail:{id:node.id}}));
  }
  try{node.scrollTop=0}catch(_){}
  requestAnimationFrame(()=>{try{node.focus({preventScroll:true})}catch(_){}});
}
function header(title,back){
  return '<h3'+(back?' class="has-back"':'')+'>'+(back?'<button type="button" class="settings-sheet-back family-admin-back" aria-label="Retour aux familles"><svg aria-hidden="true"><use href="#i-chevron"></use></svg></button>':'')+
    '<span class="settings-sheet-icon" aria-hidden="true"><svg><use href="#i-home"></use></svg></span><span class="settings-sheet-title">'+esc(title)+'</span></h3>';
}

function renderAccess(node,message=''){
  const local=access()?.needsLocalPassword();
  node.dataset.view='access';
  node.innerHTML=header('Familles')+
    '<p class="dialog-intro">Compte administrateur du service famille.</p>'+
    '<label class="field"><span>E-mail</span><input id="familyAdminEmail" type="email" autocomplete="username" autocapitalize="none" spellcheck="false"></label>'+
    '<label class="field"><span>Mot de passe</span><input id="familyAdminPassword" type="password" autocomplete="current-password"></label>'+
    (local?'<label class="field"><span>Mot de passe de l’application</span><input id="familyAdminLocal" type="password" autocomplete="off"></label>':'')+
    '<button type="button" class="primary family-admin-save" data-action="save-access">Valider</button>'+
    '<p class="dialog-feedback'+(message?' is-error':'')+'" role="status" aria-live="polite">'+esc(message)+'</p>';
}
async function saveAccess(node,button){
  const email=node.querySelector('#familyAdminEmail')?.value||'';
  const password=node.querySelector('#familyAdminPassword')?.value||'';
  const local=node.querySelector('#familyAdminLocal')?.value||'';
  button.disabled=true;
  try{
    await access().save({email,password},local);
    await refresh();
    renderFamilies(node);
  }catch(error){
    renderAccess(node,String(error?.message||'Accès refusé.'));
  }finally{button.disabled=false}
}

function renderFamilies(node){
  node.dataset.view='families';
  delete node.dataset.family;
  let body;
  if(lastError&&!families.length)body='<p class="family-admin-empty">Service famille indisponible.</p>';
  else if(!families.length)body='<p class="family-admin-empty">Aucun foyer pour le moment.</p>';
  else body='<div class="family-admin-list">'+families.map(family=>{
    const pending=family.requests.filter(row=>!requestState.get(row.id)?.done).length;
    return '<button type="button" class="family-admin-row" data-family="'+esc(family.id)+'"><span class="family-admin-name">'+esc(family.name)+
      '<small>'+plural(family.devices.length,'appareil')+' · '+plural(pending,'demande')+'</small></span><svg class="chevron" aria-hidden="true"><use href="#i-chevron"></use></svg></button>';
  }).join('')+'</div>';
  node.innerHTML=header('Familles')+'<p class="dialog-intro">Choisissez un foyer.</p>'+body;
}
async function openFamilies(){
  const node=dialog();
  if(!access()?.credentials()){renderAccess(node);show(node);return}
  node.dataset.view='families';
  node.innerHTML=header('Familles')+'<p class="dialog-intro">Choisissez un foyer.</p><p class="family-admin-empty">Chargement…</p>';
  show(node);
  try{await refresh()}catch(_){}
  if(node.dataset.view==='families')renderFamilies(node);
}

function toolsMarkup(name){
  return '<button type="button" class="family-row-tool" data-tool="openai" aria-label="Intégrer avec OpenAI">'+SVG_OPENAI+'<span>OpenAI</span></button>'+
    '<button type="button" class="family-row-tool" data-tool="chatgpt" aria-label="Intégrer avec ChatGPT">'+SVG_CHATGPT+'<span>ChatGPT</span></button>'+
    '<button type="button" class="family-row-tool is-danger is-icon" data-tool="ask-refuse" aria-label="Refuser '+esc(name)+'">'+SVG_DELETE+'</button>';
}
function lines(rows){return '<div class="connection-sync-section">'+rows.join('')+'</div>'}
function tabBody(family,tab){
  if(tab==='demandes'){
    if(!family.requests.length)return '<p class="family-admin-empty">Aucune demande pour le moment.</p>';
    return '<div class="family-request-list">'+family.requests.map(row=>{
      const dish=row.type==='plat',state=requestState.get(row.id);
      const detail=state?.label?(state.running?'<span class="family-admin-progress">'+esc(state.label)+'</span>':esc(state.label)):(dish?'Plat':'Produit')+' · '+esc(relativeDays(row.cree_le));
      return '<div class="family-request-row'+(state?.done?' is-done':'')+'" data-request="'+esc(row.id)+'" aria-expanded="false" role="button" tabindex="0">'+
        '<span class="family-request-thumb '+(dish?'is-dish':'is-product')+'" aria-hidden="true">'+(dish?SVG_DISH:SVG_PRODUCT)+'</span>'+
        '<span class="family-request-copy"><strong>'+esc(row.nom)+'</strong><small>'+detail+'</small></span>'+
        '<svg class="family-request-caret" aria-hidden="true"><use href="#i-chevron"></use></svg>'+
        '<div class="family-row-tools" hidden>'+toolsMarkup(row.nom)+'</div></div>';
    }).join('')+'</div>';
  }
  if(tab==='stats'){
    const stats=statsFor(family.purchases);
    return '<div class="family-admin-kpis"><div><b>'+stats.courses+'</b><small>courses ce mois</small></div><div><b>'+stats.checked+'</b><small>produits cochés</small></div></div>'+
      '<h4 class="sheet-section-title">Les plus achetés</h4>'+(stats.top.length?lines(stats.top.map(item=>'<div class="connection-sync-line"><span class="family-admin-name">'+esc(item.name)+'<small>'+esc(item.rhythm)+'</small></span><span>'+item.count+' fois'+'</span></div>')):'<p class="family-admin-empty">Aucun achat sur 31 jours.</p>')+
      (stats.categories.length?'<h4 class="sheet-section-title">Catégories</h4>'+lines(stats.categories.map(cat=>'<div class="connection-sync-line"><span>'+esc(cat.name)+'</span><span>'+esc(cat.share)+'</span></div>')):'');
  }
  if(tab==='modifs'){
    const modifs=modifsFor(family.customizations);
    if(!modifs.length)return '<p class="family-admin-empty">Aucun plat modifié.</p>';
    return lines(modifs.map(item=>'<div class="connection-sync-line is-left"><span class="family-admin-name">'+esc(item.dish)+'<small>'+esc(item.detail)+'</small></span></div>'));
  }
  if(!family.devices.length)return '<p class="family-admin-empty">Aucun appareil connecté.</p>';
  return lines(family.devices.map(device=>'<div class="connection-sync-line"><span class="family-admin-name">'+esc(device.nom)+'<small>'+esc(activityLabel(device.derniere_activite))+'</small></span><button type="button" class="family-admin-action is-danger" data-device="'+esc(device.id)+'">Déconnecter</button></div>'));
}
function renderFamily(node,familyId,tab='demandes'){
  const family=families.find(item=>item.id===familyId);
  if(!family){renderFamilies(node);return}
  node.dataset.view='family';
  node.dataset.family=family.id;
  node.dataset.tab=tab;
  node.innerHTML=header(family.name,true)+'<p class="dialog-intro">Activité du foyer.</p>'+
    '<div class="family-admin-tabs" role="tablist">'+TABS.map(([id,label])=>'<button type="button" role="tab" class="family-admin-tab'+(id===tab?' is-active':'')+'" aria-selected="'+(id===tab)+'" data-tab="'+id+'">'+label+'</button>').join('')+'</div>'+
    '<div class="family-admin-body">'+tabBody(family,tab)+'</div>';
}

function closeOtherRows(node,except){
  node.querySelectorAll('.family-request-row.is-open').forEach(row=>{
    if(row===except)return;
    row.classList.remove('is-open');row.setAttribute('aria-expanded','false');
    const tools=row.querySelector('.family-row-tools');
    tools.hidden=true;tools.className='family-row-tools';tools.innerHTML=toolsMarkup(row.querySelector('.family-request-copy strong').textContent);
  });
}
function toggleRequest(row){
  if(row.classList.contains('is-done'))return;
  const node=row.closest('dialog');
  const open=!row.classList.contains('is-open');
  closeOtherRows(node,row);
  row.classList.toggle('is-open',open);
  row.setAttribute('aria-expanded',String(open));
  row.querySelector('.family-row-tools').hidden=!open;
}
function requestFor(node,row){
  const family=families.find(item=>item.id===node.dataset.family);
  return family?.requests.find(item=>String(item.id)===row.dataset.request)||null;
}
async function settleRequest(request,statut){
  await service().adminSetRequestStatus(access().credentials(),request.id,statut);
}
async function runTool(node,tool){
  const row=tool.closest('.family-request-row'),box=tool.closest('.family-row-tools');
  const request=requestFor(node,row);
  if(!request)return;
  const kind=tool.dataset.tool,name=request.nom;
  if(kind==='ask-refuse'){
    box.className='family-row-tools is-confirm';
    box.innerHTML='<p class="family-confirm-text">Refuser « '+esc(name)+' » ?</p><button type="button" class="family-row-tool" data-tool="keep">Annuler</button><button type="button" class="family-row-tool is-danger-solid" data-tool="refuse">Refuser</button>';
    return;
  }
  if(kind==='keep'){box.className='family-row-tools';box.innerHTML=toolsMarkup(name);return}
  const type=request.type==='plat'?'dish':'product';
  const item={id:request.id,name,category:request.categorie||''};
  const rerender=()=>{if(node.dataset.view==='family'&&node.dataset.family)renderFamily(node,node.dataset.family,'demandes');renderSummary()};
  box.querySelectorAll('button').forEach(button=>{button.disabled=true});
  try{
    if(kind==='refuse'){
      await settleRequest(request,'refuse');
      requestState.set(request.id,{label:'Refusé',done:true});
    }else if(kind==='chatgpt'){
      if(!window.COURSES_CHATGPT_INTEGRATION?.start(type,item))throw new Error('ChatGPT indisponible');
      await settleRequest(request,'integre');
      requestState.set(request.id,{label:'Envoyé à ChatGPT',done:true});
    }else if(kind==='openai'){
      requestState.set(request.id,{label:'Intégration OpenAI…',running:true});
      rerender();
      const ok=await window.COURSES_OPENAI_INTEGRATION?.start(type,item);
      if(!ok){requestState.delete(request.id);rerender();return}
      await settleRequest(request,'integre');
      requestState.set(request.id,{label:'Intégration lancée',done:true});
    }
  }catch(_){
    requestState.set(request.id,{label:'Action impossible, réessaie.'});
  }
  rerender();
}
async function disconnect(node,button){
  if(button.dataset.confirm!=='1'){
    button.dataset.confirm='1';button.textContent='Confirmer';button.classList.add('is-confirm');
    return;
  }
  button.disabled=true;
  try{
    await service().adminRevokeDevice(access().credentials(),button.dataset.device);
    const family=families.find(item=>item.id===node.dataset.family);
    if(family)family.devices=family.devices.filter(device=>String(device.id)!==button.dataset.device);
    button.textContent='Déconnecté';button.classList.remove('is-confirm','is-danger');button.classList.add('is-done');
    renderSummary();
  }catch(_){
    button.disabled=false;button.dataset.confirm='';button.textContent='Réessayer';button.classList.remove('is-confirm');
  }
}
function onDialogClick(event){
  const node=event.currentTarget;
  if(event.target===node){node.close();return}
  const save=event.target.closest('[data-action="save-access"]');
  if(save){void saveAccess(node,save);return}
  if(event.target.closest('.family-admin-back')){renderFamilies(node);return}
  const familyRow=event.target.closest('.family-admin-row');
  if(familyRow){renderFamily(node,familyRow.dataset.family,'demandes');try{node.scrollTop=0}catch(_){}return}
  const tab=event.target.closest('.family-admin-tab');
  if(tab){renderFamily(node,node.dataset.family,tab.dataset.tab);return}
  const tool=event.target.closest('.family-row-tool');
  if(tool){if(!tool.disabled)void runTool(node,tool);return}
  const row=event.target.closest('.family-request-row');
  if(row){toggleRequest(row);return}
  const device=event.target.closest('.family-admin-action[data-device]');
  if(device&&!device.disabled)void disconnect(node,device);
}

function init(){
  if(!ensureRow())return;
  renderSummary();
  const reload=()=>{if(document.documentElement.dataset.account!=='family')void refresh().catch(()=>{})};
  document.addEventListener('courses:view-changed',event=>{if(event.detail?.view==='settings')reload()});
  document.addEventListener('courses:lock-changed',event=>{
    if(event.detail?.locked){families=[];requestState.clear();document.getElementById('familyAdminDialog')?.close();renderSummary()}
    else reload();
  });
  document.addEventListener('courses:account-changed',reload);
}

window.COURSES_FAMILY_ADMIN=Object.freeze({buildFamilies,statsFor,modifsFor,familyTitle,open:openFamilies});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
