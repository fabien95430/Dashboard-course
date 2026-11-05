# Audit des images produits — 4 novembre 2026

État inspecté : `main`, commit `3d2373dc87ecc34d1be4d205021febdf38f11c7a` (v739). Catalogue : 466 produits. Cette liste décrit cet état ; vérifier le dépôt courant avant chaque intervention.

**Décision utilisateur ultérieure :** après le lot v740, Mayonnaise devient la référence de toutes les sauces et préparations apparentées, Paprika celle de toutes les épices et assaisonnements secs, forme et étiquette incluses. Cette décision remplace les recommandations historiques ci-dessous qui proposaient Sauce au poivre/Curcuma comme modèles et conservaient les moulins Sel/Poivre. Les règles actuelles sont dans IMAGES_ITEMS.md ; les références Mayonnaise/Paprika v740 sont conservées à l'identique.

## Poids et résolution

Les 466 fichiers ont un canal de transparence. Poids minimum : 1 794 octets ; maximum : 80 644 ; médiane : 14 608. Aucun ne dépasse l'ancien plafond de 153 600 octets, mais **229 dépassent 15 000 octets**, dont 66 dépassent 40 000. Cela ne permet donc pas de déclarer tout le catalogue conforme à la consigne utilisateur de 15 Ko.

Pour toute prochaine génération, **15 000 octets maximum par WebP final** est un critère bloquant. Mesurer les fichiers, garder une vraie transparence et vérifier la qualité après compression. La limite et la palette sont consignées dans [IMAGES_ITEMS.md](IMAGES_ITEMS.md).

Dans le précédent lot de neuf, restent au-dessus de 15 Ko : Noisettes (38 972), Noix (33 542), Oignons jaunes (28 888), Pansements (17 814), Tapenade (34 886 octets). Les quatre autres sont sous la limite. Ne pas confondre correction de contour et conformité de poids.

21 fichiers sont encore en 84 × 84 pixels : Compotes bébé, Sacs à couches, Petits pois carottes, Mouchoirs poche, Antiseptique, Baume lèvres, Désinfectant, Lingettes ménage, Pinces à linge, Sacs linge délicat, Mouchoirs, Sacs poubelle 30L, Sacs poubelle 50L, Sacs zip, Serviettes papier, Essuie-verres, Grattoirs, Torchons, Pâté, Poisson pané, Saucisses. Leur résolution appelle une revue, sans prouver à elle seule un défaut de contour.

## Contours à refaire

33 visuels présentent un contour blanc externe de type autocollant lors de la revue visuelle :

| Groupe | Produits |
| --- | --- |
| Boissons (1) | Jus d'ananas |
| Épicerie (7) | Baguette, Pain aux céréales, Pain complet, Pain de mie, Pains burger, Tortillas, Vanille |
| Frais (6) | Brie, Cheddar, Chèvre, Emmental, Roquefort, Pâtes fraîches |
| Snacks (5) | Bretzels, Biscuits beurre, Biscuits chocolat, Chocolat au lait, Chocolat noir |
| Viandes et poissons (14) | Bacon, Chorizo, Jambon blanc, Jambon cru, Cabillaud, Moules, Saumon fumé, Thon frais, Truite, Thon en boîte, Agneau, Côtes de porc, Poulet, Veau |

Trois autres sources atteignent le bord du canevas et nécessitent une vérification des marges : Chili, Vinaigre de vin, Rosette. Ce constat ne prouve pas à lui seul qu'une partie de l'objet manque.

## Harmonisation par famille

Les couleurs déjà validées le 1er novembre sont reprises dans IMAGES_ITEMS.md : riz bleu et pâtes beige à préserver, céréales ocre, conserves sauge, sauces tomate brique, crémeuses taupe, épicées terracotta, huiles/vinaigres olive doré, sucré nude rosé, épices cannelle et boulangerie beige chaud. Aucun nouveau code couleur exact n'est présenté comme validé.

| Famille | Constat et direction |
| --- | --- |
| Conserves | Mélange de boîtes ouvertes et fermées, d'étiquettes rouges, crème ou absentes. Références à conserver : Haricots rouges, Lentilles, Pois chiches. Harmoniser les six autres avec métal argenté, étiquette crème, accent sauge et contenu identifiable. |
| Épices | Paprika a un couvercle gris et une silhouette différents de Curry/Curcuma. Reprendre leur petit bocal fermé avec accent cannelle discret. Préserver le duo Sel/Poivre déjà cohérent. |
| Sauces | Mayonnaise et Sauce tomate ont des finitions différentes des bocaux dorés de Sauce au poivre/Ranch. Reprendre la silhouette et le couvercle de famille avec accents taupe et brique. Ne pas imposer le même pot aux sauces, aux épices et aux crèmes. |
| Jus | Mélange de verres, bouteilles et briques. Jus d'ananas cumule contour blanc et style différent. Prendre les bouteilles Pomme/Raisin comme références ; aucune palette spécifique aux jus n'a été validée. |
| Produits ménagers | Désinfectant, Désodorisant textile et Détachant à rapprocher des trois nettoyants cohérents. Revue à programmer, sans nouvelle palette inventée. |
| Boulangerie, fromages, snacks | Traiter le contour et l'harmonisation ensemble, en une seule régénération par produit. |

Préserver les familles déjà cohérentes : les laits, les pâtes beiges, les riz bleus, les vins, les bières, les sachets bleus de surgelés, les pots de fruits secs apéritifs et les yaourts. Les formats naturels différents restent possibles : une conserve de thon peut être ronde et celles de sardines/maquereaux rectangulaires.

## Premier lot autorisé : dix produits

| Produit | Fichier | Référence principale | Correction |
| --- | --- | --- | --- |
| Champignons en boîte | `champignons-en-boite.webp` | Haricots rouges | Étiquette crème/sauge, boîte fermée |
| Concentré de tomate | `concentre-de-tomate.webp` | Pois chiches | Petite boîte fermée crème/sauge |
| Maïs en boîte | `mais-en-boite.webp` | Lentilles | Boîte fermée, contenu représenté sur étiquette |
| Petits pois carottes | `petits-pois-carottes.webp` | Lentilles | Résolution et boîte crème/sauge |
| Raviolis en boîte | `raviolis-en-boite.webp` | Haricots rouges | Remplacer l'habillage rouge par la famille sauge |
| Tomates pelées | `tomates-pelees.webp` | Pois chiches | Boîte fermée crème/sauge |
| Paprika | `paprika.webp` | Curcuma | Bocal d'épices fermé, finition dorée/cannelle |
| Mayonnaise | `mayonnaise.webp` | Sauce au poivre | Bocal fermé, accent taupe |
| Sauce tomate | `sauce-tomate.webp` | Sauce au poivre | Bocal fermé, accent rouge brique |
| Jus d'ananas | `jus-d-ananas.webp` | Jus de pomme | Bouteille cohérente et suppression du contour blanc |

Ce lot comprend neuf harmonisations et un produit de la liste des 33 contours. Une fois validé, il restera donc 32 produits de cette liste, sous réserve du contrôle effectif des résultats. Les autres anomalies ne sont pas considérées corrigées par ce lot.

### Résultats du premier lot

WebP encodés, transparence et marges vérifiées, revue sur fonds clair/foncé à 192 et 48 pixels. Le calcul réel du cadrage de `product-item-images.js` a été exécuté sur les pixels des dix fichiers : les limites des zones Catalogue et Ma liste sont respectées. Migration du cache v739 vers v740 vérifiée, autres cadrages conservés. Ces contrôles de source et de rendu composé ne remplacent pas un essai interactif sur iPhone ou sur une session Home Assistant réelle, non exécuté ici.

| Produit | Poids final en octets |
| --- | ---: |
| Champignons en boîte | 13 860 |
| Concentré de tomate | 13 272 |
| Maïs en boîte | 14 868 |
| Petits pois carottes | 14 856 |
| Raviolis en boîte | 14 868 |
| Tomates pelées | 13 736 |
| Paprika | 14 748 |
| Mayonnaise | 12 918 |
| Sauce tomate | 14 788 |
| Jus d'ananas | 9 558 |

Les dix fichiers satisfont la limite de 15 000 octets. Le validateur des prochaines générations applique aussi cette limite ; son test couvre l'acceptation à 15 000 et le refus à 15 001 octets. Les 32 autres contours et les trois cas de marge restent à traiter. Les chiffres de l'inventaire ci-dessus décrivent v739, avant ce lot.

## Contrôle de chaque livraison

1. Lire le catalogue, le chargeur d'images et les références sur `main`.
2. Générer un seul produit par image, avec palette, conditionnement et proportions corrects.
3. Encoder un WebP unitaire et mesurer son poids réel : maximum 15 000 octets.
4. Examiner l'alpha, les marges, les contours sur fond clair/foncé et la lisibilité aux tailles Catalogue et Ma liste.
5. Conserver les produits déjà validés et les invariants Home Assistant/sécurité. Ne pas ajouter de dépendance.
6. Lors de l'intégration, suivre la version globale, l'invalidation du cache, les tests et le commit atomique prescrits par AGENTS.md. Distinguer les contrôles effectués des vérifications qui n'ont pas pu être exécutées.

## Suivi après harmonisation des sauces et épices v741

37 variantes refaites sur les deux références Mayonnaise/Paprika, 39 fichiers de famille sous 15 000 octets chacun. Voir [le relevé détaillé](HARMONISATION_SAUCES_EPICES_2026-11-04.md). Les fichiers sources de Mayonnaise et Paprika v740 sont conservés.

Vanille rejoint les corrections de contour réalisées : sur les 33 constats v739, Jus d’ananas a été corrigé en v740 et Vanille en v741 ; il reste **31 contours** de cette liste. Chili a désormais son bocal d'assaisonnement fermé avec marge ; les deux autres cas de marge à revoir sont Vinaigre de vin et Rosette. Les cinq fichiers du précédent lot de neuf dépassant 15 Ko restent un sujet distinct, sauf Tapenade qui est remplacée et passe sous la limite avec ce lot.

## Suivi du lot contours v742

Source relue : `49f19a5e8951089a1e25e65491ac2c897cff3001`. Dix corrections : six pains/tortillas et Brie, Cheddar, Chèvre, Emmental. Références de style : Pain et Gouda ; produits conservés sans emballage ajouté. Génération par édition des images avec ces références, suppression du liseré externe en conservant les croûtes naturelles, transparence et marges.

| Fichier | Octets |
| --- | ---: |
| `baguette.webp` | 13684 |
| `pain-aux-cereales.webp` | 14824 |
| `pain-complet.webp` | 14096 |
| `pain-de-mie.webp` | 14362 |
| `pains-burger.webp` | 13848 |
| `tortillas.webp` | 13792 |
| `brie.webp` | 13810 |
| `cheddar.webp` | 14604 |
| `chevre.webp` | 14664 |
| `emmental.webp` | 14968 |

10/10 sous 15 000 octets. Revue des WebP sur fonds clair/foncé à 192 et 48 px, calcul réel du cadrage exécuté, migration v741/v742 vérifiée. Catalogue, fallback SVG et logique réseau du service worker inchangés. Pas de test interactif iPhone ou Home Assistant réel. Il reste **21 contours** de la liste initiale, ainsi que les deux cas de marge Vinaigre de vin et Rosette.

## Suivi du lot contours v743

Source relue : `588c137a745f2637db1f6162b5ad995d5ad3e8ca`. Roquefort, Pâtes fraîches, Bretzels, Biscuits beurre, Biscuits chocolat, Chocolat au lait, Chocolat noir, Bacon, Chorizo et Jambon blanc : suppression des contours externes, présentations conservées sans nouvel emballage ni marque. Édition par outil intégré avec images sources ; Gouda et Blanc de poulet servent aussi de références de famille.

| Fichier | Octets |
| --- | ---: |
| `roquefort.webp` | 14918 |
| `pates-fraiches.webp` | 14996 |
| `bretzels.webp` | 14936 |
| `biscuits-beurre.webp` | 14438 |
| `biscuits-chocolat.webp` | 14168 |
| `chocolat-au-lait.webp` | 14924 |
| `chocolat-noir.webp` | 14500 |
| `bacon.webp` | 13802 |
| `chorizo.webp` | 13748 |
| `jambon-blanc.webp` | 14632 |

10/10 sous 15 000 octets, transparence et marges contrôlées. Revue sur fonds clair/foncé à 192 et 48 px, calcul réel de cadrage et migration v742/v743 vérifiés. Catalogue, fallback SVG et logique réseau du service worker inchangés. Aucun test interactif iPhone ou Home Assistant réel. Il reste **11 contours** : Jambon cru, Cabillaud, Moules, Saumon fumé, Thon frais, Truite, Thon en boîte, Agneau, Côtes de porc, Poulet, Veau. Les cas de marge Vinaigre de vin et Rosette restent distincts.

