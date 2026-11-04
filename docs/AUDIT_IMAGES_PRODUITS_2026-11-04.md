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
