# Bureau des agents IA — ce qui est validé

Décisions prises avec l'utilisateur le 19/11/2026 sur les maquettes. L'écran Bureau (étape 1) et les agents (étape 2) sont intégrés ; voir les sections correspondantes.

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
- Scène : `www/Bureau/14-piece-vide 2.png` (mur complet au-dessus des fenêtres ; l'ancienne `01-piece-vide.png` est retirée, sa copie reste dans `docs/bureau/assets`) + les 3 postes au repos (02 à 04), convertis en WebP par `scripts/make_bureau_images.py` dans `www/Bureau/webp/` (~124 Ko au total) : pièce détourée posée sans cadre ni fond sur le popup, ombre de contact sous les postes, placés en pourcentages dans `styles.css`. Aucun badge sur la scène : l’état (point doré, « en préparation ») est dans le sous-titre du popup.
- Bouton **Lancer les actions** (v859) : une demande traitée en 10 s, pour voir le Bureau vivre en attendant les agents. Le Trieur trie (0–3 s), le Développeur code (3–6,5 s), le Testeur teste (6,5–9,5 s), puis un dossier arrive sur la pile de ton bureau ; tout revient au repos à 12,5 s. Seul l'agent au travail bouge (repos / frappe / tête inclinée, 480 ms par image). Une seule bulle apparaît à la fois, avec son action et un détail ; aucune bulle « En attente » ou « Terminé » ne persiste. Rien n'est enregistré. Les variantes ne reprennent que les mains ou la tête (zones dans `scripts/make_bureau_images.py`) : bureaux, chaises et écrans restent fixes. Coupé à la fermeture, au verrouillage et si « réduire les animations » est actif (bouton masqué).
- **Bulles d'activité des agents** (v860, ajustées v866) : seule la bulle de l'agent qui travaille est visible, juste au-dessus de sa tête. Elle présente l'action et un détail sur deux lignes, écrits progressivement ; elle disparaît au relais et à la fin du cycle. Au repos, y compris si un dossier reste « À valider », aucune bulle ne s'affiche. Les états terminés restent consultables dans la fiche du dossier.
- Sous la scène, directement les onglets **En cours · À valider · Terminés** ; pastille rouge de notification à côté de « À valider ». Le bouton de démonstration est un petit bouton lecture en haut à droite de la scène.
- Fin de la démonstration : le dossier « Trier les plats par temps » arrive dans « À valider » (pastille et dossier sur la pile, sans bulle au-dessus des agents) et y reste, même popup fermé, jusqu'à **Valider** dans sa fiche. Rien n'est mis en ligne.
- **Pile de ton bureau** : fond sans dossier permanent ; un dossier séparé par tâche non terminée (En cours ou À valider), 6 visibles au plus. Sans tâche, le bureau vert est vide. La démonstration compte uniquement pendant son traitement ou tant qu’elle reste à valider.
- Coursier retiré (images 11 et 12 non utilisées).
- Le temps réel `retours` passe par le canal admin unique, partagé avec Familles.

## Étape 2 : les agents au travail (v867)

- **Déclenchement** : `supabase/07-bureau.sql` ajoute au retour son étape (`etape`), le suivi des agents (`agent`) et un relais vers GitHub (`repository_dispatch` `bureau_agent`). Le relais part quand une **correction** arrive, ou quand l'administrateur **autorise**, **valide** ou **refuse** dans le Bureau. Le jeton GitHub reste dans le coffre Supabase (Vault).
- **Traitement** : `.github/workflows/bureau-agent.yml` lance `scripts/bureau_agent.py`, une seule exécution à la fois, qui vide la file :
  1. décisions en attente : **Valider** → fusion de la branche sur `main` en un commit, version globale incrémentée, validation complète ; **Refuser** → branche supprimée ;
  2. une demande à la fois (correction reçue ou idée autorisée), sur la branche `bureau/<id>` : **Trieur** (analyse, faisable ou non), **Développeur** (changement, une seconde passe si la validation échoue), **Testeur** (validation `validate_repo.sh` + relecture selon `AGENTS.md`), puis « À valider ».
- **Garde-fous** : Claude Code tourne sans aucun secret dans son environnement et avec des outils limités ; le message de la famille lui est donné comme une donnée. Tout changement de `.github/`, `supabase/`, `AGENTS.md`, d'un test existant, ou toute validation en échec met la demande en **Échec** (bouton **Relancer**).
- **Bureau** : étapes réelles (À autoriser, En file, Tri, Dév., Test, Prêt, Publication, Échec, En ligne, Refusé). L'agent au travail s'anime dans la scène avec sa bulle. Fiche : frise par agent, résumé, fichiers et tests, boutons **Autoriser**, **Valider et mettre en ligne**, **Refuser**, **Relancer**.
- Une famille ne peut envoyer qu'un retour neuf (`etape = recu`) : elle ne peut pas s'autoriser elle-même.

### Mise en service (à faire une fois par l'administrateur)

1. **Jeton Claude** : sur l'ordinateur, `claude setup-token`, puis dans GitHub › Settings › Secrets and variables › Actions, secret `CLAUDE_CODE_OAUTH_TOKEN`.
2. **Clé Supabase** : Supabase › Project Settings › API, clé `service_role` → secret GitHub `SUPABASE_SERVICE_ROLE_KEY`.
3. **Jeton GitHub pour le relais** : GitHub › Settings › Developer settings › Fine-grained tokens, dépôt `Dashboard-course` seul, permission *Contents : Read and write*. Dans Supabase › SQL Editor : `select vault.create_secret('<jeton>', 'github_bureau');`
4. **SQL** : coller `supabase/07-bureau.sql` dans Supabase › SQL Editor › Run.
5. Essai : envoyer une correction depuis un compte famille, puis suivre le Bureau (ou GitHub › Actions › « Bureau des agents »).

## En attente

- Décisions prises le 20/11/2026 : traitement dès qu'une demande arrive, une à la fois ; validation finale toujours par l'administrateur ; « Idées et corrections » gardé dans Familles ; idées sur autorisation, corrections automatiques ; règle « Bureau des agents » ajoutée à `AGENTS.md`.
- Pas d'aperçu de la modification avant validation (GitHub Pages ne publie que `main`) : résumé, fichiers et tests seulement.

## Visuels corrigés — v863

Fond du bureau vert vidé, dossier indépendant (www/Bureau/13-dossier-tache.png), variantes stabilisées hors des zones animées et URLs d’images révisées. Les sources détaillées, le manifeste et un aperçu autonome de contrôle sont dans [bureau/assets](bureau/assets/README.md). Les images du coursier ne sont gardées que dans `docs/bureau/assets` (retirées de `www/Bureau/` le 22/11/2026) et ne sont pas réintroduites dans l’interface.
