# Fruits & Légumes — correction des sept derniers détourages (v730)

Dépôt de référence : `fabien95430/Dashboard-course`, branche `main`, base `72f9465f3aa3f7e9c4fdf0485669d111a2736a31`.

Remplacement ciblé des sept WebP existants de `www/Items/` : `butternut.webp`, `courge.webp`, `navets.webp`, `echalotes.webp`, `noisettes.webp`, `ail.webp`, `oignons-jaunes.webp`. Les 65 autres références de Fruits & Légumes, les noms et groupes de `catalog.js`, Ma liste, Home Assistant et la sécurité restent inchangés.

Provenance : composition originale ImageGen montrant les sept produits frais, recadrée en sources unitaires, puis détourage local OpenCV GrabCut avec corrections manuelles de masque (dont la haute lumière d'une noisette), suppression du fond, anti-crénelage léger, recentrage et conversion WebP RGBA qualité 78. Les fichiers finaux ne contiennent ni planche, ni emballage, ni décor. Ce lot n'utilise pas l'API OpenAI payante du projet.

| Fichier | Octets | Résolution |
|---|---:|---|
| `www/Items/butternut.webp` | 15814 | 384 × 384 |
| `www/Items/courge.webp` | 22710 | 384 × 384 |
| `www/Items/navets.webp` | 19324 | 384 × 384 |
| `www/Items/echalotes.webp` | 19868 | 384 × 384 |
| `www/Items/noisettes.webp` | 23584 | 384 × 384 |
| `www/Items/ail.webp` | 11860 | 384 × 384 |
| `www/Items/oignons-jaunes.webp` | 15730 | 384 × 384 |

Contrôles locaux : réouverture de chaque WebP, canal alpha non opaque, bordures de 1 pixel intégralement transparentes, marges d'au moins 29 pixels, dimensions 384 × 384, aucun poids supérieur au plafond 150 Kio. Aperçus individuels à 384 px sur fond blanc et sauge, contrôle visuel de la planche sur sauge. Les sept chemins sont invalidés dans le cache persistant du service worker et dans les métriques de cadrage après changement de version, sans modifier les produits déjà satisfaisants.

Validation GitHub CI/Pages : à vérifier après publication de ce commit.
