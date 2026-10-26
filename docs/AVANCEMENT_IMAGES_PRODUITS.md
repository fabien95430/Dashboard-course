# Suivi de la bascule des visuels produits

**Point d'avancement : 26 octobre 2026.** Dépôt source de vérité : `fabien95430/Dashboard-course`, branche `main`. Cette note décrit un état constaté : relire impérativement le code et `AGENTS.md` au moment de reprendre le chantier.

## Réalisé et vérifié

- Dernière version visible **publiée : v559**, sur `main`. Validation complète et déploiement GitHub Pages verts. Le CSS, la bannière citrons, les animations et les safe areas iOS de v556 sont conservés inchangés.
- `catalog.js` contient **414 produits** ; `www/Items/` contient **420 images**.
- **241 produits distincts** sont désormais renouvelés après publication de v559 ; **173 produits** restent à évaluer. Les autres visuels ne nécessitent pas tous d'être changés.
- La **compression v537** concerne **32 anciens fichiers de plus de 100 Kio**, ramenés de **11,88 Mio à 1,18 Mio** au total. Il reste **0 image produit de plus de 100 Kio**. Poids du répertoire `www/Items/` après publication : **9 461 498 octets (9,02 Mio)** (avant : 8,71 Mio).
- **178 images pèsent moins de 10 Kio après v559**, ce qui est un critère de tri, **pas** une preuve de manque de netteté. Vérifier leurs dimensions et l'affichage avant remplacement.
- **Le lot de 30 images initialement préparé en attente a finalement déjà été publié en v539** : ne pas refaire ces 30 fichiers.

### Historique des quinze lots publiés

| Lot | Commit Git | Produits distincts |
| --- | --- | ---: |
| Pilote Abricots v528 | `4ab63535c1dc246645e465abedb8fb2f9b8b7645` | 1 |
| Lot 1 v530 | `97f033731876a15168103c3f5706ed051bc439bf` | 30 |
| Lot 2 v533 | `d91b1b18b7246e158ff1e110375765b10fb060e3` | 30 |
| Lot 3 v534 | `795eed950efbf5bb6202f50b192c856a7fa5060b` | 30 |
| Lot 4 v536 | `5d69ab4793a56a34bba2403bd05a41edd5c1321a` | 11 |
| Lot 5 v539 | `cc80a4614ea14d88e625c787c57256c4e7696917` | 30 |
| Lot v545 — 24 nouveaux WebP | `88465389b15eaa5c237fed273a324374ed556530` — PR #75 | 24 |
| Lot v547 — 8 nouveaux WebP | `3bed1dab866ec7966a56400afd74f8e8b8b5f01e` — PR #76 | 8 |
| Lot v550 — 3 nouveaux WebP | `7fbad781e728543e3c8ee81df03fe1faf125b1b2` — PR #77 | 3 |
| Lot v553 — 30 WebP | `c8bf020acb92cc6fb8ec3486584735ccdc33f00e` — PR #78 | 30 |
| Lot v555 — 11 WebP | `3e9c62dd89eae84b325c164a1bd27422d51159d1` — PR #79 | 11 |
| Lot v556 — 3 WebP | `829c41911f769233429d6826658924c66a6b231e` — PR #80 | 3 |
| Lot v557 — 21 WebP | `a6e9fa8b70c43c3c382fdbf0a41103da7ffdcc69` — PR #81 | 21 |
| Lot v558 — 3 WebP | `fe533ce5b225f62968824d24e9e0faec6600055c` — PR #82 | 3 |
| Lot v559 — 6 WebP | `7f21c78216588ed93349b4a9fa85aaeead814917` — PR #83 | 6 |
| **Total** | | **241** |

**Attention :** v537 optimise séparément 32 fichiers existants (dont certains figurent aussi parmi les 211), ne pas additionner les compteurs.

### Lot v545 — 24 images publiées

Après présélection de 30, seuls 24 visuels ont été jugés assez fidèles et meilleurs à 192 px ; les autres ont été écartés. Les 3 fruits/légumes encore à renouveler ne sont **pas comptabilisés** : l'identité exacte n'a pas été validée pour toutes les sources ; conserver les anciens fichiers, notamment les olives non dénoyautées.

