# Connexion champagne — v8.41

La page affiche directement « Bonjour », les champs et le bouton « Se connecter » sur le fond plein écran validé. Le titre « Mes courses », le caddie et le cadre blanc ont été retirés de cet écran. Les champs utilisent un verre dépoli champagne, des contours fins et un état de focus vert. L’œil permet d’afficher le mot de passe sans perdre la saisie ou le focus et revient à l’état masqué à chaque ouverture/fermeture de la connexion.

## Clavier et accessibilité

`app-ui.js` mémorise la hauteur complète avant le clavier, en utilisant la hauteur physique en PWA. Le focus ne déplace, ne réduit et ne masque aucun élément. La compensation du panoramique iOS s’applique au formulaire et au fond ensemble. Les anciens styles et le mécanisme `is-keyboard-lifted` ont été supprimés de leurs modules propriétaires.

La variante pour petits écrans est choisie avant la saisie. En paysage, avec du texte agrandi, un message long ou un clavier exceptionnellement haut, le formulaire peut défiler pour maintenir les commandes accessibles. La taille du texte dans les champs reste supérieure à 16 px. Les contrôles conservent leurs labels, attributs d’autocomplétion et indication de focus.

## Image

Asset : `welcome-champagne-v841.webp` (119 656 octets). Les images de lancement `www/startup/launch-*.jpg` reprennent ce fond avec un cadrage proportionnel. Le service worker précache le nouveau fond et les ressources v841 ; les anciens assets de connexion ne sont plus chargés.

Génération : outil ImageGen intégré, à partir de la maquette validée, puis conversion WebP et adaptation proportionnelle des formats de lancement.

Brief de génération : « Extraire uniquement le fond photographique de l’écran gauche de la maquette validée, en portrait 9:19,5. Retirer tous les éléments d’interface et reconstituer le mur. Conserver la cuisine lumineuse, les branches d’olivier en haut à gauche, l’étagère à droite, le sac kraft haut et étroit en bas à droite, la baguette et la salade, les tomates et le linge à gauche, le citron et le basilic. Garder un centre calme et lisible, sans blanc uni, sans texte, sans logo ni cadre. »

## Vérification

- Validateur officiel `scripts/validate_repo.sh` exécuté avec Bash : vérification syntaxique JavaScript et **442 tests réussis**, aucun ignoré.
- `node tests/browser-login.cjs` : contrôle du rendu en navigateur aux formats 402 × 874, 393 × 852, 375 × 812, 375 × 667 et 320 × 568. Focus, passage entre les champs, affichage/masquage du mot de passe, compensation du panoramique, fermeture du clavier et erreur d’identifiant vérifiés.
- Le test navigateur nécessite Playwright et Chromium ; `BROWSER_CHANNEL=msedge` sélectionne Edge installé. `PLAYWRIGHT_MODULE` permet de désigner un module déjà installé. Les captures sont écrites hors du dépôt, dans le dossier temporaire ou `COURSES_LOGIN_ARTIFACT_DIR`.

Les changements de viewport sont simulés : ils ne remplacent pas un essai sur iPhone physique avec le clavier natif et l’application installée. Aucune connexion réelle Home Assistant ou famille n’a été effectuée pendant les tests.
