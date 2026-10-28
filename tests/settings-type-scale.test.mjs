import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const px=value=>{const m=/^(\d+(?:\.\d+)?)px$/.exec(value.trim());return m?Number(m[1]):NaN};
const FLOOR=13.5;

function scale(){
  const css=read('styles.css');
  const root=/:root\{(--fs-title:[^}]*)\}/.exec(css);
  assert.ok(root,'échelle --fs-* absente de styles.css');
  const tokens={};
  for(const [,name,value] of root[1].matchAll(/--fs-([a-z]+):([^;]+)/g))tokens[name]=px(value);
  return tokens;
}

const SCOPES={
  'styles.css':/\.settings-sheet|#missingProductsDialog|#preferencesDialog|\.settings-view|\.settings-copy|\.settings-section|\.settings-logout|\.connection-dialog|\.preference-toggle|\.security-setting|\.security-lock-select|\.missing-|\.dialog-intro|\.dialog-feedback/,
  'settings-ui.js':/#preferencesNotificationsPanel|\.connection-dialog/,
  'missing-products-popup-ui.js':/#missingProductsDialog/,
  'error-center.js':/\.courses-error/,
  'catalog-product-admin.js':/\.courses-product-admin|\.catalog-remove-panel/,
  'missing-products-fixes.js':/\.courses-openai-feedback/
};
// Titres (page et popups), glyphes (« + », « × ») et pastilles de compteur : hors règle texte.
const EXEMPT=/(^|\s)\.settings-sheet h3|settings-sheet-title|\.connection-dialog h3|\.page-header h1|missing-products-close|missing-add-start>span:first-child|courses-error-badge|settings-count/;

