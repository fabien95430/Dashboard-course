// Clés de noms partagées, lues dans catalog.js (et non recopiées) pour les tests qui exécutent un module isolé.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const catalog=readFileSync(new URL('../catalog.js',import.meta.url),'utf8');
const start=catalog.indexOf('const fold='),end=catalog.indexOf('window.COURSES_CATALOG',start);
if(start<0||end<0)throw new Error('COURSES_TEXT introuvable dans catalog.js');
const scope={window:{}};
vm.runInNewContext(catalog.slice(start,end),scope);
export const COURSES_TEXT=scope.window.COURSES_TEXT;
