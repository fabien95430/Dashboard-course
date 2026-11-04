# Référence de régénération des images d’items

Cette note est la référence pour recréer ou remplacer l’image d’un produit du catalogue tout en gardant le même style que les autres items.

## Principe actuel

- **Un item = une image = un fichier WebP.**
- Les images unitaires sont stockées dans `www/Items/`.
- `catalog.js` reste la source de vérité pour les noms et catégories des produits.
- `product-item-images.js` transforme le nom du produit en slug puis charge `./www/Items/<slug>.webp`.
- Toutes les catégories utilisent les images unitaires.
- Si une image unitaire manque ou ne charge pas, l’application utilise uniquement le visuel SVG premium local de secours.
- Pour les nouveaux visuels produits générés via OpenAI, l’automatisation utilise actuellement **816×816 px**, le plus petit carré valide pour le modèle configuré, tout en optimisant le rendu pour une **petite vignette mobile cible de 192×192 px**.
- **Toute prochaine image produit doit peser au maximum 15 Ko, soit 15 000 octets, après encodage WebP.** Mesurer le fichier final : une compression configurée ou une instruction au modèle ne garantit pas le poids. Réduire raisonnablement les détails, adapter la résolution et la qualité, puis vérifier la lisibilité et la transparence. Refuser l'intégration si le fichier dépasse 15 000 octets ou si la qualité devient insuffisante. Ne jamais relever silencieusement cette limite. Cette consigne remplace les anciennes cibles de 20–40 Ko pour les prochaines générations ; le plafond technique historique de 153 600 octets ne vaut pas autorisation de dépasser 15 Ko.

## Règle visuelle

**L'audit porte sur la cohérence complète de l'image, pas seulement sur son contour.** Avant toute retouche, comparer le sujet, la forme de vente, la préparation (cru/cuit/fumé), les proportions, la présentation, les accessoires, les couleurs et l'emballage avec les produits du même sous-groupe. Une image techniquement propre peut rester incohérente et doit alors être remplacée. Ne pas conserver automatiquement la représentation source : conserver l'identité du produit, mais corriger sa présentation si elle détonne. Séparer le résultat « contour corrigé » du résultat « cohérence de famille validée » dans l'audit.

Pour les poissons frais en portions, utiliser une portion ou un filet cru cohérent avec Saumon et Cabillaud. **Truite : filet/portion de truite, jamais poisson entier avec tête et queue.** Conserver ses couleurs naturelles distinctes. Les moules, les tranches fumées et les poissons en conserve ont leur présentation propre ; ne pas leur imposer un filet. Même principe pour les autres familles : adapter la représentation au produit et à ses voisins, sans inventer de conditionnement ou modifier les noms du catalogue.

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

Le visuel étant destiné à une petite vignette mobile, privilégier des formes lisibles, des volumes simples, des contours nets et des textures sobres. Éviter les micro-détails, textures photographiques complexes, reflets multiples, bruit visuel, grain, motifs fins et détails invisibles à petite taille. Réduire les éléments non essentiels facilite une compression WebP à **15 000 octets maximum**, sans sacrifier la fidélité au produit ni la transparence. **Un prompt ne garantit jamais un poids de fichier** : seul le contrôle après encodage est déterminant.

## Harmonisation et palette validée

