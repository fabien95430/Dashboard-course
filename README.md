# Dashboard Course

Application mobile de courses hébergée par GitHub Pages et synchronisable avec Home Assistant.

## Architecture

`GitHub Pages → navigateur du téléphone → OAuth Home Assistant → WebSocket WSS → entité todo.*`

GitHub Pages héberge uniquement les fichiers statiques. Aucun mot de passe, token Home Assistant ou URL Nabu Casa personnelle n'est stocké dans le dépôt.

La WebSocket est ouverte uniquement pendant l'utilisation de l'application. Elle utilise un `subscribe_trigger` ciblé sur l'entité `todo.*` sélectionnée : il n'y a aucun rafraîchissement périodique.

## Test sans Home Assistant

Le bouton **Tester sans Home Assistant** permet de vérifier immédiatement la recherche, les catégories et la liste. Les données de ce mode restent uniquement dans le stockage local du navigateur.

## Connexion Home Assistant

Au premier appairage :
1. saisir l'URL HTTPS Home Assistant / Nabu Casa ;
2. autoriser l'application via OAuth Home Assistant ;
3. sélectionner la liste `todo.*` si plusieurs listes existent.

L'application se reconnecte automatiquement lorsqu'elle est rouverte.

## GitHub Pages

Publier depuis la branche `main`, dossier `/ (root)`.

URL attendue : `https://fabien95430.github.io/Dashboard-course/`

## Sécurité

- aucun long-lived access token dans Git ;
- aucun secret dans le dépôt public ;
- OAuth Home Assistant ;
- WebSocket sécurisée `wss://` ;
- Content Security Policy ;
- aucun script tiers ;
- aucun service serveur permanent côté GitHub Pages.