## Suivi du dernier lot de contours v744

Source relue : `23ea778c8f7ffc371806603ef25d998b6bbe19b7`. Les onze derniers produits Viandes & poissons ont été édités à partir de leurs sources, avec Saumon, Dinde et Maquereaux comme références de famille. Même rendu, éclairage et niveau de détail ; identité, préparation et formes naturelles préservées. Le thon conserve sa boîte ronde ouverte. Aucun nouvel accessoire, emballage, texte ou marque.

| Fichier | Octets |
| --- | ---: |
| `jambon-cru.webp` | 14642 |
| `cabillaud.webp` | 14094 |
| `moules.webp` | 14704 |
| `saumon-fume.webp` | 13956 |
| `thon-frais.webp` | 14500 |
| `truite.webp` | 14424 |
| `thon-en-boite.webp` | 14694 |
| `agneau.webp` | 14294 |
| `cotes-de-porc.webp` | 14788 |
| `poulet.webp` | 14978 |
| `veau.webp` | 14740 |

11/11 sous 15 000 octets. Transparence, marges, revue sur fonds clair/foncé à 192 et 48 px, calcul réel de cadrage et migration v743/v744 contrôlés. Catalogue, fallback SVG et logique réseau du service worker inchangés ; aucun test interactif iPhone ou Home Assistant réel. **Les 33 contours de la liste initiale sont désormais traités.** Les deux cas de marge Vinaigre de vin/Rosette, la revue des sources 84 px et les autres harmonisations/poids hérités restent des sujets distincts : cela ne signifie pas que les 466 produits ont tous été régénérés ou ramenés sous 15 Ko.

## Correction de méthode et cohérence de famille v745

Le traitement des 33 contours ne vaut pas validation de la cohérence de tous les produits. La précédente consigne de conservation systématique des formes sources a conservé à tort une truite entière parmi des poissons frais en portions. Source relue : `6e35569bf875b66ff3ac22464a71bf210451c733`. Comparaison visuelle actuelle de Truite, Saumon, Cabillaud et Thon frais : Truite est remplacée par une portion crue à chair rose clair et peau argentée, dans le rendu des portions voisines. Moules, tranches fumées et conserves gardent leur présentation propre.

`truite.webp` : 14 306 octets, alpha transparent, marges et revue sur fonds clair/foncé à 192/48 px ; calcul réel du cadrage et migration v744/v745 contrôlés. Catalogue, fallback SVG et logique réseau du service worker inchangés. Aucun essai interactif iPhone/HA réel.

Désormais chaque lot vérifie et consigne séparément : identité du sujet, forme de vente, préparation, présentation, proportions, accessoires, couleurs/emballage, style de famille, contours et poids. Remplacer l’image si sa représentation est incohérente même avec un contour propre. Ne pas déclarer les 466 produits cohérents sur la seule base des corrections de contour. Cette revue complète reste à poursuivre sur les autres familles et les cas de marge déjà signalés.

## Harmonisation des pulvérisateurs ménagers v746

Source relue : `c5186a2b79780387af81bc884b79f1c47dcf5fc1`. Revue de Désinfectant, Désodorisant textile et Détachant avec Nettoyant multi-usages, Nettoyant salle de bain et Nettoyant vitres. Les trois références sont conservées ; seules les trois représentations qui détonnent sont remplacées, sans compléter artificiellement le lot avec des produits déjà cohérents.

| Produit | Constat de cohérence | Correction | Octets WebP |
| --- | --- | --- | ---: |
| Désinfectant | Petit atomiseur 84 px, échelle et conditionnement différents des pulvérisateurs voisins | Flacon ménager ergonomique entier, tête blanche et accents rouges, contenu gris clair, étiquette crème | 13 614 |
| Désodorisant textile | Silhouette proche, mais étiquette illustrée et finition à rapprocher des références | Même flacon de famille, accents lavande, étiquette crème vierge ; dessin de lavande généré puis retiré car aucun parfum n'est précisé au catalogue | 14 318 |
| Détachant | Rendu plus plat, forme et pictogramme différents | Volume du flacon de famille, tête blanche, accents orange et contenu blanc, étiquette crème | 13 228 |

Contrôle complet : bon produit et bon conditionnement, proportions, présentation, accessoires absents, couleurs existantes reprises, étiquette, style de famille, alpha, marges, contours et poids. Les trois WebP finaux font 384 × 384 px et restent sous 15 000 octets. Génération/édition par outil intégré avec références, encodage WebP standard sans peinture du fond ni remplacement manuel de l'alpha. Revue sur fonds clair/foncé à 192/48 px ; calcul réel du cadrage Catalogue/Ma liste et migration v745/v746 vérifiés. Catalogue, fallback SVG et logique réseau du service worker inchangés ; aucun essai interactif iPhone ou Home Assistant réel.

Validation locale : 350/350 tests Node réussis, syntaxe JavaScript et compilation Python valides, différences Git sans erreur. Le script de validation est bloqué ici par l’absence de `/dev/fd` ; les mêmes vérifications ont été exécutées séparément, sans modification du validateur.

Ce contrôle valide les trois visuels remplacés dans leur sous-groupe, pas l'ensemble des produits Maison. Les anciennes références Nettoyant multi-usages (16 876 octets), Nettoyant salle de bain (17 284) et Nettoyant vitres (16 032) restent inchangées ; leur poids hérité ne vaut pas autorisation de dépasser la limite sur une nouvelle image. Les bidons Javel/lessive et flacons WC ne doivent pas être transformés en pulvérisateurs par simple uniformisation.

Prochain groupe identifié lors de la revue : les jus. Jus d'orange est une brique avec paille, Jus multifruits une brique illustrée et Jus de tomate une bouteille étiquetée/bouchon rouge, contrairement aux bouteilles Pomme/Raisin/Ananas. À harmoniser avec les références de jus, en conservant les couleurs naturelles des boissons ; aucune nouvelle palette d'emballage n'a été validée pour ce groupe. La revue complète du reste du catalogue et les marges Vinaigre de vin/Rosette restent à poursuivre.

## Harmonisation des jus v747

Source relue : `b635101f46aecdcf962013548a1aea2d6c449edb`. Les six jus de `catalog.js` ont été comparés : Pomme, Raisin et Ananas sont conservés, Orange, Multifruits et Tomate sont remplacés dans le style de la bouteille Ananas. Le périmètre est bien la famille des jus, pas tous les articles du sous-groupe Eaux & jus.

| Produit | Constat de cohérence | Correction | Octets WebP |
| --- | --- | --- | ---: |
| Jus d’orange | Brique avec paille, présentation différente des bouteilles de référence | Bouteille en verre fermée, bouchon doré, jus orangé avec pulpe fine | 10 326 |
| Jus multifruits | Brique illustrée, emballage dominant et ancien fichier de 20 358 octets | Bouteille de famille, mélange homogène abricot-orangé, sans inventer de recette ni de fruits accessoires | 9 428 |
| Jus de tomate | Bouteille à bouchon rouge et grande étiquette illustrée | Bouteille de famille à bouchon doré, boisson rouge tomate sans étiquette | 9 110 |

Contrôle complet : sujet et conditionnement, couleurs naturelles, présentation, proportions, absence d'accessoires et de marque/texte, verre/couvercle, style de famille, alpha, marges, contours sur fonds clair/foncé et poids. Les trois fichiers unitaires font 384 × 384 px et pèsent chacun moins de 15 000 octets après encodage. Génération par outil intégré avec références réelles, sans API payante du projet ; encodage WebP standard, transparence conservée sans fond artificiel ni peinture de l'alpha. Revue à 192/48 px, calcul réel du cadrage Ma liste/Catalogue et migration v746/v747 vérifiés. Les noms et groupes du catalogue, le fallback SVG et la logique réseau du service worker sont conservés. Aucun essai interactif iPhone ou Home Assistant réel.

Validation locale : 350/350 tests Node réussis, 25 contrôles de syntaxe JavaScript et compilation Python valides, `git diff --check` sans erreur. Le validateur Bash est bloqué dans cet environnement par l’absence de `/dev/fd` ; ses mêmes contrôles ont été lancés séparément, sans modifier le script ni la CI.

Les règles de cette famille sont ajoutées à IMAGES_ITEMS.md et au prompt de génération pour éviter le retour des briques ou d'illustrations accessoires. Cette livraison ne valide pas la cohérence de tous les produits Boissons ; les autres harmonisations du catalogue, les deux cas de marge Vinaigre de vin/Rosette et les anciens poids hors limite restent à examiner séparément.

## Étiquettes fruitées validées sur les six jus v748

Source relue : `60066dbd023a42961dd69970ea48fe45919c28eb`. L’utilisateur a demandé une référence au fruit pour distinguer les jus et a validé l’aperçu Orange avec une petite étiquette crème illustrée. Cette décision remplace la règle v747 sans étiquette, et autorise le remplacement des six visuels, y compris les anciennes références Pomme/Raisin/Ananas.

Référence canonique : le nouveau `jus-d-orange.webp`, dérivé directement de l’aperçu accepté. Même bouteille en verre, épaules/col/proportions, bouchon doré et petite étiquette basse crème à coins arrondis et double filet discret. Les cinq variantes reprennent cette référence ; Raisin adopte aussi le bouchon doré. Chaque fruit est uniquement imprimé sur l’étiquette ; aucun fruit physique ni texte/marque n’est ajouté. Multifruits utilise un assortiment visuel générique orange/pomme/raisin, sans affirmer de recette ni de proportions. Les couleurs naturelles des boissons restent distinctes.

| Produit | Illustration imprimée | Octets WebP |
| --- | --- | ---: |
| Jus d’orange | Orange et demi-orange | 10 686 |
| Jus de pomme | Pomme et demi-pomme | 11 084 |
| Jus de raisin | Grappe de raisin | 10 946 |
| Jus d’ananas | Ananas et tranche | 10 708 |
| Jus multifruits | Petit assortiment générique | 12 100 |
| Jus de tomate | Tomate et demi-tomate | 10 814 |

6/6 fichiers unitaires en 384 × 384 px sous 15 000 octets après encodage. Alpha transparent et marges vérifiés, revue sur fonds clair/foncé à 192/48 px. La première variante Multifruits présentait un voile hors de la bouteille : rejetée, nettoyée par édition avec l’outil de génération puis contrôlée à nouveau ; seule la variante corrigée est intégrée. Aucun fond artificiel ni retouche manuelle de l’alpha. L’aperçu Orange accepté est réutilisé sans nouvelle génération.

Calcul réel du cadrage Catalogue/Ma liste exécuté sur les pixels des six fichiers : pas de rognage. Migration du cache v747/v748 vérifiée : nouveaux cadrages recalculés, autres images conservées. Noms/groupes du catalogue, fallback SVG et logique réseau du service worker conservés. Version globale et URLs de chargement actualisées selon les conventions existantes. Aucun essai interactif iPhone ou Home Assistant réel. Les règles documentées et le prompt automatique sont actualisés pour les prochaines générations ; le reste du catalogue et les cas de marge historiques restent à examiner séparément.

Validation v748 : 350/350 tests Node réussis, 25 fichiers JavaScript valides, compilation Python et différences Git contrôlées. Le script Bash reste inchangé ; faute de `/dev/fd` dans cet environnement, ses mêmes contrôles ont été exécutés séparément.

## Revue des huiles et vinaigres v749

Source relue : `3153134083e66f7c81e9bea04234ea57733a9973`. Les cinq produits alimentaires ont été comparés : Huile d’olive, Huile de tournesol, Vinaigre balsamique, Vinaigre de cidre et Vinaigre de vin. Les deux huiles ont déjà des flacons assortis à anse/bouchon vert ; leur représentation est conservée, seul l’encodage est optimisé. Les références Balsamique/Cidre sont déjà cohérentes et restent inchangées. Vinaigre de vin était une carafe à bouchon de verre touchant les bords haut/bas : sa présentation est remplacée par une bouteille élancée de la famille des vinaigres, avec bouchon doré et étiquette crème illustrée de raisin, liquide grenat transparent distinct du balsamique et du cidre.

| Produit | Traitement | Avant (octets) | Après (octets) | Dimensions finales |
| --- | --- | ---: | ---: | --- |
| Huile d’olive | Source conservée, redimensionnement/encodage WebP standard | 42 110 | 14 144 | 256 × 256 |
| Huile de tournesol | Source conservée, redimensionnement/encodage WebP standard | 41 142 | 14 920 | 320 × 320 |
| Vinaigre de vin | Nouvelle représentation avec références Cidre/Balsamique | 8 936 | 12 420 | 384 × 384 |

