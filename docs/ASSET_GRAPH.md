# Graphe des assets de l’application

Ce document décrit le chargement actif de l’application statique. Il ne remplace pas `catalog.js`, qui reste la source du catalogue produit.

## Chaîne de chargement

`index.html` charge directement le shell principal : `styles.css`, `product-item-first-paint.css`, `catalog.js`, `preferences-service.js`, `missing-requests-store.js`, `app.js`, `settings-tab-badge.js`, `settings-ui.js` et `error-center.js`.

`catalog.js` charge d’abord `app-ui.js` puis `runtime-features.js`. Après la synchronisation de **Ma liste**, le Catalogue Produits est déclaré prêt sans charger les dépendances des plats. À la première entrée dans Catalogue, `repurchase-soon.js` peut être chargé en parallèle, puis la branche Plats prépare `catalog-quantities.js`, `dishes.css`, `catalog-liquid.css`, `dishes-ui.js`, `catalog-liquid.js`, `dish-local-images.js` et enfin `dish-added-marker.js`. `catalog-liquid.css` importe `dish-detail.css`.

`runtime-features.js` charge `missing-products-fixes.js`, `missing-products-popup-ui.js`, `product-item-images.js` et `purchase-intelligence.js`. `product-item-images.js` ne charge plus l’administration du catalogue et ne décore le Catalogue que lorsqu’il est visible.

`settings-ui.js` charge `missing-products-dishes.js` et `missing-products-modern.js`. `catalog-product-admin.js` n’est demandé qu’à l’ouverture de **Gestion de l’application**.

## Règle du Service Worker

`sw.js` conserve dans `SHELL` le graphe actif nécessaire au fonctionnement hors ligne. Le précache rend les assets disponibles mais ne les exécute pas : les frontières de chargement runtime ci-dessus restent différées. Une seule URL active par chemin est autorisée dans `SHELL`.

Le cache applicatif `courses-app-vN-r1`, les trois badges visibles et `APP_VERSION` dans `dish-local-images.js` utilisent la même version globale. Les query strings des modules restent propres aux fichiers réellement modifiés ; le `SHELL` doit refléter exactement les URLs chargées par le graphe actif.

Les visuels de plats et produits restent dans le cache visuel persistant séparé. Le nettoyage du `SHELL` ne doit pas réintroduire d’atlas ni déplacer les WebP unitaires de `www/Items/`.

## Code historique supprimé

L’étape 7 a supprimé les anciennes implémentations qui étaient déjà hors du graphe actif et hors du précache : `startup/app.js`, `missing-products-fixes-core.js`, `list-actions.js` et `list-swipe.js`. Les marqueurs techniques sans contenu `__noop__`, `__nope__` et `_noop2` ont également été retirés.

Le comportement correspondant reste porté uniquement par les modules actifs décrits ci-dessus ; aucun chemin de compatibilité historique n’est conservé.


## Demandes manquantes

`missing-requests-store.js` est la source locale unique pour les produits manquants, les plats manquants, les plats déjà intégrés conservés dans le popup et les précisions de visuel produit. `app.js`, `missing-products-dishes.js` et `missing-products-fixes.js` consomment cette API sans relire directement ces clés `localStorage`.


## Frontières des modules UI

`dish-local-images.js` est limité aux visuels locaux de plats et à leur fallback. Les comportements transverses de présentation (versions visibles, clavier de sécurité, état vide de Ma liste et styles UI associés) appartiennent à `app-ui.js`.

`settings-tab-badge.js` ne gère que le badge Réglages et le badge d’application. Les préférences, la gestion de l’application, la stabilité clavier des popups et la section Administrateur appartiennent à `settings-ui.js`.
