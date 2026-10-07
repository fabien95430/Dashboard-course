# Historique intelligent des achats

Ce document décrit le fonctionnement de l’historique intelligent implémenté dans `purchase-intelligence.js`.

L’objectif n’est pas de gérer un stock exact ni de remplacer une date limite de consommation. Le moteur estime si un produit acheté récemment est probablement encore disponible à la maison afin d’éviter de le recommander inutilement lorsqu’un plat est ajouté.

## Principe général

Lorsqu’un produit de **Ma liste** est réellement marqué comme acheté, l’application mémorise localement :

- le produit ;
- la date de l’achat ;
- la quantité achetée ;
- le nombre de personnes configuré à ce moment-là.

Lorsqu’un plat est ensuite ouvert, chaque ingrédient est comparé à cet historique. Si le moteur estime qu’il reste encore une quantité suffisante du produit, l’ingrédient est affiché comme **Acheté récemment** et il est désélectionné automatiquement.

Cette décision reste toujours réversible : l’utilisateur peut sélectionner manuellement l’ingrédient. Ce choix est respecté et devient un signal d’apprentissage pour les recommandations futures.

## Source des produits

Le moteur ne possède pas son propre catalogue. Il construit ses métadonnées depuis `window.COURSES_CATALOG`, donc depuis le catalogue courant fourni par `catalog.js`.

Une règle peut être définie à trois niveaux :

1. produit précis ;
2. sous-catégorie ;
3. catégorie générale.

La règle la plus précise disponible est utilisée.

Chaque règle peut contenir :

- `days` : durée de disponibilité probable de référence ;
- `factor` : facteur de prudence appliqué à l’apprentissage ;
- `shelf` : plafond maximal de disponibilité pour les produits sensibles.

## Produits périssables et plafond de sécurité

Pour les produits périssables, `shelf` constitue une limite dure.

Même si l’historique du foyer montre qu’un produit est généralement racheté après une durée plus longue, la durée calculée ne peut jamais dépasser ce plafond.

Exemples actuels :

- steaks hachés : `2` jours, plafond `2` jours ;
- saumon frais : `2` jours, plafond `2` jours ;
- mozzarella : `4` jours, plafond `5` jours ;
- jambon blanc : `4` jours, plafond `5` jours ;
- lait : `6` jours, plafond `7` jours ;
- œufs : `21` jours, plafond `28` jours.

Ces valeurs sont des fenêtres pratiques destinées à éviter les doublons. Elles ne sont pas des DLC, ne remplacent pas l’étiquette du produit et ne constituent pas une garantie de conservation.

## Historique conservé

Les achats et les retours utilisateurs sont conservés au maximum pendant `400` jours.

Les données sont stockées localement sous la clé :

`courses-purchase-intelligence-v1`

Le stockage contient notamment :

- `purchases` : achats enregistrés ;
- `feedback` : corrections manuelles ;
- `products` : profils recalculés ;
- `household` : taille de foyer utilisée lors du dernier calcul ;
- `updatedAt` : date du dernier recalcul.

Aucune donnée de cet historique n’est envoyée vers un backend externe par ce module.

## Quand un achat est enregistré

Un clic sur la coche d’achat prépare l’enregistrement, mais l’achat n’est réellement ajouté à l’historique qu’après confirmation par le toast `<nom du produit> acheté`.

La quantité est lue depuis la ligne de **Ma liste**.

Deux achats du même produit réalisés dans une fenêtre de `18` heures sont regroupés en un seul événement. Les quantités sont additionnées. Cela permet de considérer plusieurs validations proches comme une même course plutôt que comme plusieurs cycles de consommation.

## Annulation d’un achat

Après un achat enregistré, le moteur conserve temporairement les informations nécessaires pour annuler cet événement pendant `2` minutes.

Si l’utilisateur utilise **Annuler**, l’événement ajouté est retiré ou, lorsqu’il avait été fusionné avec un événement précédent, l’état précédent est restauré.

Ainsi, une mauvaise validation ne doit pas polluer l’apprentissage.

## Nombre de personnes

Le moteur réutilise les préférences déjà présentes dans l’application :

- `courses-dish-preferred-servings-v1` ;
- `courses-dish-servings-v1`.

Si aucune valeur exploitable n’est disponible, le calcul utilise `4` personnes.

Le modèle normalise les anciens échantillons selon la taille du foyer qui était enregistrée au moment de l’achat ou du feedback, puis les transpose à la taille du foyer actuelle.