3/3 fichiers modifiés sous 15 000 octets. Les sources des huiles restent reconnaissables et lisibles à 192/48 px ; pas de régénération ni nouveau dessin pour ces deux produits. Aucun nouvel accessoire ni changement de palette. Transparence, marges et contours examinés sur fonds clair/foncé ; calcul réel du cadrage Catalogue/Ma liste et migration v748/v749 vérifiés. Le cas de marge Vinaigre de vin est corrigé ; **Rosette reste le cas de marge à revoir** parmi les trois cas historiques (Chili déjà corrigé en v741). Cela ne clôt pas la revue du reste du catalogue ou des poids hérités.

Les noms/groupes du catalogue, fallback SVG, logique réseau du service worker et invariants Home Assistant/sécurité sont conservés. Version globale et chargements mis à jour selon les conventions du dépôt. Aucun essai interactif iPhone ou Home Assistant réel. La règle des vinaigres est enregistrée dans IMAGES_ITEMS.md et le prompt automatique pour éviter le retour de la carafe rognée et préserver les deux sous-familles huiles/vinaigres.

Validation v749 : 350/350 tests Node réussis, 25 fichiers JavaScript et compilation Python valides, `git diff --check` sans erreur. Le validateur Bash est inchangé ; ses mêmes contrôles ont été lancés séparément car `/dev/fd` est absent de cet environnement.

## Revue complète des charcuteries v750

Source relue : `b2548c49281dbf6aee1fcef604695ef9aecefe95`. Les treize charcuteries du catalogue ont été comparées. Bacon, Chorizo, Jambon blanc et Jambon cru restent conservés, déjà corrigés et sous la limite. Parmi les neuf autres, trois représentations sont refaites : Rosette (marges insuffisantes et plusieurs gros segments), Pâté (ancienne vignette 84 px en pot à fermeture mécanique), Blanc de poulet (persil décoratif ajouté). Coppa, Lardons, Mortadelle, Peperroni et Rillettes conservent leur représentation et reçoivent un encodage optimisé. Le contrôle final a révélé un halo gris de sol sous Saucisson : il est supprimé par édition avec l’outil de génération, puis la variante est encodée et contrôlée de nouveau.

Rosette reprend le rendu des saucissons secs tout en gardant son identité : coupe rosée à gros grains de gras blanc, boyau à fleur naturelle, un saucisson et deux tranches avec marge. Le blanc naturel du boyau n’est pas un liseré externe à effacer. Blanc de poulet reste une charcuterie en tranches cuites ivoire à bord doré, sans persil ; aucun filet cru ajouté. Pâté reprend le bocal fermé à couvercle doré des Rillettes, avec texture dense finement hachée distincte de leurs fibres. Les préparations en bocal ne reprennent pas le modèle des sauces Mayonnaise. Les différences naturelles entre charcuteries sont conservées plutôt qu’une présentation unique imposée à tous les produits.

Le déploiement v749 précédemment bloqué par une erreur serveur GitHub Pages 502 a finalement réussi après relance (tentative 3). Cette résolution ne nécessite aucun nouveau commit pour v749.

| Produit | Octets finaux | Dimensions |
| --- | ---: | --- |
| Rosette | 13 946 | 256 × 256 |
| Pâté | 14 956 | 320 × 320 |
| Blanc de poulet | 14 998 | 384 × 384 |
| Coppa | 14 130 | 192 × 192 |
| Lardons | 14 634 | 256 × 256 |
| Mortadelle | 14 226 | 256 × 256 |
| Peperroni | 14 700 | 256 × 256 |
| Rillettes | 13 850 | 192 × 192 |
| Saucisson | 14 656 | 384 × 384 |

9/9 WebP modifiés sous 15 000 octets. Coppa et Rillettes ont nécessité une résolution de 192 px pour conserver les sources détaillées sous cette limite ; leur lisibilité a été examinée à 192 et 48 px, sans cacher cette réduction. Les autres fichiers ont 256, 320 ou 384 px. Blanc de poulet et Saucisson conservent le canevas 384 px imposé par les tests historiques, sans modifier ces tests ; Saucisson utilise une marge plus large et le cadrage automatique existant. Contrôle de la représentation, des couleurs naturelles, des accessoires, des textures de famille, de la transparence et des marges. Revue des neuf fichiers sur fonds clair/foncé ; Saucisson contrôlé à nouveau après retrait du halo. Le dernier cas de marge historique, Rosette, est corrigé : les trois cas Chili/Vinaigre de vin/Rosette ont désormais été traités, ce qui ne vaut pas validation complète du reste du catalogue.

Calcul réel de cadrage Ma liste/Catalogue et migration v749/v750 contrôlés sur les pixels finaux. Les autres cadrages, noms/groupes du catalogue, fallback SVG, logique réseau du service worker et invariants HA/sécurité sont conservés. Aucun essai interactif iPhone ou Home Assistant réel. Les consignes de charcuterie sont ajoutées à IMAGES_ITEMS.md et au prompt automatique. Les treize fichiers de cette famille sont maintenant sous 15 000 octets, y compris les quatre fichiers conservés.

Validation v750 : 350/350 tests Node réussis, syntaxe des 25 fichiers JavaScript et compilation Python valides, `git diff --check` sans erreur. Les contrôles du validateur Bash ont été exécutés séparément car `/dev/fd` est absent de cet environnement ; script et tests historiques conservés.

## Revue des yaourts et desserts v751

Source relue : `18c22a94e41bc4e6ba4a1c0da5760c4ddb247191`. Comparaison des douze produits : Crème dessert chocolat/vanille, Fromage blanc, Petits-suisses, Riz au lait, Skyr, Yaourt, Yaourt à boire, Yaourts fruits/grecs/nature/vanille. Les huit images déjà validées et sous la limite sont conservées. Les conditionnements restent adaptés au produit, sans imposer le pot des sauces à cette famille.

Deux corrections de représentation : Riz au lait conserve son pot en verre fermé et ses grains crémeux, sans garniture brune non précisée ; Yaourt à boire conserve sa bouteille et son illustration imprimée de fraise, sans fruit physique posé devant ni ombre de sol. Édition par outil intégré avec sources existantes, transparence conservée. Yaourts fruits et Yaourts grecs conservent leur dessin approuvé et reçoivent uniquement un encodage optimisé.

| Produit | Octets finaux | Dimensions |
| --- | ---: | --- |
| Riz au lait | 13894 | 320 × 320 |
| Yaourt à boire | 13796 | 384 × 384 |
| Yaourts fruits | 14930 | 320 × 320 |
| Yaourts grecs | 14782 | 256 × 256 |

4/4 fichiers modifiés sous 15 000 octets ; les douze produits du groupe sont désormais sous cette limite. Alpha, marges, représentation, couleurs, accessoires et lisibilité examinés sur fonds clair/foncé à 192/48 px. Calcul réel du cadrage Catalogue/Ma liste et migration v750/v751 vérifiés. Les dimensions imposées par les anciens tests (Yaourt à boire 384 px, Yaourts grecs 256 px) sont conservées. Noms/groupes du catalogue, fallback SVG et logique réseau du service worker inchangés. Aucun essai interactif iPhone ou Home Assistant réel. Consignes de génération mises à jour ; cette revue ne valide pas le reste du catalogue.

Validation v751 : 350/350 tests Node réussis, syntaxe JavaScript et compilation Python valides, différences Git sans erreur. Faute de `/dev/fd`, les contrôles du validateur Bash ont été exécutés séparément ; script et tests conservés.

Deux tests historiques sont précisés : distinguer Riz au lait des riz en paquet dans le contrôle d’invalidation, et vérifier la conservation du cache sur la version courante plutôt que figer v732 après remplacement d’un de ses visuels. Les assertions de format, transparence et invalidation restent actives.

## Revue des crèmes et mascarpone v752

Source relue : `c2aa17e298a6aa97cb7e485e6e8a2e25897178a5`. Crème épaisse (11 532 octets), Crème fraîche (11 808), Crème liquide (7 160) et Beurre (7 952) restent conservés : conditionnements adaptés et poids sous la limite. La fermeture du Mascarpone était visuellement ambiguë ; remplacement par un pot bas et large à couvercle opaque, rebord et languette explicites, sans transformer le produit en bocal de sauce.

Mascarpone : **11 794 octets**, WebP 384 × 384, alpha transparent et marges vérifiés, revue sur fonds clair/foncé à 192/48 px. Calcul réel de cadrage Catalogue/Ma liste et migration v751/v752 réussis. Catalogue, fallback SVG et logique réseau du service worker inchangés ; aucun essai interactif iPhone/HA réel. Les cinq fichiers de cette revue sont sous 15 000 octets. Consignes et prompt précisés pour la fermeture du mascarpone. Les autres familles restent à examiner.

Validation v752 : 350/350 tests Node réussis, syntaxe JavaScript et compilation Python valides, différences Git contrôlées. Le validateur Bash nécessite `/dev/fd`, absent ici ; contrôles équivalents exécutés séparément sans modifier script ou tests.

## Catégorie Boulangerie — revue complète v754

Source relue : `7cd0781f42ddd8330778dc81e63259d22426d61f` (v753). Les douze produits de Boulangerie ont été comparés : Baguette, Brioche, Croissants, Galettes de blé, Pain, Pain aux céréales, Pain complet, Pain de mie, Pains au chocolat, Pains burger, Pains hot-dog et Wraps. Tortillas, du groupe Monde & pratique, est une référence voisine examinée mais n’est pas comptée comme un treizième produit de Boulangerie.

Sept fichiers déjà corrects et sous la limite restent conservés. Brioche, Pain, Pains au chocolat et Pains hot-dog gardent leur représentation et reçoivent uniquement un encodage optimisé. Croissants est édité avec l’outil intégré pour retirer l’ombre grise externe, sans supprimer les creux naturels du feuilletage. Aucun emballage ou accessoire ajouté. Couleurs de cuisson, mie et graines naturelles conservées.

| Produit modifié | Octets finaux | Dimensions |
| --- | ---: | --- |
| brioche | 14734 | 256 × 256 |
| croissants | 14504 | 320 × 320 |
| pain | 14096 | 192 × 192 |
| pains-au-chocolat | 14734 | 256 × 256 |
| pains-hot-dog | 14950 | 320 × 320 |

5/5 fichiers modifiés sous 15 000 octets ; les douze images de la catégorie sont désormais sous cette limite. Pain utilise une source finale 192 px pour respecter le poids : lisibilité contrôlée à 192 et 48 px. Revue des cinq WebP sur fonds clair/foncé, alpha et marges vérifiés ; calcul réel de cadrage Ma liste/Catalogue et migration v753/v754 réussis. Noms/groupes du catalogue et fallback SVG conservés. Aucun test interactif iPhone ou Home Assistant réel.

La correction du cache v753 est conservée : aucune liste cumulative de visuels réintroduite dans sw.js, cache persistant et revalidation conditionnelle inchangés. Seuls les cadrages locaux des cinq images remplacées sont invalidés. Cette livraison clôt la revue de cette catégorie, pas celle de l’ensemble du catalogue.

Validation v754 : 348/348 tests de la branche main actuelle réussis, syntaxe JavaScript et compilation Python valides, `git diff --check` sans erreur. Validateur Bash inchangé ; ses contrôles ont été exécutés séparément faute de `/dev/fd` dans cet environnement. Prochaine catégorie à examiner : Fromages.

## Catégorie Fromages — revue complète v756

Source relue : `b8e2fa544e5d37ec39ea5a435baaeb0eba17c0f8` (v755). Les dix-huit fromages de catalog.js ont été comparés. Dix visuels déjà corrects et sous la limite restent conservés : Brie, Cheddar, Chèvre, Emmental, Fromage râpé, Mozzarella, Mozzarella râpée, Parmesan, Roquefort, Soignon.

Burrata, Feta et Ricotta sont édités avec l’outil intégré pour représenter le fromage seul : tomates, basilic, olives, herbes et huile ajoutés sont retirés. Conserver les couleurs naturelles, textures et formes distinctes ; la croûte blanche naturelle n’est pas un halo à supprimer. Camembert, Comté, Raclette et Reblochon conservent leur dessin et reçoivent un encodage optimisé. Aucun nouvel emballage, texte ou accessoire.

