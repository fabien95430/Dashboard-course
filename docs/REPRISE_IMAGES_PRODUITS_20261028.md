# File de reprise ciblée — images produits non renouvelées

**Clôturé au 29 octobre 2026 : 0 référence ouverte.** Le catalogue actif compte **412 produits**, tous dotés de leur WebP ; **371 images actives renouvelées ou créées**, **41 conservées**. Le total historique de 414 intègre trois produits désormais supprimés et ne comprend pas Bolognaise. Source de vérité et vérifications : [`CLOTURE_IMAGES_PRODUITS_20261029.md`](CLOTURE_IMAGES_PRODUITS_20261029.md). Les lignes « publication conditionnelle » et autres compteurs ci-dessous sont conservés comme historique des lots, pas comme statut actuel.


**Source de vérité de cette file :** historique `docs/AVANCEMENT_IMAGES_PRODUITS.md` (inventaire exhaustif v611, 84 références non renouvelées) ; comparaison ciblée avec les lots v612, v613, v614, v615 et v616 ; `main` de préparation `a8cbd3be4902467b12d951540ccf2b542abbf2c9`.

## Lot v657 — clôture des 3 références ouvertes (publication conditionnelle)

**Base :** `9a73c1063b6868ffa0af504f26a0fe71280d740b` (v656), 370 images renouvelées distinctes et 41 références conservées par décision documentée. Trois fichiers WebP unitaires sont remplacés : `lingettes-anti-decoloration.webp`, `the-earl-grey.webp` et `the-fruits-rouges.webp`, dans la continuité des visuels semi-réalistes et avec le conditionnement inchangé (feuilles anti-décoloration, sachets de thé pyramidaux).

- Trois créations originales locales converties en WebP RGBA **256 × 256 px**, images indépendantes sans marque, sans fond, sans collage ni planche découpée.
- Anciens visuels **84 × 84 px** conservés dans l'historique Git ; nouveau contrôle du format, des coins transparents et des vignettes **192 × 192 px sur blanc et sauge**. Les références et empreintes sont détaillées dans `docs/IMAGE_CREDITS_V657.md`.
- Aucun produit précédemment renouvelé ou classé `CONSERVER` n'est repris. Aucune modification métier. Version/cache globale v657.
- **Projection après publication et succès CI/Pages : 373 produits renouvelés distincts + 41 conservés = 414 / 414 références traitées, zéro en attente.** Cela ne signifie **pas** « 414 images renouvelées » : 41 anciens visuels sont volontairement maintenus.
- Source de vérité des déploiements : SHA fusionné sur `main`, workflow de validation et workflow Pages ; ne pas assimiler la simple préparation du lot à une publication.

## Lot v655 — 2 WebP unitaires ciblés (publication conditionnelle)

Deux références autrefois en attente reçoivent un candidat 256 × 256 pixels à canal alpha réel : **Éponges magiques** (un bloc de mousse mélamine blanche, sans accessoire) et **Produit inox** (flacon métallique fermé avec pulvérisateur noir, sans marque). Les deux sont des illustrations semi-réalistes originales produites localement avec SVG, CairoSVG et Pillow, puis converties en WebP transparent. Ancien WebP : 84 × 84 pixels. Miniatures à 192 px sur fonds blanc et sauge vérifiées. Aucun collage ni découpe de planche ; aucune marque ni nom fictif, aucune API OpenAI payante du projet.

**Projection uniquement après validation et publication : 370/414 renouvelés distincts, 44 non renouvelés, dont 41 conservés et 3 ouverts.** Les trois derniers à améliorer restent Lingettes anti-décoloration, Thé Earl Grey et Thé fruits rouges. Les essais précédents sur ces trois références, ainsi que les sources externes contenant plusieurs produits ou des fonds opaques, restent rejetés. Voir `docs/IMAGE_CREDITS_V655.md` pour dimensions et blobs. L'historique antérieur est préservé.

## Lot v637 — deux WebP unitaires, qualité contrôlée (publication conditionnelle)

