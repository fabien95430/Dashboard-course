import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const ui=readFileSync(new URL('../app-ui.js',import.meta.url),'utf8');
function viewport({height=874,width=402,installed=false,physicalHeight=height}={}){
  const classes=new Set();
  const properties={};
  const style={setProperty:(key,value)=>properties[key]=value,removeProperty:key=>delete properties[key]};
  const fields={securityIdentifier:{},securityPassword:{},securityConfirm:{}};
  const modal={offsetTop:148,scrollHeight:357};
  const shell={style:{...style},scrollTop:0,querySelector:()=>modal,classList:{toggle:(key,on)=>on?classes.add(key):classes.delete(key)}};
  const overlay={style:{...style},classList:{contains:()=>true}};
  const document={activeElement:null,documentElement:{style,dataset:{},clientWidth:width},getElementById:id=>id==='securityOverlay'?overlay:fields[id],querySelector:()=>shell};
  const window={innerHeight:height,innerWidth:width,visualViewport:{height,offsetTop:0},screen:{height:physicalHeight},navigator:{},matchMedia:()=>({matches:installed})};
  const code=ui.slice(ui.indexOf('function securityViewportHeight()'),ui.indexOf('function bindSecurityKeyboardViewport()'));
  const context=vm.createContext({window,document,securityViewportSession:false,securityViewportRestoring:false});
  vm.runInContext(code,context);
  const sync=()=>vm.runInContext('syncSecurityKeyboardState()',context);
  return {window,document,shell,modal,fields,classes,properties,sync};
}

test('la hauteur du fond reste identique au focus, changement de champ et fermeture du clavier',()=>{
  const v=viewport();v.sync();
  assert.equal(v.properties['--security-layout-height'],'874px');
  v.document.activeElement=v.fields.securityIdentifier;
  v.window.innerHeight=528;v.window.visualViewport.height=528;v.sync();
  assert.equal(v.properties['--security-layout-height'],'874px');
  assert.equal(v.classes.has('is-scrollable'),false);
  v.document.activeElement=v.fields.securityPassword;v.sync();
  assert.equal(v.properties['--security-layout-height'],'874px');
  v.document.activeElement=null;v.sync();
  assert.equal(v.properties['--security-layout-height'],'874px','le blur arrive avant la fermeture du clavier');
  v.window.innerHeight=874;v.window.visualViewport.height=874;v.sync();
  assert.equal(v.properties['--security-layout-height'],'874px');
});

test('le fond et le formulaire compensent ensemble le panoramique iOS',()=>{
  const v=viewport();v.sync();v.window.visualViewport.offsetTop=42;v.sync();
  assert.equal(v.shell.style.top,'42px');
  assert.equal(v.properties['--security-viewport-offset'],'42px');
  v.window.visualViewport.offsetTop=0;v.sync();
  assert.equal(v.properties['--security-viewport-offset'],undefined);
});

test('un lancement PWA utilise immédiatement la hauteur physique, même si iOS expose moins de hauteur',()=>{
  const v=viewport({installed:true,height:812,physicalHeight:874});v.sync();
  assert.equal(v.properties['--security-layout-height'],'874px');
  assert.equal(v.document.documentElement.dataset.securityCompact,'false');
});

test('le choix compact est stable au clavier et une nouvelle largeur recalcule le paysage',()=>{
  const v=viewport();v.sync();
  v.document.activeElement=v.fields.securityPassword;v.window.visualViewport.height=528;v.sync();
  assert.equal(v.document.documentElement.dataset.securityCompact,'false');
  v.window.innerWidth=874;v.window.innerHeight=402;v.window.visualViewport.height=402;v.sync();
  assert.equal(v.properties['--security-layout-height'],'402px');
  assert.equal(v.document.documentElement.dataset.securityCompact,'true');
});

test('une erreur longue ou un petit écran reste accessible sans déplacer ni rétrécir les champs',()=>{
  const v=viewport();v.sync();v.document.activeElement=v.fields.securityPassword;
  v.window.visualViewport.height=528;v.modal.scrollHeight=440;v.sync();
  assert.equal(v.classes.has('is-scrollable'),true);
  assert.equal(v.shell.style.height,'528px');
  assert.equal(v.properties['--security-layout-height'],'874px');
  v.modal.scrollHeight=357;v.sync();
  assert.equal(v.classes.has('is-scrollable'),false);
});