| Produit modifié | Octets finaux | Dimensions |
| --- | ---: | --- |
| burrata | 14226 | 384 × 384 |
| feta | 14858 | 384 × 384 |
| ricotta | 14776 | 384 × 384 |
| camembert | 14828 | 256 × 256 |
| comte | 14646 | 320 × 320 |
| gouda | 8792 | 384 × 384 |
| raclette | 13798 | 320 × 320 |
| reblochon | 14604 | 256 × 256 |

8/8 fichiers modifiés sous 15 000 octets. Les dix-huit images de la catégorie sont désormais sous la limite. Les canevas historiques 384 px de Burrata/Feta/Ricotta/Gouda sont conservés ; Ricotta et Gouda ont un cadrage plus aéré, compensé par le cadrage automatique existant. Contrôles de représentation, contours, transparence, marges et poids, revue sur fonds clair/foncé à 192/48 px. Aucun essai interactif iPhone ou Home Assistant réel.

Les correctifs récents de main sont conservés : cache persistant avec revalidation conditionnelle (v753), aucune liste cumulative réintroduite, affichage court du badge de version (v755). Catalogue et fallback SVG inchangés. Seuls les cadrages des huit images remplacées sont invalidés ; aucune modification HA/sécurité. Les consignes Fromages sont enregistrées dans IMAGES_ITEMS.md. La revue des autres catégories reste à poursuivre.

Le contrôle final de Gouda a révélé une ombre grise externe : elle est retirée par édition avec l’outil intégré, puis le fichier final est réencodé et revérifié.

Validation v756 : 349/349 tests de main réussis, syntaxe JavaScript et compilation Python valides, `git diff --check` sans erreur. Validateur Bash inchangé ; ses mêmes contrôles sont exécutés séparément faute de `/dev/fd`. Prochaine catégorie à examiner : Surgelés.

## Surgelés — v757

Source relue : main `7a872989985eeb0a3d51cb949113bb24da845047` (v756). Audit des dix produits Frais → Surgelés de catalog.js ; aucun retour sur les catégories déjà traitées. Huit fichiers modifiés, deux conservés : Glace chocolat (11 332 octets) et Glaçons (10 682 octets). Poisson surgelé appartient à Viandes & poissons → Surgelés et reste hors de ce lot.

Cohérence de famille : Épinards surgelés et Frites surgelées reprennent le sachet large bleu glacier à flocon blanc de Haricots verts surgelés. Épinards reste en feuilles vert foncé et Frites montre des bâtonnets pâles surgelés non cuits. Poêlée de légumes conserve ses courgettes, champignons, carottes, poivrons et oignons, avec un flocon blanc opaque corrigé : la source avait un flocon mal détouré visible sur fond foncé. Les glaces en pots ne deviennent pas des sachets ; Chocolat et Vanille gardent leur forme et leurs couleurs distinctes.

Contours : Glace Nuii régénérée sans les traînées horizontales brunes parasites de la source, en conservant bâton, enrobage, éclats et morsure. Les autres sources déjà cohérentes sont conservées et réencodées. Quatre éditions intégrées avec l’outil image natif : Épinards, Frites, Nuii et Poêlée. Quatre optimisations des sources : Vanille, Haricots, Légumes et Petits pois. Aucun appel à l’API OpenAI payante du projet.

| Fichier dans `www/Items/` | Avant (octets) | Final (octets) | Canevas |
| --- | ---: | ---: | ---: |
| `epinards-surgeles.webp` | 5 626 | 14 972 | 256 px |
| `frites-surgelees.webp` | 31 274 | 14 642 | 256 px |
| `glace-nuii.webp` | 52 866 | 12 244 | 320 px |
| `glace-vanille.webp` | 15 442 | 14 138 | 384 px |
| `haricots-verts-surgeles.webp` | 16 300 | 14 590 | 256 px |
| `legumes-surgeles.webp` | 16 492 | 14 706 | 256 px |
| `petits-pois-surgeles.webp` | 16 508 | 14 564 | 256 px |
| `poelee-de-legumes.webp` | 15 286 | 14 242 | 256 px |

Les dix WebP de la catégorie sont sous 15 000 octets, poids finaux mesurés. Alpha véritable et marges conservés ; dimensions historiques 256 px des références Frais et 384 px de Vanille préservées, Nuii livré en 320 px. Le cadrage existant compense les marges sans ajout de règle de zoom spécifique. Contrôles visuels des fichiers encodés sur fonds clair/foncé à 192 et 48 px ; vérification calculée du cadrage réel Ma liste/Catalogue et de la migration du cache v756 vers v757. Aucun essai interactif iPhone ou Home Assistant réel.

Catalogue (noms/groupes), fallback SVG et logique réseau du service worker inchangés. Seuls les cadrages des huit fichiers remplacés sont invalidés ; cache visuel persistant et badge court préservés. Aucun changement HA, OAuth, WebSocket, coffre, verrouillage, biométrie ou mode test. Consignes enregistrées dans IMAGES_ITEMS.md et dans le prompt automatique : sachets bleus à flocon blanc opaque et contenu distinct, pots et bâtonnet de glace préservés.

Validation : 349/349 tests réussis, syntaxe JavaScript, compilation Python et `git diff --check` valides. Validateur Bash inchangé ; mêmes contrôles exécutés séparément car `/dev/fd/63` indisponible. Prochaine catégorie à examiner : Traiteur frais.

## Traiteur frais — v758

Source relue : main `80804f0c2989a8eed7621403c023711d1a454c0c` (v757). Quatre produits de catalog.js examinés ensemble : Gnocchis, Pâte à pizza, Pâtes fraîches et Quiche.

Cohérence : Gnocchis régénérés avec l’outil image natif, en conservant les gnocchis nature striés et en retirant le basilic et le disque/support beige ; présentation du produit seul harmonisée sur Pâtes fraîches. Aucun emballage unique imposé à cette catégorie hétérogène : rouleau emballé de Pâte à pizza, nid de Pâtes fraîches et Quiche entière déjà cohérents, conservés. Quiche réencodée sans modification du sujet. Aucun appel à l’API OpenAI payante du projet.

| Fichier dans `www/Items/` | Avant (octets) | Final (octets) | Action |
| --- | ---: | ---: | --- |
| `gnocchis.webp` | 21 434 | 14 372 | Retrait garniture/support ; WebP 384 px |
| `quiche.webp` | 28 530 | 14 738 | Compression ; WebP 256 px |
| `pate-a-pizza.webp` | 6 384 | 6 384 | Conservé |
| `pates-fraiches.webp` | 14 996 | 14 996 | Conservé |

Les quatre fichiers respectent la limite de 15 000 octets, mesurée après encodage. Contours, vraie transparence, marges et lisibilité des deux fichiers modifiés revus sur fonds clair/foncé à 192 et 48 px. Cadrage réel Ma liste/Catalogue calculé avec le code existant, sans rognage ; migration du cache v757 vers v758 vérifiée et cadrages des autres produits conservés. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique actualisés pour préserver les présentations distinctes et exclure les garnitures/supports des Gnocchis. Noms/groupes du catalogue, fallback SVG, logique réseau du service worker, cache persistant, badge court, HA, OAuth, WebSocket, coffre, verrouillage, biométrie et mode test inchangés. Invalidation des seuls cadrages Gnocchis/Quiche, aucune liste de visuels ajoutée dans sw.js.

Validation : 349/349 tests réussis, syntaxe JavaScript, compilation Python et `git diff --check` valides. Validateur Bash inchangé ; mêmes contrôles exécutés séparément car `/dev/fd/63` indisponible. Prochaine catégorie à examiner : Conserves.

## Reprise Frais demandée par l’utilisateur — v759

Source relue : main `39407f9a3be2d44e1a5091c3a4cd920a34aa8dd0` (v758). La clôture précédente de Frais est retirée : les tests techniques ne validaient pas suffisamment la représentation et l’échelle. Conserves est suspendu pour traiter les corrections Gnocchis, Gouda, Yaourt, Yaourts fruits et Mascarpone ; Yaourts vanille est harmonisé dans la même famille.

- Gnocchis : pâtes alimentaires sèches en petites coquilles courbes creuses et striées, dans le paquet beige à grande fenêtre de Conchiglie/Coquillettes. La présentation v758 en boulettes de pomme de terre est remplacée. Aucun changement du nom ni de la catégorie dans catalog.js.
- Gouda : même dessin conservé ; recadrage sur l’objet visible puis redimensionnement et compression. La marge invisible qui le réduisait est supprimée par recadrage standard, sans peindre ni modifier son alpha. Largeur visible après le cadrage automatique : 0,646 → 0,884 de la boîte image, soit environ +37 %.
- Yaourt, Fruits et Vanille : pot haut crème, couvercle rond, décor bleu et désignation générique assortis à Yaourts nature ; repères de parfum imprimés et bande inférieure bleu/rose/crème doré. Aucune marque ou donnée nutritionnelle inventée. Nature/Grecs/Skyr/Fromage blanc conservés. Fruits : largeur visible après cadrage 0,896 → 0,631, soit environ −30 %. Les trois pots ont une hauteur à moins de 0,011 et une largeur à moins de 0,020 de Nature dans la boîte image.
- Mascarpone : pot bas large fermé clairement identifié par une étiquette et un couvercle MASCARPONE crème/bleu, avec volute de crème imprimée. La boîte blanche anonyme est remplacée ; aucun bol réel ni crème exposée.

Cinq éditions/générations avec l’outil image intégré, un recadrage/redimensionnement standard du Gouda existant ; aucun appel à l’API OpenAI payante du projet. Les consignes et le prompt automatique sont corrigés pour remplacer les instructions incompatibles de v758.

| Fichier dans `www/Items/` | Avant (octets) | Final (octets) | Canevas |
| --- | ---: | ---: | ---: |
| `gnocchis.webp` | 14 372 | 14 370 | 384 px |
| `gouda.webp` | 8 792 | 14 982 | 384 px |
| `yaourt.webp` | 13 666 | 14 864 | 384 px |
| `yaourts-fruits.webp` | 14 930 | 13 610 | 256 px |
| `yaourts-vanille.webp` | 13 510 | 13 960 | 256 px |
| `mascarpone.webp` | 11 794 | 13 838 | 256 px |

Les six fichiers finaux respectent 15 000 octets, avec transparence réelle et marges. Les images encodées sont comparées sur fonds clair/foncé à 160 et 48 px avec le zoom et le décalage calculés selon le code réel ; comparaison avec Nature, Grecs, Skyr, Brie et Conchiglie. Mesures d’échelle anciennes/nouvelles vérifiées, aucun rognage dans les boîtes Ma liste/Catalogue. Migration v758/v759 vérifiée pour les six cadrages, autres produits conservés. Aucun essai interactif iPhone ou Home Assistant réel.

Validation : 349/349 tests, syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Noms/groupes du catalogue, fallback SVG, logique réseau du service worker, cache persistant, badge court, HA et sécurité inchangés ; aucune nouvelle liste de visuels dans sw.js. La catégorie Conserves reste en attente après cette reprise Frais.

## Séparation des deux familles de yaourts — v760

Source relue : main `2361d2f4c9711088c1d0d1b17f330d4e93469e67` (v759). Clarification utilisateur : Nature, Grecs et Skyr gardent le modèle crème/bleu ; les autres yaourts doivent suivre l’ancien Vanille. La généralisation v759 du décor bleu à Yaourt, Fruits et Vanille est donc annulée.

Référence exacte : `yaourts-vanille.webp` du commit v758 `39407f9a3be2d44e1a5091c3a4cd920a34aa8dd0`, restauré sans modification d’octets. Petit pot individuel blanc légèrement évasé avec opercule souple carré fermé, crème doré et fleur/gousse de vanille imprimées. Deux variantes générées avec l’outil image intégré : Yaourt blanc, opercule argent et vague bleu pâle sans parfum ; Fruits rose pâle avec fraise imprimée. Aucun texte, couvercle rond rigide ou décor botanique bleu dans ces trois pots.

| Fichier dans `www/Items/` | Final (octets) | Action |
| --- | ---: | --- |
| `yaourt.webp` | 14 216 | Pot avec opercule assorti à Vanille |
| `yaourts-fruits.webp` | 12 558 | Pot avec opercule et fraise imprimée |
| `yaourts-vanille.webp` | 13 510 | Restauration exacte du Vanille v758 |

Les trois fichiers sont sous 15 000 octets, transparents et lisibles. Comparaison visuelle sur fonds clair/foncé à 160 et 48 px avec le cadrage automatique : hauteur et largeur de Yaourt et Fruits à moins de 0,025 de celles de Vanille dans la boîte image. Pas de rognage dans les boîtes Ma liste/Catalogue. Nature, Grecs, Skyr, Fromage blanc, Gouda, Gnocchis et Mascarpone vérifiés identiques octet par octet à main v759.