function declarations(){
  const found=[];
  for(const [file,scope] of Object.entries(SCOPES)){
    for(const m of read(file).matchAll(/([^{}]+)\{([^{}]*)\}/g)){
      const selector=m[1].replace(/\/\*[\s\S]*?\*\//g,'').trim();
      if(!scope.test(selector)||EXEMPT.test(selector))continue;
      const size=/(?:^|;)\s*font-size\s*:\s*([^;!]+)/.exec(m[2]);
      if(size)found.push({file,selector:selector.slice(-90),value:size[1].trim()});
    }
  }
  return found;
}

test('Réglages : texte des boutons ≤ sous-titre < titre, et aucun texte sous 13,5 px',()=>{
  const fs=scale();
  for(const name of ['title','sub','text','label','note'])assert.ok(Number.isFinite(fs[name]),'jeton --fs-'+name+' invalide');
  assert.ok(fs.text<=fs.sub,'texte des boutons > sous-titre');
  assert.ok(fs.sub<fs.title,'sous-titre >= titre');
  assert.ok(fs.label<=fs.sub,'libellé > sous-titre');
  assert.ok(fs.note<=fs.text,'légende > texte des boutons');
  for(const name of ['sub','text','label','note'])assert.ok(fs[name]>=FLOOR,'jeton --fs-'+name+' sous '+FLOOR+' px');
});

test('Réglages : aucune déclaration ne dépasse le sous-titre (hors titre) ni ne passe sous 13,5 px',()=>{
  const limit=scale().sub;
  const tooBig=[],tooSmall=[];
  for(const d of declarations()){
    if(d.value.startsWith('var('))continue;
    const n=px(d.value);
    if(!Number.isFinite(n))continue;
    if(n>limit)tooBig.push(d.file+' : '+d.selector+' → '+d.value);
    if(n<FLOOR)tooSmall.push(d.file+' : '+d.selector+' → '+d.value);
  }
  assert.deepEqual(tooBig,[]);
  assert.deepEqual(tooSmall,[]);
});

test('Réglages : les boutons de popup et « Se déconnecter » héritent de l’échelle',()=>{
  const css=read('styles.css');
  assert.match(css,/\.settings-sheet\{\s*font-size:var\(--fs-text\);/);
  assert.match(css,/\.settings-sheet \.primary,[^{]*\{[^}]*font-size:var\(--fs-text\)!important/);
  assert.match(css,/\.settings-sheet \.secondary,[^{]*\{[^}]*font-size:var\(--fs-text\)!important/);
  const logout=[...css.matchAll(/\.settings-logout\{[^}]*?font-size:([^;!]+)/g)].map(m=>m[1].trim());
  assert.ok(logout.length>0,'aucune taille pour Se déconnecter');
  assert.deepEqual([...new Set(logout)],['var(--fs-text)']);
});

test('Réglages : les textes de tuiles restent assez courts pour tenir sur une ligne',()=>{
  const sources=['index.html','settings-ui.js','purchase-intelligence.js'].map(read).join('\n');
  const texts=[];
  for(const m of sources.matchAll(/<(strong|small)[^>]*>([^<{'+]{4,})<\/\1>/g))texts.push({tag:m[1],text:m[2].replace(/&amp;/g,'&').trim()});
  const tile=sources.match(/class="(?:settings-copy|security-setting-copy|preference-toggle-copy|notifications-management-summary)"/g);
  assert.ok(tile&&tile.length>=5,'tuiles introuvables');
  const tooLong=texts.filter(t=>t.tag==='strong'?t.text.length>34:t.text.length>40).map(t=>t.tag+' ('+t.text.length+') : '+t.text);
  const ignored=/^(Optionnel|Choisir une catégorie|Notifications sur cet iPhone)$/;
  assert.deepEqual(tooLong.filter(l=>!ignored.test(l.split(' : ')[1])),[]);
});

test('Catalogue : Annuler et Ajouter ont exactement la même taille et le même alignement',()=>{
  const css=read('styles.css');
  assert.match(css,/#missingProductsDialog \.missing-add-actions\{[^}]*grid-template-columns:1fr 1fr;[^}]*align-items:start/);
  const rule=/#missingProductsDialog \.missing-add-actions button\{([^}]*)\}/.exec(css);
  assert.ok(rule,'règle des boutons absente');
  for(const decl of ['width:100%!important','min-height:48px!important','height:48px!important','margin:0!important'])assert.ok(rule[1].includes(decl),decl+' manquant');
});

test('Catalogue : le message flottant du bas garde sa pose native (marges de 14 px, police système) et reste dans l’écran',()=>{
  const css=read('styles.css'),fixes=read('missing-products-fixes.js');
  assert.match(css,/\.settings-sheet > :where\(:not\(\.courses-openai-feedback\)\),/);
  const rule=/#missingProductsDialog \.courses-openai-feedback\{([^}]*)\}/.exec(fixes);
  assert.ok(rule,'règle du message flottant absente');
  assert.match(rule[1],/position:absolute;[^}]*left:14px;right:14px;bottom:14px/);
  assert.match(rule[1],/font-family:-apple-system/);
  assert.match(rule[1],/font-size:var\(--fs-note\)/);
});

test('Catalogue : les messages du bas tiennent sur une ligne (titres courts, détail limité au nom ou à un compteur)',()=>{
  const source=['missing-products-fixes.js','missing-products-dishes.js'].map(read).join('\n');
  const calls=[...source.matchAll(/appNotify\('([^']*)'(?:,([^;]*?))?\);/g)];
  assert.ok(calls.length>=8,'appels appNotify introuvables');
  const problems=[];
  for(const [,title,detail] of calls){
    if(title.length>26)problems.push('titre trop long : '+title);
    if(detail&&/^detail\b/.test(detail.trim()))problems.push('détail libre (message d’erreur) : '+title);
    for(const [,literal] of (detail||'').matchAll(/'([^']*)'/g))if(literal.length>24)problems.push('détail trop long : '+literal);
  }
  assert.deepEqual(problems,[]);
});

test('recette : compteur sans « ingrédients sur », badges de quantité de largeur identique, ajout collé à la liste',()=>{
  const dishes=readFileSync(new URL('../dishes-ui.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.doesNotMatch(dishes,/ sur '\+total/);
  assert.match(dishes,/recipeCustomizationStatus\.textContent='Quantités pour 2 personnes'/);
  assert.match(dishes,/\.recipe-customization-quantity\{box-sizing:border-box;width:124px;/);
  assert.match(dishes,/\.recipe-customization-auto\{box-sizing:border-box;width:124px;/);
  assert.match(css,/\.recipe-customization-list\{flex:0 1 auto!important;/);
  assert.match(css,/\.recipe-customization-dialog \.dialog-actions\{flex:0 0 auto;margin-top:auto!important;/);
});

test('catalogue (Suppression) : Annuler rouge, ligne en retrait rouge franc sans rose, aucun balayage sur les plats',()=>{
  const admin=readFileSync(new URL('../catalog-product-admin.js',import.meta.url),'utf8');
  const dishes=readFileSync(new URL('../missing-products-dishes.js',import.meta.url),'utf8');
  assert.match(admin,/\.courses-product-admin-undo\{[^}]*color:#D32F2F;/);
  assert.match(admin,/\.is-deleting>\.courses-product-admin-row\{background:#FDECEA\}/);
  assert.match(admin,/\.is-deleting \.courses-product-admin-copy strong\{color:#B71C1C\}/);
  assert.match(admin,/if\(row\.dataset\.itemType==='dish'\)return;\s*clearBlockedNote\(\);/);
  assert.doesNotMatch(dishes,/Retirez un produit ou un plat/);
});
