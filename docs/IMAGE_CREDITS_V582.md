# Crédits et conformité — lot d'images v582 (publié et vérifié)

**Préparation :** 26 octobre 2026 sur `main` au SHA de départ `97149bcb7843f4eeb06b24f8fad729a15455cec7`. Huit WebP unitaires sous les slugs existants : aucune image ajoutée, aucun atlas, aucune API OpenAI payante du dépôt.

**Origine des sept nouveaux rendus** : illustrations originales créées dans le générateur d'images ChatGPT pour *Application Course*, chacune représentant un seul type de produit. Les sources PNG natives 1254 × 1254 ont été recadrées sur le sujet et réduites (jamais agrandies) en 384 × 384 WebP. Canal alpha réel 0–255, absence d'objet étranger, nettoyage des pixels isolés par composante alpha, fond transparent et contrôle visuel à 192 × 192 px sur fonds clair et sombre. Pas d'image extérieure, logo ou texte inventé et aucune licence tierce revendiquée sur ces sept créations.

**Huitième image Chili** : [EBf Studio Ingredient Icons](https://github.com/EBf-Studio/ingredient-icons/blob/091deff6956275dfcb10b150c864834c7417529e/icons/webp/256/en_chili-pepper.webp), représentation d'un piment rouge cru correspondant au visuel original du catalogue (Chili). Licence des illustrations : [CC0 1.0 via LICENSE-ICONS](https://github.com/EBf-Studio/ingredient-icons/blob/091deff6956275dfcb10b150c864834c7417529e/LICENSE-ICONS). Le code du dépôt source est MIT mais le WebP est CC0. Source recopiée à l'identique, format 256 px avec alpha natif, attribution volontaire EBf Studio, sans partenariat.

| Catégorie | Produit | Destination | Avant (o) | Après (o) | Dimensions | Git blob SHA |
| --- | --- | --- | ---: | ---: | --- | --- |
| Petit-déjeuner | Café moulu | `www/Items/cafe-moulu.webp` | 4216 | 36088 | 384 × 384 | `6e41d12f6ef248ec8e0f6945d75e506bc03d9841` |
| Cuisine | Pépites chocolat | `www/Items/pepites-chocolat.webp` | 4574 | 22184 | 384 × 384 | `01e26b026319503e757cec95727dc1833f22fd7a` |
| Apéritif & snacks | Brownies | `www/Items/brownies.webp` | 4344 | 41670 | 384 × 384 | `eda8765b65e0229e6e03a35992c3d5e7558eb5db` |
| Viandes & poissons | Merguez | `www/Items/merguez.webp` | 3994 | 28648 | 384 × 384 | `dcb15608f32784b056ce988782059c1a58f4b77f` |
| Apéritif & snacks | Madeleines | `www/Items/madeleines.webp` | 3824 | 26222 | 384 × 384 | `ea7eeb828e51e50cb39e005e76261cfab2000f96` |
| Apéritif & snacks | Crêpes | `www/Items/crepes.webp` | 4178 | 24638 | 384 × 384 | `55c7a9a04c98b071326be8e3d9ccc3e7167e0239` |
| Boulangerie | Pains hot-dog | `www/Items/pains-hot-dog.webp` | 3500 | 19134 | 384 × 384 | `686bc938c11db748e9e7f04a5ecc2de20ae27d80` |
| Cuisine | Chili | `www/Items/chili.webp` | 59028 | 8998 | 256 × 256 | `32f4b607dc0ba3b80b2d99206fa99648cf620b19` |
| **Total** | **8 produits** | | **87658** | **207582** | | |

**Contrôles effectués en préparation :** même nom de produit dans `catalog.js`, ancien visuel examiné, correspondance exacte du nouveau visuel, un seul type d'objet, pas de découpe, transparence réelle, poids ≤ 60 Ko, aperçu à 192 px, somme et empreintes Git des blobs source/destination identiques. Pour Merguez, variante crue épicée sans trace de grillade ni cuisson ; pour Chili, piment rouge, **pas** un plat préparé. La validation automatique CI sur PR et sur `main` est réussie et GitHub Pages a été déployé. Les tests sur un appareil iPhone physique et Home Assistant ne sont pas déclarés comme réalisés.

**Rejets :** planches de produits ménagers et images avec fonds opaques/halos, sources de confitures ouvertes, vinaigres avec accessoires, pâte feuilletée cuite, saucisse fumée pour merguez et toutes sources de variante incorrecte. Les visuels déjà nets (dont Granola, Sirop d'érable, Papier cadeau, Lave-glace, Pâte brisée) sont conservés sans nouveau comptage.

**Poids réel du lot :** 87 658 → 207 582 octets (variation +119 924). Publication : [commit `6c18a389`](https://github.com/fabien95430/Dashboard-course/commit/6c18a389cd3f5c9ad62793b3d7c69f5a6d20bd6f), [PR #95](https://github.com/fabien95430/Dashboard-course/pull/95), [CI PR](https://github.com/fabien95430/Dashboard-course/actions/runs/40420931134), [CI main](https://github.com/fabien95430/Dashboard-course/actions/runs/40421036581) et [Pages](https://github.com/fabien95430/Dashboard-course/actions/runs/40421036129), toutes réussies.
