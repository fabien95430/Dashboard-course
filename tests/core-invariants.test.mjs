import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('catalog.js reste la source du catalogue consommée par app.js',()=>{
  const app=read('app.js');
  const catalog=read('catalog.js');
  assert.match(catalog,/window\.COURSES_CATALOG = Object\.freeze\(/);
  assert.match(app,/const CATALOG = window\.COURSES_CATALOG;/);
  assert.match(app,/const GROUPS = CATALOG\.groups;/);
  assert.doesNotMatch(app,/window\.COURSES_CATALOG\s*=/);
});

test('le coffre local conserve les primitives et paramètres de sécurité actuels',()=>{
  const app=read('app.js');
  assert.match(app,/kdf:'PBKDF2-SHA256'/);
  assert.match(app,/iterations:600000/);
  assert.match(app,/crypto\.subtle\.deriveKey\([\s\S]*?\{name:'AES-GCM',length:256\}/);
  assert.match(app,/crypto\.subtle\.encrypt\(\{name:'AES-GCM',iv,additionalData:vaultAad\(\)\}/);
  assert.match(app,/crypto\.subtle\.decrypt\(\{name:'AES-GCM',iv,additionalData:vaultAad\(\)\}/);
  assert.match(app,/deleteKey\(STORAGE\.auth\);[\s\S]*?deleteKey\(STORAGE\.haUrl\);/);
});

test('le verrouillage ferme Home Assistant et efface les jetons en mémoire',()=>{
  const app=read('app.js');
  assert.match(app,/function closeSocket\(\)\{[\s\S]*?state\.ws\?\.close\(\)[\s\S]*?state\.ws=null;/);
  assert.match(app,/function wipeMemoryCredentials\(\)\{[\s\S]*?state\.accessToken=''[\s\S]*?state\.refreshToken='';/);
  assert.match(app,/function lockApp\(message='Application verrouillée\.'\)\{[\s\S]*?clearLockTimers\(\);[\s\S]*?closeSocket\(\);[\s\S]*?wipeMemoryCredentials\(\);[\s\S]*?state\.locked=true;/);
});

test('OAuth ne persiste pas les identifiants Home Assistant en clair',()=>{
  const app=read('app.js');
  assert.match(app,/sessionStorage\.setItem\(OAUTH_STATE_KEY,JSON\.stringify\(oauthState\)\)/);
  assert.match(app,/deleteKey\(STORAGE\.haUrl\);/);
  assert.match(app,/\/auth\/authorize\?client_id=/);
  assert.match(app,/await storeSecureVault\(data\.refresh_token,state\.haUrl,password\)/);
});

test('la synchronisation Home Assistant reste événementielle sans polling permanent',()=>{
  const app=read('app.js');
  assert.match(app,/type:'subscribe_trigger',trigger:\{platform:'state',entity_id:state\.entity\}/);
  assert.match(app,/msg\.type==='event'&&msg\.event\?\.variables\?\.trigger\?\.entity_id===state\.entity\)scheduleListRefresh\(\)/);
  assert.doesNotMatch(app,/setInterval\s*\(/);
});

test('le mode test reste local et indépendant de la connexion Home Assistant',()=>{
  const app=read('app.js');
  assert.match(app,/const DEMO_KEY = 'courses-external-demo-items-v2';/);
  assert.match(app,/\$\('#demoBtn'\)\.onclick=\(\)=>\{[\s\S]*?state\.demo=true;state\.locked=false;[\s\S]*?state\.items=loadJson\(DEMO_KEY,\[\]\)\|\|\[\];/);
  assert.match(app,/if\(state\.demo\)\{[\s\S]*?state\.items=loadJson\(DEMO_KEY,\[\]\)\|\|\[\];/);
});

test('le shell mobile conserve CSP et safe areas iOS',()=>{
  const index=read('index.html');
  const styles=read('styles.css');
  assert.match(index,/viewport-fit=cover/);
  assert.match(index,/Content-Security-Policy/);
  assert.match(styles,/env\(safe-area-inset-top\)/);
  assert.match(styles,/env\(safe-area-inset-bottom\)/);
});
