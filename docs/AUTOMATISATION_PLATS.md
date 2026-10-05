# Demandes d’ajout produits et plats

Le bouton **Intégrer** de **Réglages → Produits & plats manquants** utilise un flux assisté par ChatGPT. La PWA ne contient aucun token GitHub ni clé OpenAI et ne réalise pas elle-même l’intégration du catalogue.

Ce flux ne modifie pas la liste Home Assistant `Courses`, OAuth, le WebSocket de synchronisation, le coffre chiffré, le verrouillage ou la biométrie.

## Flux actuel

1. L’utilisateur ajoute un produit ou un plat manquant.
2. L’application conserve la demande dans le popup et dans le badge Réglages.
3. Le bouton **Intégrer** construit localement un prompt complet, le copie dans le presse-papiers puis tente d’ouvrir directement l’application ChatGPT sur iOS avec `com.openai.chat://`. Si l’application ne prend pas le lien en charge, la PWA revient vers `https://chatgpt.com/`.
4. Le prompt impose notamment :
   - le dépôt `fabien95430/Dashboard-course`, branche `main`, comme source de vérité ;
   - la lecture de l’implémentation actuelle avant modification ;
   - le changement minimum nécessaire ;
   - le respect de `catalog.js`, des conventions de visuels, de GitHub Pages, de Home Assistant, de la sécurité et du mobile ;
   - une seule image finale par plat, jamais d’atlas de plats ;
   - pour un produit, le respect de `docs/ATLAS_PRODUITS.md` et de l’atlas de sa catégorie.
5. Pour un **plat**, le même clic arme aussi la notification de fin :
   - si nécessaire, iOS demande l’autorisation des notifications depuis cette action utilisateur ;
   - la PWA récupère la souscription Web Push et la clé publique VAPID via Home Assistant ;
   - elle appelle `rest_command.courses_integrate_dish` par le WebSocket Home Assistant existant ;
   - ce `rest_command` déclenche le `repository_dispatch` `courses_dish_request` sans lancer d’intégration automatique.
6. Le workflow `.github/workflows/integrate-dish.yml` conserve uniquement en mémoire de run la souscription Push et attend au maximum 45 minutes que le plat **et son image locale** apparaissent sur `main`. Cette veille est temporaire et ne crée aucun polling permanent dans la PWA.
7. Une fois le plat détecté, le workflow attend que la version correspondante soit réellement publiée sur GitHub Pages, puis envoie la notification Web Push **Courses**. En cas d’échec ou d’expiration de la veille, une notification d’erreur est envoyée lorsque la souscription Push est disponible.
8. Après le chargement de la nouvelle version dans l’application :
   - un produit présent dans le catalogue est retiré automatiquement des demandes ;
   - un plat n’est retiré qu’une fois sa carte présente avec sa photo locale chargée ;
   - l’application affiche **Produit ajouté** ou **Plat ajouté**.
9. Le badge Réglages diminue automatiquement après suppression de la demande traitée.

Pendant la veille d’un plat, la ligne affiche **En cours…**. La corbeille permet toujours de supprimer manuellement une demande locale.

## Pré-requis notification

Le flux de notification des plats réutilise l’infrastructure déjà prévue par le projet :

- `input_text.courses_vapid_public_key` dans Home Assistant contient la clé publique VAPID ;
- `rest_command.courses_integrate_dish` relaie vers GitHub le `repository_dispatch` `courses_dish_request` avec le nom du plat, sa catégorie, le `request_id` et les champs `push_*` transmis par la PWA ;
- le secret GitHub `COURSES_VAPID_PRIVATE_KEY` correspond à cette clé publique ;
- la PWA est installée sur l’écran d’accueil iOS et les notifications sont autorisées.

Si l’un de ces pré-requis manque, l’ouverture de ChatGPT reste disponible mais l’application indique que la notification n’a pas pu être armée.

## Sécurité

Aucun token GitHub, aucune clé OpenAI, aucune clé VAPID privée et aucun secret Home Assistant n’est ajouté au JavaScript de la PWA. Le prompt ne contient que le nom de l’élément, sa catégorie éventuelle et les règles techniques nécessaires à l’intégration.

La souscription Web Push est transmise uniquement au moment où l’utilisateur demande l’intégration d’un plat. Le workflow de veille ne l’écrit pas dans le dépôt et les scripts ne l’affichent pas dans les logs.

Le flux **Intégrer → ChatGPT** reste indépendant de l’authentification Home Assistant pour la modification du catalogue. Home Assistant n’est utilisé que pour armer la notification de fin via le WebSocket déjà établi.

## Garde-fous

- `catalog.js` reste la source du catalogue produits et des noms d’ingrédients utilisables par les plats.
- La liste Home Assistant `Courses` reste prioritaire pour Ma liste.
- Aucune synchronisation permanente par polling n’est ajoutée.
- Les mécanismes OAuth, WebSocket, coffre chiffré, verrouillage et biométrie ne sont pas affaiblis.
- Mobile-first et les safe areas iOS restent inchangés.
- Aucun framework, backend ou dépendance externe supplémentaire n’est introduit.
