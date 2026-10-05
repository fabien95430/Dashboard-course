# Demandes d’ajout produits et plats

Le bouton **Intégrer** de **Réglages → Produits & plats manquants** utilise désormais un flux assisté par ChatGPT. La PWA ne déclenche plus GitHub Actions ni l’API OpenAI pour une demande utilisateur.

Ce changement ne modifie pas la liste Home Assistant `Courses`, OAuth, le WebSocket de synchronisation, le coffre chiffré, le verrouillage ou la biométrie.

## Flux actuel

1. L’utilisateur ajoute un produit ou un plat manquant.
2. L’application affiche **Demande d’ajout en cours** et conserve la demande dans le popup et dans le badge Réglages.
3. Le bouton **Intégrer** construit localement un prompt complet adapté au type d’élément, le copie dans le presse-papiers puis ouvre ChatGPT.
4. Le prompt impose notamment :
   - le dépôt `fabien95430/Dashboard-course`, branche `main`, comme source de vérité ;
   - la lecture de l’implémentation actuelle avant modification ;
   - le changement minimum nécessaire ;
   - le respect de `catalog.js`, des conventions de visuels, de GitHub Pages, de Home Assistant, de la sécurité et du mobile ;
   - une seule image finale par plat, jamais d’atlas de plats ;
   - pour un produit, le respect de `docs/ATLAS_PRODUITS.md` et de l’atlas de sa catégorie.
5. Après l’intégration dans le dépôt et le chargement de la nouvelle version de l’application :
   - un produit présent dans le catalogue est retiré automatiquement des demandes ;
   - un plat n’est retiré qu’une fois sa carte présente avec sa photo locale chargée ;
   - l’application affiche **Produit ajouté** ou **Plat ajouté**.
6. Le badge Réglages diminue automatiquement après suppression de la demande traitée.

La corbeille permet toujours d’annuler manuellement une demande avant son intégration.

## Sécurité

Aucun token GitHub, aucune clé OpenAI et aucun secret Home Assistant n’est ajouté au JavaScript de la PWA. Le prompt ne contient que le nom de l’élément, sa catégorie éventuelle et les règles techniques nécessaires à l’intégration.

Le flux **Intégrer → ChatGPT** est indépendant de l’authentification Home Assistant : la synchronisation de la liste `Courses` continue d’utiliser le WebSocket existant sans modification.

## Ancienne automatisation GitHub Actions

Les fichiers historiques `.github/workflows/integrate-dish.yml`, `scripts/integrate_dish.py` et `scripts/send_web_push.mjs` peuvent encore être présents dans le dépôt pour compatibilité/historique, mais **le bouton Intégrer de la PWA ne les appelle plus**.

De même, un ancien `rest_command.courses_integrate_dish` éventuellement présent dans Home Assistant n’est plus nécessaire au flux utilisateur actuel. Il peut rester configuré sans effet sur la PWA tant qu’il n’est pas déclenché manuellement.

## Garde-fous

- `catalog.js` reste la source du catalogue produits et des noms d’ingrédients utilisables par les plats.
- La liste Home Assistant `Courses` reste prioritaire pour Ma liste.
- Aucune synchronisation permanente par polling n’est ajoutée.
- Les mécanismes OAuth, WebSocket, coffre chiffré, verrouillage et biométrie ne sont pas affaiblis.
- Mobile-first et les safe areas iOS restent inchangés.
- Aucun framework, backend ou dépendance externe supplémentaire n’est introduit.
