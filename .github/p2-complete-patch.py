from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one match, got {count} for {old[:120]!r}')
    p.write_text(text.replace(old, new, 1))


def replace_exact_count(path, old, new, expected):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != expected:
        raise SystemExit(f'{path}: expected {expected} matches, got {count} for {old[:120]!r}')
    p.write_text(text.replace(old, new))


app_path = Path('app.js')
app = app_path.read_text()
start = app.index('function renderList(){')
end = app.index('function updateListReorderAvailability(root){', start)
new_render = r'''const listRowCache=new Map();
const listCategoryHeadingCache=new Map();
const listEmptyState=document.createElement('div');

function reconcileListChildren(root,nodes){
  const wanted=new Set(nodes);
  [...root.children].forEach(child=>{if(!wanted.has(child))child.remove()});
  nodes.forEach((node,index)=>{
    const current=root.children[index]||null;
    if(current!==node)root.insertBefore(node,current);
  });
}
function renderListEmptyState(root,message,loading=false){
  listEmptyState.className='empty';
  if(loading)listEmptyState.innerHTML='<span class="spinner"></span>'+message;
  else listEmptyState.textContent=message;
  reconcileListChildren(root,[listEmptyState]);
}
function createListRow(key){
  const row=document.createElement('div');
  row.className='list-row';
  row.dataset.key=key;
  row.innerHTML=
    '<button class="purchase-check" type="button"><svg><use href="#i-check"></use></svg></button>'+ 
    '<span class="list-icon"></span>'+ 
    '<span class="list-copy"><strong class="list-name"></strong><small class="list-detail"></small></span>'+ 
    '<button class="undo-purchase" type="button" hidden>Annuler</button>'+ 
    '<button class="row-grip list-row-more" type="button" aria-haspopup="menu">•••</button>';
  const button=row.querySelector('.purchase-check');
  if(button)button.onclick=event=>{
    event.stopPropagation();
    removeGroup(button.dataset.name||'',row,'purchase');
  };
  const undo=row.querySelector('.undo-purchase');
  if(undo)undo.onclick=event=>{
    event.stopPropagation();
    undoPurchase(undo.dataset.name||'',row);
  };
  return row;
}
function updateListRow(row,group,showCategorySections){
  const name=String(group.summary||''),key=norm(name),product=catalogProductFor(name),busy=state.productBusy.has(key);
  const categoryLabel=product?.sub||product?.category||'Article';
  if(row.dataset.key!==key)row.dataset.key=key;
  if(row.dataset.name!==name)row.dataset.name=name;
  row.classList.toggle('is-busy',busy);
  if(!busy)row.classList.remove('is-purchased','is-removing','is-deleting');

  const button=row.querySelector('.purchase-check');
  if(button){
    button.dataset.name=name;
    button.disabled=busy;
    const label='Marquer '+name+' comme acheté';
    if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);
  }

  const icon=row.querySelector('.list-icon');
  const visualKey=product?'product:'+norm(product.name):'unknown';
  if(icon&&icon.dataset.visualKey!==visualKey){
    icon.dataset.visualKey=visualKey;
    icon.innerHTML=product?sprite(product,true):'<span class="unknown">•</span>';
    bindProductImageFallbacks(icon);
  }

  const title=row.querySelector('.list-name');
  if(title&&title.textContent!==name)title.textContent=name;
  const copy=row.querySelector('.list-copy');
  let detail=row.querySelector('.list-detail');
  if(copy&&!detail){
    detail=document.createElement('small');
    detail.className='list-detail';
    copy.insertBefore(detail,copy.querySelector('.list-measured-quantity')||null);
  }
  if(detail){
    if(detail.textContent!==categoryLabel)detail.textContent=categoryLabel;
    detail.hidden=showCategorySections;
  }

  let quantity=row.querySelector('.list-qty');
  if(group.count>1){
    if(!quantity){
      quantity=document.createElement('span');
      quantity.className='list-qty';
      row.insertBefore(quantity,row.querySelector('.undo-purchase'));
    }
    const text='x'+group.count;
    if(quantity.textContent!==text)quantity.textContent=text;
  }else{
    quantity?.remove();
  }

  const undo=row.querySelector('.undo-purchase');
  if(undo){
    undo.dataset.name=name;
    if(!busy)undo.hidden=true;
  }
  const more=row.querySelector('.list-row-more');
  if(more){
    more.dataset.name=name;
    const label='Actions pour '+name;
    if(more.getAttribute('aria-label')!==label)more.setAttribute('aria-label',label);
    if(!busy)more.disabled=false;
  }
  return row;
}
function listRow(group,showCategorySections){
  const key=norm(group.summary);
  let row=listRowCache.get(key);
  if(!row){
    row=createListRow(key);
    listRowCache.set(key,row);
  }
  return updateListRow(row,group,showCategorySections);
}
function listCategoryHeading(category){
  let heading=listCategoryHeadingCache.get(category);
  if(!heading){
    heading=document.createElement('div');
    heading.className='list-category-heading';
    heading.setAttribute('role','heading');
    heading.setAttribute('aria-level','2');
    listCategoryHeadingCache.set(category,heading);
  }
  if(heading.textContent!==category)heading.textContent=category;
  return heading;
}
function pruneListRowCache(groups){
  const activeKeys=new Set(groups.map(group=>norm(group.summary)));
  listRowCache.forEach((_row,key)=>{if(!activeKeys.has(key))listRowCache.delete(key)});
}
function renderList(){
  const groups=activeGroups(),needle=norm(state.listQuery);
  emitListChangedIfNeeded(groups);
  const rows=sortedGroups(visibleListGroups(groups));
  const el=$('#listItems');
  if(!el)return;
  pruneListRowCache(groups);
  const count=$('#listCount');if(count)count.textContent=rows.length+' article'+(rows.length>1?'s':'');
  if(state.loading&&!groups.length){renderListEmptyState(el,'Synchronisation…',true);notifyListRendered();return}
  if(!rows.length){
    const message=needle?'Aucun article trouvé.':(state.listCategoryFilter!=='Toutes'?'Aucun article dans cette catégorie.':(state.error?'Liste indisponible.':'La liste est vide.'));
    renderListEmptyState(el,message);
    notifyListRendered();
    return;
  }
  const showCategorySections=state.preferences.listSort==='category';
  let previousCategory='';
  const nodes=[];
  rows.forEach(group=>{
    const product=catalogProductFor(group.summary),category=product?.category||'Autres';
    if(showCategorySections&&category!==previousCategory)nodes.push(listCategoryHeading(category));
    previousCategory=category;
    nodes.push(listRow(group,showCategorySections));
  });
  reconcileListChildren(el,nodes);
  bindListReorder(el);
  updateListReorderAvailability(el);
  notifyListRendered();
}
'''
app = app[:start] + new_render + app[end:]

