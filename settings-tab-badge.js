(() => {
'use strict';

const REQUESTS=window.COURSES_MISSING_REQUESTS;
const source=document.getElementById('settingsMissingProductsCount');
const tab=document.querySelector('.tabs .tab[data-view="settings"]');
if(!REQUESTS||!source||!tab)return;

const badge=document.createElement('i');
badge.className='settings-tab-badge';
badge.setAttribute('aria-hidden','true');
Object.assign(badge.style,{
  position:'absolute',
  minWidth:'18px',
  height:'18px',
  padding:'0 4px',
  border:'2px solid rgba(255,255,255,.98)',
  borderRadius:'999px',
  // Même rouge que toutes les pastilles de l'app (variable du thème).
  background:'var(--danger)',
  color:'#fff',
  boxSizing:'border-box',
  fontSize:'10px',
  lineHeight:'1',
  fontStyle:'normal',
  fontWeight:'800',
  letterSpacing:'0',
  textAlign:'center',
  alignContent:'center',
  pointerEvents:'none',
  zIndex:'12',
  boxShadow:'0 2px 7px rgba(223,64,64,.22)'
});
// Chiffre centré sur sa hauteur réelle (hauteur des capitales), quelle que soit la police de l'appareil.
badge.style.setProperty('text-box','trim-both cap alphabetic');
badge.style.setProperty('font-variant-numeric','tabular-nums');
tab.style.position='relative';
tab.appendChild(badge);

function positionBadge(){
  const icon=[...tab.children].find(node=>node.tagName==='svg');
  if(!icon)return;
  const tabRect=tab.getBoundingClientRect();
  const iconRect=icon.getBoundingClientRect();
  badge.style.left=(iconRect.right-tabRect.left-5)+'px';
  badge.style.top=(iconRect.top-tabRect.top-7)+'px';
}

async function syncAppIconBadge(count){
  if(typeof navigator.setAppBadge!=='function')return;
  try{
    if(count>0){
      await navigator.setAppBadge(count);
    }else if(typeof navigator.clearAppBadge==='function'){
      await navigator.clearAppBadge();
    }else{
      await navigator.setAppBadge(0);
    }
  }catch(_){}
}

/* Pastille de l'onglet Réglages = somme des pastilles visibles dans Réglages : Catalogue des produits
   (demandes), et pour l'administrateur Familles, Bureau (à valider) et Messages d'erreur. Chaque
   module propriétaire publie son nombre. */
const adminCounts={family:0,bureau:0,errors:0};
const isFamilyAccount=()=>document.documentElement.dataset.account==='family';
for(const [event,key] of [['courses:family-requests-changed','family'],['courses:bureau-count-changed','bureau'],['courses:error-count-changed','errors']]){
  window.addEventListener(event,detail=>{adminCounts[key]=Math.max(0,Number(detail.detail?.count)||0);syncBadge()});
}
document.addEventListener('courses:account-changed',()=>syncBadge());
function syncBadge(){
  const admin=isFamilyAccount()?0:adminCounts.family+adminCounts.bureau+adminCounts.errors;
  const count=Math.max(0,Number(REQUESTS.counts?.().total)||0)+admin;
  badge.textContent=count>99?'99+':String(count);
  badge.style.display=count>0?'block':'none';
  if(count>0)requestAnimationFrame(positionBadge);
  void syncAppIconBadge(count);
}

async function requestBadgePermission(){
  if(typeof navigator.setAppBadge!=='function'||!('Notification' in window)||Notification.permission!=='default')return;
  try{
    const permission=await Notification.requestPermission();
    if(permission==='granted')syncBadge();
  }catch(_){}
}

const missingProductsButton=document.getElementById('settingsMissingProductsBtn');
const addMissingProductButton=document.getElementById('addMissingProduct');
const missingProductName=document.getElementById('missingProductName');
missingProductsButton?.addEventListener('click',()=>{
  const count=Math.max(0,Number(REQUESTS.counts?.().total)||0);
  if(count>0)void requestBadgePermission();
});
addMissingProductButton?.addEventListener('click',()=>{
  if(String(missingProductName?.value||'').trim())void requestBadgePermission();
});

window.addEventListener(REQUESTS.eventName,syncBadge);
window.addEventListener('resize',()=>requestAnimationFrame(positionBadge),{passive:true});
syncBadge();
})();