Consigne et prompt automatique remplacés pour conserver cette séparation des familles. Noms/groupes du catalogue, fallback SVG, cache visuel persistant, badge court, logique réseau du service worker, HA, sécurité et mode test inchangés. Migration v759/v760 vérifiée pour les trois cadrages seulement. Aucun essai interactif iPhone ou Home Assistant réel.

Validation : 349/349 tests, syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Conserves reste en attente.

## Chocolat et nouveaux parfums — v761

Source relue : main `547134db5d014819a03d0eb2237a6ec5a4ce623a` (v760). Demande utilisateur : inclure Chocolat et autorisation d’ajouter des parfums. Crème dessert chocolat et Crème dessert vanille existent déjà : leurs noms sont conservés et leurs visuels sont harmonisés sur le petit pot à opercule de Yaourts vanille, en gardant les couleurs cacao/crème jaune pâle et une illustration de parfum imprimée. Ne pas créer un doublon « Yaourt chocolat » pour la crème dessert existante.

Deux produits ajoutés dans catalog.js, Frais → Yaourts & desserts : Yaourts citron et Yaourts noix de coco. Images unitaires correspondantes, sans aliment physique autour, texte ni marque. Mode Pot et achat à l’unité hérités du sous-groupe existant, vérifiés avec l’API réelle COURSES_QUANTITIES ; aucune modification du moteur de quantités ni de Home Assistant nécessaire. La liste HA Courses reste prioritaire.

| Fichier dans `www/Items/` | Final (octets) | Action |
| --- | ---: | --- |
| `creme-dessert-chocolat.webp` | 10 474 | Harmonisé |
| `creme-dessert-vanille.webp` | 11 742 | Harmonisé |
| `yaourts-citron.webp` | 11 092 | Nouveau produit |
| `yaourts-noix-de-coco.webp` | 11 198 | Nouveau produit |

Quatre générations/éditions avec l’outil image natif, WebP finaux 256 px sous 15 000 octets mesurés, transparence réelle et marges. Contrôle visuel sur fonds clair/foncé à 160 et 48 px avec le zoom/décalage du code existant : hauteur/largeur à moins de 0,04 du Vanille de référence dans la boîte image. Vérification calculée sans rognage Ma liste/Catalogue, migration ciblée du cache v760/v761, autres cadrages conservés. Nature, Grecs, Skyr, Fromage blanc et les yaourts v760 conservés. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés. Ajouts limités aux deux noms autorisés, pas de renommage, framework, dépendance, backend, changement de synchronisation, polling, OAuth, WebSocket, coffre, verrouillage ou biométrie. Fallback SVG et logique réseau du service worker inchangés ; cache persistant et badge court préservés.

Validation : 351/351 tests, dont deux tests d’intégration Catalogue/quantités/présence des WebP ; syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Conserves reste en attente.

## Revue de famille Conserves — main v761

Source relue : `6ecf5da34c620c293dc98b9d697e3160b7e8ef9c` (v761). Neuf produits Épicerie → Conserves inspectés ensemble à nouveau. Les corrections v740 sont déjà intégrées ; elles ne sont pas régénérées. Résultat : **neuf visuels conservés, aucun fichier image modifié**.

Cohérence : boîtes métalliques argentées fermées, étiquette crème, bandeau sauge, pictogramme sobre et représentation imprimée du contenu. Champignons émincés, concentré lisse rouge, haricots rouges, lentilles, maïs, petits pois/carottes, pois chiches, raviolis et tomates pelées restent distincts et identifiables. Concentré de tomate conserve sa petite boîte plus basse, adaptée au produit. Aucune nouvelle palette, marque ou représentation inventée.

| Produit | Fichier dans `www/Items/` | Octets mesurés |
| --- | --- | ---: |
| Champignons en boîte | `champignons-en-boite.webp` | 13 860 |
| Concentré de tomate | `concentre-de-tomate.webp` | 13 272 |
| Haricots rouges | `haricots-rouges.webp` | 12 286 |
| Lentilles | `lentilles.webp` | 13 790 |
| Maïs en boîte | `mais-en-boite.webp` | 14 868 |
| Petits pois carottes | `petits-pois-carottes.webp` | 14 856 |
| Pois chiches | `pois-chiches.webp` | 12 854 |
| Raviolis en boîte | `raviolis-en-boite.webp` | 14 868 |
| Tomates pelées | `tomates-pelees.webp` | 13 736 |

9/9 fichiers sous 15 000 octets. Contrôle visuel sur fonds clair/foncé à 160 et 48 px avec les cadrages calculés selon le code actuel. Lisibilité, contours, reflets métalliques naturels, étiquettes, marges et vraie transparence vérifiés. Calcul réel de measureVisualScale exécuté pour les neuf images : pas de rognage dans les boîtes Ma liste/Catalogue. Aucun essai interactif iPhone ou Home Assistant réel.

Documentation uniquement : aucune image, aucun cadrage, cache, numéro de version ou code de l’application modifié. Catalogue, Home Assistant, sécurité, mode test et mobile conservent exactement l’implémentation v761. La référence de famille est rappelée dans IMAGES_ITEMS.md. Prochaine catégorie à examiner : Monde & pratique.

Validation de cette revue : 351/351 tests réussis, syntaxe JavaScript et `git diff --check` valides. Validateur Bash inchangé ; contrôles exécutés séparément faute de `/dev/fd/63`.

## Monde & pratique — v762

Source relue : main `6f9d0b6592af5429dca75122192ca268ad852157` (application v761). Dix-sept produits examinés ensemble, avec leurs familles propres. Quatre fichiers modifiés et treize conservés : Chili, Couscous, Curcuma, Curry, Guacamole, Harissa, Nouilles chinoises, Paprika, Poivre, Purée en flocons, Sel, Soupes en brique, Tortillas.

Cohérence : Lait de coco reprend le cylindre métallique, l’étiquette crème, le bandeau sauge et le pictogramme des conserves ; l’illustration coco reste imprimée. Le candidat initial paraissait ouvert : corrigé avant intégration pour montrer un couvercle argenté continu fermé avec anneau d’ouverture. Les sauces Guacamole/Harissa gardent le modèle Mayonnaise et les épices Chili/Curcuma/Curry/Paprika/Poivre/Sel gardent leur modèle Paprika. Les paquets de céréales/nouilles, la soupe en brique, la purée en sachet et les tortillas nature conservent leurs présentations distinctes. Aucun contenant unique imposé à cette catégorie hétérogène.

Contours : Bouillon cubes garde sa boîte crème/ocre et ses illustrations imprimées, mais l’ombre/rectangle de sol sous la boîte est retiré par édition image. Croûtons et Nouilles instantanées conservent leurs dessins et sont réencodés sous la limite de poids. Deux visuels édités avec l’outil image intégré, deux compressions de sources ; aucun appel à l’API OpenAI payante du projet.

| Fichier dans `www/Items/` | Avant (octets) | Final (octets) | Canevas |
| --- | ---: | ---: | ---: |
| `bouillon-cubes.webp` | 9 754 | 14 870 | 384 px |
| `lait-de-coco.webp` | 23 434 | 14 570 | 320 px |
| `croutons.webp` | 25 638 | 14 654 | 256 px |
| `nouilles-instantanees.webp` | 17 978 | 14 690 | 384 px |

17/17 fichiers sous 15 000 octets après mesures. Les quatre WebP finaux sont revus sur fonds clair/foncé à 160 et 48 px avec le cadrage automatique, avec références Couscous, Nouilles chinoises, Purée, Soupes, Pois chiches, Tortillas, Paprika et Guacamole. Transparence réelle, marges et lisibilité conservées, aucun rognage calculé dans les boîtes Ma liste/Catalogue. Migration v761/v762 vérifiée pour les quatre cadrages, autres produits conservés. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés. Noms/groupes du catalogue, fallback SVG, logique réseau du service worker, cache persistant, badge court, HA, sécurité et mode test inchangés. Aucune liste de visuels introduite dans sw.js. Les deux empreintes Git de Bouillon/Nouilles instantanées dans le test historique d’intégrité sont actualisées pour les fichiers remplacés ; les onze autres empreintes, les dimensions imposées, les contrôles alpha et toutes les assertions restent conservés.

Validation : 351/351 tests, syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Prochaine catégorie à examiner : Pâtisserie & cuisine.

## Pâtisserie & cuisine — v763

Source relue : main `52b2d31793a7ca84fe7dc23ab1a2a116b23760e7` (v762). Quinze produits revus ensemble : six fichiers modifiés, neuf conservés (Amandes en poudre, Chapelure, Farine, Levure boulangère, Maïzena, Noix de coco râpée, Pâte feuilletée, Pépites chocolat, Vanille).

Cohérence complète : Gélatine conserve sa boîte crème/ocre et son pictogramme de flan, mais les cubes de dessert rouges avec assiette sont remplacés par une illustration imprimée de feuilles de gélatine sèches translucides en éventail. La représentation montre ainsi l’ingrédient. Édition avec l’outil image intégré, aucun appel à l’API OpenAI payante du projet.

Les cinq autres fichiers sont seulement recadrés/redimensionnés et réencodés : Amandes entières reste nature sans bol ; Levure chimique conserve ses sachets ; les trois sucres gardent leurs bocaux en verre, couvercles bois, étiquettes et petits tas déjà validés, sans nouvelle palette imposée. Les poudres restent en sacs kraft/crème, la pâte feuilletée crue pliée, les pépites et coco râpée en sachets, Vanille en bocal à gousses de la famille Paprika. Pas de contenant unique ni de changement du nom ou de catégorie.

| Fichier dans `www/Items/` | Avant (octets) | Final (octets) | Canevas |
| --- | ---: | ---: | ---: |
| `gelatine.webp` | 8 966 | 13 632 | 384 px |
| `amandes.webp` | 62 062 | 14 408 | 256 px |
| `levure-chimique.webp` | 15 360 | 13 760 | 384 px |
| `sucre.webp` | 15 118 | 14 474 | 256 px |
| `sucre-glace.webp` | 16 506 | 14 560 | 256 px |
| `sucre-roux.webp` | 16 300 | 14 746 | 256 px |

15/15 fichiers sous 15 000 octets après mesure. Revue de toute la catégorie sur fonds clair/foncé à 160 et 48 px, avec les cadrages automatiques existants. Transparence réelle, marges, détails utiles et distinctions cristallisé/poudre/roux préservés. Calcul réel du cadrage des six fichiers modifiés : pas de rognage Ma liste/Catalogue. Migration v762/v763 vérifiée pour les six cadrages seulement. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés. Noms/groupes du catalogue, fallback SVG, logique réseau du service worker, cache persistant, badge court, HA, sécurité et mode test inchangés. Aucune liste de visuels introduite dans sw.js. Deux empreintes d’intégrité Git (Gélatine/Levure chimique) actualisées pour les assets remplacés ; toutes les autres empreintes et assertions de dimensions, transparence et intégrité du test historique restent conservées.

Validation : 351/351 tests, syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Prochaine catégorie à examiner : Pâtes, riz & céréales.

## Pâtes, riz & céréales — v764

Source relue : main `22719c8221db6460ee6722bd59ad7d79d351cb83` (v763). Vingt-huit produits examinés ensemble. Vingt-sept visuels conservés, identiques octet par octet à main ; seul Quinoa est réencodé de 17 576 à 14 078 octets, en gardant le sachet crème/ocre, son pictogramme et le contenu. Aucun recours à la génération d’image ni à une API payante.

Cohérence de famille : paquets de pâtes beiges à grande fenêtre et formes distinctes (coquilles, coudes, nœuds, spirales, tubes, plaques, rubans, nids et fils). Les onze riz conservent le paquet bleu à grande fenêtre et petite zone beige en bas, grains longs/ronds et teintes naturelles propres. Polenta et Quinoa conservent les sachets crème/ocre, Boulgour et Semoule leurs sacs kraft/crème validés. Aucun bol réel, nouveau contenant ou recoloration imposée.

