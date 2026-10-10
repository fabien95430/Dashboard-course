(()=>{
'use strict';

const STORAGE_KEY='courses-preferences-v1';
const DEFAULTS=Object.freeze({
  listSort:'added',
  startView:'list',
  hideAdded:false,
  smartFavorites:true
});
const LIST_SORTS=Object.freeze(['added','category','alpha']);
const START_VIEWS=Object.freeze(['list','catalog']);

function normalize(value={}){
  const saved=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  return {
    listSort:LIST_SORTS.includes(saved.listSort)?saved.listSort:DEFAULTS.listSort,
    startView:START_VIEWS.includes(saved.startView)?saved.startView:DEFAULTS.startView,
    hideAdded:saved.hideAdded===true,
    smartFavorites:saved.smartFavorites!==false
  };
}
function read(){
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')||{}}catch(_){saved={}}
  return normalize(saved);
}
function writePreferences(value){
  const normalized=normalize(value);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized));
  return normalized;
}

const api=Object.freeze({
  defaults:DEFAULTS,
  normalize,
  read,
  write:writePreferences
});
Object.defineProperty(window,'COURSES_PREFERENCES',{
  value:api,
  configurable:false,
  enumerable:false,
  writable:false
});
})();
