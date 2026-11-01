# Épicerie — 13 visuels harmonisés, v714

**Date :** 1er novembre 2026. **Projet :** `fabien95430/Dashboard-course`, branche `main`. **Source créative :** plaquette « Épicerie — Produits à finaliser », créée avec la génération d'images ChatGPT et validée par l'utilisateur. Extractions et détourage de chaque emballage, conversion WebP optimisée. Aucune image achetée ou tirée d'un catalogue tiers et aucun service externe ajouté.

**Fidélité au catalogue :** 13 produits préexistants, zéro ajout/suppression. Un fichier WebP indépendant par article dans `www/Items/` ; aucun atlas ni sprite. Fond transparent, emballage entier, 256 × 256 px, visualisation contrôlée à 192 px, poids réel sous 150 Kio et angles alpha entièrement transparents. La planche de présentation n'est pas servie par l'application. Le code couleur reprend les familles approuvées : ocre céréales, vert sauge légumineuses, kraft/crème pâtisserie et nouilles.

**Protection des acquis :** aucun changement aux 12 riz ni aux 13 pâtes sèches ; leurs images et le catalogue métier restent inchangés. Les autres sauces, huiles, épices et visuels déjà approuvés sont également conservés. Les sélections et la liste `todo.courses` ne sont pas modifiées.

| Article existant | Chemin individuel | SHA-1 du blob Git neuf | Poids (octets) |
| --- | --- | --- | ---: |
| Quinoa | `www/Items/quinoa.webp` | `a348e2fdba45ba3be0c159660da8e5d67e3e4981` | 6690 |
| Couscous | `www/Items/couscous.webp` | `08e9575915310d799595d5bae10f442e4a2bd665` | 4784 |
| Polenta | `www/Items/polenta.webp` | `f3405b1be347423d3aa9af800900dc249b32f78a` | 4208 |
| Lentilles | `www/Items/lentilles.webp` | `8a4bafb5dad606442f7a83b6a93ab138a8e92b49` | 5128 |
| Haricots rouges | `www/Items/haricots-rouges.webp` | `cf1667a2974989fc0b9e4a5e7e2e721efd488503` | 4486 |
| Pois chiches | `www/Items/pois-chiches.webp` | `670e2f2258733091b15e58416ee3b1d62a46dc67` | 4670 |
| Noix de coco râpée | `www/Items/noix-de-coco-rapee.webp` | `a1ca245799626ff661958b9355156f4858798970` | 4358 |
| Gélatine | `www/Items/gelatine.webp` | `23633ed960653b73ccada1fb3593edbf8765c46c` | 2984 |
| Levure chimique | `www/Items/levure-chimique.webp` | `ede0acd76f32a0efb0cf65c9e96d6f01cbff988b` | 5352 |
| Pépites chocolat | `www/Items/pepites-chocolat.webp` | `b99e5a44c523ab13754d02105293d346bc34cc60` | 4694 |
| Bouillon cubes | `www/Items/bouillon-cubes.webp` | `33c4ac0230af4d611b3deb6f920954b0a9e38916` | 3012 |
| Nouilles chinoises | `www/Items/nouilles-chinoises.webp` | `9005213d8b5031f26382b458c822692d0332a94f` | 5574 |
| Nouilles instantanées | `www/Items/nouilles-instantanees.webp` | `f3e211120aff032dd456e3b3160a2036c88f1567` | 6734 |

**Vérifications :** décodage WebP réel par Pillow pour les 13 fichiers, dimensions 256 × 256, mode RGBA, alpha 0 à 255 et quatre coins transparents ; aucune image au-dessus de 150 Kio ; comparaison visuelle des 13 emballages sur fond ivoire et sauge ; empreintes Git de chacun des 13 objets égales à leurs empreintes locales. La suite complète de tests doit être confirmée par la CI GitHub Actions du commit. Pas de test prétendu sur un iPhone réel.
