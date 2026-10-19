import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Home Assistant enregistre les appareils sans serveur supplémentaire',()=>{
 const src=read('courses-notifications.js');
 assert.match(src,/todo\.courses_notifications/);
 assert.match(src,/callService\('todo','add_item'/);
 assert.match(src,/Notification\.requestPermission\(\)/);
 assert.match(src,/getSubscription\(\)/);
 assert.doesNotMatch(src,/setInterval\s*\(/);
});
test('fanout Web Push dédoublonne et conserve un abonné unique',()=>{
 const src=read('scripts/send_web_push.mjs');
 assert.match(src,/PUSH_SUBSCRIPTIONS/);
 assert.match(src,/seen\.has/);
 assert.match(src,/\.slice\(0,12\)/);
 assert.match(src,/404\|\|code===410/);
 assert.match(src,/process\.env\.PUSH_ENDPOINT/);
});
test('workflow de diffusion indépendant d OpenAI, secrets masqués',()=>{
 const wf=read('.github/workflows/notify-courses.yml');
 assert.match(wf,/courses_notification_event/);
 assert.match(wf,/::add-mask::/);
 assert.match(wf,/PUSH_SUBSCRIPTIONS/);
 assert.doesNotMatch(wf,/OPENAI_API_KEY|integrate_dish_openai.py/);
});
test('workflow OpenAI garde le flux original en secours',()=>{
 const wf=read('.github/workflows/integrate-dish-openai.yml');
 assert.match(wf,/'PUSH_ENDPOINT':'push_endpoint'/);
 assert.match(wf,/'PUSH_SUBSCRIPTIONS':'push_subscriptions'/);
});
