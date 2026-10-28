# File de reprise ciblée — images produits non renouvelées

**Source de vérité de cette file :** historique `docs/AVANCEMENT_IMAGES_PRODUITS.md` (inventaire exhaustif v611, 84 références non renouvelées) ; comparaison ciblée avec les lots v612, v613, v614, v615 et v616 ; `main` de préparation `a8cbd3be4902467b12d951540ccf2b542abbf2c9`.

## Correction du compteur de produits distincts

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

## Références encore non renouvelées (59)

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
| Cuisine | Noix de coco râpée | `noix-de-coco-rapee.webp` | `ATTENDRE_CANDIDAT` |
| Cuisine | Petits pois carottes | `petits-pois-carottes.webp` | `ATTENDRE_CANDIDAT` |
| Cuisine | Purée en flocons | `puree-en-flocons.webp` | `CORRIGER_SI_CANDIDAT_CONFORME` |
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
| Maison | Désinfectant | `desinfectant.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Détachant | `detachant.webp` | `CORRIGER_SI_CANDIDAT_CONFORME` |
| Maison | Éponges magiques | `eponges-magiques.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Essuie-verres | `essuie-verres.webp` | `CONSERVER` |
| Maison | Grattoirs | `grattoirs.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Lave glace | `lave-glace.webp` | `CONSERVER` |
| Maison | Lingettes anti-décoloration | `lingettes-anti-decoloration.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Lingettes ménage | `lingettes-menage.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Mouchoirs | `mouchoirs.webp` | `ATTENDRE_CANDIDAT` |
| Maison | Nettoyant lave-vaisselle | `nettoyant-lave-vaisselle.webp` | `CORRIGER_SI_CANDIDAT_CONFORME` |
| Maison | Nettoyant machine à laver | `nettoyant-machine-a-laver.webp` | `CORRIGER_SI_CANDIDAT_CONFORME` |
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
| Petit-déjeuner | Céréales | `cereales.webp` | `ATTENDRE_CANDIDAT` |
| Petit-déjeuner | Sirot d’érable | `sirot-d-erable.webp` | `CONSERVER` |
| Petit-déjeuner | Thé Earl Grey | `the-earl-grey.webp` | `ATTENDRE_CANDIDAT` |
| Petit-déjeuner | Thé fruits rouges | `the-fruits-rouges.webp` | `ATTENDRE_CANDIDAT` |
| Petit-déjeuner | Thé noir | `the-noir.webp` | `ATTENDRE_CANDIDAT` |
| Viandes & poissons | Pâté | `pate.webp` | `ATTENDRE_CANDIDAT` |
| Viandes & poissons | Peperroni | `peperroni.webp` | `CONSERVER` |
| Viandes & poissons | Poisson pané | `poisson-pane.webp` | `ATTENDRE_CANDIDAT` |
| Viandes & poissons | Poisson surgelé | `poisson-surgele.webp` | `ATTENDRE_CANDIDAT` |
| Viandes & poissons | Saucisses | `saucisses.webp` | `ATTENDRE_CANDIDAT` |

## Provenance et limites

- `CONSERVER` : croisement des conservations documentées aux audits v564/v566, v568, v582, v592, v604 et des contrôles suivants. Le fichier n'a pas été renouvelé, mais sa fidélité était jugée suffisante : ce n'est pas un remplacement.
- `CORRIGER_SI_CANDIDAT_CONFORME` : Nettoyant lave-vaisselle, Nettoyant machine à laver, Purée en flocons, Sacs congélation, Détachant. Les anciens visuels restent en place ; les prototypes schématiques, variantes trompeuses et planches infographiques de la reprise ont été **rejetés**.
- `ATTENDRE_CANDIDAT` : aucun nouveau visuel accepté à la rédaction. Ne pas requalifier l'ancien en défaut certain uniquement à cause de son faible poids en octets.
- Cette consolidation est **documentaire** : zéro WebP changé, zéro décision de remplacement supplémentaire, aucune modification du code ni du cache applicatif, aucune API payante. Elle ne représente ni un audit général renouvelé, ni une validation sur iPhone physique.
