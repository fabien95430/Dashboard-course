import webpush from 'web-push';

const endpoint=String(process.env.PUSH_ENDPOINT||'').trim();
const p256dh=String(process.env.PUSH_P256DH||'').trim();
const auth=String(process.env.PUSH_AUTH||'').trim();
const publicKey=String(process.env.PUSH_PUBLIC_KEY||'').trim();
const privateKey=String(process.env.COURSES_VAPID_PRIVATE_KEY||'').trim();
let rawSubscriptions=[];
try{
  rawSubscriptions=JSON.parse(String(process.env.PUSH_SUBSCRIPTIONS||'[]'));
  if(!Array.isArray(rawSubscriptions))rawSubscriptions=[];
}catch(_){rawSubscriptions=[]}
const seen=new Set();
const candidates=[...rawSubscriptions.slice(0,12),
  ...(endpoint&&p256dh&&auth?[{endpoint,p256dh,auth,publicKey}]:[])];
const recipients=[];
for(const item of candidates){
  if(!item||typeof item!=='object')continue;
  const entry={
    endpoint:String(item.endpoint||item.push_endpoint||''),
    p256dh:String(item.p256dh||item.push_p256dh||''),
    auth:String(item.auth||item.push_auth||''),
    publicKey:String(item.publicKey||item.push_public_key||publicKey)
  };
  try{
    const uri=new URL(entry.endpoint);
    if(uri.protocol!=='https:'||uri.username||uri.password)continue;
  }catch(_){continue}
  if(!/^[A-Za-z0-9_-]{32,}$/.test(entry.p256dh)||!/^[A-Za-z0-9_-]{10,}$/.test(entry.auth)
    ||!/^[A-Za-z0-9_-]{80,}$/.test(entry.publicKey)||seen.has(entry.endpoint))continue;
  seen.add(entry.endpoint);recipients.push(entry);
  if(recipients.length>=12)break;
}
const eventKind=String(process.env.COURSES_EVENT_KIND||'').trim();
const eventName=String(process.env.COURSES_ITEM_NAME||'').trim().slice(0,80);
const eventType=process.env.COURSES_ITEM_TYPE==='dish'?'dish':'product';
const status=String(process.env.PUSH_STATUS||'error');
const rawName=String(process.env.DISH_NAME||'').trim();
const productPrefix='__courses_product__:';
const deleteProductPrefix='__courses_delete_product__:';
const deleteDishPrefix='__courses_delete_dish__:';
const deleteProduct=rawName.startsWith(deleteProductPrefix);
const deleteDish=rawName.startsWith(deleteDishPrefix);
const deleting=deleteProduct||deleteDish;
const itemType=deleteProduct?'product':deleteDish?'dish':rawName.startsWith(productPrefix)?'product':'dish';
const itemName=(deleteProduct
  ?rawName.slice(deleteProductPrefix.length)
  :deleteDish
    ?rawName.slice(deleteDishPrefix.length)
    :itemType==='product'?rawName.slice(productPrefix.length):rawName
).trim()||(itemType==='product'?'Produit':'Plat');
const requestId=String(process.env.REQUEST_ID||'').trim();
const stage=String(process.env.PUSH_STAGE||'').trim();
const rawError=String(process.env.PUSH_ERROR||'').trim();
const errorDetail=rawError
  .replace(/Bearer\s+[A-Za-z0-9._~+\/-]+/gi,'Bearer [masqué]')
  .replace(/\bsk-[A-Za-z0-9_-]+\b/g,'[clé masquée]')
  .replace(/\s+/g,' ')
  .trim()
  .slice(0,900);
const baseUrl=String(process.env.COURSES_BASE_URL||'https://fabien95430.github.io/Dashboard-course/').trim();

if(!recipients.length){
  console.error('Aucun appareil avec souscription valide; notification non envoyée.');
  process.exit(1);
}
if(!privateKey){
  console.error('Clé VAPID privée absente; notification non envoyée.');
  process.exit(1);
}

