# Crédits visuels produits — lot v578 (préparation PR)

**Statut initial : préparé sur branche, non publié sur main.** Quatre images WebP unitaires, canal alpha VP8X réel, un seul produit par visuel, aucun atlas, logo ou texte inventé, pas d'appel à l'API OpenAI payante du projet.

| Catégorie | Produit | Fichier | Avant (o) | Après (o) | Dimensions | Git blob SHA |
| --- | --- | --- | ---: | ---: | --- | --- |
| Maison | Essuie-tout | `www/Items/essuie-tout.webp` | 2552 | 10154 | 384 × 384 | `3baa67259036c3f1f3a4a53a23e856526a6166ea` |
| Maison | Papier toilette | `www/Items/papier-toilette.webp` | 3236 | 13554 | 384 × 384 | `2efd33e2635783f5b3b07be5baa830ed01ed247c` |
| Viandes & poissons | Dinde | `www/Items/dinde.webp` | 3648 | 9400 | 256 × 256 | `1f58f05e2d28addbe267be85df49f6367b0cb37c` |
| Cuisine | Levure boulangère | `www/Items/levure-boulangere.webp` | 3152 | 9540 | 256 × 256 | `23d0bd8a7a4ad528b1120183715738478bac165b` |
| **Total** | **4 produits** | | **12 588** | **42 648** | | |

**Essuie-tout, Papier toilette** : illustrations originales générées dans ChatGPT pour Application Course, sans emprunt ni licence tierce revendiquée. WebP 384 × 384 px transparents (coins alpha 0, alpha 0-255, marges, un seul rouleau), inspectés à 192 × 192 px sur fond sauge, sans upscaling d'anciennes vignettes 84 px. Pas de textes ou marques imaginaires.

**Dinde et Levure boulangère** : [EBf Studio Ingredient Icons](https://github.com/EBf-Studio/ingredient-icons), révision `091deff6956275dfcb10b150c864834c7417529e`, sources individuelles [en_turkey.webp](https://github.com/EBf-Studio/ingredient-icons/blob/091deff6956275dfcb10b150c864834c7417529e/icons/webp/256/en_turkey.webp) et [en_yeast.webp](https://github.com/EBf-Studio/ingredient-icons/blob/091deff6956275dfcb10b150c864834c7417529e/icons/webp/256/en_yeast.webp). **Illustrations CC0 1.0** sous [LICENSE-ICONS](https://github.com/EBf-Studio/ingredient-icons/blob/091deff6956275dfcb10b150c864834c7417529e/LICENSE-ICONS), distinct de MIT du code. Attribution volontaire : EBf Studio, sans partenariat. WebP natifs transparents 256 × 256 repris octet pour octet sans agrandissement. Les variantes sont la dinde crue et la levure fraîche en bloc, jamais la viande cuite ni une pâtisserie.

**Contrôles** : quatre anciens WebP 84 × 84 px ; nouveaux WebP 256 ou 384 px avec transparence VP8X ; poids individuel sous 14 000 octets. Vérification dans les véritables tuiles iPhone et du mode hors ligne à confirmer dans l'environnement approprié, sans prétendre avoir effectué un essai matériel. CI PR à vérifier avant publication, Pages après fusion.
