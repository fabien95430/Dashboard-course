# Harmonisation des sauces et épices — 4 novembre 2026

Demande autorisée sur `main` : utiliser Mayonnaise pour toutes les sauces et Paprika pour toutes les épices, avec leur forme et leur étiquette. Source initiale relue : `cff6253a088c88588764345f40c92cc9c6655f43` (v740). Le catalogue reste dans `catalog.js` ; les noms, catégories et modes de synchronisation ne changent pas.

## Deux références conservées

| Famille | Référence sur main v740 | SHA Git du fichier conservé |
| --- | --- | --- |
| Sauces | `www/Items/mayonnaise.webp` | `f49e68401619d372a143695f0ca7adf891b306ef` |
| Épices | `www/Items/paprika.webp` | `2a6c2f58e403921f1e9b4b1e7262aa3d27c677c1` |

Ces deux images ne sont pas régénérées. Le périmètre est de 32 sauces et préparations apparentées, et 7 épices/assaisonnements, soit 37 autres fichiers à refaire.

Pour les sauces : même bocal en verre, épaules arrondies, couvercle doré et grande étiquette crème rectangulaire à coins arrondis, au même emplacement, avec double filet fin. Pour les épices : même petit bocal Paprika, couvercle doré et petite étiquette crème en cartouche, à coins décoratifs et double filet cannelle. Les étiquettes restent sans texte ni pictogramme. Seuls le contenu naturel et l'accent discret de palette changent.

Sauces tomate et Bolognaise : filet brique ; sauces crémeuses et autres sauces sans couleur spécifique validée : filet taupe ; sauces épicées : terracotta ; Coulis de fruit : nude rosé ; épices : cannelle. Les couleurs des aliments ne sont pas artificiellement modifiées.

## Périmètre et exclusions

Le groupe Sauces & condiments est relu dans `catalog.js`, en excluant Cornichon, huiles et vinaigres. Ajouter Coulis de fruit du groupe Sauces sucrées et les préparations Harissa, Guacamole, Houmous et Tapenade, déjà soumises à la règle du pot dans IMAGES_ITEMS.md.

Épices et assaisonnements : Curcuma, Curry, Paprika, Poivre, Sel, Chili et Vanille. Le contenu de Chili est du piment séché ; Vanille conserve des gousses naturelles visibles en bocal. Les produits frais Piments et herbes fraîches restent distincts. Les crèmes laitières, confitures, miel et pâtes à tartiner sucrées ne sont pas inclus.

Cette décision remplace les anciennes propositions de référence Sauce au poivre/Curcuma et la conservation du duo Sel/Poivre en moulins. Elle ne modifie pas les autres familles déjà validées.

## Consigne de génération utilisée

Édition par l'outil d'images intégré, une image par produit, en fournissant le WebP canonique correspondant comme référence visuelle unique. Aucun appel à l'API OpenAI payante du projet.

> Modifier seulement le contenu du bocal pour représenter le produit exact et l'accent fin de l'étiquette selon la palette validée. Conserver la forme, les proportions, le verre, le couvercle doré, l'angle de vue, le cadrage et la géométrie exacte de l'étiquette de la référence. Un seul bocal fermé et entier, centré, sur fond réellement transparent ; pas de texte, marque, pictogramme, décor, ombre au sol, contour blanc ou halo externe. Préserver la lisibilité à 192 pixels et concevoir un WebP de 15 000 octets maximum après encodage.

La consigne permanente et le prompt automatique sont mis à jour dans `docs/IMAGES_ITEMS.md` et `scripts/integrate_product_openai.py`. La limite de poids réelle reste bloquante dans le validateur existant.

## Contrôles de livraison

Les 39 fichiers ont été encodés et mesurés. Les contrôles portent sur la conservation binaire des deux références, la transparence, les marges et contours sur fonds clair/foncé à 192 et 48 pixels. Le calcul de cadrage de l'application et l'invalidation des 37 anciens cadrages sont contrôlés, ainsi que le maintien des autres produits et du fallback SVG.

Les contrôles sur les fichiers et le code ne constituent pas un essai interactif sur un iPhone ou sur une session Home Assistant réelle. Aucun accès Home Assistant, jeton, OAuth, coffre, biométrie ou comportement WebSocket n'est modifié par ce lot.

## Poids finaux des fichiers intégrés

