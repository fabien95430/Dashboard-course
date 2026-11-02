# Correction Fruits & Légumes — v726 (2 novembre 2026)

Dépôt : `fabien95430/Dashboard-course`. Base vérifiée : `6d50f2550f137119ba73bd0db4aacab1c231b5c9` (v725).

Correction strictement visuelle de `www/Items/clementines.webp` : clémentine entière avec feuilles et deux quartiers, sans emballage, sans marque, sur fond transparent. Les autres produits de Fruits & Légumes restent inchangés, notamment Nectarines, Fruit de la passion et Noix de coco : les tentatives de détourage de ces produits ont été rejetées, car des parties du fruit étaient coupées.

Source : création individuelle ImageGen originale. Post-traitement local Pillow/NumPy/OpenCV : conservation de la composante centrale, suppression des pixels/ombres parasites, contour légèrement anti-crénelé, cadrage centré et marges transparentes. Export WebP RGBA 384 × 384 px, qualité 80.

| Produit | Taille (octets) | Marges gauche / haut / droite / bas (px) | SHA-256 |
|---|---:|---|---|
| Clémentines | 26 950 | 33 / 53 / 33 / 53 | `9089ae36bdc0f66d8b6ca419bbade7277715290eb306fe8cf61b572d1870d4a6` |

Contrôles : réouverture du WebP, transparence sur les quatre bords, absence de coupure, taille sous le plafond de 150 Kio, prévisualisation sur fonds blanc et sauge à 192 px. Invalidation ciblée du cache visuel et du cadrage Clémentines ; autres métriques de cadrage conservées. Les scripts de version et la liste Home Assistant restent inchangés fonctionnellement.

Validation du dépôt : workflow `bash scripts/validate_repo.sh` sur `main` après publication.
