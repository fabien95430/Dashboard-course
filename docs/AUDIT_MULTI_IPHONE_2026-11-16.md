# Audit multi-iPhone — 16 novembre 2026

Base inspectée et capturée avant toute modification : `main`, commit `aac051196f365907dc143b2b33b1d7513e96988f`.
Branche : `audit/multi-iphone-2026-11-16`. Version proposée : v824. Aucun déploiement.

## Portée et niveau de preuve

Référence provisoire : 390 × 844 CSS px (format du test navigateur historique), faute de modèle de référence précisé. Les captures utilisent Chromium Linux, les véritables assets locaux, un écran mobile tactile simulé et le mode test, sans connexion Home Assistant. Elles ne constituent **pas une validation Safari, WebKit ou iPhone physique**.

Le verrouillage utilise un enregistrement de coffre factice pour afficher l'écran existant ; aucun vrai jeton et aucun déchiffrement réussi ne sont simulés. Les fenêtres Connexion et Sécurité sont ouvertes directement comme fixtures DOM : en mode test leurs boutons réels renvoient normalement à la configuration Home Assistant. Préférences et Catalogue des produits sont ouverts par leurs boutons. Les captures de ces fenêtres ne prouvent donc pas le fonctionnement d'une connexion réelle.

Chaque format couvre : verrouillage, première configuration, liste vide, Catalogue Produits en haut/en bas, Plats en haut/en bas, fiche plat en haut/en bas, liste alimentée en haut/en bas, Réglages en haut/en bas et quatre fenêtres transversales. La liste alimentée utilise les API existantes du mode test.

## Familles d'écrans

Les formats sont des viewports de test ; les hauteurs disponibles dans Safari varient avec ses barres. La quantité de contenu visible n'est pas un défaut.

| Format CSS portrait | Modèles regroupés | Statut navigateur |
|---|---|---|
| 375 × 812 | iPhone 12 mini, 13 mini, encoche | Captures et contrôles géométriques |
| 390 × 844 | iPhone 12/12 Pro, 13/13 Pro, 14, 16e/17e | Référence provisoire ; captures et contrôles |
| 393 × 852 | iPhone 14 Pro, 15/15 Pro, 16, Dynamic Island | Captures et contrôles |
| 402 × 874 | iPhone 16 Pro, 17/17 Pro, 18 Pro | Captures et contrôles |
| 420 × 912 | iPhone Air | Captures et contrôles |
| 428 × 926 | iPhone 12/13 Pro Max, 14 Plus, encoche | Captures et contrôles |
| 430 × 932 | iPhone 14 Pro Max, 15 Plus/Pro Max, 16 Plus | Captures et contrôles |
| 440 × 956 | iPhone 16/17/18 Pro Max | Captures et contrôles |
| 375 × 667 | Hauteur de stress réduite (barres navigateur), pas un modèle mini plein écran | Chevauchement constaté puis corrigé |
| 466 × 678 | Exploration écran externe Duo | Dimensions CSS **à confirmer sur appareil** |
| 626 × 890 | Exploration écran interne Duo en portrait | **Échec exploratoire : scroll global 27–28 px** ; dimensions CSS à confirmer |

