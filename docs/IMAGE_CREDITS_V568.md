# Crédits et conformité — six nouveaux visuels produits v568

**Provenance :** six illustrations originales créées dans le générateur d'images ChatGPT le 26 octobre 2026 pour *Application Course*, issues d'une composition temporaire. Les six livrables finaux sont des images **WebP autonomes**, isolant chacune exactement un produit : aucun collage, atlas, texte ni logo n'est publié dans l'application. Aucune source externe ni licence tierce CC0/CC BY n'est revendiquée ; pas d'utilisation de l'API OpenAI payante du projet.

**Traitement :** détourage avec masque alpha, suppression des éléments parasites, recadrage, centrage avec marges régulières et export individuel **384 × 384 px**, sans suréchantillonnage d'une ancienne vignette. Vérification des dimensions, coins alpha transparents et contenus alpha opaques, contrôle visuel à **192 × 192 px** sur fond sauge. Tous les fichiers sont sous 100 000 octets et leurs empreintes Git sont égales aux binaires préparés.

| Catégorie | Produit | Chemin | Avant (octets) | Après (octets) | SHA du blob Git |
| --- | --- | --- | ---: | ---: | --- |
| Viandes & poissons | Coppa | `www/Items/coppa.webp` | 4426 | 38554 | `4a5cef61157db1a084d538ccd83704c6e2c9393d` |
| Viandes & poissons | Lardons | `www/Items/lardons.webp` | 5004 | 22132 | `28d94f46a7f21e75f2e5981a7254d5ed67349960` |
| Viandes & poissons | Mortadelle | `www/Items/mortadelle.webp` | 3912 | 24224 | `d9ca7544aba5e87441d3de200c8f6b5f703e7986` |
| Viandes & poissons | Rillettes | `www/Items/rillettes.webp` | 4932 | 29634 | `f318314d107fb0f96b9b461f4995d94052145788` |
| Viandes & poissons | Surimi | `www/Items/surimi.webp` | 3954 | 22530 | `fa410305068bdcbe0b0fdaf9eddcf121b694d5a6` |
| Viandes & poissons | Steaks hachés | `www/Items/steaks-haches.webp` | 5024 | 34670 | `47ebce09d6cd809b6495528e0e9865e3e8b71d7a` |

**Total du lot : 27 252 → 171 744 octets**, soit **+144 492 octets** pour six visuels plus lisibles. Les images précédentes sont conservées dans l'historique Git.

**Correspondance produit :** coppa et tranches marbrées, lardons crus en dés, mortadelle rose avec pistaches, rillettes en bocal fermé, bâtonnets de surimi orange/blanc et steaks hachés de bœuf crus. Rosette n'est pas incluse : déjà remplacée en v567. Merguez est exclue en raison d'une incertitude sur la variante crue ; Coulis de fruit reste en attente (risque de confusion avec une confiture).

**Validation et publication :** [commit images v568 `ea27ec82e59edb7c297af6d99daa02b815fe750c`](https://github.com/fabien95430/Dashboard-course/commit/ea27ec82e59edb7c297af6d99daa02b815fe750c), [PR #93 fusionnée](https://github.com/fabien95430/Dashboard-course/pull/93), [CI PR verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40407376147), [CI v568 sur main verte](https://github.com/fabien95430/Dashboard-course/actions/runs/40407563409). Le [déploiement Pages propre à v568](https://github.com/fabien95430/Dashboard-course/actions/runs/40407562890) a été annulé au profit du commit v569 arrivé immédiatement après ; [CI v569](https://github.com/fabien95430/Dashboard-course/actions/runs/40407630722) et [Pages v569](https://github.com/fabien95430/Dashboard-course/actions/runs/40407631020) sont réussis, et les six SHA WebP subsistent sur ce main descendant. Les poids, dimensions, contours, alpha et SHA sont vérifiés ; aucune vérification sur iPhone physique n'est revendiquée.
