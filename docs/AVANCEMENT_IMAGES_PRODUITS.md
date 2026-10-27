# Suivi de la bascule des visuels produits

**Point d'avancement : 26 octobre 2026.** Dépôt source de vérité : `fabien95430/Dashboard-course`, branche `main`. Cette note décrit un état constaté : relire impérativement le code et `AGENTS.md` au moment de reprendre le chantier.

## Réalisé et vérifié

- Dernier lot d'images publié **v594** sur `main`, [commit `5f05417543326287620f4cd8cd291403b03afbec`](https://github.com/fabien95430/Dashboard-course/commit/5f05417543326287620f4cd8cd291403b03afbec), [PR #99 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/99). [CI PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40482814985), [CI main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40482933402) et [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40482932685). Huit WebP unitaires publiés, aucune image manquante, aucun changement de CSS, navigation, sécurité, Home Assistant ni safe areas iOS.
- `catalog.js` contient **414 produits** ; `www/Items/` contient désormais **414 WebP**, un par produit et sans fichier manquant. Les six images supplémentaires de l'ancien comptage étaient des fichiers orphelins hors catalogue, supprimés lors des travaux ultérieurs.
- **305 produits distincts** renouvelés après v594 ; **109 produits** non renouvelés, dont **au moins 18** évalués et conservés distincts. **Au moins 323 produits** ont une décision de remplacement/conservation publiée, sans compter deux fois les évalués conservés.
- La compression v537 concernait 32 fichiers historiquement lourds. Sur le vrai main v592, **0 image au-dessus de 100 Kio (102 400 o)** ; une seule dépasse 100 000 octets : `romarin-frais.webp` à 100 866 octets, volontairement conservée car les alternatives testées étaient moins fidèles. Poids de `www/Items/` : **10 034 706 octets pour 414 fichiers WebP** ; aucune image manquante.
- Plusieurs anciennes vignettes restent sous 10 Kio ; le petit poids n'est pas une preuve de manque de netteté. Inventaire et contrôle individuels prioritaires avant toute modification.
- **Le lot de 30 images initialement préparé en attente a finalement déjà été publié en v539** : ne pas refaire ces 30 fichiers.

### Historique des lots publiés

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
| Lot v560 — 1 WebP | `047f665b9848a478d51f28b8309843ad4c58a681` — PR #84 | 1 |
| Lot v561 — 6 WebP | `bbafb19f61cce8a7866758bbdba4120de1df63a6` — PR #85 | 6 |
| Lot v562 — 1 WebP | `4bd4e03d3dbca725ac760f8c832c395585566ee2` — PR #86 | 1 |
| Lot v563 — 6 WebP | `2c07dad2e784e07167c485ee085c59f877fb02a6` — PR #87 | 6 |
| Lot v564 — 4 WebP | `94708078e44389f8eca989d4792d0a1681ea63ca` — PR #88 | 4 |
| Lot v565 — 6 WebP | `d0825a731f53e663752133b6396c18b672da8237` — PR #90 | 6 |
| Lot v566 — 5 WebP | `9921fcccf322a24458699cca81b151c32745c4a9` — PR #91 | 5 |
| Lot v567 — 1 WebP | `f1731720ff01e8cf7b08dc3674147ca7de083173` — PR #92 | 1 |
| Lot v568 — 6 WebP | `ea27ec82e59edb7c297af6d99daa02b815fe750c` — PR #93 | 6 |
| Lot v578 — 4 WebP | `8df80edc07d6ee52de84648ba16224bbf67a97bf` — PR #94 | 4 |
| Lot v582 — 8 WebP | `6c18a389cd3f5c9ad62793b3d7c69f5a6d20bd6f` — PR #95 | 8 |
| Lot v592 — 8 WebP | `8f2264de4a9596649938103b9e9589110097d757` — PR #98 | 8 |
| **Total** | | **297** |

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

### Lot v560 — curcuma en pot, publié et validé