- **Sel lave-vaisselle** : bocal fermé à bouchon bleu, cristaux blancs visibles, WebP 320 × 320 px avec transparence réelle. Fichier initial 84 × 84 px, blob `20decb9ce16c9c2f9e51cc87271b799e00e62101`, remplacé par `a1e1c4b4340b9bd6f144f431c2385eff310733a3`.
- **Vinaigre ménager** : bouteille transparente avec liquide jaune clair et bouchon vert, fermée et sans marque, WebP 320 × 320 px. Ancien 84 × 84 px, blob `0892af3a2c7bc7a5917125aaf1f7facc9df1d000`, nouveau `80eb352c96663a0d1443b163ae19533b6e17aade`.
- Les deux créations sont des **rendus 3D stylisés originaux réalisés localement**, sans API OpenAI payante du dépôt et sans marque inventée. Les deux sont conçus en SVG 768 px avec gradients, textures et volumes puis convertis en WebP RGBA 320 px via CairoSVG/Pillow ; aperçus à 192 px sur blanc/sauge. Ne pas les présenter comme des photographies commerciales.
- **Cinq références non modifiées** : Éponges magiques, Lingettes anti-décoloration, Produit inox, Thé Earl Grey et Thé fruits rouges. Leurs prototypes locaux ou alternatives trouvées ont été rejetés comme trop illustratifs, imprécis ou à fond opaque. Aucune image ne doit être remplacée uniquement pour terminer le compteur.
- **Progression prévue après fusion et CI : 368/414 renouvelés distincts (88,9 %), 46 non renouvelés = 41 conservés + 5 ouverts.** Aucun doublon ni autre changement d'application ; cache et versions globaux v637 actualisés.
- Détails de provenance et empreintes dans `docs/IMAGE_CREDITS_V637.md`. Les notes des lots précédents sont conservées.

## Six conservations complémentaires — 28 octobre 2026

**Progression inchangée : 366/414 produits distincts renouvelés (88,4 %).** Sur les 48 non renouvelés, **41 sont conservés** sur décision documentée et **7 restent ouverts**. Ces décisions n'entraînent aucun remplacement de fichier produit.

| Produit | Fichier | Blob d'origine | Justification |
| --- | --- | --- | --- |
| Confiture fraise | `confiture-fraise.webp` | `4db25cb72db37463a5d5c7bd48b8cdc5ddbb0f45` | pot fermé 512 × 512 avec contenu fraise et étiquette identifiable |
| Piles AA | `piles-aa.webp` | `58a7f0ceb454464eb543db08204a5637f210cae9` | lot de piles AA 512 × 512, format et quantité immédiatement identifiables |
| Grattoirs | `grattoirs.webp` | `721a6bf6a640358a797d0cfdd47d4eb173d16c39` | grattoir de surface avec lame métallique et poignée bleue |
| Thé noir | `the-noir.webp` | `75da2cbd601a38692a3a72e55a77d6e706d61217` | bocal contenant des feuilles de thé noir, fermé et reconnaissable |
| Poisson pané | `poisson-pane.webp` | `e6dbda4b697e112e183da567198c04c17c72fe67` | deux bâtonnets de poisson pané, sans accessoire ni autre aliment |
| Saucisses | `saucisses.webp` | `3998023794b44915abe3370a63072ce6c2f2ea52` | trois saucisses crues ; une source de saucisses grillées serait une mauvaise variante |

Les 7 restant sans décision sont **Éponges magiques, Lingettes anti-décoloration, Produit inox, Sel lave-vaisselle, Vinaigre ménager, Thé Earl Grey et Thé fruits rouges**. Les sources externes proposées pour une partie des 13 produits ouverts ont été rejetées lorsqu'elles montraient un fond blanc opaque ou une variante trompeuse ; une génération illustrant faussement un état de publication GitHub a été écartée. Aucune image provenant de cette génération n'a été intégrée.

**Limite de qualité documentée :** certains fichiers conservés ont seulement 84 × 84 px, malgré une identification correcte sur les vignettes mobiles. Ce classement signifie « ne pas remplacer en l'absence d'un candidat visuellement meilleur » et non « image haute définition neuve ». Si le cahier des charges impose une netteté native à 192 px pour chaque produit, ces anciens fichiers nécessiteront une régénération future de meilleure qualité. Aucune modification des 414 images ni de la logique applicative ; aucun appel à l'API OpenAI payante du projet.

## Lot v629 — six WebP unitaires (publication conditionnelle)

Six références auparavant non renouvelées passent en remplacement conditionnel : **Sacs congélation, Prosecco, Vin rosé, Démaquillant, Protections hygiéniques et Bière blanche**. Candidats originaux générés via ChatGPT sans API du projet, PNG RGBA 1 produit autonome par visuel, traités en WebP RGBA **384 × 384 px**, avec véritables marges alpha. Contrôle sur **fonds blanc et sauge à 192 px**, comparaison de leurs variantes avec les anciens WebP GitHub. Aucune planche recadrée, aucune image déjà renouvelée ou déjà conservée réouverte ; crédits/détails : `docs/IMAGE_CREDITS_V629.md`.

