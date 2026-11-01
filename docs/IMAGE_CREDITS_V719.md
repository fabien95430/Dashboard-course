# Crédits des visuels produits — v719

**Source de vérité :** `fabien95430/Dashboard-course` / `main` (7943484509fc4beca4ba0de8bfe8de24dcc2164b, v718 avant ce lot).

## Périmètre

Trois remplacements de visuels existants dans **Hygiène & soins**, sans ajout, suppression ni modification des produits du catalogue : Disques coton, Gel hydroalcoolique et Alcool 70.

**Provenance :** rendu original créé avec la génération native d’images ChatGPT pour ce projet le 1er novembre 2026. Trois produits différents photographiés dans une composition d’approbation, puis extraits individuellement et détourés localement avec Pillow. Aucun téléchargement d’image tierce et aucune marque ajoutée.

| Produit | Fichier | Dimensions | Octets | SHA du blob Git |
| --- | --- | --- | ---: | --- |
| Disques coton | `www/Items/disques-coton.webp` | 384 × 384 | 6102 | `e908a7a38ec06b033a853a4a49a45b048a161b20` |
| Gel hydroalcoolique | `www/Items/gel-hydroalcoolique.webp` | 384 × 384 | 6242 | `b59f531763268a1ad6042d5c8122eac02a8980ba` |
| Alcool 70 | `www/Items/alcool-70.webp` | 384 × 384 | 4072 | `a441dd34e340ed8da939b48671e0464a33c5b4c0` |

Les trois fichiers sont de vrais **WebP RGBA** à fond transparent, avec canal alpha natif VP8X, centrage sur 384 × 384 px et cadrage étudié à 192 × 192 px. Chaque visuel est inférieur au plafond de 150 Kio. Aucun atlas, collage, conteneur externe ou modification des WebP des autres produits.

## Intégration et cache

- Version visible, service worker et références de shell incrémentés à `v719`.
- Invalidation ciblée des trois chemins WebP dans le cache visuel persistant, sans effacer les autres images.
- `catalog.js` reste la source des noms et catégories ; aucun changement de données de Ma liste, Home Assistant, de sécurité ou de mode test.
- Tests du dépôt exécutés automatiquement par GitHub Actions à la publication.
