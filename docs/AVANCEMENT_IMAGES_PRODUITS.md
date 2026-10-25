# Suivi de la bascule des visuels produits

**Point d'avancement : 25 octobre 2026.** Dépôt source de vérité : `fabien95430/Dashboard-course`, branche `main`. Cette note décrit un état constaté : relire impérativement le code et `AGENTS.md` au moment de reprendre le chantier.

## Réalisé et vérifié

- Dernière version visible observée : **v540**, sur `main`. Les derniers changements v540 concernent la bannière citrons et le précache, **pas un nouveau lot d'images produits**.
- `catalog.js` contient **414 produits** ; `www/Items/` contient **420 images**.
- **132 produits distincts** disposent d'un visuel remplacé au cours des six commits ci-dessous ; **282 produits** n'ont pas encore été remplacés par ces lots. **Ces 282 ne sont pas tous nécessairement de mauvaise qualité**.
- La **compression v537** concerne **32 anciens fichiers de plus de 100 Kio**, ramenés de **11,88 Mio à 1,18 Mio** au total. Il reste **0 image produit de plus de 100 Kio**. Poids du répertoire `www/Items/` : **environ 7,83 Mio**.
- **260 images pèsent moins de 10 Kio**, ce qui est un critère de tri, **pas** une preuve de manque de netteté. Vérifier leurs dimensions et l'affichage avant remplacement.
- **Le lot de 30 images initialement préparé en attente a finalement déjà été publié en v539** : ne pas refaire ces 30 fichiers.

### Historique des six publications de nouveaux visuels

| Lot | Commit Git | Produits distincts |
| --- | --- | ---: |
| Pilote Abricots v528 | `4ab63535c1dc246645e465abedb8fb2f9b8b7645` | 1 |
| Lot 1 v530 | `97f033731876a15168103c3f5706ed051bc439bf` | 30 |
| Lot 2 v533 | `d91b1b18b7246e158ff1e110375765b10fb060e3` | 30 |
| Lot 3 v534 | `795eed950efbf5bb6202f50b192c856a7fa5060b` | 30 |
| Lot 4 v536 | `5d69ab4793a56a34bba2403bd05a41edd5c1321a` | 11 |
| Lot 5 v539 | `cc80a4614ea14d88e625c787c57256c4e7696917` | 30 |
| **Total** | | **132** |

**Attention :** v537 optimise séparément 32 fichiers existants (une partie peut déjà figurer parmi les 132), ne pas additionner les compteurs.

### Situation par catégorie

Comptage exact des noms des **132 images modifiées** croisés avec `catalog.js`.

| Catégorie | Déjà remplacés | Encore à évaluer |
| --- | ---: | ---: |
| Fruits & Légumes | 69 / 72 | 3 |
| Frais | 15 / 53 | 38 |
| Viandes & poissons | 17 / 39 | 22 |
| Cuisine | 23 / 71 | 48 |
| Boulangerie | 2 / 13 | 11 |
| Petit-déjeuner | 3 / 24 | 21 |
| Apéritif & snacks | 3 / 24 | 21 |
| Boissons | 0 / 36 | 36 |
| Maison | 0 / 50 | 50 |
| Hygiène & soins | 0 / 25 | 25 |
| Enfant | 0 / 7 | 7 |
| **Total** | **132 / 414** | **282** |

Dans **Fruits & Légumes**, il reste précisément **Endives, Mâche, Olives fraîches**. Il faut leur procurer un visuel *exact*, pas une image de produit voisin.

### Attribution et qualité

Le lot v539 utilise 30 WebP transparents **320 × 320 px**, environ **445 Kio au total**, provenant de **Soft Studio Ingredients by Alex Wang** (licence **CC BY 4.0**). L'attribution et les 30 correspondances sont déjà inscrites dans **`docs/IMAGE_CREDITS_V539.md`**. Préserver ce fichier et suivre l'attribution pour toute autre source sous licence similaire. Les visuels CC0 utilisés lors d'autres lots ne relèvent pas du même régime. Vérifier la cohérence des liserés clairs de Soft Studio avec le style réel du catalogue avant toute nouvelle généralisation.

