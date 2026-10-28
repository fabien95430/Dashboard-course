# Crédits visuels produits — lot v616 (soumis à la validation PR)

Base Git `b266594bb178da6d0b031345dc14ab9904d2c588` (v615 publié, CI main et GitHub Pages réussies). Six images originales individuelles créées avec l'outil natif de ChatGPT le 28 octobre 2026, sans appel à l'API payante du dépôt, ni apport d'assets tiers. Chaque WebP est unitaire, 384 × 384 px, avec alpha réel, marge régulière, sans marque fictive ni collage. Les six comparaisons ont été examinées à 192 × 192 px sur blanc et sauge.

| Produit | Fichier | Avant (octets) | Après (octets) | SHA-256 nouveau |
|---|---|---:|---:|---|
| Vinaigre de cidre | `vinaigre-de-cidre.webp` | 35 956 | 10 726 | `0fa61fc01abcae8d88ebaca4b1082408188a3fd5ead6dbb38290bd8e5679fc4b` |
| Vinaigre balsamique | `vinaigre-balsamique.webp` | 2 390 | 11 070 | `b1b309d7c128451a6123e5f628d6b2623eafee100de15fd605d3e6633ab19511` |
| Jus de tomate | `jus-de-tomate.webp` | 3 674 | 11 556 | `e6b8576dd64561c2ce92b5a8b1a78618d398ff9fdc54e90cc3cf5071e236c858` |
| Soda citron | `soda-citron.webp` | 2 346 | 15 684 | `0d8670e60fae523439304e3fe39733c4b2fe1be4120924df369d8d37aa5eb1ed` |
| Thé vert | `the-vert.webp` | 4 142 | 18 566 | `462398f729ffa4f9f06fd41a16da9beba34599c76f50d643653dcde0c16d02aa` |
| Matcha | `matcha.webp` | 3 370 | 23 668 | `ef3a30e5bf998b2f2100d71e4189301a3b0afb293361a2fe833ece44367f661c` |
| **Total** | **6 WebP** | **51 878** | **91 270** | **+39 392 octets** |

Contrôle identité : vinaigre de cidre ambré avec pomme imprimée sur une étiquette et aucun fruit séparé (remplace le halo et les pommes parasites) ; vinaigre balsamique foncé avec raisin sur étiquette ; jus de tomate rouge dans une bouteille fermée ; soda citron dans une canette fermée ; thé vert en boîte rigide fermée avec feuilles de thé ; matcha en poudre vert vif dans un seul bol. Aucune étiquette textuelle inventée.

À valider avant publication : `bash scripts/validate_repo.sh` incluant `node --test tests/*.test.mjs` sur la CI PR, puis les contrôles sur `main` et le déploiement Pages. Aucun changement CSS, navigation, Home Assistant, synchronisation, cache visuel persistant ou sécurité. Tests physiques iPhone et réseau totalement déconnecté non revendiqués.