old_bind = "function bindListReorder(root){\n  root.querySelectorAll('.list-row').forEach(row=>{\n    const action=row.querySelector('.row-grip');"
new_bind = "function bindListReorder(root){\n  root.querySelectorAll('.list-row').forEach(row=>{\n    if(row.dataset.listReorderBound==='1')return;\n    row.dataset.listReorderBound='1';\n    const action=row.querySelector('.row-grip');"
if app.count(old_bind) != 1:
    raise SystemExit('app.js: bindListReorder shape changed')
app = app.replace(old_bind, new_bind, 1)

old_remove_tail = "  if(!rows.length){renderList();return}\n  updateListReorderAvailability(root);\n}\nfunction listRowCategory(row){"
new_remove_tail = "  if(!rows.length){renderList();return}\n  updateListReorderAvailability(root);\n  notifyListRendered();\n}\nfunction listRowCategory(row){"
if app.count(old_remove_tail) != 1:
    raise SystemExit('app.js: removeRenderedListRow tail changed')
app = app.replace(old_remove_tail, new_remove_tail, 1)

old_refresh = "    state.loading=false;state.error='';syncProductSelection();\n    if(!listDomMatchesCurrentState())renderList();"
if app.count(old_refresh) != 1:
    raise SystemExit('app.js: online refresh block changed')
app = app.replace(old_refresh, "    state.loading=false;state.error='';syncProductSelection();\n    renderList();", 1)

old_offline_refresh = "    syncProductSelection();\n    if(!listDomMatchesCurrentState())renderList();\n    status('','Synchronisé',state.entities.find(e=>e.id===state.entity)?.name||state.entity);"
if app.count(old_offline_refresh) != 1:
    raise SystemExit('app.js: offline refresh block changed')
app = app.replace(old_offline_refresh, "    syncProductSelection();\n    renderList();\n    status('','Synchronisé',state.entities.find(e=>e.id===state.entity)?.name||state.entity);", 1)

if 'listDomMatchesCurrentState' in app:
    raise SystemExit('app.js: obsolete listDomMatchesCurrentState remains')
if 'el.innerHTML=rows.map' in app:
    raise SystemExit('app.js: full list rebuild remains')
app_path.write_text(app)

