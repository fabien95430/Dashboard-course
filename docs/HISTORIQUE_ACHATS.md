# Historique intelligent des achats

Ce document décrit le fonctionnement de l’historique intelligent implémenté dans `purchase-intelligence.js`.

Le moteur ne cherche pas à maintenir un stock comptable exact. Il construit un **stock probabiliste local** afin d’éviter de recommander inutilement un produit récemment acheté, tout en tenant compte de sa durée probable de disponibilité, des quantités, de la taille du foyer, des habitudes observées et des plats déjà planifiés.

Il ne remplace jamais une DLC, une DDM, l’étiquette d’un produit ni le jugement de l’utilisateur.

## Objectif

Le principe fonctionnel est le suivant :

1. un produit est réellement marqué comme acheté dans **Ma liste** ;
2. l’application crédite localement une quantité probable ;
3. cette quantité décroît avec le temps selon le profil du produit et les habitudes du foyer ;
4. lorsqu’un plat est ajouté et qu’il utilise un produit que le moteur avait automatiquement considéré comme encore disponible, la quantité correspondante est débitée du stock probabiliste ;
5. un produit n’est automatiquement écarté d’une recommandation que si la quantité estimée restante est suffisante **et** si sa fenêtre de disponibilité n’est pas dépassée ;
6. l’utilisateur peut toujours forcer l’ajout d’un ingrédient, ce qui devient un signal d’apprentissage.

L’objectif principal est d’éviter qu’un même achat soit utilisé virtuellement plusieurs fois dans plusieurs plats.

## Source des produits

Le moteur n’a pas son propre catalogue.

Il construit ses métadonnées depuis `window.COURSES_CATALOG`, donc depuis `catalog.js`, qui reste la source de vérité du catalogue.

Une règle peut être définie à trois niveaux :

1. produit précis ;
2. sous-catégorie ;
3. catégorie générale.

La règle la plus précise disponible est prioritaire.

Chaque règle peut contenir :

- `days` : durée probable de disponibilité de référence ;
- `factor` : facteur de prudence appliqué à l’apprentissage ;
- `shelf` : plafond maximal pour les produits sensibles.

## Produits périssables

Pour les produits périssables, `shelf` est une limite dure.

Même si l’historique du foyer suggère une durée plus longue, la période pendant laquelle le moteur peut considérer le produit comme disponible ne dépasse jamais ce plafond.

Exemples de règles actuelles :

- steaks hachés : `2` jours, plafond `2` jours ;
- saumon frais : `2` jours, plafond `2` jours ;
- mozzarella : `4` jours, plafond `5` jours ;
- jambon blanc : `4` jours, plafond `5` jours ;
- lait : `6` jours, plafond `7` jours ;
- œufs : `21` jours, plafond `28` jours.

Ces valeurs servent uniquement à la recommandation.

## Données conservées

La clé locale reste :

`courses-purchase-intelligence-v1`

Le nom de clé est conservé pour migrer les historiques existants sans les perdre.

Le format interne courant est en version `3` et contient notamment :

- `purchases` : achats confirmés ;
- `feedback` : corrections manuelles ;
- `consumptions` : débits probabilistes produits par les plats planifiés ;
- `products` : profils recalculés du catalogue ;
- `household` : taille du foyer utilisée lors du dernier calcul ;
- `updatedAt` : date du dernier recalcul.

Les événements sont conservés au maximum `400` jours.

Les données restent dans le stockage local du navigateur. Ce module n’envoie pas cet historique vers un backend externe.

## Enregistrement d’un achat

Un simple clic sur la coche d’achat ne suffit pas.

`app.js`, propriétaire du flux **Ma liste**, publie l’événement métier `courses:purchase-settled` uniquement lorsque l’action d’achat a dépassé la fenêtre d’annulation et qu’elle est acceptée par le flux courant. L’événement fournit directement le nom, la quantité du groupe acheté et indique si l’action a été placée dans la file hors ligne chiffrée.

Le moteur n’interprète donc plus le texte d’un toast pour reconnaître un achat.

Une fois cet événement reçu, il mémorise :

- la date ;
- la quantité réellement présente dans le groupe de **Ma liste** ;
- la taille du foyer ;
- le début du cycle d’achat.

Le comportement hors ligne reste inchangé : une action correctement enregistrée dans la file locale est considérée comme un achat accepté par l’application, puis synchronisée avec Home Assistant dès que la connexion revient.

### Courses rapprochées

Deux validations du même produit espacées de moins de `18` heures sont regroupées dans un même cycle.

Les quantités sont additionnées.

Le cycle possède :

- `firstAt` : début stable du cycle ;
- `at` : achat le plus récent du cycle.