Avant chaque lot, consulter [l'audit de référence](AUDIT_IMAGES_PRODUITS_2026-11-04.md), sélectionner les références déjà réussies et harmoniser ensemble forme, matériau, couvercle, échelle et couleur des emballages d'une même famille. Ne pas modifier les produits déjà validés uniquement pour uniformiser le catalogue. Préserver notamment les riz bleus et les pâtes beiges.

| Famille | Couleur d'emballage validée |
| --- | --- |
| Riz | Bleu existant |
| Pâtes | Beige existant |
| Céréales et semoules | Ocre |
| Légumineuses et conserves | Vert sauge |
| Sauces tomate | Rouge brique |
| Sauces crémeuses | Taupe |
| Sauces épicées | Terracotta |
| Huiles et vinaigres | Olive doré |
| Sucres et produits sucrés | Nude rosé |
| Épices | Brun cannelle |
| Boulangerie | Beige chaud |

Utiliser une base kraft/crème avec un accent discret et rendre le contenu visible lorsque le conditionnement s'y prête. La palette concerne l'emballage, jamais une recoloration artificielle de l'aliment. Aucun code hexadécimal précis n'a été validé : prendre les fichiers existants comme références. Pour les conserves, privilégier une boîte métallique fermée, une étiquette crème et un accent sauge ; adapter les proportions au produit réel. Les laits gardent la bouteille de famille et leurs distinctions de bouchon déjà validées.

Contrôler les contours sur fond clair **et** foncé, aux tailles de Catalogue et de Ma liste : pas de liseré blanc externe, de halo ni de découpe rognée. Une planche de contrôle est uniquement un outil de revue, jamais un asset utilisé par l'application.

Pour un produit emballé, garder un emballage simple et générique cohérent avec les items voisins. Ne pas créer de texte lisible ou de marque fictive uniquement pour remplir l’étiquette.

Ne jamais changer volontairement de style graphique. Si les références de la catégorie ont un rendu différent de ce qui est décrit ici, **les références existantes priment**.

## Conditionnement fidèle — traiteur frais

Correction utilisateur v759 : Gnocchis désigne ici des pâtes alimentaires en petites coquilles courbes creuses et striées, présentées dans le même paquet beige à grande fenêtre que Conchiglie et Coquillettes, jamais un amas de boulettes de pomme de terre. Cette règle remplace la présentation v758. Pâtes fraîches reste en nid nature ; Pâte à pizza en rouleau emballé transparent ; Quiche entière sans assiette. Aucun déplacement de catégorie ou changement de nom n’est autorisé par cette correction visuelle. Préserver les autres visuels, les marges et la limite finale de 15 000 octets.

## Conditionnement fidèle — surgelés

Pour les sachets de Surgelés, la référence est `haricots-verts-surgeles.webp` : sachet large fermé, bandeau bleu glacier courbe, petit flocon blanc opaque, grande fenêtre transparente et bas bleu. Conserver le contenu naturel distinct : épinards en feuilles, haricots, petits pois, mélange de légumes, poêlée, frites pâles non cuites ou glaçons. Ne pas imposer ce sachet aux glaces : Chocolat et Vanille conservent leurs pots fermés et leurs couleurs propres ; Nuii reste un seul bâtonnet enrobé avec sa morsure, sans traînées horizontales ou ombre externe. Le flocon ne doit pas être un trou transparent. Vérifier les marges, contours et poids après encodage, sur fond clair et foncé.

## Conditionnement fidèle — fromages

Gouda : conserver le fromage jaune, la cire rouge et les cubes, mais cadrer sur l’objet visible ; une marge invisible trop large ne doit pas le réduire. Comparer sa taille après le zoom automatique avec Brie et les autres fromages. Ne pas limiter le fichier à un petit objet pour satisfaire le poids : ajuster l’encodage sans sacrifier l’échelle.

Revoir les dix-huit produits Fromages ensemble, en conservant leur identité et leur présentation naturelle : pâte, croûte, grains, trous, forme entière/tranches/râpé. Burrata, Feta et Ricotta doivent représenter le fromage seul, sans tomate, basilic, olives, huile ou autre garniture de recette. Préserver les croûtes blanches naturelles ; éliminer les halos et ombres externes. Ne pas uniformiser tous les fromages sur un même pot ou emballage. Conserver les sources déjà réussies et vérifier poids et lisibilité après compression.

## Conditionnement fidèle — boulangerie

Revoir ensemble les douze produits de Boulangerie de catalog.js, en conservant les présentations validées : pain et tranches, viennoiserie seule, petits pains, galettes en pile. Les différences naturelles de cuisson, mie et graines restent visibles. Ne pas ajouter d’emballage ou recolorer les aliments pour appliquer la palette beige chaud ; cette palette concerne les emballages éventuels. Croissants : supprimer toute ombre de sol ou halo externe, en conservant les creux naturels du feuilletage. Préserver les visuels déjà corrects et vérifier la lisibilité après compression.

## Conditionnement fidèle — yaourts et desserts

Correction utilisateur v760 : deux familles distinctes. Yaourts nature, Yaourts grecs et Skyr gardent leur modèle crème/bleu à couvercle rond ; ne pas l’étendre aux autres yaourts. Yaourt, Yaourts fruits et Yaourts vanille reprennent le petit pot individuel blanc légèrement évasé, à opercule souple carré à coins arrondis fermé, de `yaourts-vanille.webp` avant v759 (référence v758 restaurée en v760). Même silhouette, angle et taille apparente après cadrage automatique. Yaourt générique : blanc, opercule argent clair et vague bleu pâle discrète, sans parfum. Fruits : rose pâle et fraise imprimée. Vanille : crème doré et fleur/gousse imprimées. Aucun fruit physique, décor botanique bleu, couvercle rond rigide, texte ou marque pour ces trois pots. Cette séparation remplace la consigne v759. Fromage blanc et les autres desserts restent inchangés.

Préserver les pots déjà validés et les différences de conditionnement. Riz au lait : petit pot en verre fermé, riz crémeux visible, sans garniture ou parfum non précisé au catalogue. Yaourt à boire : bouteille laitière fermée à bouchon rose ; la fraise peut être illustrée sur la bouteille, mais pas posée physiquement à côté, et aucune ombre de sol ne doit former de halo. Ne pas appliquer le pot Mayonnaise aux desserts, ni uniformiser tous les yaourts sur un même pot au détriment des références approuvées.

## Conditionnement fidèle — charcuteries

Contrôler la famille sans confondre les produits : Blanc de poulet représente des tranches de charcuterie cuites, ivoire à bord doré, jamais des filets crus ni du jambon de porc ; supprimer les herbes décoratives. Rosette représente un saucisson sec à coupe rosée et gros grains de gras blanc, avec quelques tranches, entièrement visible avec marge ; la fleur blanche naturelle du boyau n’est pas un contour d’autocollant à effacer. Préserver les différences de couleur et de texture de Coppa, Mortadelle, Lardons et Peperroni.

Pâté et Rillettes peuvent partager le petit bocal de verre fermé à couvercle doré de `rillettes.webp`, sans étiquette ou texte inventé. Le pâté garde une texture dense finement hachée, les rillettes une texture fibreuse : ne pas leur appliquer le pot de sauce Mayonnaise ou les transformer en la même préparation. Les autres charcuteries gardent leur présentation propre et les produits déjà réussis restent conservés. Vérifier contours, marges, petites tailles et poids après encodage.

## Conditionnement fidèle — huiles et vinaigres

Les huiles et les vinaigres restent deux sous-familles : les flacons à anse et bouchon vert de Huile d’olive/Huile de tournesol sont déjà assortis ; conserver leur représentation et leurs couleurs naturelles, en respectant le poids final maximal. Les huiles ne reprennent pas le pot de Mayonnaise.

Pour Vinaigre de vin, reprendre la bouteille élancée de `vinaigre-de-cidre.webp` et le style de `vinaigre-balsamique.webp` : col étroit, épaules arrondies, fermeture vissée, étiquette crème centrale à filet olive doré discret et illustration de raisin. Vinaigre de vin a un liquide transparent grenat/brun rouge, distinct du balsamique presque noir et du cidre ambré. Pas de carafe à bouchon de verre, de bouteille rognée, de texte ou de marque. Les deux références Cidre/Balsamique déjà cohérentes restent conservées. Cette règle ne transforme ni les vinaigres ménagers ni les jus en vinaigres alimentaires.

## Conditionnement fidèle — jus

**Référence validée : `www/Items/jus-d-orange.webp` v748**, issue de l’aperçu orange accepté par l’utilisateur. Pour les six jus (Orange, Pomme, Raisin, Ananas, Multifruits et Tomate), reprendre cette bouteille en verre fermée, son bouchon métallique doré vissé, ses proportions et sa petite étiquette crème en bas du corps, à coins arrondis et double filet doré-beige discret. Garder la même position et la même taille d’étiquette, le jus restant largement visible. Cette décision remplace la consigne v747 « sans étiquette » et autorise l’illustration du fruit sur l’étiquette.

Changer uniquement la couleur/texture naturelle de la boisson et le fruit **imprimé sur l’étiquette** : orange et demi-orange, pomme et demi-pomme, grappe de raisin, ananas et tranche, tomate et demi-tomate ; pour Multifruits, petit assortiment illustratif générique orange/pomme/raisin, sans affirmation de recette ni proportions d’ingrédients. Une feuille discrète dans l’illustration est possible. Aucun fruit physique autour ou dans la bouteille, aucun texte, marque, logo, paille, brique ou décor. La bouteille de raisin reprend désormais aussi le bouchon doré de famille. Cette règle ne s’applique pas aux eaux, laits ou sirops. Conserver les contraintes de contour, transparence, cadrage et **15 000 octets maximum par WebP final mesuré**.

## Conditionnement fidèle — pulvérisateurs ménagers

Pour Désinfectant, Désodorisant textile et Détachant, reprendre les proportions du flacon ergonomique et la tête à gâchette blanche de `nettoyant-multi-usages.webp`, avec le rendu des nettoyants salle de bain/vitres. Un seul pulvérisateur ménager entier, de taille apparente comparable à ses voisins ; jamais un petit atomiseur de voyage. Étiquette crème courbe sobre, sans texte, marque ou accessoire. Conserver les distinctions de couleur déjà présentes : rouge/gris clair pour Désinfectant, lavande pour Désodorisant textile, orange/blanc pour Détachant. Il s'agit de repères tirés des sources existantes, pas d'une nouvelle palette imposée à tous les produits ménagers.

Ne pas transformer les bidons de lessive ou Javel, les flacons à bec WC, ni les paquets de poudre en pulvérisateurs : harmoniser dans le bon sous-groupe en respectant l'usage et le conditionnement. Les références de nettoyants déjà cohérentes restent conservées.

## Conditionnement fidèle — crèmes fraîches

Pour les produits **« Crème épaisse »** et **« Crème fraîche »** du catalogue (catégorie **Frais → Laits & crèmes**), représenter **un pot de crème fraîche** avec son couvercle, identifiable comme un produit vendu en pot : **jamais une brique, une bouteille ou une gourde**. Le pot est l'unique conditionnement mis en scène, sur fond transparent, sans marque ni texte inventés.

**Mascarpone** : pot laitier bas et large fermé avec rebord et languette, étiquette et couvercle identifiés MASCARPONE, décor laitier crème/bleu et volute de crème imprimée. Une boîte blanche anonyme est refusée. Cette désignation générique est autorisée, sans marque, pourcentage ou allégation inventée ; aucune crème réelle exposée ni bol de service ou bocal de sauce.

La **« Crème liquide »** est un produit distinct : conserver son conditionnement réel adapté (par exemple une brique), sans lui appliquer automatiquement la règle du pot. Pour les autres crèmes et produits frais, vérifier le conditionnement correspondant au nom exact du produit avant de générer l'image. Rejeter toute image dont l'emballage ne correspond pas au produit.

## Conditionnement fidèle — épices

**Référence canonique validée le 4 novembre 2026 : `www/Items/paprika.webp` (v740).** Pour toutes les épices et assaisonnements secs, reprendre sa forme exacte de petit bocal en verre, son couvercle doré, son cadrage et sa petite étiquette crème centrale en cartouche à double filet brun cannelle. Conserver la taille, la position et les coins décoratifs de cette étiquette, sans texte ni pictogramme. Changer seulement le contenu pour le produit exact. Cette règle remplace l'ancienne conservation du duo Sel/Poivre en moulins et le choix de Curry/Curcuma comme références.

Le périmètre courant est : Curcuma, Curry, Paprika, Poivre, Sel, Chili et Vanille. Chili est ici représenté comme assaisonnement de piment séché ; Vanille conserve des gousses naturelles visibles dans le bocal, sans les remplacer par une poudre inventée. Les herbes fraîches et les piments du rayon Fruits & Légumes gardent leur présentation propre.

Pour les **épices et assaisonnements secs** de `catalog.js`, notamment **Curcuma, Curry, Paprika et Poivre**, représenter **un petit pot à épices rigide avec son couvercle** (bocal ou flacon à épices) : **pas de sachet souple, de paquet cartonné, de brique, de cuillère ni de tas d'épices en vrac**. Lorsque le **Sel** est représenté comme un assaisonnement sec, privilégier également un pot adapté. Le contenu, sa couleur et sa texture doivent correspondre exactement au produit.

Le pot doit être **isolé, centré, sur fond transparent**, dans le style 3D semi-réaliste premium des autres visuels, **sans marque ni texte inventés**. Vérifier le nom exact du produit avant d'appliquer cette règle : ne pas transformer un plat ou une préparation portant un nom d'épice (par exemple « Chili ») en pot à épices sans confirmer qu'il s'agit réellement de l'épice.

## Conditionnement fidèle — sauces et préparations à tartiner

**Référence canonique validée le 4 novembre 2026 : `www/Items/mayonnaise.webp` (v740).** Toutes les sauces et préparations apparentées utilisent exactement sa forme de bocal en verre aux épaules arrondies, son couvercle doré, son cadrage et sa grande étiquette crème centrale rectangulaire à coins arrondis et double filet fin. Garder la même taille et la même position d'étiquette ; aucun bandeau enveloppant, texte, pictogramme ou nouvelle forme de pot. Changer le contenu selon la recette et seulement la couleur discrète du filet selon la palette validée (taupe, brique, terracotta ou nude rosé). Le bocal de Mayonnaise validé est conservé sans régénération.

Appliquer aussi ce modèle à Bolognaise, Harissa, Guacamole, Houmous, Tapenade et Coulis de fruit. Cornichon, huiles, vinaigres, confitures, miel, crèmes laitières et pâtes à tartiner sucrées ne sont pas assimilés à des sauces par cette consigne.

Pour **toutes les sauces** présentes dans `catalog.js`, imposer un **pot ou bocal rigide avec couvercle**, adapté à la texture du produit : **Sauce barbecue, Sauce burger, Sauce César, Sauce soja, Sauce tomate, Ketchup, Mayonnaise, Moutarde, Pesto, Tabasco et Coulis de fruit**. Étendre cette présentation aux préparations apparentées vendues en pot, comme **Harissa, Guacamole, Houmous et Tapenade**. Même les sauces habituellement commercialisées en flacon doivent être illustrées **en pot**, conformément à la direction visuelle choisie pour le catalogue. **Pas de bouteille, tube, brique, sachet ou sauce déposée seule dans une coupelle.**

Cette consigne concerne les sauces et les préparations assimilées, **pas les huiles ni les vinaigres** : conserver pour ces derniers un conditionnement adapté à leur nature, sauf instruction ultérieure spécifique.

## Cohérence de tous les pots

Pour **tous les produits dont le conditionnement imposé est un pot** (crèmes épaisses, crème fraîche, épices, sauces et préparations assimilées), représenter **un seul pot fermé**, isolé et centré, avec un **couvercle clairement visible**. Conserver un style **3D semi-réaliste premium homogène**, des proportions réalistes, une marge transparente régulière et une lisibilité nette à **192 × 192 px**. À l'intérieur de la famille sauces, conserver strictement le modèle Mayonnaise ; à l'intérieur de la famille épices, conserver strictement le modèle Paprika. Les pots de crème restent distincts de ces deux familles. Aucune marque, étiquette à texte inventé, décor, cuillère, support ni collage. Rejeter tout visuel qui ne respecte pas le bon pot, la bonne étiquette ou le contenu exact du produit.

## Prompt prêt à réutiliser

Utiliser ce modèle lorsque l’on demande la régénération d’un item :

> Régénère uniquement l’image de l’item **« [NOM EXACT DU PRODUIT] »** dans le même style que les autres produits existants de sa catégorie **[CATÉGORIE]**. Commence par lire l’état actuel de `main`, `catalog.js`, `product-item-images.js` et plusieurs images existantes de `www/Items/` appartenant à la même catégorie afin de reprendre leur style réel. Le rendu doit être 3D semi-réaliste, propre, simple, premium et immédiatement identifiable en petite vignette mobile, avec une cible d’affichage finale de **192×192 px**. Utilise des formes lisibles, des volumes simples, des contours nets, des textures sobres et uniquement les détails indispensables à l’identification. Génère exactement **un seul produit**, isolé sur **fond transparent**, centré, avec des proportions naturelles et une marge régulière autour. Le produit principal doit occuper environ 86 à 92 % de sa plus grande dimension dans le carré, sans bord important coupé. Évite les micro-détails, textures photographiques complexes, reflets multiples, bruit visuel, grain, motifs fins, petits accessoires secondaires et détails invisibles à petite taille. Privilégie les surfaces sobres et les détails utiles pour faciliter une compression WebP efficace sans perdre la lisibilité à 192 px. Aucun décor, aucune main, aucune personne, aucun collage, aucune grille, aucun deuxième produit, aucun texte ajouté autour, aucune marque ou logo inventé. Si le produit est emballé, utilise un emballage générique simple, visuellement léger et non dominant, cohérent avec les références. Intègre le résultat en **WebP** dans `www/Items/` avec le nom de fichier attendu par le slug actuel. Ne modifie aucun autre comportement de l’application sauf ce qui est strictement nécessaire pour versionner et invalider le cache conformément aux règles du dépôt. Vérifie le résultat dans Catalogue et Ma liste, sur mobile et avec le mode hors ligne. Vérifie aussi que le fallback SVG local reste lisible si le WebP ne charge pas.

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
7. conserver la logique de cache actuelle et ne pas ajouter de mécanisme spécial par produit sans nécessité : ne jamais lister de visuels à effacer dans `sw.js` (liste `UPDATED_ITEM_VISUALS` retirée en v753, elle grossissait à chaque version et faisait re-télécharger toutes les vignettes). Une image remplacée est revérifiée par le service worker et s'affiche au plus tard à l'ouverture suivante ;
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
- le WebP final pèse-t-il au maximum **15 000 octets**, après encodage et sans fond artificiel ?
- les couleurs et le conditionnement respectent-ils la famille et la palette validées ?
- le contour reste-t-il propre sur fond clair et foncé à petite taille ?
- le rendu est-il correct dans Catalogue et Ma liste ?
- le fallback SVG local reste-t-il lisible si le fichier unitaire échoue ?
- le mode hors ligne et le cache restent-ils fonctionnels ?

Si un de ces points échoue, corriger ou régénérer l’image avant intégration.

## Garde-fous

- Faire le changement minimum nécessaire.
- Ne pas refondre le système d’images pour remplacer un seul item.
- Ne jamais réintroduire d’atlas, de planche ou de sprite produit : un produit reste un fichier WebP unitaire.
- Ne pas ajouter de dépendance runtime.
- Lire l’état courant de `main` au moment de chaque intervention : cette note décrit la méthode, mais le dépôt reste la source de vérité.
- Respecter la règle du commit atomique et les règles de version visibles de `AGENTS.md`.