| Produit | Famille | WebP | Octets |
| --- | --- | --- | ---: |
| Bolognaise | Sauces | `www/Items/bolognaise.webp` | 14 824 |
| Ketchup | Sauces | `www/Items/ketchup.webp` | 14 500 |
| Mayonnaise | Sauces | `www/Items/mayonnaise.webp` | 12 918 |
| Moutarde | Sauces | `www/Items/moutarde.webp` | 14 416 |
| Pesto | Sauces | `www/Items/pesto.webp` | 14 688 |
| Sauce aigre-douce | Sauces | `www/Items/sauce-aigre-douce.webp` | 14 346 |
| Sauce algérienne | Sauces | `www/Items/sauce-algerienne.webp` | 14 292 |
| Sauce andalouse | Sauces | `www/Items/sauce-andalouse.webp` | 14 744 |
| Sauce au poivre | Sauces | `www/Items/sauce-au-poivre.webp` | 13 808 |
| Sauce au roquefort | Sauces | `www/Items/sauce-au-roquefort.webp` | 13 622 |
| Sauce aux champignons | Sauces | `www/Items/sauce-aux-champignons.webp` | 14 960 |
| Sauce barbecue | Sauces | `www/Items/sauce-barbecue.webp` | 14 000 |
| Sauce Béarnaise | Sauces | `www/Items/sauce-bearnaise.webp` | 14 944 |
| Sauce blanche | Sauces | `www/Items/sauce-blanche.webp` | 12 698 |
| Sauce burger | Sauces | `www/Items/sauce-burger.webp` | 13 780 |
| Sauce César | Sauces | `www/Items/sauce-cesar.webp` | 14 954 |
| Sauce curry | Sauces | `www/Items/sauce-curry.webp` | 14 530 |
| Sauce hollandaise | Sauces | `www/Items/sauce-hollandaise.webp` | 14 780 |
| Sauce miel-moutarde | Sauces | `www/Items/sauce-miel-moutarde.webp` | 13 668 |
| Sauce napolitaine | Sauces | `www/Items/sauce-napolitaine.webp` | 14 348 |
| Sauce ranch | Sauces | `www/Items/sauce-ranch.webp` | 14 892 |
| Sauce samouraï | Sauces | `www/Items/sauce-samourai.webp` | 14 272 |
| Sauce soja | Sauces | `www/Items/sauce-soja.webp` | 14 120 |
| Sauce tartare | Sauces | `www/Items/sauce-tartare.webp` | 14 044 |
| Sauce teriyaki | Sauces | `www/Items/sauce-teriyaki.webp` | 13 754 |
| Sauce tomate | Sauces | `www/Items/sauce-tomate.webp` | 14 540 |
| Tabasco | Sauces | `www/Items/tabasco.webp` | 13 858 |
| Harissa | Sauces | `www/Items/harissa.webp` | 13 990 |
| Guacamole | Sauces | `www/Items/guacamole.webp` | 14 816 |
| Houmous | Sauces | `www/Items/houmous.webp` | 13 464 |
| Tapenade | Sauces | `www/Items/tapenade.webp` | 14 404 |
| Coulis de fruit | Sauces | `www/Items/coulis-de-fruit.webp` | 13 868 |
| Curcuma | Épices | `www/Items/curcuma.webp` | 14 876 |
| Curry | Épices | `www/Items/curry.webp` | 14 618 |
| Paprika | Épices | `www/Items/paprika.webp` | 14 748 |
| Poivre | Épices | `www/Items/poivre.webp` | 14 390 |
| Sel | Épices | `www/Items/sel.webp` | 14 968 |
| Chili | Épices | `www/Items/chili.webp` | 14 574 |
| Vanille | Épices | `www/Items/vanille.webp` | 14 354 |

**39/39 fichiers conformes à la limite de 15 000 octets** ; maximum mesuré : 14 968 octets. Les 37 variantes remplacent leurs fichiers existants ; les deux références sont conservées à l'identique.

Le contrôle visuel composé sur fonds clair et foncé à 192 et 48 pixels est complété par l’exécution du calcul réel de cadrage du chargeur sur les pixels encodés. Les caches v740 des 37 variantes sont invalidés en v741 ; ceux des références et des autres produits sont préservés. Le catalogue, le fallback SVG et la logique de réseau du service worker restent inchangés.

Validation locale : syntaxe des 25 fichiers JavaScript, compilation du script Python modifié et **347 tests Node réussis**. Le contrôle de taille porte sur les octets des fichiers intégrés, et les deux références sont protégées par un contrôle de leur SHA Git. Les étapes équivalentes de `scripts/validate_repo.sh` sont exécutées séparément, car cet environnement ne fournit pas `/dev/fd` pour la substitution de processus Bash de ce script. Le workflow de validation reste inchangé.