# P2 regression tests: execute the reconciliation helper and pin the keyed rendering contract.
Path('tests/list-render-reuse.test.mjs').write_text(r'''import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');

function reconciliation(){
  const start=source.indexOf('function reconcileListChildren(root,nodes){');
  const end=source.indexOf('function renderListEmptyState',start);
  assert.ok(start>=0&&end>start,'réconciliation de Ma liste introuvable');
  const context={};
  vm.runInNewContext(source.slice(start,end)+';globalThis.reconcileListChildren=reconcileListChildren;',context);
  return context.reconcileListChildren;
}

class FakeNode{
  constructor(id){this.id=id;this.parentNode=null}
  remove(){
    if(!this.parentNode)return;
    const root=this.parentNode,index=root.children.indexOf(this);
    if(index>=0)root.children.splice(index,1);
    this.parentNode=null;
  }
}
class FakeRoot{
  constructor(nodes=[]){
    this.children=[];
    this.moves=0;
    nodes.forEach(node=>this.insertBefore(node,null));
    this.moves=0;
  }
  insertBefore(node,before){
    const current=this.children.indexOf(node);
    if(current>=0)this.children.splice(current,1);
    const index=before===null?this.children.length:this.children.indexOf(before);
    this.children.splice(index<0?this.children.length:index,0,node);
    node.parentNode=this;
    this.moves+=1;
  }
}

test('la réconciliation conserve les mêmes nœuds quand Ma liste ne change pas',()=>{
  const reconcile=reconciliation();
  const a=new FakeNode('a'),b=new FakeNode('b'),c=new FakeNode('c');
  const root=new FakeRoot([a,b,c]);
  reconcile(root,[a,b,c]);
  assert.deepEqual(root.children,[a,b,c]);
  assert.equal(root.moves,0);
});

test('la réconciliation ne déplace que les lignes nécessaires',()=>{
  const reconcile=reconciliation();
  const a=new FakeNode('a'),b=new FakeNode('b'),c=new FakeNode('c'),d=new FakeNode('d');
  const root=new FakeRoot([a,b,c]);
  reconcile(root,[b,a,d]);
  assert.deepEqual(root.children,[b,a,d]);
  assert.equal(root.moves,2);
  assert.equal(c.parentNode,null);
});

test('Ma liste utilise un cache par produit sans détruire les décorations existantes',()=>{
  assert.match(source,/const listRowCache=new Map\(\)/);
  assert.match(source,/function listRow\(group,showCategorySections\)/);
  assert.match(source,/function pruneListRowCache\(groups\)/);
  const updateStart=source.indexOf('function updateListRow(row,group,showCategorySections){');
  const updateEnd=source.indexOf('function listRow(group,showCategorySections){',updateStart);
  const update=source.slice(updateStart,updateEnd);
  assert.doesNotMatch(update,/\.innerHTML=.*list-copy/);
  assert.match(update,/copy\.insertBefore\(detail,copy\.querySelector\('\.list-measured-quantity'\)\|\|null\)/);
  const renderStart=source.indexOf('function renderList(){');
  const renderEnd=source.indexOf('function updateListReorderAvailability',renderStart);
  const render=source.slice(renderStart,renderEnd);
  assert.doesNotMatch(render,/el\.innerHTML=rows\.map/);
  assert.match(render,/reconcileListChildren\(el,nodes\)/);
  assert.match(render,/pruneListRowCache\(groups\)/);
  assert.doesNotMatch(source,/function listDomMatchesCurrentState\(\)/);
});

test('les interactions de réorganisation ne sont liées qu une fois par ligne réutilisée',()=>{
  const start=source.indexOf('function bindListReorder(root){');
  const end=source.indexOf("document.addEventListener('pointerdown'",start);
  const bind=source.slice(start,end);
  assert.match(bind,/if\(row\.dataset\.listReorderBound==='1'\)return;/);
  assert.match(bind,/row\.dataset\.listReorderBound='1';/);
});
''')

# Global application version and exact active asset URLs.
replace_once('dish-local-images.js', "const APP_VERSION='v410';", "const APP_VERSION='v411';")
replace_once('catalog.js', "images.src='./dish-local-images.js?v=410';", "images.src='./dish-local-images.js?v=411';")
replace_exact_count('index.html', '<span class="page-version">v410</span>', '<span class="page-version">v411</span>', 3)
replace_once('index.html', '<script src="./catalog.js?v=410"></script>', '<script src="./catalog.js?v=411"></script>')
replace_once('index.html', '<script src="./app.js?v=410"></script>', '<script src="./app.js?v=411"></script>')
replace_once('sw.js', "const CACHE='courses-app-v410-r1';", "const CACHE='courses-app-v411-r1';")
replace_once('sw.js', "'./catalog.js?v=410'", "'./catalog.js?v=411'")
replace_once('sw.js', "'./app.js?v=410'", "'./app.js?v=411'")
replace_once('sw.js', "'./dish-local-images.js?v=410'", "'./dish-local-images.js?v=411'")

print('P2 patch applied')
