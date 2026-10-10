import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=path=>readFileSync(resolve(root,path),'utf8');
const source=read('preferences-service.js');

function loadService(initial){
  const values=new Map();
  if(initial!==undefined)values.set('courses-preferences-v1',initial);
  const localStorage={
    getItem:key=>values.has(key)?values.get(key):null,
    setItem:(key,value)=>values.set(key,String(value))
  };
  const context={window:{},localStorage};
  vm.runInNewContext(source,context,{filename:'preferences-service.js'});
  return {service:context.window.COURSES_PREFERENCES,values};
}
const plain=value=>JSON.parse(JSON.stringify(value));

test('les préférences conservent exactement les valeurs par défaut actuelles',()=>{
  const {service}=loadService();
  assert.deepEqual(plain(service.read()),{
    listSort:'added',startView:'list',hideAdded:false,smartFavorites:true
  });
  assert.deepEqual(plain(service.defaults),{
    listSort:'added',startView:'list',hideAdded:false,smartFavorites:true
  });
});

test('la normalisation conserve les règles historiques des quatre préférences',()=>{
  const {service}=loadService();
  assert.deepEqual(plain(service.normalize({
    listSort:'category',startView:'catalog',hideAdded:true,smartFavorites:false
  })),{
    listSort:'category',startView:'catalog',hideAdded:true,smartFavorites:false
  });
  assert.deepEqual(plain(service.normalize({
    listSort:'invalide',startView:'invalide',hideAdded:'true',smartFavorites:null
  })),{
    listSort:'added',startView:'list',hideAdded:false,smartFavorites:true
  });
});

test('lecture invalide et écriture stockent toujours un objet canonique',()=>{
  const broken=loadService('{json');
  assert.deepEqual(plain(broken.service.read()),{
    listSort:'added',startView:'list',hideAdded:false,smartFavorites:true
  });
  const {service,values}=loadService();
  const saved=service.write({listSort:'alpha',startView:'catalog',hideAdded:true,smartFavorites:false});
  assert.deepEqual(plain(saved),{
    listSort:'alpha',startView:'catalog',hideAdded:true,smartFavorites:false
  });
  assert.deepEqual(JSON.parse(values.get('courses-preferences-v1')),plain(saved));
});

test('app.js délègue la persistance sans dupliquer le stockage des préférences',()=>{
  const app=read('app.js');
  assert.match(app,/const PREFERENCES=window\.COURSES_PREFERENCES;/);
  assert.match(app,/const INITIAL_PREFERENCES=PREFERENCES\.read\(\);/);
  assert.match(app,/function persistPreferences\(\)\{state\.preferences=PREFERENCES\.write\(state\.preferences\)\}/);
  assert.doesNotMatch(app,/DEFAULT_PREFERENCES|function readPreferences\(|STORAGE\.preferences|courses-preferences-v1/);
  const start=app.indexOf('function savePreferencesSettings()');
  const end=app.indexOf('function openSettings()',start);
  assert.ok(start>=0&&end>start,'gestionnaire de préférences introuvable');
  assert.match(app.slice(start,end),/state\.preferences=PREFERENCES\.normalize\(\{/);
});

test('le service est chargé avant app.js et reste dans le shell hors ligne',()=>{
  const index=read('index.html');
  const sw=read('sw.js');
  const serviceIndex=index.indexOf('./preferences-service.js?');
  const appIndex=index.indexOf('./app.js?');
  assert.ok(serviceIndex>=0&&appIndex>serviceIndex,'ordre de chargement incorrect');
  assert.match(sw,/\.\/preferences-service\.js\?v=\d+/);
  assert.match(sw,/url\.pathname\.endsWith\('\/preferences-service\.js'\)/);
  assert.match(source,/Object\.defineProperty\(window,'COURSES_PREFERENCES',[\s\S]*?configurable:false,[\s\S]*?enumerable:false,[\s\S]*?writable:false/);
});
