# Règles agent

## Module propriétaire et factorisation

Pour modifier un comportement existant, modifier le module qui en est propriétaire. Ne pas ajouter un script correctif, une interception de clic, un MutationObserver ou une surcharge CSS uniquement pour contourner ce module.

Une extraction en module partagé est appropriée si elle remplace réellement les implémentations concurrentes. Garder une seule source de vérité pour le comportement extrait et supprimer les anciennes voies dans la même demande.

Avant d'unifier une logique métier, fixer ses résultats attendus dans des tests exécutables. Vérifier aussi le comportement affiché lorsqu'il dépend d'événements UI (input, change, blur, clic). Les tests Node se lancent avec `node --test tests/*.test.mjs`.

Ne pas remplacer globalement les méthodes natives du navigateur pour récupérer un état interne. La suppression du pont existant sur `WebSocket.prototype.send` est une priorité haute : exposer un client Home Assistant partagé en préservant la fermeture au verrouillage et la confidentialité des jetons.

## Commits

Pour chaque demande validée, faire un seul commit atomique contenant tous les fichiers nécessaires.

Ne pas faire un commit par fichier ni plusieurs commits d’essai.

Un nouveau commit n’est autorisé qu’après un nouveau feu vert explicite de l’utilisateur, sauf dans les deux cas suivants :

- contrainte Git réelle imposant techniquement une nouvelle opération ;
- traitement automatique des demandes présentes dans `requests/pending/` : le lancement de cette automatisation vaut autorisation explicite de traiter les demandes compatibles jusqu’au commit final, sans redemander un feu vert à chaque élément ni à chaque exécution.

En automatisation, regrouper les demandes compatibles dans un seul commit atomique lorsque c’est possible. Une demande ne doit être déplacée de `requests/pending/` vers `requests/done/` que dans le même commit que son intégration complète. Si une demande ne peut pas être traitée correctement, la laisser dans `pending` et ne conserver aucune modification partielle liée à cette demande.

## Version visible

Les badges de version `.page-version` doivent rester affichés à côté des titres principaux `h1` de Ma liste, Catalogue et Réglages.

À chaque modification fonctionnelle, visuelle ou technique de l’application, incrémenter la version globale et afficher exactement la même version sur toutes les pages dans le même commit. Ne jamais laisser des numéros de version différents selon les vues.

Une modification de documentation ou de consignes agent uniquement, sans changement de l’application, ne nécessite pas d’incrémenter la version visible.

## Intégration rapide des demandes

Avant toute intégration, vérifier si l’élément existe déjà dans l’application et dans les assets locaux.

Privilégier la voie Git la plus directe et la plus courte : créer les blobs nécessaires, construire un arbre à partir de l’arbre courant de `main`, créer un unique commit puis avancer `main` avec contrôle du SHA attendu. Éviter les branches, commits ou fichiers temporaires lorsqu’ils ne sont pas indispensables.

Ne pas utiliser GitHub Actions pour une intégration simple de plat ou de produit si l’API Git permet de produire directement le commit final. GitHub Actions n’est autorisé comme solution de repli que si une contrainte technique réelle empêche la voie directe ou si le dépôt l’exige explicitement.

Si GitHub Actions est réellement nécessaire, limiter le coût : checkout shallow et ciblé, ne pas récupérer toutes les branches ni tout l’historique, ne pas utiliser `fetch-depth: 0` sans nécessité, et ne pas découper une image en une multitude de fragments Base64. Utiliser un seul asset de transport par visuel, ou le minimum techniquement nécessaire.

Ne jamais utiliser l’API OpenAI payante du projet pour traiter une demande automatique.

## Visuels des plats

Pour une demande `dish`, le visuel local fait partie de l’intégration lorsqu’il n’existe pas déjà.

Utiliser comme référence prioritaire les visuels existants de `www/Plats/` lorsqu’ils sont directement consultables. Si leur lecture binaire n’est pas disponible par le connecteur, utiliser le prompt canonique et les règles visuelles définies dans le dépôt, notamment dans `scripts/integrate_dish.py`, au lieu de demander à l’utilisateur de fournir manuellement une image déjà présente dans le projet.

Générer exactement une image par plat. L’image doit représenter uniquement le plat demandé : aucun mockup d’interface, aucune carte UI, aucun collage, aucun deuxième plat, aucune comparaison avant/après, aucun texte ni personne.

Le rendu doit conserver la direction visuelle du projet : photographie culinaire réaliste, assiette ronde beige mouchetée à bord brun, table en bois chaleureuse, vue trois-quarts légèrement plongeante, assiette entière ou presque entière, lumière naturelle chaude et douce et arrière-plan discret lorsque cette direction est celle définie par le prompt canonique courant.

Contrôler visuellement le résultat avant intégration. Rejeter et régénérer une image qui mélange plusieurs plats, représente mal le plat demandé ou s’écarte nettement de la direction visuelle du projet.

Respecter le nom de fichier attendu par `dish-local-images.js`, l’emplacement `www/Plats/` et le format local courant. Ne pas créer une nouvelle mécanique d’image si le slug automatique existant suffit.

Ajouter le plat dans `dishes-ui.js` avec sa catégorie et uniquement des ingrédients compatibles avec le catalogue courant. Incrémenter ensuite la version globale et le cache conformément aux règles existantes, puis déplacer la demande vers `done` dans le même commit.

## Visuels des produits

Un produit utilise une image WebP unitaire dans `www/Items/`. Lire `docs/IMAGES_ITEMS.md` avant toute création ou modification d’un visuel produit.

Ne jamais réintroduire d’atlas, de planche ou de sprite produit. `product-item-images.js` peut harmoniser le cadrage des WebP unitaires, et le SVG premium local reste le seul fallback si une image manque ou échoue.
