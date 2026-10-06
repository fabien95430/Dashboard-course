(()=>{
'use strict';

const CORE_URL='./missing-products-fixes-core.js?v=5';

function installQueueHandoff(){
  if(!document.getElementById('missing-products-queue-style')){
    const style=document.createElement('style');
    style.id='missing-products-queue-style';
    style.textContent='#missingProductsDialog .missing-dish-magic{display:none!important}';
    document.head.appendChild(style);
  }

  const bind=()=>{
    const dialog=document.getElementById('missingProductsDialog');
    const productList=document.getElementById('missingProductsList');
    const dishesList=document.getElementById('missingDishesList');
    if(!dialog||!productList||!dishesList)return false;
    [productList,dishesList].forEach(list=>{
      if(list.dataset.queueIntegrationBound==='1')return;
      list.dataset.queueIntegrationBound='1';
      list.addEventListener('click',event=>{
        const integrate=event.target.closest?.('[data-integrate-missing-dish],[data-integrate-missing-product]');
        if(!integrate)return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },true);
    });
    return true;
  };

  if(bind())return;
  const observer=new MutationObserver(()=>{
    if(bind())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),10000);
}

function loadCore(){
  const existing=document.querySelector('script[data-missing-products-fixes-core]');
  if(existing){
    if(existing.dataset.loaded==='1')installQueueHandoff();
    else existing.addEventListener('load',installQueueHandoff,{once:true});
    return;
  }
  const script=document.createElement('script');
  script.src=CORE_URL;
  script.defer=true;
  script.dataset.missingProductsFixesCore='1';
  script.addEventListener('load',()=>{
    script.dataset.loaded='1';
    installQueueHandoff();
  },{once:true});
  document.head.appendChild(script);
}

loadCore();
})();
