(() => {
'use strict';

function installMissingProductsFixes(){
  if(!document.querySelector('script[data-missing-products-fixes]')){
    const script=document.createElement('script');
    script.src='./missing-products-fixes.js?v=656';
    script.defer=true;
    script.dataset.missingProductsFixes='1';
    document.head.appendChild(script);
  }
  if(!document.querySelector('script[data-missing-products-popup-ui]')){
    const script=document.createElement('script');
    script.src='./missing-products-popup-ui.js?v=628';
    script.defer=true;
    script.dataset.missingProductsPopupUi='1';
    document.head.appendChild(script);
  }
}
function installProductItemImages(){
  if(document.querySelector('script[data-product-item-images]'))return;
  const script=document.createElement('script');
  script.src='./product-item-images.js?v=610';
  script.defer=true;
  script.dataset.productItemImages='1';
  document.head.appendChild(script);
}
function installPurchaseIntelligence(){
  if(document.querySelector('script[data-purchase-intelligence]'))return;
  const script=document.createElement('script');
  script.src='./purchase-intelligence.js?v=630';
  script.defer=true;
  script.dataset.purchaseIntelligence='1';
  document.head.appendChild(script);
}
installMissingProductsFixes();
installProductItemImages();
installPurchaseIntelligence();
})();