Le facteur utilisé est basé sur :

`(2 / nombre_de_personnes) ^ 0.42`

avec un bornage entre `0.62` et `1.18`.

Conséquence : à quantité d’achat comparable, un foyer plus grand consomme généralement le produit plus vite et la fenêtre de disponibilité estimée diminue.

Un changement du nombre de personnes déclenche un recalcul du modèle, sans supprimer l’historique existant.

## Apprentissage à partir des habitudes d’achat

Pour chaque produit, le moteur calcule les intervalles entre achats successifs.

Les intervalles inférieurs à `0,75` jour sont ignorés pour éviter qu’une même période de courses soit interprétée comme un cycle de consommation complet.

Jusqu’aux `12` derniers intervalles d’achat sont utilisés.

Le modèle combine ensuite :

- la durée de référence de la règle du produit ;
- les intervalles observés entre achats ;
- les corrections manuelles de l’utilisateur ;
- la taille du foyer ;
- la stabilité des habitudes ;
- les quantités achetées.

Il ne remplace donc pas immédiatement la règle initiale par la moyenne observée. L’apprentissage augmente progressivement avec la quantité de preuves disponibles.

## Robustesse du calcul

Le moteur évite de se baser directement sur une moyenne simple.

Il utilise notamment :

- la médiane des observations ;
- le quantile `40 %` comme cible prudente ;
- la médiane des écarts absolus pour mesurer la stabilité ;
- une confiance croissante avec le nombre d’échantillons.

Les corrections manuelles ont plus de poids qu’un simple intervalle d’achat : elles sont comptées deux fois dans l’ensemble appris et leur contribution à la confiance est pondérée plus fortement.

La confiance reste bornée entre `0,22` et `0,90`.

Avant l’application éventuelle du plafond `shelf`, la durée apprise reste également bornée afin d’éviter les dérives extrêmes : elle ne peut pas descendre sous environ `32 %` de la durée de référence adaptée au foyer ni dépasser trois fois cette durée.

## Prise en compte des quantités achetées

Le moteur conserve la quantité du dernier achat et observe aussi jusqu’aux `10` dernières quantités achetées pour déterminer une quantité typique.

Si le dernier achat est plus important que d’habitude, la fenêtre de disponibilité peut être allongée. S’il est plus faible, elle peut être raccourcie.

L’ajustement est basé sur la racine carrée du rapport :

`dernière quantité / quantité typique`

avec un bornage entre `0,75` et `1,65`.

Le plafond `shelf` est appliqué après cet ajustement, donc une grosse quantité achetée ne permet jamais de dépasser la limite d’un produit périssable.

## Estimation de la quantité restante

La durée seule ne suffit pas pour décider qu’un ingrédient est encore disponible.

Le moteur estime aussi une quantité restante à partir du dernier achat. Cette quantité décroît progressivement jusqu’à zéro pendant la fenêtre `recentDays` :

`quantité restante ≈ dernière quantité × (1 - âge / recentDays)`

La valeur est arrondie vers le haut pour produire une estimation d’unités encore disponibles.

Un ingrédient est considéré comme **Acheté récemment** uniquement si :

1. l’achat se trouve encore dans sa fenêtre de disponibilité ;
2. la quantité estimée restante est au moins égale à la quantité nécessaire pour le plat.

## Quantité nécessaire au plat

Le moteur lit `data-recipe-quantity` sur la ligne de l’ingrédient du plat.

Cette valeur est calculée par la logique de quantités des plats et tient compte du nombre de personnes sélectionné.

Exemple : si le moteur estime qu’il reste une seule unité d’un produit mais que le plat en demande deux, le produit n’est pas masqué : il reste sélectionné pour être acheté.

Cela évite le cas où un produit serait considéré comme disponible simplement parce qu’il en reste un peu alors que la quantité est insuffisante pour la recette.

## Correction manuelle et apprentissage direct

Lorsqu’un ingrédient est marqué **Acheté récemment**, il est désélectionné automatiquement.

Si l’utilisateur le sélectionne quand même manuellement :

- l’override est respecté immédiatement ;
- le marquage **Acheté récemment** est retiré pour cette ligne ;
- le temps écoulé depuis le dernier achat est enregistré comme feedback direct.

Ce feedback signifie en pratique : **le produit n’était plus suffisamment disponible malgré l’estimation actuelle**.