Crédits : `docs/IMAGE_CREDITS_V545.md`. Chaque fichier est un WebP indépendant 320 × 320 px, transparent, sans augmentation au-delà de 100 Kio. **Avant : 130580 octets ; après : 360810 octets.**

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Frais | Glace vanille | 4432 | 13628 |
| Frais | Glaçons | 4708 | 21566 |
| Frais | Poêlée de légumes | 4578 | 18930 |
| Viandes & poissons | Moules | 3966 | 17912 |
| Viandes & poissons | Truite | 3180 | 15164 |
| Viandes & poissons | Agneau | 4530 | 18084 |
| Viandes & poissons | Poulet | 4534 | 11990 |
| Viandes & poissons | Veau | 3758 | 12868 |
| Viandes & poissons | Thon en boîte | 4610 | 17172 |
| Boulangerie | Pain de mie | 3924 | 16404 |
| Boulangerie | Pain complet | 4394 | 24148 |
| Cuisine | Bouillon cubes | 3618 | 23402 |
| Cuisine | Boulgour | 4910 | 15084 |
| Cuisine | Coquillettes | 5246 | 8792 |
| Cuisine | Semoule | 3890 | 15252 |
| Cuisine | Spaghetti | 3324 | 13324 |
| Cuisine | Chapelure | 4382 | 16982 |
| Cuisine | Gélatine | 30236 | 9916 |
| Cuisine | Levure chimique | 3654 | 7694 |
| Cuisine | Maïzena | 4136 | 8694 |
| Cuisine | Vanille | 3642 | 12740 |
| Cuisine | Nouilles instantanées | 6344 | 18052 |
| Cuisine | Nouilles chinoises | 5134 | 9170 |
| Cuisine | Tagliatelles | 5450 | 13842 |

### Lot v547 — 8 WebP sélectionnés

Sélection volontairement inférieure à 30 : seuls les huit candidats disposant d'une correspondance produit contrôlée ont été retenus. Images WebP unitaires 320 × 320 px avec canal alpha, issues de Soft Studio Ingredients (CC BY 4.0), sans génération via l'API payante du projet. Correspondances et attribution détaillées dans `docs/IMAGE_CREDITS_V547.md`.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Frais | Fromage râpé | 4578 | 15242 |
| Frais | Pâtes fraîches | 5018 | 13842 |
| Boulangerie | Pains burger | 4946 | 16172 |
| Boulangerie | Wraps | 3738 | 14296 |
| Apéritif & snacks | Bretzels | 5000 | 20918 |
| Apéritif & snacks | Noix de cajou | 4490 | 11176 |
| Apéritif & snacks | Chocolat au lait | 3826 | 13346 |
| Apéritif & snacks | Chocolat noir | 4038 | 17878 |

**Total du lot : 35 634 → 122 870 octets**, soit +87 236 octets répartis entre huit visuels. Les fichiers de ces produits occupent au plus 20 918 octets chacun. Les slugs, la liste HA prioritaire et le cache visuel persistant restent inchangés.

**Fruits & Légumes encore à traiter : Endives, Mâche, Olives fraîches.** Des candidats locaux Endives/Mâche ont été générés et inspectés mais ne sont pas intégrés à ce lot ; les seules sources tierces d'olives disponibles lors de ce contrôle les montraient dénoyautées, donc incorrectes. Aucun de ces trois fichiers anciens n'a été remplacé ni comptabilisé. Les futurs lots doivent les traiter prioritairement, sans inventer d'image ni agrandir une miniature existante.

### Lot v550 — 3 nouveaux visuels publiés

Après vérification des variantes, seulement **3 images** ont été retenues. Chaque fichier reste indépendant, isolé sur fond transparent, et conserve le slug attendu par `product-item-images.js`. Aucun produit déjà renouvelé n'a été repris.

| Catégorie | Produit | Ancien (octets) | Nouveau (octets) |
| --- | --- | ---: | ---: |
| Fruits & Légumes | Olives fraîches | 4 628 | 51 220 |
| Cuisine | Lasagnes | 4 428 | 9 630 |
| Boulangerie | Pain aux céréales | 4 436 | 26 118 |

**Total : 13 492 → 86 968 octets** (+73 476 octets). Deux sources : **Ingredient Atlas** (CC0 pour les olives entières, 512 × 512 px) et **Soft Studio Ingredients** (CC BY 4.0 pour les lasagnes et le pain, 320 × 320 px). Détails, liens et attributions : `docs/IMAGE_CREDITS_V550.md`.