**Publié sur `main` :** [commit `047f665b9848a478d51f28b8309843ad4c58a681`](https://github.com/fabien95430/Dashboard-course/commit/047f665b9848a478d51f28b8309843ad4c58a681) via [PR #84](https://github.com/fabien95430/Dashboard-course/pull/84). [CI de la PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40317248019), [CI complète sur `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40317324316), [déploiement GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40317324050). Contrôle de l'image sur l'arbre GitHub : blob SHA identique à la source validée, poids de 6 860 octets et total `www/Items/` à 9 426 536 octets.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Cuisine | Curcuma | 41 822 | 6 860 |
| **Total** | **1 WebP** | **41 822** | **6 860** |

Le visuel précédent montrait des **racines fraîches** et ne respectait pas le conditionnement obligatoire des épices. Le remplacement présente **un unique pot de curcuma moulu fermé**, couvercle métallique bien visible, sans marque ni texte, fond réellement transparent. WebP natif **256 × 256 px**, alpha RGBA vérifié, visualisation à 192 px et marge régulière. Source originale générée spécifiquement pour le projet par l'outil de génération d'images ChatGPT, puis compressée localement sans agrandissement, **sans appel à l'API OpenAI payante du projet**. SHA Git du blob de l'image : `7ed6915cc702a8a48d30e899f7fc2f279e0ffdb1`. Provenance : `docs/IMAGE_CREDITS_V560.md`.

**43 produits distincts inspectés visuellement dans cette passe**, dont un remplacement justifié et 42 autres visuels ou propositions non retenus pour publication. Ils restent inchangés : images existantes assez fidèles, erreurs de forme ou de variante (compote bébé avec paille, viande crue remplacée par cuisson, limonade en carafe), sauces présentées en bouteille ou en coupelle au lieu de pots fermés, produits avec accessoires inutiles ou fond non transparent. En particulier, les sauces Burger, César, Ketchup et Barbecue ont des conditionnements à corriger dans de futurs lots avec des sources **exactes et fermées** ; aucun candidat approximatif n'est utilisé pour gonfler le lot. Les produits conservés ne sont pas comptés artificiellement comme renouvelés.

**Périmètre technique :** le seul WebP `www/Items/curcuma.webp`, versions globales v560 dans `index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`, ce suivi et les crédits. Aucun changement CSS, chargement des images, stratégie hors ligne, Home Assistant, OAuth, WebSocket, coffre, sécurité, biométrie, mode test, bannière citrons ou safe areas.

### Lot v561 — six sauces et condiments en pots fermés publiés et validés

**Publié et contrôlé sur `main` :** [commit `bbafb19f61cce8a7866758bbdba4120de1df63a6`](https://github.com/fabien95430/Dashboard-course/commit/bbafb19f61cce8a7866758bbdba4120de1df63a6) via [PR #85 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/85). [CI complète de la PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40326537829), [CI de `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40326646419) et [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40326646312). Les six SHA de blobs, slugs et poids ont été revérifiés sur l'arbre GitHub du commit publié.

Les images réparent les écarts constatés : deux sauces en **coupelle ouverte** (Burger et César), deux sauces en **flacon** (Ketchup et Barbecue), et deux pots anciens trop petits et peu nets (Moutarde et Pesto). Chaque fichier livré est un **WebP indépendant 256 × 256 px** montrant exactement un seul bocal fermé, couvercle doré visible, sans étiquette inventée, fond alpha transparent. Le cadrage a été comparé à **192 px** sur fond clair de tuile ; des images propres, nettes et fidèles ont été retenues, avec de la marge autour des pots.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Cuisine | Ketchup | 2480 | 8624 |
| Cuisine | Sauce burger | 38382 | 7434 |
| Cuisine | Sauce César | 34482 | 8760 |
| Cuisine | Sauce barbecue | 2346 | 9618 |
| Cuisine | Moutarde | 2820 | 10034 |
| Cuisine | Pesto | 3456 | 12694 |

**Total des six fichiers : 83 966 → 57 164 octets (−26 802 octets).** Aucun fichier ne dépasse 13 Ko ni le plafond de 100 Ko ; dimensions 256 px natives à partir des visuels de haute résolution originaux, sans agrandissement artificiel. Les empreintes des blobs créés sur GitHub correspondent **octet par octet** aux WebP locaux validés. Aucun des six slugs n'était déjà comptabilisé dans les 242 produits renouvelés des versions v528–v560 : le nouveau total effectivement publié est **248/414** (166 non renouvelés).

**Origine :** visuels générés pour *Application Course* à l'aide de l'outil d'image de ChatGPT puis **isolés chacun dans son propre fichier**, avec suppression des pixels parasites à l'extérieur du pot et conversion WebP qualité 22. Il ne s'agit pas de sources tierces CC0 ou CC BY ; l'attribution et les empreintes sont consignées dans `docs/IMAGE_CREDITS_V561.md`. L'API OpenAI payante du projet n'a pas été utilisée.

**Rejets / reports :** les propositions de pots pour guacamole, houmous, tapenade et harissa n'étaient pas fidèles à leurs produits et n'ont pas été intégrées. Les sources disponibles pour curry, paprika, poivre, sauce soja, Tabasco et coulis de fruit n'ont pas encore été jugées suffisamment conformes ; les anciennes images restent en place. Mayonnaise et sauce tomate étaient déjà correctement présentées en bocal et sont conservées. **12 produits examinés et non remplacés**, dont **10 candidats rejetés ou reportés** et **2 images conservées comme satisfaisantes**. Aucun remplissage artificiel pour atteindre 30.

**Invariants :** un seul commit fonctionnel par lot avec les six WebP, versions v561 synchronisées dans `index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`, cette note et les crédits. Aucun changement à `catalog.js` comme source des noms et catégories, au code de chargement des images, aux tuiles, à la bannière citrons, aux animations, à la navigation et aux safe areas iOS, à Home Assistant, au WebSocket, à OAuth, au coffre chiffré, au verrouillage, à la biométrie ni au mode test.

### Lot v562 — Paprika publié et validé

**Publié sur `main` :** [commit `4bd4e03d3dbca725ac760f8c832c395585566ee2`](https://github.com/fabien95430/Dashboard-course/commit/4bd4e03d3dbca725ac760f8c832c395585566ee2) via [PR #86 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/86). [CI complète de la PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40330534189), [CI complète sur `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40330657771), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40330657113). Vérification du blob et du poids sur l'arbre Git du commit publié : 15 108 octets, total `www/Items/` de **9 354 274 octets**.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Cuisine | Paprika | 60568 | 15108 |

Le paprika était illustré par une coupelle ouverte de poudre ; le nouveau fichier contient un **bocal en verre rigide et fermé**, avec couvercle visible, rempli d'épice rouge-orangé, sans étiquette inventée, sur alpha réellement transparent. Source [SwisserDev fivem-icons-photoreal / spice_jar_paprika.webp](https://github.com/SwisserDev/fivem-icons-photoreal/blob/0f2fd1a5389e52c4276a8826cc13c2a0a90e836d/webp-256/cooking_ingredients/spice_jar_paprika.webp), licence CC0 1.0. Source et destination partagent **exactement le même blob Git `4190d8183a473af861da3d60b71da5d838dea000`**. WebP natif 256 × 256 px, bloc VP8X avec alpha, sans upscaling, 15 108 octets. Crédits détaillés : `docs/IMAGE_CREDITS_V562.md`.

**Comparaisons et rejets :** les 6 sauces v561 sont déjà publiées et ne sont pas retraitées. Sont conservés ou rejetés après inspection : Curry (candidats en poudre libre), Poivre (moulin en bois au lieu d'un bocal fermé), Sel (boîte non conforme), Lingettes ménage (source de lingettes médicales, variante incertaine), Miel (pot ouvert avec accessoire), Chocolat en poudre (boîte ouverte), Chips (sachet générique ne permettant pas l'identification), Sacs poubelle (sac plein au lieu du produit vendu roulé), Granola (source de fruits secs), Gants ménage, Film alimentaire, Gel hydroalcoolique et Coton (images déjà identiques aux sources), Maquereaux, Bœuf et Confiture fraise (images actuelles plus fidèles). Aucun remplissage artificiel du lot.

**Périmètre :** un seul WebP, `index.html`, `sw.js`, `catalog.js`, `dish-local-images.js`, cette note et les crédits. Aucun changement de styles, tuiles, bannière citrons, animations, cache visuel persistant, stratégie hors ligne, Home Assistant, OAuth, WebSocket, coffre, verrouillage, biométrie, mode test ou safe areas iOS.

### Lot v563 — 6 images publiées et validées

**Publié sur `main` :** [commit `2c07dad2e784e07167c485ee085c59f877fb02a6`](https://github.com/fabien95430/Dashboard-course/commit/2c07dad2e784e07167c485ee085c59f877fb02a6) via [PR #87 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/87). [CI de la PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40365420483), [CI complète de `main` réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40365510241) et [GitHub Pages déployé avec succès](https://github.com/fabien95430/Dashboard-course/actions/runs/40365509331). Six blobs de WebP identiques aux sources validées, arborescence GitHub vérifiée après fusion.

Six nouveaux visuels **un produit = un WebP individuel**, créés dans ChatGPT spécifiquement pour l'application le 26 octobre 2026, sans appel à l'API OpenAI payante du dépôt ni source tierce nécessitant attribution. Les objets ont été séparés en fichiers indépendants, sans collage, avec vrai alpha, bord transparent, **384 × 384 px**, rendu vérifié à **192 × 192 px** sur fond sage et couvercle fermé visible.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Cuisine | Curry | 84174 | 27016 |
| Cuisine | Poivre | 48432 | 28874 |
| Cuisine | Guacamole | 4616 | 26234 |
| Apéritif & snacks | Houmous | 4440 | 22680 |
| Apéritif & snacks | Tapenade | 4298 | 31540 |
| Cuisine | Harissa | 3782 | 22388 |

**Bilan : 149 742 → 158 732 octets (+8 990 octets)**, 6 fichiers inférieurs à 100 Ko, aucun duplicata d'un lot précédent. Les pots répondent aux consignes de `docs/IMAGES_ITEMS.md` : curry en poudre jaune en pot fermé, poivre en grains en bocal, guacamole vert, houmous beige, tapenade noire et harissa rouge épicée, tous isolés, sans marque, étiquette ni texte.

**Sélection et rejets :** deux substitutions non fidèles rejetées (pot de paprika rouge pour le curry ; moulin à poivre en bois), tandis que les images existantes de mayonnaise et sauce tomate ont été conservées, étant déjà en bocaux fermés satisfaisants. Les autres produits ne sont ni modifiés ni comptés comme renouvelés artificiellement. Sources, traitement et empreintes : `docs/IMAGE_CREDITS_V563.md`.

**Périmètre :** 6 WebP, versionnement global v563 dans `index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`, documentation et crédits uniquement. Aucun changement CSS, bannière citrons, mécanisme de chargement, caches visuels, accès hors ligne, Home Assistant, OAuth, WebSocket, coffre, verrouillage, biométrie ou mode test.

### Lot v564 — quatre nouveaux WebP publiés et validés

**Publié sur `main` :** [commit `94708078e44389f8eca989d4792d0a1681ea63ca`](https://github.com/fabien95430/Dashboard-course/commit/94708078e44389f8eca989d4792d0a1681ea63ca), [PR #88 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/88). [Validation PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40374433505), [CI de `main` réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40374530296), [GitHub Pages déployé avec succès](https://github.com/fabien95430/Dashboard-course/actions/runs/40374529801). Les quatre blobs et leur taille ont été vérifiés dans l’arbre du commit sur `main`.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Cuisine | Sel | 34376 | 17922 |
| Cuisine | Sauce soja | 30832 | 17078 |
| Cuisine | Tabasco | 2160 | 16314 |
| Petit-déjeuner | Pâte à tartiner | 3056 | 17792 |
| **Total** | **4 WebP** | **70424** | **69106** |

**Bilan du lot : 70 424 → 69 106 octets**, soit **1 318 octets économisés** ; aucune image ne dépasse 18 Ko, et aucun agrandissement artificiel d'une ancienne source n'est utilisé. Les quatre WebP originaux natifs sont des découpes individuelles d'illustrations créées spécifiquement dans ChatGPT pour le chantier, avec un seul pot isolé par fichier, fond alpha réel, couvercle clairement visible, et encodage final 384 × 384 px testé à 192 px sur fond sauge. Aucun visuel externe, aucun logo ou texte inventé, et aucune utilisation de l'API OpenAI payante du projet. Les crédits, poids et empreintes Git sont détaillés dans `docs/IMAGE_CREDITS_V564.md`.

**Sélection :** onze visuels existants effectivement inspectés, quatre remplacements justifiés et sept visuels conservés ou candidats rejetés. Le coulis de fruit n'a pas reçu de nouveau visuel : la source proposée ressemblait trop à une sauce tomate et sa variante n'était pas prouvée. Le miel présentait encore un pot ouvert dans les propositions et exige un pot fermé. Les deux confitures, le café soluble, l'infusion menthe et la pile AAA sont déjà reconnaissables ou n'avaient pas de meilleur candidat. Ne pas les compter comme renouvelés.

**Portée :** quatre fichiers `www/Items/*.webp`, alignement de la version globale v564 dans `index.html`, `catalog.js`, `dish-local-images.js` et `sw.js`, ainsi que le suivi et la provenance. Aucun changement aux styles, bannière citrons, position des tuiles, cache visuel persistant, stratégie hors ligne, priorité Home Assistant `Courses`, WebSocket, OAuth, coffre chiffré, biométrie, verrouillage ou mode test.

### Lot v565 — six produits Hygiène & soins publiés et validés

**Publié sur `main` :** [commit `d0825a731f53e663752133b6396c18b672da8237`](https://github.com/fabien95430/Dashboard-course/commit/d0825a731f53e663752133b6396c18b672da8237), via [PR #90 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/90). [Validation complète PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40384190731), [CI complète `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40384309361), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40384308606). Les six produits figuraient parmi les 155 non renouvelés en v564 ; aucun lot antérieur ne les a remplacés. Aucun des 20 produits récemment évalués et conservés n'est repris.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Hygiène & soins | Shampoing | 2252 | 15708 |
| Hygiène & soins | Après-shampoing | 2240 | 9600 |
| Hygiène & soins | Gel douche | 2856 | 16650 |
| Hygiène & soins | Savon mains | 2788 | 12128 |
| Hygiène & soins | Dentifrice | 2480 | 8896 |
| Hygiène & soins | Mousse à raser | 2416 | 11484 |
| **Total** | **6 fichiers** | **15 032** | **74 466** |

Les six images sont des rendus originaux créés dans ChatGPT pour *Application Course* le 26 octobre 2026, puis isolés **un produit par WebP** depuis une source composite ; aucun atlas n'est livré ou chargé par l'application. Chaque image finale fait **384 × 384 px**, avec fond transparent réel (alpha 0–255), contours contrôlés sur un aperçu **192 × 192 px** sur fond sauge, marge régulière et taille comprise entre **8 896 et 16 650 octets**. Shampooing liquide en flacon-pompe ambré, après-shampoing en flacon-pompe crème, gel douche bleu-vert à bouchon, savon mains en flacon-pompe clair, dentifrice en tube et mousse à raser en aérosol bleu. Pas de marque ni texte inventé, pas d'agrandissement d'un ancien fichier flou, aucun recours à l'API OpenAI payante du dépôt.

**Provenance, SHA blob et correspondance :** `docs/IMAGE_CREDITS_V565.md`. Les six binaires ont été transférés sur GitHub et leur empreinte Git vérifiée identique à la source. Les anciens visuels étaient de petites vignettes ; les six nouvelles sont jugées plus nettes et lisibles à 192 px. Les autres produits (dont le coulis de fruit, encore insuffisamment distinct d'une confiture) sont conservés ou rejetés, pas artificiellement comptabilisés.

**Périmètre strict :** uniquement les six `www/Items/*.webp`, les marqueurs globaux v565 dans `index.html`, `catalog.js`, `dish-local-images.js` et `sw.js`, la note de suivi et les crédits. Aucun changement de `product-item-images.js`, de stratégie de chargement, cache visuel, fonctionnement hors ligne, architecture statique, Home Assistant, WebSocket, OAuth, coffre chiffré, biométrie, mode test, CSS, bannière citrons, iOS, navigation ni liste `Courses`.

### Lot v566 — cinq WebP publiés et validés

**Publié sur `main` :** [commit `9921fcccf322a24458699cca81b151c32745c4a9`](https://github.com/fabien95430/Dashboard-course/commit/9921fcccf322a24458699cca81b151c32745c4a9), [PR #91 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/91), [CI PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40392428350), [CI complète sur `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40392546801) et [déploiement GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40392546763). Les cinq empreintes Git correspondent aux WebP préparés.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Enfant | Couches | 4104 | 11384 |
| Enfant | Lingettes bébé | 3176 | 9236 |
| Enfant | Petits pots | 3170 | 9036 |
| Maison | Lessive capsules | 4650 | 20188 |
| Maison | Papier aluminium | 2990 | 6432 |
| **Total** | **5 produits** | **18090** | **56276** |

**Poids net : +38186 octets** pour cinq WebP de 320 à 384 px. Les originaux étaient des miniatures de très faible définition. Les nouvelles versions représentent chacune un unique produit distinct et isolé, sans texte ni marque inventée, sur fond WebP alpha transparent. Examen en situation à 192 px, contrôle des cinq empreintes Git, couleurs et géométrie. Source originale créée dans ChatGPT, sans appel à l'API OpenAI payante ; provenance et empreintes dans `docs/IMAGE_CREDITS_V566.md`.

**Candidats rejetés ou conservés :** essuie-tout (l'objet argenté ressemblait à un rouleau d'aluminium, pas de papier absorbant), coulis de fruit (trop proche de la confiture), substituts de viandes cuites ou mauvaises variantes, et sources identiques aux WebP déjà présents. Ne jamais gonfler artificiellement le nombre de remplacements.

**Modifications limitées aux cinq fichiers WebP**, quatre fichiers de cohérence de version `index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`, cette documentation et les crédits. Aucun CSS, placement des tuiles, bannière citrons, Home Assistant, priorité `Courses`, OAuth, WebSocket, coffre chiffré, biométrie, mode test ni stratégie de cache visuel modifiés.

### Lot v567 — Rosette publiée et validée

**Publié et vérifié sur `main` :** [commit `f1731720ff01e8cf7b08dc3674147ca7de083173`](https://github.com/fabien95430/Dashboard-course/commit/f1731720ff01e8cf7b08dc3674147ca7de083173), [PR #92 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/92). [CI préalable verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40395237098), [CI `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40395443868), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40395444944). Le nouveau blob WebP et sa taille ont été vérifiés dans l'arbre `main`. Ce lot ne comporte qu'un seul remplacement ; la version applicative est v567.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Viandes & poissons | Rosette | 5 006 | 18 496 |
| **Total** | **1 WebP** | **5 006** | **18 496** |

La vignette originale était très petite. La nouvelle source **EBf Studio Ingredient Icons**, `en_cured-sausage.webp`, montre un seul saucisson sec en boyau avec tranches visibles : une rosette clairement reconnaissable à **192 px**, sans marque, étiquette, décor ou texte. Format natif **256 × 256 px**, WebP avec canal alpha réellement présent et taille inférieure à 20 Ko. Licence des icônes **CC0 1.0** (distincte de la licence MIT du code source), liens et SHA documentés dans `docs/IMAGE_CREDITS_V567.md`.

**Sélection conservatrice :** variantes rejetées : saucisse fumée générique pour Merguez ; viande hachée en vrac pour Steaks hachés ; porc entier pour Lardons et Rillettes ; oranges pour confiture de mirabelles ; lentilles brunes pour des lentilles corail ; visuels déjà plus nets ou identiques (moules, cabillaud, sardines, pain burger, gaufres, etc.). Une source qui représente une autre variante n'est jamais publiée pour atteindre un quota.

**Invariants préservés :** le catalogue produit et ses slugs restent identiques ; aucun style, bannière, chargement d'images, cache visuel, backend, dépendance externe, Home Assistant, WebSocket, OAuth, coffre, verrouillage, biométrie ou logique offline modifié. Seuls un WebP, les quatre fichiers de versionnement et la documentation/crédits changent.

### Situation par catégorie

Comptage des **277 produits renouvelés** vérifié après fusion du lot v568 sur `main`, croisé avec `catalog.js` et les SHA des blobs Git. Le commit v569 postérieur conserve ces six images.

| Catégorie | Déjà remplacés | Encore à évaluer |
| --- | ---: | ---: |
| Fruits & Légumes | 72 / 72 | 0 |
| Frais | 49 / 53 | 4 |
| Viandes & poissons | 31 / 39 | 8 |
| Cuisine | 58 / 71 | 13 |
| Boulangerie | 9 / 13 | 4 |
| Petit-déjeuner | 7 / 24 | 17 |
| Apéritif & snacks | 16 / 24 | 8 |
| Boissons | 18 / 36 | 18 |
| Maison | 5 / 50 | 45 |
| Hygiène & soins | 9 / 25 | 16 |
| Enfant | 3 / 7 | 4 |
| **Total** | **277 / 414** | **137** |

**Fruits & Légumes est terminé : 72 / 72.** Endives et Mâche sont remplacés par deux fichiers WebP individuels conformes. Les quatre produits Frais non encore renouvelés sont Mozzarella râpée, Philadelphia, Pâte à pizza et Cornichon ; ils ont déjà des images adaptées et doivent être conservés tant qu'un remplacement réellement meilleur n'est pas disponible.

### Audit des visuels conservés — 26 octobre 2026 (historique antérieur à v566)

**À la date de cet audit, avant v566**, 20 produits non renouvelés avaient été jugés suffisamment fidèles. Ce résultat historique ne constitue pas un statut permanent : quatre de ces produits sont désormais renouvelés en v566 après réception de fichiers de meilleure définition. L'audit de v564 n'avait modifié aucune image, ni la version applicative. Leurs anciens conditionnements étaient fidèles, même si leur qualité visuelle pouvait ensuite être améliorée.

| Catégorie | Produit(s) examinés et conservés | Comparaison et motif |
| --- | --- | --- |
| Hygiène & soins | Disques coton, Pansements, Antiseptique, Baume lèvres, Mouchoirs poche, Papier toilette humide | Conserver disques plutôt que boules de coton, pansements adhésifs plutôt que bande, flacon antiseptique plutôt qu'écouvillon, baume en stick plutôt que gel, et vrais paquets de mouchoirs |
| Enfant | Compotes bébé, Lingettes bébé, Sacs à couches, Petits pots, Lait infantile | Conserver gourde de compote, sachet de lingettes, sac pour couches, petit pot et boîte de lait ; les propositions de boissons à paille ou de sacs poubelle pleins ne correspondent pas |
| Maison | Lessive capsules, Nettoyant WC, Nettoyant vitres, Nettoyant salle de bain, Détartrant, Sacs poubelle 30L, Sacs poubelle 50L, Papier aluminium, Essuie-verres | Conserver les bons emballages et rouleaux : un sac-poubelle plein, des blocs métalliques et un textile différent ne remplacent pas les produits vendus |
| **Total** | **20 références distinctes vérifiées, conservées sans remplacement** | **Aucun nouveau WebP publié dans cet audit** |

Les visuels `Gel hydroalcoolique` et `Coton` ont aussi été contrôlés : leurs sources alternatives sont exactement les fichiers déjà renouvelés en v557, donc **ils ne figurent pas parmi ces 20 produits**. Ce contrôle maintient l'absence de double comptage.

**En attente / rejeté :** le `Coulis de fruit` reste à remplacer car l'ancienne image est en bouteille ; le pot rouge candidat préparé précédemment est **écarté**, car il reste visuellement trop semblable à une confiture pour garantir l'identité du produit. `Shampoing`, `Après-shampoing`, `Gel douche`, `Savon mains`, `Dentifrice` et `Mousse à raser` ont de petites vignettes : rechercher un visuel plus net et fidèle sous licence vérifiable, sans agrandissement artificiel.

**Progression de l'évaluation :** au moins 259 produits renouvelés + 20 autres produits distincts vérifiés et conservés dans cette passe = **279/414 avec une décision documentée**, sans changer le comptage de remplacements (**259/414**). Cela n'implique ni 279 nouveaux fichiers ni que les 135 autres produits soient tous mauvais.

**Après publication v565 (historique) :** les six renouvellements Hygiène & soins s'ajoutaient aux 259 remplacements précédents, sans recouvrir les 20 produits conservés par l'audit. Le bilan était 265 renouvelés + 20 conservés = 285 distincts évalués.

**Après publication v566 :** cinq nouveaux remplacements (Couches, Lingettes bébé, Petits pots, Lessive capsules, Papier aluminium). Parmi eux, **quatre** figuraient dans les 20 références auparavant conservées (toutes sauf Couches) et sont désormais comptées uniquement comme renouvelées. Il reste donc **16 références conservées**, distinctes des **270 renouvelées**. Au moins **286 produits distincts ont une décision documentée** ; les **144 non renouvelés** ne sont pas tous à remplacer.

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

**Lot v560 publié et vérifié :** [commit `047f665b9848a478d51f28b8309843ad4c58a681`](https://github.com/fabien95430/Dashboard-course/commit/047f665b9848a478d51f28b8309843ad4c58a681) — [PR #84 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/84) — [CI complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40317324316) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40317324050). Une image curcuma : 41 822 → 6 860 octets ; 242/414 renouvelés ; 172 non renouvelés. Le bilan des 43 images inspectées et le détail du rejet des candidats insuffisants figurent plus haut.

**Lot v561 publié et vérifié :** [commit `bbafb19f61cce8a7866758bbdba4120de1df63a6`](https://github.com/fabien95430/Dashboard-course/commit/bbafb19f61cce8a7866758bbdba4120de1df63a6), [PR #85 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/85), [validation complète sur `main` réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40326646419), [déploiement GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40326646312). Six fichiers WebP : 83 966 → 57 164 octets, soit 26 802 octets économisés, 248/414 produits renouvelés, 166 non renouvelés. 10 candidats supplémentaires rejetés ou reportés et deux visuels conservés comme satisfaisants.

**Lot v562 publié et vérifié :** [commit `4bd4e03d3dbca725ac760f8c832c395585566ee2`](https://github.com/fabien95430/Dashboard-course/commit/4bd4e03d3dbca725ac760f8c832c395585566ee2) — [PR #86](https://github.com/fabien95430/Dashboard-course/pull/86) — [CI complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40330657771) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40330657113). Paprika : 60 568 → 15 108 octets ; **249/414** renouvelés ; **165** non renouvelés. CC0 et lien source : `docs/IMAGE_CREDITS_V562.md`.

**Lot v563 publié et vérifié :** [commit `2c07dad2e784e07167c485ee085c59f877fb02a6`](https://github.com/fabien95430/Dashboard-course/commit/2c07dad2e784e07167c485ee085c59f877fb02a6) — [PR #87](https://github.com/fabien95430/Dashboard-course/pull/87) — [CI complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40365510241) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40365509331). Six images : 149 742 → 158 732 octets ; 255/414 renouvelés, 159 non renouvelés. Crédits : `docs/IMAGE_CREDITS_V563.md`.

**Lot v564 publié et vérifié :** [commit `94708078e44389f8eca989d4792d0a1681ea63ca`](https://github.com/fabien95430/Dashboard-course/commit/94708078e44389f8eca989d4792d0a1681ea63ca) — [PR #88 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/88) — [CI complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40374530296) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40374529801). Quatre WebP : 70 424 → 69 106 octets (−1 318 octets), 259/414 renouvelés et 155 non renouvelés. Voir les crédits et SHA unitaires : `docs/IMAGE_CREDITS_V564.md`.

**Lot v565 publié et vérifié :** [commit `d0825a731f53e663752133b6396c18b672da8237`](https://github.com/fabien95430/Dashboard-course/commit/d0825a731f53e663752133b6396c18b672da8237) — [PR #90 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/90) — [CI complète réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40384309361) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40384308606). Six images Hygiène & soins : 15 032 → 74 466 octets ; 265/414 renouvelés, 149 non renouvelés. Poids du répertoire : 9 421 380 octets, 420 WebP, zéro fichier de plus de 100 Kio. Crédits : `docs/IMAGE_CREDITS_V565.md`.

**Lot v566 publié et vérifié :** [commit `9921fcccf322a24458699cca81b151c32745c4a9`](https://github.com/fabien95430/Dashboard-course/commit/9921fcccf322a24458699cca81b151c32745c4a9), [PR #91](https://github.com/fabien95430/Dashboard-course/pull/91), [CI main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40392546801), [Pages réussies](https://github.com/fabien95430/Dashboard-course/actions/runs/40392546763). Cinq WebP : 18 090 → 56 276 octets, 270/414 renouvelés, 144 non renouvelés, 420 fichiers WebP, total 9 459 566 octets. Crédits : `docs/IMAGE_CREDITS_V566.md`.

**Lot v567 publié et vérifié :** [commit `f1731720ff01e8cf7b08dc3674147ca7de083173`](https://github.com/fabien95430/Dashboard-course/commit/f1731720ff01e8cf7b08dc3674147ca7de083173) — [PR #92](https://github.com/fabien95430/Dashboard-course/pull/92) — [CI réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40395443868) — [Pages réussies](https://github.com/fabien95430/Dashboard-course/actions/runs/40395444944). Rosette 5 006 → 18 496 octets, 271/414 renouvelés, 143 non renouvelés. Crédits CC0 : `docs/IMAGE_CREDITS_V567.md`. Poids du répertoire : 9 473 056 octets, 420 WebP, zéro image au-delà de 100 Ko.


### Lot v568 — six nouveaux WebP publiés et contrôlés sur main

**Publié sur `main` :** [commit `ea27ec82e59edb7c297af6d99daa02b815fe750c`](https://github.com/fabien95430/Dashboard-course/commit/ea27ec82e59edb7c297af6d99daa02b815fe750c) via [PR #93 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/93). [CI PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40407376147) et [CI `main` v568 verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40407563409). Le déploiement Pages v568 a été **annulé**, car le commit fonctionnel v569 `858c6ccfdff00191e956321824dae50322f2ad21` est arrivé immédiatement après ; [CI v569 verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40407630722) et [GitHub Pages v569 réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40407631020), sur un commit descendant qui conserve les six WebP. **Ce n'est pas un succès Pages propre à v568** : le statut annulé reste consigné. Les six SHA individuels et poids ont été vérifiés dans le vrai `main` après fusion, et les images déjà renouvelées n'ont pas été écrasées.

| Produit | Avant (octets) | Après (octets) |
| --- | ---: | ---: |
| Coppa | 4426 | 38554 |
| Lardons | 5004 | 22132 |
| Mortadelle | 3912 | 24224 |
| Rillettes | 4932 | 29634 |
| Surimi | 3954 | 22530 |
| Steaks hachés | 5024 | 34670 |
| **Total** | **27 252** | **171 744** |

**Écarts de sélection :** Rosette déjà renouvelée en v567 (conservée) ; Merguez écartée en raison d'une variante visuelle non certifiée crue ; Coulis de fruit toujours reporté, car les propositions ressemblent à une confiture. Les autres alternatives incorrectes (viande cuite, mauvaise espèce, produit différent) restent rejetées. Aucun autre produit déjà renouvelé n'est écrasé.

**Périmètre publié en v568 :** uniquement les six `www/Items/*.webp`, le versionnement et cache dans `index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`, et la documentation. Aucune modification des mécanismes de chargement visuel, de cache persistant, de l'interface, de Home Assistant, OAuth, WebSocket, coffre, biométrie, mode test et safe areas. Le commit v569 ultérieur modifie séparément le cadrage de produits : ce changement ne fait pas partie du lot images v568. **Bilan publié : 277/414 renouvelés, 137 non renouvelés, 16 anciens visuels évalués et conservés distincts, soit au moins 293 produits avec décision documentaire.** Fichiers WebP : 420 ; poids total 9 617 548 octets ; 0 fichier > 100 Kio.

### Audit Maison — passe complète des 45 visuels non renouvelés

**État avant toute nouvelle publication :** version applicative v572, SHA a2d1f42721025a6c199cf2d965ce3644a92eee6a, CI 40410333065 réussie, Pages 40410332283 réussi. La catégorie Maison contient 50 produits, dont 5 déjà renouvelés dans les lots antérieurs (Éponges, Film alimentaire, Gants ménage, Lessive capsules, Papier aluminium). Les **45 autres anciens visuels ont été examinés individuellement**. Il s'agit d'un audit, **pas d'un lot v573 publié**.

**Deux candidats préparés, NON PUBLIÉS :** Essuie-tout et Papier toilette, images originales créées dans ChatGPT sans appel à l'API OpenAI payante du projet, et encodées en WebP autonomes 384 × 384 px sur fond alpha transparent. Aperçus locaux sur fond sauge à 192 px vérifiés. Les fichiers préparés ne sont pas encore dans Git, et leur rendu sur un véritable iPhone ainsi que la CI d'un futur lot restent à vérifier.

| Produit | Ancien fichier | Candidat local | Statut |
| --- | ---: | ---: | --- |
| Essuie-tout | 2 552 octets | 10 154 octets | Préparé, non publié |
| Papier toilette | 3 236 octets | 13 554 octets | Préparé, non publié |
| Total potentiel | 5 788 octets | 23 708 octets | Aucun remplacement sur main |

**Déjà suffisamment net et fidèle (deux conservations supplémentaires)** : Papier cadeau (rouleau illustré fidèle, 24 190 octets) et Lave-glace (bidon bleu net, 24 392 octets). Ces fichiers ne sont ni remplacés ni comptés comme renouvelés. **Les 41 autres anciens visuels inspectés restent inchangés**, notamment ceux qui possèdent déjà le bon conditionnement mais demandent une meilleure source avant publication : les rouleaux de sacs-poubelle 30L/50L ne sont pas des sacs remplis, les tablettes lave-vaisselle restent des tablettes, les lingettes ménagères ne deviennent pas des lingettes médicales et les chiffons doivent rester des textiles. L'absence de remplacement ne signifie pas automatiquement que ces 41 vignettes sont de qualité finale satisfaisante.

**Pistes rejetées** : une nouvelle planche de dix produits ménage produite dans ChatGPT n'est pas conforme (artefacts, bruit de fond, halos et transparence incertaine) ; aucune extraction ni publication de ces dix visuels n'est autorisée. Les alternatives sous licences tierces ne sont pas intégrées sans vérification individuelle de fidélité et d'alpha.

**Liste complète des 43 produits contrôlés autres que les deux candidats** : Bicarbonate, Désinfectant, Détartrant, Éponges magiques, Javel, Lingettes ménage, Nettoyant multi-usages, Nettoyant salle de bain, Nettoyant sol, Nettoyant vitres, Nettoyant WC, Vinaigre ménager, Pile AAA, Piles AA, Adoucissant, Amidon, Désodorisant textile, Détachant, Filet de lavage, Lessive liquide, Lessive poudre, Lingettes anti-décoloration, Nettoyant machine à laver, Pinces à linge, Sacs linge délicat, Mouchoirs, Papier cadeau, Papier cuisson, Sacs congélation, Sacs poubelle 30L, Sacs poubelle 50L, Sacs zip, Serviettes papier, Essuie-verres, Grattoirs, Liquide rinçage, Liquide vaisselle, Nettoyant lave-vaisselle, Produit inox, Sel lave-vaisselle, Tablettes lave-vaisselle, Torchons et Lave-glace.

**Comptage sans double compte** : les 16 anciens produits évalués et conservés dans l'audit précédent restent distincts des 277 renouvelés ; Papier cadeau et Lave-glace ajoutent 2 décisions de conservation indépendantes. Il existe donc **au moins 18 évalués et conservés distincts**, soit **au moins 295 produits ayant une décision définitive documentée (277 renouvelés + 18 conservés)**. Les autres vignettes auditées mais non remplacées peuvent rester en attente d'amélioration et ne sont pas comptées comme des renouvellements.

**Écart d'inventaire expliqué** : les six anciens WebP orphelins supprimés entre v569 et v572 sont croquettes-chat.webp, croquettes-chien.webp, friandises-animaux.webp, litiere-chat.webp, patee-chat.webp et sacs-dejections.webp. Tous étaient hors du catalogue actuel. Le compteur correct est désormais **414 WebP pour 414 produits**, poids total **9 591 672 octets**, zéro produit sans fichier, un fichier > 100 000 octets et aucun > 102 400 octets. Le bilan des renouvellements reste **277/414**, avec **137 non renouvelés**. Ce suivi documentaire ne nécessite aucun incrément de version.


### Lot v578 — 4 visuels publiés, contrôlés et validés sur `main`

**Publication confirmée :** [commit `8df80edc07d6ee52de84648ba16224bbf67a97bf`](https://github.com/fabien95430/Dashboard-course/commit/8df80edc07d6ee52de84648ba16224bbf67a97bf), [PR #94 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/94). [CI préalable PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40415243260), [CI `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40415363854), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40415362833). Empreintes Git des quatre WebP, dimensions, taille du dossier et SHA de `main` vérifiés. Base de travail : `fc7f6074622a11769af1392ee97eeb979d168b6b`. Quatre remplacements sélectionnés pour l'identité exacte et la qualité à 192 px, sans toucher aux images déjà renouvelées. Sources, licences, tailles et SHA : `docs/IMAGE_CREDITS_V578.md`. Dinde représentée **crue** et levure boulangère **fraîche**, sans substitution de variante ; Essuie-tout et Papier toilette sont deux rouleaux distincts. Aucun recours à l'API OpenAI payante.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Maison | Essuie-tout | 2552 | 10154 |
| Maison | Papier toilette | 3236 | 13554 |
| Viandes & poissons | Dinde | 3648 | 9400 |
| Cuisine | Levure boulangère | 3152 | 9540 |
| **Total** | **4 WebP** | **12 588** | **42 648** |

**Candidats rejetés :** la planche de ménage à fond et halos non conformes ; la pâte feuilletée cuite proposée au lieu de pâte crue ; la saucisse fumée à la place de merguez crue ; toute source moins précise ou d'un autre produit. Les anciennes images fidèles restent en place. **Résultat réel publié : 281 renouvelés, 133 non renouvelés, au moins 18 évalués et conservés distincts**, soit au moins 299 produits avec une décision de renouvellement/conservation. Le répertoire compte **414 WebP, 9 621 732 octets**. **Quatre nouveaux WebP, zéro candidat incorrect publié** ; les rejets sont documentés ci-dessus. Restent prioritaires : Maison, Hygiène & soins, Petit-déjeuner, Boissons et les références Viandes & poissons dont les variantes doivent être exactes.

**Périmètre** : quatre WebP, marqueurs v578 cohérents dans `index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`, ce suivi et crédits. Aucun CSS, navigation, taille/position des tuiles, bannière citrons, sécurité, HA, OAuth, WebSocket, coffre, verrouillage, biométrie, mode test ni logique de cache visuel modifiés.



### Lot v582 — 8 nouveaux WebP publiés et vérifiés

**Publié sur `main` :** commit [`6c18a389cd3f5c9ad62793b3d7c69f5a6d20bd6f`](https://github.com/fabien95430/Dashboard-course/commit/6c18a389cd3f5c9ad62793b3d7c69f5a6d20bd6f), [PR #95 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/95), [validation préalable PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40420931134), [CI complète sur `main` verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40421036581), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40421036129). Base de préparation initiale v580, puis **rebase obligatoire sur v581** `97149bcb7843f4eeb06b24f8fad729a15455cec7` lorsque `main` a avancé ; la nouvelle logique de fondu des images introduite séparément en v581 a été intégralement conservée. Dernière version du lot : **v582**.

| Catégorie | Produit | Avant (octets) | Après (octets) |
| --- | --- | ---: | ---: |
| Petit-déjeuner | Café moulu | 4216 | 36088 |
| Cuisine | Pépites chocolat | 4574 | 22184 |
| Apéritif & snacks | Brownies | 4344 | 41670 |
| Viandes & poissons | Merguez | 3994 | 28648 |
| Apéritif & snacks | Madeleines | 3824 | 26222 |
| Apéritif & snacks | Crêpes | 4178 | 24638 |
| Boulangerie | Pains hot-dog | 3500 | 19134 |
| Cuisine | Chili | 59028 | 8998 |
| **Total** | **8 WebP** | **87 658** | **207 582** |

**Variation du lot : +119 924 octets.** Les huit fichiers sont des WebP **unitaires** 256 ou 384 px, avec canal alpha et marges vérifiés, au plus 41 670 octets. Les sept créations originales ChatGPT ont été redimensionnées à la baisse depuis 1254 px, recadrées individuellement et inspectées à 192 px sur fonds clair et sombre. Le Chili provient d'[EBf Studio Ingredient Icons](https://github.com/EBf-Studio/ingredient-icons), **CC0 1.0 pour les icônes** : son blob Git natif est `32f4b607dc0ba3b80b2d99206fa99648cf620b19` et sa taille réelle GitHub est **8 998 octets** (correction de deux octets par rapport au comptage préparatoire). Chaque blob final correspond exactement à la source transférée et a été contrôlé dans l'arbre `main`. Provenance, licence, correspondance, dimensions et empreintes de tous les produits : `docs/IMAGE_CREDITS_V582.md`.

**Sélection et rejets :** huit produits anciennement non renouvelés, sans écraser d'autres renouvellements. Merguez reste **crue** et épicée sans traces de cuisson ; Chili est un piment rouge comme l'ancien visuel, jamais une sauce ou un plat. Les planches ménagères à fond opaque/halos, les pots de confiture ouverts, les vinaigres assortis d'accessoires, la pâte feuilletée cuite et les saucisses fumées génériques ont été rejetés. Les images déjà nettes et fidèles (notamment Granola, Sirop d'érable, Papier cadeau, Lave-glace et Pâte brisée) restent inchangées. Le test sur véritable appareil iPhone et Home Assistant n'a pas été effectué ; ne pas le confondre avec les contrôles d'image et la CI.

**Périmètre strict** : 8 WebP de `www/Items/`, versionnage cohérent v582 dans `index.html`, `catalog.js`, `dish-local-images.js` et `sw.js`, crédits et suivi uniquement. Ni les dimensions/emplacements de tuiles, ni le fond/les citrons, ni les animations, ni le cache visuel persistant et sa stratégie de chargement, ni Home Assistant, liste `Courses`, WebSocket, OAuth, coffre chiffré, verrouillage, biométrie, mode test ou safe areas ne sont modifiés.

**Bilan publié après v582 : 289/414 renouvelés (69,8 %), 125 non renouvelés, au moins 18 évalués et conservés distincts, soit au moins 307 décisions documentées.** Les 414 images WebP sont toutes présentes, poids total 9 741 656 octets, aucun fichier au-dessus de 100 Kio. Priorités de poursuite : Maison, Hygiène & soins, Petit-déjeuner, Boissons, puis Viandes & poissons et Cuisine lorsque l'amélioration est certaine.

### Lot v592 — 8 WebP publiés, validés (CI/Pages verts)

Base : `95b11fb4385363c6b97e3fa9452444d77437f422` (v591). Sept illustrations originales ChatGPT et un WebP CC0 EBf Studio. Les huit anciens produits ont été examinés et remplacés dans la **PR #98 fusionnée**. Crédits, poids, dimensions et empreintes : `docs/IMAGE_CREDITS_V592.md`. Poids des huit fichiers 26654 → 138400 octets, variation +111746 octets. Le rendu à 192 px, la transparence réelle et les noms/variantes ont été contrôlés localement. Rejetés : baume lèvres à damier incorporé, planches composites de produits ménagers, alternative Romarin frais moins nette, sources représentant une autre variété ou présentation. Aucune image déjà renouvelée n'est remplacée sans gain. **Publié et confirmé : 297/414 renouvelés, 117 non renouvelés, au moins 18 évalués et conservés distincts.** Aucun changement de UI, HA, sécurité, style, coffre, biométrie ni chargement des images ; seuls les WebP, marqueurs nécessaires de version/cache, crédits et ce suivi sont modifiés.

**Vérification finale v592** : commit réellement publié [`8f2264de`](https://github.com/fabien95430/Dashboard-course/commit/8f2264de4a9596649938103b9e9589110097d757), PR #98 fusionnée, [CI principale verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40429372119), [GitHub Pages vert](https://github.com/fabien95430/Dashboard-course/actions/runs/40429371932). Huit empreintes Git des WebP vérifiées. Nombre total 414 fichiers, 9 853 402 octets, aucun >100 Kio. **Référence du commit de documentation ultérieur : voir main.**

### Préparation du lot suivant — Rasoirs (non publié)

Le visuel actuel de `rasoirs.webp` a été comparé avec une création originale ChatGPT : 2 696 octets, ancienne vignette petite, contre un candidat WebP autonome 384 × 384 px de **11 534 octets**, canal alpha véritable, contrôlé sur fond sauge à 192 × 192 px, Git SHA local `42eb0a5816f63b8f3c9e8bf8235ed424ec15b510`. **Non publié, non compté parmi les renouvelés** ; conserver le fichier actuel sur main jusqu'à un lot cohérent après comparaison finale dans les tuiles. Rejets supplémentaires : premier rasoir à damier opaque intégré, planches composites/infographies générées à la place d'images individuelles. La source peut être réutilisée à partir de l'archive locale de l'intervention correspondante, sans usage de l'API OpenAI payante du projet. Le compteur reste 297/414, 117 non renouvelés, au moins 18 évalués et conservés distincts.


### Audit visuel transversal — 27 octobre 2026 (sans nouveaux WebP)

**Périmètre :** contrôle visuel direct de **54 fichiers déjà présents sur main** dans six catégories, avec comparaison de sources externes candidates et des conditionnements attendus. Ce relevé **n'est pas un lot de renouvellement** : zéro WebP remplacé, zéro changement de l'interface ou du code, zéro version applicative incrémentée par cette note. Les vues ont été inspectées sous leur forme WebP rendue, mais **sans mesure de leur comportement sur un iPhone physique ou dans Ma liste**. Une image correcte par son identité peut encore nécessiter un travail de netteté à 192 px.

| Catégorie | Examinés | Visuel actuel conservé comme fidèle | En attente d'une meilleure image / de contrôle qualité |
| --- | ---: | ---: | ---: |
| Hygiène & soins | 10 | 5 | 5 |
| Petit-déjeuner | 14 | 1 | 13 |
| Boissons | 18 | 2 | 16 |
| Apéritif & snacks | 5 | 1 | 4 |
| Boulangerie | 2 | 0 | 2 |
| Viandes & poissons | 5 | 1 | 4 |
| **Total** | **54** | **10** | **44** |

**Hygiène & soins — conserver :** Alcool 70 (flacon rigide grand format déjà lisible), Antiseptique (petit flacon correct), Baume lèvres (stick exact), Mouchoirs poche (paquet de mouchoirs), Pansements (pansements adhésifs, ne pas remplacer par une bande). Les quatre derniers figuraient déjà dans un audit historique : **ne pas ajouter artificiellement quatre conservations au total précédent**.

**Hygiène & soins — en attente :** Brosses à dents, Crème hydratante, Démaquillant, Protections hygiéniques, Rasoirs. Tous sont identifiables, mais les petites illustrations sont susceptibles de manquer de netteté à 192 px ; **Crème hydratante** est en outre figurée en pot ouvert, à réexaminer au regard de la règle générale du couvercle visible. Aucun visuel de pansements en rouleau, gel médical ou accessoire similaire ne doit remplacer un article d'hygiène différent.

**Petit-déjeuner — conserver :** Sirot d’érable (orthographe du catalogue : « Sirot d’érable »), bouteille ambrée fermée, grand visuel net déjà précédemment jugé supérieur aux alternatives ; **ne pas recompter** si déjà suivi comme conservé.

**Petit-déjeuner — en attente :** Capsules café, Chicorée, Dosettes café, Filtres à café, Infusion camomille, Infusion menthe, Infusion verveine, Matcha, Thé Earl Grey, Thé fruits rouges, Céréales, Thé noir, Thé vert. La plupart sont de petites images dont l'objet général est compréhensible, mais le conditionnement ou la variante exacte ne sont pas tous démontrables à 192 px. Ne pas remplacer Chicorée par une chicorée salade, un sachet d'infusion par une boisson préparée ni du matcha par un produit aromatisé.

**Boissons — conserver :** Rhum (bouteille fermée ambrée grand format) et Ricard (bouteille distincte et identifiable). Leur fidélité visuelle prime sur une source générique, même si elles ne figurent pas parmi les 297 images *renouvelées*.

**Boissons — en attente :** Bière blanche, Bière sans alcool, Prosecco, Vin rosé, Eau aromatisée, Jus de tomate, Jus multifruits, Coca, Coca zéro, Ginger beer, Limonade, Orangeade, Sirop de grenadine, Sirop de menthe, Sirop de pêche, Soda citron. La plupart sont des illustrations très petites de boissons ou de bouteilles. Il faut conserver distinctions gazeux/non gazeux, sans alcool/alcool, sirop/boisson prête à boire, et marque réelle/fictive.

**Apéritif & snacks — conserver :** Kinder Maxi, emballage commercial véritable, net, fidèle à l'article du catalogue. **En attente :** Chips (ancienne illustration marquée « Brest » qui ne satisfait pas l'objectif de visuel générique sans marque inventée), Mini saucissons (petite illustration), Compotes gourdes (gourde et non sachet de jus), Speculos (image détaillée mais présentant des halos de détourage visibles). Une photothèque proposant un sachet gris anonyme pour Chips a été écartée : elle ne permet pas une reconnaissance suffisante.

**Boulangerie — en attente :** Brioche et Pains au chocolat. Les anciens visuels 84 px sont fidèles à la forme, mais un gain de définition est à rechercher avant publication. Ne pas substituer une pâtisserie cuite différente.

**Viandes & poissons — conserver :** Peperroni (nom exact du catalogue), tranches de charcuterie rouge déjà détaillées et reconnaissables. **En attente :** Pâté (pot et préparation à conserver exacts), Poisson pané (bâtonnets panés), Poisson surgelé (filets blancs crus), Saucisses (saucisses crues). Aucun poisson cuit ni saucisse fumée ne doit être publié à la place.

**Sources rejetées durant cette passe :** Photoreal SwisserDev `tonic_water.webp` est strictement identique au WebP déjà utilisé pour Tonic (même SHA Git) ; `lemonade.webp` montre une cruche à tranches de citron plutôt que la limonade conditionnée dans le catalogue ; `cloth.webp` représente un textile gris moins typé torchon que le tissu de cuisine rayé actuel ; `plastic_bag.webp` montre un sac de courses et non un sac zip ; `mineral_water_bottle.webp` n'est pas une eau aromatisée. EBf Studio `en_chicory.webp` montre une salade chicorée, pas la boisson Chicorée. Plusieurs tentatives de génération d'images individuelles ont renvoyé des **infographies fictives** comportant de faux numéros de PR et des chiffres imaginaires : elles sont rejetées, n'ont jamais été importées et **ne constituent aucune publication GitHub**.

**Comptabilisation stricte :** cet audit ne modifie pas les **297/414 produits renouvelés** ni les **117 non renouvelés** du dernier lot réellement publié (v592). Les 10 décisions de conservation ci-dessus chevauchent pour partie celles déjà documentées ; le minimum historique prudent de **18 évalués et conservés distincts** reste affiché sans recomptage non vérifié. Les 44 autres références sont **auditées, non remplacées et non déclarées définitivement satisfaisantes**. Toutes les 54 références restent sur leur blob Git initial. Prochain effort prioritaire : obtenir pour ces 44 références des WebP unitaires avec transparence alpha réelle, variant et conditionnement fidèles, lisibilité à 192 px, source/licence prouvée ; former des lots jusqu'à 30 seulement si le contrôle visuel est positif. Aucun appel de l'API OpenAI payante du projet.


### Audit complémentaire Cuisine, Enfant et Frais — 27 octobre 2026 (sans renouvellement)

**Référence contrôlée avant cet audit :** `main` `b741052c31b3e56760c213a5541f8552017ee508`. Un nouveau lot n'est **pas** publié : 0 WebP modifié, version applicative et cache inchangés. Les **23 images non renouvelées** ci-dessous ont été ouvertes directement depuis leurs blobs Git individuels et comparées avec les variantes attendues du catalogue. La petite résolution de nombreuses anciennes vignettes interdit de déclarer leur qualité finale sur le seul motif que le produit est reconnaissable. Ni iPhone physique ni Home Assistant n'ont été simulés.

| Catégorie | Produits inspectés | Observation / décision |
| --- | --- | --- |
| Cuisine | Champignons en boîte, Petits pois carottes, Raviolis en boîte | Anciennes boîtes métalliques ouvertes : identité fidèle, mais illustrations petites et pas encore jugées assez nettes pour une validation finale à 192 px. |
| Cuisine | Croûtons, Noix de coco râpée, Purée en flocons | Bols dont le contenu correspond globalement aux produits ; définition et adéquation au conditionnement à améliorer, en attente. |
| Cuisine | Lait de coco, Soupes en brique | Conditionnement reconnaissable (boîte de conserve / brique), détails limités à la petite taille ; en attente de visuels plus nets. |
| Cuisine | Pâte feuilletée | Image actuelle fidèle à une pâte CRUE pliée, mais bordures/halo visibles. La source alternative Soft Studio représente une pâte cuite : rejetée. |
| Cuisine | Vinaigre balsamique, Vinaigre de vin | Anciennes petites bouteilles correctement colorées ; alternatives Soft Studio en carafes avec raisins et accessoires non conformes à l'objet unique : rejetées. |
| Cuisine | Vinaigre de cidre | Bouteille ambrée actuelle détaillée mais avec morceaux de pomme et halo ; nouvelle source examinée comporte également pommes et accessoires : rejetée. |
| Cuisine | Confiture fraise, Confiture mirabelles | Bocaux fermés et fruits corrects, textes descriptifs correspondant aux produits plutôt que marques fictives ; encore des bordures/halos à nettoyer si source adéquate. Fraise avait déjà été évaluée et conservée historiquement, ne pas compter deux fois. |
| Cuisine | Coulis de fruit | Bouteille rouge fermée actuelle sans erreur flagrante de couleur, mais ne satisfait pas pleinement au conditionnement en pot/bocal rigide exigé pour les sauces ; ne pas remplacer par une confiture. |
| Enfant | Compotes bébé | Gourde de compote identifiable, illustration très petite ; garder le bon conditionnement et ne pas remplacer par une brique de jus. |
| Enfant | Lait infantile | Boîte de lait en poudre globalement fidèle, illustration petite avec accessoire de dosage ; rechercher une boîte fermée seule. |
| Enfant | Sacs à couches | Petit sac noué correct mais illustration 84 px peu nette ; rechercher meilleure définition du même type de sac. |
| Enfant | Yaourt | Pot existant suffisamment détaillé, mais opercule partiellement ouvert et motif décoratif de vache ; rechercher pot unique avec couvercle fermé et sans faux branding. |
| Frais | Mozzarella râpée, Philadelphia | Mozzarella blanche râpée visuellement fidèle ; Philadelphia correspond à un fromage frais en pot mais son pot est ouvert. L'audit antérieur privilégiait leurs images actuelles faute de mieux : cette passe ne requalifie pas ces conservations historiques. |
| Frais | Pâte à pizza, Cornichon | Pâte à pizza bien crue et centrée, mais léger halo périphérique ; Cornichon en bocal rigide fermé, bonne lisibilité. Ces références ont déjà été évaluées et conservées dans le suivi, aucune nouvelle décision comptée. |

**Rejets de cette passe** : remplacement Pâte feuilletée par une version cuite ; sources de vinaigre balsamique et de vinaigre de vin accompagnées de raisins ; vinaigre de cidre accompagné de quartiers de pommes ; changement de conditionnement du Coulis de fruit vers une confiture ; remplacement de compote ou de soupe par une autre boisson. Ces sources ne sont pas publiées. Une planche composite produite lors de la recherche de nouveaux visuels n'est ni un fichier unitaire exploitable ni un candidat retenu. La piste `Chips` est aussi toujours en attente : un sachet de chips marqué « Brest » ne doit pas être remplacé par un sachet gris vide non reconnaissable.

**Conservations, sans double comptage :** Cornichon, Pâte à pizza, Mozzarella râpée et Philadelphia étaient déjà signalés comme conservés faute d'amélioration prouvée ; Confiture fraise figure également parmi les conservations historiques. Confiture mirabelles a un produit correct, mais l'inspection de ses bords reste nécessaire avant décision esthétique finale. Les autres produits examinés restent en attente d'un meilleur candidat, et aucun n'est compté comme renouvelé ni comme nouvelle conservation définitive.

**Bilan confirmé et inchangé :** 297/414 produits renouvelés, 117 non renouvelés, au moins 18 conservés distincts déjà documentés (minimum prudent, non recalculé depuis les mêmes références). Répertoire : 414 WebP, un par produit. Les 23 inspections complètent l'historique mais **ne doivent pas être additionnées au nombre de produits renouvelés**. Prochaine priorité : sources individuelles pour pots fermés de la rubrique Enfant/Frais, nouvelles illustrations réellement nettes pour les boîtes et boissons, et correction du sachet de chips avec preuve de droits et d'identité. Pas d'API OpenAI payante du projet.


### Lot v594 — 8 nouveaux WebP publiés, validés (CI et Pages réussis)

Base : `fc2be1d6882c59b861c96341d2d6f356a5eda1a5` (version précédente v593). Remplacements sélectionnés : **Chips, Compotes gourdes, Mini saucissons, Brioche, Pains au chocolat, Crème hydratante, Rasoirs et Brosses à dents**, répartis en Apéritif & snacks (3), Boulangerie (2), Hygiène & soins (3). Sources originales ChatGPT, huit fichiers WebP unitaires 384 px, alpha réel et lisibilité à 192 px contrôlés ; aucun usage de l'API OpenAI payante. Aucune image déjà renouvelée réécrite. Détail individuel, SHA, poids et provenance : `docs/IMAGE_CREDITS_V594.md`.

**Comparaison avant/après préparée :** 74 408 → 255 712 octets (**+181 304 octets**), huit fichiers sous 44 Ko. **Publié et vérifié : 305/414 renouvelés, 109 non renouvelés, au moins 18 conservés distincts, soit au moins 323 décisions publiées**. PR #99 fusionnée sur `main` au commit `5f05417543326287620f4cd8cd291403b03afbec` ; validation préalable PR, CI sur main et GitHub Pages réussies ; huit blobs WebP comparés à leurs empreintes attendues dans le véritable inventaire GitHub. Aucun changement de CSS, tuiles, rendu de listes, chargement images, safe areas iOS, Home Assistant, WebSocket, OAuth, coffre, biométrie, mode test. Les tentatives de visuels composites et les sources représentant un produit différent sont rejetées.

**Vérification finale v594 :** [PR #99](https://github.com/fabien95430/Dashboard-course/pull/99) fusionnée, commit publié [5f054175](https://github.com/fabien95430/Dashboard-course/commit/5f05417543326287620f4cd8cd291403b03afbec), [CI de PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40482814985), [CI main verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40482933402) et [Pages vertes](https://github.com/fabien95430/Dashboard-course/actions/runs/40482932685). SHA des huit blobs Git revérifiés unitairement, 414 WebP totalisant **10 034 706 octets**, aucun au-dessus de 102 400 octets. Poids avant/après de ce lot : **74 408 → 255 712 octets**, +181 304 octets. Rejets : sources vives non pertinentes (sachet gris sans chips, objets mélangés, mauvais conditionnement). **Reste : 109 non renouvelés, au moins 18 évalués/conservés distincts**. Test matériel iPhone/HA et test hors ligne réel non réalisés.
