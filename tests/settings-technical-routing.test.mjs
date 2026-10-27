import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const fragment=(source,start,end)=>{
 const a=source.indexOf(start);const b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a, 'Section introuvable : '+start);
 return source.slice(a,b);
};
test('le popup des demandes ne présente plus les paramètres techniques',()=>{
 const html=read('index.html');
 const missing=fragment(html,'<dialog id="missingProductsDialog"','<dialog id="settingsDialog"');
 assert.doesNotMatch(missing,/missingSyncStatus|enableMissingNotifications|disableMissingNotifications|missingNotificationsStatus|missing-notifications-panel/);
 assert.match(missing,/id="missingProductName"/);
});
test('Connexion Home Assistant présente les deux statuts sans toucher aux listes',()=>{
 const html=read('index.html'),app=read('app.js');
 const connection=fragment(html,'<dialog id="connectionDialog"','<dialog id="preferencesDialog"');
 assert.match(connection,/id="connectionEntitySelect"/);
 assert.match(connection,/id="connectionListSyncStatus"/);
 assert.match(connection,/id="missingSyncStatus"/);
 assert.doesNotMatch(connection,/<span>Ma liste<\/span>/);
 assert.ok(connection.indexOf('id="connectionHaUrl"')<connection.indexOf('class="connection-entity-row"'),'adresse avant la liste');
 assert.match(connection,/class="connection-entity-row">[\s\S]*?Liste Home Assistant[\s\S]*?id="connectionListSyncStatus"[\s\S]*?#i-chevron[\s\S]*?id="connectionEntitySelect"/);
 assert.match(connection,/<h4 class="settings-sheet-section-title">Synchronisation<\/h4>\s*<div class="connection-sync-section"/);
 assert.match(app,/MISSING_SYNC_SHORT_LABELS=Object\.freeze\(\{synced:'Synchronisé'/);
 assert.match(app,/function renderMissingRequestsConnectionStatus/);
 assert.match(app,/window\.addEventListener\('courses:missing-ha-status'/);
 assert.match(app,/MISSING_REQUESTS\.getSharedStatus\?\.\(\)/);
});
test('Notifications reste une sous-vue de Gestion de l application et conserve les actions Push',()=>{
 const html=read('index.html'),ui=read('settings-ui.js'),notify=read('courses-notifications.js');
 const preferences=fragment(html,'<dialog id="preferencesDialog"','<dialog id="missingProductsDialog"');
 for(const id of ['preferencesNotificationsPanel','enableMissingNotifications','disableMissingNotifications','missingNotificationsStatus'])assert.match(preferences,new RegExp('id="'+id+'"'));
 assert.match(ui,/managementPanel\.appendChild\(notificationsButton\)/);
 assert.match(ui,/function showNotifications\(\)/);
 assert.match(ui,/notificationsButton\.addEventListener\('click',showNotifications\)/);
 assert.match(ui,/setTitle\('Notifications','management'\)/);
 assert.match(ui,/dialog\.addEventListener\('close',showSelections\)/);
 assert.match(notify,/const id of \['missingNotificationsStatus','notificationsManagementSummary'\]/);
 assert.match(notify,/enable\.addEventListener\('click',\(\)=>\{void register\(\{ask:true\}\)\}\)/);
 assert.match(notify,/getElementById\('disableMissingNotifications'\)\?\.addEventListener\('click'/);
});
test('le clic Notifications affiche la sous-vue sans laisser le panneau Gestion visible',()=>{
 const source=read('settings-ui.js');
 const method=fragment(source,'  function showNotifications(){','  window.COURSES_SETTINGS_NAV=');
 const title={hidden:false},intro={hidden:false,textContent:''};
 const managementPanel={hidden:false},notificationPanel={hidden:true},other={hidden:false};
 const content={children:[title,intro,managementPanel,notificationPanel,other]};
 let displayed='',opened=false;
 const dialog={open:false,showModal(){opened=true;this.open=true}};
 const showNotifications=new Function('content','title','intro','managementPanel','notificationsPanel','setTitle','dialog',method+'return showNotifications;')(
   content,title,intro,managementPanel,notificationPanel,(label,back)=>{displayed=label+':'+back},dialog
 );
 showNotifications();
 assert.equal(notificationPanel.hidden,false);
 assert.equal(managementPanel.hidden,true);
 assert.equal(other.hidden,true);
 assert.equal(displayed,'Notifications:management');
 assert.equal(opened,true);
});
test('le design préserve les safe areas et évite de masquer les panneaux cachés',()=>{
 const settings=read('settings-ui.js'),styles=read('styles.css');
 assert.match(settings,/#preferencesNotificationsPanel\[hidden\]\{display:none!important\}/);
 assert.match(settings,/#preferencesNotificationsPanel \.notifications-management-actions/);
 assert.match(styles,/\.settings-sheet\{[\s\S]*?safe-area-inset-top/);
 assert.match(styles,/\.settings-sheet\{[\s\S]*?safe-area-inset-bottom/);
});