const success=status==='added';
const publicStatus=success?(deleting?'deleted':'added'):'error';
const itemLabel=itemType==='product'?'produit':'plat';
const publicationBlocked=!success&&!deleteProduct&&stage==='deployment'&&!deleteDish;
const failureStageLabel={
  integration:'Génération ou intégration',
  validation:'Validation du visuel',
  checkpoint:'Sauvegarde de la génération',
  repository:'Validation ou publication du dépôt',
  deployment:'Validation ou publication du dépôt / GitHub Pages'
}[stage]||(deleting?'Suppression du catalogue':`Intégration du ${itemLabel}`);
const fallbackError=stage==='deployment'
  ?'La publication ou le déploiement GitHub Pages n’a pas pu être confirmé.'
  :deleting
    ?`La suppression du ${itemLabel} n’a pas pu être terminée.`
    :`L’intégration du ${itemLabel} n’a pas pu être terminée.`;
const failureReason=errorDetail||fallbackError;
const integrationSuccessTitle=deleteProduct?'Produit supprimé':itemType==='product'?'Produit intégré':'Plat intégré';
const integrationFailureTitle=publicationBlocked?'Publication bloquée':deleteProduct?'Suppression échouée':'Intégration échouée';

const target=new URL(baseUrl);
target.searchParams.set(itemType==='product'?'courses_product':'courses_dish',itemName);
target.searchParams.set('courses_status',publicStatus);
if(requestId)target.searchParams.set('courses_request',requestId);
if(!success){
  target.searchParams.set('courses_error',failureReason.slice(0,500));
  if(stage)target.searchParams.set('courses_stage',stage);
}

const payload={
  title:success
    ?deleteDish?'Plat supprimé':integrationSuccessTitle
    :deleteDish?'Suppression échouée':integrationFailureTitle,
  body:success
    ?deleting
      ?`« ${itemName} » a été supprimé du catalogue.`
      :`« ${itemName} » est maintenant disponible dans le catalogue.`
    :publicationBlocked
      ?`« ${itemName} » est prêt, mais sa publication a été bloquée.`
      :deleting
        ?`« ${itemName} » n’a pas pu être supprimé · ${failureStageLabel}.`
        :`« ${itemName} » n’a pas pu être intégré · ${failureStageLabel}.`,
  tag:requestId?`courses-${deleting?itemType+'-delete':itemType}-${requestId}`:`courses-${deleting?itemType+'-delete':itemType}-integration`,
  status:publicStatus,
  itemType,
  itemName,
  operation:deleting?'delete':'integrate',
  requestId,
  stage:success?'':stage,
  error:success?'':failureReason,
  url:target.toString()
};

if(['request_added','started'].includes(eventKind)&&eventName){
  const label=eventType==='dish'?'Plat':'Produit';
  const started=eventKind==='started';
  payload.title=started?'Intégration OpenAI lancée':label+' manquant ajouté';
  payload.body=started
    ?'« '+eventName+' » est en cours de génération.'
    :'« '+eventName+' » a été ajouté aux demandes manquantes.';
  payload.tag='courses-'+eventKind+'-'+(requestId||eventName.toLowerCase().replace(/[^a-z0-9]+/g,'-'));
  payload.status=eventKind;
  payload.itemType=eventType;
  payload.itemName=eventName;
  payload.operation=eventKind;
  payload.requestId=requestId;
  payload.error='';
  payload.url=baseUrl;
}
async function sendToDevice(subscription){
  webpush.setVapidDetails(
  'mailto:fabien95430@users.noreply.github.com',
    subscription.publicKey,privateKey
  );
  await webpush.sendNotification(
    {endpoint:subscription.endpoint,keys:{p256dh:subscription.p256dh,auth:subscription.auth}},
    JSON.stringify(payload),
    {TTL:86400,urgency:'normal'}
  );
}
let sent=0,expired=0;
for(const subscription of recipients){
  try{await sendToDevice(subscription);sent++}
  catch(error){
    const code=Number(error?.statusCode||0);
    if(code===404||code===410){expired++;continue}
    console.error('Échec Web Push sur un appareil :',Number(error?.statusCode||0)||'indisponible');
  }
}
console.log('Notifications Courses : '+sent+' appareil(s), '+expired+' abonnement(s) expiré(s).');
if(!sent)process.exitCode=1;
