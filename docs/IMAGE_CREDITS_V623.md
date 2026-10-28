# Images produits v623 — provenance, contrôles et crédits

Base Git: b5e7ad27989b56076a38b8ea553d9d38ff6572f2 (version v622). Quatre visuels originaux créés pour le catalogue, chacun représentant un produit autonome, fermé ou doté du pulvérisateur attendu.

**Origine:** illustrations procédurales originales créées localement par tracés SVG, dégradés et éclairages, puis exportées en WebP RGBA. Aucun visuel d'un tiers n'est incorporé et aucune API OpenAI payante du projet n'a été utilisée. Les recherches CC0 non utilisées ne sont pas revendiquées comme sources. Style illustratif 3D sobre, sans marque ni texte inventé.

| Produit | Fichier | Avant (o) | Après (o) | SHA-256 WebP |
| --- | --- | ---: | ---: | --- |
| Nettoyant lave-vaisselle | `nettoyant-lave-vaisselle.webp` | 4938 | 9512 | `b5e348744eb445b6323afece86e8319c0ade10e321b7d89dd32f89165ca7399e` |
| Nettoyant machine à laver | `nettoyant-machine-a-laver.webp` | 3470 | 7516 | `1fd9202f0eed2fd6b841a0b040dda7a0af32640820584516924a71affd7b4cb1` |
| Détachant | `detachant.webp` | 2520 | 10420 | `4429d28516c6e24eae3a191490921f2c66817b1a0767e6bae904cc9435fdfa51` |
| Purée en flocons | `puree-en-flocons.webp` | 4004 | 9632 | `6fbcca6577de5cd35311eb27f883173495ff0b030509fa2d66bc28f8a0a87b14` |

**Contrôle individuel:** WebP 384x384, canaux alpha (0 à 255), coins 100 % transparents, marges régulières ; rendu et contours examinés à 192x192 sur fonds blanc et sauge. Un seul article autonome par fichier, aucun collage, halo dessiné, fond opaque, marque ou logo inventé.

- Nettoyant lave-vaisselle : bouteille fermée de nettoyant machine avec représentation graphique du panier.
- Nettoyant machine à laver : bouteille fermée de nettoyant machine avec pictogramme du tambour.
- Détachant : flacon spray textile avec gâchette, au lieu d'un flacon anonyme peu lisible.
- Purée en flocons : sachet scellé de préparation sèche avec pommes de terre et flocons stylisés, au lieu d'un bol de purée préparée.
- Sacs congélation : non remplacés ; aucun candidat montrant un gain certain n'est retenu.

**CI :** bash scripts/validate_repo.sh (incluant node --test tests/*.test.mjs) sur PR, puis CI main et GitHub Pages à vérifier après fusion. Aucun test iPhone physique, Home Assistant ou déconnexion réelle n'est revendiqué.
