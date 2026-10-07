# Référence de régénération des images d’items

Cette note est la référence pour recréer ou remplacer l’image d’un produit du catalogue tout en gardant le même style que les autres items.

## Principe actuel

- **Un item = une image = un fichier WebP.**
- Les images unitaires sont stockées dans `www/Items/`.
- `catalog.js` reste la source de vérité pour les noms et catégories des produits.
- `product-item-images.js` transforme le nom du produit en slug puis charge `./www/Items/<slug>.webp`.
- Les catégories Fruits & Légumes, Frais, Épicerie, Boissons et Maison utilisent les images unitaires.
- Les anciens atlas restent uniquement comme **solution de repli** si une image unitaire manque ou ne charge pas. Ne pas les supprimer lors de la régénération d’un seul item.

## Règle visuelle

Avant toute génération, ouvrir plusieurs items existants de la **même catégorie**, de préférence avec une forme ou un emballage proche du produit à refaire. Ces fichiers sont la référence visuelle prioritaire.

Le nouvel item doit conserver exactement le langage visuel déjà présent dans `www/Items/` :

- un seul produit ;
- produit isolé et immédiatement reconnaissable ;
- fond transparent ;
- objet centré ;
- proportions naturelles ;
- marge transparente régulière autour de l’objet ;
- aucun bord important coupé ;
- échelle visuelle cohérente avec les autres items de la catégorie ;
- même niveau de détail, de volume, d’ombre et de finition que les références choisies ;
- aucun décor, table, rayon de magasin, main ou personne ;
- aucun collage, aucune grille, aucun deuxième produit ;
- aucun texte ajouté autour du produit ;
- ne jamais inventer une marque ou un logo.

Pour un produit emballé, garder un emballage simple et générique cohérent avec les items voisins. Ne pas créer de texte lisible ou de marque fictive uniquement pour remplir l’étiquette.

Ne jamais changer volontairement de style graphique. Si les références de la catégorie ont un rendu différent de ce qui est décrit ici, **les références existantes priment**.

## Prompt prêt à réutiliser

Utiliser ce modèle lorsque l’on demande la régénération d’un item :

> Régénère uniquement l’image de l’item **« [NOM EXACT DU PRODUIT] »** dans le même style que les autres produits existants de sa catégorie **[CATÉGORIE]**. Commence par lire l’état actuel de `main`, `catalog.js`, `product-item-images.js` et plusieurs images existantes de `www/Items/` appartenant à la même catégorie afin de reprendre leur style réel. Génère exactement **un seul produit**, isolé sur **fond transparent**, centré, avec des proportions naturelles et une marge régulière autour. Le cadrage, l’échelle, le niveau de détail, les ombres et la finition doivent rester cohérents avec les références existantes. Aucun décor, aucune main, aucune personne, aucun collage, aucune grille, aucun deuxième produit, aucun texte ajouté autour, aucune marque ou logo inventé. Si le produit est emballé, utiliser un emballage générique cohérent avec les références. Intégrer le résultat en **WebP** dans `www/Items/` avec le nom de fichier attendu par le slug actuel. Ne modifier aucun autre comportement de l’application sauf ce qui est strictement nécessaire pour versionner et invalider le cache conformément aux règles du dépôt. Vérifier le résultat dans Catalogue et Ma liste, sur mobile et avec le mode hors ligne. Conserver l’atlas comme fallback.

## Nom du fichier

Le nom du fichier doit correspondre exactement au `slugify()` actuellement utilisé dans `product-item-images.js` :

1. passage en minuscules ;
2. `œ` devient `oe` ;
3. suppression des accents ;
4. tout caractère autre que `a-z` ou `0-9` devient `-` ;
5. suppression des tirets au début et à la fin.

Exemples :

- `Crème fraîche` → `creme-fraiche.webp`
- `Fruits & Légumes` → `fruits-legumes.webp`
- `Après-shampoing` → `apres-shampoing.webp`

Chemin final :

`www/Items/<slug>.webp`

Ne jamais renommer le produit dans `catalog.js` uniquement pour simplifier le fichier image.

## Régénération d’un item existant

Si le produit existe déjà dans `catalog.js` :

1. vérifier son nom exact et sa catégorie ;
2. choisir plusieurs références visuelles proches dans `www/Items/` ;
3. générer une seule nouvelle image ;
4. contrôler visuellement le résultat ;
5. remplacer uniquement `www/Items/<slug>.webp` ;
6. appliquer l’incrément de version globale et de cache exigé par `AGENTS.md` pour toute modification visuelle ;
7. conserver la logique de cache actuelle et ne pas ajouter de mécanisme spécial par produit sans nécessité ;
8. vérifier Catalogue, Ma liste, affichage compact, mobile et hors ligne.

Une simple régénération visuelle ne doit pas modifier `catalog.js`, Home Assistant, OAuth, WebSocket, le coffre chiffré, le verrouillage ou la biométrie.

## Nouvel item qui n’existe pas encore

Créer une image ne suffit pas à ajouter un nouveau produit au catalogue.

Si le nom n’existe pas dans `catalog.js`, l’ajout au catalogue est une demande fonctionnelle distincte. Il faut alors relire l’implémentation actuelle et suivre les règles du dépôt avant d’intégrer le produit et son visuel.

## Contrôle qualité avant validation

L’image n’est validée que si toutes les réponses sont **oui** :

- est-ce bien le bon produit ?
- y a-t-il un seul produit ?
- le fond est-il transparent ?
- le produit est-il centré et non coupé ?
- la taille apparente est-elle cohérente avec les autres items de la catégorie ?
- le style correspond-il aux références réelles de `www/Items/` ?
- l’objet reste-t-il lisible à la petite taille d’une tuile Catalogue ?
- aucune marque, aucun logo ou texte parasite n’a-t-il été inventé ?
- le fichier porte-t-il exactement le slug attendu ?
- le rendu est-il correct dans Catalogue et Ma liste ?
- le fallback atlas fonctionne-t-il toujours si le fichier unitaire échoue ?
- le mode hors ligne et le cache restent-ils fonctionnels ?

Si un de ces points échoue, corriger ou régénérer l’image avant intégration.

## Garde-fous

- Faire le changement minimum nécessaire.
- Ne pas refondre le système d’images pour remplacer un seul item.
- Ne pas supprimer les atlas de secours dans une opération de régénération isolée.
- Ne pas ajouter de dépendance runtime.
- Lire l’état courant de `main` au moment de chaque intervention : cette note décrit la méthode, mais le dépôt reste la source de vérité.
- Respecter la règle du commit atomique et les règles de version visibles de `AGENTS.md`.
