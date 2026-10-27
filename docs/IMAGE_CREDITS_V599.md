# Crédits visuels produits — lot v599 (publié et validé)

**Base examinée :** `main` `ab80641bb9faf975697917e2eb836e3113f01588`, version v598. Le remplacement concerne uniquement **Capsules café**, catégorie Petit-déjeuner. Image unitaire générée avec la fonctionnalité native de création d'images ChatGPT, **sans appel à l'API OpenAI payante du projet**. Aucune image externe ni marque inventée : création originale pour le catalogue.

| Catégorie | Produit | Avant | Après | Source | SHA Git de la nouvelle image |
|---|---|---:|---:|---|---|
| Petit-déjeuner | Capsules café | 3 438 octets | 20 282 octets | Création originale ChatGPT (sans attribution externe) | `9db78238e81fdf5e88b8cdf889794fb3b55f3f16` |

**Contrôles préalables réels :** WebP RGBA autonome 384 × 384 px ; 20 282 octets (<100 000) ; alpha 0 à 255, bords transparents et emprise opaque (30, 39) à (354, 345), donc aucun bord coupé ; aperçu 192 px sur fond blanc, sauge et sombre ; une seule capsule métallique cuivrée, sans marque fictive ni accessoire. SHA calculé localement et confirmé par l'API GitHub pour le blob créé. Ancienne image : 3 438 octets, l'original représentait déjà une petite capsule cuivrée mais manquait de définition.

**Rejets de cette préparation :** Dosettes café et Filtres à café : plusieurs générations retournent des montages composites sans rapport ; images rejetées. Une photothèque CC0 d'articles ménagers (Ingredient Atlas) contient des sources pertinentes mais ses « generated-sources » examinées ont un fond blanc opaque sans canal alpha (WebP VP8 sans ALPH) : **aucun de ces fichiers n'est intégré**. Les autres visuels externes inspectés montrent des variantes de produit ou de conditionnement erronées (poisson entier au lieu de filets, rouleau de bande médicale au lieu de pansements adhésifs, bouteilles alimentaires comme vinaigre ménager, etc.).

**Justification du lot réduit :** aucun des autres candidats examinés ne réunissait simultanément exactitude de l'article, alpha réel, netteté à 192 px et bon conditionnement. Aucun ajout artificiel de source inadéquate. L'API payante du dépôt n'a pas été utilisée.

**Périmètre :** seul `www/Items/capsules-cafe.webp` est remplacé, avec la version visible v599 et les références `catalog.js`/`dish-local-images.js`/`sw.js` nécessaires à la fraîcheur des caches. Les tuiles, CSS, navigation, images des plats, chargement et mécanismes Home Assistant/OAuth/WebSocket/biométrie restent intacts. Validation complète des tests sur la branche, SHA publié sur main et Pages **à confirmer**. Le rendu physique iPhone, l'accès HA et le mode hors ligne réel ne sont pas testés.


### Statut final vérifié sur main — 27 octobre 2026

**PUBLIÉ** via [PR #101](https://github.com/fabien95430/Dashboard-course/pull/101) fusionnée dans `main` au SHA `1f316be8decff585ff9c90b46ff3095de046ca6a`. Blob image réel `9db78238e81fdf5e88b8cdf889794fb3b55f3f16` (20 282 octets). [CI sur main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40517689292) ; [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40517688543). Le paragraphe ci-dessus mentionnant les validations « à confirmer » décrit l'état historique de préparation, pas l'état de publication final.
