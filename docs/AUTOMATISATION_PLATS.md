# Demandes d’ajout produits et plats

Le bouton **Intégrer** de **Réglages → Produits & plats manquants** utilise un flux assisté par ChatGPT. La PWA ne contient aucun token GitHub ni clé OpenAI et ne réalise pas elle-même l’intégration du catalogue.

Ce flux ne modifie pas la liste Home Assistant `Courses`, OAuth, le WebSocket de synchronisation, le coffre chiffré, le verrouillage ou la biométrie.

## Flux actuel

1. L’utilisateur ajoute un produit ou un plat manquant.
2. L’application conserve la demande dans le popup et dans le badge Réglages. Si les notifications sont autorisées, une notification système **Courses** confirme immédiatement la création de la demande en plus du toast dans l’application.
3. Le bouton **Intégrer** construit localement un prompt complet, le copie dans le presse-papiers puis ouvre ChatGPT selon le mécanisme déjà utilisé par l’application.
4. Le prompt impose notamment :
   - le dépôt `fabien95430/Dashboard-course`, branche `main`, comme source de vérité ;
   - la lecture de l’implémentation actuelle avant modification ;
   - le changement minimum nécessaire ;
   - le respect de `catalog.js`, des conventions de visuels, de GitHub Pages, de Home Assistant, de la sécurité et du mobile ;
   - une seule image finale par plat, jamais d’atlas de plats ;
   - pour un produit, le respect de `docs/IMAGES_ITEMS.md` et d’une image WebP unitaire dans `www/Items/`.
5. Pour un **produit comme pour un plat**, le même clic arme aussi la notification de fin :
   - si nécessaire, iOS demande l’autorisation des notifications depuis cette action utilisateur ;
   - la PWA récupère la souscription Web Push et la clé publique VAPID via Home Assistant ;
   - elle appelle le relais existant `rest_command.courses_integrate_dish` par le WebSocket Home Assistant ;
   - ce `rest_command` déclenche le `repository_dispatch` `courses_dish_request` sans lancer d’intégration automatique ;
   - pour un produit, la PWA ajoute uniquement un préfixe interne au nom relayé afin que le workflow puisse distinguer produit et plat sans ajouter un second secret ou un second relais.
6. Le workflow `.github/workflows/integrate-dish.yml` conserve uniquement en mémoire de run la souscription Push et attend au maximum 45 minutes :
   - qu’un plat et son image locale apparaissent sur `main` ;
   - ou qu’un produit apparaisse réellement dans les groupes de `catalog.js`.
   Cette veille est temporaire et ne crée aucun polling permanent dans la PWA.
7. Une fois l’élément détecté, le workflow attend que la version correspondante soit réellement publiée sur GitHub Pages, puis envoie la notification Web Push **Courses**. En cas d’échec ou d’expiration de la veille, une notification d’erreur est envoyée lorsque la souscription Push est disponible.
8. Après le chargement de la nouvelle version dans l’application :
   - un produit présent dans le catalogue est retiré automatiquement des demandes ;
   - un plat n’est retiré qu’une fois sa carte présente avec sa photo locale chargée ;
   - l’application affiche **Produit ajouté** ou **Plat ajouté**.
9. Le badge Réglages diminue automatiquement après suppression de la demande traitée.

Pendant la veille, la ligne du produit ou du plat affiche **En cours…**. La corbeille permet toujours de supprimer manuellement une demande locale.

## Pré-requis notification

Le flux de notification réutilise l’infrastructure déjà prévue par le projet :

- `input_text.courses_vapid_public_key` dans Home Assistant contient la clé publique VAPID ;
- `rest_command.courses_integrate_dish` relaie vers GitHub le `repository_dispatch` `courses_dish_request` avec le nom relayé, sa catégorie, le `request_id` et les champs `push_*` transmis par la PWA ;
- le secret GitHub `COURSES_VAPID_PRIVATE_KEY` correspond à cette clé publique ;
- la PWA est installée sur l’écran d’accueil iOS et les notifications sont autorisées.

Si l’un de ces pré-requis manque, l’ouverture de ChatGPT reste disponible mais la notification de fin ne peut pas être armée. La notification locale de création reste indépendante du relais GitHub dès lors que les notifications système sont autorisées.

## Sécurité

Aucun token GitHub, aucune clé OpenAI, aucune clé VAPID privée et aucun secret Home Assistant n’est ajouté au JavaScript de la PWA. Le prompt ne contient que le nom de l’élément, sa catégorie éventuelle et les règles techniques nécessaires à l’intégration.

La souscription Web Push est transmise uniquement au moment où l’utilisateur demande l’intégration. Le workflow de veille ne l’écrit pas dans le dépôt et les scripts ne l’affichent pas dans les logs.

Le flux **Intégrer → ChatGPT** reste indépendant de l’authentification Home Assistant pour la modification du catalogue. Home Assistant n’est utilisé que pour armer la notification de fin via le WebSocket déjà établi.

## Garde-fous

