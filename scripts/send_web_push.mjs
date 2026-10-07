import webpush from 'web-push';

const endpoint=String(process.env.PUSH_ENDPOINT||'').trim();
const p256dh=String(process.env.PUSH_P256DH||'').trim();
const auth=String(process.env.PUSH_AUTH||'').trim();
const publicKey=String(process.env.PUSH_PUBLIC_KEY||'').trim();
const privateKey=String(process.env.COURSES_VAPID_PRIVATE_KEY||'').trim();
const status=String(process.env.PUSH_STATUS||'error');
const rawName=String(process.env.DISH_NAME||'').trim();
const productPrefix='__courses_product__:';
const itemType=rawName.startsWith(productPrefix)?'product':'dish';
const itemName=(itemType==='product'?rawName.slice(productPrefix.length):rawName).trim()||(itemType==='product'?'Produit':'Plat');
const requestId=String(process.env.REQUEST_ID||'').trim();
const baseUrl=String(process.env.COURSES_BASE_URL||'https://fabien95430.github.io/Dashboard-course/').trim();

if(!endpoint||!p256dh||!auth){
  console.error('Souscription push absente ou incomplète; notification non envoyée.');
  process.exit(1);
}
if(!publicKey||!privateKey){
  console.error('Clés VAPID incomplètes; notification non envoyée.');
  process.exit(1);
}

const target=new URL(baseUrl);
target.searchParams.set(itemType==='product'?'courses_product':'courses_dish',itemName);
target.searchParams.set('courses_status',status==='added'?'added':'error');
if(requestId)target.searchParams.set('courses_request',requestId);

const success=status==='added';
const itemLabel=itemType==='product'?'produit':'plat';
const payload={
  title:success?'Ajout terminé':'Courses',
  body:success
    ?`${itemName} est maintenant disponible dans le catalogue.`
    :`⚠️ L’intégration du ${itemLabel} « ${itemName} » a échoué.`,
  tag:requestId?`courses-${itemType}-${requestId}`:`courses-${itemType}-integration`,
  status:success?'added':'error',
  itemType,
  itemName,
  requestId,
  url:target.toString()
};

webpush.setVapidDetails(
  'mailto:fabien95430@users.noreply.github.com',
  publicKey,
  privateKey
);

try{
  await webpush.sendNotification(
    {endpoint,keys:{p256dh,auth}},
    JSON.stringify(payload),
    {TTL:86400,urgency:'normal'}
  );
  console.log('Notification Courses envoyée.');
}catch(error){
  const code=Number(error?.statusCode||0);
  if(code===404||code===410){
    console.error('Souscription push expirée; notification non envoyée.');
    process.exit(1);
  }
  console.error('Échec notification push:',error?.message||error);
  process.exit(1);
}
