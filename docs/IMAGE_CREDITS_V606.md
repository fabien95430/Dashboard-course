# Crédits visuels produits — lot v606

**Base :** `main` `71c0d1c4a2e621e4d4b3dd86aa4f8bb15752e184` (v605). **Statut : PRÉPARÉ, CI/Pages à confirmer.** Neuf images originales générées avec l’outil natif de création d’images ChatGPT, sans utiliser l'API payante configurée dans le projet. Les fichiers proviennent de générations unitaires, sans découpe de planche ; aucune source externe, marque, ou étiquette fictive.

| Catégorie | Produit | Fichier | Avant (octets) | Après (octets) | SHA Git du nouveau blob |
|---|---|---|---:|---:|---|
| Maison | Détartrant | `detartrant.webp` | 2010 | 15918 | `4d20cccca1ebbd22b059f9c1584c9af0d4667d05` |
| Maison | Nettoyant salle de bain | `nettoyant-salle-de-bain.webp` | 2844 | 17284 | `f50b781df3c4f5927a82e2eb137b991e44ce9fe3` |
| Maison | Liquide rinçage | `liquide-rincage.webp` | 2806 | 14668 | `c103163b571303bfac0d83a6e21d0c57b2d4b2ea` |
| Boissons | Sirop de grenadine | `sirop-de-grenadine.webp` | 2220 | 12520 | `a47de5f7aedadb703659449841ccd160ea05c43a` |
| Boissons | Sirop de menthe | `sirop-de-menthe.webp` | 2306 | 11532 | `939a4e00fc3300d25f1ed3c73370c2456ecfd9be` |
| Boissons | Sirop de pêche | `sirop-de-peche.webp` | 2330 | 12760 | `bbf5e51308d37dbfb0a68d228d5fb8db3fe83ab6` |
| Petit-déjeuner | Infusion camomille | `infusion-camomille.webp` | 4080 | 29020 | `05d32f9e2bf70f1765a15c1d99eb3c2841a1a97d` |
| Petit-déjeuner | Infusion menthe | `infusion-menthe.webp` | 3852 | 29282 | `0cf2027ce89c00c69f86a3b1167f320cf106fb0d` |
| Petit-déjeuner | Infusion verveine | `infusion-verveine.webp` | 3798 | 24978 | `a193250394bdd1ca4d47b8becc5ee065617935ed` |
| **Total** | **9** | | **26 246** | **167 962** | **+141 716 octets** |

**Contrôles techniques :** WebP individuels 384 × 384 px, décodage Pillow validé, canal alpha réel de 0 à 255, quatre coins transparents, marges intactes ; poids individuel inférieur à 100 000 octets, SHA-256 vérifié localement et SHA Git des blobs identique au `git hash-object` des originaux. Comparaison visuelle à 192 px sur fonds blanc et sauge pour les neuf images.

**Fidélité :** Détartrant en flacon à bec incliné ; Nettoyant salle de bain en pulvérisateur ; Liquide rinçage en bouteille à embout doseur ; sirops rouge grenadine, vert menthe, ambré pêche ; infusions camomille, menthe et verveine en sachets pyramidaux à feuilles/fleurs distinctes. Un objet isolé par fichier, sans décor ni logo fictif.

**REJETÉS :** les collages composites ; les sources alternatives à fond blanc opaque ou à mauvais conditionnement ; les images de nettoyant sol ayant une forme de bidon de lessive et de liquide vaisselle. Ces fichiers rejetés ne sont pas intégrés. Aucun produit déjà renouvelé n'est remplacé.

**Validation :** `bash scripts/validate_repo.sh` et `node --test tests/*.test.mjs` en CI de PR avant fusion. Le statut de CI `main` et de GitHub Pages sera documenté après publication réelle. Ni essai iPhone physique ni simulation complète hors ligne ne sont revendiqués. Aucun changement de la logique Home Assistant, de la sécurité, de la navigation ou des tuiles.
