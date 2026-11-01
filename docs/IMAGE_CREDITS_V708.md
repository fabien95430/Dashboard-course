# Trois vins harmonisés — v708

**Source de vérité :** `fabien95430/Dashboard-course`, branche `main`. Lot visuel limité à trois produits existants de **Boissons → Bières & vins**. Aucun changement métier ou de catalogue.

**Création :** images originales créées avec l'outil de génération d'images ChatGPT, puis adaptées en fichiers WebP unitaires de 384 × 384 px, RGBA avec alpha natif. Aucun visuel externe copié ; aucune marque, aucun texte d'étiquette ni logo ajouté. Source générée pour ce projet le 1er novembre 2026.

**Direction graphique :** une même silhouette de bouteille bordelaise, étiquette crème neutre, même échelle et même cadrage, bouchon/capsule assortis. Le contenu se différencie : bordeaux profond (rouge), jaune paille (blanc), rose saumon (rosé). Un produit par image, fond transparent, sans décor.

| Produit | WebP | Ancien SHA blob Git | Nouveau SHA blob Git | SHA-256 WebP | Poids |
| --- | --- | --- | --- | --- | ---: |
| Vin rouge | `www/Items/vin-rouge.webp` | `989b8a88783a9c8a53091ae6aa6bf06b8cab4dae` | `7bd93789f394b3d4579c4d6aa295f627dde799c2` | `c35192db078fe2b9ab18151a62f7f2dd62704f0c1f953deca57beddf1cfdbf06` | 6746 octets |
| Vin blanc | `www/Items/vin-blanc.webp` | `a7ca06368446821f08c8d23fa9a97c632b867871` | `886af654a8541003fdd1e98a1e82f5637e780549` | `b83ea96cd2bf94adeda7cc9fd33bb5773228c247c7db13b9f24076571ad7acbc` | 7830 octets |
| Vin rosé | `www/Items/vin-rose.webp` | `0158309e533b3bf1f5a8fa874742643dfc327191` | `fd6bd95a3fd80cf600912377fc6d365dd66f7d51` | `0648d1bc25732427171dcb90b8c792fa5f477fe93c2bb57027727eabaadab25d` | 8104 octets |

**Contrôles prépublication :** trois WebP indépendants, 384 × 384 px, canal alpha de 0 à 255, quatre coins transparents, poids de chaque visuel inférieur au plafond de 150 Kio ; inspection comparative sur fonds blanc et sauge à 192 px. Empreintes des objets Git comparées aux fichiers locaux d'origine : identiques.

**Portée :** remplacement des trois WebP et incrément des références de version et du service worker en `v708`. `catalog.js` reste la référence des noms et articles ; aucune modification de `todo.courses`, OAuth, WebSocket, stockage chiffré, biométrie ou mode test. La CI et le déploiement GitHub Pages doivent être vérifiés après publication. Les contrôles sur appareil physique ne sont pas revendiqués.