| Produit | Fichier dans `www/Items/` | Final (octets) |
| --- | --- | ---: |
| Boulgour | `boulgour.webp` | 8 950 |
| Conchiglie | `conchiglie.webp` | 5 018 |
| Coquillettes | `coquillettes.webp` | 5 708 |
| Farfalle | `farfalle.webp` | 5 472 |
| Fusilli | `fusilli.webp` | 6 094 |
| Lasagnes | `lasagnes.webp` | 3 384 |
| Linguine | `linguine.webp` | 4 596 |
| Macaronis | `macaronis.webp` | 6 072 |
| Orecchiette | `orecchiette.webp` | 6 000 |
| Penne | `penne.webp` | 5 664 |
| Polenta | `polenta.webp` | 13 830 |
| Quinoa | `quinoa.webp` | 14 078 |
| Rigatoni | `rigatoni.webp` | 4 926 |
| Riz à sushi | `riz-a-sushi.webp` | 8 212 |
| Riz arborio | `riz-arborio.webp` | 9 276 |
| Riz basmati | `riz-basmati.webp` | 8 382 |
| Riz blanc | `riz-blanc.webp` | 9 374 |
| Riz complet | `riz-complet.webp` | 7 610 |
| Riz gluant | `riz-gluant.webp` | 8 956 |
| Riz jasmin | `riz-jasmin.webp` | 8 194 |
| Riz long | `riz-long.webp` | 8 470 |
| Riz noir | `riz-noir.webp` | 11 280 |
| Riz rouge | `riz-rouge.webp` | 11 802 |
| Riz sauvage | `riz-sauvage.webp` | 12 092 |
| Semoule | `semoule.webp` | 8 302 |
| Spaghetti | `spaghetti.webp` | 3 246 |
| Tagliatelles | `tagliatelles.webp` | 5 850 |
| Vermicelles | `vermicelles.webp` | 3 386 |

28/28 fichiers sous 15 000 octets, poids finaux mesurés. Revue de la catégorie sur fonds clair/foncé à 160 et 48 px avec le cadrage automatique existant. Formes, contours, marges, transparence et lisibilité préservés. Calcul réel du cadrage Quinoa exécuté : pas de rognage Ma liste/Catalogue. Migration v763/v764 vérifiée pour Quinoa seulement, autres cadrages conservés. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés. Noms/groupes du catalogue, fallback SVG, logique réseau du service worker, cache persistant, badge court, HA, sécurité et mode test inchangés. Invalidation Quinoa bornée aux versions d’application v764 et suivantes afin de préserver le comportement historique v722/v723 testé. Empreinte d’intégrité Git de Quinoa actualisée ; les douze autres empreintes, les dimensions 384 px et toutes les assertions du test restent conservées. Aucun autre test modifié.

Validation : 351/351 tests, syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Prochaine catégorie à examiner : Pâtes à tarte.

## Pâtes à tarte — v765

Source relue : main `efef109515685b7ab3833fb48d50bb7acea71bb1` (v764). Le sous-groupe Épicerie → Pâtes à tarte contient Pâte brisée uniquement. Revue avec Pâte à pizza et Pâte feuilletée comme références de pâtes crues, sans déplacement de catégorie.

La source Pâte brisée représentait un fond de tarte cannelé déjà formé. Elle est remplacée par l’ingrédient cru en rouleau beige ivoire, papier cuisson et bord spiralé visibles, emballage transparent fermé, dans la famille du rouleau de Pâte à pizza. Pas de moule, assiette, croûte cuite ou garniture. Génération avec l’outil image intégré, aucun appel à l’API OpenAI payante du projet. Pâte à pizza et Pâte feuilletée sont conservées, vérifiées identiques octet par octet à main.

| Fichier dans `www/Items/` | Avant (octets) | Final (octets) | Canevas |
| --- | ---: | ---: | ---: |
| `pate-brisee.webp` | 26 696 | 11 130 | 320 px |

WebP final sous 15 000 octets, transparence réelle et marges régulières. Comparaison clair/foncé à 160 et 48 px avec cadrage automatique : proportions proches de Pâte à pizza, emballage entier et bord spiralé lisible. Calcul réel Ma liste/Catalogue sans rognage ; migration v764/v765 vérifiée pour ce seul cadrage. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés. Noms/groupes du catalogue, unités de recette et mode Pièce de Pâte brisée, fallback SVG, logique réseau du service worker, cache persistant, badge court, Home Assistant, sécurité et mode test inchangés. Aucun test modifié.

Validation : 351/351 tests, syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Prochaine catégorie à examiner : Confitures.

## Confitures — v766

Source relue : main `0d5a8142987f3318046a0a0f67d607ccc3e8a30f` (v765). Deux produits examinés ensemble : Confiture fraise et Confiture mirabelles. Les deux fichiers dépassaient 15 000 octets.

Fraise est conservée comme référence visuelle : bocal haut à facettes arrondies, couvercle fermé vichy rouge/blanc et étiquette crème ronde décorative, filet rouge, fruit imprimé et désignation en cursive rouge. Son dessin est seulement recadré/redimensionné et réencodé. Mirabelles est éditée avec l’outil image intégré pour reprendre exactement forme, couvercle, étiquette et taille apparente de Fraise, avec désignation Mirabelles et illustration imprimée correspondante. Confiture ambrée épaisse avec morceaux, distincte du rouge de Fraise ; pas de fruits crus entiers dans un sirop clair ni de fruit physique autour. Aucun appel à l’API OpenAI payante du projet.

| Fichier dans `www/Items/` | Avant (octets) | Final (octets) | Canevas |
| --- | ---: | ---: | ---: |
| `confiture-fraise.webp` | 50 636 | 14 084 | 256 px |
| `confiture-mirabelles.webp` | 23 816 | 14 688 | 256 px |

2/2 fichiers sous 15 000 octets mesurés après encodage. Contrôle des fichiers finaux sur fonds clair/foncé à 160 et 48 px avec cadrage automatique : hauteurs identiques, écart de largeur visible inférieur à 0,004 de la boîte image. Alpha réel, marges, lisibilité des étiquettes et contours préservés. Calcul réel Ma liste/Catalogue sans rognage et migration v765/v766 des deux cadrages vérifiés. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés : référence Fraise, confitures distinctes des sauces Mayonnaise. Noms/groupes du catalogue, fallback SVG, logique réseau du service worker, cache persistant, badge court, HA, sécurité et mode test inchangés. Aucun test modifié.

Validation : 351/351 tests, syntaxe JavaScript, compilation Python et `git diff --check` réussis. Validateur Bash inchangé ; mêmes contrôles exécutés séparément faute de `/dev/fd/63`. Prochaine catégorie à examiner : Sauces & condiments.


## Choix supplémentaires de confitures — v767

Source relue : main `f30b78162782ba155e2179addfcd09c158a01baf` (v766). À la demande de l’utilisateur, ajout de sept parfums : Abricot, Cerise, Framboise, Fruits rouges, Mûre, Myrtille et Orange. Le sous-groupe Confitures passe de 2 à 9 produits ; Fraise et Mirabelles sont conservées octet par octet. Tous sont achetés par Pot via catalog-quantities.js, sans changement du calcul des quantités.

Génération avec l’outil image intégré, sans API OpenAI payante du projet. Prompt commun : une seule confiture isolée, fond réellement transparent, reprendre strictement le bocal Fraise (facettes, couvercle vichy fermé, étiquette crème ronde à double filet rouge, nom en cursive rouge), ne changer que le nom, le fruit imprimé et la couleur naturelle de la confiture épaisse cuite. Pas de fruit physique autour, sirop clair, marque, décor ou ombre de sol. Pour Fruits rouges : fraise, framboise, mûre et myrtille imprimées ensemble. Orange représente une marmelade avec fines écorces ; les autres couleurs et fruits correspondent au parfum. Un fichier WebP par produit, aucun atlas.

| Nouveau fichier dans `www/Items/` | Poids final (octets) | Canevas |
| --- | ---: | ---: |
| `confiture-abricot.webp` | 13 682 | 256 px |
| `confiture-framboise.webp` | 14 908 | 256 px |
| `confiture-cerise.webp` | 14 404 | 256 px |
| `confiture-mure.webp` | 14 814 | 256 px |
| `confiture-myrtille.webp` | 14 518 | 256 px |
| `confiture-orange.webp` | 14 780 | 256 px |
| `confiture-fruits-rouges.webp` | 13 766 | 256 px |

Les sept fichiers sont mesurés après encodage, tous sous 15 000 octets ; alpha réel, objet entier et marges préservés. Revue des neuf produits sur fonds clair/foncé à 160 et 48 px : hauteurs identiques, différence maximale de largeur apparente inférieure à 0,012 de la boîte image. Calcul réel de measureVisualScale exécuté pour les sept ajouts : pas de rognage dans Ma liste ou Catalogue. Aucun essai interactif iPhone ou session Home Assistant réelle.

Deux nouveaux tests vérifient l’unicité/classement des neuf confitures, le mode Pot et l’existence des WebP transparents sous 15 Ko. Résultat : 353/353 tests réussis ; syntaxe JavaScript, compilation Python et git diff --check réussis. Validateur Bash inchangé ; contrôles équivalents exécutés séparément car /dev/fd/63 indisponible dans cet environnement. Consignes et prompt automatique de confiture étendus à tous les parfums. Architecture, Home Assistant, OAuth, WebSocket, coffre, verrouillage/biométrie, mode test, cadrage automatique, fallback SVG et logique réseau/cache persistant du service worker inchangés. Versions et URLs de chargement synchronisées en v767. Suite de l’audit : Sauces & condiments.


## Sauces & condiments — v768

Source relue : main `67247ed96b052c96dda2ecbef65c6442200ef804` (v767). Audit des 33 produits : sujet, texture, conditionnement, palette, proportions, étiquettes, contours et poids. Les 27 sauces/préparations suivent déjà le modèle Mayonnaise validé : bocal fermé, couvercle doré et étiquette crème centrale à filet fin. Leurs couleurs naturelles et textures restent distinctes. Les deux huiles gardent leurs flacons à anse et bouchon vert ; les trois vinaigres leur bouteille élancée avec fruit imprimé. Les cornichons restent dans leur bocal haut transparent, couvercle vert, saumure et cornichons entiers visibles ; ne pas leur appliquer le modèle Mayonnaise.

32 fichiers conformes sont conservés octet par octet. Cornichon, seul fichier trop lourd, est uniquement recadré/redimensionné et réencodé : 43 096 → 13 598 octets, WebP RGBA 256 px. Aucun visuel généré, aucune retouche des pixels ou de l’alpha source. Contrôle clair/foncé, vues 192/48 px, marges et objet entier préservés. Exécution du cadrage automatique réel : pas de rognage Ma liste/Catalogue. Migration v767/v768 : seul le cadrage Cornichon est recalculé, les autres entrées sont conservées.

| Produit | Fichier dans `www/Items/` | Poids final (octets) |
| --- | --- | ---: |
| Bolognaise | `bolognaise.webp` | 14 824 |
| Cornichon | `cornichon.webp` | 13 598 |
| Huile d'olive | `huile-d-olive.webp` | 14 144 |
| Huile de tournesol | `huile-de-tournesol.webp` | 14 920 |
| Ketchup | `ketchup.webp` | 14 500 |
| Mayonnaise | `mayonnaise.webp` | 12 918 |
| Moutarde | `moutarde.webp` | 14 416 |
| Pesto | `pesto.webp` | 14 688 |
| Sauce aigre-douce | `sauce-aigre-douce.webp` | 14 346 |
| Sauce algérienne | `sauce-algerienne.webp` | 14 292 |
| Sauce andalouse | `sauce-andalouse.webp` | 14 744 |
| Sauce au poivre | `sauce-au-poivre.webp` | 13 808 |
| Sauce au roquefort | `sauce-au-roquefort.webp` | 13 622 |
| Sauce aux champignons | `sauce-aux-champignons.webp` | 14 960 |
| Sauce barbecue | `sauce-barbecue.webp` | 14 000 |
| Sauce Béarnaise | `sauce-bearnaise.webp` | 14 944 |
| Sauce blanche | `sauce-blanche.webp` | 12 698 |
| Sauce burger | `sauce-burger.webp` | 13 780 |
| Sauce César | `sauce-cesar.webp` | 14 954 |
| Sauce curry | `sauce-curry.webp` | 14 530 |
| Sauce hollandaise | `sauce-hollandaise.webp` | 14 780 |
| Sauce miel-moutarde | `sauce-miel-moutarde.webp` | 13 668 |
| Sauce napolitaine | `sauce-napolitaine.webp` | 14 348 |
| Sauce ranch | `sauce-ranch.webp` | 14 892 |
| Sauce samouraï | `sauce-samourai.webp` | 14 272 |
| Sauce soja | `sauce-soja.webp` | 14 120 |
| Sauce tartare | `sauce-tartare.webp` | 14 044 |
| Sauce teriyaki | `sauce-teriyaki.webp` | 13 754 |
| Sauce tomate | `sauce-tomate.webp` | 14 540 |
| Tabasco | `tabasco.webp` | 13 858 |
| Vinaigre balsamique | `vinaigre-balsamique.webp` | 11 070 |
| Vinaigre de cidre | `vinaigre-de-cidre.webp` | 10 726 |
| Vinaigre de vin | `vinaigre-de-vin.webp` | 12 420 |

