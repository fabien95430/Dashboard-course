# Correction ciblée de trois produits — v734 (2 novembre 2026)

Dépôt : `fabien95430/Dashboard-course`, branche `main`. Révision basée sur le contrôle visuel des huit produits restants après le lot v732.

Seuls trois WebP sont remplacés : `Céréales`, `Petits pots` et `Pop-corn`. Les cinq autres produits contrôlés (`Lait`, `Riz au lait`, `Disques coton`, `Muffins` et `Gressins`) restent inchangés.

Provenance : créations originales ImageGen à partir de la direction visuelle existante. La plaquette est détourée au moyen d'une segmentation de premier plan et d'un anti-crénelage léger ; chaque produit est isolé dans son propre WebP transparent. Aucun fond de présentation, aucune marque ni aucun texte inventé ; conserves et sachets entiers.

| Produit | Fichier | Taille (octets) | Marges gauche/haut/droite/bas (px) | SHA blob Git |
| --- | --- | ---: | --- | --- |
| Céréales | `www/Items/cereales.webp` | 21342 | 73 / 31 / 74 / 31 | `c3a84606e3ddb029d9afeed37e9973fc48b254cd` |
| Petits pots | `www/Items/petits-pots.webp` | 18698 | 65 / 31 / 66 / 31 | `794dec192e6ca4720547590c155ce7c9ac1fb30e` |
| Pop-corn | `www/Items/pop-corn.webp` | 24554 | 65 / 31 / 66 / 31 | `5ec0d2b06f08699122f3fb7305941e173dae5da5` |

Contrôles : fichiers 384 × 384, WebP VP8X avec alpha, poids sous 150 Kio, bords transparents et marge minimale de 31 px. Vérification visuelle sur fond ivoire, sauge et sombre, contrôle à l'échelle des vignettes. Le cache des trois images et leurs métriques de cadrage sont invalidés spécifiquement à partir de v734. Aucun changement de nom, quantité, catégorie, catalogue, interface métier ou Home Assistant.

Les tests du dépôt restent la source de validation finale via `bash scripts/validate_repo.sh` dans la CI GitHub. Pas de test prétendu sur un iPhone réel.
