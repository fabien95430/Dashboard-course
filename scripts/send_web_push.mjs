import webpush from 'web-push';

const endpoint=String(process.env.PUSH_ENDPOINT||'').trim();
const p256dh=String(process.env.PUSH_P256DH||'').trim();
const auth=String(process.env.PUSH_AUTH||'').trim();
const publicKey=String(process.env.PUSH_PUBLIC_KEY||'').trim();
const privateKey=String(process.env.COURSES_VAPID_PRIVATE_KEY||'').trim();
const status=String(process.env.PUSH_STATUS||'error');
const dishName=String(process.env.DISH_NAME||'Plat').trim();
const requestId=String(process.env.REQUEST_ID||'').trim();
const baseUrl=String(process.env.COURSES_BASE_URL||'https://fabien95430.github.io/Dashboard-course/').trim();

if(!endpoint||!p256dh||!auth){
  console.log('Aucune souscription push fournie; notification ignorée.');
  process.exit(0);
}
if(!publicKey||!privateKey){
  console.log('Clés VAPID incomplètes; notification ignorée.');
  process.exit(0);
}

const target=new URL(baseUrl);
target.searchParams.set('courses_dish',dishName);
target.searchParams.set('courses_status',status==='added'?'added':'error');
if(requestId)target.searchParams.set('courses_request',requestId);

const success=status==='added';
const payload={
  title:'Courses',
  body:success
    ?`✅ ${dishName} est maintenant disponible dans le catalogue.`
    :`⚠️ L’intégration de « ${dishName} » a échoué.`,
  tag:requestId?`courses-dish-${requestId}`:'courses-dish-integration',
  status:success?'added':'error',
  dishName,
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
    console.log('Souscription push expirée; notification ignorée.');
    process.exit(0);
  }
  console.error('Échec notification push:',error?.message||error);
  process.exit(1);
}