33/33 images sous 15 000 octets, poids finaux mesurés. Consignes et prompt automatique complétés pour préserver le conditionnement des cornichons et distinguer huiles/vinaigres des sauces. Aucun nom, groupe ou mode d’achat modifié. Le catalogue reste identique, ainsi que fallback SVG, logique du service worker, cache persistant, Home Assistant, OAuth, WebSocket, coffre chiffré, verrouillage/biométrie, mode test et styles mobiles. Aucun essai interactif iPhone ou Home Assistant réel.

Validation : 353/353 tests réussis, syntaxe JavaScript, compilation Python, calcul de cadrage et git diff --check réussis. Aucun test modifié. Le validateur Bash reste inchangé ; contrôles équivalents exécutés séparément car /dev/fd/63 indisponible. Version globale v768, URLs de chargement synchronisées ; module quantités inchangé conservé en v767. Prochaine catégorie : Sauces sucrées.


## Sauces sucrées — audit après v768

Source relue : main `4adc2c213c5c6f5de7d5f9c5428bd5cd36bb3f54`. Le sous-groupe Épicerie → Sauces sucrées contient uniquement Coulis de fruit. Comparaison directe avec la référence Mayonnaise : même bocal fermé en verre, couvercle doré, grande étiquette crème centrale rectangulaire à angles arrondis et double filet fin. Contenu rouge fluide homogène adapté au coulis, distinct de la confiture épaisse en bocal vichy. Pas de fruit physique, texte, marque ou accessoire ajouté.

`www/Items/coulis-de-fruit.webp` : 13 868 octets mesurés, 384 × 384 px, alpha réel de 0 à 255. Contours propres sur fonds clair et foncé ; cadrage réel calculé par measureVisualScale (échelle 1,137, déplacement X −1,2 %, Y −2,4 %) sans rognage Ma liste/Catalogue. Comparaison de silhouette avec Mayonnaise validée. Aucun essai interactif iPhone ou session Home Assistant réelle.

Décision : conserver le fichier existant sans réencodage ni génération. Les consignes de famille et le prompt automatique couvrent déjà explicitement Coulis de fruit, aucune duplication nécessaire. Modification documentaire seule, version de l’application maintenue à v768. Catalogue, images, cache, fallback, quantités, Home Assistant, sécurité, mode test et styles mobiles inchangés.

Validation : 353/353 tests réussis et git diff --check réussi. Prochaine catégorie non encore examinée dans cette série : Enfant.


## Enfant — v769

Source relue : main `675aa81afcdeb7cc14e797c6d71401c77f3fb42d` (v768). Six produits examinés pour sujet, forme de vente, cohérence des emballages, palette, taille apparente, contour et poids. Références préservées : Couches en pile blanche à motifs bleu pâle et Lingettes bébé en paquet blanc/bleu pâle fermé à rabat ourson.

Trois images générées avec l’outil intégré, sans appel à l’API OpenAI payante du projet :

- Compotes bébé : source 84 px remplacée par la même gourde jaune/rouge à bouchon orange fermé, pomme/banane imprimées, sans fruit physique ni texte. Le changement vise la netteté, sans changer le modèle de vente.
- Sacs à couches : l’ancien sac rempli noué est remplacé par un rouleau de sacs neufs bleu menthe clair, segment court attaché, perforation et poignées visibles. Présentation du produit à acheter, sans déchet, en accord avec les tons doux des couches/lingettes.
- Lait infantile : conservation de la boîte cylindrique crème/bleu, couvercle bleu fermé et pictogramme biberon. Suppression du chiffre « 2 » qui précisait un âge absent du nom, de la dosette et de la poudre à côté. Une boîte entière isolée, aucun chiffre ou allégation inventée.

Petits pots : dessin du petit bocal fermé à couvercle doré et purée orange conservé, recadrage/redimensionnement et réencodage seulement. Pas d’étiquette de sauce ajoutée. Couches et Lingettes bébé conservées octet par octet.

| Produit | Avant (octets) | Final (octets) | Canevas final |
| --- | ---: | ---: | ---: |
| Compotes bébé | 3 448 | 10 298 | 256 px |
| Couches | 11 384 | 11 384 | 320 px |
| Lait infantile | 17 798 | 14 340 | 384 px |
| Lingettes bébé | 9 236 | 9 236 | 384 px |
| Petits pots | 18 698 | 14 950 | 384 px |
| Sacs à couches | 3 854 | 11 460 | 256 px |

6/6 fichiers sous 15 000 octets, poids mesurés après encodage, alpha réel, marges régulières et objet entier. Dimensions historiques 384 × 384 préservées pour Lait infantile et Petits pots conformément aux tests existants. Les deux anciennes sources 84 px sont remplacées par des WebP 256 px. Revue des six produits sur fonds clair/foncé à 160 et 48 px ; petites vignettes lisibles. Cadrage réel exécuté pour les quatre changements : pas de rognage Ma liste/Catalogue. Migration v768/v769 ciblée vérifiée, cadrages des produits inchangés conservés. Aucun essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés pour cette famille. Noms, classement et unités du catalogue inchangés ; fallback SVG, logique réseau/cache persistant du service worker, badge court, sécurité, OAuth, WebSocket, coffre, verrouillage/biométrie, mode test et styles mobiles préservés. Pas d’ajout de dépendance. Validation : 353/353 tests, syntaxe JavaScript, compilation Python et git diff --check réussis. Aucun test modifié. Validateur Bash inchangé ; contrôles équivalents exécutés séparément car /dev/fd/63 indisponible. Version globale et URLs synchronisées en v769. Prochaine catégorie : Hygiène & soins, sous-groupe Hygiène.


## Ajout de goûters et aliments Enfant — v770

Source relue : main `19fe7f6c3feb20e181af4e8d7c196f04d6a1e5e8` (v769, déploiement confirmé). Nouvelle demande utilisateur : enrichir Enfant, notamment avec des gâteaux. Six ajouts au sous-groupe existant, qui passe de 6 à 12 produits, sans déplacement ou changement des six références déjà présentes.

Références visuelles inspectées : Céréales (boîte crème avec fenêtre), Madeleines et Biscuits beurre (forme de l’aliment), Lait infantile (palette crème/bleu), Yaourts vanille (petit pot évasé à opercule carré). Six générations par outil image intégré ; aucune API OpenAI payante du projet. Prompt commun : un seul produit fermé, style 3D semi-réaliste existant, crème/bleu pâle, fond transparent, marges régulières, pas d’aliment physique autour, texte, âge, marque ou allégation. Spécificités :

- Gâteaux bébé : sachet à fenêtre, petits gâteaux moelleux dorés, forme de madeleine.
- Biscuits bébé : même sachet, biscuits courts ovales perforés.
- Boudoirs bébé : même sachet, longs biscuits en doigts arrondis.
- Galettes de riz bébé : même sachet, galettes rondes de riz soufflé ivoire, épi de riz imprimé.
- Céréales infantiles : boîte carton fermée crème/bleu, épi imprimé et petite fenêtre de céréales finement moulues, distincte de la boîte de lait.
- Desserts lactés bébé : petit pot évasé à opercule carré fermé crème/bleu, simple goutte de lait imprimée, aucun parfum inventé.

| Produit | Fichier dans `www/Items/` | Poids final (octets) | Achat |
| --- | --- | ---: | --- |
| Gâteaux bébé | `gateaux-bebe.webp` | 11 794 | Paquet |
| Biscuits bébé | `biscuits-bebe.webp` | 12 162 | Paquet |
| Boudoirs bébé | `boudoirs-bebe.webp` | 11 866 | Paquet |
| Galettes de riz bébé | `galettes-de-riz-bebe.webp` | 13 704 | Paquet |
| Céréales infantiles | `cereales-infantiles.webp` | 13 126 | Boîte |
| Desserts lactés bébé | `desserts-lactes-bebe.webp` | 9 418 | Pot |

Six WebP RGBA unitaires 256 × 256 px, tous sous 15 000 octets mesurés après encodage, alpha réel et marges préservés. Revue clair/foncé à 160 et 48 px : famille de sachets assortis, contenus distinguables, formes de boîte/pot conservées. Calcul réel du cadrage automatique sans rognage Ma liste/Catalogue. Les six images précédentes restent identiques octet par octet ; code de cadrage/fallback inchangé. Aucun essai interactif iPhone ou session Home Assistant réelle.

Deux tests ajoutés pour unicité, classement Enfant, modes d’achat Paquet/Boîte/Pot et fichiers WebP transparents sous 15 Ko. Validation : 355/355 tests réussis, syntaxe JavaScript, compilation Python et git diff --check réussis. Consignes et prompt automatique étendus aux nouveaux produits. Versions et URLs de chargement synchronisées en v770. Architecture, cache persistant, logique réseau du service worker, sécurité, OAuth, coffre, verrouillage/biométrie, synchronisation Home Assistant WebSocket, mode test et styles mobiles inchangés. Le validateur Bash reste intact ; contrôles équivalents exécutés séparément car /dev/fd/63 indisponible.

Suite de l’audit : Hygiène & soins, sous-groupe Hygiène.


## Clôture des catégories et audit global — v771, 5 novembre 2026

Source : main `6da8f11dbe5b0ddd6147716d5f91e752123bea86` (v770). Autorisation utilisateur de terminer toutes les catégories sans nouvelle pause et de proposer les ajouts manquants. Catalogue final : 482 références, dont le nouvel ajout Céréales Lion dans Petit-déjeuner, acheté par Boîte.

Lion : boîte crème/bleu demandée conservée, aucune inscription LION ou Nestlé. Contenu comparé à la photographie officielle Nestlé https://www.nestle-cereals.com/be/sites/g/files/qirczx1076/files/2025-10/Packshot%2044439301%20Lion%20480%20BE%20A1L1.png : petits morceaux soufflés courts triangulaires à lobes arrondis, caramel/chocolat, sans longs rectangles striés. Le nom Céréales Lion reste uniquement au catalogue.

Revue complémentaire des catégories Boissons, Fruits & Légumes, Hygiène & soins, Maison, Petit-déj & snacks et Viandes & poissons, en continuité des familles déjà contrôlées. Préserver leurs références approuvées : bouteilles/bières/vins/jus, fruits et légumes naturels, palette des produits ménagers, piles en blisters, sachets et bocaux du petit-déjeuner. Les formes de vente distinctes ne sont pas forcées dans un conditionnement unique. Petits pois et Olives fraîches perdent leur bol ; Dinde et Escalopes de poulet perdent herbes et poivre décoratifs. Cinq générations via outil intégré, aucun appel à l’API OpenAI payante du projet. Les autres changements sont des réencodages de sources existantes avec redimensionnement et marges, sans peinture des pixels ou de l’alpha.

144 images intégrées, dont Lion et quatre corrections de cohérence ; les autres visuels restent identiques à main. Poids individuels avant/après et classement des 482 références consignés dans AUDIT_POIDS_PRODUITS_2026-11-05.json. Tous les WebP du catalogue sont sous 15 000 octets. Transparence réelle et marges vérifiées sur les fichiers changés, revue sur fonds clair et foncé. Certains feuillages utilisent 192 px pour conserver la transparence et le plafond sans détails inutiles ; majorité des changements 256 px, dimensions 384 px historiques conservées pour les lots laitiers et Petits pots/Céréales/Pop-corn/Savon mains.

Migration de résolution explicite : dix fruits/légumes des tests v733/v736 et cinq visuels viande/poisson passent en 256 px. Assertions de dimensions actualisées ; plafond de ces tests renforcé de 153 600 à 15 000 octets. Toutes les assertions alpha, format, présence catalogue, distinction d’images et migrations historiques sont conservées. Nouveau test Céréales Lion : unicité, classement, Boîte, WebP transparent sous 15 Ko. Cadrage automatique réel exécuté pour les 144 changements : aucun rognage dans Ma liste/Catalogue. Cache de cadrage invalidé uniquement pour ces sources en v771, sans purge du cache visuel persistant.

Validation : 356 tests réussis, syntaxe JS, compilation du prompt Python et git diff --check. Validateur Bash inchangé : contrôles équivalents exécutés séparément, /dev/fd/63 indisponible. Aucun essai interactif iPhone ou Home Assistant réel. Sécurité, OAuth, WebSocket, coffre, verrouillage/biométrie, mode test et architecture statique inchangés. Consignes et prompt mis à jour pour préserver les décisions. Propositions seules, sans ajout automatique, dans PROPOSITIONS_PRODUITS_2026-11-05.md.


## Quinze propositions validées et intégrées — v772

