# Bolognaise : visuel et reclassement (v715)

- Dépôt : `fabien95430/Dashboard-course`, branche `main`.
- Produit : **Bolognaise**, identifiant catalogue inchangé, conditionnement **Pot** conservé.
- Reclassement : `Maison → Sauces` vers `Épicerie → Sauces & condiments` ; aucun doublon. Aucune autre entrée Maison touchée.
- Visuel : image générée et validée dans la conversation ; bocal en verre transparent, sauce tomate et viande, couvercle doré, étiquette crème discrète avec petit pictogramme de tomate ; aucune marque extérieure, fond transparent.
- Livraison : `www/Items/bolognaise.webp`, WebP 384 × 384 px, 15 672 octets, alpha transparent ; SHA-256 `6f5e889606b6a369e103eae0d9186bfa1e827ee9aa9e3676308a289f1eececc8`, blob Git `304f26984161b6a163086df00c6007e4b191441c` ; ancien blob `7e6661ff8165d5a9d16d0dee8e565b6a3a027646`.
- Cache : la nouvelle référence du visuel Bolognaise est ajoutée à la liste d'invalidation du cache persistant sur activation du service worker, version v715.
- Tests : déplacement sans doublon, mode quantité conservé, cache et cohérence des marqueurs de version.
- Ma liste et Home Assistant : pas de changement de nom ni d'identifiant d'article ; liste `todo.courses` non modifiée. OAuth, WebSocket, biométrie, coffre chiffré, mode test et sécurité restent intacts. Les autres images `www/Items/`, notamment Maison, riz et pâtes, sont conservées.