**Projection uniquement après fusion validée : 366/414 renouvelés distincts ; 48 non renouvelés, dont 35 conservés et 13 encore en attente d'un candidat satisfaisant.** Le défaut Sacs congélation est corrigé, il ne reste plus de statut `CORRIGER_SI_CANDIDAT_CONFORME` dans cette file. Garder le suivi historique des lots précédents.

## Lot v627 — 1 remplacement ciblé et 7 décisions de conservation (publication conditionnelle)

- Un remplacement unique : `poisson-surgele.webp`, nouveau filet blanc cru isolé, WebP 320×320 alpha natif (Soft Studio Ingredients, CC BY 4.0), à compter seulement après CI et publication.
- Sept visuels conservés, sans remplacement : Noix de coco râpée, Petits pois carottes, Désinfectant, Lingettes ménage, Mouchoirs, Céréales et Pâté. Les anciens fichiers sont lisibles et fidèles ; les alternatives examinées dégradaient la variante ou le conditionnement.
- Bilan projeté : **360/414** renouvelés, **54** non renouvelés dont **35 conservés**, **1 défaut ciblé** (Sacs congélation) et **18 références en attente**. Aucun doublon. Source, licence et signatures : `docs/IMAGE_CREDITS_V627.md`.

## Lot v623 : quatre références sorties de la file (publication conditionnelle)

Les quatre anciens visuels `nettoyant-lave-vaisselle.webp`, `nettoyant-machine-a-laver.webp`, `detachant.webp`, `puree-en-flocons.webp` sont remplacés par des candidats unitaires WebP RGBA 384×384. Ancien/nouveau contrôlés visuellement à 192 px sur blanc/sauge. Les sources et SHA-256 sont consignés dans `docs/IMAGE_CREDITS_V623.md`. Après fusion réussie : **359/414 renouvelés distincts**, **55 non renouvelés**, dont **28 conservés, 1 défaut ciblé et 26 candidats restant à rechercher**. Le nombre 355/414 ci-dessous est l’état historique de départ, conservé pour traçabilité. Aucune image autre que ces quatre produits n’est modifiée.

## Correction du compteur de produits distincts (état historique avant v623)

- Le catalogue contient **414 références**. Avant v612, **330** étaient renouvelées.
- Sur les **26** WebP modifiés entre v612 et v616, **25 produits** appartenaient aux 84 références encore non renouvelées en v611.
- **Miel (`miel.webp`) a déjà été renouvelé en v534** (commit `795eed950efbf5bb6202f50b192c856a7fa5060b`), puis remplacé de nouveau en v614 (`bae0c40fa48a203f9ce5636b07c040bee1143a36`). Son remplacement v614 améliore un fichier, mais **n'ajoute pas une référence distincte renouvelée**.
- **Bilan corrigé : 355 produits renouvelés distincts / 414 ; 59 non renouvelés.** Cette correction prévaut sur les bilans historiques 356/414 et 58 non renouvelés, conservés dans le suivi pour traçabilité.
- Parmi les 59, **28** figurent dans des décisions antérieures de conservation explicitement documentées ; **5** présentent un besoin ciblé de meilleur conditionnement ou de précision ; les **26** autres attendent un candidat dont la qualité et l'identité pourront être vérifiées.

## Règle de reprise sans répétition

1. Ne **jamais** rouvrir un produit déjà renouvelé. La détection se fait à partir des slugs du catalogue et de l'inventaire Git, **pas** des seuls numéros de version.
2. Pour `CONSERVER`, ne pas relire l'image ni redemander une génération : la décision historique demeure valide tant que le blob et les contraintes métier ne changent pas.
3. Pour `ATTENDRE_CANDIDAT` et `CORRIGER_SI_CANDIDAT_CONFORME`, ne pas reproduire les recherches ou générations déjà rejetées. Ouvrir l'ancien WebP **seulement quand** un candidat nouveau et identifié est disponible, afin de faire la comparaison obligatoire à 192 px blanc/sauge.
4. Ne jamais compter un produit deux fois. Un remplacement d'un WebP antérieurement renouvelé peut modifier sa qualité, **pas** le décompte des produits distincts.
5. Un candidat n'est pas un produit publié. Les tests, licences, crédits, caches/versions, SHA Git, CI et Pages doivent être confirmés avant de modifier un statut. Ne jamais découper une planche ni utiliser l'API OpenAI payante du projet.

## Références non renouvelées conservées après v657 (41 ; aucun candidat ouvert, publication conditionnelle)

