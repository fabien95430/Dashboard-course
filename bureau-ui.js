(() => {
'use strict';
/* Écran « Bureau » (Réglages › Administrateur) — propriétaire unique.
   Bureau des agents IA (docs/BUREAU_AGENTS.md). Les dossiers sont les idées et corrections
   des familles (table retours) ; leur étape (colonne etape) est tenue par l'orchestrateur
   scripts/bureau_agent.py (workflow bureau-agent) :
   reçu → (idée : Autoriser) → Trieur → Développeur → Testeur → « À valider » → Valider / Refuser.
   L'agent au travail s'anime pour de vrai dans la scène (images ChatGPT, cadrage de la maquette validée). */

const DAY=864e5;
const TABS=Object.freeze([['cours','En cours'],['valider','À valider'],['termines','Terminés']]);
const AGENTS=Object.freeze([
  {id:'trieur',name:'Trieur',color:'#8F87E3'},
  {id:'testeur',name:'Testeur',color:'#2BAE84'},
  {id:'developpeur',name:'Développeur',color:'#4D97E0'}
]);
const TIMELINE=Object.freeze(['trieur','developpeur','testeur']);
const TYPE_LABELS=Object.freeze({idee:'Idée',correction:'Correction'});
const ETAPES=Object.freeze(['recu','autorise','trieur','developpeur','testeur','a_valider','valide','refuse','publie','echec']);
const STAGE_LABELS=Object.freeze({attente:'À autoriser',file:'En file',trieur:'Tri',developpeur:'Dév.',testeur:'Test',
  pret:'Prêt',publication:'Publication',echec:'Échec',publie:'En ligne',refuse:'Refusé',traite:'Traité'});
/* Étape affichée d'un retour : une idée reçue attend l'autorisation, une correction part seule. */
function stageOf(row){
  const etape=ETAPES.includes(row?.etape)?row.etape:'recu';
  if(row?.statut==='traite')return etape==='publie'||etape==='refuse'?etape:'traite';
  if(etape==='recu')return row?.type==='idee'?'attente':'file';
  if(etape==='autorise')return 'file';
  if(etape==='a_valider')return 'pret';
  if(etape==='valide')return 'publication';
  return etape;
}
const SVG_TYPE=Object.freeze({
  idee:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4" fill="none" stroke="#2f6a49" stroke-width="1.9" stroke-linecap="round"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" fill="#f3d36b" stroke="#2f6a49" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  correction:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" fill="#dfe9f6" stroke="#3c5f86" stroke-width="1.7" stroke-linejoin="round"/><path d="m13.5 6.5 4 4" stroke="#3c5f86" stroke-width="1.7"/></svg>'
});
const SVG_MAIL='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const SVG_PERSON='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 19.5c.9-3.4 3.4-5.2 6.5-5.2s5.6 1.8 6.5 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const SVG_DONE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_REFUSE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const SVG_COPY='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.9"/></svg>';

const esc=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ---------- Données (fonctions pures, testées) ---------- */
function familyName(email){
  return window.COURSES_FAMILY_ADMIN?.familyTitle?.(email)||'Famille';
}
function titleOf(message){
  const text=String(message||'').replace(/\s+/g,' ').trim();
  return text.length>60?text.slice(0,59).trimEnd()+'…':text;
}
function dayStart(time){const d=new Date(time);d.setHours(0,0,0,0);return d.getTime()}
function dayLabel(iso,now=Date.now()){
  const time=Date.parse(iso||'');
  if(!Number.isFinite(time))return '';
  const days=Math.round((dayStart(now)-dayStart(time))/DAY);
  if(days<=0)return 'Aujourd’hui';
  if(days===1)return 'Hier';
  const d=new Date(time);
  return 'Le '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');
}
function timeLabel(iso){
  const time=Date.parse(iso||'');
  if(!Number.isFinite(time))return '';
  const d=new Date(time);
  return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function buildDossiers(rows,families,now=Date.now()){
  const names=new Map((families||[]).map(row=>[String(row.id),familyName(String(row.email||''))]));
  const listed=names.size>0;
  const out={valider:[],cours:[],termines:[]};
  (rows||[]).forEach(row=>{
    const famille=String(row?.famille||'');
    // Quand la liste des foyers est connue, un retour d'un autre compte (admin) est ignoré.
    if(!row?.id||(listed&&!names.has(famille)))return;
    const context=row.contexte&&typeof row.contexte==='object'?row.contexte:{};
    const done=row.statut==='traite';
    const stage=stageOf(row);
    const agent=row.agent&&typeof row.agent==='object'?row.agent:{};
    const dossier={
      id:String(row.id),
      type:TYPE_LABELS[row.type]?row.type:'idee',
      title:titleOf(row.message),
      message:String(row.message||''),
      family:names.get(famille)||'Famille',
      received:row.cree_le||'',
      treated:row.traite_le||'',
      version:String(context.version||''),
      device:String(context.appareil||''),
      stage,
      stageLabel:STAGE_LABELS[stage],
      stageTime:row.etape_le||'',
      resume:String(agent.resume||agent.tri||''),
      remarques:String(agent.remarques||''),
      reason:String(agent.raison||''),
      failedAt:String(agent.etape_echec||''),
      files:Array.isArray(agent.fichiers)?agent.fichiers.map(String):[],
      tests:String(agent.tests||''),
      testsChanged:Array.isArray(agent.tests_modifies)?agent.tests_modifies.map(String):[],
      published:String(agent.version||'')
    };
    out[done?'termines':stage==='pret'?'valider':'cours'].push(dossier);
  });
  const recent=(a,b)=>(Date.parse(b.received)||0)-(Date.parse(a.received)||0);
  out.cours.sort(recent);
  out.valider.sort(recent);
  out.termines.sort((a,b)=>(Date.parse(b.treated||b.received)||0)-(Date.parse(a.treated||a.received)||0));
  out.termines=out.termines.slice(0,30);
  return out;
}

/* ---------- Scène : la pièce et les trois postes (images www/Bureau/webp, faites par scripts/make_bureau_images.py) ---------- */
const SCENE_IMAGES='./www/Bureau/webp/';
const SCENE_VERSION='865';
function sceneImage(file,cls){
  return '<img class="'+cls+'" src="'+SCENE_IMAGES+file+'.webp?v='+SCENE_VERSION+'" alt="" decoding="async" draggable="false">';
}
/* Bureau vert vide au repos. Un dossier par tâche non terminée (En cours ou À valider), six visibles au plus. */
const PILE_MAX=6;
function pileCountFor(inProgress,awaitingValidation,processingDemo=false){
  return Math.min(inProgress+awaitingValidation+(processingDemo?1:0),PILE_MAX);
}
function pileCount(){return pileCountFor(dossiers.cours.length,validerCount(),!!demo&&!demo.finished)}
function pileMarkup(count){
  let pile='';
  for(let k=1;k<=count;k++)pile+=sceneImage('dossier','bureau-pile-dossier is-'+k);
  return pile;
}

/* Pendant la démonstration, seule l'étiquette de l'agent actif montre son action et son détail.
   head : tête en % de la scène ; lift : écart au-dessus de la tête (px) ; shift : part de l'étiquette à gauche de la tête (%). */
const LEADS=Object.freeze({
  trieur:{head:[53.5,33.6],lift:16,shift:50},
  testeur:{head:[37.5,39.8],lift:6,shift:70},
  developpeur:{head:[71.5,44.8],lift:6,shift:55}
});
const TYPE_MS=45;      // une lettre
function labelMarkup(agent,typing=false){
  if(agentState(agent.id)!=='busy')return '';
  const title=ACTIVITIES[agent.id],detail=DETAILS[agent.id],lead=LEADS[agent.id];
  const letters=text=>typing?[...text].map(letter=>letter===' '?' ':'<span>'+esc(letter)+'</span>').join(''):esc(text);
  return '<span class="bureau-label is-'+agent.id+' is-busy'+(typing?' is-typing':'')+'" style="--agent:'+agent.color+';left:'+lead.head[0]+'%;top:calc('+lead.head[1]+'% - '+lead.lift+'px);transform:translate(-'+lead.shift+'%,-100%)" aria-label="'+esc(agent.name+' : '+title+'. '+detail)+'"'+(typing?' data-since="'+Math.round(demo?.ms||0)+'"':'')+'><b aria-hidden="true">'+letters(title)+'</b><small aria-hidden="true">'+letters(detail)+'</small></span>';
}
function typeLetters(label){
  const letters=label.querySelectorAll('b span,small span');
  const shown=Math.floor(((demo?.ms||0)-Number(label.dataset.since||0))/TYPE_MS)+1;
  letters.forEach((letter,index)=>letter.classList.toggle('is-on',index<shown));
  if(shown>=letters.length)label.classList.remove('is-typing');
}
function sceneMarkup(){
  // Ordre d'affichage = profondeur : Trieur au fond, puis Testeur (gauche) et Développeur (droite).
  return '<div class="bureau-scene-art" role="img" aria-label="Le bureau des agents'+(validerCount()?', '+validerCount()+' dossiers à valider':'')+'">'+sceneImage('piece','bureau-room')+
    AGENTS.map(agent=>'<span class="bureau-poste is-'+agent.id+'" data-frame="repos">'+sceneImage(agent.id+'-repos','is-repos')+'</span>').join('')+
    '<span class="bureau-pile">'+pileMarkup(pileCount())+'</span>'+AGENTS.map(agent=>labelMarkup(agent,!!demo&&!demo.finished)).join('')+'</div>'+
    playButton();
}

/* ---------- Actions (démonstration en attendant les agents) ----------
   Le Trieur, puis le Développeur, puis le Testeur travaillent chacun à leur tour.
   Seul l'agent actif bouge et affiche sa bulle (action + détail). Au relais et après
   le cycle, la bulle disparaît ; le dossier reste dans « À valider » jusqu'à validation.
   Rien n'est enregistré ni mis en ligne. Coupé à la fermeture du popup pendant le
   traitement, au verrouillage et si « réduire les animations » est actif. */
const POSTE_MS=480;    // une image de poste
const POSTE_CYCLE=Object.freeze(['frappe','repos','frappe','repos','frappe','repos','tete','tete','repos']);
const POSTE_PHASE=Object.freeze({trieur:0,testeur:3,developpeur:6});
const DEMO_STEPS=Object.freeze([['trieur',3000],['developpeur',6500],['testeur',9500]]);
const ACTIVITIES=Object.freeze({trieur:'Analyse la demande',developpeur:'Prépare le correctif',testeur:'Vérifie le résultat'});
const DETAILS=Object.freeze({trieur:'Identifie le type et les priorités',developpeur:'Repère les fichiers concernés',testeur:'Contrôle les tests et le rendu'});
const DONE=Object.freeze({trieur:'Dossier trié',developpeur:'Version prête',testeur:'Tests verts'});
let demo=null;         // {start, ms, timer, finished}

function reducedMotion(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(_){return false}}
function posteFrame(id,ms){
  return POSTE_CYCLE[(Math.floor(ms/POSTE_MS)+(POSTE_PHASE[id]||0))%POSTE_CYCLE.length];
}
/* Étape de la démonstration à l'instant ms : agent au travail, agents qui ont fini, dossier posé. */
function demoAt(ms){
  const index=DEMO_STEPS.findIndex(([,until])=>ms<until);
  const active=index<0?null:DEMO_STEPS[index][0];
  const done=DEMO_STEPS.slice(0,index<0?DEMO_STEPS.length:index).map(([id])=>id);
  return {active,done,filed:index<0};
}
/* Dossier de démonstration, à valider une fois la démonstration finie. */
function demoDossier(){
  return demo?.finished?{id:'demo',demo:true,type:'idee',title:'Trier les plats par temps',message:'Pouvoir trier les plats par temps de préparation',family:'Démonstration',received:demo.received,treated:'',version:'',device:'',stage:'pret',stageLabel:'Prêt'}:null;
}
function validerList(){return demo?.finished?[demoDossier(),...dossiers.valider]:dossiers.valider}
function validerCount(){return validerList().length}
/* Agent réellement au travail (une seule demande à la fois). La démonstration a la priorité. */
function liveAgent(){
  const working=dossiers.cours.find(dossier=>TIMELINE.includes(dossier.stage));
  return working?working.stage:null;
}
function agentState(id){
  if(!demo&&liveAgent()===id)return 'busy';
  return demo&&!demo.finished&&demoAt(demo.ms).active===id?'busy':null;
}
function ensureDemoLayers(scene){
  const loads=[];
  AGENTS.forEach(agent=>{
    const poste=scene.querySelector('.bureau-poste.is-'+agent.id);
    if(!poste)return;
    ['frappe','tete'].forEach(kind=>{
      if(poste.querySelector('.is-'+kind))return;
      poste.insertAdjacentHTML('beforeend',sceneImage(agent.id+'-'+kind,'is-'+kind));
      const img=poste.lastElementChild;
      loads.push(img.decode?img.decode().catch(()=>{}):Promise.resolve());
    });
  });
  return Promise.all(loads);
}
function ready(img){return !!img&&img.complete&&img.naturalWidth>0}
function paintDemo(scene){
  AGENTS.forEach(agent=>{
    const state=agentState(agent.id);
    const poste=scene.querySelector('.bureau-poste.is-'+agent.id);
    if(poste){
      const frame=state==='busy'?posteFrame(agent.id,demo?demo.ms:performance.now()):'repos';
      poste.dataset.frame=frame==='repos'||ready(poste.querySelector('.is-'+frame))?frame:'repos';
    }
    const label=scene.querySelector('.bureau-label.is-'+agent.id);
    if(state==='busy'&&!label)scene.insertAdjacentHTML('beforeend',labelMarkup(agent,!!demo));
    else if(state!=='busy'&&label)label.remove();
    const typing=scene.querySelector('.bureau-label.is-typing.is-'+agent.id);
    if(typing)typeLetters(typing);
  });
  const pile=scene.querySelector('.bureau-pile');
  if(pile&&pile.children.length!==pileCount())pile.innerHTML=pileMarkup(pileCount());
}
function demoTick(){
  if(!demo||demo.finished)return;
  const node=document.getElementById('bureauDialog');
  if(!node?.open||reducedMotion()){stopDemo();return}
  demo.ms=performance.now()-demo.start;
  const scene=node.querySelector('.bureau-scene-art');
  if(demoAt(demo.ms).filed&&!scene?.querySelector('.bureau-label.is-typing')){
    // Fini : le dossier attend ta validation dans « À valider ».
    clearInterval(demo.timer);
    demo.finished=true;demo.received=new Date().toISOString();
    if(node.dataset.view==='bureau')renderBureau(node,'valider');
    return;
  }
  if(scene){
    if(!scene.dataset.demo){scene.dataset.demo='1';void ensureDemoLayers(scene)}
    paintDemo(scene);
  }
}
async function startDemo(node){
  if(demo||reducedMotion())return;
  demo={start:0,ms:0,timer:0,finished:false};
  const scene=node.querySelector('.bureau-scene-art');
  if(scene){scene.dataset.demo='1';await ensureDemoLayers(scene)}
  if(!demo)return;
  demo.start=performance.now();
  if(node.dataset.view==='bureau')renderBureau(node);
  demoTick();
  demo.timer=setInterval(demoTick,TYPE_MS);
}
function stopDemo(){
  if(!demo)return;
  clearInterval(demo.timer);
  demo=null;
  const node=document.getElementById('bureauDialog');
  if(node?.open&&node.dataset.view==='bureau')renderBureau(node);
}
/* Agent réel au travail : ses images de poste alternent tant que le popup est ouvert (le minuteur s'arrête seul à la fermeture). */
let liveTimer=0;
function syncLive(node){
  const scene=node?.open&&node.dataset.view==='bureau'?node.querySelector('.bureau-scene-art'):null;
  const active=!!scene&&!demo&&!!liveAgent()&&!reducedMotion();
  if(!active){clearInterval(liveTimer);liveTimer=0;return}
  if(!scene.dataset.demo){scene.dataset.demo='1';void ensureDemoLayers(scene)}
  paintDemo(scene);
  if(!liveTimer)liveTimer=setInterval(()=>{
    const current=document.getElementById('bureauDialog');
    const art=current?.open&&current.dataset.view==='bureau'?current.querySelector('.bureau-scene-art'):null;
    if(!art||demo||!liveAgent()||reducedMotion()){clearInterval(liveTimer);liveTimer=0;return}
    if(!art.dataset.demo){art.dataset.demo='1';void ensureDemoLayers(art)}
    paintDemo(art);
  },POSTE_MS);
}
/* Fermeture du popup : une démonstration en cours s'arrête ; un dossier de démonstration fini reste à valider. */
function onDialogClose(){if(demo&&!demo.finished)stopDemo()}
const SVG_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>';
const SVG_STOP='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>';
function playButton(){
  if(reducedMotion())return '';
  return '<button type="button" class="bureau-play" data-action="demo" aria-pressed="'+(!!demo)+'" aria-label="'+(demo?'Arrêter la démonstration':'Lancer les actions')+'">'+(demo?SVG_STOP:SVG_PLAY)+'</button>';
}

/* ---------- Interface ---------- */
let dossiers={valider:[],cours:[],termines:[]};
let loaded=false;
let loading=null;
let lastError='';
const pendingIds=new Set();

function access(){return window.COURSES_ADMIN_ACCESS||null}
function service(){return window.COURSES_FAMILY||null}

function ensureRow(){
  const card=document.querySelector('#settingsAdministratorSection .settings-card');
  if(!card)return null;
  let row=document.getElementById('settingsBureauBtn');
  if(!row){
    row=document.createElement('button');
    row.id='settingsBureauBtn';
    row.className='settings-row';
    row.type='button';
    row.innerHTML='<span class="settings-icon settings-icon-bureau"><svg><use href="#i-briefcase"></use></svg><span id="settingsBureauCount" class="settings-count" hidden>0</span></span><span class="settings-copy"><strong>Bureau</strong><small id="settingsBureauSummary">Agents IA</small></span><svg class="chevron"><use href="#i-chevron"></use></svg>';
    row.addEventListener('click',openBureau);
  }
  // Juste sous « Familles ».
  const families=document.getElementById('settingsFamiliesBtn');
  if(families&&families.parentElement===card)families.after(row);
  else if(row.parentElement!==card)card.appendChild(row);
  return row;
}
/* Pastille rouge : dossiers à valider. */
function renderSummary(){
  const count=access()?.credentials()?dossiers.valider.length:0;
  const badge=document.getElementById('settingsBureauCount');
  if(badge){badge.textContent=count>99?'99+':String(count);badge.hidden=count<1}
  const summary=document.getElementById('settingsBureauSummary');
  if(!summary)return;
  if(!access()?.credentials()||!loaded)summary.textContent='Agents IA';
  else if(count)summary.textContent=count+' à valider';
  else summary.textContent=dossiers.cours.length?dossiers.cours.length+' en cours':'Aucun dossier en cours';
}
async function refresh(){
  const credentials=access()?.credentials();
  if(!credentials||!service()?.adminBureau){renderSummary();return dossiers}
  if(loading)return loading;
  loading=service().adminBureau(credentials).then(data=>{
    dossiers=buildDossiers(data.feedback,data.families);
    loaded=true;lastError='';
    void service().adminWatchRequests?.(credentials,scheduleRefresh).catch(()=>{});
    return dossiers;
  }).catch(error=>{
    lastError=String(error?.message||'Service famille indisponible');
    throw error;
  }).finally(()=>{loading=null;renderSummary()});
  return loading;
}

function dialog(){
  let node=document.getElementById('bureauDialog');
  if(node)return node;
  node=document.createElement('dialog');
  node.id='bureauDialog';
  node.className='dialog connection-dialog settings-sheet bureau-sheet';
  node.tabIndex=-1;
  node.addEventListener('click',onDialogClick);
  node.addEventListener('close',onDialogClose);
  node.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&event.target.classList?.contains('bureau-dossier')){event.preventDefault();renderDossier(node,event.target.dataset.dossier)}
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
  return '<h3'+(back?' class="has-back"':'')+'>'+(back?'<button type="button" class="settings-sheet-back bureau-back" aria-label="Retour au bureau"><svg aria-hidden="true"><use href="#i-chevron"></use></svg></button>':'')+
    '<span class="settings-sheet-icon" aria-hidden="true"><svg><use href="#i-briefcase"></use></svg></span><span class="settings-sheet-title">'+esc(title)+'</span></h3>';
}
function dossierRow(dossier){
  return '<div class="bureau-dossier" role="button" tabindex="0" data-dossier="'+esc(dossier.id)+'">'+
    '<span class="bureau-dossier-icon is-'+dossier.type+'" aria-hidden="true">'+SVG_TYPE[dossier.type]+'</span>'+
    '<span class="bureau-dossier-copy"><strong>'+esc(dossier.title)+'</strong><small><span>'+esc(dossier.family)+' · '+esc(dayLabel(dossier.received).toLowerCase())+'</span><span class="bureau-stage is-'+dossier.stage+'">'+esc(dossier.stageLabel)+'</span></small></span>'+
    '<svg class="chevron" aria-hidden="true"><use href="#i-chevron"></use></svg></div>';
}
const EMPTY=Object.freeze({
  valider:'Rien à valider. Les dossiers préparés par les agents arriveront ici.',
  cours:'Aucun dossier en cours.',
  termines:'Aucun dossier terminé.'
});
function renderBureau(node,tab){
  node.dataset.view='bureau';
  delete node.dataset.dossier;
  const current=tab||node.dataset.tab||(validerCount()?'valider':'cours');
  node.dataset.tab=current;
  const list=current==='valider'?validerList():dossiers[current]||[];
  let body;
  if(!loaded&&lastError)body='<p class="bureau-empty">Service famille indisponible.</p>';
  else if(!loaded)body='<p class="bureau-empty">Chargement…</p>';
  else body=list.length?'<div class="bureau-dossiers">'+list.map(dossierRow).join('')+'</div>':'<p class="bureau-empty">'+EMPTY[current]+'</p>';
  node.innerHTML=header('Bureau')+'<p class="dialog-intro bureau-intro"><i class="bureau-status-dot" aria-hidden="true"></i>3 agents · '+(liveAgent()?'au travail':'en service')+'</p>'+
    '<div class="bureau-scene">'+sceneMarkup()+'</div>'+
    '<div class="bureau-tabs" role="tablist">'+TABS.map(([id,label])=>{
      // « À valider » : pastille rouge de notification ; « En cours » : nombre à la suite.
      const count=id==='valider'?validerCount():(dossiers[id]||[]).length;
      const extra=id==='valider'?(count?'<span class="bureau-tab-count" aria-label="'+count+' à valider">'+(count>99?'99+':count)+'</span>':''):id==='cours'&&count?' · '+count:'';
      return '<button type="button" role="tab" class="bureau-tab'+(id===current?' is-active':'')+'" aria-selected="'+(id===current)+'" data-tab="'+id+'">'+label+extra+'</button>';
    }).join('')+'</div>'+body;
  syncLive(node);
}

function findDossier(id){
  if(id==='demo')return demoDossier();
  for(const key of Object.keys(dossiers)){const found=dossiers[key].find(item=>item.id===id);if(found)return found}
  return null;
}
function step(icon,color,title,meta,body,muted){
  return '<li class="bureau-step'+(muted?' is-waiting':'')+'"><span class="bureau-step-avatar" style="--agent:'+color+'" aria-hidden="true">'+icon+'</span>'+
    '<div class="bureau-step-copy"><strong>'+esc(title)+'</strong>'+(meta?'<small>'+esc(meta)+'</small>':'')+(body||'')+'</div></li>';
}
function renderDossier(node,id,message=''){
  const dossier=findDossier(id);
  if(!dossier){renderBureau(node);return}
  node.dataset.view='dossier';
  node.dataset.dossier=dossier.id;
  const received=[dayLabel(dossier.received),timeLabel(dossier.received),dossier.device].filter(Boolean).join(' · ');
  const done=dossier.stage==='traite';
  let steps=step(SVG_MAIL,'#2f6a49','Reçu',received,'<p class="bureau-step-bubble">« '+esc(dossier.message)+' »</p>'+(dossier.version?'<p class="bureau-step-note">Version '+esc(dossier.version)+'</p>':''));
  TIMELINE.map(id=>AGENTS.find(agent=>agent.id===id)).forEach(agent=>{
    steps+=dossier.demo?step(SVG_DONE,agent.color,agent.name,DONE[agent.id],''):agentStep(agent,dossier);
  });
  if(dossier.demo){
    node.innerHTML=header(dossier.title,true)+'<p class="dialog-intro">Démonstration · prêt à valider</p>'+
      '<ol class="bureau-timeline">'+steps+'</ol>'+
      '<div class="bureau-actions is-single"><button type="button" class="primary" data-action="validate-demo">'+SVG_DONE+'<span>Valider</span></button></div>'+
      '<p class="bureau-step-note bureau-demo-note">Démonstration : rien n’est mis en ligne.</p>';
    return;
  }
  const when=iso=>[dayLabel(iso),timeLabel(iso)].filter(Boolean).join(' · ');
  if(dossier.stage==='echec'&&dossier.failedAt==='publication')steps+=step(SVG_PERSON,'#df4040','Publication','Échec · '+when(dossier.stageTime),'<p class="bureau-step-note">'+esc(dossier.reason)+'</p>');
  if(dossier.stage==='publication')steps+=step(SVG_PERSON,'#2f6a49','Publication','En cours…','');
  if(dossier.stage==='publie')steps+=step(SVG_DONE,'#2f6a49','En ligne',[dossier.published,when(dossier.treated)].filter(Boolean).join(' · '),'');
  else if(dossier.stage==='refuse')steps+=step(SVG_DONE,'#6b746d','Refusé',when(dossier.treated),'');
  else if(done)steps+=step(SVG_DONE,'#2f6a49','Traité',when(dossier.treated),'');
  const prepared=['pret','publication','publie'].includes(dossier.stage)&&(dossier.resume||dossier.files.length);
  /* Un test existant mis à jour par l'agent est signalé avant Valider (règle Bureau d'AGENTS.md). */
  const summary=prepared?'<div class="bureau-summary"><p class="bureau-step-bubble">'+esc(dossier.resume)+'</p>'+
    (dossier.files.length?'<p class="bureau-step-note">Fichiers : '+esc(dossier.files.join(', '))+'</p>':'')+
    (dossier.tests?'<p class="bureau-step-note">Tests : '+esc(dossier.tests)+'</p>':'')+
    (dossier.testsChanged.length?'<p class="bureau-step-note is-warning">Tests modifiés : '+esc(dossier.testsChanged.join(', '))+'</p>':'')+
    (dossier.remarques?'<p class="bureau-step-note">Remarques du Testeur : '+esc(dossier.remarques)+'</p>':'')+'</div>':'';
  node.innerHTML=header(dossier.title,true)+'<p class="dialog-intro">'+esc([TYPE_LABELS[dossier.type],dossier.family,'reçu '+dayLabel(dossier.received).toLowerCase()].join(' · '))+'</p>'+
    '<ol class="bureau-timeline">'+steps+'</ol>'+summary+actionsMarkup(dossier)+
    '<p class="dialog-feedback'+(message?' is-visible':'')+'" role="status" aria-live="polite">'+esc(message)+'</p>';
}
/* Étape de chaque agent dans la frise : fait, au travail, en échec ou en attente. */
const AGENT_WAIT=Object.freeze({attente:'En attente de ton autorisation',file:'En file d’attente'});
function agentStep(agent,dossier){
  const order=TIMELINE.indexOf(agent.id);
  const stage=dossier.stage;
  const failed=stage==='echec'?(dossier.failedAt==='publication'?TIMELINE.length:Math.max(0,TIMELINE.indexOf(dossier.failedAt))):-1;
  const reached=['pret','publication','publie'].includes(stage)?TIMELINE.length:TIMELINE.includes(stage)?TIMELINE.indexOf(stage):failed;
  if(stage==='echec'&&order===failed)return step(SVG_PERSON,agent.color,agent.name,'Échec','<p class="bureau-step-note">'+esc(dossier.reason)+'</p>');
  if(order<reached)return step(SVG_DONE,agent.color,agent.name,DONE[agent.id],'');
  if(order===reached&&TIMELINE.includes(stage))return step(SVG_PERSON,agent.color,agent.name,ACTIVITIES[agent.id]+'…','');
  const meta=AGENT_WAIT[stage]||(['traite','refuse'].includes(stage)?'Non concerné':'À venir');
  return step(SVG_PERSON,agent.color,agent.name,meta,'',true);
}
function actionButton(action,label,icon,primary,pending,wide){
  return '<button type="button" class="'+(primary?'primary':'secondary')+(wide?' is-wide':'')+'" data-action="'+action+'"'+(pending?' disabled':'')+'>'+icon+'<span>'+label+'</span></button>';
}
function actionsMarkup(dossier){
  const pending=pendingIds.has(dossier.id);
  const copy=actionButton('copy','Copier',SVG_COPY,false,false);
  let buttons;
  if(dossier.stage==='attente')buttons=actionButton('authorize','Autoriser',SVG_DONE,true,pending,true)+actionButton('refuse','Refuser',SVG_REFUSE,false,pending)+copy;
  else if(dossier.stage==='pret')buttons=actionButton('validate','Valider et mettre en ligne',SVG_DONE,true,pending,true)+actionButton('refuse','Refuser',SVG_REFUSE,false,pending)+copy;
  else if(dossier.stage==='echec')buttons=actionButton('relaunch','Relancer',SVG_DONE,true,pending,true)+actionButton('treated','Marquer traité',SVG_DONE,false,pending)+copy;
  else if(['file','publication'].includes(dossier.stage)||TIMELINE.includes(dossier.stage))return '<div class="bureau-actions is-single">'+copy+'</div>';
  else return '';
  return '<div class="bureau-actions">'+buttons+'</div>';
}
async function copyText(text){
  try{await navigator.clipboard.writeText(text);return true}catch(_){}
  try{
    const area=document.createElement('textarea');
    area.value=text;area.setAttribute('readonly','');area.style.cssText='position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(area);area.select();
    const ok=document.execCommand('copy');area.remove();return ok;
  }catch(_){return false}
}
/* Décisions de l'administrateur (Supabase prévient ensuite les agents). */
const DECISIONS=Object.freeze({authorize:'autorise',relaunch:'autorise',validate:'valide',refuse:'refuse'});
const DONE_MESSAGES=Object.freeze({authorize:'Autorisé : les agents s’en occupent.',relaunch:'Relancé : les agents s’en occupent.',
  validate:'Validé : mise en ligne en cours.',refuse:'Refusé : rien ne sera mis en ligne.',treated:'Marqué traité.'});
async function runAction(node,action){
  const dossier=findDossier(node.dataset.dossier);
  if(!dossier)return;
  if(action==='copy'){
    const ok=await copyText(dossier.family+' — '+[TYPE_LABELS[dossier.type],dayLabel(dossier.received).toLowerCase(),dossier.version,dossier.device].filter(Boolean).join(' · ')+'\n'+dossier.message);
    renderDossier(node,dossier.id,ok?'Copié.':'Copie impossible.');
    return;
  }
  const decision=DECISIONS[action];
  if((action!=='treated'&&!decision)||pendingIds.has(dossier.id))return;
  pendingIds.add(dossier.id);
  renderDossier(node,dossier.id);
  try{
    if(decision)await service().adminSetFeedbackStage(access().credentials(),dossier.id,decision);
    else await service().adminSetFeedbackStatus(access().credentials(),dossier.id,'traite');
    await refresh().catch(()=>{});
    pendingIds.delete(dossier.id);
    if(node.dataset.view==='dossier'&&node.dataset.dossier===dossier.id)renderDossier(node,dossier.id,DONE_MESSAGES[action]);
  }catch(_){
    pendingIds.delete(dossier.id);
    if(node.dataset.view==='dossier'&&node.dataset.dossier===dossier.id)renderDossier(node,dossier.id,'Action impossible, réessaie.');
  }
}
function onDialogClick(event){
  const node=event.currentTarget;
  if(event.target===node){node.close();return}
  if(event.target.closest('.bureau-back')){renderBureau(node);try{node.scrollTop=0}catch(_){}return}
  const tab=event.target.closest('.bureau-tab');
  if(tab){renderBureau(node,tab.dataset.tab);return}
  const action=event.target.closest('[data-action]');
  if(action?.dataset.action==='demo'){if(demo)stopDemo();else void startDemo(node);return}
  if(action?.dataset.action==='validate-demo'){demo=null;renderBureau(node,'cours');try{node.scrollTop=0}catch(_){}return}
  if(action){if(!action.disabled)void runAction(node,action.dataset.action);return}
  const row=event.target.closest('.bureau-dossier');
  if(row){renderDossier(node,row.dataset.dossier);try{node.scrollTop=0}catch(_){}}
}
async function openBureau(){
  // Accès admin pas encore configuré : l'écran Familles le demande (même compte Supabase).
  if(!access()?.credentials()){window.COURSES_FAMILY_ADMIN?.open?.();return}
  const node=dialog();
  renderBureau(node,validerCount()?'valider':'cours');
  show(node);
  try{await refresh()}catch(_){}
  if(node.open&&node.dataset.view==='bureau')renderBureau(node);
}

let refreshTimer=0;
function scheduleRefresh(){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{
    void refresh().then(()=>{
      const node=document.getElementById('bureauDialog');
      if(node?.open&&node.dataset.view==='bureau')renderBureau(node);
    }).catch(()=>{});
  },800);
}
function forget(){
  stopDemo();
  dossiers={valider:[],cours:[],termines:[]};loaded=false;lastError='';pendingIds.clear();
  const node=document.getElementById('bureauDialog');
  if(node){try{node.close()}catch(_){}node.innerHTML=''}
  renderSummary();
}
function init(){
  if(!ensureRow())return;
  renderSummary();
  const reload=()=>{if(document.documentElement.dataset.account!=='family')void refresh().catch(()=>{})};
  document.addEventListener('courses:view-changed',event=>{if(event.detail?.view==='settings')reload()});
  document.addEventListener('courses:lock-changed',event=>{if(event.detail?.locked)forget();else reload()});
  document.addEventListener('courses:account-changed',reload);
  reload();
}

window.COURSES_BUREAU=Object.freeze({buildDossiers,stageOf,dayLabel,posteFrame,demoAt,pileCountFor,LEADS,open:openBureau});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
