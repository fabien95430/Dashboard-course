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
  // Aucun appel réseau dans le tri lui-même.
  const login=app.match(/async function completeLogin\(\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.ok(login.includes('isAdminIdentifier(identifier)'));
  const tri=app.match(/async function isAdminIdentifier\(value\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.ok(tri,'tri absent');
  assert.doesNotMatch(tri,/fetch\(|WebSocket|supabase|COURSES_FAMILY/i);
});

test('l identifiant est mémorisé sans secret et oublié à la déconnexion',()=>{
  const app=read('app.js');
  assert.match(app,/account:'courses-account-v1'/);
  assert.match(app,/function rememberAccount\(id,kind\)\{saveJson\(STORAGE\.account,\{id:String\(id\|\|''\),kind\}\)\}/);
  assert.match(app,/const login=mode==='login';[\s\S]*?const withIdentifier=login\|\|mode==='unlock';\s*UI\.securityIdentifierWrap\.hidden=!withIdentifier;/);
  // Déverrouillage du coffre : identifiant admin + mot de passe, comme à la connexion.
  assert.match(app,/if\(!await isAdminIdentifier\(UI\.securityIdentifier\.value\)\)\{error\.textContent='Identifiant incorrect\.'/);
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
  // v885 : la saisie a la police et la graisse des libellés (400), comme « Mot de passe ».
  assert.match(css,/\.security-modal \.field input\{[\s\S]*?font:400 16px/);
  const login=read('index.html').split('id="securityOverlay"')[1].split('</section>')[0];
  assert.doesNotMatch(login,/security-hero|welcome-cart|Mes courses/);
  assert.match(login,/id="securityTitle">Bonjour/);
  assert.match(login,/aria-controls="securityPassword" aria-pressed="false"/);
});

test('déverrouillage : la liste enregistrée est prête avant de quitter l’écran de connexion',()=>{
  const app=read('app.js');
  assert.match(app,/state\.locked=false;\s*\/\/[^\n]*\n[^\n]*\n\s*await restoreOfflineState\(\);\s*hideSecurity\(\);\s*await connectFromRefresh\(\);/);
});

test('admin sans coffre : mot de passe du compte admin Supabase vérifié une fois, sans saisie double',()=>{
  // v889 : le même mot de passe admin sur tous les appareils (choix du propriétaire).
  const app=read('app.js');
  const login=app.match(/async function completeLogin\(\)\{[\s\S]*?\n\}/)?.[0]||'';
  const admin=login.slice(login.indexOf('isAdminIdentifier(identifier)'),login.indexOf('enterAdminVaultMode(password,familyAdmin);'));
  assert.ok(admin.includes("if(vaultRecord()){showSecurity('unlock');return}"),'un coffre existant se déverrouille localement');
  assert.ok(admin.includes("if(!password){error.textContent='Entre ton mot de passe.'"));
  assert.ok(admin.includes('const familyAdmin=await window.COURSES_FAMILY.adminVerify(password);'));
  assert.ok(admin.indexOf('adminVerify(password)')<admin.indexOf("await storeSecureVault('','',password,familyAdmin);"),'coffre créé seulement après vérification');
  assert.doesNotMatch(admin,/securityConfirmWrap|UI\.securityConfirm|minPasswordLength/);
  assert.doesNotMatch(admin,/enterLocalMode\(\)/);
  // Coffre vide accepté au déchiffrement, sans adresse HA isolée.
  assert.match(app,/const empty=!!payload&&!payload\.refresh_token&&!payload\.ha_url;/);
  assert.match(app,/ha_url:refreshToken\?normalizeHaUrl\(haUrl\):'',/);
  const service=read('family-service.js');
  assert.match(service,/adminEmail:'admin\.maison@gmail\.com'/);
  const verify=service.match(/async function adminVerify\(password\)\{[\s\S]*?\n\}/)?.[0]||'';
  assert.match(verify,/persistSession:false,autoRefreshToken:false/);
  assert.match(verify,/status===400\|\|status===401\|\|status===403\)throw fail\('wrong'/);
  assert.match(verify,/throw fail\('unavailable','Service indisponible, réessaie plus tard\.'\)/);
  assert.doesNotMatch(verify,/localStorage|sessionStorage/,'aucun secret conservé hors du coffre');
});

test('coffre admin vide : déverrouillage local, accès admin conservé, verrouillage actif',()=>{
  const app=read('app.js');
  assert.match(app,/if\(!payload\.refresh_token\)\{enterAdminVaultMode\(password,payload\.family_admin\);return\}/);
  assert.match(app,/function enterAdminVaultMode\(password,familyAdmin\)\{\s*enterLocalMode\(\);\s*state\.adminVault=true;[\s\S]*?rememberVaultSeal\(password\);\s*armIdleLock\(\);/);
  assert.match(app,/function lockExempt\(\)\{return state\.demo&&!state\.adminVault\}/);
  assert.match(app,/function lockApp\(message='Application verrouillée\.'\)\{\s*if\(lockExempt\(\)\|\|!vaultRecord\(\)\)return;/);
  assert.match(app,/if\(!state\.demo\|\|state\.adminVault\)state\.familyAdmin=null;/);
});

test('retour OAuth dans un coffre existant : mot de passe vérifié avant le code, accès Supabase admin conservé',()=>{
  const app=read('app.js');
  assert.match(app,/const oauthIntoVault=state\.securityMode==='oauth'&&!!vaultRecord\(\);/);
  const branch=app.slice(app.indexOf("if(state.securityMode==='oauth'){\n      const code"),app.indexOf('await connectAuthorized(state.accessToken);'));
  assert.ok(branch.indexOf('decryptVault(vaultRecord(),password)')<branch.indexOf('exchangeCodeRaw('));
  assert.ok(branch.includes('registerUnlockFailure()'));
  assert.ok(branch.includes('familyAdmin=previous.family_admin||null;'));
  assert.match(app,/const creating=mode==='migrate'\|\|\(mode==='oauth'&&!vaultRecord\(\)\);/);
});
