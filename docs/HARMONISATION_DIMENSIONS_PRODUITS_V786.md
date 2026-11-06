# Harmonisation des dimensions — v786

Feu vert utilisateur du 6 novembre 2026, après l'audit exhaustif des 522 produits de main v785.

## Périmètre livré

31 ajustements d'affichage : 13 réductions, 16 agrandissements et les deux essais de cadrage des sachets Thé Earl Grey / Thé fruits rouges. Pour ces deux thés, le zoom global retenu dans les aperçus conserve le fil entier ; aucune image n'est découpée ou régénérée. Les 491 autres produits, dont Limonade, conservent leur cadrage.

Le profil de Ma liste reste plus modéré pour préserver la lisibilité des petites vignettes. Les conteneurs, cartes, safe areas, unités et noms restent inchangés.

## Une seule mesure, deux vues

Les mesures automatiques brutes restent stockées dans `courses-product-visual-scale-v1`, sans facteur d'harmonisation. `product-item-images.js` applique le facteur de la vue uniquement à l'affichage : dans `visualScaleStyle(source,compact)` pour le HTML initial et dans `setVisualScale` après chargement. `app.js:sprite` transmet le contexte compact de Ma liste ; le remplacement d'un fallback conserve ce contexte avant insertion dans le DOM.

Cette séparation rend les cadrages v785 immédiatement utilisables, sans nouvelle migration ni purge : le facteur n'est jamais sauvegardé dans la mesure brute et ne se cumule pas aux ouvertures suivantes. Les anciennes migrations par visuel restent en place. Aucun fichier image, hash visuel ou mécanisme de cache persistant n'est modifié.

## Facteurs validés

Multiplicateurs du zoom automatique brut, appliqués sans déformer les proportions ni modifier la translation. Les 31 aperçus avaient été contrôlés géométriquement sur des conteneurs de 82 / 46 px dans l'audit.

| Slug | Catalogue | Ma liste |
| --- | ---: | ---: |
| bouillon-cubes | 0.9 | 0.96 |
| ricotta | 1.05 | 1.05 |
| glace-nuii | 1.06 | 1.06 |
| myrtilles | 1.06 | 1.06 |
| carottes | 1.06 | 1.06 |
| courgettes | 1.06 | 1.06 |
| haricots-verts | 1.06 | 1.06 |
| poireaux | 1.08 | 1.08 |
| asperges | 1.06 | 1.06 |
| brosses-a-dents | 1.08 | 1.08 |
| fil-dentaire | 0.9 | 1 |
| creme-hydratante | 0.92 | 1 |
| amidon | 1.06 | 1.06 |
| tablettes-lave-vaisselle | 0.92 | 1 |
| barres-cereales | 1.06 | 1.06 |
| cookies | 0.95 | 1 |
| kinder-maxi | 1.06 | 1.06 |
| cafe-moulu | 0.94 | 1 |
| capsules-cafe | 0.75 | 0.9 |
| dosettes-cafe | 0.85 | 0.95 |
| filtres-a-cafe | 0.88 | 0.96 |
| matcha | 0.93 | 1 |
| the-earl-grey | 1.08 | 1.06 |
| the-fruits-rouges | 1.08 | 1.06 |
| the-noir | 0.88 | 0.96 |
| pate | 0.9 | 0.96 |
| rillettes | 0.94 | 1 |
| saucisson | 1.25 | 1.18 |
| saumon | 1.06 | 1.06 |
| truite | 1.06 | 1.06 |
| porc | 1.12 | 1.08 |

## Limonade

L'audit avait observé un WebP en échec de chargement dans une session navigateur et le fallback SVG, sans cause déterminée. Le fichier canonique `www/Items/limonade.webp` est bien présent dans main (13 378 octets). L'environnement local et le navigateur ne sont plus disponibles lors de cette intégration : le rendu publié n'a pas pu être recontrôlé. Ne pas remplacer arbitrairement le visuel validé, ajouter une purge ou prétendre corriger un incident non reproduit. Le fallback SVG existant est conservé. Ce point reste à revalider séparément.

## Validation

- Sept tests de régression ajoutés : couverture des 31 profils / 491 conservations, profil compact des capsules, ancien cache, absence de cumul, cohérence premier rendu / chargement / fallback détaché, agrandissement du saucisson, thés et transmission du contexte compact.
- Attentes visuelles historiques Carottes et Ricotta mises à jour pour leurs nouveaux profils, tout en conservant les vérifications de migration de cache.
- Contrôles ciblés exécutés dans l'interpréteur JavaScript disponible ; compilation syntaxique des scripts modifiés.
- L'environnement shell étant indisponible, `bash scripts/validate_repo.sh` n'a pas pu être lancé localement. La validation complète est confiée au workflow permanent `.github/workflows/validate.yml`, sans modifier ce workflow.
- Aucun nouvel essai iPhone/WebKit ni Home Assistant réel lors de l'intégration. OAuth, WebSocket, coffre, verrouillage, biométrie, synchronisation et mode test n'ont pas été modifiés.

Les marqueurs de version, le cache shell et les URL des modules concernés passent ensemble en v786. Le catalogue métier et les WebP restent identiques.
