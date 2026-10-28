# Suivi de la bascule des visuels produits

**Point d'avancement : 28 octobre 2026.** Dépôt source de vérité : `fabien95430/Dashboard-course`, branche `main`. Cette note décrit un état constaté : relire impérativement le code et `AGENTS.md` au moment de reprendre le chantier.

## Correction de décompte et file anti-doublons (28 octobre 2026)

**État corrigé : 355 / 414 renouvelés distincts (85,7 %), 59 non renouvelés.** La relecture des 84 anciens slugs montre que **Miel** avait déjà été renouvelé en v534 et a été de nouveau remplacé en v614 ; il ne devait pas être compté comme nouveau produit distinct dans le total v614-v616. Les chiffres des lots ci-dessous restent l'historique tel que publié ; **la correction ici prévaut** pour les reprises et les bilans.

**File de reprise unique : [`docs/REPRISE_IMAGES_PRODUITS_20261028.md`](REPRISE_IMAGES_PRODUITS_20261028.md)**. Elle classe les 59 anciens WebP sans réaudit et évite de rouvrir les produits déjà renouvelés/conservés. Aucun nouveau candidat conforme n'a été publié pendant cette consolidation ; aucune modification de fonctionnalité ni d'image.

## Lot v637 — Sel lave-vaisselle et Vinaigre ménager (publication conditionnelle)

**Base Git :** `aabb502711944952a1b8d71cd5c74e25e1bdeef6` (v636). Deux nouveaux WebP unitaires transparents **320 × 320 px** pour Sel lave-vaisselle et Vinaigre ménager, issus de rendus originaux locaux avec cadrage centré, sans logo ni texte ajouté. Comparaison ciblée des anciens visuels 84 × 84 px avec les nouveaux, et contrôle du rendu de ces nouveaux fichiers à 192 px sur fonds blanc et sauge. Contrôles d'alpha, dimensions et transparence des quatre coins ; blobs et SHA-256 dans `docs/IMAGE_CREDITS_V637.md`.

**Après publication, CI et Pages validées (projection)** : 368 / 414 renouvelés distincts (88,9 %), 46 non renouvelés dont 41 conservés et 5 toujours ouverts. Aucun changement des images déjà renouvelées ou des 41 conservations ; aucune modification fonctionnelle. La suite GitHub est impérative avant de compter ce lot comme publié.

## Six produits supplémentaires conservés — état à jour au 28 octobre 2026

**366/414 visuels distincts renouvelés (88,4 %), 48 non renouvelés, dont 41 conservations documentées et 7 références sans candidat conforme.** Les 6 nouvelles conservations — Confiture fraise, Piles AA, Grattoirs, Thé noir, Poisson pané, Saucisses — n'ont pas modifié leurs anciens WebP ; voir `docs/REPRISE_IMAGES_PRODUITS_20261028.md` pour les blobs vérifiés. Certaines anciennes vignettes sont encore à 84 px et ne sont pas présentées comme des remplacements haute définition. Ce complément est **uniquement documentaire** : aucune image, fonction, version/cache ou API payante modifiée.

## Lot v629 — six visuels produits unitaires contrôlés (publication conditionnelle)

**Base :** `4c90dc80fd4fe3a1e6e2c9525a290f29e50cabb0` (v628), aucun des six slugs concernés n'a été renouvelé dans les 360 références précédemment publiées. **6 nouveaux WebP** : Sacs congélation (boîte contenant un sachet zip), Prosecco (bouteille fermée pétillante), Vin rosé (bouteille rosée fermée), Démaquillant (flacon liquide fermé), Protections hygiéniques (paquet scellé), Bière blanche (bouteille capsulée de bière de blé). Générations ChatGPT natives, détourages PNG RGBA traités individuellement, WebP alpha **384 × 384 px**, cadrage 90 %, vérification à **192 px blanc/sauge** et confrontation aux anciens conditionnements. Pas de source externe payante, de collage ni d'élément marque fictive.

**Projection conditionnelle : 366/414 produits distincts renouvelés (88,4 %), 48 non renouvelés = 35 conservés + 13 en attente de candidat supérieur.** Validation et publication effectives à confirmer sur SHA CI/main/Pages avant de remplacer le mot « projection » par « publié ». Documentation de provenance et empreintes : `docs/IMAGE_CREDITS_V629.md`. Les anciens bilans restent inchangés pour la traçabilité.

## Lot v627 — 1 WebP et 7 conservations ciblées (publication conditionnelle)

Depuis `main` `b23d35947166b9d6ac8d3a7e8f6edfd74f2ed7a8` (v625), remplacement de `poisson-surgele.webp` par un filet de poisson blanc cru 320×320 à canal alpha natif, source Soft Studio Ingredients (Alex Wang), CC BY 4.0, repris bit pour bit (source Git blob `dcb369519993123da7ba252ac991ac4572bedb1f`). Voir `docs/IMAGE_CREDITS_V627.md`. Sept anciens visuels sont définitivement conservés, sans changement binaire ni nouveau comptage : Coco râpée, Petits pois carottes, Désinfectant, Lingettes ménage, Mouchoirs, Céréales et Pâté.

**Projection conditionnelle** après validation et publication : **360/414** renouvelés distincts, **54 non renouvelés** (35 conservés ; 1 défaut ciblé ; 18 sans candidat conforme). Ne pas comptabiliser avant vérification SHA, CI et Pages. Aucun module fonctionnel ou cache visuel modifié.

## Lot v623 — quatre produits à valider

Quatre illustrations originales unitaires et transparentes 384×384 proposées depuis la base b5e7ad27989b56076a38b8ea553d9d38ff6572f2 (v622) : Nettoyant lave-vaisselle, Nettoyant machine à laver, Détachant, Purée en flocons. Seules ces quatre images étaient dans les 59 références restantes, sans double comptage. **Projection après fusion et tests : 359/414 distincts renouvelés (86,7 %), 55 non renouvelés ; 28 conservés, 1 défaut ciblé et 26 sans nouveau candidat.** Détails : `docs/IMAGE_CREDITS_V623.md` et file `docs/REPRISE_IMAGES_PRODUITS_20261028.md`. L'historique v616 et antérieur est préservé. Statuts CI/Pages à confirmer avant de marquer le lot publié.

## Réalisé et vérifié

