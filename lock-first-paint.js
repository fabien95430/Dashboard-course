// v639 — premier affichage : si un coffre existe, l'écran de connexion est déjà là
// (même fond, logo et carte que l'image de lancement iOS), au lieu d'un fond uni
// qui attend que app.js l'allume. app.js retire la classe quand il masque l'écran.
(function(){
  try{
    var root=document.documentElement;
    var oauthReturn=/[?&]code=/.test(location.search);
    if(!oauthReturn&&localStorage.getItem('courses-secure-vault-v1'))root.classList.add('is-prelock');
  }catch(e){}
})();