`firstAt` permet de rattacher correctement les débits de plats au même lot logique, même lorsqu’un complément d’achat est enregistré quelques heures plus tard.

## Annulation d’un achat

L’événement `courses:purchase-settled` n’est publié qu’après la fenêtre d’annulation de l’interface.

Si l’utilisateur choisit **Annuler** pendant cette fenêtre, aucun achat n’est ajouté à l’historique et aucun rollback du moteur probabiliste n’est nécessaire.

## Taille du foyer

Le moteur lit la préférence déjà utilisée pour les plats :

- `courses-dish-preferred-servings-v1` ;
- puis `courses-dish-servings-v1`.

La valeur de repli est `4`.

La taille du foyer influence les durées apprises : à quantité comparable, un foyer plus grand est supposé consommer plus rapidement.

Lorsqu’elle change dans les préférences, les profils sont recalculés sans perdre l’historique précédent.

Les événements historiques conservent la taille du foyer applicable au moment où ils ont été créés afin de normaliser les comparaisons.

## Apprentissage des habitudes

Pour chaque produit, le moteur observe les intervalles entre achats.

Les derniers intervalles sont normalisés selon la taille du foyer puis comparés à la règle de référence.

Le moteur utilise notamment :

- jusqu’aux `12` derniers intervalles d’achat ;
- jusqu’aux `12` derniers retours manuels ;
- une médiane ;
- un quantile prudent ;
- une mesure de dispersion ;
- un niveau de confiance qui augmente avec le nombre de signaux.

Les retours manuels ont davantage de poids qu’un simple intervalle d’achat car ils indiquent directement que l’estimation précédente était trop optimiste.

Avec peu d’historique, la règle catalogue domine.

Avec davantage d’historique, les habitudes observées prennent progressivement plus de poids.

## Quantité achetée

La quantité d’un achat n’est pas ignorée.

Le moteur compare la dernière quantité achetée aux quantités habituelles du même produit.

Une quantité supérieure à l’habitude peut allonger modérément la période probable de disponibilité.

Une quantité inférieure peut la réduire.

Le plafond `shelf` reste prioritaire pour les produits périssables.

## Quantité nécessaire à un plat

Les lignes d’ingrédients des plats exposent `data-recipe-quantity`.

Cette valeur représente le nombre d’unités d’achat nécessaires pour le nombre de personnes choisi.

Le moteur ne se contente donc pas de demander :

> « Est-ce que ce produit est probablement encore présent ? »

Il demande :

> « Est-ce qu’il en reste probablement assez pour ce plat ? »

Si une seule unité est estimée disponible et qu’un plat en demande deux, l’ingrédient n’est pas automatiquement écarté.

## Stock probabiliste

Le stock probabiliste s’appuie sur le dernier cycle d’achat du produit.

Il combine deux mécanismes.

### 1. Débit explicite des plats planifiés

Lorsqu’un plat est ajouté avec succès, le moteur regarde les ingrédients qu’il avait lui-même :

- marqués **Acheté récemment** ;
- désélectionnés automatiquement ;
- considérés en quantité suffisante au moment de l’ajout.

Ces ingrédients représentent les produits que le plat prévoit d’utiliser depuis le stock déjà présent.

Après l’événement métier `courses:dish-add-settled` confirmant l’ajout du plat, leur quantité est débitée dans `consumptions`.

Les ingrédients restés sélectionnés ne sont pas débités : ils sont destinés à être achetés.

Les ingrédients ajoutés manuellement après un override ne sont pas débités non plus.

### 2. Décroissance temporelle

Après les débits explicites, le solde restant continue de décroître avec le temps pendant la fenêtre `recentDays`.

Schématiquement :

`solde explicite = quantité achetée - quantités réservées par des plats`

puis :

`stock estimé = solde explicite × facteur temporel`

Le résultat est ramené à un nombre d’unités d’achat entières.

Une fois `recentDays` atteint, le stock estimé devient nul, même si aucun plat ne l’a explicitement consommé.

## Pourquoi les débits sont liés à un cycle

Chaque événement de consommation contient `cycleAt`.

Il correspond au `firstAt` du cycle d’achat qu’il consomme.

Ainsi, lorsqu’un nouvel achat indépendant est enregistré, les débits d’un ancien cycle ne viennent pas diminuer le nouveau stock.

Cela évite par exemple qu’un plat planifié avant un réapprovisionnement consomme virtuellement les produits nouvellement achetés.

## Confirmation d’un plat

Le moteur ne débite pas le stock au simple clic sur le bouton du plat.

Il mémorise temporairement les ingrédients concernés puis attend le toast de réussite du flux existant.

Les débits sont enregistrés uniquement lorsqu’un ajout est confirmé.

Un message **Ajout partiel** annule la réservation en attente et ne débite pas le stock probabiliste.

