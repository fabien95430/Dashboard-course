# Retouches Fruits & Légumes — v724 (2 novembre 2026)

Dépôt source : `fabien95430/Dashboard-course`, base `5dbf10fbf7c865501c4bfdf8e290b69527f5138c`.

Seules trois images unitaires sont remplacées : `www/Items/poivrons.webp`, `www/Items/asperges.webp` et `www/Items/tomates.webp`. Les sept autres visuels vérifiés (fraises, myrtilles, framboises, mûres, avocat, mangue et mâche) restent inchangés. Le contenu de `catalog.js`, Ma liste et la synchronisation Home Assistant ne changent pas.

Provenance : créations individuelles originales ImageGen, sans emballage, sans marque, isolées sur fond transparent. Post-traitement Pillow/NumPy : suppression des pixels isolés et des ombres parasites par masque alpha, conservation de la principale composante, antialiasing léger, centrage, export WebP RGBA 384 × 384 px, qualité 77.

| Produit | Taille (octets) | Marges gauche/haut/droite/bas (px) | SHA-256 |
|---|---:|---|---|
| Poivrons | 17 194 | 23 / 47 / 24 / 48 | `a447fd1ec191eae88b4035a7bdbd9311f9743eba115edc89289f9f3d53c1c3de` |
| Asperges | 16 400 | 109 / 23 / 109 / 24 | `4405f8c2b904e4b8d98abf87d79140b1c66fa9bd31386ae35c8329b63abeebb0` |
| Tomates | 23 810 | 23 / 32 / 24 / 33 | `0f865e3957f9d7d9241841be94b475495fb54755aa3ae99bfd18be136640561f` |

Contrôles : réouverture des trois WebP, quatre coins et bords alpha nuls, aucune coupure, poids sous 150 Kio. Prévisualisation sur fonds blanc et sauge à 192 px. Les trois sources sont invalidées dans le cache visuel du service worker et leurs métriques de cadrage sont recalculées sans redéclencher une analyse générale. Les anciennes sources inchangées conservent leurs métriques.

Validation des tests via `bash scripts/validate_repo.sh` dans le workflow `validate.yml` sur `main` après publication.