| Catégorie | Produit | WebP | Décision opérationnelle |
| --- | --- | --- | --- |
| Apéritif & snacks | Kinder Maxi | `kinder-maxi.webp` | `CONSERVER` |
| Boissons | Rhum | `rhum.webp` | `CONSERVER` |
| Boissons | Ricard | `ricard.webp` | `CONSERVER` |
| Boulangerie | Pâte brisée | `pate-brisee.webp` | `CONSERVER` |
| Cuisine | Confiture fraise | `confiture-fraise.webp` | `CONSERVER` |
| Cuisine | Noix de coco râpée | `noix-de-coco-rapee.webp` | `CONSERVER` |
| Cuisine | Petits pois carottes | `petits-pois-carottes.webp` | `CONSERVER` |
| Enfant | Compotes bébé | `compotes-bebe.webp` | `CONSERVER` |
| Enfant | Lait infantile | `lait-infantile.webp` | `CONSERVER` |
| Enfant | Sacs à couches | `sacs-a-couches.webp` | `CONSERVER` |
| Frais | Cornichon | `cornichon.webp` | `CONSERVER` |
| Frais | Mozzarella râpée | `mozzarella-rapee.webp` | `CONSERVER` |
| Frais | Pâte à pizza | `pate-a-pizza.webp` | `CONSERVER` |
| Hygiène & soins | Alcool 70 | `alcool-70.webp` | `CONSERVER` |
| Hygiène & soins | Antiseptique | `antiseptique.webp` | `CONSERVER` |
| Hygiène & soins | Baume lèvres | `baume-levres.webp` | `CONSERVER` |
| Hygiène & soins | Mouchoirs poche | `mouchoirs-poche.webp` | `CONSERVER` |
| Hygiène & soins | Pansements | `pansements.webp` | `CONSERVER` |
| Maison | Désinfectant | `desinfectant.webp` | `CONSERVER` |
| Maison | Essuie-verres | `essuie-verres.webp` | `CONSERVER` |
| Maison | Grattoirs | `grattoirs.webp` | `CONSERVER` |
| Maison | Lave glace | `lave-glace.webp` | `CONSERVER` |
| Maison | Lingettes ménage | `lingettes-menage.webp` | `CONSERVER` |
| Maison | Mouchoirs | `mouchoirs.webp` | `CONSERVER` |
| Maison | Papier cadeau | `papier-cadeau.webp` | `CONSERVER` |
| Maison | Piles AA | `piles-aa.webp` | `CONSERVER` |
| Maison | Pinces à linge | `pinces-a-linge.webp` | `CONSERVER` |
| Maison | Sacs linge délicat | `sacs-linge-delicat.webp` | `CONSERVER` |
| Maison | Sacs poubelle 30L | `sacs-poubelle-30l.webp` | `CONSERVER` |
| Maison | Sacs poubelle 50L | `sacs-poubelle-50l.webp` | `CONSERVER` |
| Maison | Sacs zip | `sacs-zip.webp` | `CONSERVER` |
| Maison | Serviettes papier | `serviettes-papier.webp` | `CONSERVER` |
| Maison | Tablettes lave-vaisselle | `tablettes-lave-vaisselle.webp` | `CONSERVER` |
| Maison | Torchons | `torchons.webp` | `CONSERVER` |
| Petit-déjeuner | Céréales | `cereales.webp` | `CONSERVER` |
| Petit-déjeuner | Sirot d’érable | `sirot-d-erable.webp` | `CONSERVER` |
| Petit-déjeuner | Thé noir | `the-noir.webp` | `CONSERVER` |
| Viandes & poissons | Pâté | `pate.webp` | `CONSERVER` |
| Viandes & poissons | Peperroni | `peperroni.webp` | `CONSERVER` |
| Viandes & poissons | Poisson pané | `poisson-pane.webp` | `CONSERVER` |
| Viandes & poissons | Saucisses | `saucisses.webp` | `CONSERVER` |

## Provenance et limites

- `CONSERVER` : croisement des conservations documentées aux audits v564/v566, v568, v582, v592, v604 et des contrôles suivants. Le fichier n'a pas été renouvelé, mais sa fidélité était jugée suffisante : ce n'est pas un remplacement.
- `CORRIGER_SI_CANDIDAT_CONFORME` : Nettoyant lave-vaisselle, Nettoyant machine à laver, Purée en flocons, Sacs congélation, Détachant. Les anciens visuels restent en place ; les prototypes schématiques, variantes trompeuses et planches infographiques de la reprise ont été **rejetés**.
- `ATTENDRE_CANDIDAT` : aucun nouveau visuel accepté à la rédaction. Ne pas requalifier l'ancien en défaut certain uniquement à cause de son faible poids en octets.
- Cette consolidation est **documentaire** : zéro WebP changé, zéro décision de remplacement supplémentaire, aucune modification du code ni du cache applicatif, aucune API payante. Elle ne représente ni un audit général renouvelé, ni une validation sur iPhone physique.
