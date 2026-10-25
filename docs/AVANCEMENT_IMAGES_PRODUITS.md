# Suivi de la bascule des visuels produits

**Point d'avancement : 25 octobre 2026.** Dépôt source de vérité : `fabien95430/Dashboard-course`, branche `main`. Cette note décrit un état constaté : relire impérativement le code et `AGENTS.md` au moment de reprendre le chantier.

## Réalisé et vérifié

- Dernière version visible prévue pour le lot : **v553**, sur `main`. La bannière citrons et ses changements jusqu'en v552 restent intacts : aucun CSS, décor ni animation modifié pour ce lot.
- `catalog.js` contient **414 produits** ; `www/Items/` contient **420 images**.
- **197 produits distincts** disposeront d'un visuel remplacé après la publication du dixième lot détaillé ci-dessous ; **217 produits** n'auront pas encore été remplacés par ces lots. **Ces 217 ne sont pas tous nécessairement de mauvaise qualité**.
- La **compression v537** concerne **32 anciens fichiers de plus de 100 Kio**, ramenés de **11,88 Mio à 1,18 Mio** au total. Il reste **0 image produit de plus de 100 Kio**. Poids du répertoire `www/Items/` : **environ 8,67 Mio**.
- **208 images pèseront moins de 10 Kio**, ce qui est un critère de tri, **pas** une preuve de manque de netteté. Vérifier leurs dimensions et l'affichage avant remplacement.
- **Le lot de 30 images initialement préparé en attente a finalement déjà été publié en v539** : ne pas refaire ces 30 fichiers.

### Historique des dix lots de nouveaux visuels

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
| Lot v553 — 30 WebP | Commit de publication à vérifier après validation | 30 |
| **Total** | | **197** |

**Attention :** v537 optimise séparément 32 fichiers existants (dont certains figurent aussi parmi les 197), ne pas additionner les compteurs.

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

Les candidats précédents **Endives** et **Mâche** (320–400 px) sont conservés hors GitHub : le transfert et la comparaison intégrée doivent être vérifiés avant publication. Ils ne sont **pas comptés** comme remplacés. Les olives de la collection Soft Studio ont été rejetées car dénoyautées ; les olives retenues ici sont représentées entières, sans perforation. Aucun visuel de crèmes, épices ou sauces contrevenant à l'obligation du pot fermé n'est modifié.

Version visible : **v550** ; service worker : `courses-app-v550-r1`, sans modification de la stratégie de cache visuel, du mode hors ligne, des animations ou de l'intégration Home Assistant. **Publié sur `main`.** Commit `7fbad781e728543e3c8ee81df03fe1faf125b1b2` — [PR #77 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/77) — [validation complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40239824242) — [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40239824063).

### Lot v553 — 30 visuels produits contrôlés

- **30 remplacements indépendants :** 2 Fruits & Légumes et 28 Frais. Aucun produit déjà remplacé dans les lots antérieurs n'est repris.
- Les WebP sont centrés et transparents : **Endives et Mâche 400 × 400 px**, les 28 autres **320 × 320 px** ; tous ont été inspectés à la taille de rendu 192 px. Suppression des artefacts de fond et contrôle des marges alpha. Les crèmes et produits en pot sont représentés avec couvercle fermé ; les quatre variantes de lait ont un bouchon distinct.
- **Poids de ce lot avant/après : 116 466 → 602 884 octets** (+486 418 octets) ; maximum individuel **39 110 octets**, aucun WebP au-delà de 100 Ko. Total du répertoire après le lot : **9 085 954 octets** (environ 8,67 Mio).
- Visuels générés sans appel à l'API payante du projet ; voir `docs/IMAGE_CREDITS_V553.md`. Aucun sprite/atlas chargé, aucun backend ou polling ; `product-item-images.js` et le cache visuel persistant sont inchangés.
- **Publication :** la validation complète sur la branche de préparation et les contrôles sur `main` doivent être verts avant d'annoncer le lot terminé. Le SHA final sera ajouté au suivi après publication effective.

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

### Situation par catégorie

Comptage des noms des **197 images modifiées** après publication de v553, croisés avec `catalog.js`.

| Catégorie | Déjà remplacés | Encore à évaluer |
| --- | ---: | ---: |
| Fruits & Légumes | 72 / 72 | 0 |
| Frais | 48 / 53 | 5 |
| Viandes & poissons | 23 / 39 | 16 |
| Cuisine | 37 / 71 | 34 |
| Boulangerie | 7 / 13 | 6 |
| Petit-déjeuner | 3 / 24 | 21 |
| Apéritif & snacks | 7 / 24 | 17 |
| Boissons | 0 / 36 | 36 |
| Maison | 0 / 50 | 50 |
| Hygiène & soins | 0 / 25 | 25 |
| Enfant | 0 / 7 | 7 |
| **Total** | **197 / 414** | **217** |

**Fruits & Légumes est terminé : 72 / 72.** Endives et Mâche sont remplacés par deux fichiers WebP individuels conformes. Les cinq produits Frais non encore renouvelés sont Cheddar, Mozzarella râpée, Philadelphia, Pâte à pizza et Cornichon ; conserver les visuels corrects tant qu'un remplacement réellement meilleur n'est pas disponible.

### Attribution et qualité