- `catalog.js` reste la source du catalogue produits et des noms d’ingrédients utilisables par les plats.
- La liste Home Assistant `Courses` reste prioritaire pour Ma liste.
- Aucune synchronisation permanente par polling n’est ajoutée.
- Les mécanismes OAuth, WebSocket, coffre chiffré, verrouillage et biométrie ne sont pas affaiblis.
- Mobile-first et les safe areas iOS restent inchangés.
- Aucun framework, backend ou dépendance externe supplémentaire n’est introduit.

## Synchronisation entre téléphones (v465)

Les demandes de produits et de plats manquants sont partagées via une **liste Local to-do Home Assistant dédiée** `todo.courses_demandes`, qui ne doit jamais être utilisée comme liste de courses active. Créer dans Home Assistant **Paramètres → Appareils et services → Ajouter une intégration → Local to-do**, avec le nom **Courses demandes** (vérifier ou adapter son identifiant pour obtenir `todo.courses_demandes`).

Chaque iPhone conserve ses demandes précédentes jusqu'à la première connexion à cette liste, puis celles-ci sont fusionnées par type et nom normalisé sans effacer les demandes de l'autre téléphone. Après cette migration, Home Assistant est prioritaire ; les ajouts et suppressions sont transmis par le WebSocket partagé et les autres appareils sont actualisés sur `subscribe_trigger`, sans polling. Les éditions hors ligne sont mises en file localement jusqu'à la prochaine connexion. La catégorie et la précision d'image produit sont enregistrées dans la description de chaque item Local to-do. Les états d'intégration OpenAI et les préférences restent locaux.

Si cette entité dédiée n'est pas configurée ou est indisponible, l'application conserve son fonctionnement local existant ; aucune demande n'est effacée, mais la synchronisation multiappareil n'est pas active. En mode test, aucune connexion Home Assistant n'est ouverte. OAuth, verrouillage, coffre chiffré, liste `Courses` et catalogue restent inchangés.

## Récupération v466

La v466 récupère les demandes encore stockées localement, y compris si la v465 avait indiqué que la migration était terminée. Elle ne confirme cette récupération qu'après une nouvelle lecture du stockage Home Assistant et la vérification de chaque demande attendue. En cas d'échec, aucune demande locale n'est effacée et le popup affiche un message explicite. Le popup permet aussi de redétecter la liste lors de son ouverture.

L'application utilise un abonnement natif Home Assistant `todo/item/subscribe` sur son WebSocket existant. Aucun polling permanent ni nouveau serveur. La liste technique `todo.courses_demandes` n'est jamais choisie pour « Ma liste ».

## Correctif hors ligne v467

Le traitement de file ne provoque plus d'erreur JavaScript lorsque le WebSocket Home Assistant est absent et que la synchronisation n'est pas active. La demande reste dans le stockage local jusqu'à la prochaine reconnexion. Aucune intervention utilisateur ni reconfiguration Home Assistant n'est requise.

## Notifications sur plusieurs iPhone (v479)

Créer dans Home Assistant une liste **Local to-do** distincte nommée **Courses notifications**, dont l'entité est \`todo.courses_notifications\`. Chaque iPhone doit être équipé de la PWA installée sur son écran d'accueil et autoriser ses notifications avec le bouton « Activer les notifications sur cet iPhone » du popup. Les abonnements Web Push (endpoint, clés publiques P-256 et authentification) sont enregistrés exclusivement dans les descriptions de cette liste Home Assistant, accessible uniquement aux utilisateurs HA autorisés ; seuls les identifiants locaux aléatoires sont stockés sur les téléphones. Le bouton « Désactiver » retire le téléphone de cette liste et révoque sa souscription. Aucune clé VAPID privée ou jeton GitHub n'est envoyé au navigateur.

Dans \`rest_command.courses_integrate_dish_openai\`, ajouter au \`client_payload\` sans enlever les champs actuels :
\`\`\`yaml
"push_subscriptions": push_subscriptions | default('[]', true)
\`\`\`

Définir aussi un \`rest_command.courses_notify_all\` qui émet le \`repository_dispatch\` \`courses_notification_event\` avec \`kind: event_kind\`, \`name: item_name\`, \`item_type: item_type\`, \`request_id: request_id\` et \`push_subscriptions: push_subscriptions | default('[]', true)\`. Reprendre le même URL, le même secret d'autorisation GitHub et les mêmes en-têtes que le relais existant. Puis recharger les rest_commands dans Home Assistant.

Un nouvel ajout de demande produit/plat lance une notification d'événement indépendante. Un démarrage OpenAI lance une notification de démarrage. Les workflows d'intégration OpenAI (et du flux manuel existant) utilisent l'abonnement collectif transmis dans le dispatch pour la notification de résultat. Le destinataire historique reste utilisé comme solution de secours si la liste HA ou son nouveau relais ne sont pas encore configurés. Chaque exécution ne traite que 12 appareils distincts au plus et masque leurs abonnements dans les journaux GitHub ; un appareil dont le Push a expiré n'empêche pas les autres d'être notifiés.

Ces notifications ne sont pas produites par le WebSocket lorsque l'application est fermée : le Web Push est livré en arrière-plan par le service worker iOS. Le WebSocket reste chargé de la liste de courses et de la synchronisation des demandes.
