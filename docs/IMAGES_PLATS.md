# Référence de génération des images de plats

Cette note est la source de référence pour recréer de nouvelles images de plats cohérentes avec le catalogue.

## Règle absolue

- **Une image = un plat = un fichier.**
- Ne jamais générer de planche, grille, triptyque, collage, atlas ou sprite pour les plats.
- Générer les plats **un par un**, même lorsqu'une série de 10 plats est demandée.
- Les lots servent uniquement à organiser le travail ou les commits, jamais à réunir plusieurs plats dans une même image.
- Ne jamais conserver une génération qui dérive vers un autre plat, duplique des éléments ou mélange plusieurs recettes.

## Format et cadrage communs

- Photo culinaire réaliste, haute qualité, format horizontal proche de **4:3**.
- Vue légèrement plongeante, environ trois-quarts haut, identique à la série validée.
- Plat centré dans une assiette ronde.
- L'assiette doit être visible dans son ensemble ou quasi entièrement, avec une marge naturelle de table autour.
- Ne jamais coller l'assiette aux quatre bords et ne jamais couper fortement le plat.
- Garder de l'air autour de l'assiette afin que le recadrage des tuiles du catalogue reste propre.
- Lumière naturelle chaude et douce.
- Table en bois chaleureuse.
- Arrière-plan culinaire discret et cohérent avec la recette : herbes, légumes ou ingrédients du plat.
- Profondeur de champ légère : le plat est net, l'arrière-plan peut être doux, mais **aucun gros flou artificiel dans un coin**, aucune bordure étirée et aucun remplissage visiblement généré.
- Aucun texte, logo, watermark, main ou personne.
- Éviter les accessoires qui deviennent le sujet principal.

## Référence visuelle — plats adultes

La référence adulte validée est le rendu de la **Salade César au saumon** utilisé pendant la création de la série :

- grande assiette/bol en céramique beige mouchetée avec bord brun discret ;
- assiette posée sur une table en bois chaude ;
- cadrage serré mais avec le bord de l'assiette clairement visible ;
- vue légèrement plongeante ;
- lumière chaude venant naturellement du côté/haut ;
- couleurs gourmandes mais réalistes ;
- ingrédients bien lisibles et distincts ;
- arrière-plan doux avec quelques ingrédients, sans zone de flou envahissante ;
- aspect photo éditoriale/cuisine, pas image publicitaire artificielle ;
- décoration légère avec herbes seulement lorsque le plat s'y prête.

### Gabarit de prompt adulte

> Photo culinaire réaliste et appétissante de **[NOM DU PLAT]**, un seul plat dans une assiette ronde en céramique beige mouchetée à bord brun discret, posée sur une table en bois chaleureuse. Vue légèrement plongeante en trois-quarts haut, même cadrage que la référence adulte du catalogue. Assiette entière ou quasi entière avec une marge naturelle de table visible autour, aucun bord important coupé. Le contenu exact est **[DESCRIPTION DES INGRÉDIENTS ET DE LA PRÉSENTATION]**. Lumière naturelle chaude et douce, textures alimentaires réalistes, ingrédients nets et lisibles, couleurs gourmandes mais naturelles. Quelques ingrédients cohérents avec la recette en arrière-plan, légèrement flous. Aucun collage, aucune grille, aucun deuxième plat, aucun texte, aucune personne, aucun gros flou artificiel dans les coins, aucune bordure étirée.

## Référence visuelle — plats enfants

La référence enfant validée est l'image **Pâtes jambon** avec :

- même réalisme photographique, même table en bois et même lumière générale que les plats adultes ;
- assiette blanche d'enfant avec bord bleu et petits dessins colorés d'animaux/étoiles ;
- pâtes longues crémeuses au jambon présentées simplement ;
- petite vaisselle/accessoires enfant discrets autour, par exemple verre bleu illustré et couvert à manche bleu ;
- ambiance enfant clairement identifiable **sans transformer la nourriture en dessin animé** ;
- composition propre, appétissante et rassurante ;
- portion et présentation plus simples que pour un plat adulte ;
- assiette bien visible, sans recadrage excessif.

La différence enfant doit venir surtout de **la vaisselle, la simplicité de la portion et quelques accessoires**, pas d'un style graphique différent.

### Gabarit de prompt enfant

> Photo culinaire réaliste et appétissante pour enfant de **[NOM DU PLAT]**, un seul plat servi dans une assiette blanche pour enfant avec bord bleu et petits motifs colorés d'animaux et d'étoiles, sur la même table en bois chaleureuse que la série adulte. Vue légèrement plongeante en trois-quarts haut, assiette entière ou quasi entière avec marge de table autour. Portion simple et rassurante, ingrédients faciles à identifier : **[DESCRIPTION DU PLAT]**. Ajouter seulement quelques accessoires enfant discrets en arrière-plan, par exemple un petit verre bleu illustré ou un couvert à manche bleu. Garder la nourriture totalement réaliste, sans visage dans la nourriture, sans forme fantaisie forcée. Lumière naturelle chaude et douce, rendu cohérent avec le catalogue. Aucun collage, aucune grille, aucun deuxième plat, aucun texte, aucune personne, aucun gros flou artificiel, aucune bordure étirée.

## Processus obligatoire pour une nouvelle série

1. Identifier si le plat est **adulte** ou **enfant** avant de générer.
2. Prendre le gabarit correspondant ci-dessus comme base et ne changer que le plat, ses ingrédients et les accessoires réellement nécessaires.
3. Générer **une seule image à la fois**.
4. Contrôler visuellement le résultat avant de passer au plat suivant.
5. Rejeter et régénérer immédiatement l'image si le mauvais plat apparaît, si plusieurs plats sont réunis, si l'assiette est trop coupée, si un coin présente un gros artefact de flou, si la composition dérive du style de référence ou si le plat devient trop artificiel.
6. Ne regrouper les fichiers qu'après validation individuelle, uniquement pour transfert/commit si nécessaire. Ne jamais fabriquer d'atlas pour les plats.
7. Lors de l'intégration dans l'application, garder **un fichier image distinct par plat** et conserver les conventions de nommage et de cache présentes dans `main` au moment de l'intervention.

## Contrôle qualité avant validation

Une image n'est validée que si toutes ces conditions sont vraies :

- le plat demandé est le bon ;
- un seul plat apparaît ;
- aucun collage/grille/atlas ;
- assiette suffisamment visible et non coupée ;
- marge naturelle autour de l'assiette ;
- angle et lumière cohérents avec les autres plats ;
- arrière-plan discret et naturel ;
- aucun flou parasite dans un coin ;
- aucun bord artificiellement prolongé ;
- aucun texte ni watermark ;
- aucun élément incohérent avec la recette ;
- style adulte ou enfant respecté ;
- rendu cohérent avec les autres tuiles du catalogue.

## Garde-fous d'intégration

Cette documentation concerne uniquement la génération et l'intégration visuelle des plats. Elle ne doit pas entraîner de modification de l'architecture, de Home Assistant, OAuth, WebSocket, du coffre chiffré, du verrouillage, de la biométrie ou des mécanismes de sécurité. `catalog.js` reste la source du catalogue et les conventions actuelles du dépôt doivent être relues au moment d'une intégration réelle.
