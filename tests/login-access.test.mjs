import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('la tuile Accès privé est la page d accueil : plus d écran Home Assistant de démarrage',()=>{
  const index=read('index.html'),app=read('app.js'),css=read('styles.css');
  assert.doesNotMatch(index,/id="setup"/);
  assert.doesNotMatch(index,/Tester sans Home Assistant/);
  assert.doesNotMatch(app,/showSetup|hideSetup|UI\.setup\b|haUrlInput|setupError/);
  assert.doesNotMatch(css,/#setup\b|\.setup-modal/);
  assert.match(index,/id="securityIdentifierWrap" class="field" hidden>[\s\S]*?<span>Identifiant<\/span>[\s\S]*?id="securityIdentifier"[^>]*autocomplete="username"/);
  // L'identifiant précède le mot de passe dans la même tuile.
  assert.ok(index.indexOf('id="securityIdentifier"')<index.indexOf('id="securityPassword"'));
  assert.match(app,/function showLogin\(message=''\)\{\s*showSecurity\('login'\);/);
  assert.match(app,/state\.loading=false;renderView\(\);showLogin\(\);/);
});

test('le tri admin / famille est local : empreinte SHA-256 de l identifiant normalisé',()=>{
  const app=read('app.js');
  const hash=app.match(/const ADMIN_IDENTIFIER_SHA256 = '([0-9a-f]{64})';/)?.[1];
  assert.ok(hash,'empreinte absente');
  assert.equal(hash,createHash('sha256').update('admin').digest('hex'));
  assert.match(app,/function normalizeIdentifier\(value\)\{return String\(value\|\|''\)\.trim\(\)\.toLowerCase\(\)\}/);
  assert.match(app,/await sha256Hex\(id\)===ADMIN_IDENTIFIER_SHA256/);
  // Aucun appel réseau dans le tri.
  const login=app.match(/async function completeLogin\(\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.ok(login.includes('isAdminIdentifier(identifier)'));
  assert.doesNotMatch(login,/fetch\(|WebSocket|supabase/i);
});

test('l identifiant est mémorisé sans secret et oublié à la déconnexion',()=>{
  const app=read('app.js');
  assert.match(app,/account:'courses-account-v1'/);
  assert.match(app,/function rememberAccount\(id,kind\)\{saveJson\(STORAGE\.account,\{id:String\(id\|\|''\),kind\}\)\}/);
  assert.match(app,/const login=mode==='login';\s*UI\.securityIdentifierWrap\.hidden=!login;/);
  const revoke=app.match(/async function revoke\(\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.ok(revoke.includes('forgetAccount();'));
  assert.ok(revoke.includes('showLogin();'));
});

test('Home Assistant se connecte depuis le popup Connexion (état non connecté)',()=>{
  const index=read('index.html'),app=read('app.js');
  assert.match(index,/id="connectionOAuthHint"[^>]*hidden>Connexion OAuth sécurisée\. L’autorisation reste chiffrée sur cet appareil\.<\/p>/);
  assert.match(index,/id="connectionConnectBtn" class="primary connection-connect-btn" type="button" hidden>Connecter Home Assistant<\/button>/);
  assert.match(app,/UI\.connectionConnectBtn\.hidden=!notConnected;/);
  assert.match(app,/UI\.connectionConnectBtn\.onclick=beginOAuth;/);
  assert.match(app,/const value=normalizeHaUrl\(UI\.connectionHaUrl\.value\);/);
  assert.match(app,/listSync\.textContent=connected\?'Connectée':state\.demo\?'Non connectée'/);
});

test('popup Connexion : statut de synchronisation court et libellé protégé contre le chevauchement',()=>{
  assert.match(read('missing-requests-store.js'),/setSharedStatus\('synced','Synchronisé'\);/);
  assert.match(read('styles.css'),/\.settings-sheet#connectionDialog \.connection-sync-line>span:first-child\{[^}]*overflow:hidden;text-overflow:ellipsis;/);
});

test('clavier iOS : le formulaire garde sa composition et tous ses éléments visibles',()=>{
  const ui=readFileSync(new URL('../app-ui.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.doesNotMatch(ui+css,/is-keyboard-lifted|securityKeyboardIntent|--security-keyboard-lift/);
  assert.match(ui,/function syncSecurityLayoutHeight\(\)/);
  assert.match(css,/--security-screen-height:var\(--lock-screen-h,var\(--security-layout-height,100svh\)\)/);
  assert.match(css,/\.security-modal \.field input\{[\s\S]*?font-size:18px/);
  const login=read('index.html').split('id="securityOverlay"')[1].split('</section>')[0];
  assert.doesNotMatch(login,/security-hero|welcome-cart|Mes courses/);
  assert.match(login,/id="securityTitle">Bonjour/);
  assert.match(login,/aria-controls="securityPassword" aria-pressed="false"/);
});