- **Lot v616 — 6 nouveaux WebP unitaires préparés pour validation PR (28 octobre 2026)** : Vinaigre de cidre (bouteille fermée, pomme sur l'étiquette sans fruit extérieur), Vinaigre balsamique (bouteille sombre), Jus de tomate (bouteille fermée), Soda citron (canette fermée), Thé vert (boîte métallique fermée) et Matcha (poudre dans un bol unique). Vrais fonds alpha, 384×384 et comparaisons à 192 px sur blanc et sauge. Base `b266594bb178da6d0b031345dc14ab9904d2c588` (v615). **Après fusion et validation : 356/414 renouvelés distincts, 58 non renouvelés, au moins 24 conservés, au moins 380 décisions documentées**, 414 WebP totalisant **10 438 462 octets**. Sources, poids et SHA256 : `docs/IMAGE_CREDITS_V616.md`. Statut PR/CI/Pages à confirmer avant de considérer ce lot publié.

- **Lot v615 — 6 nouveaux WebP unitaires préparés pour validation PR (28 octobre 2026)** : Filet de lavage (vrai maillage et fermeture), Champignons en boîte (boîte scellée), Lait de coco (boîte scellée), Amidon (aérosol textile), Désodorisant textile (flacon pulvérisateur) et Croûtons (sachet fermé). Visuels 384×384 avec alpha réel, un produit autonome, sans marque ni texte, contrôlés à 192 px sur fonds blanc et sauge. Base Git `bae0c40fa48a203f9ce5636b07c040bee1143a36` (v614). **Après fusion et validation : 350/414 renouvelés distincts, 64 non renouvelés, au moins 24 conservés, au moins 374 décisions documentées**, 414 WebP totalisant **10 399 070 octets**. Provenance et SHA256 : `docs/IMAGE_CREDITS_V615.md`. PR [#109](https://github.com/fabien95430/Dashboard-course/pull/109) fusionnée, commit [b266594b](https://github.com/fabien95430/Dashboard-course/commit/b266594bb178da6d0b031345dc14ab9904d2c588), [CI PR](https://github.com/fabien95430/Dashboard-course/actions/runs/40680688901), [CI main](https://github.com/fabien95430/Dashboard-course/actions/runs/40680791038) et [GitHub Pages](https://github.com/fabien95430/Dashboard-course/actions/runs/40680789714) réussis. **Lot v615 PUBLIÉ et validé.**

- **Lot v614 — 6 WebP unitaires supplémentaires :** Miel fermé, Papier cuisson, Nettoyant sol, Raviolis en boîte, Soupes en brique, Bicarbonate (images originales ChatGPT avec canal alpha, 384×384 px, vérifications 192 px blanc/sauge). Base `05b812caad19136e5dcfeea7d6836affebbe38cc` v613. **Après fusion : 344/414 renouvelés distincts, 70 non renouvelés, au moins 24 conservés distincts, au moins 368 décisions distinctes**, 414 WebP / **10 304 632 octets**. Détail, provenance, SHA-256 : `docs/IMAGE_CREDITS_V614.md`. CI `main` réussie [40672247961](https://github.com/fabien95430/Dashboard-course/actions/runs/40672247961) et GitHub Pages réussi [40672247683](https://github.com/fabien95430/Dashboard-course/actions/runs/40672247683), constatés le 28 octobre 2026.

- **Lot v613 — 6 visuels unitaires renouvelés :** Yaourt, Pâte feuilletée, Confiture mirabelles, Speculos, Pile AAA et Granola (ChatGPT original, alpha 384×384, contrôle à 192 px blanc/sauge). Base `b5f5a896adcb505821ba57e1a2c8321622f08fdd`. **Après fusion : 338/414 renouvelés distincts, 76 non renouvelés, au moins 24 conservés et au moins 362 décisions distinctes**, 414 WebP / **10 274 160 octets**. Vinaigre de cidre : ancien conservé, candidat bouteille anonyme rejeté. Aucun double comptage Coulis/Philadelphia v612. Crédits, poids et SHA256 : `docs/IMAGE_CREDITS_V613.md`. Vérifier CI PR, CI main et Pages avant de considérer la publication confirmée.

- **Lot v612 PUBLIÉ et validé par PR #106** : deux visuels unitaires préparés, `Coulis de fruit` (bocal rigide fermé, sauce lisse rouge) et `Philadelphia` (pot ovale fermé) ; origine : génération native ChatGPT, 384×384 px alpha réel, 192 px blanc et sauge. **PUBLIÉ : fusion `6eddd29951e6a2e3cdc953aeeafb5f4cf3693622`, CI PR/main et GitHub Pages réussis.** Après publication validée : **332 renouvelés distincts / 414**, **82 non renouvelés**, **au moins 24 conservés**, **au moins 356 décisions finales**, poids WebP **10 471 634 octets**. Aucun autre fichier WebP réimporté ; aucune API OpenAI payante.
- Dernier lot d'images publié **v606** sur `main`, [commit `7d8e0ef9929a28e039dd2351129f8764122d9c3e`](https://github.com/fabien95430/Dashboard-course/commit/7d8e0ef9929a28e039dd2351129f8764122d9c3e), [PR #105 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/105), [CI réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40590484112) et [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40590483377). Neuf visuels unitaires publiés : Détartrant, Nettoyant salle de bain, Liquide rinçage, Sirops Grenadine/Menthe/Pêche et Infusions Camomille/Menthe/Verveine. Les lots antérieurs restent consignés ci-dessous et dans `docs/AVANCEMENT_IMAGES_PRODUITS_V606.md`.
- `catalog.js` contient **414 produits** ; `www/Items/` contient désormais **414 WebP**, un par produit et sans fichier manquant. Les six images supplémentaires de l'ancien comptage étaient des fichiers orphelins hors catalogue, supprimés lors des travaux ultérieurs.
- **330 produits distincts** réellement renouvelés après v606 ; **84 produits** non renouvelés, dont **au moins 24** évalués et conservés distincts. **Au moins 354 décisions définitives** de remplacement/conservation documentées (sans double comptage) ; **au plus 60** références sans décision. Historique du recalcul et contrôles dans le suivi.
- La compression v537 concernait 32 fichiers historiquement lourds. À la version antérieure v592, **0 image au-dessus de 100 Kio (102 400 o)** ; une seule dépasse 100 000 octets : `romarin-frais.webp` à 100 866 octets, volontairement conservée car les alternatives testées étaient moins fidèles. Poids de `www/Items/` : **10 478 438 octets pour 414 fichiers WebP** ; aucune image manquante.
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


### Contrôle des 91 WebP non modifiés — 27 octobre 2026 (aucun nouveau visuel)

**Base réelle de l'inspection :** main `36bbcdcca93c01793865fec2ee9a59d3b1a2e074`, version applicative **v595** (refonte Réglages publiée indépendamment des images) ; sa [CI](https://github.com/fabien95430/Dashboard-course/actions/runs/40486258629) et ses [Pages](https://github.com/fabien95430/Dashboard-course/actions/runs/40486257620) sont réussies. Le dernier **lot images** reste v594. Aucun WebP n'a été modifié par cette passe.

**Mesure sans inflation des remplacements :** les deux comparaisons GitHub `ff3de3a9ea8eab776f20c8d3ef95507e0ff83700` (parent du pilote v528) → `a6e9fa8b70c43c3c382fdbf0a41103da7ffdcc69` (v557), puis ce dernier → `36bbcdcca93c01793865fec2ee9a59d3b1a2e074` détectent **91 WebP du catalogue qui n'ont jamais été modifiés** pendant cette période. Ce ne sont PAS tous les non-renouvelés : d'autres anciens WebP ont été compressés techniquement en v537 sans être considérés comme nouvellement illustrés. Le bilan métier issu des lots reste **305 renouvelés / 109 non renouvelés**. Les comparaisons sont scindées pour éviter la limite GitHub de 300 fichiers par diff.

| Catégorie | WebP encore identiques à leur état antérieur à v528 |
| --- | ---: |
| Maison | 39 |
| Boissons | 16 |
| Petit-déjeuner | 13 |
| Cuisine | 10 |
| Hygiène & soins | 6 |
| Viandes & poissons | 4 |
| Enfant | 3 |
| Apéritif & snacks, Boulangerie, Frais, Fruits & Légumes | 0 |
| **Total** | **91** |

Les rubriques à zéro peuvent encore contenir des produits **non renouvelés** compressés en v537 (exemples : Kinder Maxi, Speculos, Pâte feuilletée). Le tableau indique une absence de changement Git, **pas** la validation graphique d'un produit et ne doit pas être soustrait à nouveau des 109.

**Contrôles individuels et candidats rejetés :** source CC0 SwisserDev `cooking_ingredients/vinegar_bottle.webp` = vinaigre alimentaire ambré, pas le vinaigre ménager ; source CC BY Soft Studio `images/sausage.webp` = saucisses cuites, non des saucisses crues ; source CC0 SwisserDev `food/raw_fish.webp` = poisson entier, non filets blancs crus de Poisson surgelé ; source CC0 SwisserDev `drink/juice_carton.webp` = jus d'orange en brique, non Jus multifruits. L'alternative de céréales `grape-nut-cereal.webp` est une variété spécifique en tas et non le bocal actuel ; `herbal_infusion.webp` est une théière pleine plutôt qu'un sachet ou des feuilles ; `en_chicory.webp` est une salade plutôt que la boisson Chicorée. Une génération visuelle a retourné une planche de produits du lot précédent au lieu des références demandées : **rejetée** et jamais utilisée. Aucun de ces visuels n'a été intégré.

**Conservation supplémentaire constatée : Piles AA (Maison).** L'ancien WebP à 26 788 octets présente quatre piles AA détaillées, un conditionnement pluriel cohérent avec l'article, des contours et une netteté satisfaisants. La marque figurant sur la photographie est une marque réelle, pas inventée ; ce n'est pas une commande de substitution ni un nouveau WebP. Le précédent inventaire citait Piles AA parmi les images inspectées mais ne l'ajoutait pas aux **18 conservées distinctes** : elle porte le **minimum documentaire à 19**. Elle reste comptée parmi les 109 non renouvelées, sans modifier leur total. `Pile AAA` demeure à réévaluer quant au halo de détourage.

**Résultat réel de cet audit :** **0 image publiée**, **0 fichier applicatif modifié**, aucun changement de version/cache demandé. **305/414 renouvelés, 109 non renouvelés, au moins 19 évalués et conservés distincts, au moins 324 produits avec décision de remplacement/conservation.** Les candidats invalides sont explicitement rejetés pour respecter cru/cuit, variété, conditionnement, fond transparent et fidélité à 192 px. Le vrai rendu sur iPhone et Home Assistant reste non testé. Les priorités sont les anciens petits visuels de Maison, Boissons, Petit-déjeuner, Hygiène & soins et Viandes & poissons ; aucune API OpenAI payante du projet utilisée.


 
### Lot v596 — 2 WebP unitaires publiés et validés (CI et Pages verts)
 
**Référence :** `bf567cf0bdde6ee9abd0ea617de75bdc102249e7` (v595). Deux anciens produits non renouvelés : **Coca** (Boissons, 2488 → 8098 octets) et **Vinaigre de vin** (Cuisine, 2780 → 8936 octets). Poids total **5268 → 17034 octets** (+11766). Sources CC0 et Git blob vérifiés, 256 × 256 px natifs, VP8X/ALPH, noms et variantes comparés. Crédits exhaustifs dans `docs/IMAGE_CREDITS_V596.md`. Aucun autre produit modifié, aucune image existante déjà renouvelée redéployée. Choix de deux fichiers seulement faute d'autres correspondances fiables : pas de remplissage artificiel avec une variante incorrecte. Les sources refusées et leurs motifs figurent dans les crédits.
 
**PUBLIÉ ET REVÉRIFIÉ** : commit main [ee9d72d5a16c8af1c5fbe7b1a557e16550bcb766](https://github.com/fabien95430/Dashboard-course/commit/ee9d72d5a16c8af1c5fbe7b1a557e16550bcb766), [PR #100 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/100), [CI PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40490060755), [CI main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40490167213), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40490167242). Les deux SHA binaires correspondent exactement aux deux sources CC0 validées : Coca `b952fd1df813854f99745bef54ad151539cfc80e` et Vinaigre de vin `0123592060e8ef6e07a2410715e00683c8a032a5`. **307/414 produits renouvelés, 107 non renouvelés, au moins 19 conservés distincts** ; 414 WebP, **10 046 472 octets**. Les 2 nouveaux WebP portent la hausse de 5 268 à 17 034 octets, variation +11 766 octets. La CI et Pages ont été recontrôlés sur le SHA publié, mais le test sur iPhone physique et le comportement hors ligne réel ne sont pas revendiqués. Périmètre de code limité aux marqueurs v596 de `index.html`, `catalog.js`, `dish-local-images.js` et `sw.js` ; pas de changement de logique, CSS, tuiles, HA, WebSocket, OAuth, coffre, verrouillage, biométrie ou safe areas.


### Lot v599 — 1 visuel initialement préparé : Capsules café (publication ensuite confirmée ci-dessous)

Référence : `ab80641bb9faf975697917e2eb836e3113f01588` (version v598). Une **seule image unitaire** a passé la validation complète à 192 px : **Capsules café** (Petit-déjeuner) 3 438 → 20 282 octets, soit +16 844 octets. Génération originale ChatGPT, WebP RGBA 384 × 384 px, transparence vérifiée, marge et SHA Git `9db78238e81fdf5e88b8cdf889794fb3b55f3f16`. Détails des crédits et candidats rejetés : `docs/IMAGE_CREDITS_V599.md`. Les sources incorrectes ou à fond opaque ne sont pas publiées, ce qui justifie exceptionnellement la taille de ce lot.

**PRÉPARÉ sur branche, NON ENCORE PUBLIÉ :** la CI PR, la fusion sur main et Pages sont à confirmer. En attendant : **307/414 images renouvelées, 107 non renouvelées, au moins 19 évaluées/conservées distinctes**. Objectif après publication vérifiée : 308/414 renouvelées, 106 non renouvelées, 19 conservées au moins ; poids du dossier estimé 10 063 316 octets pour 414 WebP. Un seul commit atomique application+WebP+crédits+version, aucun changement des tuiles, CSS, navigation, OAuth, HA, WebSocket, coffre, verrouillage, biométrie, safe areas ou stratégie de chargement. Un test physique iPhone et un test réseau hors ligne ne sont pas revendiqués.


### Vérification réelle de la publication v599 et audit individuel du stock ancien — 27 octobre 2026

**PUBLIÉ :** [PR #101 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/101), commit `1f316be8decff585ff9c90b46ff3095de046ca6a` sur `main`, [validation `success`](https://github.com/fabien95430/Dashboard-course/actions/runs/40517689292) et [GitHub Pages `success`](https://github.com/fabien95430/Dashboard-course/actions/runs/40517688543). Le blob `www/Items/capsules-cafe.webp` correspond à `9db78238e81fdf5e88b8cdf889794fb3b55f3f16` (20 282 octets, v599). Il n'est plus en attente : **1 nouvelle image publiée en v599**, non réimportée lors de cet audit. Poids réel `www/Items/` : **10 063 316 octets / 414 WebP**, aucun manquant. Version visible et cache : **v599**.

**Rectification du cumul :** les totaux historiques de lots comptaient **cinq seconds remplacements du même produit** comme des références nouvelles : `Curry`, `Paprika`, `Poivre`, `Sel` et `Sauce soja` (première publication v534, nouvelle publication v560/v562/v563/v564). Les **308 interventions cumulées** à v599 portent donc sur **303 produits réellement distincts**. Bilan exclusif reconstitué depuis les arbres Git et les commits : **303 renouvelés distincts + 111 non renouvelés = 414**, dont **au moins 19 évalués et conservés** parmi les 111, soit **au moins 322 décisions finales distinctes**. Les 297 du tableau des lots antérieur à v594 désignent des opérations, **292 produits distincts**. Cette rectification ne modifie ni les fichiers existants ni leur qualité.

**Contrôle des images non renouvelées :** comparaison du commit antérieur au pilote v528 `ff3de3a9ea8eab776f20c8d3ef95507e0ff83700`, du parent de compression v537 `5d69ab4793a56a34bba2403bd05a41edd5c1321a`, de v537 `84c75d78eb0862d99a5d91469fbf429b2aaa9051` et du main v599. **88 images ont exactement le blob initial** ; **23 ont uniquement reçu la compression v537 sans remplacement de sujet**. Les 111 aperçus originaux ont été examinés unitairement. Cet examen sert à identifier la fidélité et les défauts apparents ; il ne remplace pas une validation physique à 192 px sur fonds blanc/sauge ni un test hors ligne. Les 19 conservations définitives du suivi sont maintenues sans augmentation automatique. Toutes les autres images demeurent en place en attente d'un candidat démontrablement meilleur, pas nécessairement jugées mauvaises.

**Rejets complémentaires :** génération composite multi-produits au lieu d'une image indépendante (Dosettes café, Filtres à café) ; nouvel essai représentant une capsule métallique à la place d'une dosette papier, avec arrière-plan non transparent ; alternatives CC0 incorrectes : `ginger_ale` ne démontre pas Ginger beer, `soda_bottle` ne démontre pas Coca zéro, `juice_carton` ne représente pas Jus multifruits, `fish_fillet` contient une planche/décor, `antiseptic_wipes` ne représente pas des lingettes ménage, `drain_cleaner` ne démontre pas Détartrant, `lemonade` est un pichet plutôt qu'une limonade embouteillée. **0 de ces propositions intégré.** Source inspectée : SwisserDev/fivem-icons-photoreal (CC0 selon le suivi existant). Pas d'API OpenAI payante. Les candidat(e)s non conformes sont REJETÉS ; les WebP correspondants restent EN ATTENTE, pas PUBLIÉS.

**Inventaire nominatif des 111 WebP examinés et non renouvelés.** « Maintenu » = ancien fichier laissé intact, **pas** une nouvelle conservation finale. Les poids proviennent du vrai arbre Git v599, pas d'une estimation.

| Catégorie | Produit | Fichier | Octets | Historique | Décision actuelle |
|---|---|---|---:|---|---|
| Apéritif & snacks | Kinder Maxi | `kinder-maxi.webp` | 22038 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Apéritif & snacks | Speculos | `speculos.webp` | 67434 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Bière blanche | `biere-blanche.webp` | 2578 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Bière sans alcool | `biere-sans-alcool.webp` | 2028 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Coca zéro | `coca-zero.webp` | 2442 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Eau aromatisée | `eau-aromatisee.webp` | 2798 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Ginger beer | `ginger-beer.webp` | 2476 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Jus de tomate | `jus-de-tomate.webp` | 3674 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Jus multifruits | `jus-multifruits.webp` | 4114 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Limonade | `limonade.webp` | 2346 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Orangeade | `orangeade.webp` | 2566 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Prosecco | `prosecco.webp` | 2682 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Rhum | `rhum.webp` | 18284 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Ricard | `ricard.webp` | 22006 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Sirop de grenadine | `sirop-de-grenadine.webp` | 2220 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Sirop de menthe | `sirop-de-menthe.webp` | 2306 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Sirop de pêche | `sirop-de-peche.webp` | 2330 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Soda citron | `soda-citron.webp` | 2346 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boissons | Vin rosé | `vin-rose.webp` | 3046 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Boulangerie | Pâte brisée | `pate-brisee.webp` | 26696 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Champignons en boîte | `champignons-en-boite.webp` | 4744 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Confiture fraise | `confiture-fraise.webp` | 50636 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Confiture mirabelles | `confiture-mirabelles.webp` | 52662 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Coulis de fruit | `coulis-de-fruit.webp` | 25910 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Croûtons | `croutons.webp` | 4588 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Lait de coco | `lait-de-coco.webp` | 3304 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Noix de coco râpée | `noix-de-coco-rapee.webp` | 4028 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Pâte feuilletée | `pate-feuilletee.webp` | 59958 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Petits pois carottes | `petits-pois-carottes.webp` | 4680 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Purée en flocons | `puree-en-flocons.webp` | 4004 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Raviolis en boîte | `raviolis-en-boite.webp` | 4672 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Soupes en brique | `soupes-en-brique.webp` | 4152 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Vinaigre balsamique | `vinaigre-balsamique.webp` | 2390 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Cuisine | Vinaigre de cidre | `vinaigre-de-cidre.webp` | 35956 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Enfant | Compotes bébé | `compotes-bebe.webp` | 3448 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Enfant | Lait infantile | `lait-infantile.webp` | 2994 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Enfant | Sacs à couches | `sacs-a-couches.webp` | 3854 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Enfant | Yaourt | `yaourt.webp` | 41440 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Frais | Cornichon | `cornichon.webp` | 43096 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Frais | Mozzarella râpée | `mozzarella-rapee.webp` | 29408 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Frais | Pâte à pizza | `pate-a-pizza.webp` | 43040 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Frais | Philadelphia | `philadelphia.webp` | 20230 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Hygiène & soins | Alcool 70 | `alcool-70.webp` | 17442 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Hygiène & soins | Antiseptique | `antiseptique.webp` | 2358 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Hygiène & soins | Baume lèvres | `baume-levres.webp` | 1794 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Hygiène & soins | Démaquillant | `demaquillant.webp` | 2434 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Hygiène & soins | Mouchoirs poche | `mouchoirs-poche.webp` | 2554 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Hygiène & soins | Pansements | `pansements.webp` | 4428 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Hygiène & soins | Protections hygiéniques | `protections-hygieniques.webp` | 3238 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Adoucissant | `adoucissant.webp` | 3008 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Amidon | `amidon.webp` | 1756 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Bicarbonate | `bicarbonate.webp` | 2930 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Désinfectant | `desinfectant.webp` | 3040 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Désodorisant textile | `desodorisant-textile.webp` | 3180 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Détachant | `detachant.webp` | 2520 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Détartrant | `detartrant.webp` | 2010 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Éponges magiques | `eponges-magiques.webp` | 2452 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Essuie-verres | `essuie-verres.webp` | 3460 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Filet de lavage | `filet-de-lavage.webp` | 3496 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Grattoirs | `grattoirs.webp` | 3722 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Javel | `javel.webp` | 2342 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Lave glace | `lave-glace.webp` | 24392 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Maison | Lessive liquide | `lessive-liquide.webp` | 3022 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Lessive poudre | `lessive-poudre.webp` | 3028 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Lingettes anti-décoloration | `lingettes-anti-decoloration.webp` | 3054 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Lingettes ménage | `lingettes-menage.webp` | 3278 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Liquide rinçage | `liquide-rincage.webp` | 2806 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Liquide vaisselle | `liquide-vaisselle.webp` | 2930 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Mouchoirs | `mouchoirs.webp` | 3998 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Nettoyant lave-vaisselle | `nettoyant-lave-vaisselle.webp` | 4938 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Nettoyant machine à laver | `nettoyant-machine-a-laver.webp` | 3470 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Nettoyant multi-usages | `nettoyant-multi-usages.webp` | 3260 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Nettoyant salle de bain | `nettoyant-salle-de-bain.webp` | 2844 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Nettoyant sol | `nettoyant-sol.webp` | 2174 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Nettoyant vitres | `nettoyant-vitres.webp` | 3282 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Nettoyant WC | `nettoyant-wc.webp` | 2290 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Papier cadeau | `papier-cadeau.webp` | 24190 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Maison | Papier cuisson | `papier-cuisson.webp` | 3582 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Pile AAA | `pile-aaa.webp` | 36684 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Maison | Piles AA | `piles-aa.webp` | 26788 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Maison | Pinces à linge | `pinces-a-linge.webp` | 4826 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Produit inox | `produit-inox.webp` | 2550 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Sacs congélation | `sacs-congelation.webp` | 5174 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Sacs linge délicat | `sacs-linge-delicat.webp` | 3124 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Sacs poubelle 30L | `sacs-poubelle-30l.webp` | 3000 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Sacs poubelle 50L | `sacs-poubelle-50l.webp` | 3048 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Sacs zip | `sacs-zip.webp` | 3518 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Sel lave-vaisselle | `sel-lave-vaisselle.webp` | 3552 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Serviettes papier | `serviettes-papier.webp` | 3008 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Tablettes lave-vaisselle | `tablettes-lave-vaisselle.webp` | 4078 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Torchons | `torchons.webp` | 3726 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Maison | Vinaigre ménager | `vinaigre-menager.webp` | 2700 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Céréales | `cereales.webp` | 4622 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Chicorée | `chicoree.webp` | 4328 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Dosettes café | `dosettes-cafe.webp` | 2990 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Filtres à café | `filtres-a-cafe.webp` | 2848 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Granola | `granola.webp` | 55140 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Infusion camomille | `infusion-camomille.webp` | 4080 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Infusion menthe | `infusion-menthe.webp` | 3852 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Infusion verveine | `infusion-verveine.webp` | 3798 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Matcha | `matcha.webp` | 3370 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Sirot d’érable | `sirot-d-erable.webp` | 27644 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Thé Earl Grey | `the-earl-grey.webp` | 3892 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Thé fruits rouges | `the-fruits-rouges.webp` | 4004 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Thé noir | `the-noir.webp` | 4116 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Petit-déjeuner | Thé vert | `the-vert.webp` | 4142 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Viandes & poissons | Pâté | `pate.webp` | 5016 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Viandes & poissons | Peperroni | `peperroni.webp` | 50496 | Compression seule v537 | Ancien maintenu ; nouveau visuel non validé |
| Viandes & poissons | Poisson pané | `poisson-pane.webp` | 3746 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Viandes & poissons | Poisson surgelé | `poisson-surgele.webp` | 3744 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |
| Viandes & poissons | Saucisses | `saucisses.webp` | 3582 | Initial non modifié | Ancien maintenu ; nouveau visuel non validé |

**Périmètre de ce complément documentaire :** aucun WebP, aucun code, aucun CSS, aucun test ni version applicative modifié. Priorité des prochains essais : Petit-déjeuner, Maison et Boissons, avec fond alpha réel, emballage/variante exacte, visuel unitaire et comparaison sur fonds blanc/sauge à 192 px ; publication seulement après validation technique et graphique complète. Les 111 anciens visuels ont été revus, sans revendiquer 111 nouveaux remplacements ni 111 conservations définitives.


### Lot v600 — 2 remplacements validés, publication CI/Pages à vérifier après fusion

**Base vérifiée :** `7c0464dbdda8ebcbffd8b61f498b1d1cd164d924` (v599), 414 produits, 303 distincts renouvelés, 111 non renouvelés. Visuels changés exclusivement : **Dosettes café** (2 990 → 42 080 o) et **Filtres à café** (2 848 → 14 734 o), catégorie Petit-déjeuner. **Total 5 838 → 56 814 o (+50 976)**, deux fichiers source originale ChatGPT indépendants, WebP 384 × 384 avec véritable alpha, rendu contrôlé à 192 px sur fonds blanc/sauge et sur bords. Les anciennes illustrations ont été comparées aux nouvelles. Voir `docs/IMAGE_CREDITS_V600.md` pour provenance et empreintes. Pas d'API OpenAI payante ; aucune source tierce dans ce lot.

**Rejets :** plusieurs planches composites, variantes trop schématiques, autres conditionnements incorrects ; la piste Alcool 70 CC0 n'est pas comptée comme acceptée. Les deux fichiers restent **PRÉPARÉS** tant que leur commit, la CI et Pages ne sont pas vérifiés sur le véritable `main`. Après publication, objectif **305 renouvelés distincts / 109 non renouvelés / au moins 19 conservés**, 414 WebP et **10 114 292 octets**. Ne pas confondre ce bilan provisoire avec une publication vérifiée. Aucun changement des tuiles, CSS, navigation, cache visuel persistant, HA, WebSocket, OAuth, coffre, verrouillage, biométrie, safe areas ou mode test. Le test matériel iPhone et le test réseau hors ligne restent non effectués.


### Vérification définitive de publication du lot v600 — 27 octobre 2026

**PUBLIÉ ET REVÉRIFIÉ** : [PR #102](https://github.com/fabien95430/Dashboard-course/pull/102) fusionnée, commit main [`6eacf29f6b2e32e7d2e0bcc4bc447d0712a061d1`](https://github.com/fabien95430/Dashboard-course/commit/6eacf29f6b2e32e7d2e0bcc4bc447d0712a061d1), [CI PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40561162211), [CI main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40561348918), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40561348588). Les blobs Git des deux WebP correspondent aux sources validées : Dosettes café `5662ec86a3fc95986fda9f92aba12697c6f2098a`, Filtres à café `0f0893101d3ed7f8fd8366ca51448af0e061f148`. **2 nouveaux renouvellements distincts effectivement publiés**, poids du lot **5 838 → 56 814 o** (+50 976). Répertoire actuel **414 WebP = 10 114 292 octets**. Version visible et cache **v600**. Aucun changement d'interface ni de logique HA/OAuth/WebSocket/coffre/biométrie. Test physique iPhone et réseau hors ligne réel non réalisés.

**Compte corrigé après v600 : 305/414 renouvelés distincts, 109/414 non renouvelés, au moins 19 évalués et conservés distincts.** Les 111 lignes de l'inventaire de v599 ci-dessus sont un état **historique** ; Dosettes café et Filtres à café sont maintenant **PUBLIÉS** et ne doivent plus être comptés comme anciens non renouvelés. Les 109 autres ne sont pas 109 échecs automatiques : les visuels suffisamment fidèles restent maintenus jusqu'à preuve d'amélioration.

**Organisation de l'inspection par séries plafonnées à 30 produits** (inventaire Git du main v600, sans prétendre à 30 nouveaux WebP par série) :

| Série d'inspection | Références restantes | Répartition des catégories |
|---|---:|---|
| Série 1 | 30 | Apéritif & snacks: 2 ; Boissons: 17 ; Boulangerie: 1 ; Cuisine: 10 |
| Série 2 | 30 | Cuisine: 4 ; Enfant: 4 ; Frais: 4 ; Hygiène & soins: 7 ; Maison: 11 |
| Série 3 | 30 | Maison: 30 |
| Série 4 | 19 | Maison: 2 ; Petit-déjeuner: 12 ; Viandes & poissons: 5 |

**Contrôles / rejets complémentaires :** essais de génération encore composites (rejetés sans extraction) ; prototypes de nettoyants fabriqués localement trop illustrés par rapport au 3D semi-réaliste de l'application (rejetés, non publiés) ; source CC0 Alcool 70 insuffisamment probante sur la concentration et le gain à 192 px (en attente) ; Coca zéro et bière sans alcool doivent avoir leur variante attestée ; jus multifruits ne peut être remplacé par du jus d'orange. Aucune création payante via l'API OpenAI du projet. **Les séries ci-dessus représentent du suivi d'examen, et non plusieurs lots de remplacement publiés**. La priorité des remplacements prochains reste Maison, Boissons, Petit-déjeuner ; aucun autre candidat n'a été artificiellement accepté pour remplir un quota de 30.


### Lot v602 — 13 images unitaires préparées (publication à confirmer)

**Base Git vérifiée :** `main` `5d93e03da8a782190533c674c6de9d30cf438b46` (v601). Les 13 références distinctes ci-dessous ne sont pas des images déjà renouvelées, et les fichiers précédents restent archivés par Git. **7 Boissons et 6 Maison**, dont deux (Nettoyant WC et Nettoyant vitres) auparavant évalués et conservés, mais désormais pourvus de candidats nettement plus détaillés. Les images conservées ne sont pas retraitées en l'absence d'une amélioration visuelle démontrée.

| Catégorie | Produit | Avant (o) | Après (o) |
|---|---|---:|---:|
| Boissons | Coca zéro | 2442 | 22866 |
| Boissons | Bière sans alcool | 2028 | 15518 |
| Boissons | Ginger beer | 2476 | 12378 |
| Boissons | Limonade | 2346 | 13378 |
| Boissons | Orangeade | 2566 | 14156 |
| Boissons | Jus multifruits | 4114 | 20358 |
| Boissons | Eau aromatisée | 2798 | 12070 |
| Maison | Lessive liquide | 3022 | 16634 |
| Maison | Javel | 2342 | 11890 |
| Maison | Nettoyant vitres | 3282 | 16032 |
| Maison | Adoucissant | 3008 | 12940 |
| Maison | Nettoyant WC | 2290 | 14506 |
| Maison | Nettoyant multi-usages | 3260 | 16876 |
| **Total** | **13** | **35974** | **199602** |

**Bilan prévu si publication confirmée :** 305 + 13 = **318/414 produits distincts renouvelés**, **96/414 non renouvelés** ; le minimum de conservations distinctes passe de 19 à **17** en retirant les deux produits explicitement conservés dans les audits antérieurs puis renouvelés ici, soit **au moins 335/414 décisions distinctes**. **414 WebP, 10277920 octets**, delta **+163628 octets**. Ces chiffres sont *prévisionnels* jusqu'à la confirmation des SHA réels sur main. Crédits, contrôle des sources, variantes et SHA : `docs/IMAGE_CREDITS_V602.md`.

**Périmètre strict :** 13 `www/Items/*.webp`, `docs/AVANCEMENT_IMAGES_PRODUITS.md`, `docs/IMAGE_CREDITS_V602.md`, et marqueurs v602 nécessaires dans `index.html`, `catalog.js`, `dish-local-images.js` et `sw.js`. Aucune modification de `product-item-images.js`, `styles.css`, des tuiles, animations, safe areas, navigation, synchro WebSocket, liste HA Courses, OAuth, coffre, biométrie, mode test ou autre logique fonctionnelle. Pas de nouveau polling, backend, framework ou dépendance.

**Statut présent : PRÉPARÉ, non encore PUBLIÉ** — vérifier `bash scripts/validate_repo.sh` et `node --test tests/*.test.mjs` par CI PR, puis commit réel sur main, CI main et déploiement GitHub Pages. Test matériel iPhone et réseau hors ligne réel non revendiqués.


### Confirmation définitive de publication du lot v602 — 27 octobre 2026

**PUBLIÉ ET REVÉRIFIÉ :** [PR #103](https://github.com/fabien95430/Dashboard-course/pull/103) fusionnée sur `main`, commit réel [`c26a5a5a932a45229cf4ee2a086d9aa3db10eb39`](https://github.com/fabien95430/Dashboard-course/commit/c26a5a5a932a45229cf4ee2a086d9aa3db10eb39). [CI PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40565148602), [CI main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40565539484), [déploiement GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40565533963). Le vrai arbre `main` contient **414 WebP totalisant 10 277 920 octets**. Les 13 blobs image correspondent aux empreintes Git écrites dans `docs/IMAGE_CREDITS_V602.md`, validées lors du transfert ; aucun ancien produit renouvelé n'a été repris.

**Bilan réel et exclusif :** **318/414 produits renouvelés**, **96 non renouvelés**, **au moins 17 non renouvelés contrôlés et conservés distincts** (deux conservations historiques, Nettoyant WC et Nettoyant vitres, deviennent des remplacements après amélioration démontrée) ; **au moins 335/414 décisions de remplacement/conservation** documentées. Les 111 entrées de l'inventaire v599 et les 109 entrées de l'inventaire v600 sont **historiques**, non les listes actives après v602. Le poids du lot est **35 974 → 199 602 octets**, soit **+163 628 octets**. Les nouvelles images sont publiées ; les autres essais visuels rejetés ne le sont pas.

**Limites restantes :** les tests automatisés de la CI du dépôt sont réussis ; validation sur iPhone physique, liste Home Assistant réelle et simulation d'un réseau complètement déconnecté non effectuées. Aucun correctif CSS/JS métier ou changement de sécurité n'a été inclus dans le commit v602. Les prochaines séries concernent surtout Maison (produits d'entretien et lave-vaisselle), Petit-déjeuner (thés, céréales et chicorée), Hygiène & soins et les anciennes images en conserves et viandes ; ne pas remplir artificiellement un lot à 30. La génération de planches composites et les images avec fond damier opaque restent REJETÉES.


### Lot v604 — 3 visuels produits unitaires, en validation de publication

**Base :** `f344522c8904cee430d7123e971ac242e775fd33` (v603), 414 WebP = 10 277 920 octets, **318 produits renouvelés distincts**, **96 non renouvelés**. Ce lot comprend **3 nouveaux produits jamais renouvelés**, sans retoucher une image renouvelée : Chicorée (Petit-déjeuner), Liquide vaisselle et Lessive poudre (Maison). Voir `docs/IMAGE_CREDITS_V604.md` pour provenance, SHA, contrôles et candidats rejetés.

| Catégorie | Produit | Avant (o) | Après (o) |
|---|---|---:|---:|
| Petit-déjeuner | Chicorée | 4328 | 30116 |
| Maison | Liquide vaisselle | 2930 | 16514 |
| Maison | Lessive poudre | 3028 | 22458 |
| **TOTAL** | **3 WebP** | **10286** | **69088** |

**Bilan prévu après publication complète :** **321/414 renouvelés distincts**, **93 non renouvelés**, **au moins 17 évalués et conservés parmi ces 93** ; **414 WebP** totalisant **10 336 722 octets** (+58802 octets sur les 3 fichiers). Contrôles : WebP unitaires RGBA 384 px, fond alpha transparent, décodage et bords, 192 px sur blanc et sauge ; conformité de l’emballage. Les essais de génération de collages ont été rejetés ; seuls ces trois rendus unitaires atteignent la qualité requise dans cette passe. Le lot est inférieur à 30 parce qu’ajouter des remplaçants incohérents dégraderait le catalogue. Pas de version pour de simples crédits ; incrément v604 uniquement pour cette modification réelle des visuels et du cache.

**Statut : PRÉPARÉ avant confirmation CI et publication.** Aucun changement de disposition, couleurs des tuiles, CSS, barre iOS, images déjà renouvelées, priorité de `Courses` Home Assistant, OAuth, WebSocket, coffre, biométrie, verrouillage, mode test ou chargement hors ligne. Tests complets via `bash scripts/validate_repo.sh` en CI PR et sur `main`. La validation sur iPhone physique et le test réseau déconnecté restent non effectués.


### Confirmation définitive de publication du lot v604 — 27 octobre 2026

**PUBLIÉ ET REVÉRIFIÉ** : [PR #104](https://github.com/fabien95430/Dashboard-course/pull/104) fusionnée dans `main`, commit réel [`a85c4b562e26247c2d754db33cdcb5e4d38dfc84`](https://github.com/fabien95430/Dashboard-course/commit/a85c4b562e26247c2d754db33cdcb5e4d38dfc84), [CI PR réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40575861943), [CI main réussie](https://github.com/fabien95430/Dashboard-course/actions/runs/40576042793), [GitHub Pages réussi](https://github.com/fabien95430/Dashboard-course/actions/runs/40576042462). Les vrais blobs des trois fichiers sur `main` ont été comparés aux signatures attendues : `chicoree.webp` `5a016b5bd5e296e0f625db3c3b310478a63666b3` (30 116 o), `liquide-vaisselle.webp` `52bc36e8be062cd9f6852ac6113f186cf1332044` (16 514 o), `lessive-poudre.webp` `f0c5df4e5b368b93cf90504c20be5db154fcf7a7` (22 458 o). **3 nouveaux produits réellement renouvelés**, sans altérer les autres images.

**Résultat réel :** **321/414 produits renouvelés distincts**, **93/414 non renouvelés**, **au moins 17 évalués/conservés parmi les 93** ; **au moins 338 décisions définitives distinctes**. Le dossier `www/Items/` contient **414 WebP totalisant 10 336 722 octets** (+58 802 o sur ce lot). Version visible et cache **v604**. Le lot reste volontairement limité à trois images faute de candidats supplémentaires ayant démontré une meilleure qualité, malgré les recherches : aucun collage n'a été découpé. Les candidats de source non fiable (emballage erroné, halo, planches) ont été rejetés. Aucun test physique iPhone, scénario de déconnexion réseau complète ou accès Home Assistant réel n'est revendiqué. Les tests automatisés CI sont verts ; Home Assistant, OAuth, WebSocket, coffre, verrouillage, biométrie et mode test n'ont pas été modifiés.


### Audit ciblé des conservations après v604 — 27 octobre 2026

**Base réelle vérifiée :** `main` `3ad1a7224103f9b8888bf9a33cd04c3532a27dd8`, version **v604**, **414 WebP** totalisant **10 336 722 octets**. Les 7 anciens visuels suivants ont été inspectés individuellement depuis leurs blobs Git, et sont suffisamment fidèles au nom et conditionnement du produit pour être **CONSERVÉS**. Ils ne sont pas dans le décompte des 321 images renouvelées ni dans les 17 conservations distinctes déjà comptabilisées. Conservation = décision documentée, **pas** nouveau remplacement ou publication d'image.

| Catégorie | Produit conservé | Octets inchangés | SHA WebP présent | Motif |
|---|---|---:|---|---|
| Boulangerie | Pâte brisée | 26696 | `ccb6dd24fa079842f2768ec40390b7e33ab3433d` | Fond de pâte crue net, sans substitution d’une tarte cuite |
| Maison | Sacs zip | 3518 | `854de01f88289929b377f7fc38639140f3f5308f` | Sachet à fermeture zip reconnaissable |
| Maison | Serviettes papier | 3008 | `7b415fa05c32b030f439e6241e842f3731445f7a` | Pile de serviettes pliées distincte de l’essuie-tout |
| Maison | Torchons | 3726 | `fa245621009e1d1680134f6d05d3ce0203700655` | Torchons textiles rayés et pliés |
| Maison | Pinces à linge | 4826 | `8a1673918cc2ce7e33f4201768ad53a94bb38a0c` | Pinces en bois, forme fidèle |
| Maison | Sacs linge délicat | 3124 | `bbf49d4009371138b22588afca75ed3f8afbba83` | Filet de lavage fermé, différent d’un sac-poubelle |
| Maison | Tablettes lave-vaisselle | 4078 | `1071afd1e2eea7d9f43a86305eed3c26b61fbb6a` | Pastilles identifiables, distinguées du sel et du produit liquide |

**Bilan exclusif : 321 renouvelés + au moins 24 évalués et conservés = au moins 345 décisions finales distinctes sur 414** ; **93 non renouvelés**, dont **au plus 69 sans décision finale**. Aucun double comptage d'une image déjà renouvelée. Les inventaires v599 et v600 restent historiques.

**EN ATTENTE d'un meilleur visuel :** Coulis de fruit (bouteille au lieu du pot fermé exigé), Philadelphia (pot ouvert), Speculos (halo), Confiture mirabelles (détourage), Pâte feuilletée (halo), Yaourt (opercule ouvert), ainsi que plusieurs petites images Maison et Petit-déjeuner. Sources externes CC0 inspectées : Ingredient Atlas et SwisserDev ; candidats inadéquats rejetés pour fonds opaques ou emballages incorrects. Nouvelle génération renvoyant un collage multi-produits : **REJETÉ**, aucune découpe ni insertion. Aucun recours à l'API OpenAI payante du projet.

**Périmètre de cet audit :** aucun nouveau WebP publié ni candidat déclaré prêt pour production, aucun code, test ou CSS modifié, aucun incrément de version ni changement de cache, Home Assistant ou sécurité. La CI valide le dépôt mais aucun essai physique iPhone ni réseau hors ligne n'est revendiqué.


### Inventaire Git précis des 84 visuels non renouvelés — v611

**Instantané source :** `main` `ac9bacde4561a977dbc5447b890dd9f9ee9da808` (version applicative **v611**, changement Catalogue indépendant des images). L'inventaire est dérivé des arbres Git avant v528, du parent et de la compression v537, puis du dernier `main`, en s'appuyant sur les 414 noms/slugs réels de `catalog.js`. **414/414 WebP présents ; 330 images renouvelées distinctes, 61 anciens originaux strictement inchangés, 23 images uniquement recompressées en v537.** Les 84 lignes ci-dessous sont exhaustives pour les non-renouvelés ; les 330 autres ont déjà été renouvelées. Le registre ne duplique pas les décisions déjà prises : il maintient **au moins 24 conservations distinctes** et **au plus 60 autres références sans décision définitive**. Une priorité élevée signale un défaut connu, sans autoriser automatiquement un remplacement.

| Catégorie | Produit | Slug actuel | Octets | Blob Git | Historique | Priorité | Observation / précaution |
|---|---|---|---:|---|---|---|---|
| Apéritif & snacks | Kinder Maxi | `kinder-maxi.webp` | 22038 | `03327726f8617b3bd0f2f70654e68d7fa4ca24b7` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Apéritif & snacks | Speculos | `speculos.webp` | 67434 | `a28876eda8f0101bc394b38ac631309a45f31503` | Compression v537 seule | Haute | Halo important autour de l'assiette |
| Boissons | Bière blanche | `biere-blanche.webp` | 2578 | `c112aa5764a940ef81150fe21a8c84dfe49a7493` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Boissons | Jus de tomate | `jus-de-tomate.webp` | 3674 | `96ea1e30f34d129e02095a654a2489861e22d6a2` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Boissons | Prosecco | `prosecco.webp` | 2682 | `2b22a59c8c2831fa22be5dd34e79aca896e88c63` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Boissons | Rhum | `rhum.webp` | 18284 | `fcc34217f8b349259a9a7f0035c0a18031eded15` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Boissons | Ricard | `ricard.webp` | 22006 | `f2fa5f910cef6d3a9003acc41778a598a7bbcd08` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Boissons | Soda citron | `soda-citron.webp` | 2346 | `5963583dc0f2783ec48d0183297ac3df5a89c7c1` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Boissons | Vin rosé | `vin-rose.webp` | 3046 | `d5e3fe7b5ee3baf21aef0306166e86176ce959d9` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Boulangerie | Pâte brisée | `pate-brisee.webp` | 26696 | `ccb6dd24fa079842f2768ec40390b7e33ab3433d` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Cuisine | Champignons en boîte | `champignons-en-boite.webp` | 4744 | `68c908b6f93e5ae98d9f72040b597abe616ff1e3` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Confiture fraise | `confiture-fraise.webp` | 50636 | `4db25cb72db37463a5d5c7bd48b8cdc5ddbb0f45` | Compression v537 seule | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Confiture mirabelles | `confiture-mirabelles.webp` | 52662 | `571379767da02f0ca355e4852b524bd63f17a8dc` | Compression v537 seule | Haute | Halo autour du bocal |
| Cuisine | Coulis de fruit | `coulis-de-fruit.webp` | 25910 | `082b104d124f21a38687fa19918e1b85dfb97d25` | Compression v537 seule | Haute | Bouteille au lieu du pot fermé exigé |
| Cuisine | Croûtons | `croutons.webp` | 4588 | `4a9ef0dbd9df4044998f095fef38c11bda80ed18` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Lait de coco | `lait-de-coco.webp` | 3304 | `33ac91750ecb7c4d90fa8a90870eb41191c035c2` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Noix de coco râpée | `noix-de-coco-rapee.webp` | 4028 | `548a3d672dd7b0d8675b78a6ef4e52ee991803d0` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Pâte feuilletée | `pate-feuilletee.webp` | 59958 | `aba409288ef2f34e77ee64581d857392bcff938b` | Compression v537 seule | Haute | Halo, conserver la pâte crue |
| Cuisine | Petits pois carottes | `petits-pois-carottes.webp` | 4680 | `193230f82856bd5dc432855b970e1f8081f6a193` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Purée en flocons | `puree-en-flocons.webp` | 4004 | `71306a2b53bb3d508cad3431d5f2a8c12fec07e1` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Raviolis en boîte | `raviolis-en-boite.webp` | 4672 | `0f0fcb58fb73622dc8e6400c48ef2494c7f5dd5c` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Soupes en brique | `soupes-en-brique.webp` | 4152 | `99266ae71d46edd265657474154f0b8ecad13ce1` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Vinaigre balsamique | `vinaigre-balsamique.webp` | 2390 | `6413473a7ebf835e1f99bd2529d90ce30e2f3aad` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Cuisine | Vinaigre de cidre | `vinaigre-de-cidre.webp` | 35956 | `986a21aaeab1ea3335f30d82312a9f043fce7761` | Compression v537 seule | Haute | Halo et accessoires pomme |
| Enfant | Compotes bébé | `compotes-bebe.webp` | 3448 | `f0010d6ea385601d7608edf452b340fd176a2567` | Original non modifié | Moyenne | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Enfant | Lait infantile | `lait-infantile.webp` | 2994 | `7b3d7ec8393459146e84a4b71b62f0f7f8833adf` | Original non modifié | Moyenne | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Enfant | Sacs à couches | `sacs-a-couches.webp` | 3854 | `cf6a8a5c87a78b7c2ec77cbeb93e3db48d00ca1d` | Original non modifié | Moyenne | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Enfant | Yaourt | `yaourt.webp` | 41440 | `3c71534c5ec8c68218a4510884f93437747ba49d` | Compression v537 seule | Haute | Opercule ouvert |
| Frais | Cornichon | `cornichon.webp` | 43096 | `a125bbd9f8dc7e0d6d6e491e58c24e12299acbb4` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Frais | Mozzarella râpée | `mozzarella-rapee.webp` | 29408 | `67d61700e9281a27a9d5f72686265bc7bec2d87f` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Frais | Pâte à pizza | `pate-a-pizza.webp` | 43040 | `e6ca3898df5f74ef5afde5ddb43f8d662626c19f` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Frais | Philadelphia | `philadelphia.webp` | 20230 | `77a180fe515e214accf637f795a7356589e4c96d` | Compression v537 seule | Haute | Pot ouvert, couvercle à montrer |
| Hygiène & soins | Alcool 70 | `alcool-70.webp` | 17442 | `288fa11ccdd291fe56a81df0d4af831855f4c5b4` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Hygiène & soins | Antiseptique | `antiseptique.webp` | 2358 | `dd648a56fea1e3e567c01f6ccd9554857c6c801c` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Hygiène & soins | Baume lèvres | `baume-levres.webp` | 1794 | `7d5d0ffbff7bf04c34966f0129b645c648c75c3e` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Hygiène & soins | Démaquillant | `demaquillant.webp` | 2434 | `ed491738d028ed5d17d2d7fca930d5673a559259` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Hygiène & soins | Mouchoirs poche | `mouchoirs-poche.webp` | 2554 | `b29346ef734405bac0e96aa450ed8826ff3b0325` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Hygiène & soins | Pansements | `pansements.webp` | 4428 | `a792211175502878744de362ed727b2bd58a4369` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Hygiène & soins | Protections hygiéniques | `protections-hygieniques.webp` | 3238 | `c79aedc9a0edfa2988410d999741cdfe4053b7d2` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Amidon | `amidon.webp` | 1756 | `089369f2b4d6282f0718f1ec35cdfcdb1b3cc441` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Bicarbonate | `bicarbonate.webp` | 2930 | `ceff8ec6580edd2af086366a8fdb4d5f06454be1` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Désinfectant | `desinfectant.webp` | 3040 | `b11b6bcfbd7d571e3f80f4b4f2612e3512a167f9` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Désodorisant textile | `desodorisant-textile.webp` | 3180 | `5ed28d1cd98cfc00ead794e1e55d3a094872886e` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Détachant | `detachant.webp` | 2520 | `c0f828590cc375b3f6c5afb1487d1a1b1ebebd28` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Éponges magiques | `eponges-magiques.webp` | 2452 | `57f35457ebdad10b9aa8703e5c39fab21aadadfb` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Essuie-verres | `essuie-verres.webp` | 3460 | `89fa589660e673edab680a8e46a9cb6ffeedaf35` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Filet de lavage | `filet-de-lavage.webp` | 3496 | `f6778ecb045752dbb487b9c83e138eb90cb60c3f` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Grattoirs | `grattoirs.webp` | 3722 | `721a6bf6a640358a797d0cfdd47d4eb173d16c39` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Lave glace | `lave-glace.webp` | 24392 | `f989a93e3b6dcc3ad7bf8deba2e7110a2faf2b3f` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Lingettes anti-décoloration | `lingettes-anti-decoloration.webp` | 3054 | `b64b0ce1c9aa21104cea8df1233f07601ee687bc` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Lingettes ménage | `lingettes-menage.webp` | 3278 | `f5e9f32537a6128d44407dd1690d38a7680ef1d5` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Mouchoirs | `mouchoirs.webp` | 3998 | `b4b4ae5f25a6658f4c83a4357eff2bc69f52a4a3` | Original non modifié | Selon besoin | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Nettoyant lave-vaisselle | `nettoyant-lave-vaisselle.webp` | 4938 | `e49a4329ce120c57299f97c85e541b1eb3b8173a` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Nettoyant machine à laver | `nettoyant-machine-a-laver.webp` | 3470 | `80f032218c7a27f8f5be59d03db5cff94b811d59` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Nettoyant sol | `nettoyant-sol.webp` | 2174 | `10b128189d65fb6c838c88aca083e482459a44b6` | Original non modifié | Moyenne | Petit flacon, garder type nettoyant sol |
| Maison | Papier cadeau | `papier-cadeau.webp` | 24190 | `e74a0efad1b52e797d830f3064fad5a94c77dbcc` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Papier cuisson | `papier-cuisson.webp` | 3582 | `508d5c25f593dd9f9588dd7f6db51ecc56217aeb` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Pile AAA | `pile-aaa.webp` | 36684 | `22501040e968eca3808bcf6fb3306570ff6a5e2b` | Compression v537 seule | Haute | Halo autour du cylindre |
| Maison | Piles AA | `piles-aa.webp` | 26788 | `58a7f0ceb454464eb543db08204a5637f210cae9` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Pinces à linge | `pinces-a-linge.webp` | 4826 | `8a1673918cc2ce7e33f4201768ad53a94bb38a0c` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Produit inox | `produit-inox.webp` | 2550 | `cfa99044a70706491d9daa860d0f21e3eecbb453` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Sacs congélation | `sacs-congelation.webp` | 5174 | `2c78be070466e0676224427cdff4194e8f439fe2` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Sacs linge délicat | `sacs-linge-delicat.webp` | 3124 | `bbf49d4009371138b22588afca75ed3f8afbba83` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Sacs poubelle 30L | `sacs-poubelle-30l.webp` | 3000 | `e1ce0a18b7fc1a46e27fa33811e1213b3714d36b` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Sacs poubelle 50L | `sacs-poubelle-50l.webp` | 3048 | `8fd7d4e3a42f0c7c7fac2a3ea5bc6174e248c6d9` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Sacs zip | `sacs-zip.webp` | 3518 | `854de01f88289929b377f7fc38639140f3f5308f` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Sel lave-vaisselle | `sel-lave-vaisselle.webp` | 3552 | `20decb9ce16c9c2f9e51cc87271b799e00e62101` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Maison | Serviettes papier | `serviettes-papier.webp` | 3008 | `7b415fa05c32b030f439e6241e842f3731445f7a` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Tablettes lave-vaisselle | `tablettes-lave-vaisselle.webp` | 4078 | `1071afd1e2eea7d9f43a86305eed3c26b61fbb6a` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Torchons | `torchons.webp` | 3726 | `fa245621009e1d1680134f6d05d3ce0203700655` | Original non modifié | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Maison | Vinaigre ménager | `vinaigre-menager.webp` | 2700 | `0892af3a2c7bc7a5917125aaf1f7facc9df1d000` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Petit-déjeuner | Céréales | `cereales.webp` | 4622 | `9e60a123d9b0ee0f95a094e84d4b5da7fab03190` | Original non modifié | Moyenne | Petit bocal, variété de céréales à conserver |
| Petit-déjeuner | Granola | `granola.webp` | 55140 | `44c9fbbecbda20e7e7c47f92edd1c4fcf3b8bf86` | Compression v537 seule | Haute | Halo au bord du bol |
| Petit-déjeuner | Matcha | `matcha.webp` | 3370 | `e8b06cff7e2de215d967580b80d58011410c6dce` | Original non modifié | Moyenne | Petit bol, ne pas confondre avec infusion |
| Petit-déjeuner | Sirot d’érable | `sirot-d-erable.webp` | 27644 | `5aaf03f6026d7bb759f12287be58767b09f541a8` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Petit-déjeuner | Thé Earl Grey | `the-earl-grey.webp` | 3892 | `446aa9ebc011b8e78ba805c3cb8750e2283bc087` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Petit-déjeuner | Thé fruits rouges | `the-fruits-rouges.webp` | 4004 | `01e5d1c6d25c1b2f0e8dae5dd267c8968c8fa84d` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Petit-déjeuner | Thé noir | `the-noir.webp` | 4116 | `75da2cbd601a38692a3a72e55a77d6e706d61217` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Petit-déjeuner | Thé vert | `the-vert.webp` | 4142 | `3ef78bdba8fd36f79d12c8e18c09374565e24efb` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Viandes & poissons | Pâté | `pate.webp` | 5016 | `7eab33a6ab53f7c8232c04bcd926c9ca8f9a01f9` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Viandes & poissons | Peperroni | `peperroni.webp` | 50496 | `4451443ca2788a1573abe03ba4b7ce7962d747de` | Compression v537 seule | Selon besoin | Fidélité déjà signalée dans le suivi historique ; ne pas recompter |
| Viandes & poissons | Poisson pané | `poisson-pane.webp` | 3746 | `e6dbda4b697e112e183da567198c04c17c72fe67` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Viandes & poissons | Poisson surgelé | `poisson-surgele.webp` | 3744 | `dfcef4ed906fbc41aa02a5ad448ecc5e77075fff` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |
| Viandes & poissons | Saucisses | `saucisses.webp` | 3582 | `3998023794b44915abe3370a63072ce6c2f2ea52` | Original non modifié | Moyenne | À comparer avec un éventuel meilleur WebP 192 px |

**Rejets confirmés au cours de la recherche :** collages et planches même lorsqu'une génération unitaire était demandée ; photos sur fond blanc opaque ; source externe montrant un pot de fromage frais ouvert à la place d'un pot fermé ; source de pansements ressemblant à un rouleau de bande ; sauces, boissons et vinaigres dont la forme ou la variante diffère ; prototypes de coulis trop schématiques. Aucune planche découpée, aucune nouvelle image acceptée pendant ce relevé. L'API OpenAI payante configurée dans l'application n'a pas été appelée.

**Pour le prochain lot de WebP :** ne sélectionner que des améliorations prouvées par comparaison visuelle ancien/nouveau à 192 px sur fonds clair/sauge ; imposer un fichier unitaire, vrai alpha, format exact, marge et centrage, provenance/licences et variantes correctes ; maximum 30 remplacements par commit ; valider `bash scripts/validate_repo.sh` et la suite Node avant publication, puis SHA réel, CI et GitHub Pages. **Ce complément est documentaire uniquement** : 0 nouvelle image publiée, aucun fichier applicatif modifié, version/cache v611 inchangés. Les contrôles sur iPhone physique et hors ligne réel ne sont pas revendiqués.


### Lot v612 — 2 visuels unitaires préparés pour validation CI (28 octobre 2026)

**Base de travail :** `main` `399028980446f885d2a868295f67c3cfb6cab608` (v611, CI et GitHub Pages success). **État avant fusion : PRÉPARÉ**, puis statut final à documenter après vérification. Lot de deux produits, bien inférieur au plafond 30 : les autres propositions n'atteignent pas le niveau requis ; aucune planche de génération découpée.

| Catégorie | Produit | Fichier | Avant (o) | Après (o) | Origine et conformité |
|---|---|---|---:|---:|---|
| Cuisine | Coulis de fruit | `www/Items/coulis-de-fruit.webp` | 25 910 | 25 106 | Création native ChatGPT, pot en verre fermé, purée rouge lisse ; damier de fond retiré par segmentation du produit et contrôle d'alpha |
| Frais | Philadelphia | `www/Items/philadelphia.webp` | 20 230 | 14 230 | Création native ChatGPT, pot ovale blanc fermé avec couvercle visible, sans marque fictive |
| **TOTAL** | **2** | | **46 140** | **39 336** | **−6 804 octets** |

Tous deux sont des WebP indépendants de **384 × 384 pixels**, transparents (alpha 0..255), bords extérieurs vides, marges ≥20px, objets entiers ; contrôle visuel à 192px sur fond blanc et sauge. Le contenu du pot de coulis est lisse et non en morceaux (distinct de la confiture), aucun accessoire ; le pot de fromage frais est fermé (distinct de l'ancien pot ouvert). **Candidats rejetés :** collages multiproduits, sources CC0 avec mauvaises variantes/emballages, et anciens pots ouverts. Sources de ces deux fichiers : génération native ChatGPT uniquement, sans recours à l'API OpenAI payante.

**Impact technique limité :** `index.html` (3 marqueurs de version), `catalog.js` (référence de chargement du module de version), `dish-local-images.js` (version globale), `sw.js` (nom de cache et URLs déjà versionnées), plus WebP et cette documentation. Le comportement du cache reste identique : visuels persistants, rafraîchissement événementiel du cache ; Ma liste, Catalogue, UI, Home Assistant et sécurité inchangés. **Le test sur iPhone réel, la simulation hors ligne et la connexion à Home Assistant réel restent non effectués.** Les tests automatisés de dépôt doivent être exécutés par la CI sur PR avant toute fusion.


### Publication finale vérifiée v612 — 28 octobre 2026

**PUBLIÉ** : [PR #106](https://github.com/fabien95430/Dashboard-course/pull/106) fusionnée dans `main` au commit `6eddd29951e6a2e3cdc953aeeafb5f4cf3693622`, depuis la branche de validation à commit `d6e7f54186d595608b942af7b7a9dee78f2acc51`. [CI PR `success`](https://github.com/fabien95430/Dashboard-course/actions/runs/40655666240), [CI main `success`](https://github.com/fabien95430/Dashboard-course/actions/runs/40655804071), [GitHub Pages `success`](https://github.com/fabien95430/Dashboard-course/actions/runs/40655803439). Deux nouveaux produits réellement renouvelés, pas de doublon, WebP et versions validés.

| Produit | Blob Git exact publié | Octets |
|---|---|---:|
| Coulis de fruit | `c79e920a719761822836c5eb35449fbaa2f3b55e` | 25 106 |
| Philadelphia | `026d8fd4af53aa583d0b921f292335b449dc480f` | 14 230 |

**Bilan publié : 332/414 renouvelés distincts**, **82/414 non renouvelés**, **au moins 24 évalués et conservés** parmi ces 82, **au moins 356 décisions documentées sans double comptage**, **au plus 58 restant sans décision définitive**. **414 fichiers WebP totalisant 10 471 634 octets**. Version applicative/cache **v612**. Aucun changement à Home Assistant, sécurité, mode test, tuiles, navigation ou synchronisation WebSocket. Les validations CI et Pages sont réelles ; aucune validation physique iPhone ou hors ligne réel n'est revendiquée.