test('l œil conserve la saisie, la sélection et le focus, puis masque à nouveau le mot de passe',()=>{
  const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  const code=source.slice(source.indexOf('function setSecurityPasswordVisible('),source.indexOf('function showSecurity('));
  const attributes={};let options;
  const input={type:'password',value:'exemple',selectionStart:2,selectionEnd:5,focus:value=>options=value,setSelectionRange:(a,b)=>{input.selectionStart=a;input.selectionEnd=b}};
  const context=vm.createContext({UI:{securityPassword:input},document:{activeElement:input,getElementById:()=>({setAttribute:(key,value)=>attributes[key]=value})}});
  vm.runInContext(code+'setSecurityPasswordVisible(true);',context);
  assert.equal(input.type,'text');assert.equal(input.value,'exemple');
  assert.equal(options.preventScroll,true);assert.equal(input.selectionStart,2);assert.equal(input.selectionEnd,5);
  assert.equal(attributes['aria-pressed'],'true');
  vm.runInContext('setSecurityPasswordVisible(false);',context);
  assert.equal(input.type,'password');assert.equal(attributes['aria-pressed'],'false');
  assert.match(source,/function showSecurity\([\s\S]*?setSecurityPasswordVisible\(false\)/);
  assert.match(source,/function hideSecurity\([\s\S]*?setSecurityPasswordVisible\(false\)/);
});

test('connexion iOS : focus sans défilement automatique, formulaire assez haut pour le clavier',()=>{
  const ui=readFileSync(new URL('../app-ui.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(ui,/document\.addEventListener\('touchend',event=>\{[\s\S]*?event\.preventDefault\(\);\s*field\.focus\(\{preventScroll:true\}\);/);
  assert.match(css,/clamp\(24px,calc\(\(var\(--security-screen-height\) - 660px\) \* \.45\),104px\)/);
});

test('connexion : version B, contours sauge, bouton « Se connecter », sans lien de récupération',()=>{
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.match(css,/\.security-modal h3\{margin:0;font:500 46px\/1\.05 "Baskerville"/);
  // v877 : contours complets demandés à la place du soulignement.
  assert.match(css,/border:1px solid var\(--login-outline\);border-radius:12px;/);
  assert.match(css,/\.security-modal \.password-panel \.primary\{[\s\S]*?background:var\(--login-button-bg\)/);
  const ui=readFileSync(new URL('../app-ui.js',import.meta.url),'utf8');
  // Ma liste vide : plus de bouton « Ouvrir le catalogue ».
  assert.doesNotMatch(ui,/list-empty-action|Ouvrir le catalogue/);
  const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const login=index.split('id="securityOverlay"')[1].split('</section>')[0];
  assert.match(login,/id="securitySubmit" class="primary" type="button">Se connecter</);
  assert.match(login,/class="security-card-copy">Heureux de vous retrouver</);
  assert.match(login,/id="securityIdentifier"[^>]*placeholder="Identifiant"/);
  assert.match(login,/id="securityPassword"[^>]*placeholder="Mot de passe"/);
  assert.doesNotMatch(login,/oublié|security-ornament/);
  // Pas de fond jaune du remplissage automatique iOS.
  assert.match(css,/\.security-modal \.field input:-webkit-autofill/);
  assert.doesNotMatch(css,/Courses DM Serif|Courses DM Sans|Courses Playfair|Courses Montserrat/);
});

test('ouverture : la vérification de mise à jour tourne aussi sur l’écran de connexion',()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.match(app,/if\(mode==='unlock'\|\|mode==='login'\)void gateUnlockOnUpdate\(\);/);
  assert.match(app,/button\.textContent=locked\?'Vérification…':\(unlockGateLabel\|\|'Se connecter'\);/);
  // Le bouton est rendu sur l'écran de connexion aussi (sinon il restait sur « Vérification… »).
  assert.match(app,/if\(!reloading&&\(state\.securityMode==='unlock'\|\|state\.securityMode==='login'\)\)setUnlockGate\(false\);/);
});