**État historique au lot v550 :** les candidats Endives et Mâche n'étaient pas encore publiés ni comptabilisés. Ils ont été remplacés et comptabilisés ultérieurement, au lot v553. Les olives de la collection Soft Studio ont été rejetées car dénoyautées ; les olives retenues ici sont représentées entières, sans perforation. Aucun visuel de crèmes, épices ou sauces contrevenant à l'obligation du pot fermé n'est modifié.

Version visible : **v550** ; service worker : `courses-app-v550-r1`, sans modification de la stratégie de cache visuel, du mode hors ligne, des animations ou de l'intégration Home Assistant. **Publié sur `main`.** Commit `7fbad781e728543e3c8ee81df03fe1faf125b1b2` — [PR #77 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/77) — [validation complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40239824242) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40239824063).

### Lot v553 — 30 visuels produits publiés

- **30 remplacements indépendants :** 2 Fruits & Légumes et 28 Frais. Aucun produit déjà remplacé dans les lots antérieurs n'est repris.
- Les WebP sont centrés et transparents : **Endives et Mâche 400 × 400 px**, les 28 autres **320 × 320 px** ; tous ont été inspectés à la taille de rendu 192 px. Suppression des artefacts de fond et contrôle des marges alpha. Les crèmes et produits en pot sont représentés avec couvercle fermé ; les quatre variantes de lait ont un bouchon distinct.
- **Poids de ce lot avant/après : 116 466 → 602 884 octets** (+486 418 octets) ; maximum individuel **39 110 octets**, aucun WebP au-delà de 100 Ko. Total du répertoire après le lot : **9 085 954 octets** (environ 8,67 Mio).
- Visuels générés sans appel à l'API payante du projet ; voir `docs/IMAGE_CREDITS_V553.md`. Aucun sprite/atlas chargé, aucun backend ou polling ; `product-item-images.js` et le cache visuel persistant sont inchangés.
- **Publication vérifiée :** commit `c8bf020acb92cc6fb8ec3486584735ccdc33f00e` publié sur `main`, [PR #78 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/78), [CI verte sur PR](https://github.com/fabien95430/Dashboard-course/actions/runs/40243773230), [CI verte sur `main`](https://github.com/fabien95430/Dashboard-course/actions/runs/40243846948), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40243847004).

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Fruits & Légumes | Endives | 4104 | 17090 |
| Fruits & Légumes | Mâche | 5026 | 27834 |
| Frais | Camembert | 4206 | 25692 |
| Frais | Comté | 4278 | 20280 |
| Frais | Raclette | 3558 | 15862 |
| Frais | Reblochon | 3756 | 24000 |
| Frais | Crème épaisse | 3016 | 10750 |
| Frais | Crème fraîche | 2882 | 11174 |
| Frais | Lait demi-écrémé | 2156 | 8592 |
| Frais | Lait écrémé | 2124 | 8236 |
| Frais | Lait entier | 2102 | 7704 |
| Frais | Lait sans lactose | 2050 | 7462 |
| Frais | Mascarpone | 3532 | 9762 |
| Frais | Frites surgelées | 5036 | 31274 |
| Frais | Glace chocolat | 4682 | 31400 |
| Frais | Haricots verts surgelés | 5300 | 33928 |
| Frais | Légumes surgelés | 5372 | 36398 |
| Frais | Petits pois surgelés | 4724 | 29906 |
| Frais | Pizza surgelée | 4526 | 39110 |
| Frais | Sorbet | 4616 | 30414 |
| Frais | Pizza fraîche | 4382 | 29830 |
| Frais | Quiche | 4092 | 28530 |
| Frais | Crème dessert chocolat | 3876 | 13882 |
| Frais | Crème dessert vanille | 4546 | 13132 |
| Frais | Flan | 3224 | 14846 |
| Frais | Petits-suisses | 3252 | 11878 |
| Frais | Riz au lait | 4540 | 21968 |
| Frais | Skyr | 3260 | 10076 |
| Frais | Yaourts fruits | 4060 | 18364 |
| Frais | Yaourts vanille | 4188 | 13510 |

### Lot v555 — 11 visuels publiés

Sélection de 11 correspondances conformes parmi les produits non renouvelés : aucune image n'est remplacée juste pour atteindre le plafond de 30. Sources vérifiées : **Soft Studio Ingredients** (CC BY 4.0, WebP 320 × 320) et **RedM Icons Photoreal** (CC0, WebP natifs 256 × 256). Les fichiers natifs 256 px sont évalués pour l'affichage à 192 px et **ne sont pas artificiellement agrandis**. Chaque image reste sous 21 Ko, avec canal alpha et slug inchangé. Aucune utilisation de l'API OpenAI payante du projet.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Frais | Cheddar | 69916 | 10548 |
| Boulangerie | Galettes de blé | 3976 | 14296 |
| Cuisine | Tortillas | 4154 | 20432 |
| Apéritif & snacks | Crackers | 4548 | 17590 |
| Boissons | Bière blonde | 2720 | 9794 |
| Boissons | Gin | 27260 | 10272 |
| Boissons | Vin rouge | 2978 | 6232 |
| Boissons | Vin blanc | 3062 | 8916 |
| Boissons | Whisky | 4784 | 11772 |
| Boissons | Eau gazeuse | 2810 | 10394 |
| Apéritif & snacks | Bonbons | 4550 | 13712 |

**Somme des 11 fichiers : 130 758 → 133 958 octets**, soit seulement **+3 200 octets** pour des visuels plus nets. Les crédits, sources exactes et formats sont dans `docs/IMAGE_CREDITS_V555.md`.

Les quatre autres produits Frais non remplacés sont conservés : leur visuel actuel est déjà plus fidèle que les sources externes examinées. Les crèmes, épices et sauces nécessitant des pots fermés ne font l'objet d'aucune substitution incorrecte. Aucun changement CSS, bannière citrons, Home Assistant, OAuth, WebSocket, coffre, biométrie, verrouillage ni logique de cache hors ligne. Le cache du service worker et les marqueurs de version passent ensemble à v555, sans modifier la stratégie de cache.

### Lot v556 — trois nouveaux visuels publiés

Trois correspondances exactes validées dans le catalogue : une conserve de grains de maïs, de la polenta sèche (semoule de maïs), et des grains de café torréfiés. Des produits déjà corrects, y compris les quatre derniers visuels Frais et les sauces soumises à la règle des pots fermés, sont conservés sans changement. Les fichiers de cette série sont indépendants et gardent leur slug. Les versions sources 256 px sont conservées telles quelles (pas d'agrandissement artificiel) et restent lisibles à 192 px.

| Catégorie | Produit | Ancien (octets) | Nouveau (octets) | Source |
| --- | --- | ---: | ---: | --- |
| Cuisine | Maïs en boîte | 4582 | 16442 | RedM Icons Photoreal, CC0 |
| Cuisine | Polenta | 4266 | 16958 | Soft Studio Ingredients, CC BY 4.0 |
| Petit-déjeuner | Café en grains | 4418 | 20062 | RedM Icons Photoreal, CC0 |

**Total : 13 266 → 53 462 octets (+40 196 octets)**. Tous les fichiers sont transparents, inférieurs à 60 Ko, sans collage ni nom de marque ajouté. Attribution et liens exacts : `docs/IMAGE_CREDITS_V556.md`.

**Périmètre technique :** version globale `v556`, cache service worker `courses-app-v556-r1`, trois fichiers WebP, le suivi et les crédits. Aucune modification de styles, navigation, bannière citrons, Home Assistant, WebSocket, OAuth, coffre ou biométrie. Commit : `829c41911f769233429d6826658924c66a6b231e`, [PR #80 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/80), [validation complète sur `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40249012283) et [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40249012186).

### Lot v557 — 21 WebP publiés

Sélection stricte : les produits déjà satisfaisants sont conservés, et **aucune image n'est ajoutée uniquement pour remplir 30 places**. Les 21 candidats sont issus des [visuels Photoreal de SwisserDev](https://github.com/SwisserDev/fivem-icons-photoreal), disponibles en **CC0 1.0**. Leurs WebP natifs 256 × 256 px, avec transparence, sont lisibles à 192 px et ont été conservés sans agrandissement ni transformation. Chaque fichier pèse moins de 27 Ko. Toutes les correspondances sources, tailles et licences sont consignées dans `docs/IMAGE_CREDITS_V557.md`.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Cuisine | Concentré de tomate | 4298 | 13776 |
| Cuisine | Mayonnaise | 2482 | 12240 |
| Cuisine | Sauce tomate | 2332 | 13070 |
| Boissons | Jus de pomme | 4016 | 9726 |
| Boissons | Jus de raisin | 3854 | 9530 |
| Boissons | Jus d'orange | 3042 | 11776 |
| Boissons | Lait chocolaté | 2576 | 9024 |
| Boissons | Thé glacé | 2742 | 15138 |
| Boissons | Smoothie | 3762 | 10814 |
| Boissons | Tonic | 2628 | 9348 |
| Boissons | Citronnade | 2998 | 20546 |
| Boissons | Champagne | 2528 | 7544 |
| Boulangerie | Croissants | 4546 | 18762 |
| Apéritif & snacks | Cookies | 4852 | 26688 |
| Apéritif & snacks | Gaufres | 4910 | 18192 |
| Apéritif & snacks | Barres céréales | 4222 | 15412 |
| Hygiène & soins | Gel hydroalcoolique | 2690 | 9928 |
| Hygiène & soins | Coton | 3282 | 14170 |
| Maison | Gants ménage | 3938 | 18544 |
| Maison | Film alimentaire | 2878 | 12882 |
| Petit-déjeuner | Chocolat chaud | 4534 | 16298 |

Poids total du lot : **73 110 → 293 408 octets** (différence : +220 298 octets), sans nouvelle requête réseau supplémentaire par produit. Le dossier `www/Items/` contient toujours **420 fichiers**. Aucun WebP ne dépasse 100 Ko. Les slugs existants et la fonction de résolution des images restent inchangés.

Les trois produits Frais **Mozzarella râpée, Philadelphia et Pâte à pizza**, ainsi que **Cornichon**, conservent leur image précédente, jugée plus fidèle que les candidats disponibles. Les crèmes, épices et sauces devant être représentées en pots fermés ne reçoivent aucun visuel non conforme : ici, seuls **Mayonnaise** et **Sauce tomate** reçoivent un bocal avec couvercle. Les contrôles mobile, offline, sécurité et Home Assistant restent obligatoires avant publication.

### Lot v558 — 3 WebP publiés et validés

**Publié sur `main` :** commit `fe533ce5b225f62968824d24e9e0faec6600055c` via [PR #82 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/82). [CI complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40294139488) et [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40294139097). CI préalable sur PR également [verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40294031103). Aucun nouveau commit d'image redondant après fusion.

Trois produits à ancienne vignette de petit format ont été remplacés par des WebP transparents natif **256 × 256 px**, avec bloc alpha (ALPH), sans suréchantillonnage : leurs noms de fichiers correspondent aux slugs existants. Source : images photoréalistes SwisserDev sous **CC0 1.0**, liens et crédits dans `docs/IMAGE_CREDITS_V558.md`. Aucun appel API OpenAI payant.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Boissons | Eau plate | 2780 | 9794 |
| Boissons | Boisson énergétique | 2270 | 8902 |
| Hygiène & soins | Thermomètre piles | 2404 | 8700 |

**Total : 7 454 → 27 396 octets** (+19 942), soit moins de 27 Ko pour trois images ; chacune pèse moins de 10 Ko. La petite taille initiale et le rendu à 192 px motivent les remplacements, et les trois produits restent de la même variante. Les sources inadaptées (mauvaise variante, sauces non en pot fermé, image à fond blanc non transparent) ou de qualité inférieure ont été rejetées et les fichiers concernés sont inchangés. **Sélection : 43 produits distincts comparés visuellement, 3 retenus et 40 rejetés** ; causes principales : variante incorrecte, conditionnement ou couvercle non conformes, fond opaque, détails superflus, ou image déjà suffisamment nette.

**Périmètre publié :** trois WebP, la version v558 cohérente dans `index.html`, `catalog.js`, `dish-local-images.js` et `sw.js`, et la documentation seulement. La stratégie de cache WebP, le SVG de secours et toutes les fonctions Home Assistant, sécurité, interface, animations et iOS sont inchangés.

### Lot v559 — 6 images publiées et validées

**Publié sur `main` :** commit [`7f21c78216588ed93349b4a9fa85aaeead814917`](https://github.com/fabien95430/Dashboard-course/commit/7f21c78216588ed93349b4a9fa85aaeead814917), [PR #83 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/83). [Validation PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40300852592), [CI complète verte sur `main`](https://github.com/fabien95430/Dashboard-course/actions/runs/40300955029), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40300954773). Les six poids et licences sont vérifiés sur le commit publié.

Six anciennes vignettes de petite dimension ont été comparées à des sources correspondant à leur nom, avec prévisualisation en petite taille ; les contrôles automatisés ne remplacent pas un essai sur iPhone réel. Cinq visuels proviennent de **Soft Studio Ingredients by Alex Wang** sous licence **CC BY 4.0**, et un de **SwisserDev — fivem-icons-photoreal** en **CC0 1.0**. Chaque source est un WebP indépendant, natif, transparent (bloc ALPH), **320 × 320 px** pour Soft Studio et **256 × 256 px** pour l'éponge, sans redimensionnement ni API OpenAI payante. Slugs inchangés. Attribution détaillée dans `docs/IMAGE_CREDITS_V559.md`.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Viandes & poissons | Jambon blanc | 3864 | 19536 |
| Apéritif & snacks | Biscuits beurre | 4908 | 20506 |
| Apéritif & snacks | Biscuits chocolat | 4038 | 24932 |
| Petit-déjeuner | Muesli | 4662 | 20474 |
| Maison | Éponges | 4588 | 15650 |
| Boissons | Jus d'ananas | 3648 | 16518 |

**Total : 25 708 → 117 616 octets** (+91 908 octets). Poids individuel maximal 24 932 octets, 0 dépassement du seuil de 100 Ko. Aucun produit déjà renouvelé dans les lots v528 à v558 n'est repris. **5 candidats visuellement comparés et rejetés**, parmi ceux inspectés lors de la sélection : Harissa et Moutarde (pot non fermé), Ketchup (bouteille interdite), Céréales (moins fidèle que l'ancien conditionnement), Alcool 70 (déjà net). Les autres pistes écartées sur correspondance de nom n'ont pas été comptées comme comparaisons visuelles. Les candidats rejetés restent inchangés : mauvaise variante (viande cuite à la place de viande crue, pâtisserie différente), pots de sauces non fermés, fond opaque, présence d'éléments non pertinents, images actuelles déjà satisfaisantes. Le curcuma est resté hors de ce lot tant que le visuel généré n'est pas transférable et validé sur GitHub.

**Périmètre limité** : six WebP, `index.html`, `sw.js`, `catalog.js`, `dish-local-images.js`, documentation et attribution. Les styles, la bannière citrons, les animations, les safe areas iOS, Ma liste, le catalogue métier, Home Assistant, OAuth, WebSocket, coffre chiffré, verrouillage, biométrie, mode test et stratégie de chargement/cache sont inchangés.

### Lot v560 — curcuma en pot, branche de validation

**État provisoire : non publié au moment de la préparation.** Les totaux publiés restent ceux de v559 jusqu'à la fusion et aux validations CI/Pages réelles.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Cuisine | Curcuma | 41 822 | 6 860 |
| **Total** | **1 WebP** | **41 822** | **6 860** |

Le visuel précédent montrait des **racines fraîches** et ne respectait pas le conditionnement obligatoire des épices. Le remplacement présente **un unique pot de curcuma moulu fermé**, couvercle métallique bien visible, sans marque ni texte, fond réellement transparent. WebP natif **256 × 256 px**, alpha RGBA vérifié, visualisation à 192 px et marge régulière. Source originale générée spécifiquement pour le projet par l'outil de génération d'images ChatGPT, puis compressée localement sans agrandissement, **sans appel à l'API OpenAI payante du projet**. SHA Git du blob de l'image : `7ed6915cc702a8a48d30e899f7fc2f279e0ffdb1`. Provenance : `docs/IMAGE_CREDITS_V560.md`.

**43 produits distincts inspectés visuellement dans cette passe**, dont un remplacement justifié et 42 autres visuels ou propositions non retenus pour publication. Ils restent inchangés : images existantes assez fidèles, erreurs de forme ou de variante (compote bébé avec paille, viande crue remplacée par cuisson, limonade en carafe), sauces présentées en bouteille ou en coupelle au lieu de pots fermés, produits avec accessoires inutiles ou fond non transparent. En particulier, les sauces Burger, César, Ketchup et Barbecue ont des conditionnements à corriger dans de futurs lots avec des sources **exactes et fermées** ; aucun candidat approximatif n'est utilisé pour gonfler le lot. Les produits conservés ne sont pas comptés artificiellement comme renouvelés.

**Périmètre technique :** le seul WebP `www/Items/curcuma.webp`, versions globales v560 dans `index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`, ce suivi et les crédits. Aucun changement CSS, chargement des images, stratégie hors ligne, Home Assistant, OAuth, WebSocket, coffre, sécurité, biométrie, mode test, bannière citrons ou safe areas.

### Situation par catégorie

Comptage des **241 produits renouvelés** vérifié après publication sur `main` de v559, croisé avec `catalog.js`.

| Catégorie | Déjà remplacés | Encore à évaluer |
| --- | ---: | ---: |
| Fruits & Légumes | 72 / 72 | 0 |
| Frais | 49 / 53 | 4 |
| Viandes & poissons | 24 / 39 | 15 |
| Cuisine | 43 / 71 | 28 |
| Boulangerie | 9 / 13 | 4 |
| Petit-déjeuner | 6 / 24 | 18 |
| Apéritif & snacks | 14 / 24 | 10 |
| Boissons | 18 / 36 | 18 |
| Maison | 3 / 50 | 47 |
| Hygiène & soins | 3 / 25 | 22 |
| Enfant | 0 / 7 | 7 |
| **Total** | **241 / 414** | **173** |

**Fruits & Légumes est terminé : 72 / 72.** Endives et Mâche sont remplacés par deux fichiers WebP individuels conformes. Les quatre produits Frais non encore renouvelés sont Mozzarella râpée, Philadelphia, Pâte à pizza et Cornichon ; ils ont déjà des images adaptées et doivent être conservés tant qu'un remplacement réellement meilleur n'est pas disponible.

### Attribution et qualité

Les lots v539, v545 et v547 utilisent des WebP transparents ; v539 contient 30 fichiers **320 × 320 px**, environ **445 Kio au total**, provenant de **Soft Studio Ingredients by Alex Wang** (licence **CC BY 4.0**). L'attribution et les 30 correspondances sont déjà inscrites dans **`docs/IMAGE_CREDITS_V539.md`**. Préserver ce fichier et suivre l'attribution pour toute autre source sous licence similaire. Pour v545, les crédits et correspondances figurent dans `docs/IMAGE_CREDITS_V545.md`. Les visuels CC0 utilisés lors d'autres lots ne relèvent pas du même régime. Vérifier la cohérence des liserés clairs de Soft Studio avec le style réel du catalogue avant toute nouvelle génération.

## Blocage CI résolu — état vérifié sur main

- Ancien incident (v540) : le test `tests/list-render-version.test.mjs` exigeait le suffixe `r1` de façon fixe, tandis que `sw.js` était à `courses-app-v540-r2`. La validation avait 234 réussites et un échec.
- Le commit v541 `fbe380fb1efee1439564fc4c57c3d3a953752b15` a rétabli la cohérence globale, sans lot de visuels produits.
- Correctif permanent du test publié sur `main` : `ba40473a7ddeb21d62f69f30e9f1217224b0a016` (PR #74 fusionnée). L'assertion contrôle l'unicité de `CACHE`, l'alignement de version et la révision entière positive, sans imposer artificiellement `r1`. Aucune modification de `sw.js`, de l'interface ou de la sécurité dans ce correctif.
- Version `v542` (`0d463f4261f5e74e512385a42e00b22be6e8eb8f`) : seuls le fondu décoratif, le versionnement et le précache ont changé, **pas les images produits**. Idem pour les versions jusqu'à v544 avant ce lot. Validation GitHub et GitHub Pages sont toutes deux vertes sur ce commit.
- Inventaire à la fin de v542 : **132 / 414 produits renouvelés**, **32 WebP lourds comprimés**, **420 fichiers WebP**, **aucun > 100 Kio**. Les 24 remplacements v545 décrits plus haut interviennent ultérieurement.
- Historique : les candidats **Endives** et **Mâche**, encore hors dépôt lors de cette reprise v542, ont depuis été publiés dans le lot v553. **Fruits & Légumes est terminé (72 / 72).**

## Reprise du chantier

1. **Commencer par `main` actuel** : lire `AGENTS.md`, `catalog.js`, `product-item-images.js`, `docs/IMAGES_ITEMS.md`, `docs/IMAGE_CREDITS_V539.md`, `sw.js`, la suite `tests/` et cette note ; vérifier les versions réelles et la dernière CI.
2. **Vérifier que la validation GitHub reste verte** et que les révisions indépendantes du cache demeurent cohérentes. Si d'autres commits arrivent, diagnostiquer le nouvel état et ne pas appliquer de correctif obsolète.
3. Examiner d'abord les **0 Fruits & Légumes restants (catégorie achevée en v553)**, puis **Frais**, **Viandes & poissons**, **Cuisine**, puis les autres catégories. Prioriser le manque de netteté réel plutôt que le seul poids.
4. Préparer des lots **de 30 maximum**, seulement avec des correspondances exactes et des visuels contrôlés : **un produit = un fichier WebP**, fond transparent, produit centré, isolé, rendu semi-réaliste premium cohérent avec les cartes existantes ; lisibilité à **192 × 192 px**, source idéalement **320 à 512 px**, cible généralement **15–60 Kio**, plafond pratique **100 Kio**. **Ne jamais agrandir artificiellement** les anciennes miniatures 84 × 84, inventer une marque, substituer un autre produit ou réutiliser des planches d'images.
5. Conserver noms et slug attendus `www/Items/<slug>.webp`, catalogue `catalog.js`, liste HA `Courses` prioritaire, synchronisation WebSocket événementielle, OAuth, coffre chiffré, verrouillage, biométrie, iOS safe areas, fonctionnement offline et architecture HTML/CSS/JS statique + GitHub Pages + HA. **Pas de framework, backend, polling ni API OpenAI payante du projet.**
6. Protéger l'interface validée : **ne pas modifier la bannière citrons actuellement utilisée (`www/list-header-citrons-v552.webp`)**, les emplacements des éléments, l'effet des barres, ni le badge de version **visible uniquement dans Réglages** (les marqueurs HTML des trois vues restent présents).
7. Valider chaque image : identité, dimensions, transparence, poids, cadrage et rendu à taille réelle ; comparer ancien/nouveau ; consigner la licence et son crédit. Remplacer les images uniquement si elles sont meilleures.
8. Préparer **un seul commit atomique** pour un lot prêt, mettre à jour le versionnement/cache selon **les règles courantes d'AGENTS.md**, vérifier que `main` n'a pas bougé, lancer la validation complète, contrôler GitHub Pages, puis **actualiser ce document après la publication réelle**.

**Lot v545 publié et vérifié.** Commit : `88465389b15eaa5c237fed273a324374ed556530` ; PR #75 fusionnée ; [validation CI verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40236407821) ; [déploiement GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40236406903).

**Lot v547 publié et vérifié.** Commit produit : `3bed1dab866ec7966a56400afd74f8e8b8b5f01e` ; [PR #76 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/76) ; [validation complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40238201170) ; [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40238200704).

**Lot v555 publié et vérifié :** commit `3e9c62dd89eae84b325c164a1bd27422d51159d1` — [PR #79 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/79) — [CI complète verte sur main](https://github.com/fabien95430/Dashboard-course/actions/runs/40247926690) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40247926222). Les 11 poids avant/après et l'attribution figurent plus haut et dans `docs/IMAGE_CREDITS_V555.md`.

**Lot v557 publié et contrôlé :** commit `a6e9fa8b70c43c3c382fdbf0a41103da7ffdcc69` — [PR #81 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/81) — [validation complète verte sur `main`](https://github.com/fabien95430/Dashboard-course/actions/runs/40283171384) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40283170880). Les 21 sources et leurs licences CC0 sont détaillées dans `docs/IMAGE_CREDITS_V557.md`.

**Lot v558 publié et vérifié :** commit [`fe533ce5b225f62968824d24e9e0faec6600055c`](https://github.com/fabien95430/Dashboard-course/commit/fe533ce5b225f62968824d24e9e0faec6600055c) — [PR #82 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/82) — [validation complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40294139488) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40294139097). Trois images CC0 au total : 7 454 → 27 396 octets, 235/414 renouvelés, 179 restant à évaluer.

**Lot v559 publié et vérifié :** [commit `7f21c78216588ed93349b4a9fa85aaeead814917`](https://github.com/fabien95430/Dashboard-course/commit/7f21c78216588ed93349b4a9fa85aaeead814917) — [PR #83](https://github.com/fabien95430/Dashboard-course/pull/83) — [CI complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40300955029) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40300954773). 6 images WebP : 25 708 → 117 616 octets ; 241/414 renouvelés ; 173 à examiner.
