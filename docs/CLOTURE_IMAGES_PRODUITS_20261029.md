# Clôture vérifiée des images produits — 29 octobre 2026

## Résultat et référentiel

- Dépôt : `fabien95430/Dashboard-course`, branche `main`.
- Application : **v657**, commit contrôlé **`5659453af41e90ae7d35be434aaf7215292f4edd`**.
- **Catalogue actif : 412 produits distincts = 412 fichiers `www/Items/*.webp` distincts = 412 slugs uniques**, avec une correspondance exacte entre les noms de `catalog.js`, la fonction `slugify` de `product-item-images.js` et les fichiers WebP.
- **371 images actives renouvelées ou créées** et **41 visuels conservés par décision antérieure documentée** ; **aucun produit actif sans WebP et aucune référence encore ouverte**.
- **414/414** est le résultat historique du chantier sur l'ancien périmètre, **pas** la taille du catalogue courant, **pas** le nombre d'images réellement renouvelées et **pas** une indication qu'il faudrait réintroduire des produits supprimés.

## Pourquoi le catalogue courant compte 412 et non 414

Le catalogue initial à **414 références** (SHA `399028980446f885d2a868295f67c3cfb6cab608`) a évolué. Depuis, **Mini saucissons**, **Pizza surgelée** et **Chocolat chaud** ont été retirés du catalogue et leurs WebP supprimés ; **Bolognaise** a été ajouté avec son WebP propre (création enregistrée dans le commit `c8d7b4924215b1db081b49e0d5583c0e0446468f`). La variation nette est **414 - 3 + 1 = 412**.

Les trois références retirées ne faisaient pas partie des 41 conservations encore documentées. Les **41** fichiers conservés restent présents dans le catalogue actif ; les **371** autres correspondent aux images actives issues de renouvellements antérieurs ou de la création de Bolognaise. Ne pas compter une nouvelle fois le remplacement historique de **Miel** : il avait déjà été renouvelé en v534 avant son second remplacement en v614.

## Contrôles confirmés

| Vérification | Résultat |
| --- | --- |
| Dernier `main` contrôlé | `5659453af41e90ae7d35be434aaf7215292f4edd` |
| `catalog.js` : noms uniques | 412 |
| `product-item-images.js` : slugs uniques calculés | 412 |
| Git : `www/Items/*.webp` | 412 |
| Noms sans fichier WebP | 0 |
| Fichiers WebP sans produit actif | 0 |
| Collisions de slug | 0 |
| Fichiers conservés présents dans le catalogue | 41/41 |
| Images encore à traiter | 0 |
| Version applicative et service worker | `v657`, `courses-app-v657-r1` |
| Validation de la PR #118 | Réussie après correction de l'URL de précache |
| CI sur `main` v657 | [Réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40887183709) |
| GitHub Pages v657 | [Déployé](https://github.com/fabien95430/Dashboard-course/actions/runs/40887181315) |
| Crédits du dernier lot | [`IMAGE_CREDITS_V657.md`](IMAGE_CREDITS_V657.md) |

Les tests complets ont été exécutés dans la CI GitHub, et non relancés localement durant cette vérification documentaire. Aucun contrôle physique de Home Assistant, de l'iPhone ou du navigateur hors ligne n'est revendiqué.

## Archivage et reprise éventuelle

La file [`REPRISE_IMAGES_PRODUITS_20261028.md`](REPRISE_IMAGES_PRODUITS_20261028.md) et la synthèse [`AVANCEMENT_IMAGES_PRODUITS.md`](AVANCEMENT_IMAGES_PRODUITS.md) préservent l'historique et les décisions par lot. Elles ne constituent plus une file de remplacement à poursuivre.

Tout **nouveau** besoin d'image doit naître d'une modification effective du catalogue ou d'un défaut objectivement constaté ; réutiliser les 41 décisions de conservation et les contrôles déjà effectués. Avant publication, revérifier seulement le SHA de `main`, les fichiers concernés, la licence/provenance, le rendu 192 px blanc/sauge, le cache/version et les tests obligatoires. Ne pas utiliser l'API OpenAI payante du projet.

**Cette clôture est documentaire et ne modifie ni les WebP, ni le catalogue, ni les fonctionnalités, ni le cache de l'application.**
