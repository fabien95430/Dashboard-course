# Graphe des assets de l’application

Ce document décrit le chargement actif de l’application statique. Il ne remplace pas `catalog.js`, qui reste la source du catalogue produit.

## Chaîne de chargement

`index.html` charge directement le shell principal : `styles.css`, `product-item-first-paint.css`, `catalog.js`, `preferences-service.js`, `missing-requests-store.js`, `app.js`, `settings-tab-badge.js`, `settings-ui.js` et `error-center.js`.

`catalog.js` charge ensuite `dishes.css`, `catalog-liquid.css`, `dish-local-images.js`, `app-ui.js`, `runtime-features.js`, `repurchase-soon.js`, `catalog-quantities.js`, `dishes-ui.js` puis `catalog-liquid.js`. `catalog-liquid.css` importe `dish-detail.css`.

`runtime-features.js` charge `missing-products-fixes.js`, `missing-products-popup-ui.js`, `product-item-images.js` et `purchase-intelligence.js`.

`settings-ui.js` charge `missing-products-dishes.js`, `missing-products-modern.js` et `dish-added-marker.js`.

`product-item-images.js` charge `catalog-product-admin.js`.

## Règle du Service Worker

`sw.js` doit conserver une seule URL active par chemin dans `SHELL`. Lorsqu’un fichier change de version de query string, son ancienne entrée doit être remplacée et non conservée en parallèle.

Le cache applicatif `courses-app-vN-r1`, les trois badges visibles et `APP_VERSION` dans `dish-local-images.js` utilisent la même version globale. Les query strings des modules restent propres aux fichiers réellement modifiés ; le `SHELL` doit refléter exactement les URLs chargées par le graphe actif.

Les visuels de plats et produits restent dans le cache visuel persistant séparé. Le nettoyage du `SHELL` ne doit pas réintroduire d’atlas ni déplacer les WebP unitaires de `www/Items/`.

## Code historique supprimé

L’étape 7 a supprimé les anciennes implémentations qui étaient déjà hors du graphe actif et hors du précache : `startup/app.js`, `missing-products-fixes-core.js`, `list-actions.js` et `list-swipe.js`. Les marqueurs techniques sans contenu `__noop__`, `__nope__` et `_noop2` ont également été retirés.

Le comportement correspondant reste porté uniquement par les modules actifs décrits ci-dessus ; aucun chemin de compatibilité historique n’est conservé.


## Demandes manquantes

`missing-requests-store.js` est la source locale unique pour les produits manquants, les plats manquants, les plats déjà intégrés conservés dans le popup et les précisions de visuel produit. `app.js`, `missing-products-dishes.js` et `missing-products-fixes.js` consomment cette API sans relire directement ces clés `localStorage`.


## Frontières des modules UI

`dish-local-images.js` est limité aux visuels locaux de plats, à leur fallback et à leur préchauffage. Les comportements transverses de présentation (versions visibles, clavier de sécurité, état vide de Ma liste et styles UI associés) appartiennent à `app-ui.js`.

`settings-tab-badge.js` ne gère que le badge Réglages et le badge d’application. Les préférences, la gestion de l’application, la stabilité clavier des popups et la section Administrateur appartiennent à `settings-ui.js`.