Sources Apple consultées le 16/11/2026 : [gamme actuelle](https://www.apple.com/iphone/), [18 Pro](https://www.apple.com/iphone-18-pro/specs/), [Duo](https://www.apple.com/iphone-duo/specs/). La fiche 18 Pro indique 1206 × 2622 et 1320 × 2868 pixels. Celle du Duo indique 1398 × 2034 à l'extérieur et 1878 × 2670 à l'intérieur. Les deux viewports exploratoires Duo supposent un facteur 3 : le viewport Safari et le facteur de rendu réels restent à vérifier ; cette déduction seule ne certifie pas la compatibilité de ce modèle.

## Inspection préalable des règles

| Propriétaire | Règles et conséquences examinées |
|---|---|
| `index.html` | `viewport-fit=cover`, statut iOS translucide, manifest, préchargements, startup images et media queries par taille physique conservés |
| `styles.css` | App plafonnée à 560 px ; grilles `minmax(0,1fr)` ; défilement interne ; media queries de largeur 350/370/390/520/650 et de hauteur 720/800 ; navigation flottante et réserves de défilement |
| `styles.css`, bloc Catalogue | Rangées proportionnelles à la hauteur à partir de 800 px ; réserve inférieure 78 px ou compensation safe area ; variations de hauteur existantes conservées |
| `product-item-first-paint.css` | Géométrie critique finale chargée avant les modules différés : recherche, sélecteur, catégories, rangées et vignettes ; sa spécificité explique plusieurs différences avec les anciennes déclarations |
| `dishes.css`, `catalog-liquid.css`, `dish-detail.css` | Deux colonnes flexibles, cadrages `cover` des cartes et `contain` de la fiche, fiche plein écran et liste d'ingrédients défilante, footer et commandes avec safe areas |
| `app-ui.js` | Compensation `visualViewport.offsetTop` commune au fond et au shell ; restauration de l'origine après déverrouillage, écoute resize/scroll/focus ; mécanismes conservés |
| `styles.css`, blocs v43/v44/v727/v728 | Hauteurs `100dvh + safe-area-inset-bottom`, fond prolongé et hauteurs fixes du verrouillage selon `device-height` standalone ; garanties historiques préservées, pas de suppression spéculative |
| `settings-ui.js`, `dishes-ui.js` | Fenêtres avec hauteur `svh`/`dvh`, défilement interne, verrouillage du scroll lors de la saisie et listes de suggestions |
| `sw.js`, manifest | Mode standalone et précache statique ; seul le versionnement suit le CSS corrigé |

Les règles anciennes ne sont pas signalées comme défectueuses sur la seule base de leur coexistence : le CSS critique et les styles différés prennent souvent volontairement le relais. Aucun refactoring global n'est proposé.

## Défaut démontré et correction

À 375 × 667, le héros compact finit à **242,30 px**, mais la carte de verrouillage commence à **234,78 px** : chevauchement de **7,52 px**, visible sur le sous-titre.

La règle existante `@media(max-height:720px)` positionnait la carte à `35.2%` alors que l'illustration et les textes gardent leur taille. Elle utilise désormais `max(35.2%, calc(5.1% + 222px))` : le héros compact commence à 5,1 %, mesure 208,3 px et conserve ainsi 13,7 px avant la carte. Aucun élément n'est réduit. Les formats de hauteur supérieure à 720 px sont inchangés par cette règle.

Après correction à 375 × 667 : carte à **256,02 px**, intervalle **13,72 px**, bas à **591,89 px**, aucun scroll global. Le fond, l'illustration et les dimensions de la carte sont conservés.

Les autres fichiers applicatifs modifiés ne font que synchroniser v824 et les URLs du précache/module selon les invariants du dépôt. Aucun changement du catalogue, des quantités, d'OAuth, WebSocket, synchronisation, chiffrement ou biométrie.

## Reproduction

Dépendances de test seulement : Playwright et Chromium déjà disponibles dans l'environnement d'audit. Aucun ajout de dépendance à l'application.

```sh
bash scripts/validate_repo.sh
python3 -m http.server 8765 --bind 127.0.0.1
# Dans un autre terminal ; BROWSER_PATH est facultatif si Chromium Playwright est installé.
BROWSER_PATH=/usr/bin/chromium node tests/browser-iphone.cjs /tmp/courses-iphone-after
# Comparaison isolée du CSS de main, avec les mêmes fixtures et la même version affichée :
git show aac051196f365907dc143b2b33b1d7513e96988f:styles.css > /tmp/courses-baseline.css
AUDIT_BASELINE_CSS=/tmp/courses-baseline.css BROWSER_PATH=/usr/bin/chromium node tests/browser-iphone.cjs /tmp/courses-iphone-before
```

Le script enregistre les captures et `measurements.json`, puis vérifie : absence de débordement horizontal du document, origine verticale inchangée, absence d'erreurs JS, dernier élément au-dessus de la navigation, absence de chevauchement du verrouillage après correction. Les rails de catégories défilant volontairement horizontalement sont préservés.

Les captures initiales ont été faites sur les fichiers originaux de main. La seconde paire comparative restaure uniquement son CSS, avec fixtures, chargements stabilisés et badge de version identiques, afin de ne pas confondre variation de données ou de version et changement visuel.

## Limites et validation physique nécessaire

L'essai CDP n'a pas permis d'émuler les safe areas (`Emulation.setSafeAreaInsets` indisponible) ni d'activer réellement le display-mode standalone. Les huit cycles de réduction de viewport de 300 px puis restauration ont retrouvé les mêmes positions et scrolls nuls ; **cela ne reproduit pas un clavier iOS réel**.

À réaliser sur appareil, en particulier mini, encoche, Dynamic Island, grands formats et Duo :

- Installation PWA, fond derrière la barre d'état et jusqu'au bord physique, geste d'accueil et commandes hors zones dangereuses.
- Lancement à froid, rechargement après mise à jour, déverrouillage, reprise de l'arrière-plan et absence de saut/bande inférieure.
- Ouverture/fermeture du clavier, autofill des mots de passe, zoom de saisie et retour à l'origine.
- OAuth et connexion Home Assistant réelle, fermeture/reprise WebSocket et synchronisation événementielle.
- Coffre réel, changement de mot de passe et biométrie si disponible dans la configuration utilisée.
- Confirmations, saisies longues, rotation et dépliage Duo ; confirmer ses viewports et son facteur de rendu.

La compatibilité physique de tous les iPhone n'est pas déclarée acquise. La correction est limitée au défaut géométrique reproduit et conserve les mécanismes iOS existants.

## Résultats exécutés et preuves

- `bash scripts/validate_repo.sh` : **97/97 tests réussis**, aucune suppression ni modification de test existant. [Journal](audit-iphone-2026-11-16/node-tests.txt).
- `tests/browser-quantities.cjs` : **7/7 scénarios réussis**, avec Chromium système injecté au lancement (Playwright disponible hors dépôt), y compris double clic et échec partiel. [Journal](audit-iphone-2026-11-16/quantities-browser.txt).
- Audit étendu : **187 captures avant et 187 après**, **170 états de largeur ≤ 520 px validés** par `node tests/iphone-layout-checks.cjs …/measurements.json --max-width 520`. Aucun débordement horizontal du document ni erreur JS dans les 187 états enregistrés.
- **Le test étendu complet échoue** à 626 × 890 : scroll global de 27–28 px après navigation, déjà présent dans la baseline. Ce n'est pas une régression de la correction. L'équivalence de ce viewport avec un Duo réel doit être confirmée avant une adaptation du breakpoint 520 px ; aucune compatibilité Duo interne n'est certifiée. [Journal de l'échec](audit-iphone-2026-11-16/extended-browser.txt) et [capture](audit-iphone-2026-11-16/exploratory-626x890-products.png).
- Configuration supplémentaire : **22/22 ouvertures et captures** Recettes/Gestion, sans débordement du document et fenêtres dans le viewport. Le rail Recettes dépasse intérieurement de 4 px à 375/390 px à cause des marges négatives de son cadrage bord à bord ; la capture ne montre pas de commande ou de texte coupé. Pas de correction spéculative. [Mesures](audit-iphone-2026-11-16/configuration-measurements.json).
- Diff pixel : **103/187 paires identiques**, dont **17/17 à 390 × 844**. Les 84 différences restantes sont conservées dans le [relevé complet](audit-iphone-2026-11-16/visual-diff.json), sans les qualifier toutes de défauts. Les mesures des principaux blocs ne changent que pour les deux cartes de verrouillage en hauteur courte et, dans l'exploration 626 px, des positions variant de 1 px avec le scroll global. Les variations de rasterisation/effets et de capture hors référence ne prouvent pas à elles seules une régression. [Diff géométrique](audit-iphone-2026-11-16/geometry-diff.json).