Source relue : main f6606af6574ce4737980be5838cfe681f7d9e62f (v771). Validation utilisateur des quinze propositions : tous les produits sont ajoutés une seule fois, dans les catégories proposées, sans modification des 482 références précédentes ni de leurs images (identité octet par octet vérifiée). Catalogue final : 497 produits. Purée bébé est distinguée des Petits pots par sa gourde légumes ; mode d’achat Paquet comme les compotes en gourde, dans le vocabulaire de conditionnement existant. Les fromages gardent une présentation naturelle cohérente avec leurs références.

Quinze générations avec l’outil intégré, références locales inspectées, aucun appel à l’API OpenAI payante du projet. Consignes de chaque nouveau produit ajoutées à IMAGES_ITEMS.md et au prompt automatique.

| Produit | Poids WebP (octets) |
| --- | ---: |
| Emmental râpé | 14716 |
| Parmesan râpé | 14274 |
| Mozzarella en billes | 10036 |
| Pain de mie complet | 14192 |
| Coulis de tomate | 9478 |
| Crème dessert caramel | 12398 |
| Confiture pêche | 14306 |
| Confiture figue | 14052 |
| Jus de poire | 7456 |
| Petites pâtes bébé | 12572 |
| Purée bébé | 10158 |
| Épinards hachés surgelés | 14768 |
| Liquide vaisselle mains sensibles | 8722 |
| Brossettes interdentaires | 9506 |
| Fil dentaire | 9292 |

Tous les nouveaux fichiers sont des WebP RGBA 256 px avec alpha réel, marges et poids maximal mesuré de 15 000 octets. Revue clair/foncé à 160/48 px et exécution du cadrage automatique réel : pas de rognage Ma liste/Catalogue. Deux tests ajoutés pour unicité, classement, conditionnements et images transparentes sous 15 Ko ; test des confitures étendu de neuf à onze parfums, assertions conservées. 358 tests réussis, syntaxe JS, compilation Python et git diff --check. Validateur Bash inchangé, /dev/fd/63 indisponible : contrôles exécutés séparément.

URLs et version synchronisées en v772. Code de cadrage/fallback et logique réseau du service worker identiques à main ; cache persistant conservé. Architecture statique, OAuth, WebSocket, Home Assistant, coffre, verrouillage/biométrie, mode test et styles mobiles préservés. Pas d’essai interactif iPhone ni de session Home Assistant réelle. Liste des propositions marquée intégrée. Relevé global des poids mis à jour pour les 497 références.


## Treize produits validés — v773

Source relue : main c42b36672e24ae0995a64bf321eb374cb78e6772 (v772). Ajout des treize produits choisis par l’utilisateur, sans Lentilles corail ni Pois cassés. Les 497 produits précédents et leurs images sont conservés octet par octet. Catalogue final : 510 références.

Treize générations par outil intégré, sans API OpenAI payante du projet. Références locales inspectées : Feta, Lait d’amande, Pois chiches, Brocoli, Chou rouge, Oranges, Melon, Granola, Pains burger et Lait de coco. Conditionnements et palettes de famille conservés ; contenu exact distinct, pas de marque ou texte ajouté. Fruits séchés assortis en sachets à fenêtre ; fruits/légumes naturels ; conserves fermées crème/sauge. Crème de coco distinguée par une volute imprimée.

| Produit | Poids WebP final (octets) | Achat |
| --- | ---: | --- |
| Tofu | 9340 | Barquette |
| Lait de soja | 6592 | Bouteille |
| Haricots blancs | 11454 | Boîte |
| Haricots verts en boîte | 12724 | Boîte |
| Choux de Bruxelles | 14166 | Pièce |
| Chou blanc | 14910 | Pièce |
| Pamplemousse | 14014 | Pièce |
| Pastèque | 14848 | Pièce |
| Dattes | 13310 | Sachet |
| Abricots secs | 13714 | Sachet |
| Raisins secs | 14780 | Sachet |
| Bagels | 13008 | Paquet |
| Crème de coco | 12506 | Boîte |

Treize WebP RGBA 256 px, tous sous 15 000 octets mesurés, alpha réel et marges préservés. Revue clair/foncé à 160/48 px ; calcul réel du cadrage automatique sans rognage Ma liste/Catalogue. Deux tests ajoutés pour unicité, classement, modes d’achat et WebP transparents sous 15 Ko. Validation : 360 tests réussis, syntaxe JavaScript, compilation Python et git diff --check. Validateur Bash intact ; contrôles équivalents exécutés séparément car /dev/fd/63 indisponible. Pas d’essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés, relevé global des 510 poids actualisé. Version et URLs de chargement synchronisées en v773. Aucun changement de la logique du service worker, du cadrage/fallback, de la sécurité, OAuth, WebSocket, coffre, verrouillage/biométrie, mode test, architecture statique ou styles mobiles.


## Douze produits validés — v774

Source relue : main 19690bf2b48ea657789d21cf3c0a966a53416ddc (v773). Ajout des douze produits nommés par l’utilisateur. Flageolets classés en Conserves ; aucun lait végétal supplémentaire non précisé. Les 510 références précédentes et leurs images sont conservées ; images vérifiées octet par octet. Catalogue final : 522 références.

Références locales inspectées : Biscuits beurre, Galettes de blé, Pâte brisée, Crème liquide, Pois chiches, Noix de cajou, Dattes, Beurre de cacahuète et Huile d’olive. Pains reconnaissables, pâte crue roulée, brique de dessert fermée, conserves crème/sauge, noix en pots assortis, fruits séchés en sachets kraft à fenêtre, huile dans le flacon existant. Treize générations par outil intégré, sans API payante du projet : première pâte sablée rejetée pour halo gris, seconde version propre retenue. Aucun autre ancien visuel refait.

| Produit | Poids WebP final (octets) | Achat |
| --- | ---: | --- |
| Biscottes | 14440 | Paquet |
| Pain pita | 14000 | Paquet |
| Pain naan | 14238 | Paquet |
| Pâte sablée | 7526 | Rouleau |
| Crème anglaise | 8210 | Brique |
| Flageolets | 12440 | Boîte |
| Noix de pécan | 14606 | Pot |
| Noix du Brésil | 14088 | Pot |
| Pruneaux | 13434 | Sachet |
| Figues sèches | 13650 | Sachet |
| Crème de marrons | 12820 | Pot |
| Huile de sésame | 12700 | Bouteille |

Douze WebP RGBA 256 px, alpha réel, marges intactes, chaque fichier sous 15 000 octets mesurés. Revue visuelle sur fonds clair/foncé à 160/48 px ; calcul du cadrage automatique réel vérifié sans rognage dans Ma liste et Catalogue. Relevé global des 522 images actualisé : toutes sous 15 000 octets.

Deux tests ajoutés pour unicité, classement, conditionnements d’achat/affichage et WebP transparents sous 15 Ko. Validation : 362 tests réussis, syntaxe de tous les JavaScript, compilation Python et git diff --check. Validateur Bash inchangé ; contrôles équivalents exécutés séparément car /dev/fd/63 indisponible. Pas d’essai interactif iPhone ou Home Assistant réel.

Consignes et prompt automatique complétés. Version et URLs synchronisées en v774. Cadrage, fallback, logique réseau du service worker et cache visuel persistant inchangés. Architecture statique, OAuth, synchronisation WebSocket Home Assistant, coffre, verrouillage/biométrie, mode test, styles mobiles et safe areas préservés.


## Correction Noix de pécan — v775

Source relue : main 7251bc90afe5d473dc2fb663fc4924bb980e8fc4 (v774). L’utilisateur signale que la grosse illustration colorée sur l’étiquette de Pécan ne correspond pas aux autres noix. Comparaison réelle avec Noix de cajou et Pistaches : le couvercle en bois introduit en v774 et l’étiquette sans nom étaient également incohérents.

Une génération par outil intégré, sans API payante du projet. Nouveau bocal dans le modèle Noix de cajou : verre, couvercle métallique doré, étiquette crème avec NOIX DE PÉCAN en capitales brunes et petite pécan monochrome au trait, contenu naturel de pécans brun rouge sillonnées. Aucun grand dessin coloré. WebP RGBA 256 px, alpha réel et marges préservées, 14 692 octets mesurés. Référence finale : www/Items/noix-de-pecan.webp. Prompt : reprendre exactement le bocal Noix de cajou, remplacer uniquement le contenu et la désignation générique, conserver le petit dessin au trait monochrome, refuser l’illustration réaliste colorée et le couvercle bois.

Revue sur fonds clair/foncé à 160/48 px et calcul réel du cadrage : scale 1.016, shiftX 0, shiftY 0.5, aucun rognage Ma liste/Catalogue. Recalcul du seul cadrage Pécan pour les caches antérieurs à v775 ; pas de purge du cache visuel persistant du service worker. Les 521 autres images sont identiques octet par octet, catalogue inchangé à 522 produits. Consigne de génération corrigée pour prévenir cette dérive.

Validation : 362 tests réussis, syntaxe de tous les JavaScript et compilation Python, git diff --check. Validateur Bash tenté sans modification ; /dev/fd/63 indisponible, contrôles équivalents exécutés séparément. Pas d’essai interactif iPhone ou Home Assistant réel. Version et URLs synchronisées en v775 ; seuls l’asset Pécan, son recalcul de cadrage, versions et documentation/consignes changent. OAuth, Home Assistant, WebSocket, coffre, biométrie, mode test, fallback SVG, réseau du service worker et styles mobiles préservés.


## Fruits secs tous en sachets — v776

Source relue : main 0c9a2a483fc4c703724b2c48cbae80c43e3b8435 (v775). Audit visuel de treize références : cinq noix emballées (Cajou, Pistaches, Cacahuètes, Pécan, Brésil), cinq fruits séchés (Dattes, Abricots secs, Raisins secs, Pruneaux, Figues sèches), puis Amandes, Noix et Noisettes nature. Après l’audit, choix explicite de l’utilisateur « Tous en sachets » : dix visuels harmonisés sur le sachet kraft/crème fermé à grande fenêtre de Dattes corrigé. Les trois présentations naturelles restent conservées.

Même silhouette, palette, fermeture, fenêtre, nom générique brun en capitales, petit dessin brun au trait et décoration ocre basse ; seul le contenu exact et son identification changent. Aucun grand fruit coloré. Les bocaux de Cajou, Pistaches, Cacahuètes, Pécan et Brésil sont remplacés par des sachets. Conditionnement affiché/acheté Sachet pour les dix références ; seuls les overrides Pécan/Brésil nécessitaient une correction. Aucun nom, groupe ou dosage de recette changé.

Onze générations par outil intégré sans API payante du projet : cinq fruits séchés, un bocal Brésil écarté après le choix des sachets, puis cinq noix en sachets. Dix assets finaux, aucune image de bocal écartée intégrée.

| Produit | Poids WebP final (octets) | Conditionnement |
| --- | ---: | --- |
| Noix de cajou | 12938 | Sachet |
| Pistaches | 14518 | Sachet |
| Cacahuètes | 13632 | Sachet |
| Noix de pécan | 13530 | Sachet |
| Noix du Brésil | 13664 | Sachet |
| Dattes | 13474 | Sachet |
| Abricots secs | 13554 | Sachet |
| Raisins secs | 13502 | Sachet |
| Pruneaux | 14640 | Sachet |
| Figues sèches | 13758 | Sachet |

Tous les fichiers sont WebP RGBA 256 px, alpha réel, marges préservées, sous 15 000 octets mesurés. Contrôle clair/foncé à 160/48 px et calcul du cadrage automatique réel : aucun rognage Ma liste/Catalogue. Relevé global des 522 poids mis à jour ; les 512 autres images sont identiques octet par octet. Consignes et prompt de génération actualisés avec priorité explicite au choix Tous en sachets, remplaçant les bocaux des anciennes consignes.

Validation : 363 tests réussis. Test ajouté pour les dix libellés Sachet d’affichage et d’achat ; attentes Pécan/Brésil mises à jour dans le test des ajouts v774. Syntaxe des 25 JavaScript et compilation Python validées, git diff --check. Validateur Bash tenté sans changement ; /dev/fd/63 indisponible, contrôles équivalents exécutés séparément. Pas d’essai interactif iPhone ou Home Assistant réel.

Version et URLs synchronisées en v776 ; recalcul seulement des dix cadrages concernés pour les caches antérieurs, cache visuel persistant conservé et aucune purge ajoutée au service worker. Catalogue, logique réseau du service worker, fallback SVG, architecture statique, OAuth, Home Assistant, WebSocket, coffre, verrouillage/biométrie, mode test et styles mobiles inchangés.