Les lots v539, v545 et v547 utilisent des WebP transparents ; v539 contient 30 fichiers **320 × 320 px**, environ **445 Kio au total**, provenant de **Soft Studio Ingredients by Alex Wang** (licence **CC BY 4.0**). L'attribution et les 30 correspondances sont déjà inscrites dans **`docs/IMAGE_CREDITS_V539.md`**. Préserver ce fichier et suivre l'attribution pour toute autre source sous licence similaire. Pour v545, les crédits et correspondances figurent dans `docs/IMAGE_CREDITS_V545.md`. Les visuels CC0 utilisés lors d'autres lots ne relèvent pas du même régime. Vérifier la cohérence des liserés clairs de Soft Studio avec le style réel du catalogue avant toute nouvelle génération.

## Blocage CI résolu — état vérifié sur main

- Ancien incident (v540) : le test `tests/list-render-version.test.mjs` exigeait le suffixe `r1` de façon fixe, tandis que `sw.js` était à `courses-app-v540-r2`. La validation avait 234 réussites et un échec.
- Le commit v541 `fbe380fb1efee1439564fc4c57c3d3a953752b15` a rétabli la cohérence globale, sans lot de visuels produits.
- Correctif permanent du test publié sur `main` : `ba40473a7ddeb21d62f69f30e9f1217224b0a016` (PR #74 fusionnée). L'assertion contrôle l'unicité de `CACHE`, l'alignement de version et la révision entière positive, sans imposer artificiellement `r1`. Aucune modification de `sw.js`, de l'interface ou de la sécurité dans ce correctif.
- Version `v542` (`0d463f4261f5e74e512385a42e00b22be6e8eb8f`) : seuls le fondu décoratif, le versionnement et le précache ont changé, **pas les images produits**. Idem pour les versions jusqu'à v544 avant ce lot. Validation GitHub et GitHub Pages sont toutes deux vertes sur ce commit.
- Inventaire à la fin de v542 : **132 / 414 produits renouvelés**, **32 WebP lourds comprimés**, **420 fichiers WebP**, **aucun > 100 Kio**. Les 24 remplacements v545 décrits plus haut interviennent ultérieurement.
- Préparation hors dépôt : une image candidate **Endives** en WebP transparent 400 × 400 px, 17 090 octets, a été réalisée, mais **n'est pas publiée ni comptabilisée**. Les trois produits à évaluer dans Fruits & Légumes restent Endives, Mâche, Olives fraîches. Tout rendu incorrect ou tout contrôle non terminé doit être rejeté.

## Reprise du chantier

1. **Commencer par `main` actuel** : lire `AGENTS.md`, `catalog.js`, `product-item-images.js`, `docs/IMAGES_ITEMS.md`, `docs/IMAGE_CREDITS_V539.md`, `sw.js`, la suite `tests/` et cette note ; vérifier les versions réelles et la dernière CI.
2. **Vérifier que la validation GitHub reste verte** et que les révisions indépendantes du cache demeurent cohérentes. Si d'autres commits arrivent, diagnostiquer le nouvel état et ne pas appliquer de correctif obsolète.
3. Examiner d'abord les **3 Fruits & Légumes restants**, puis **Frais**, **Viandes & poissons**, **Cuisine**, puis les autres catégories. Prioriser le manque de netteté réel plutôt que le seul poids.
4. Préparer des lots **de 30 maximum**, seulement avec des correspondances exactes et des visuels contrôlés : **un produit = un fichier WebP**, fond transparent, produit centré, isolé, rendu semi-réaliste premium cohérent avec les cartes existantes ; lisibilité à **192 × 192 px**, source idéalement **320 à 512 px**, cible généralement **15–60 Kio**, plafond pratique **100 Kio**. **Ne jamais agrandir artificiellement** les anciennes miniatures 84 × 84, inventer une marque, substituer un autre produit ou réutiliser des planches d'images.
5. Conserver noms et slug attendus `www/Items/<slug>.webp`, catalogue `catalog.js`, liste HA `Courses` prioritaire, synchronisation WebSocket événementielle, OAuth, coffre chiffré, verrouillage, biométrie, iOS safe areas, fonctionnement offline et architecture HTML/CSS/JS statique + GitHub Pages + HA. **Pas de framework, backend, polling ni API OpenAI payante du projet.**
6. Protéger l'interface validée : **ne pas modifier la bannière citrons actuellement utilisée (`www/list-header-citrons-v544.webp`)**, les emplacements des éléments, l'effet des barres, ni le badge de version **visible uniquement dans Réglages** (les marqueurs HTML des trois vues restent présents).
7. Valider chaque image : identité, dimensions, transparence, poids, cadrage et rendu à taille réelle ; comparer ancien/nouveau ; consigner la licence et son crédit. Remplacer les images uniquement si elles sont meilleures.
8. Préparer **un seul commit atomique** pour un lot prêt, mettre à jour le versionnement/cache selon **les règles courantes d'AGENTS.md**, vérifier que `main` n'a pas bougé, lancer la validation complète, contrôler GitHub Pages, puis **actualiser ce document après la publication réelle**.

**Lot v545 publié et vérifié.** Commit : `88465389b15eaa5c237fed273a324374ed556530` ; PR #75 fusionnée ; [validation CI verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40236407821) ; [déploiement GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40236406903).

**Lot v547 publié et vérifié.** Commit produit : `3bed1dab866ec7966a56400afd74f8e8b8b5f01e` ; [PR #76 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/76) ; [validation complète verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40238201170) ; [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40238200704).
