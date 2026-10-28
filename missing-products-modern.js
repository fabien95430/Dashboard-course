(() => {
'use strict';
/* Mise en forme des lignes manquantes. Le sélecteur animé est fourni par catalog-liquid.js. */
const C=`html body #missingProductsDialog{overflow:hidden!important;-webkit-overflow-scrolling:touch!important;touch-action:pan-y!important;overscroll-behavior:contain!important}`;
function css(){
  if(document.getElementById('missing-modern'))return;
  const style=document.createElement('style');
  style.id='missing-modern';
  style.textContent=C;
  document.head.appendChild(style);
}
function bindSharedSelector(){
  if(window.COURSES_SEGMENTED_LIQUID){window.COURSES_SEGMENTED_LIQUID.bindMissing();return}
  let script=document.querySelector('script[data-catalog-liquid]');
  if(!script){
    script=document.createElement('script');
    script.src='./catalog-liquid.js?v=635';
    script.async=false;
    script.dataset.catalogLiquid='script';
    document.body.appendChild(script);
  }
  script.addEventListener('load',()=>window.COURSES_SEGMENTED_LIQUID?.bindMissing(),{once:true});
}
css();
document.addEventListener('courses:dialog-opened',event=>{
  if(event.detail?.id==='missingProductsDialog')bindSharedSelector();
});
if(document.getElementById('missingProductsDialog')?.open)bindSharedSelector();
})();