Le suivi temporaire expire également automatiquement s’il n’obtient pas de confirmation.

## Exemple

Supposons un achat de `2` mozzarellas.

Le moteur considère initialement deux unités disponibles, sous réserve de la fenêtre de péremption.

Un premier plat nécessite une mozzarella.

La mozzarella est indiquée **Acheté récemment**, désélectionnée, puis le plat est ajouté avec succès.

Le moteur enregistre alors un débit probable de `1`.

Il ne reste plus qu’une unité explicite avant application de la décroissance temporelle.

Si un second plat demande une mozzarella, elle peut encore être considérée disponible.

Si un autre plat en demande deux, le moteur ne considère plus le stock suffisant et laisse l’ingrédient à acheter.

Un nouvel achat crée un nouveau cycle et repart avec la nouvelle quantité sans subir les débits du cycle précédent.

## Override utilisateur

**Acheté récemment** n’est jamais un blocage.

L’utilisateur peut sélectionner manuellement l’ingrédient.

Le moteur :

1. respecte immédiatement ce choix ;
2. retire l’état visuel **Acheté récemment** pour cette ligne ;
3. enregistre un feedback indiquant combien de temps s’est écoulé depuis le dernier achat.

Ce signal aide les recommandations futures à devenir plus prudentes.

## Cas des produits déjà dans Ma liste

La logique de **Ma liste** reste prioritaire.

Si la quantité nécessaire est déjà présente dans la liste Home Assistant, le garde existant du dialogue de plat continue de s’appliquer.

Le stock probabiliste ne remplace pas cette règle et n’écrit pas directement dans Home Assistant.

## Activation

La préférence **Historique des achats** permet d’activer ou désactiver le moteur.

Lorsque le moteur est désactivé :

- aucun nouvel achat n’est appris ;
- aucun nouveau débit de plat n’est enregistré ;
- les ingrédients ne sont plus automatiquement écartés par cet historique ;
- les données existantes ne sont pas détruites.

Une réactivation permet donc de reprendre avec l’historique local déjà présent.

## API de diagnostic

Le module expose `window.COURSES_PURCHASE_INTELLIGENCE`.

Les méthodes principales sont :

- `profileFor(name)` : profil appris ;
- `stockFor(name, at?)` : estimation détaillée du stock probabiliste ;
- `isRecent(name, qty?)` : indique si la quantité demandée est probablement disponible ;
- `explain(name, qty?)` : renvoie le détail utile à l’explication de la décision ;
- `isEnabled()` ;
- `setEnabled(value)`.

Cette API est destinée au diagnostic et aux intégrations internes. Le stockage local reste la source du moteur.

## Limites assumées

Le moteur reste probabiliste.

Il ne sait pas directement :

- si un produit a été jeté ;
- si un produit a été consommé hors d’un plat de l’application ;
- si une quantité réelle diffère du conditionnement modélisé ;
- si un plat planifié a finalement été cuisiné ;
- si un plat utilisant uniquement des produits déjà disponibles a été consommé lorsqu’aucune action d’ajout n’est confirmée.

Un débit de plat est donc une **réservation/consommation probable**, pas une preuve de consommation physique.

Le feedback manuel et les achats suivants servent de mécanismes de correction.

## Invariants à préserver

Toute évolution de ce moteur doit conserver les invariants suivants :

- `catalog.js` reste la source du catalogue ;
- la liste Home Assistant `Courses` reste prioritaire pour **Ma liste** ;
- aucune synchronisation permanente par polling ;
- aucun backend ou service externe supplémentaire pour cet historique ;
- aucun affaiblissement d’OAuth, du WebSocket, du coffre chiffré, du verrouillage ou de la biométrie ;
- les plafonds `shelf` restent prioritaires sur l’apprentissage ;
- un produit marqué récent reste toujours sélectionnable manuellement ;
- les débits de plats ne portent que sur les produits que le moteur avait lui-même considérés comme disponibles ;
- un débit n’est appliqué qu’après confirmation de réussite ;
- les débits d’un cycle ne doivent pas contaminer un nouveau cycle d’achat ;
- mobile-first et safe areas iOS restent inchangés.

## Fichiers liés

La logique principale se trouve dans :

- `purchase-intelligence.js`.

Elle dépend du comportement existant de :

- `catalog.js` pour les produits et catégories ;
- `catalog-liquid.js` pour les quantités d’achat nécessaires aux plats ;
- `dishes-ui.js` pour le dialogue de plat ;
- `dish-added-marker.js` pour le comportement de protection des produits déjà dans **Ma liste** ;
- `app.js` et Home Assistant pour le flux normal de **Ma liste**.

La version et le cache de `purchase-intelligence.js` sont pilotés par les mécanismes existants de l’application.
