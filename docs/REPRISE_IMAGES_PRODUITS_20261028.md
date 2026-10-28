# File de reprise ciblée — images produits non renouvelées

**Source de vérité de cette file :** historique `docs/AVANCEMENT_IMAGES_PRODUITS.md` (inventaire exhaustif v611, 84 références non renouvelées) ; comparaison ciblée avec les lots v612, v613, v614, v615 et v616 ; `main` de préparation `a8cbd3be4902467b12d951540ccf2b542abbf2c9`.

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

## Références encore non renouvelées après v627 (54, publication conditionnelle)

| Catégorie | Produit | WebP | Décision opérationnelle |
| --- | --- | --- | --- |
| Apéritif & snacks | Kinder Maxi | `kinder-maxi.webp` | `CONSERVER` |
| Boissons | Bière blanche | `biere-blanche.webp` | `ATTENDRE_CANDIDAT` |
| Boissons | Prosecco | `prosecco.webp` | `ATTENDRE_CANDIDAT` |
| Boissons | Rhum | `rhum.webp` | `CONSERVER` |
| Boissons | Ricard | `ricard.webp` | `CONSERVER` |
| Boissons | Vin rosé | `vin-rose.webp` | `ATTENDRE_CANDIDAT` |
| Boulangerie | Pâte brisée | `pate-brisee.webp` | `CONSERVER` |
| Cuisine | Confiture fraise | `confiture-fraise.webp` | `ATTENDRE_CANDIDAT` |
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
| Hygiène & soins | Démaquillant | `demaquillant.webp` | `ATTENDRE_CANDIDAT` |
| Hygiène & soins | Mouchoirs poche | `mouchoirs-poche.webp` | `CONSERVER` |
| Hygiène & soins | Pansements | `pansements.webp` | `CONSERVER` |
| Hygiène & soins | Protections hygiéniques | `protections-hygieniques.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Désinfectant | `desinfectant.webp` | `CONSERVER` |
| Maison | Éponges magiques | `eponges-magiques.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Essuie-verres | `essuie-verres.webp` | `CONSERVER` |
| Maison | Grattoirs | `grattoirs.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Lave glace | `lave-glace.webp` | `CONSERVER` |
| Maison | Lingettes anti-décoloration | `lingettes-anti-decoloration.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Lingettes ménage | `lingettes-menage.webp` | `CONSERVER` |
| Maison | Mouchoirs | `mouchoirs.webp` | `CONSERVER` |
| Maison | Papier cadeau | `papier-cadeau.webp` | `CONSERVER` |
| Maison | Piles AA | `piles-aa.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Pinces à linge | `pinces-a-linge.webp` | `CONSERVER` |
| Maison | Produit inox | `produit-inox.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Sacs congélation | `sacs-congelation.webp` | `CORRIGER_SI_CANDIDAT_CONFORME` |
| Maison | Sacs linge délicat | `sacs-linge-delicat.webp` | `CONSERVER` |
| Maison | Sacs poubelle 30L | `sacs-poubelle-30l.webp` | `CONSERVER` |
| Maison | Sacs poubelle 50L | `sacs-poubelle-50l.webp` | `CONSERVER` |
| Maison | Sacs zip | `sacs-zip.webp` | `CONSERVER` |
| Maison | Sel lave-vaisselle | `sel-lave-vaisselle.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Serviettes papier | `serviettes-papier.webp` | `CONSERVER` |
| Maison | Tablettes lave-vaisselle | `tablettes-lave-vaisselle.webp` | `CONSERVER` |
| Maison | Torchons | `torchons.webp` | `CONSERVER` |
| Maison | Vinaigre ménager | `vinaigre-menager.webp` | `ATTENDRE_CANDIDAT` |
| Petit-déjeuner | Céréales | `cereales.webp` | `CONSERVER` |
| Petit-déjeuner | Sirot d’érable | `sirot-d-erable.webp` | `CONSERVER` |
| Petit-déjeuner | Thé Earl Grey | `the-earl-grey.webp` | `ATTENDRE_CANDIDAT` |
| Petit-déjeuner | Thé fruits rouges | `the-fruits-rouges.webp` | `ATTENDRE_CANDIDAT` |
| Petit-déjeuner | Thé noir | `the-noir.webp` | `ATTENDRE_CANDIDAT` |
| Viandes & poissons | Pâté | `pate.webp` | `CONSERVER` |
| Viandes & poissons | Peperroni | `peperroni.webp` | `CONSERVER` |
| Viandes & poissons | Poisson pané | `poisson-pane.webp` | `ATTENDRE_CANDIDAT` |
| Viandes & poissons | Saucisses | `saucisses.webp` | `ATTENDRE_CANDIDAT` |

## Provenance et limites

- `CONSERVER` : croisement des conservations documentées aux audits v564/v566, v568, v582, v592, v604 et des contrôles suivants. Le fichier n'a pas été renouvelé, mais sa fidélité était jugée suffisante : ce n'est pas un remplacement.
- `CORRIGER_SI_CANDIDAT_CONFORME` : Nettoyant lave-vaisselle, Nettoyant machine à laver, Purée en flocons, Sacs congélation, Détachant. Les anciens visuels restent en place ; les prototypes schématiques, variantes trompeuses et planches infographiques de la reprise ont été **rejetés**.
- `ATTENDRE_CANDIDAT` : aucun nouveau visuel accepté à la rédaction. Ne pas requalifier l'ancien en défaut certain uniquement à cause de son faible poids en octets.
- Cette consolidation est **documentaire** : zéro WebP changé, zéro décision de remplacement supplémentaire, aucune modification du code ni du cache applicatif, aucune API payante. Elle ne représente ni un audit général renouvelé, ni une validation sur iPhone physique.