| Mesure après correction, formats ≤ 520 px | Résultat |
|---|---|
| Origine des titres | x = 20 px sur tous les formats |
| Recherche Catalogue | x = 13 px ; marge droite = 13 px |
| Dernière rangée produits / sommet navigation | environ 9,7–10,4 px en plein écran, 16 px en hauteur réduite |
| Dernier plat / navigation | 29 px |
| Dernière commande Réglages / navigation | 30 px |
| Verrouillage 375 × 667 | intervalle −7,52 → +13,72 px |
| Verrouillage exploratoire 466 × 678 | intervalle −4,20 → +13,72 px |

Les boîtes et scrolls bruts sont livrés [avant](audit-iphone-2026-11-16/before-measurements.json) et [après](audit-iphone-2026-11-16/after-measurements.json). Les captures ne mesurent pas les bords physiques d'un appareil.

## Captures représentatives

| État | Avant | Après |
|---|---|---|
| Défaut corrigé, 375 × 667 | [Avant](audit-iphone-2026-11-16/before-375x667-lock.png) | [Après](audit-iphone-2026-11-16/after-375x667-lock.png) |
| Référence : verrouillage | [Avant](audit-iphone-2026-11-16/before-390x844-lock.png) | [Après](audit-iphone-2026-11-16/after-390x844-lock.png) |
| Référence : Catalogue | [Avant](audit-iphone-2026-11-16/before-390x844-products.png) | [Après](audit-iphone-2026-11-16/after-390x844-products.png) |
| Référence : liste en bas | [Avant](audit-iphone-2026-11-16/before-390x844-list.png) | [Après](audit-iphone-2026-11-16/after-390x844-list.png) |
| Référence : Réglages | [Avant](audit-iphone-2026-11-16/before-390x844-settings.png) | [Après](audit-iphone-2026-11-16/after-390x844-settings.png) |
| Référence : Préférences | [Avant](audit-iphone-2026-11-16/before-390x844-preferences.png) | [Après](audit-iphone-2026-11-16/after-390x844-preferences.png) |
| Grand format : derniers produits | [Avant](audit-iphone-2026-11-16/before-440x956-products-end.png) | [Après](audit-iphone-2026-11-16/after-440x956-products-end.png) |
| Exploration Duo externe | [Avant](audit-iphone-2026-11-16/before-466x678-lock.png) | [Après](audit-iphone-2026-11-16/after-466x678-lock.png) |

[Recettes, écran court](audit-iphone-2026-11-16/375x667-recipes.png) · [Gestion de l'application](audit-iphone-2026-11-16/390x844-management.png).
