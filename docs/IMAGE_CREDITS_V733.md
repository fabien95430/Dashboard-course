# Correction du recadrage des sept Fruits & Légumes — v733 (2 novembre 2026)

Base de référence `main` : `5d7aec794264e6784994109d5142f083d239f837` (v732). Ces sept images publiées en v730 conservaient des extrémités visuellement tronquées ; la simple marge transparente ne suffisait pas à contrôler l'intégrité des objets. Remplacements par sept WebP distincts 512 × 512 px avec alpha, détails recontrôlés à 192 px sur blanc et sauge et marges substantielles. Source iconographique originale retravaillée et détourée individuellement ; pas d'atlas ni d'emballage dans les fichiers finaux.

| Fichier (www/Items) | Octets | Marges gauche / haut / droite / bas (px) | SHA-256 |
|---|---:|---|---|
| butternut | 18114 | 70 / 54 / 71 / 55 | `4949ee56fbb6cb73342ec5919c83f4e1d06070240ed285c6e598ae90dd378ee0` |
| courge | 29190 | 54 / 58 / 55 / 58 | `a94ea74f057d3af75febce81fc8f66ad00baf973b7ca74d87f17a4db2e6fbec9` |
| navets | 26746 | 54 / 63 / 55 / 64 | `ebc73936adef96d0f689b5c2016131e46f8090365818c419dbfb2fed6a525116` |
| echalotes | 25418 | 79 / 54 / 79 / 55 | `5278b526b21322be9ea0a87acb332e5341a85508817a4c51a334d919d46c6149` |
| noisettes | 30052 | 73 / 54 / 73 / 55 | `b1a5990efdd7ad79b481365ff6d861eae98a52efadbce57fe1e763316ac4f80f` |
| ail | 16374 | 91 / 54 / 92 / 55 | `fdfe9e49fd701221d4ee73246bf2fa3cfe065360ad323c03d9f95d88d3f6eeb6` |
| oignons-jaunes | 19564 | 57 / 54 / 57 / 55 | `9bc70d92f330c3f0002b3c56b5493c3a6276b5751ab87ca44cae684086f0b7cf` |

Les 4 bords et coins des sept WebP ont un alpha nul. Tous les fichiers sont inférieurs à 150 Kio et les fruits/légumes sont entièrement dans le carré. Le rendu mobile ne doit ni recadrer ni suragrandir ces sept sources : dans `product-item-images.js`, elles ont un zoom de 1 et un décalage de 0, avec invalidation ciblée de leurs anciennes métriques locales avant v733. Le cache visuel persistant du service worker est renouvelé, tandis que les autres produits conservent leur logique et leurs métriques.

Aucun changement du catalogue (noms/sous-catégories), de Ma liste, des listes Home Assistant, d'OAuth, du WebSocket, du coffre chiffré ou du verrouillage/biométrie. Suite Node et GitHub Pages à vérifier après publication du commit.
