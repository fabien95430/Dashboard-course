# Correction Fruits & Légumes — v725 (2 novembre 2026)

Dépôt : `fabien95430/Dashboard-course`. Base vérifiée : `f33e1e041ace3f928e8b8ccf747b7b4ab212532d`.

Remplacement ciblé de `www/Items/abricots.webp` uniquement. Les noms, sous-catégories, liste Home Assistant et scripts de synchronisation sont inchangés. Le WebP original 192 × 192 px comportait un fond blanc résiduel autour des fruits. Les autres images du catalogue ne sont pas modifiées.

Nouvelle source : image originale générée pour le catalogue, représentant des abricots entiers et un demi-abricot avec noyau, sans emballage ni marque, fond transparent. Détourage alpha et retrait des fragments parasites, marges régulières, export individuel WebP RGBA 384 × 384 px, qualité 78.

- Poids final : 19 432 octets (plafond 153 600 octets).
- Marges (alpha ≥ 8) : gauche 25 px, haut 40 px, droite 25 px, bas 40 px.
- Alpha nul aux quatre bords ; pas d'élément principal coupé.
- SHA-256 : `21f33d0a37bf5172d792be47bdb511483aa368b30239e9108642947823a73e25`.
- Prévisualisations contrôlées à 192 px sur blanc et sauge.
- Invalidations : cache visuel service worker ciblé + métrique de cadrage produit ciblée ; pas de recalcul des autres items.

Audit visuel supplémentaire sur la catégorie : 72 produits et 72 WebP présents. Plusieurs anciens items présentent encore des halos ou zones blanches et seront traités individuellement, sans remplacer des visuels satisfaisants.

Validation : `bash scripts/validate_repo.sh` via workflow existant `validate.yml` sur `main` après publication.
