# Neuf bières harmonisées — v710

**Dépôt :** `fabien95430/Dashboard-course`, branche `main`. **Portée :** 3 visuels remplacés, 6 articles ajoutés avec leurs images, dans la catégorie existante « Boissons → Bières & vins ».

**Origine et technique :** image originale des neuf bouteilles générée dans ChatGPT le 1er novembre 2026, puis découpée individuellement et détourée sur fond transparent. Le rendu reprend le visuel validé : bouteille de bière capsulée 33 cl, verre ambré, étiquette crème illustrée, codes couleurs différents et marques fictives absentes. Chaque image est un WebP indépendant **256 × 256 px RGBA**, contrôlé à 192 px sur fonds blanc et sauge. La référence de création est `a_clean_high_resolution_product_style_composite_i.png` (non publiée car planche de prévisualisation).

| Produit | Chemin WebP | SHA Git | SHA-256 | Poids |
| --- | --- | --- | --- | ---: |
| Bière ambrée | `www/Items/biere-ambree.webp` | `7de9b16b0fd317458324f03d1459486a1223c6e9` | `927e41d95ef29782f6f3b4511d3fd587cf944984833fd306a5058f49a0e236b0` | 5472 octets |
| Bière aux fruits | `www/Items/biere-aux-fruits.webp` | `8edccd70543780a8fbc19727977f479255fc126b` | `51c32ee1f4162f2243dede504f01ab2e54f8c503ae94c9f08a21ed2a0a9eee1a` | 5480 octets |
| Bière blanche | `www/Items/biere-blanche.webp` | `07109ab7dcf510745b23c0bae728c7b88d43f135` | `dbd84299b26304f0836957df6c3ee9a69246ea448ccdf0ac4467c04ac0a1f61e` | 5240 octets |
| Bière blonde | `www/Items/biere-blonde.webp` | `38ef61c4d08f29390667f20d7885a794beff3964` | `d0ff25aa7a6e555222f16fd59bcde42b37a122aa912a7a699e8b38e92e4e1193` | 5512 octets |
| Bière brune | `www/Items/biere-brune.webp` | `b1e7cef65f76af3b0ae283defa974d18eeb2cb5a` | `b08938cb009d649bdd316f4482a10d35a93c910831e9f9cdb2d4a40b935f871a` | 5434 octets |
| Bière IPA | `www/Items/biere-ipa.webp` | `be3f02516b725bbd95e7f08f9afb317a5cc0a655` | `8e0a0a0d80b7756a2bc2ac1c6e170242acebeba510d85f6b8c43770a5758efeb` | 5194 octets |
| Bière sans alcool | `www/Items/biere-sans-alcool.webp` | `7022fee5b18081cca976a07cc68b61d16af0ca2c` | `957fe27a0da4d708db11d7555e0617cd496e6a1fc1bc21eaf934af1c79f10a72` | 5922 octets |
| Bière triple | `www/Items/biere-triple.webp` | `37318f13eeeb9b630d49810e4e1ca8b924d8637e` | `85109a78d494f4fc56eb66af9ae055e54d0ab8dd24d1001525ac41b255faf0bb` | 5178 octets |
| Panaché | `www/Items/panache.webp` | `017434efe3fa473ad0b276fe664b79d881ecaf5f` | `1e6938110ad4e8b58611a1b5edd7f99cbf6c2413413591ccf937c0d37b89f562` | 4792 octets |

**Contrôles :** neuf fichiers décodables, 256 × 256 pixels, alpha réel, coins transparents, bouteille entière et centrée, poids individuel très inférieur à 150 Kio. Les neuf empreintes SHA d'objets Git ont été comparées au résultat local `git hash-object` avant publication.

**Régressions :** `catalog.js` reste l'unique source des produits. Aucun changement de Ma liste, de la priorité `todo.courses`, des flux WebSocket, de l'authentification OAuth, du coffre, du verrouillage, de la biométrie ou du mode test. Le mode de quantité existant « Bouteille » s'applique automatiquement. Invalidation des références de shell `v710` par service worker inchangé.

**Réserve :** validation CI et déploiement Pages après commit ; pas de test physique sur iPhone revendiqué.
