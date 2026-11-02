# Réfection ciblée des contours — 9 articles, v732

**Source de vérité :** `fabien95430/Dashboard-course`, branche `main`.

**Périmètre :** des 17 images signalées, neuf présentaient un défaut confirmé justifiant une retouche ; les huit autres (Lait, Céréales, Petits pots, Riz au lait, Disques coton, Pop-corn, Muffins, Gressins) conservent leurs images précédemment validées.

Les neuf remplacements corrigent :
- bas tronqué du pot **Glace vanille** ;
- **Lait infantile** trop petit (ancien fichier 84 × 84) ;
- supports ou fonds parasites autour de **Yaourt à boire, Ricotta, Gouda, Gnocchis, Feta, Burrata** ;
- contours et pompe du **Savon mains**.

Visuels originaux générés dans ChatGPT pour le lot puis isolés et nettoyés : composants alpha principaux, centrage, pas de support parasite. Aucun visuel tiers ni marque ajoutée.

Tous les fichiers livrés : WebP individuels **384 × 384 px**, transparence, marges de **28 px minimum**, vérification sur fonds ivoire, sauge et sombre, poids inférieur à 150 Kio. Contrôle visuel à la taille mobile 192 px.

| Fichier | SHA-1 blob |
|---|---|
| `www/Items/glace-vanille.webp` | `889aa8abca3c7b9cef62cb130a6e41d3445ff664` |
| `www/Items/lait-infantile.webp` | `faa8b04a339f315906624764648a5e2d3c4f8aff` |
| `www/Items/yaourt-a-boire.webp` | `d4ea9fda05131d0b40ebc66ddec209df1caca359` |
| `www/Items/ricotta.webp` | `45fa8ac921c1cc7851aaf043cc341b10afe74163` |
| `www/Items/gouda.webp` | `3ba107c2610ec6b4a86ee008b2eb8670f5c03672` |
| `www/Items/gnocchis.webp` | `6a4fc35e5501386cad8a0c5d51a0306e96dd8271` |
| `www/Items/feta.webp` | `99a5113c4b8cbf6c76c9353bf260bcc64db76c94` |
| `www/Items/burrata.webp` | `067b2bb0cec97ab0cdd924652ef36db9b3fd6ec8` |
| `www/Items/savon-mains.webp` | `97d5ba6b42fbfc616e8ad8f7a632469b65f686c1` |

Le code catalogue, les noms de produits, Ma liste, Home Assistant, l'authentification et les images de riz et pâtes validées restent inchangés. Invalidation du cache visuel pour ces neuf fichiers et recalcul sélectif du cadrage en v732. Validation de la suite complète assurée par `bash scripts/validate_repo.sh` dans la CI.