Les feedbacks trop proches sont filtrés : un nouveau feedback identique n’est pas enregistré dans les `6` heures suivant le précédent.

Jusqu’aux `12` derniers feedbacks par produit sont conservés.

Lors des recalculs suivants, ces corrections tirent plus rapidement la durée estimée vers une valeur plus courte et mieux adaptée au foyer réel.

## Comportement dans la fiche d’un plat

Lorsque le dialogue d’un plat est ouvert, le moteur observe les lignes d’ingrédients et les changements de quantité.

Pour un produit considéré comme encore disponible :

- la ligne reçoit la classe `is-recent-purchase` ;
- le texte **Acheté récemment** est ajouté ;
- l’ingrédient est désélectionné automatiquement s’il était sélectionné par défaut ;
- l’utilisateur peut le sélectionner manuellement à tout moment.

Si l’historique est désactivé dans les préférences, les décorations sont retirées et les sélections automatiques précédemment retirées sont restaurées lorsqu’elles n’ont pas été remplacées par un choix manuel.

## Préférence utilisateur

L’option **Historique des achats** se trouve dans les préférences de l’application.

Elle est activée par défaut sauf si la clé :

`courses-purchase-intelligence-enabled-v1`

vaut `0`.

Lorsqu’elle est désactivée :

- aucun nouvel achat n’est enregistré par ce module ;
- les décisions **Acheté récemment** ne sont plus appliquées ;
- les opérations en attente sont annulées ;
- l’historique existant n’est pas détruit.

Une réactivation permet donc de reprendre avec les données déjà disponibles.

## API interne exposée

Le module expose `window.COURSES_PURCHASE_INTELLIGENCE` avec les fonctions suivantes :

- `retentionDays` : durée de rétention de l’historique ;
- `profileFor(name)` : profil calculé d’un produit ;
- `isRecent(name, qty)` : indique si une quantité donnée est probablement encore disponible ;
- `explain(name, qty)` : renvoie soit le résultat détaillé de la décision courante, soit le profil calculé ;
- `isEnabled()` : état de la préférence ;
- `setEnabled(value)` : activation ou désactivation.

`explain()` est utile pour diagnostiquer une recommandation sans modifier l’état.

## Ce que le moteur ne fait pas

Le moteur ne doit pas être interprété comme un inventaire de stock exact.

Il ne :

- connaît pas la DLC réelle d’un paquet acheté ;
- ne sait pas si un produit a été jeté, donné ou consommé exceptionnellement vite ;
- ne bloque jamais définitivement l’achat d’un produit ;
- ne remplace pas la décision de l’utilisateur ;
- ne modifie pas directement la liste Home Assistant `Courses` ;
- ne crée aucun polling permanent ;
- n’ajoute aucun backend ou service externe.

## Invariants à préserver lors d’une évolution

Toute modification future de cette logique doit conserver les points suivants :

1. `catalog.js` reste la source des produits.
2. La liste Home Assistant `Courses` reste prioritaire pour **Ma liste**.
3. Le moteur reste une aide à la recommandation, jamais un blocage absolu.
4. Les produits périssables conservent un plafond de sécurité indépendant de l’apprentissage.
5. Les quantités nécessaires au plat doivent être prises en compte avant de masquer un ingrédient.
6. Un choix manuel de l’utilisateur doit toujours pouvoir outrepasser la recommandation automatique.
7. Les annulations d’achat ne doivent pas rester dans l’historique.
8. Le changement de taille du foyer doit recalculer le modèle sans effacer l’historique.
9. Le fonctionnement reste local et ne doit pas introduire de polling permanent.
10. OAuth, WebSocket Home Assistant, coffre chiffré, verrouillage, biométrie et safe areas iOS ne doivent pas être affaiblis ou contournés.

## Fichiers liés

Les principaux fichiers à consulter avant toute modification sont :

- `purchase-intelligence.js` : moteur d’historique et de recommandation ;
- `catalog.js` : catalogue et métadonnées produits ;
- `catalog-liquid.js` : calcul des quantités nécessaires aux plats et gestion du nombre de personnes ;
- `settings-tab-badge.js` : préférence du nombre de personnes ;
- `dish-local-images.js` : chargement du moteur et version applicative ;
- `sw.js` : cache de la PWA.

Avant de modifier l’un de ces comportements, toujours relire l’implémentation courante sur `main`. Ce document décrit l’architecture actuelle mais le code reste la source de vérité technique.