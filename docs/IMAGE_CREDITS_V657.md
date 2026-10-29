# Crédits et contrôles — images produits v657

**Source :** trois images originales générées localement pour le catalogue Application Course, sans marque inventée, logo, texte commercial, API OpenAI payante, collage ou planche composite. Les sachets de thé ont été dessinés/rasterisés avec Pillow et textures granulaires de feuilles/thé et de fruits ; les lingettes sont représentées en feuilles superposées. Les nouveaux visuels sont des **illustrations semi-réalistes**, pas des photographies de paquets commerciaux.

| Produit | Destination | Ancien WebP | Nouveau WebP | Nouveau poids | SHA-256 nouveau WebP |
| --- | --- | --- | --- | ---: | --- |
| Lingettes anti-décoloration | `www/Items/lingettes-anti-decoloration.webp` | `b64b0ce1c9aa21104cea8df1233f07601ee687bc` (84px) | `f3210489834e3f18edd3bba5cd7ff94bdbd99bd1` (256px) | 14 086 o | `cd1a5ee67c77c9616880a73908ae741099a81c320d6bf80335a6c6d61a69698f` |
| Thé Earl Grey | `www/Items/the-earl-grey.webp` | `446aa9ebc011b8e78ba805c3cb8750e2283bc087` (84px) | `9e14e6b0450f0f85fd2159f5d9cda069bcb32a9f` (256px) | 26 854 o | `3e7caa2fc4caa8d23f7d67767ef417453d5065d4b7f02ca07489306a8a733335` |
| Thé fruits rouges | `www/Items/the-fruits-rouges.webp` | `01e5d1c6d25c1b2f0e8dae5dd267c8968c8fa84d` (84px) | `49b111cac04a04d53f2de48d8e7089e5dd69ea9b` (256px) | 26 956 o | `2552c277f511473381929d48e606b037f52f7aa33146013a1756eebd4f6cfbf8` |

**Contrôles :** les trois WebP ont été décodés en RGBA, dimensions 256 × 256 px, alpha minimum 0 maximum 255 et quatre coins entièrement transparents. Aperçu de chaque image à 192 px sur fond blanc et sauge vérifié contre la forme et le conditionnement des anciens fichiers sur GitHub. Le nouveau produit est autonome (un seul assemblage de feuilles ou un seul sachet), centré, sans fonds opaques. Ces visuels améliorent la résolution native mais ne sont pas revendiqués comme de véritables packshots de fabricants.

**Périmètre :** trois nouveaux WebP, quatre fichiers de version/cache (`index.html`, `catalog.js`, `dish-local-images.js`, `sw.js`), le présent crédit et deux documents de suivi. Aucune logique applicative ou ressource produit déjà traitée n'a été modifiée. Les **41 images conservées** restent inchangées et distinctes des **373 renouvelées**.

**Validation requise :** `bash scripts/validate_repo.sh` et `node --test tests/*.test.mjs` via la CI de pull request avant fusion ; recontrôle du SHA de `main`, puis confirmation des workflows de validation et de GitHub Pages après fusion. Aucun test sur iPhone physique n'est revendiqué.
