# Règles agent

## Commits

Pour chaque demande validée, faire un seul commit atomique contenant tous les fichiers nécessaires.

Ne pas faire un commit par fichier ni plusieurs commits d’essai.

Un nouveau commit n’est autorisé qu’après un nouveau feu vert explicite de l’utilisateur, sauf contrainte Git réelle imposant techniquement une nouvelle opération.

## Atlas de visuels produits

Avant toute modification d'un atlas produit, lire `docs/ATLAS_PRODUITS.md`.

La méthode de référence est celle utilisée pour reconstruire l'atlas **Maison v5** : isoler réellement chaque produit, conserver ses pixels source, le recentrer dans une cellule transparente plus grande avec des gouttières régulières, puis supprimer les compensations de recadrage propres à la catégorie lorsque le nouvel atlas les rend inutiles.

Ne pas revenir à des recadrages CSS/JS globaux ou à des exceptions produit par produit tant qu'une reconstruction propre de l'atlas permet de corriger le problème.

