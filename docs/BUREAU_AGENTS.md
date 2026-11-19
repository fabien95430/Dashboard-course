# Bureau des agents IA — ce qui est validé

Décisions prises avec l'utilisateur le 19/11/2026 sur les maquettes. **Rien de ce document n'est encore intégré à l'application**, sauf la partie « Idées et corrections », déjà en ligne.

Le plan complet en 3 étapes (écran Bureau, Trieur automatique, Développeur et Testeur) et les textes ChatGPT sont dans le projet claude.ai « Appli course » :
- `plan-bureau-agents-ia` ;
- `prompts-chatgpt-bureau`.

## Déjà en ligne : « Idées et corrections » (v849 → v851)

- Comptes famille : Réglages › section « Améliorer l'application » › **Idées et corrections**.
- Deux choix seulement : **Idée** (ampoule) et **Correction** (crayon bleu). « Bug » a été fusionné dans « Correction ».
- Message, bouton « Envoyer », liste « Vos envois » avec l'état Envoyé / Traité.
- La version de l'app et le nom de l'appareil sont joints automatiquement.
- Admin : Réglages › Familles › foyer › onglet Demandes › partie « Idées et corrections ».
  - Les retours comptent dans la pastille rouge.
  - Boutons **Copier** et **Traité**.
- Supabase : table `retours` (`supabase/06-famille.sql`), déjà exécutée.

## Maquettes validées : le Bureau

Images de référence dans `docs/bureau/` :
- `maquette-popup-bureau.webp` : le popup Bureau ;
- `maquette-fiche-dossier.webp` : la fiche d'un dossier ;
- `maquette-piece.webp` : la pièce ;
- `maquette-personnages.webp` : les 3 personnages.

Les 5 images de référence à joindre dans ChatGPT sont dans `docs/bureau/references/` : `ref-da-application.png`, `ref-bureau-scene.png`, `ref-poste-trieur.png`, `ref-poste-developpeur.png`, `ref-poste-testeur.png`.

Le code de la scène de maquette est dans `maquette-scene.js`. C'est une référence de cadrage et de disposition : ce fichier n'est pas chargé par l'app.

### Accès

- Réglages (admin) : nouvelle ligne **Bureau** sous « Familles », avec une pastille rouge pour les dossiers à valider.
- Popup à hauteur fixe, comme les autres.

### Le popup Bureau

1. **La scène**, une pièce en vue isométrique, avec la pastille « En service ».
   - **Le cadrage de la maquette est validé** et doit être conservé.
   - Mur gauche : tableau blanc à post-it. Mur droit : trois fenêtres.
   - Parquet clair, plante en pot rouge, coin café.
   - Trois postes : Trieur au fond au centre, Développeur à droite, Testeur à gauche.
   - **Ton bureau** au premier plan, vert sauge, avec ta chaise vert foncé et la pile de dossiers à valider.
2. **Sous la scène**, une ligne par agent : point de couleur, nom, ce qu'il fait (« Vérifie le kombucha… »).
3. **Les dossiers**, en onglets **À valider · En cours · Terminés**.
   - Une ligne par dossier : icône, titre, foyer, pastille d'étape (Prêt, À choisir, Tri, Image, Dév.).

### La fiche d'un dossier

- Titre, type, foyer, date de réception.
- Frise : Reçu → Trieur → Développeur → Testeur, avec le message de chaque étape.
- Captures **avant / après**.
- Boutons **Mettre en ligne** (principal), **Répondre**, **Refuser**.
- Dans la maquette, les avatars de la frise sont des robots provisoires. Ils seront remplacés par les visages des 3 personnages.

### Les personnages (validés)

- Des **personnes**, pas des robots.
- 3 personnes à la peau claire : 2 hommes et 1 femme. Chacune porte la couleur de son poste, en version douce accordée à la DA :
  - **Trieur** : femme, cheveux châtains mi-longs, chemisier **lavande** ;
  - **Développeur** : homme brun avec une barbe courte, chemise **bleu doux** ;
  - **Testeur** : homme blond à lunettes, polo **vert sauge**.
- **Pas d'étiquette de nom** au-dessus des personnages : le code couleur sous la scène suffit.
- **Coursier** : un jeune homme brun en pull couleur miel. Il porte les dossiers dans les bras, **marche dans l'allée** et s'arrête à chaque bureau (Trieur → Développeur → Testeur → ton bureau).
  - Le dossier ne vole jamais d'un bureau à l'autre.

### Style visuel

- **Cartoon 3D façon film d'animation**, en gardant **la DA de l'application** :
  - ivoire, crème et marbre veiné de vert sauge ;
  - vert sauge et vert profond, petites touches dorées ;
  - lumière douce et chaude, couleurs désaturées, jamais criardes.
- Images à générer avec ChatGPT (Claude ne génère pas d'images), **12 images** :
  - la pièce vide ;
  - 3 postes × 3 versions ;
  - le coursier × 2.
- Toutes les images sont faites à partir des maquettes de référence, avec le même cadrage.

### Mouvements (image par image, pas d'animation fluide)

- Les personnes **tapent au clavier** : 2 images qui alternent.
- **Petite oscillation de la tête** : 1 image tête inclinée.
- **Les écrans s'allument** et les bulles « en train de… » s'animent (ajoutés par l'app).
- **Le coursier avance dans l'allée en se balançant** : 2 images de pas qui alternent.
- Animations coupées quand le popup est fermé ou si « réduire les animations » est actif.

## Écarté

- Robots, même détaillés.
- Personnages dessinés en code en version finale (pas assez détaillés).
- Étiquettes de nom au-dessus des personnages.
- Dossier qui vole d'un bureau à l'autre.
- Mouvement fluide et vidéo en boucle.
- Style photo réaliste : remplacé par le cartoon 3D aux couleurs de l'app.

## Étape 1 : l'écran Bureau sans agents (v858)

- `bureau-ui.js`, propriétaire de l'écran ; styles dans `styles.css` (section v858) ; lecture `adminBureau()` dans `family-service.js`.
- Ligne **Bureau** sous « Familles » ; pastille = dossiers à valider (toujours 0 tant qu'aucun agent ne prépare de dossier).
- Dossiers = idées et corrections (table `retours`, aucune nouvelle table) : nouveau → **En cours** (étape « Reçu »), traité → **Terminés**. « À valider » attend les agents.
- Fiche : frise Reçu → Trieur → Développeur → Testeur (agents « Pas encore en service »), boutons **Marquer traité** et **Copier**. « Mettre en ligne / Répondre / Refuser » arriveront avec les agents.
- Scène : `www/Bureau/01-piece-vide.png` + les 3 postes au repos (02 à 04), convertis en WebP par `scripts/make_bureau_images.py` dans `www/Bureau/webp/` (~124 Ko au total) : pièce détourée posée sans cadre ni fond sur le popup, ombre de contact sous les postes, placés en pourcentages dans `styles.css`. Aucun badge sur la scène : l’état (point doré, « en préparation ») est dans le sous-titre du popup.
- Pas encore utilisés : variantes frappe / tête (05 à 10) et coursier (11, 12), réservés aux agents en service.
- Le temps réel `retours` passe par le canal admin unique, partagé avec Familles.

## En attente

- Variantes 05 à 12 : vérifier le scintillement en alternance avant de les animer.
- Décisions du plan à prendre :
  - heure du passage du soir (proposé : 21 h) ;
  - plafond de dossiers par soir (proposé : 5) ;
  - approbation automatique de la tâche du soir ;
  - garder ou non « Idées et corrections » dans Familles ;
  - règle « Bureau » dans `AGENTS.md`.
