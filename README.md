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

> Cette protection réduit fortement le risque en cas d'accès aux fichiers de stockage du navigateur. Un appareil déjà déverrouillé et une application déjà déverrouillée restent naturellement accessibles pendant la session active.

## Test sans Home Assistant

Le bouton **Tester sans Home Assistant** permet de vérifier immédiatement la recherche, les catégories et la liste. Les données de ce mode restent uniquement dans le stockage local du navigateur.

## Connexion Home Assistant

Au premier appairage :
1. saisir l'URL HTTPS Home Assistant / Nabu Casa ;
2. autoriser l'application via OAuth Home Assistant ;
3. créer le mot de passe local de l'application ;
4. sélectionner la liste `todo.*` si plusieurs listes existent.

Aux ouvertures suivantes, seul le mot de passe local est demandé. Le mot de passe Home Assistant n'est pas stocké par l'application.

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
