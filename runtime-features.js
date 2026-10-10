(() => {
'use strict';

function installMissingProductsFixes(){
  if(!document.querySelector('script[data-missing-products-fixes]')){
    const script=document.createElement('script');
    script.src='./missing-products-fixes.js?v=399';
    script.defer=true;
    script.dataset.missingProductsFixes='1';
    document.head.appendChild(script);
  }
  if(!document.querySelector('script[data-missing-products-popup-ui]')){
    const script=document.createElement('script');
    script.src='./missing-products-popup-ui.js?v=18';
    script.defer=true;
    script.dataset.missingProductsPopupUi='1';
    document.head.appendChild(script);
  }
}
function installProductItemImages(){
  if(document.querySelector('script[data-product-item-images]'))return;
  const script=document.createElement('script');
  script.src='./product-item-images.js?v=408';
  script.defer=true;
  script.dataset.productItemImages='1';
  document.head.appendChild(script);
}
function installPurchaseIntelligence(){
  if(document.querySelector('script[data-purchase-intelligence]'))return;
  const script=document.createElement('script');
  script.src='./purchase-intelligence.js?v=409';
  script.defer=true;
  script.dataset.purchaseIntelligence='1';
  document.head.appendChild(script);
}
installMissingProductsFixes();
installProductItemImages();
installPurchaseIntelligence();
})();
