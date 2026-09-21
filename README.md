# Dashboard Course

Application mobile de courses hébergée par GitHub Pages et synchronisable avec Home Assistant.

## Architecture

`GitHub Pages → navigateur du téléphone → OAuth Home Assistant → WebSocket WSS → entité todo.*`

GitHub Pages héberge uniquement les fichiers statiques. Aucun mot de passe, token Home Assistant ou URL Nabu Casa personnelle n'est stocké dans le dépôt.

La WebSocket est ouverte uniquement pendant l'utilisation de l'application. Elle utilise un `subscribe_trigger` ciblé sur l'entité `todo.*` sélectionnée : il n'y a aucun rafraîchissement périodique.

## Verrou local et chiffrement

La connexion Home Assistant enregistrée sur un appareil est protégée par un mot de passe local :

- le mot de passe local n'est jamais enregistré ;
- le `refresh_token` OAuth est chiffré avec AES-GCM 256 bits ;
- la clé AES est dérivée du mot de passe par PBKDF2-HMAC-SHA-256 avec sel aléatoire et 600 000 itérations ;
- le `refresh_token` n'existe en clair qu'en mémoire après déverrouillage ;
- l'`access_token` Home Assistant n'est jamais écrit dans `localStorage` : il reste uniquement en mémoire ;
- la WebSocket et les jetons en mémoire sont supprimés lors du verrouillage ;
- verrouillage automatique après 5 minutes d'inactivité ou 30 secondes en arrière-plan ;
- bouton **Verrouiller maintenant** dans les réglages ;
- l'ancienne version non chiffrée est migrée au premier lancement, puis ses anciennes clés sont supprimées.

Le coffre chiffré est stocké localement par le navigateur sous la clé `courses-secure-vault-v1`.

### Face ID / biométrie

Sur les appareils compatibles, l'application peut aussi être déverrouillée avec WebAuthn et la vérification biométrique de l'appareil :

- le bouton **Activer Face ID** crée une passkey locale/plateforme ;
- l'extension WebAuthn `prf` produit un secret cryptographique lié à cette passkey ;
- ce secret chiffre une seconde copie du coffre OAuth avec AES-GCM ;
- le secret PRF lui-même n'est jamais enregistré dans `localStorage` ;
- à l'ouverture verrouillée, l'application tente automatiquement Face ID une seule fois ;
- l'écran reste volontairement minimal : **Face ID** puis **Connexion avec mot de passe** en secours ;
- le champ mot de passe n'est affiché que lorsque l'utilisateur demande cette méthode ;
- Face ID doit être activé séparément sur chaque appareil/navigateur.

Sur iPhone, iOS peut utiliser Face ID et, selon ses règles de sécurité, proposer le code de l'appareil comme mécanisme de secours. Sur un autre appareil, le mécanisme équivalent peut être Touch ID, Windows Hello ou une autre vérification de plateforme.

Le coffre Face ID local est stocké sous la clé `courses-faceid-v1`. Il ne contient ni le secret PRF ni le mot de passe local.

> Cette protection réduit fortement le risque en cas d'accès aux fichiers de stockage du navigateur. Un appareil déjà déverrouillé et une application déjà déverrouillée restent naturellement accessibles pendant la session active.

## Visuels produits

Le Catalogue et **Ma liste** utilisent le même renderer de visuels premium que le popup Courses du dashboard Home Assistant. Les anciens emoji et leurs cadres ont été retirés.

## Geste d’achat Le bouton ✓ rond s’efface progressivement pendant le geste et laisse place à une capsule glass **Acheté !**.

Dans **Ma liste**, un glissement horizontal vers la gauche révèle **✓ Acheté !**. L’article n’est validé qu’après un glissement suffisamment long ; un geste court revient en place. Après validation, le retour visuel reste affiché brièvement avant la disparition de l’article. Le bouton ✓ reste disponible.

## Utilisation de la liste

- **Ma liste** est l'écran affiché par défaut et l'onglet de gauche.
- seul le cercle à gauche valide un article afin d'éviter les suppressions involontaires ;
- après validation, la coche devient verte, le nom est légèrement barré et la ligne s'atténue ;
- l'article reste visible un court instant avec **Annuler**, puis disparaît doucement et Home Assistant est synchronisé ;
- la quantité (`x2`, `x3`…) reste visible uniquement lorsqu'un article est présent plusieurs fois ;
- la recherche filtre la liste affichée ; le filtre de catégories a été retiré de **Ma liste** ;
- l'ajout se fait depuis le **Catalogue**.

## Test sans Home Assistant

Le bouton **Tester sans Home Assistant** permet de vérifier immédiatement la recherche, les catégories et la liste. Les données de ce mode restent uniquement dans le stockage local du navigateur.

## Liste Home Assistant partagée

À l’ouverture, l’application sélectionne automatiquement **`todo.url`** lorsqu’elle existe afin de charger directement la liste sans passer par Réglages. Si `todo.url` n’existe pas, elle utilise ensuite la liste enregistrée, puis `todo.courses`, puis la première liste `todo.*` disponible.

## Démarrage

L’application n’ouvre jamais **Réglages** automatiquement. Après déverrouillage, elle reste sur **Ma liste** et charge automatiquement `todo.url` lorsqu’elle est disponible. La navigation principale contient désormais **Ma liste**, **Catalogue** et **Réglages**.

## Connexion Home Assistant

Au premier appairage :
1. saisir l'URL HTTPS Home Assistant / Nabu Casa ;
2. autoriser l'application via OAuth Home Assistant ;
3. créer le mot de passe local de l'application ;
4. sélectionner la liste `todo.*` si plusieurs listes existent.

Aux ouvertures suivantes, l'utilisateur peut déverrouiller avec Face ID s'il l'a activé, ou utiliser le mot de passe local en secours. Le mot de passe Home Assistant n'est pas stocké par l'application.

## GitHub Pages

Publication depuis la branche `main`, dossier `/ (root)`.

URL : `https://fabien95430.github.io/Dashboard-course/`

## Sécurité

- aucun long-lived access token dans Git ;
- aucun secret dans le dépôt public ;
- OAuth Home Assistant ;
- coffre local AES-GCM ;
- access token uniquement en RAM ;
- WebSocket sécurisée `wss://` ;
- Content Security Policy et politique de referrer `no-referrer` ;
- aucun script tiers ;
- aucun service serveur permanent côté GitHub Pages.


## Interface validée

L’interface mobile repose sur quatre écrans cohérents : déverrouillage sécurisé, **Ma liste**, **Catalogue** et **Réglages**. Le rendu est mobile-first, utilise toute la largeur disponible, conserve les visuels produits premium et n’ajoute aucun framework ni dépendance externe.

L’onglet **Réglages** expose uniquement les fonctions réellement disponibles : connexion Home Assistant, liste active, sécurité locale, Face ID, état de synchronisation, verrouillage manuel et déconnexion.


## Icône iOS — règle validée

La configuration validée sur iPhone/Safari est celle du commit `92067f998d3d8b4fab2d30764bcf920a31fe23b9` :

- l’icône d’installation vient du `manifest.webmanifest` ;
- le manifest pointe vers `icon-premium-v40.svg` ;
- le SVG est autonome et embarque son image directement ;
- `sizes` reste `any`, `type` reste `image/svg+xml` et `purpose` reste `any maskable` ;
- ne pas réintroduire `apple-touch-icon` ni remplacer cette voie par une icône PNG déclarée directement dans le manifest.

Pour changer l’apparence de l’icône, modifier uniquement le visuel embarqué dans `icon-premium-v40.svg`, sans changer cette mécanique.
