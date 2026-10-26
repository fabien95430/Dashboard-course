# Provenance et conformité — sept visuels du lot v582

**Préparation sur `main` au SHA `97149bcb7843f4eeb06b24f8fad729a15455cec7` (v581).** Ces visuels sont candidats à la publication ; vérifier la CI et Pages avant d'annoncer un état publié.

**Source :** sept illustrations originales générées au sein de ChatGPT pour le catalogue Application Course ; aucune API OpenAI payante du projet utilisée, aucune photo ou licence tierce revendiquée. Une seule classe de produit par visuel, sans planche, logo ou texte inventé. La sélection représente exactement le produit du catalogue (notamment Merguez crues, pas cuites ; café moulu et non café en grains ; pains sans garniture).

**Traitement et contrôle :** WebP autonomes 384 × 384 px, alpha réel de 0 à 255, coins et bords extérieurs complètement transparents, marges gauche/droite symétriques, centré. Vérification de rendu à 192 px sur fonds clair et sombre ; pas d'agrandissement des anciennes images 84 px. Aucun fichier au-delà de 100 000 octets.

| Catégorie | Produit | Chemin | Ancien (octets) | Nouveau (octets) | Dimensions | SHA Git blob |
| --- | --- | --- | ---: | ---: | --- | --- |
| Petit-déjeuner | Café moulu | `www/Items/cafe-moulu.webp` | 4216 | 36088 | 384 × 384 | `6e41d12f6ef248ec8e0f6945d75e506bc03d9841` |
| Cuisine | Pépites chocolat | `www/Items/pepites-chocolat.webp` | 4574 | 22184 | 384 × 384 | `01e26b026319503e757cec95727dc1833f22fd7a` |
| Apéritif & snacks | Brownies | `www/Items/brownies.webp` | 4344 | 41670 | 384 × 384 | `eda8765b65e0229e6e03a35992c3d5e7558eb5db` |
| Viandes & poissons | Merguez | `www/Items/merguez.webp` | 3994 | 28648 | 384 × 384 | `dcb15608f32784b056ce988782059c1a58f4b77f` |
| Apéritif & snacks | Madeleines | `www/Items/madeleines.webp` | 3824 | 26222 | 384 × 384 | `ea7eeb828e51e50cb39e005e76261cfab2000f96` |
| Apéritif & snacks | Crêpes | `www/Items/crepes.webp` | 4178 | 24638 | 384 × 384 | `55c7a9a04c98b071326be8e3d9ccc3e7167e0239` |
| Boulangerie | Pains hot-dog | `www/Items/pains-hot-dog.webp` | 3500 | 19134 | 384 × 384 | `686bc938c11db748e9e7f04a5ecc2de20ae27d80` |
| **Total** | **7** | | **28630** | **198584** | | |

**Rejetés ou conservés :** sources sans couvercle pour Confiture et accessoires ajoutés aux vinaigres ; pâte feuilletée cuite pour un item cru ; planches ménagères non conformes ; variante Chili CC0 n'apportant pas d'amélioration suffisamment démontrée. Aucun autre WebP renouvelé n'est écrasé.

**Portée :** uniquement les sept WebP, les numéros de version globaux et de précache nécessaires, et la documentation. Le cache visuel `courses-visuals-v2`, le chargement, les vues, les tuiles, Home Assistant, OAuth, WebSocket, biométrie et safe areas restent inchangés. Test sur véritable iPhone et vérification matérielle du mode hors ligne non réalisés depuis cet environnement. La suite de tests du dépôt doit passer sur PR avant fusion.
