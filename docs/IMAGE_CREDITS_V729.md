# Trois retouches Fruits & Légumes — v729 (2 novembre 2026)

Source de vérité : `fabien95430/Dashboard-course`, branche `main`. Base : `ffcb4cbee0f56ff25a069f2cca4e9bd3a453af27` (v728).

Les trois produits existaient déjà dans `catalog.js`. Leur nom, sous-catégorie et slug sont préservés. Les autres fichiers d'images du catalogue sont conservés.

| Produit | Format | Octets | Marges G/H/D/B à alpha > 50 | SHA-256 |
|---|---|---:|---|---|
| Nectarines | 384×384 WebP RGBA | 29 096 | 30 / 43 / 31 / 44 | `f2bc13697d8d4f7c3b2a2b6db2d6388cdeb702a83d4be4e8d4e17922603dcfc4` |
| Fruit de la passion | 384×384 WebP RGBA | 28 264 | 30 / 67 / 31 / 68 | `bbff6d80d2f411b43ea5de48625d73c07920b77a13d8166405198adc8b39b826` |
| Noix de coco | 384×384 WebP RGBA | 26 364 | 30 / 66 / 32 / 66 | `1cc9b658a1c51bedfcda7d47260fa383f962adde288ddbb9ff34680eacac13b5` |

Provenance : visuels originaux ImageGen à fond transparent, avec finition PIL/OpenCV. Nectarines depuis un visuel unitaire ; fruit de la passion et noix de coco extraits de leur composition individuelle dans une planche source d'origine, avec seuil alpha et suppression d'éléments étrangers. Les livrables sont trois images unitaires : aucun atlas et aucun fond incorporé.

Contrôles locaux : réouverture des trois WebP, dimensions, masque alpha réel, quatre bords alpha nuls, absence de troncature du produit, qualité à 192 px sur blanc et sauge, poids < 150 Kio. Aucun produit ni élément de catégorie n'est ajouté ou retiré.

Cache : invalidation uniquement des trois images dans `sw.js` et des métriques visuelles correspondantes dans `product-item-images.js` pour les caches antérieurs à la v729. Les règles d'affichage des autres produits, Ma liste, Home Assistant, OAuth, WebSocket, coffre, verrouillage et biométrie sont inchangées.

Validation CI : `bash scripts/validate_repo.sh` doit réussir sur `main` après publication. GitHub Pages doit aussi réussir.