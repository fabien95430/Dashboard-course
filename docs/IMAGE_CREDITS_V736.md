# Fruits & Légumes — correction Brocoli, Basilic et Carottes (v736)

Base du lot : `fabien95430/Dashboard-course` sur `main` à partir de la v735. Trois fichiers unitaires ont été remplacés dans `www/Items/` : `brocoli.webp`, `basilic.webp`, `carottes.webp`.

**Défauts constatés sur les originaux :** fragment vert isolé à gauche du brocoli, halo et petits pixels verts parasites sur les feuilles de basilic, parasites colorés autour des fanes et pointes des carottes.

**Provenance :** trois créations ImageGen indépendantes en PNG RGBA avec transparence réelle, sans emballage, sans planche de produits, sans décor. Masque alpha limité à la composante principale, détourage préservé, retrait des petits fragments indépendants. Conversion WebP 512 × 512 px (qualité 76), marges sur quatre côtés, contrôle alpha des bords et aperçu à 192 px sur fond blanc et vert sauge.

| Produit | Fichier | Octets | Marges G/H/D/B (px) | SHA-256 |
|---|---|---:|---|---|
| Brocoli | `brocoli.webp` | 47218 | 68 / 59 / 68 / 59 | `577b7d84ec42372e25bd680d09308d2fb8d746b53e22dbc70fc304d56ac7cef0` |
| Basilic | `basilic.webp` | 27802 | 59 / 90 / 59 / 91 | `fb515aca759cf733fd30347c175489c91782d047f2f2a8daa9201ee02ddf9fb2` |
| Carottes | `carottes.webp` | 39654 | 59 / 73 / 59 / 73 | `df5b97109a8138b71ae200cf720a9277a4e5e9abcf570a116c05112ec4f04b80` |

Le cache visuel du service worker et les métriques locales des seuls trois WebP sont invalidés pour le lot. Aucun changement des produits dans `catalog.js`, de Ma liste, de la synchronisation Home Assistant, de l’authentification OAuth, du WebSocket, du coffre chiffré, du verrouillage ou de la biométrie. La validation de l’intégration repose sur `bash scripts/validate_repo.sh` et GitHub Pages. Aucun test sur iPhone physique n'est revendiqué.
