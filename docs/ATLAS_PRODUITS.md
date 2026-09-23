# Méthode de reconstruction des atlas produits

Cette note est la référence à suivre lorsqu'un atlas de visuels produits présente des résidus de cases voisines, des traits parasites ou oblige l'application à rogner excessivement les produits.

La méthode a été validée sur **Maison** avec `bring-photo-v5-maison.webp.png`.

## Principe

Ne pas corriger un atlas mal espacé en multipliant les `clip-path`, `safeRight`, `safeBottom` ou exceptions par produit.

Il faut reconstruire l'atlas en **isolant réellement chaque produit** puis en le replaçant dans une cellule transparente suffisamment grande. Le découpage côté application redevient alors simple et stable.

## Procédure de référence

1. Lire l'état actuel de `main`, notamment `catalog.js`, `PRODUCT_SHEETS`, `POSITIONS`, le renderer `sprite()`, `styles.css` et `sw.js`.
2. Garder strictement l'ordre des produits défini par le catalogue : mêmes lignes, mêmes colonnes, aucun déplacement logique.
3. Pour chaque produit, déterminer son contour utile à partir de l'alpha de l'image source et extraire une boîte englobante serrée.
4. Ignorer uniquement les pixels quasi transparents servant de bruit de bord. Pour Maison v5, le seuil utilisé était `alpha <= 8`.
5. Copier les pixels du produit **sans les agrandir ni les étirer**.
6. Créer des cellules transparentes plus grandes et de dimensions identiques pour toute la catégorie.
7. Centrer chaque produit dans sa cellule et conserver une gouttière transparente réelle sur les quatre côtés. Si un produit est trop proche du bord, **agrandir la cellule plutôt que rogner le produit**.
8. Préserver le ratio de cellule attendu par l'application. Le ratio déclaré dans `PRODUCT_SHEETS` doit correspondre à `largeur_cellule / hauteur_cellule`.
9. Générer un nouveau fichier d'atlas versionné au lieu d'écraser silencieusement l'ancien.
10. Mettre à jour la référence de l'atlas dans `PRODUCT_SHEETS`, son paramètre de cache, le shell du service worker et le cache global selon les conventions de la version courante.
11. Pour la catégorie reconstruite, retirer les compensations de recadrage devenues inutiles. Une catégorie propre doit idéalement fonctionner avec `safeTop = 0`, `safeLeft = 0`, `safeRight = 0`, `safeBottom = 0`.
12. Vérifier le résultat dans **Catalogue** et **Ma liste**, y compris le rendu compact, les boutons `+`, les quantités, le mobile iPhone et les safe areas.
13. Supprimer les scripts, pages d'aperçu ou workflows temporaires utilisés uniquement pour la reconstruction. Ne pas ajouter de dépendance runtime.

## Référence Maison v5

La reconstruction validée de Maison conserve :

- grille : **12 colonnes × 7 lignes** ;
- ratio de cellule : **0,875** ;
- cellule : **140 × 160 px** ;
- atlas final : **1680 × 1120 px** ;
- 84 produits conservés dans le même ordre ;
- pixels produits copiés à leur taille source, sans upscale ;
- fond transparent ;
- marge réelle entre le contenu et les limites des cellules ;
- recadrage spécifique Maison supprimé côté application.

Ces valeurs sont une référence pour Maison, pas une règle à recopier aveuglément sur les autres catégories. Pour chaque nouvel atlas, calculer une taille de cellule adaptée au plus grand produit tout en conservant le ratio attendu.

## Garde-fous

- `catalog.js` reste la source du catalogue : ne pas changer les noms ou l'ordre uniquement pour faciliter l'atlas.
- Ne jamais mélanger les cellules ou modifier la correspondance `row/col`.
- Ne pas régénérer artistiquement les produits si les visuels sources existants sont bons.
- Ne pas réduire toute une catégorie pour masquer quelques résidus.
- Ne pas créer d'exception par sous-catégorie ou par produit si le problème vient de l'espacement de l'atlas.
- Ne toucher ni à Home Assistant, ni à OAuth, ni au WebSocket, ni au coffre chiffré pour une opération sur les visuels.
- Respecter la règle de commit atomique de `AGENTS.md`.

## Critère de réussite

Un atlas est considéré comme propre lorsque chaque case peut être affichée seule, sans récupérer de pixel du voisin et sans devoir couper une partie visible du produit.

Si ce critère n'est pas atteint, corriger l'atlas avant d'ajouter de nouveaux artifices de recadrage dans l'interface.