## Blocage technique à résoudre avant le prochain lot

Après v540, une modification supplémentaire de `sw.js` est intervenue au commit **`f2e2b432a467a4171935e52feee07d85e21401dc`**. Le déploiement GitHub Pages a réussi mais **la CI de validation échoue encore : 234 tests réussis, 1 échec**.

Workflow concerné : https://github.com/fabien95430/Dashboard-course/actions/runs/40226162631

Échec restant : `la version globale visible, le cache et les visuels restent alignés`, dans `tests/list-render-version.test.mjs`. Les logs montrent une assertion qui attend littéralement `const CACHE='courses-app-v540-r1';` tandis que le service worker a été incrémenté en **`r2`** pour corriger le précache. **Diagnostiquer le contrat réel**, puis corriger la cohérence entre cache, code et tests **sans supprimer ou neutraliser les assertions** et sans revenir inutilement à un cache périmé. `bash scripts/validate_repo.sh` et le workflow GitHub `validation` doivent devenir verts **avant une prochaine intégration d'images**. Une validation Pages verte ne suffit pas.

## Reprise du chantier

1. **Commencer par `main` actuel** : lire `AGENTS.md`, `catalog.js`, `product-item-images.js`, `docs/IMAGES_ITEMS.md`, `docs/IMAGE_CREDITS_V539.md`, `sw.js`, la suite `tests/` et cette note ; vérifier les versions réelles et la dernière CI.
2. **Résoudre le blocage CI** décrit ci-dessus sans dégrader la sécurité, le précache ou les révisions indépendantes. Si d'autres commits arrivent, diagnostiquer le nouvel état et ne pas appliquer de correctif obsolète.
3. Examiner d'abord les **3 Fruits & Légumes restants**, puis **Frais**, **Viandes & poissons**, **Cuisine**, puis les autres catégories. Prioriser le manque de netteté réel plutôt que le seul poids.
4. Préparer des lots **de 30 maximum**, seulement avec des correspondances exactes et des visuels contrôlés : **un produit = un fichier WebP**, fond transparent, produit centré, isolé, rendu semi-réaliste premium cohérent avec les cartes existantes ; lisibilité à **192 × 192 px**, source idéalement **320 à 512 px**, cible généralement **15–60 Kio**, plafond pratique **100 Kio**. **Ne jamais agrandir artificiellement** les anciennes miniatures 84 × 84, inventer une marque, substituer un autre produit ou réutiliser des planches d'images.
5. Conserver noms et slug attendus `www/Items/<slug>.webp`, catalogue `catalog.js`, liste HA `Courses` prioritaire, synchronisation WebSocket événementielle, OAuth, coffre chiffré, verrouillage, biométrie, iOS safe areas, fonctionnement offline et architecture HTML/CSS/JS statique + GitHub Pages + HA. **Pas de framework, backend, polling ni API OpenAI payante du projet.**
6. Protéger l'interface validée : **ne pas modifier la bannière citrons v540**, les emplacements des éléments, l'effet des barres, ni le badge de version **visible uniquement dans Réglages** (les marqueurs HTML des trois vues restent présents).
7. Valider chaque image : identité, dimensions, transparence, poids, cadrage et rendu à taille réelle ; comparer ancien/nouveau ; consigner la licence et son crédit. Remplacer les images uniquement si elles sont meilleures.
8. Préparer **un seul commit atomique** pour un lot prêt, mettre à jour le versionnement/cache selon **les règles courantes d'AGENTS.md**, vérifier que `main` n'a pas bougé, lancer la validation complète, contrôler GitHub Pages, puis **actualiser ce document après la publication réelle**.

**État du présent commit : documentation uniquement. Ne pas incrémenter la version de l'application et ne pas annoncer de nouveaux visuels publiés.**
